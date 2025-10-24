import os
from datetime import datetime, timezone
from pymongo import MongoClient, DESCENDING

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB = os.getenv("MONGODB_DB", "personquiz")
MONGODB_COLLECTION = os.getenv("MONGODB_COLLECTION", "scores")

# Skapa klient och pekare mot collection
_client = MongoClient(MONGODB_URI, tz_aware=True)
_db = _client[MONGODB_DB]
_scores = _db[MONGODB_COLLECTION]

def init_db():
    """Skapa index för snabb topplista."""
    _scores.create_index([("score", DESCENDING), ("created_at", DESCENDING)])
    _scores.create_index("name")

def insert_score(name: str, score: int) -> None:
    """Spara ett resultat i MongoDB."""
    _scores.insert_one({
        "name": name,
        "score": int(score),
        "created_at": datetime.now(timezone.utc),
    })

def top_scores(limit: int = 20):
    """Hämta topplistan (utan _id)."""
    cur = (
        _scores.find({}, {"_id": 0})
               .sort([("score", DESCENDING), ("created_at", DESCENDING)])
               .limit(int(limit))
    )
    return list(cur)
