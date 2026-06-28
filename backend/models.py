from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class RoomSettings(BaseModel):
    max_players: int = Field(default=8, ge=2, le=8)
    budget: int = Field(default=500000000) # €500M default
    timer_duration: int = Field(default=15) # 10s, 15s, 20s, 30s, 60s
    boosts_enabled: bool = Field(default=True)
    transfers_enabled: bool = Field(default=True)
    auction_order: str = Field(default="Random") # Random, Position Wise, Country Wise
    countries_count: int = Field(default=12) # 12, 24, 36, 48

class CreateRoomRequest(BaseModel):
    display_name: str = Field(..., min_length=1, max_length=20)
    room_name: Optional[str] = Field(default=None, max_length=30)
    settings: Optional[RoomSettings] = None

class JoinRoomRequest(BaseModel):
    display_name: str = Field(..., min_length=1, max_length=20)
    room_code: str = Field(..., min_length=6, max_length=10)

class BidRequest(BaseModel):
    room_code: str
    amount: int
