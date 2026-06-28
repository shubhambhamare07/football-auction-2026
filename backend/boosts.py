from typing import Dict, Any, Optional
import db

BOOSTS = {
    "Captain": {"name": "Captain", "bonus": 10, "price": 100000000, "description": "+10 Fantasy Points to one player"},
    "Golden Boot": {"name": "Golden Boot", "bonus": 8, "price": 80000000, "description": "+8 Fantasy Points to one striker/forward"},
    "Defensive Wall": {"name": "Defensive Wall", "bonus": 6, "price": 60000000, "description": "+6 Fantasy Points to one defender/goalkeeper"},
    "Playmaker": {"name": "Playmaker", "bonus": 5, "price": 50000000, "description": "+5 Fantasy Points to one midfielder/winger"},
    "Team Chemistry": {"name": "Team Chemistry", "bonus": 5, "price": 40000000, "description": "+5 Team Fantasy Points directly"}
}

class BoostManager:
    @staticmethod
    def purchase_boost(room_code: str, player_name: str, boost_name: str, footballer_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Validates and processes a boost purchase, deducting remaining Euros budget and updating scores.
        """
        if boost_name not in BOOSTS:
            return {"success": False, "reason": f"Invalid boost type: {boost_name}"}
            
        room = db.get_room(room_code)
        if not room:
            return {"success": False, "reason": "Room not found."}
            
        if room["status"] != "boosts":
            return {"success": False, "reason": "Boost phase is not active."}
            
        # Get manager profile
        manager = next((p for p in room["players"] if p["name"] == player_name), None)
        if not manager:
            return {"success": False, "reason": "Manager not found in room."}
            
        boost_info = BOOSTS[boost_name]
        cost = boost_info["price"]
        
        # Validate budget
        if manager["budget"] < cost:
            return {"success": False, "reason": f"Insufficient budget. Cost: €{cost / 1000000}M. Your budget: €{manager['budget'] / 1000000}M."}
            
        # Apply boost
        if boost_name == "Team Chemistry":
            manager["budget"] -= cost
            manager["chemistry_score"] = manager.get("chemistry_score", 0) + boost_info["bonus"]
            if "boosts_purchased" not in manager:
                manager["boosts_purchased"] = []
            manager["boosts_purchased"].append("Team Chemistry")
        else:
            if not footballer_name:
                return {"success": False, "reason": "A target squad player must be selected for this boost."}
                
            # Verify footballer exists in squad
            squad = manager.get("squad", [])
            footballer = next((f for f in squad if f["name"] == footballer_name), None)
            if not footballer:
                return {"success": False, "reason": f"{footballer_name} is not in your squad."}
                
            # Verify footballer doesn't already have a boost
            if footballer.get("boost_applied"):
                return {"success": False, "reason": f"{footballer_name} already has a boost applied: {footballer['boost_applied']}."}
                
            # Specific position validations (optional but premium)
            pos = footballer["position"]
            if boost_name == "Golden Boot" and pos not in ["Striker", "Forward"]:
                return {"success": False, "reason": "Golden Boot can only be applied to Strikers or Forwards."}
            if boost_name == "Defensive Wall" and pos not in ["Center Back", "Left Back", "Right Back", "Goalkeeper"]:
                return {"success": False, "reason": "Defensive Wall can only be applied to Defenders or Goalkeepers."}
            if boost_name == "Playmaker" and pos not in ["Midfielder", "Left Winger", "Right Winger"]:
                return {"success": False, "reason": "Playmaker can only be applied to Midfielders or Wingers."}
                
            manager["budget"] -= cost
            footballer["fantasy_score"] += boost_info["bonus"]
            footballer["boost_applied"] = boost_name
            if "boosts_purchased" not in manager:
                manager["boosts_purchased"] = []
            manager["boosts_purchased"].append(f"{boost_name} ({footballer_name})")
            
        # Save updates to DB
        db.update_room(room_code, {"players": room["players"]})
        
        return {
            "success": True,
            "manager_name": player_name,
            "boost_name": boost_name,
            "cost": cost,
            "players": room["players"]
        }
