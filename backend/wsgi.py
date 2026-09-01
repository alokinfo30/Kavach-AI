from backend import create_app
from backend.startup import on_startup
from backend.migrations import run_migrations

app = create_app()
try:
    run_migrations(app)
except Exception as e:
    app.logger.warning(f"Could not run migrations during startup (e.g. database connecting): {e}")

on_startup(app)