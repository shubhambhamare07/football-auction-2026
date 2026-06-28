import json
import os
import random
import redis
from pymongo import MongoClient
import config

# Initialize Redis client
try:
    redis_client = redis.Redis.from_url(config.REDIS_URL, decode_responses=True)
    # Ping Redis to test connection
    redis_client.ping()
    print("Successfully connected to Redis.")
except Exception as e:
    print(f"Redis connection failed: {e}")
    redis_client = None

# Initialize MongoDB client
mongo_client = None
db = None

try:
    mongo_client = MongoClient(config.MONGO_URI, serverSelectionTimeoutMS=2000)
    mongo_client.admin.command('ping')
    db = mongo_client[config.DB_NAME]
    print("Successfully connected to MongoDB.")
except Exception as e:
    print(f"MongoDB connection failed: {e}. Fallback to memory state will be used for persistence.")
    db = None

# In-memory storage fallback if MongoDB is down (to prevent app crashes)
_local_rooms = {}
_local_players = []
_local_live_states = {}

# Load fallback players from JSON if MongoDB is down
try:
    json_path = os.path.join(os.path.dirname(__file__), "players_db.json")
    if os.path.exists(json_path):
        with open(json_path, "r", encoding="utf-8") as f:
            _local_players = json.load(f)
except Exception as e:
    print(f"Failed to load local players JSON: {e}")

# Database helper functions
def get_all_players(pool_type="Elite Nations (12)"):
    """
    Fetch all 180 master players.
    If MongoDB is running, fetch from collection, else use JSON memory fallback.
    """
    if db is not None:
        try:
            return list(db.players.find({}, {"_id": 0}))
        except Exception as e:
            print(f"Error fetching from MongoDB: {e}")
    
    # Fallback
    return _local_players

def create_room(room_code, host_name, room_name=None, settings=None):
    """
    Create a new game room session.
    """
    if not room_name:
        room_name = f"Auction Room #{room_code}"
    
    default_settings = {
        "max_players": 8,
        "budget": 500000000, # €500M in Euros
        "timer_duration": 15, # 15 seconds
        "boosts_enabled": True,
        "transfers_enabled": True,
        "auction_order": "Random", # Random, Position Wise, Country Wise
        "countries_count": 12 # 12, 24, 36, 48
    }
    
    if settings:
        default_settings.update(settings)
        
    room_doc = {
        "room_code": room_code,
        "room_name": room_name,
        "host_name": host_name,
        "status": "lobby", # lobby, auction, transfers, completed
        "settings": default_settings,
        "players": [
            {
                "name": host_name,
                "is_host": True,
                "is_ready": True,
                "budget": default_settings["budget"],
                "squad": [], # Purchased player objects
                "boost_used": None, # None or name of boost used
                "chemistry_score": 0,
                "boosts_purchased": [],
                "socket_id": None
            }
        ],
        "chat_messages": [],
        "current_auction": None
    }
    
    if db is not None:
        try:
            db.rooms.insert_one(room_doc)
            room_doc.pop("_id", None)
        except Exception as e:
            print(f"MongoDB create_room failed: {e}")
    
    # Always update memory cache
    _local_rooms[room_code] = room_doc
    return room_doc

def get_room(room_code):
    """
    Retrieve room document.
    """
    if db is not None:
        try:
            room = db.rooms.find_one({"room_code": room_code}, {"_id": 0})
            if room:
                _local_rooms[room_code] = room
                return room
        except Exception as e:
            print(f"MongoDB get_room failed: {e}")
            
    return _local_rooms.get(room_code)

def update_room(room_code, update_data):
    """
    Update a room document.
    """
    if db is not None:
        try:
            db.rooms.update_one({"room_code": room_code}, {"$set": update_data})
        except Exception as e:
            print(f"MongoDB update_room failed: {e}")
            
    if room_code in _local_rooms:
        _local_rooms[room_code].update(update_data)
        return _local_rooms[room_code]
    return None

def delete_room(room_code):
    """
    Clean up room session.
    """
    if db is not None:
        try:
            db.rooms.delete_one({"room_code": room_code})
        except Exception as e:
            print(f"MongoDB delete_room failed: {e}")
            
    if room_code in _local_rooms:
        del _local_rooms[room_code]
        
    # Clear Redis room keys
    if redis_client:
        try:
            keys = redis_client.keys(f"room:{room_code}:*")
            if keys:
                redis_client.delete(*keys)
        except Exception as e:
            print(f"Redis delete room keys failed: {e}")

# Redis Live State Helpers
def set_live_auction_state(room_code, state):
    """
    Store real-time auction variables in Redis (expires in 2 hours to avoid orphan keys).
    """
    _local_live_states[room_code] = state
    if redis_client:
        try:
            key = f"room:{room_code}:auction"
            redis_client.set(key, json.dumps(state), ex=7200)
            return True
        except Exception as e:
            print(f"Redis set state failed: {e}")
    return False

def get_live_auction_state(room_code):
    """
    Read real-time auction variables from Redis.
    """
    if redis_client:
        try:
            key = f"room:{room_code}:auction"
            val = redis_client.get(key)
            if val:
                return json.loads(val)
        except Exception as e:
            print(f"Redis get state failed: {e}")
    return _local_live_states.get(room_code)
