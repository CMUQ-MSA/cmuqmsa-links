from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime
from datetime import datetime, timezone
import uuid

from app.database import Base


class Link(Base):
    __tablename__ = "links"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(200), nullable=False)
    url = Column(Text, nullable=False)
    description = Column(String(500), nullable=True, default="")
    icon = Column(String(50), nullable=True, default="link")  # lucide icon name
    thumbnail_url = Column(Text, nullable=True, default="")   # uploaded image path
    link_type = Column(String(20), nullable=False, default="link")  # link | pdf | image | embed
    position = Column(Integer, nullable=False, default=0)
    visible = Column(Boolean, nullable=False, default=True)
    clicks = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "url": self.url,
            "description": self.description,
            "icon": self.icon,
            "thumbnail_url": self.thumbnail_url,
            "link_type": self.link_type,
            "position": self.position,
            "visible": self.visible,
            "clicks": self.clicks,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class SocialLink(Base):
    __tablename__ = "social_links"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    platform = Column(String(50), nullable=False)  # instagram, tiktok, github, email, whatsapp, x, youtube, linkedin, telegram
    url = Column(Text, nullable=False)
    position = Column(Integer, nullable=False, default=0)
    visible = Column(Boolean, nullable=False, default=True)

    def to_dict(self):
        return {
            "id": self.id,
            "platform": self.platform,
            "url": self.url,
            "position": self.position,
            "visible": self.visible,
        }


class SiteConfig(Base):
    __tablename__ = "site_config"

    key = Column(String(100), primary_key=True)
    value = Column(Text, nullable=False, default="")
