import io
import qrcode
from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
router = APIRouter(prefix="/api/qr", tags=["qr"])

DEFAULT_QR_COLOR = "#990000"


@router.get("")
def generate_qr(
    url: str = Query(..., description="The URL to encode"),
    color: str | None = Query(None, description="Hex fill color (optional)"),
):
    """Public: Generate a QR code PNG for any URL."""
    fill = color if color and color.startswith("#") and len(color) in (4, 7) else DEFAULT_QR_COLOR

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

    return StreamingResponse(
        buf,
        media_type="image/png",
        headers={"Cache-Control": "public, max-age=86400"},
    )
