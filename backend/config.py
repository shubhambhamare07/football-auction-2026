import os

PORT = int(os.environ.get("PORT", 8000))
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "football_auction")
REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379")

# Elite nations included in the game
ELITE_NATIONS = [
    "Argentina", "Brazil", "France", "Spain", "Portugal", "England",
    "Germany", "Italy", "Netherlands", "Belgium", "Croatia", "Uruguay"
]
