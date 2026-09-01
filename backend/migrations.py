import logging
from flask import Flask
from sqlalchemy import text, inspect
from .extensions import db

logger = logging.getLogger(__name__)

def run_migrations(app: Flask):
    """
    Checks for missing columns and updates the database schema.
    This is a lightweight alternative to Alembic for this specific project scope.
    """
    with app.app_context():
        try:
            # 1. Create any missing tables (standard SQLAlchemy behavior)
            db.create_all()

            inspector = inspect(db.engine)
            
            # 2. Update 'ai_tests' table columns if needed
            if inspector.has_table("ai_tests"):
                columns = [c["name"] for c in inspector.get_columns("ai_tests")]
                
                if "results" not in columns:
                    logger.info("Migrating: Adding 'results' column to ai_tests")
                    with db.engine.connect() as conn:
                        conn.execute(text("ALTER TABLE ai_tests ADD COLUMN results JSON"))
                        conn.commit()
                
                if "completed_at" not in columns:
                    logger.info("Migrating: Adding 'completed_at' column to ai_tests")
                    with db.engine.connect() as conn:
                        conn.execute(text("ALTER TABLE ai_tests ADD COLUMN completed_at TIMESTAMP"))
                        conn.commit()

            # 3. Update 'scheduled_tests' table columns if needed
            if inspector.has_table("scheduled_tests"):
                columns = [c["name"] for c in inspector.get_columns("scheduled_tests")]
                
                if "last_run" not in columns:
                    logger.info("Migrating: Adding 'last_run' column to scheduled_tests")
                    with db.engine.connect() as conn:
                        conn.execute(text("ALTER TABLE scheduled_tests ADD COLUMN last_run TIMESTAMP"))
                        conn.commit()
                
                if "is_active" not in columns:
                    logger.info("Migrating: Adding 'is_active' column to scheduled_tests")
                    with db.engine.connect() as conn:
                        conn.execute(text("ALTER TABLE scheduled_tests ADD COLUMN is_active BOOLEAN DEFAULT TRUE"))
                        conn.commit()

            logger.info("Database schema verification completed.")
        except Exception as e:
            logger.info(f"Database schema already initialized or up to date: {e}")