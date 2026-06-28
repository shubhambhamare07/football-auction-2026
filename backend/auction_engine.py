import asyncio
import random
import time
from typing import Dict, Any
import db

# Map of room_code -> active asyncio task running the countdown
active_auction_tasks = {}

# Local cache of current auction state
# { room_code: { "player": {...}, "highest_bid": int, "highest_bidder": str, "time_remaining": int, "unsold": bool } }
live_auction_states = {}

class AuctionManager:
    @staticmethod
    def initialize_auction(room_code: str):
        """
        Prepare the list of players to be auctioned based on settings.
        """
        room = db.get_room(room_code)
        if not room:
            return None
        
        # Load players list
        all_players = db.get_all_players()
        
        # Filter or sort players based on settings
        auction_order = room["settings"].get("auction_order", "Random")
        
        # Shuffle players
        players_pool = all_players.copy()
        if auction_order == "Random":
            random.shuffle(players_pool)
        elif auction_order == "Position Wise":
            # Sort positions: Goalkeeper, Center Back, Left Back, Right Back, Midfielder, Left Winger, Right Winger, Forward, Striker
            pos_priority = {"Goalkeeper": 0, "Right Back": 1, "Left Back": 2, "Center Back": 3, "Midfielder": 4, "Right Winger": 5, "Left Winger": 6, "Forward": 7, "Striker": 8}
            players_pool.sort(key=lambda p: pos_priority.get(p.get("position", ""), 9))
        elif auction_order == "Country Wise":
            players_pool.sort(key=lambda p: p.get("country", ""))
            
        # Store in Redis/memory state
        state = {
            "room_code": room_code,
            "players_pool": players_pool,
            "current_player_index": 0,
            "squad_size_target": 15, # 11 players + 4 subs
            "status": "active"
        }
        
        db.set_live_auction_state(room_code, state)
        return state

    @staticmethod
    async def start_auction_loop(room_code: str, sio_server):
        """
        Runs the server-authoritative auction timer loop.
        """
        # Cancel any existing task
        if room_code in active_auction_tasks:
            active_auction_tasks[room_code].cancel()
            
        async def loop():
            try:
                state = db.get_live_auction_state(room_code)
                if not state:
                    state = AuctionManager.initialize_auction(room_code)
                    
                room = db.get_room(room_code)
                timer_duration = room["settings"].get("timer_duration", 15)
                
                while True:
                    # Check if all players completed their rosters
                    room = db.get_room(room_code)
                    if not room:
                        break
                    
                    all_squads_full = True
                    for player in room["players"]:
                        if len(player.get("squad", [])) < state.get("squad_size_target", 15):
                            all_squads_full = False
                            break
                            
                    if all_squads_full or state["current_player_index"] >= len(state["players_pool"]):
                        # Transition to Transfer Window or completed
                        status = "transfers" if room["settings"].get("transfers_enabled", True) else "completed"
                        db.update_room(room_code, {"status": status})
                        await sio_server.emit("room_status_change", {"status": status}, room=room_code)
                        print(f"Auction finished in room {room_code}. Transitioned to {status}.")
                        break
                    
                    # Select current player
                    current_player = state["players_pool"][state["current_player_index"]]
                    
                    # Initialize active card state
                    live_state = {
                        "player": current_player,
                        "current_bid": current_player["starting_price"],
                        "highest_bidder": None,
                        "time_remaining": timer_duration,
                        "is_sold": False
                    }
                    live_auction_states[room_code] = live_state
                    
                    # Broadcast the new player card
                    await sio_server.emit("new_player", {
                        "player": current_player,
                        "starting_price": current_player["starting_price"],
                        "time_remaining": timer_duration
                    }, room=room_code)
                    
                    # Run the countdown ticks
                    while live_state["time_remaining"] > 0:
                        await asyncio.sleep(1)
                        if live_state.get("skipped"):
                            break
                        live_state["time_remaining"] -= 1
                        
                        # Sync countdown to client
                        await sio_server.emit("timer_tick", {
                            "time_remaining": live_state["time_remaining"]
                        }, room=room_code)
                        
                    # Time has run out! Process sell/unsold
                    live_state["is_sold"] = True
                    is_skipped = live_state.get("skipped", False)
                    winner = None if is_skipped else live_state["highest_bidder"]
                    sold_price = live_state["current_bid"]
                    
                    if winner:
                        # Add player to winning manager's squad, deduct budget
                        room = db.get_room(room_code)
                        updated_players = []
                        for p in room["players"]:
                            if p["name"] == winner:
                                card_copy = current_player.copy()
                                card_copy["purchase_price"] = sold_price
                                p["squad"].append(card_copy)
                                p["budget"] -= sold_price
                            updated_players.append(p)
                            
                        db.update_room(room_code, {"players": updated_players})
                        room["players"] = updated_players
                        
                        # Emit room update to all clients to sync squads and standings
                        await sio_server.emit("room_update", {"room": room}, room=room_code)
                        
                        # Emit sold details
                        await sio_server.emit("player_sold", {
                            "player": current_player,
                            "winner": winner,
                            "price": sold_price
                        }, room=room_code)
                        print(f"Player {current_player['name']} sold to {winner} for {sold_price} in room {room_code}")
                    else:
                        # Unsold broadcast
                        await sio_server.emit("player_unsold", {
                            "player": current_player,
                            "skipped": is_skipped
                        }, room=room_code)
                        print(f"Player {current_player['name']} went unsold (skipped={is_skipped}) in room {room_code}")
                        
                    # Play sold clink/hammer animation delay
                    if not is_skipped:
                        await asyncio.sleep(3.5)
                    else:
                        await asyncio.sleep(0.5)
                    
                    # Advance index
                    state["current_player_index"] += 1
                    db.set_live_auction_state(room_code, state)
                    
            except asyncio.CancelledError:
                print(f"Auction loop for room {room_code} was cancelled.")
            except Exception as e:
                print(f"Error in auction loop for room {room_code}: {e}")
                
        # Launch asyncio loop task
        task = asyncio.create_task(loop())
        active_auction_tasks[room_code] = task
        return task

    @staticmethod
    def skip_player(room_code: str) -> bool:
        """
        Force-skips the current player by setting time remaining to 0 and clearing the bidder.
        """
        live_state = live_auction_states.get(room_code)
        if live_state:
            live_state["highest_bidder"] = None
            live_state["time_remaining"] = 0
            live_state["skipped"] = True
            return True
        return False

    @staticmethod
    def force_end_auction(room_code: str) -> str:
        """
        Terminates the auction loop and transitions the room status immediately.
        """
        if room_code in active_auction_tasks:
            active_auction_tasks[room_code].cancel()
            del active_auction_tasks[room_code]
            
        if room_code in live_auction_states:
            del live_auction_states[room_code]
            
        room = db.get_room(room_code)
        if room:
            status = "transfers" if room["settings"].get("transfers_enabled", True) else "completed"
            db.update_room(room_code, {"status": status})
            return status
        return None

    @staticmethod
    def place_bid(room_code: str, bidder_name: str, amount: int) -> Dict[str, Any]:
        """
        Handles and validates a bid attempt synchronously to prevent race conditions.
        """
        live_state = live_auction_states.get(room_code)
        if not live_state or live_state.get("is_sold"):
            return {"success": False, "reason": "No active auction or player already sold."}
            
        room = db.get_room(room_code)
        if not room:
            return {"success": False, "reason": "Room not found."}
            
        # Get bidder profile
        bidder = next((p for p in room["players"] if p["name"] == bidder_name), None)
        if not bidder:
            return {"success": False, "reason": "Bidder not in room."}
            
        # Validate bidder budget
        if bidder["budget"] < amount:
            return {"success": False, "reason": "Insufficient budget."}
            
        # Validate roster limit
        state = db.get_live_auction_state(room_code)
        if state and len(bidder.get("squad", [])) >= state.get("squad_size_target", 15):
            return {"success": False, "reason": "Squad is already complete."}
            
        # Validate bid increment
        current_bid = live_state["current_bid"]
        highest_bidder = live_state["highest_bidder"]
        
        # If it's the first bid, it must be >= starting price
        if highest_bidder is None:
            if amount < current_bid:
                return {"success": False, "reason": "Bid must be at least starting price."}
        else:
            # Must be higher than current bid
            if amount <= current_bid:
                return {"success": False, "reason": "Bid must be higher than current highest bid."}
                
        # Successful bid! Update state
        live_state["current_bid"] = amount
        live_state["highest_bidder"] = bidder_name
        
        # Reset timer (or add bid extension if timer < 5 seconds)
        room_settings_timer = room["settings"].get("timer_duration", 15)
        live_state["time_remaining"] = max(live_state["time_remaining"], min(5, room_settings_timer))
        
        return {
            "success": True,
            "current_bid": amount,
            "highest_bidder": bidder_name,
            "time_remaining": live_state["time_remaining"]
        }
