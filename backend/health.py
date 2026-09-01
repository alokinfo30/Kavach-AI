from flask import Blueprint, jsonify, Response
from sqlalchemy import text
from .extensions import db, mongo_client

health_bp = Blueprint("health", __name__, url_prefix="/health")

@health_bp.route("", methods=["GET"])
def health_check() -> tuple[Response, int]:
    """
    Health check endpoint for container orchestration probes.
    """
    health_status = {"status": "ok", "database": "unknown", "mongodb": "disconnected"}
    
    # 1. Check SQL Database
    try:
        db.session.execute(text("SELECT 1"))
        health_status["database"] = "connected"
    except Exception as e:
        health_status["status"] = "degraded"
        health_status["database"] = str(e)

    # 2. Check MongoDB Cluster
    if mongo_client:
        try:
            mongo_client.admin.command('ping')
            health_status["mongodb"] = "connected"
        except Exception as e:
            health_status["mongodb"] = f"error: {str(e)}"
    else:
        health_status["mongodb"] = "uninitialized"

    status_code = 200 if health_status["status"] == "ok" else 503
    return jsonify(health_status), status_code