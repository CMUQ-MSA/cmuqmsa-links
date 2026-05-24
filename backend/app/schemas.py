from pydantic import BaseModel, field_validator
from typing import Optional
from app.icon_catalog import ALLOWED_LINK_ICON_IDS, DEFAULT_LINK_ICON_ID


def _normalize_icon(value: Optional[str], allow_none: bool) -> Optional[str]:
    if value is None:
        return None if allow_none else DEFAULT_LINK_ICON_ID

    icon = value.strip().lower()
    if not icon:
        return DEFAULT_LINK_ICON_ID
    if icon not in ALLOWED_LINK_ICON_IDS:
        raise ValueError("icon must be one of the allowed icon ids")
    return icon


# ── Links ────────────────────────────────────────────────
class LinkCreate(BaseModel):
    title: str
    url: str
    description: Optional[str] = ""
    icon: Optional[str] = "link"
    thumbnail_url: Optional[str] = ""
    link_type: Optional[str] = "link"  # link | pdf | image | embed
    visible: Optional[bool] = True

    @field_validator("icon", mode="before")
    @classmethod
    def validate_icon(cls, value: Optional[str]) -> str:
        return _normalize_icon(value, allow_none=False) or DEFAULT_LINK_ICON_ID


class LinkUpdate(BaseModel):
    title: Optional[str] = None
    url: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    thumbnail_url: Optional[str] = None
    link_type: Optional[str] = None
    visible: Optional[bool] = None

    @field_validator("icon", mode="before")
    @classmethod
    def validate_icon(cls, value: Optional[str]) -> Optional[str]:
        return _normalize_icon(value, allow_none=True)


class LinkReorder(BaseModel):
    ordered_ids: list[str]


# ── Social Links ────────────────────────────────────────
class SocialLinkCreate(BaseModel):
    platform: str  # instagram, tiktok, github, email, whatsapp, x, youtube, linkedin, telegram
    url: str


class SocialLinkUpdate(BaseModel):
    platform: Optional[str] = None
    url: Optional[str] = None
    visible: Optional[bool] = None


# ── Site Config ─────────────────────────────────────────
class SiteConfigUpdate(BaseModel):
    site_title: Optional[str] = None
    site_bio: Optional[str] = None
    logo_url: Optional[str] = None
    logo_shape: Optional[str] = None          # circle | rounded | square
    primary_color: Optional[str] = None       # hex e.g. #990000
    secondary_color: Optional[str] = None     # hex e.g. #D4AF37
    background_style: Optional[str] = None    # gradient | solid | noise


# ── Auth ────────────────────────────────────────────────
class LoginRequest(BaseModel):
    password: str
