from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Link
from app.schemas import LinkCreate, LinkUpdate, LinkReorder
from app.middleware.auth import require_admin

router = APIRouter(prefix="/api/links", tags=["links"])


@router.get("")
def get_links(db: Session = Depends(get_db)):
    """Public: Get all visible links, ordered by position."""
    links = db.query(Link).filter(Link.visible == True).order_by(Link.position).all()
    return [link.to_dict() for link in links]


@router.get("/all")
def get_all_links(_admin=Depends(require_admin), db: Session = Depends(get_db)):
    """Admin: Get ALL links (including hidden), ordered by position."""
    links = db.query(Link).order_by(Link.position).all()
    return [link.to_dict() for link in links]


@router.put("/reorder/batch")
def reorder_links(data: LinkReorder, _admin=Depends(require_admin), db: Session = Depends(get_db)):
    """Admin: Reorder all links by providing an ordered list of IDs."""
    for index, link_id in enumerate(data.ordered_ids):
        link = db.query(Link).filter(Link.id == link_id).first()
        if link:
            link.position = index
    db.commit()
    return {"status": "ok"}


@router.post("/{link_id}/click")
def track_click(link_id: str, db: Session = Depends(get_db)):
    """Public: Increment click counter for a link."""
    link = db.query(Link).filter(Link.id == link_id).first()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    link.clicks = (link.clicks or 0) + 1
    db.commit()
    return {"clicks": link.clicks}


@router.post("", status_code=201)
def create_link(data: LinkCreate, _admin=Depends(require_admin), db: Session = Depends(get_db)):
    """Admin: Create a new link."""
    max_pos = db.query(Link.position).order_by(Link.position.desc()).first()
    next_pos = (max_pos[0] + 1) if max_pos else 0

    link = Link(
        title=data.title,
        url=data.url,
        description=data.description,
        icon=data.icon,
        thumbnail_url=data.thumbnail_url,
        link_type=data.link_type,
        visible=data.visible,
        position=next_pos,
    )
    db.add(link)
    db.commit()
    db.refresh(link)
    return link.to_dict()


@router.put("/{link_id}")
def update_link(link_id: str, data: LinkUpdate, _admin=Depends(require_admin), db: Session = Depends(get_db)):
    """Admin: Update an existing link."""
    link = db.query(Link).filter(Link.id == link_id).first()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(link, key, value)

    db.commit()
    db.refresh(link)
    return link.to_dict()


@router.delete("/{link_id}", status_code=204)
def delete_link(link_id: str, _admin=Depends(require_admin), db: Session = Depends(get_db)):
    """Admin: Delete a link."""
    link = db.query(Link).filter(Link.id == link_id).first()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    db.delete(link)
    db.commit()
    return None
