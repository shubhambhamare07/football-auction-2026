import socketio
import asyncio
import db
import uuid
import random
from auction_engine import AuctionManager
from transfers import TransferManager
from boosts import BoostManager

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
sio_app = socketio.ASGIApp(sio)

# In-memory mapping: socket_id -> {"room_code": str, "name": str}
socket_to_user = {}

def get_leaderboard(room):
    """
    Sort players by total Fantasy Points of their squad plus chemistry points.
    Highlight the winner.
    """
    leaderboard = []
    for p in room["players"]:
        # Calculate total fantasy score (squad + chemistry score)
        squad_score = sum(f.get("fantasy_score", 0) for f in p.get("squad", [])) + p.get("chemistry_score", 0)
        total_rating = sum(f.get("rating", 0) for f in p.get("squad", []))
        
        # Get captain/highest player
        captain = None
        if p.get("squad"):
            squad_sorted = sorted(p["squad"], key=lambda f: f.get("fantasy_score", 0), reverse=True)
            captain = squad_sorted[0]["name"]
            
        # Calculate premium highlights
        best_purchase = "None"
        most_expensive = "None"
        highest_rated = "None"
        
        if p.get("squad"):
            # Best purchase (highest rating / price ratio)
            best_purchase = max(p["squad"], key=lambda f: f.get("rating", 0) / max(1, f.get("purchase_price", f.get("starting_price", 10000000))))["name"]
            # Most expensive purchase
            most_expensive = max(p["squad"], key=lambda f: f.get("purchase_price", 0))["name"]
            # Highest rated player
            highest_rated = max(p["squad"], key=lambda f: f.get("rating", 0))["name"]
            
        leaderboard.append({
            "name": p["name"],
            "score": squad_score,
            "budget": p["budget"],
            "total_rating": total_rating,
            "captain": captain,
            "squad_size": len(p.get("squad", [])),
            "boosts_used": p.get("boosts_purchased", []),
            "best_purchase": best_purchase,
            "most_expensive": most_expensive,
            "highest_rated": highest_rated
        })
        
    # Sort by score descending, then budget descending (tie-breaker)
    leaderboard.sort(key=lambda x: (x["score"], x["budget"]), reverse=True)
    return leaderboard

@sio.event
async def connect(sid, environ):
    print(f"Socket client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Socket client disconnected: {sid}")
    if sid in socket_to_user:
        user_info = socket_to_user[sid]
        room_code = user_info["room_code"]
        name = user_info["name"]
        
        room = db.get_room(room_code)
        if room:
            # We don't remove immediately to allow reconnection, but we can set active flag to False
            updated_players = []
            for p in room["players"]:
                if p["name"] == name:
                    p["socket_id"] = None
                updated_players.append(p)
            db.update_room(room_code, {"players": updated_players})
            
            # Broadcast system message
            await sio.emit("new_message", {
                "sender": "System",
                "text": f"{name} disconnected.",
                "type": "leave",
                "timestamp": int(time_out_ms() / 1000)
            }, room=room_code)
            
            # Update lobby list
            await sio.emit("room_update", {
                "room": db.get_room(room_code)
            }, room=room_code)
            
        del socket_to_user[sid]

@sio.event
async def create_room(sid, data):
    display_name = data.get("display_name")
    room_name = data.get("room_name")
    settings = data.get("settings", {})
    
    # Generate unique 6-char room code
    room_code = "".join(random_choice_characters())
    
    room = db.create_room(room_code, display_name, room_name, settings)
    
    # Update socket association
    socket_to_user[sid] = {"room_code": room_code, "name": display_name}
    
    # Join socket channel
    await sio.enter_room(sid, room_code)
    
    # Return success response
    await sio.emit("create_room_response", {
        "success": True,
        "room_code": room_code,
        "room": room
    }, to=sid)

@sio.event
async def join_room(sid, data):
    display_name = data.get("display_name")
    room_code = data.get("room_code").upper().strip()
    
    room = db.get_room(room_code)
    if not room:
        await sio.emit("join_room_response", {"success": False, "reason": "Room not found."}, to=sid)
        return
        
    if len(room["players"]) >= room["settings"].get("max_players", 8):
        await sio.emit("join_room_response", {"success": False, "reason": "Room is full."}, to=sid)
        return
        
    # Check if duplicate name
    if any(p["name"].lower() == display_name.lower() for p in room["players"]):
        await sio.emit("join_room_response", {"success": False, "reason": "Name already taken in this room."}, to=sid)
        return
        
    # Add player to list
    new_player = {
        "name": display_name,
        "is_host": False,
        "is_ready": False,
        "budget": room["settings"]["budget"],
        "squad": [],
        "boost_used": None,
        "chemistry_score": 0,
        "boosts_purchased": [],
        "socket_id": sid
    }
    
    room["players"].append(new_player)
    db.update_room(room_code, {"players": room["players"]})
    
    socket_to_user[sid] = {"room_code": room_code, "name": display_name}
    await sio.enter_room(sid, room_code)
    
    # Emit responses
    await sio.emit("join_room_response", {"success": True, "room": room}, to=sid)
    
    # Broadcast to room
    await sio.emit("room_update", {"room": room}, room=room_code)
    await sio.emit("new_message", {
        "sender": "System",
        "text": f"{display_name} joined the lobby.",
        "type": "join",
        "timestamp": int(time_out_ms() / 1000)
    }, room=room_code)

@sio.event
async def toggle_ready(sid, data):
    user_info = socket_to_user.get(sid)
    if not user_info:
        return
        
    room_code = user_info["room_code"]
    name = user_info["name"]
    
    room = db.get_room(room_code)
    if room:
        for p in room["players"]:
            if p["name"] == name:
                p["is_ready"] = not p["is_ready"]
                break
                
        db.update_room(room_code, {"players": room["players"]})
        await sio.emit("room_update", {"room": room}, room=room_code)

@sio.event
async def kick_player(sid, data):
    user_info = socket_to_user.get(sid)
    if not user_info:
        return
        
    room_code = user_info["room_code"]
    name = user_info["name"]
    target_name = data.get("target_name")
    
    room = db.get_room(room_code)
    if room and room["host_name"] == name:
        # Find player to kick
        target_player = next((p for p in room["players"] if p["name"] == target_name), None)
        if target_player:
            room["players"] = [p for p in room["players"] if p["name"] != target_name]
            db.update_room(room_code, {"players": room["players"]})
            
            # Emit kicked event to room and disconnect target socket if active
            target_sid = target_player.get("socket_id")
            if target_sid:
                await sio.emit("kicked", {"reason": "You were kicked by the host."}, to=target_sid)
                await sio.leave_room(target_sid, room_code)
                
            await sio.emit("room_update", {"room": room}, room=room_code)
            await sio.emit("new_message", {
                "sender": "System",
                "text": f"{target_name} was kicked by host.",
                "type": "leave",
                "timestamp": int(time_out_ms() / 1000)
            }, room=room_code)

@sio.event
async def start_auction(sid, data):
    user_info = socket_to_user.get(sid)
    if not user_info:
        return
        
    room_code = user_info["room_code"]
    name = user_info["name"]
    
    room = db.get_room(room_code)
    if room and room["host_name"] == name:
        db.update_room(room_code, {"status": "auction"})
        await sio.emit("room_status_change", {"status": "auction"}, room=room_code)
        
        # Start background timer task
        await AuctionManager.start_auction_loop(room_code, sio)

@sio.event
async def skip_player(sid, data):
    user_info = socket_to_user.get(sid)
    if not user_info:
        return
        
    room_code = user_info["room_code"]
    name = user_info["name"]
    
    room = db.get_room(room_code)
    if room and room["host_name"] == name:
        res = AuctionManager.skip_player(room_code)
        if res:
            await sio.emit("new_message", {
                "sender": "System",
                "text": "The host skipped the current player.",
                "type": "chat",
                "timestamp": int(time_out_ms() / 1000)
            }, room=room_code)

@sio.event
async def force_end_auction(sid, data):
    user_info = socket_to_user.get(sid)
    if not user_info:
        return
        
    room_code = user_info["room_code"]
    name = user_info["name"]
    
    room = db.get_room(room_code)
    if room and room["host_name"] == name:
        status = AuctionManager.force_end_auction(room_code)
        if status:
            await sio.emit("new_message", {
                "sender": "System",
                "text": "The host ended the auction round.",
                "type": "chat",
                "timestamp": int(time_out_ms() / 1000)
            }, room=room_code)
            
            await sio.emit("room_status_change", {"status": status}, room=room_code)
            await sio.emit("room_update", {"room": db.get_room(room_code)}, room=room_code)
            
            if status == "completed":
                leaderboard = get_leaderboard(db.get_room(room_code))
                await sio.emit("match_ended", {
                    "leaderboard": leaderboard,
                    "winner": leaderboard[0]["name"] if leaderboard else None
                }, room=room_code)

@sio.event
async def place_bid(sid, data):
    user_info = socket_to_user.get(sid)
    if not user_info:
        return
        
    room_code = user_info["room_code"]
    name = user_info["name"]
    amount = int(data.get("amount", 0))
    
    # Process bid with lock logic inside engine
    res = AuctionManager.place_bid(room_code, name, amount)
    
    if res["success"]:
        await sio.emit("bid_update", {
            "current_bid": res["current_bid"],
            "highest_bidder": res["highest_bidder"],
            "time_remaining": res["time_remaining"]
        }, room=room_code)
    else:
        await sio.emit("bid_error", {"reason": res["reason"]}, to=sid)

@sio.event
async def chat_message(sid, data):
    user_info = socket_to_user.get(sid)
    if not user_info:
        return
        
    room_code = user_info["room_code"]
    name = user_info["name"]
    text = data.get("text", "")
    
    await sio.emit("new_message", {
        "sender": name,
        "text": text,
        "type": "chat",
        "timestamp": int(time_out_ms() / 1000)
    }, room=room_code)

@sio.event
async def propose_transfer(sid, data):
    user_info = socket_to_user.get(sid)
    if not user_info:
        return
        
    room_code = user_info["room_code"]
    name = user_info["name"]
    
    proposal_id = str(uuid.uuid4())[:8]
    receiver = data.get("receiver")
    send_player = data.get("send_player")
    receive_player = data.get("receive_player")
    cash = int(data.get("cash", 0))
    
    res = TransferManager.propose_transfer(room_code, proposal_id, name, receiver, send_player, receive_player, cash)
    
    if res["success"]:
        # Find receiver socket id
        room = db.get_room(room_code)
        rec_player = next((p for p in room["players"] if p["name"] == receiver), None)
        
        # Broadcast proposal to both players or target specifically
        await sio.emit("new_transfer_offer", res["proposal"], room=room_code)
        await sio.emit("new_message", {
            "sender": "System",
            "text": f"{name} proposed a trade to {receiver}.",
            "type": "transfer",
            "timestamp": int(time_out_ms() / 1000)
        }, room=room_code)
    else:
        await sio.emit("transfer_error", {"reason": res["reason"]}, to=sid)

@sio.event
async def resolve_transfer(sid, data):
    user_info = socket_to_user.get(sid)
    if not user_info:
        return
        
    room_code = user_info["room_code"]
    proposal_id = data.get("proposal_id")
    action = data.get("action") # accept or reject
    
    if action == "accept":
        res = TransferManager.accept_transfer(room_code, proposal_id)
        if res["success"]:
            await sio.emit("transfer_resolved", {
                "proposal_id": proposal_id,
                "status": "accepted",
                "proposal": res["proposal"]
            }, room=room_code)
            
            # Sync new squads
            await sio.emit("room_update", {"room": db.get_room(room_code)}, room=room_code)
            await sio.emit("new_message", {
                "sender": "System",
                "text": f"Trade accepted: {res['proposal']['sender']} <-> {res['proposal']['receiver']}",
                "type": "transfer",
                "timestamp": int(time_out_ms() / 1000)
            }, room=room_code)
        else:
            await sio.emit("transfer_error", {"reason": res["reason"]}, to=sid)
    else:
        res = TransferManager.reject_transfer(room_code, proposal_id)
        if res["success"]:
            await sio.emit("transfer_resolved", {
                "proposal_id": proposal_id,
                "status": "rejected",
                "proposal": res["proposal"]
            }, room=room_code)

@sio.event
async def purchase_boost(sid, data):
    user_info = socket_to_user.get(sid)
    if not user_info:
        return
        
    room_code = user_info["room_code"]
    name = user_info["name"]
    boost_name = data.get("boost_name")
    footballer_name = data.get("footballer_name") # Optional
    
    res = BoostManager.purchase_boost(room_code, name, boost_name, footballer_name)
    if res["success"]:
        await sio.emit("boost_resolved", {
            "manager": name,
            "boost": boost_name,
            "footballer": footballer_name
        }, room=room_code)
        
        # Sync updated room state
        await sio.emit("room_update", {"room": db.get_room(room_code)}, room=room_code)
        
        text = f"{name} purchased {boost_name}!"
        if footballer_name:
            text = f"{name} applied {boost_name} to {footballer_name}!"
            
        await sio.emit("new_message", {
            "sender": "System",
            "text": text,
            "type": "boost",
            "timestamp": int(time_out_ms() / 1000)
        }, room=room_code)
    else:
        await sio.emit("boost_error", {"reason": res["reason"]}, to=sid)

@sio.event
async def finish_window(sid, data):
    user_info = socket_to_user.get(sid)
    if not user_info:
        return
        
    room_code = user_info["room_code"]
    room = db.get_room(room_code)
    
    if room and room["host_name"] == user_info["name"]:
        # Update room status to boosts phase
        db.update_room(room_code, {"status": "boosts"})
        
        await sio.emit("room_status_change", {"status": "boosts"}, room=room_code)
        await sio.emit("room_update", {"room": db.get_room(room_code)}, room=room_code)
        await sio.emit("new_message", {
            "sender": "System",
            "text": "The transfer window is closed. Transitioning to the Boost Center!",
            "type": "chat",
            "timestamp": int(time_out_ms() / 1000)
        }, room=room_code)

@sio.event
async def finish_boosts(sid, data):
    user_info = socket_to_user.get(sid)
    if not user_info:
        return
        
    room_code = user_info["room_code"]
    room = db.get_room(room_code)
    
    if room and room["host_name"] == user_info["name"]:
        # Calculate final leaderboard standings
        leaderboard = get_leaderboard(room)
        
        # Update status to completed
        db.update_room(room_code, {"status": "completed"})
        
        await sio.emit("room_status_change", {"status": "completed"}, room=room_code)
        await sio.emit("room_update", {"room": db.get_room(room_code)}, room=room_code)
        await sio.emit("match_ended", {
            "leaderboard": leaderboard,
            "winner": leaderboard[0]["name"] if leaderboard else None
        }, room=room_code)
        
        # Schedule auto-cleanup after 1 hour
        asyncio.create_task(cleanup_room_later(room_code))

async def cleanup_room_later(room_code):
    await asyncio.sleep(3600)
    db.delete_room(room_code)

# Helper Utilities
def random_choice_characters():
    import string
    chars = string.ascii_uppercase + string.digits
    return [random.choice(chars) for _ in range(6)]

def time_out_ms():
    import time
    return int(time.time() * 1000)
