"""
SPA shell route — serves index.html with bootstrap data inlined.

This is what eliminates the loading spinner on first paint: instead of the
client mounting React, calling /api/public/bootstrap, and re-rendering, the
server pre-renders the HTML with the data already in a global so the very
first render has everything it needs.

The frontend reads ``window.__BOOTSTRAP__`` on mount (see PublicPage.tsx). If
the global is missing (older HTML cached at CF, dev mode, etc.) the frontend
falls back to a normal fetch — so this route is a perf enhancement, not a
hard dependency.
"""

import json
import logging
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse, JSONResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Link, SocialLink
from app.routers.config import _get_config

logger = logging.getLogger(__name__)

router = APIRouter(tags=["spa"])

# The frontend dist's index.html is copied here by the backend Dockerfile's
# multi-stage build. In dev (without the frontend built into the image) the
# file may be absent — we handle that gracefully.
_INDEX_HTML_PATH = Path(__file__).resolve().parents[2] / "static" / "index.html"

# Tag we replace with the inlined bootstrap. Matches the preload <link> the
# frontend's index.html source ships with — by *replacing* it (rather than
# inserting alongside) we avoid a wasted preload of an endpoint we no longer
# need to call.
_PRELOAD_TAG = (
    '<link rel="preload" as="fetch" href="/api/public/bootstrap" crossorigin />'
)


def _load_template() -> Optional[str]:
    """Read index.html from disk once and cache it in-process."""
    cached = getattr(_load_template, "_cached", None)
    if cached is not None:
        return cached
    try:
        text = _INDEX_HTML_PATH.read_text(encoding="utf-8")
    except FileNotFoundError:
        logger.warning(
            "SPA shell template not found at %s; "
            "/ and SPA routes will return a stub. "
            "(Backend image probably wasn't built with the multi-stage frontend step.)",
            _INDEX_HTML_PATH,
        )
        text = None
    setattr(_load_template, "_cached", text)
    return text


def _build_bootstrap(db: Session) -> dict:
    config = _get_config(db)
    links = (
        db.query(Link)
        .filter(Link.visible == True)  # noqa: E712
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


def _render_shell(template: str, bootstrap: dict) -> str:
    """Inject the bootstrap script into the HTML template.

    Replaces the bootstrap preload <link> if present (saves a wasted request);
    otherwise inserts before </head>. The JSON payload has every ``<``, ``>``
    and ``&`` replaced with their unicode escapes so no data value can break
    out of the inline <script> tag (script end tags are case-insensitive, so
    a simple ``</`` replacement isn't enough — content like ``</SCRIPT>``
    would still terminate the block).
    """
    payload = (
        json.dumps(bootstrap, separators=(",", ":"))
        .replace("<", "\\u003c")
        .replace(">", "\\u003e")
        .replace("&", "\\u0026")
        .replace("\u2028", "\\u2028")  # JS line separator — invalid in source
        .replace("\u2029", "\\u2029")  # JS paragraph separator — invalid in source
    )
    script = f'<script>window.__BOOTSTRAP__={payload};</script>'

    if _PRELOAD_TAG in template:
        return template.replace(_PRELOAD_TAG, script, 1)
    if "</head>" in template:
        return template.replace("</head>", f"  {script}\n  </head>", 1)
    # Pathological case: no </head>. Don't inject; client falls back to fetch.
    return template


# ---------------------------------------------------------------------------
# Catch-all route. MUST be registered after every other router so /api/*
# takes precedence. main.py handles that ordering.
# ---------------------------------------------------------------------------

@router.get("/{full_path:path}", include_in_schema=False)
def spa_shell(full_path: str, request: Request, db: Session = Depends(get_db)):
    # Defensive: never serve the shell for /api/*. FastAPI's router precedence
    # should already prevent this, but if a request slips through (e.g. a
    # client probing an unknown /api/* path) return a normal 404 JSON instead
    # of an HTML page that would confuse API consumers.
    if full_path.startswith("api/") or full_path == "api":
        return JSONResponse(status_code=404, content={"detail": "Not Found"})

    template = _load_template()
    if template is None:
        # Image built without the frontend step. Tell the client clearly so it
        # falls back to the API path (window.__BOOTSTRAP__ will be undefined).
        return HTMLResponse(
            status_code=503,
            content=(
                "<!doctype html><title>SPA shell missing</title>"
                "<p>This backend image was built without the frontend "
                "multi-stage step. Rebuild with the full build context.</p>"
            ),
        )

    try:
        bootstrap = _build_bootstrap(db)
    except Exception:  # noqa: BLE001 — bootstrap is best-effort
        logger.exception("Failed to build bootstrap payload; serving shell without it")
        bootstrap = None

    html = _render_shell(template, bootstrap) if bootstrap is not None else template

    # /admin should never be edge-cached — admins want immediate feedback on
    # the latest deploy and there's nothing public-cacheable about it. Public
    # shell pages get a short edge cache with stale-while-revalidate so the
    # spinner-free first paint is also globally fast once CF picks it up.
    is_admin = full_path == "admin" or full_path.startswith("admin/")
    cache_control = (
        "private, no-store"
        if is_admin
        else "public, max-age=0, s-maxage=60, stale-while-revalidate=300"
    )

    return HTMLResponse(
        content=html,
        headers={"Cache-Control": cache_control},
    )
