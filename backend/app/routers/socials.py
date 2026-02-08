from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models import SocialLink
from app.schemas import SocialLinkCreate, SocialLinkUpdate
from app.middleware.auth import require_admin

router = APIRouter(prefix="/api/socials", tags=["socials"])


class SocialReorder(BaseModel):
    ordered_ids: list[str]


@router.get("")
def get_socials(db: Session = Depends(get_db)):
    """Public: Get visible social links, ordered by position."""
    socials = (
        db.query(SocialLink)
        .filter(SocialLink.visible == True)
        .order_by(SocialLink.position)
        .all()
    )
    return [s.to_dict() for s in socials]


@router.get("/all")
def get_all_socials(_admin=Depends(require_admin), db: Session = Depends(get_db)):
    """Admin: Get all social links."""
    socials = db.query(SocialLink).order_by(SocialLink.position).all()
    return [s.to_dict() for s in socials]


@router.put("/reorder/batch")
def reorder_socials(data: SocialReorder, _admin=Depends(require_admin), db: Session = Depends(get_db)):
    """Admin: Reorder social links by providing an ordered list of IDs."""
    for index, social_id in enumerate(data.ordered_ids):
        social = db.query(SocialLink).filter(SocialLink.id == social_id).first()
        if social:
            social.position = index
    db.commit()
    return {"status": "ok"}


@router.post("", status_code=201)
def create_social(
    data: SocialLinkCreate,
    _admin=Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin: Add a new social link."""
    max_pos = db.query(SocialLink.position).order_by(SocialLink.position.desc()).first()
    next_pos = (max_pos[0] + 1) if max_pos else 0

    social = SocialLink(
        platform=data.platform,
        url=data.url,
        position=next_pos,
    )
    db.add(social)
    db.commit()
    db.refresh(social)
    return social.to_dict()


@router.put("/{social_id}")
def update_social(
    social_id: str,
    data: SocialLinkUpdate,
    _admin=Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin: Update a social link."""
    social = db.query(SocialLink).filter(SocialLink.id == social_id).first()
    if not social:
        raise HTTPException(status_code=404, detail="Social link not found")

    updates = data.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(social, key, value)
    db.commit()
    db.refresh(social)
    return social.to_dict()


@router.delete("/{social_id}", status_code=204)
def delete_social(
    social_id: str,
    _admin=Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin: Delete a social link."""
    social = db.query(SocialLink).filter(SocialLink.id == social_id).first()
    if not social:
        raise HTTPException(status_code=404, detail="Social link not found")
    db.delete(social)
    db.commit()
    return None
