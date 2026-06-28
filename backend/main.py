from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import config
import db
from models import CreateRoomRequest, JoinRoomRequest, RoomSettings
from socket_manager import sio_app, get_leaderboard
import random
import string

app = FastAPI(
    title="Global Football Auction 2026 API",
    description="Real-time backend API for multiplayer football draft auctions",
    version="1.0.0"
)

# CORS configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to Vercel domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Socket.IO app to FastAPI
app.mount("/socket.io", sio_app)

# Helper function
def generate_code() -> str:
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=6))

@app.get("/")
def get_status():
    return {
        "status": "online",
        "game": "Global Football Auction 2026",
        "tagline": "Build Your Dream Team. Win The Auction."
    }

@app.get("/players")
def fetch_players():
    players = db.get_all_players()
    return {"players": players}

@app.get("/rooms/{room_code}")
def fetch_room(room_code: str):
    room = db.get_room(room_code.upper())
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    return {"room": room}

@app.post("/rooms")
def create_new_room(req: CreateRoomRequest):
    room_code = generate_code()
    settings_dict = req.settings.dict() if req.settings else None
    
    room = db.create_room(
        room_code=room_code,
        host_name=req.display_name,
        room_name=req.room_name,
        settings=settings_dict
    )
    return {
        "success": True,
        "room_code": room_code,
        "room": room
    }

@app.post("/rooms/{room_code}/join")
def join_existing_room(room_code: str, req: JoinRoomRequest):
    code = room_code.upper().strip()
    room = db.get_room(code)
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
        
    if len(room["players"]) >= room["settings"].get("max_players", 8):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Room is full"
        )
        
    # Check if duplicate name
    if any(p["name"].lower() == req.display_name.lower() for p in room["players"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Display name already taken in this room"
        )
        
    # Add player to list
    new_player = {
        "name": req.display_name,
        "is_host": False,
        "is_ready": False,
        "budget": room["settings"]["budget"],
        "squad": [],
        "boost_used": None,
        "socket_id": None
    }
    
    room["players"].append(new_player)
    db.update_room(code, {"players": room["players"]})
    
    return {
        "success": True,
        "room": room
    }

@app.get("/rooms/{room_code}/leaderboard")
def fetch_leaderboard(room_code: str):
    room = db.get_room(room_code.upper())
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    return {
        "leaderboard": get_leaderboard(room)
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=config.PORT, reload=True)
