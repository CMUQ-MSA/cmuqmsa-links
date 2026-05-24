from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import os
from sqlalchemy import text

from app.database import Base, engine, SessionLocal
from app.config import get_settings
from app.icon_catalog import ALLOWED_LINK_ICON_IDS, DEFAULT_LINK_ICON_ID
from app.models import Link, SiteConfig, SocialLink
from app.routers import (
    links_router,
    auth_router,
    config_router,
    socials_router,
    uploads_router,
    qr_router,
    public_router,
)

settings = get_settings()
logging.basicConfig(level=logging.INFO if settings.DEBUG else logging.WARNING)
logger = logging.getLogger(__name__)


SEED_LINKS = [
    {
        "title": "Jummah Bus Sign-up",
        "url": "https://forms.gle/example1",
        "description": "Leaves at 12:30 PM from CMU-Q main entrance",
        "icon": "bus",
        "link_type": "link",
        "position": 0,
        "visible": True,
    },
    {
        "title": "Weekly Halaqa",
        "url": "https://forms.gle/example2",
        "description": "Every Thursday at 6 PM",
        "icon": "book-open",
        "link_type": "link",
        "position": 1,
        "visible": True,
    },
    {
        "title": "MSA Membership Form",
        "url": "https://forms.gle/example3",
        "description": "Join the MSA family",
        "icon": "users",
        "link_type": "link",
        "position": 2,
        "visible": True,
    },
    {
        "title": "Ramadan Iftar Schedule",
        "url": "https://docs.google.com/example4",
        "description": "Community iftars throughout Ramadan",
        "icon": "calendar",
        "link_type": "link",
        "position": 3,
        "visible": True,
    },
    {
        "title": "Donate to MSA",
        "url": "https://example.com/donate",
        "description": "Support our events and initiatives",
        "icon": "heart",
        "link_type": "link",
        "position": 4,
        "visible": True,
    },
]

SEED_SOCIALS = [
    {"platform": "instagram", "url": "https://instagram.com/cmuqmsa", "position": 0},
    {"platform": "whatsapp", "url": "https://wa.me/1234567890", "position": 1},
    {"platform": "email", "url": "mailto:msa@qatar.cmu.edu", "position": 2},
]

SEED_CONFIG = {
    "site_title": "CMUQ MSA",
    "site_bio": "Serving the Muslim community at Carnegie Mellon University in Qatar",
    "logo_url": "",
    "logo_shape": "circle",
    "primary_color": "#990000",
    "secondary_color": "#D4AF37",
    "background_style": "gradient",
}


def validate_production_config():
    if settings.DEBUG:
        return
    placeholder_secret_keys = {
        "change-me",
        "change-this-to-a-random-string-at-least-32-chars",
        "replace-with-32-plus-random-chars",
    }
    if settings.SECRET_KEY in placeholder_secret_keys or len(settings.SECRET_KEY) < 32:
        raise RuntimeError("SECRET_KEY must be a non-placeholder 32+ character value in production.")
    if settings.ADMIN_PASSWORD in {"changeme123", "replace-with-secure-password"} or len(settings.ADMIN_PASSWORD) < 12:
        raise RuntimeError("ADMIN_PASSWORD must be changed to a strong value in production.")


def configured_origins():
    if settings.DEBUG:
        return ["http://localhost:5173", "http://localhost:3000", "http://localhost"]
    return [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",") if origin.strip()]


def init_db():
    """Create tables and seed initial data."""
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Seed links
        if db.query(Link).count() == 0:
            logger.info("Seeding initial links...")
            for link_data in SEED_LINKS:
                db.add(Link(**link_data))
            db.commit()

        # Seed social links
        if db.query(SocialLink).count() == 0:
            logger.info("Seeding social links...")
            for social_data in SEED_SOCIALS:
                db.add(SocialLink(**social_data))
            db.commit()

        # Seed config
        if db.query(SiteConfig).count() == 0:
            logger.info("Seeding site config...")
            for key, value in SEED_CONFIG.items():
                db.add(SiteConfig(key=key, value=value))
            db.commit()

        normalized = 0
        for link in db.query(Link).all():
            icon = (link.icon or "").strip().lower()
            if not icon or icon not in ALLOWED_LINK_ICON_IDS:
                link.icon = DEFAULT_LINK_ICON_ID
                normalized += 1
        if normalized:
            logger.info("Normalized %s links with unsupported icon ids", normalized)
            db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting CMUQ MSA Links backend...")
    validate_production_config()
    init_db()
    yield
    logger.info("Shutting down...")


app = FastAPI(
    title="CMUQ MSA Links",
    description="Linktree clone for CMU Qatar Muslim Students Association",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
)

# CORS — only needed for dev (in prod nginx proxies same-origin)
app.add_middleware(
    CORSMiddleware,
    allow_origins=configured_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router)
app.include_router(links_router)
app.include_router(config_router)
app.include_router(socials_router)
app.include_router(uploads_router)
app.include_router(qr_router)
app.include_router(public_router)


@app.get("/api/health")
async def health_check():
    db_ok = True
    uploads_ok = True
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception:
        db_ok = False

    upload_dir = "/app/data/uploads"
    try:
        os.makedirs(upload_dir, exist_ok=True)
        uploads_ok = os.access(upload_dir, os.W_OK)
    except Exception:
        uploads_ok = False

    healthy = db_ok and uploads_ok
    return JSONResponse(
        status_code=200 if healthy else 503,
        content={
            "status": "healthy" if healthy else "unhealthy",
            "database": "ok" if db_ok else "error",
            "uploads": "ok" if uploads_ok else "error",
        },
    )
