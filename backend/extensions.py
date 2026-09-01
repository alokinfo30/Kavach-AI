import os
import redis
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
jwt = JWTManager()

# Initialize Redis client
redis_url = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
try:
    redis_client = redis.from_url(redis_url)
except Exception:
    redis_client = None

# Configure Limiter with Redis if available, else memory
storage_uri = "memory://"
if redis_client:
    storage_uri = redis_url

limiter = Limiter(
    key_func=get_remote_address, default_limits=["200 per day", "50 per hour"], storage_uri=storage_uri
)

# Initialize MongoDB client
mongo_uri = (
    os.environ.get("MONGO_URI")
    or os.environ.get("MONGODB_URI")
    or "mongodb+srv://alokinfoproict_db_user:fzXfm0IBsudp0ZG1@cluster0.99rdhte.mongodb.net/?appName=Cluster0"
)

mongo_client = None
mongo_db = None

if mongo_uri:
    try:
        from pymongo import MongoClient
        mongo_client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        mongo_db = mongo_client.get_database("kavach_ai")
    except Exception:
        mongo_client = None
        mongo_db = None