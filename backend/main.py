from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import auth, vendors, rfqs, quotations, purchase_orders, invoices, activity_logs, users

app = FastAPI(
    title=settings.APP_NAME,
    description="Procurement management platform API — Phase 1",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ─────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(vendors.router)
app.include_router(rfqs.router)
app.include_router(quotations.router)
app.include_router(purchase_orders.router)
app.include_router(invoices.router)
app.include_router(activity_logs.router)
app.include_router(users.router)


@app.get("/", tags=["Health"])
async def root():
    return {"service": settings.APP_NAME, "status": "running", "env": settings.APP_ENV}


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}
