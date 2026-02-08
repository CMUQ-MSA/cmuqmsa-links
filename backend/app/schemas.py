from pydantic import BaseModel
from typing import Optional


# ── Links ────────────────────────────────────────────────
class LinkCreate(BaseModel):
    title: str
    url: str
    description: Optional[str] = ""
    icon: Optional[str] = "link"
    thumbnail_url: Optional[str] = ""
    link_type: Optional[str] = "link"  # link | pdf | image | embed
    visible: Optional[bool] = True


class LinkUpdate(BaseModel):
    title: Optional[str] = None
    url: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    thumbnail_url: Optional[str] = None
    link_type: Optional[str] = None
    visible: Optional[bool] = None


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
