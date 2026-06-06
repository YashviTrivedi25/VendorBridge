"""
FastAPI application entry point.
DB connection is attempted on startup — if it fails the app still starts
with endpoints available (they will return 503 until DB is configured).
"""
from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

logger = logging.getLogger("vendorbridge")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Try to create tables — warn but don't crash if DB isn't configured yet
    try:
        from app.db.database import create_tables
        await create_tables()
        logger.info("✅ Database tables ready")
    except Exception as e:
        logger.warning(f"⚠️  Database not connected (running without DB): {e}")
        logger.warning("   Set DATABASE_URL in backend/.env to enable persistence")
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version="2.0.0",
    description="Procurement management platform — Phase 2",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
from app.routers import auth, vendors, rfqs, quotations, purchase_orders, invoices, activity_logs, users

app.include_router(auth.router)
app.include_router(vendors.router)
app.include_router(rfqs.router)
app.include_router(quotations.router)
app.include_router(purchase_orders.router)
app.include_router(invoices.router)
app.include_router(activity_logs.router)
app.include_router(users.router)


@app.get("/", tags=["Health"])
async def health():
    return {"status": "ok", "app": settings.APP_NAME, "version": "2.0.0"}


@app.get("/api/health", tags=["Health"])
async def api_health():
    db_status = "unknown"
    try:
        from app.db.database import engine
        async with engine.connect() as conn:
            await conn.execute(__import__("sqlalchemy").text("SELECT 1"))
        db_status = "connected"
    except Exception:
        db_status = "not_connected"
    return {"status": "ok", "database": db_status}
