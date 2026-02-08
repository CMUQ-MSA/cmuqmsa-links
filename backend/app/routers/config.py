from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import SiteConfig
from app.schemas import SiteConfigUpdate
from app.middleware.auth import require_admin

router = APIRouter(prefix="/api/config", tags=["config"])

# Default values for fresh installs
DEFAULTS = {
    "site_title": "CMUQ MSA",
    "site_bio": "Serving the Muslim community at Carnegie Mellon University in Qatar",
    "logo_url": "",
    "logo_shape": "circle",
    "primary_color": "#990000",
    "secondary_color": "#D4AF37",
    "background_style": "gradient",
}


def _get_config(db: Session) -> dict:
    """Read all config rows into a dict, filling defaults."""
    rows = db.query(SiteConfig).all()
    config = {**DEFAULTS}
    for row in rows:
        config[row.key] = row.value
    return config


def _set_config(db: Session, key: str, value: str):
    row = db.query(SiteConfig).filter(SiteConfig.key == key).first()
    if row:
        row.value = value
    else:
        db.add(SiteConfig(key=key, value=value))


@router.get("")
def get_config(db: Session = Depends(get_db)):
    """Public: Get site configuration."""
    return _get_config(db)


@router.put("")
def update_config(
    data: SiteConfigUpdate,
    _admin=Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin: Update site configuration."""
    updates = data.model_dump(exclude_unset=True)
    for key, value in updates.items():
        if value is not None:
            _set_config(db, key, value)
    db.commit()
    return _get_config(db)
