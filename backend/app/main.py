from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.database import Base, engine, SessionLocal
from app.config import get_settings
from app.models import Link, SiteConfig, SocialLink
from app.routers import (
    links_router,
    auth_router,
    config_router,
    socials_router,
    uploads_router,
    qr_router,
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
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting CMUQ MSA Links backend...")
    init_db()
    yield
    logger.info("Shutting down...")


app = FastAPI(
    title="CMUQ MSA Links",
    description="Linktree clone for CMU Qatar Muslim Students Association",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS — only needed for dev (in prod nginx proxies same-origin)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost"],
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


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}
