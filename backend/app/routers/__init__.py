from app.routers.links import router as links_router
from app.routers.auth import router as auth_router
from app.routers.config import router as config_router
from app.routers.socials import router as socials_router
from app.routers.uploads import router as uploads_router
from app.routers.qr import router as qr_router
from app.routers.public import router as public_router
from app.routers.spa import router as spa_router

__all__ = [
    "links_router",
    "auth_router",
    "config_router",
    "socials_router",
    "uploads_router",
    "qr_router",
    "public_router",
    "spa_router",
]
