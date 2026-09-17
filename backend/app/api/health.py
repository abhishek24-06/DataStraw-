import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_db

router = APIRouter(tags=["health"])


@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception:
        return {"status": "degraded", "database": "disconnected"}


@router.get("/health/diagnostic")
def diagnostic():
    """Diagnostic endpoint to verify deployment - shows version/commit/runtime info"""
    return {
        "application": "Datastraw Support CRM API",
        "version": "1.0.0",
        "commit": os.environ.get("RENDER_GIT_COMMIT", "local"),
        "branch": os.environ.get("RENDER_GIT_BRANCH", "local"),
        "service": os.environ.get("RENDER_SERVICE_NAME", "local"),
        "port": os.environ.get("PORT", "8000"),
        "environment": os.environ.get("ENVIRONMENT", "development"),
        "docs_url": "/docs",
        "openapi_url": "/openapi.json",
    }