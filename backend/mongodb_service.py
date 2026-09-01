import logging
from datetime import datetime
from typing import Any, Dict, List, Optional
from .extensions import mongo_db

logger = logging.getLogger(__name__)

def get_collection(collection_name: str):
    """Retrieve a MongoDB collection from the kavach_ai database."""
    if mongo_db is not None:
        return mongo_db[collection_name]
    return None

def save_ai_test_run(test_data: Dict[str, Any]) -> Optional[str]:
    """Save an AI Red Team test run or risk assessment document to MongoDB."""
    col = get_collection("ai_test_runs")
    if col is None:
        logger.warning("MongoDB not connected. Skipping MongoDB write.")
        return None
    try:
        data = test_data.copy()
        if "created_at" not in data:
            data["created_at"] = datetime.utcnow()
        result = col.insert_one(data)
        return str(result.inserted_id)
    except Exception as e:
        logger.error(f"Error saving to MongoDB: {e}")
        return None

def get_ai_test_runs(limit: int = 50) -> List[Dict[str, Any]]:
    """Retrieve recent AI test runs from MongoDB."""
    col = get_collection("ai_test_runs")
    if col is None:
        return []
    try:
        docs = list(col.find({}, {"_id": 0}).sort("created_at", -1).limit(limit))
        return docs
    except Exception as e:
        logger.error(f"Error fetching from MongoDB: {e}")
        return []

def log_telemetry_event(event_type: str, payload: Dict[str, Any]) -> bool:
    """Log an audit or telemetry event to MongoDB."""
    col = get_collection("telemetry_logs")
    if col is None:
        return False
    try:
        col.insert_one({
            "event_type": event_type,
            "payload": payload,
            "timestamp": datetime.utcnow()
        })
        return True
    except Exception as e:
        logger.error(f"Error logging telemetry to MongoDB: {e}")
        return False
