"""
Public, no-auth endpoints optimised for first-paint performance.

These exist alongside the existing `/api/config`, `/api/links`, `/api/socials`
endpoints. The frontend hits them on initial render; admin paths keep using
the per-resource routers.
"""

import os

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Link, SocialLink
from app.routers.config import _get_config
from app.routers.uploads import UPLOAD_DIR, _safe_path

router = APIRouter(prefix="/api", tags=["public"])


@router.get("/public/bootstrap")
def get_bootstrap(db: Session = Depends(get_db)):
    """Single-shot payload for the public landing page.

    Combines config + visible links + visible socials so the client only
    needs one round-trip (and can be preloaded with `<link rel="preload"
    as="fetch">` in index.html).
    """
    config = _get_config(db)

    links = (
        db.query(Link)
        .filter(Link.visible == True)  # noqa: E712 (SQLAlchemy needs ==)
        .order_by(Link.position)
        .all()
    )
    socials = (
        db.query(SocialLink)
        .filter(SocialLink.visible == True)  # noqa: E712
        .order_by(SocialLink.position)
        .all()
    )

    return {
        "config": config,
        "links": [link.to_dict() for link in links],
        "socials": [s.to_dict() for s in socials],
    }


@router.get("/branding/logo")
def get_branding_logo(db: Session = Depends(get_db)):
    """Stable URL for the currently-configured logo.

    The point of this endpoint is to give the HTML a URL it can preload
    with `<link rel="preload" as="image" href="/api/branding/logo">` *during*
    HTML parse — before the JS bundle runs and discovers the real upload
    path. The Header component should `<img src="/api/branding/logo">` so
    that the preload cache match succeeds.
    """
    config = _get_config(db)
    logo_url = (config.get("logo_url") or "").strip()

    # Only resolve URLs we serve ourselves; bail on anything else.
    prefix = "/api/uploads/"
    if not logo_url.startswith(prefix):
        raise HTTPException(status_code=404, detail="No logo configured")

    filename = logo_url[len(prefix):]
    try:
        filepath = _safe_path(filename)
    except HTTPException:
        raise HTTPException(status_code=404, detail="Logo not found")

    if not os.path.isfile(filepath):
        raise HTTPException(status_code=404, detail="Logo file missing")

    # Short cache + must-revalidate: admin can swap the logo and visitors
    # see the change within ~5 minutes. The underlying /api/uploads/<file>
    # is already immutable-cached for 1 year, so this only adds tiny TTFB.
    return FileResponse(
        filepath,
        headers={
            "X-Content-Type-Options": "nosniff",
            "Cache-Control": "public, max-age=300, must-revalidate",
        },
    )
