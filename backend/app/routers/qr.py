import io
import qrcode
from fastapi import APIRouter, Query, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.routers.config import _get_config

router = APIRouter(prefix="/api/qr", tags=["qr"])


@router.get("")
def generate_qr(
    url: str = Query(..., description="The URL to encode"),
    db: Session = Depends(get_db),
):
    """Public: Generate a QR code PNG for any URL."""
    config = _get_config(db)
    fill = config.get("primary_color", "#990000")

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=2,
    )
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(fill_color=fill, back_color="white")

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    return StreamingResponse(buf, media_type="image/png")
