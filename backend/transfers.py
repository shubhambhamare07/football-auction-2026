from typing import Dict, Any, List
import db

# Map of room_code -> list of active transfer proposals
# proposal structure:
# { "id": str, "sender": str, "receiver": str, "send_player": dict, "receive_player": dict, "cash_adjustment": int }
active_transfers: Dict[str, List[Dict[str, Any]]] = {}

class TransferManager:
    @staticmethod
    def propose_transfer(room_code: str, proposal_id: str, sender: str, receiver: str, send_player: Dict, receive_player: Dict, cash_adjustment: int) -> Dict[str, Any]:
        """
        Record a new trade offer and validate if sender has the player and budget.
        """
        room = db.get_room(room_code)
        if not room:
            return {"success": False, "reason": "Room not found."}
            
        # Get profiles
        sender_profile = next((p for p in room["players"] if p["name"] == sender), None)
        receiver_profile = next((p for p in room["players"] if p["name"] == receiver), None)
        
        if not sender_profile or not receiver_profile:
            return {"success": False, "reason": "Sender or receiver not in room."}
            
        # Check if sender owns the player
        if send_player:
            has_player = any(p["name"] == send_player["name"] for p in sender_profile.get("squad", []))
            if not has_player:
                return {"success": False, "reason": "Sender does not own the proposed player."}
                
        # Check if receiver owns the player
        if receive_player:
            has_player = any(p["name"] == receive_player["name"] for p in receiver_profile.get("squad", []))
            if not has_player:
                return {"success": False, "reason": "Receiver does not own the requested player."}
                
        # Validate budget (if sender is paying cash, cash_adjustment is positive)
        # If sender receives cash, cash_adjustment is negative
        if cash_adjustment > 0 and sender_profile["budget"] < cash_adjustment:
            return {"success": False, "reason": "Sender has insufficient budget for cash adjustment."}
        if cash_adjustment < 0 and receiver_profile["budget"] < abs(cash_adjustment):
            return {"success": False, "reason": "Receiver has insufficient budget for cash adjustment."}
            
        proposal = {
            "id": proposal_id,
            "sender": sender,
            "receiver": receiver,
            "send_player": send_player,
            "receive_player": receive_player,
            "cash_adjustment": cash_adjustment,
            "status": "pending"
        }
        
        if room_code not in active_transfers:
            active_transfers[room_code] = []
            
        active_transfers[room_code].append(proposal)
        return {"success": True, "proposal": proposal}

    @staticmethod
    def accept_transfer(room_code: str, proposal_id: str) -> Dict[str, Any]:
        """
        Executes a trade: shifts rosters, adapts budgets, and closes the proposal.
        """
        proposals = active_transfers.get(room_code, [])
        proposal = next((p for p in proposals if p["id"] == proposal_id), None)
        
        if not proposal or proposal["status"] != "pending":
            return {"success": False, "reason": "Proposal not found or already resolved."}
            
        room = db.get_room(room_code)
        if not room:
            return {"success": False, "reason": "Room not found."}
            
        sender = proposal["sender"]
        receiver = proposal["receiver"]
        send_player = proposal["send_player"]
        receive_player = proposal["receive_player"]
        cash = proposal["cash_adjustment"]
        
        # Get profiles
        sender_profile = next((p for p in room["players"] if p["name"] == sender), None)
        receiver_profile = next((p for p in room["players"] if p["name"] == receiver), None)
        
        if not sender_profile or not receiver_profile:
            return {"success": False, "reason": "Sender or receiver no longer in room."}
            
        # Execute budget transfers
        sender_profile["budget"] -= cash
        receiver_profile["budget"] += cash
        
        # Execute player swaps
        if send_player:
            sender_profile["squad"] = [p for p in sender_profile["squad"] if p["name"] != send_player["name"]]
            receiver_profile["squad"].append(send_player)
            
        if receive_player:
            receiver_profile["squad"] = [p for p in receiver_profile["squad"] if p["name"] != receive_player["name"]]
            sender_profile["squad"].append(receive_player)
            
        # Save to database
        db.update_room(room_code, {"players": room["players"]})
        
        # Mark proposal resolved
        proposal["status"] = "accepted"
        return {"success": True, "proposal": proposal, "players": room["players"]}

    @staticmethod
    def reject_transfer(room_code: str, proposal_id: str) -> Dict[str, Any]:
        """
        Rejects the transfer proposal.
        """
        proposals = active_transfers.get(room_code, [])
        proposal = next((p for p in proposals if p["id"] == proposal_id), None)
        
        if not proposal or proposal["status"] != "pending":
            return {"success": False, "reason": "Proposal not found or already resolved."}
            
        proposal["status"] = "rejected"
        return {"success": True, "proposal": proposal}
