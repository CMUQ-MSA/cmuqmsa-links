import os
import re
import uuid
import shutil
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import FileResponse

from app.middleware.auth import require_admin

router = APIRouter(prefix="/api/uploads", tags=["uploads"])

UPLOAD_DIR = "/app/data/uploads"
ALLOWED_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg",  # images
    ".pdf",                                              # documents
    ".ico",                                              # favicon
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def _ensure_dir():
    os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("")
async def upload_file(
    file: UploadFile = File(...),
    _admin=Depends(require_admin),
):
    """Admin: Upload an image, PDF, or other file. Returns the URL path."""
    _ensure_dir()

    # Validate extension
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{ext}' not allowed. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    # Validate size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10 MB)")

    # Save with a unique prefix + sanitised original name
    original = os.path.splitext(file.filename or "file")[0]
    # Keep only safe chars: letters, digits, hyphens, underscores
    safe_name = re.sub(r"[^\w\-]", "_", original).strip("_")[:80] or "file"
    short_id = uuid.uuid4().hex[:8]
    filename = f"{short_id}_{safe_name}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(contents)

    return {"url": f"/api/uploads/{filename}", "filename": filename}


def _safe_path(filename: str) -> str:
    """Resolve a filename to a safe path within UPLOAD_DIR. Rejects traversal."""
    if ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")
    filepath = os.path.join(UPLOAD_DIR, filename)
    # Belt-and-suspenders: verify it's still inside UPLOAD_DIR
    if not os.path.abspath(filepath).startswith(os.path.abspath(UPLOAD_DIR)):
        raise HTTPException(status_code=400, detail="Invalid filename")
    return filepath


@router.get("/{filename}")
async def serve_file(filename: str):
    """Public: Serve an uploaded file."""
    filepath = _safe_path(filename)
    if not os.path.isfile(filepath):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(filepath)


@router.delete("/{filename}", status_code=204)
async def delete_file(filename: str, _admin=Depends(require_admin)):
    """Admin: Delete an uploaded file."""
    filepath = _safe_path(filename)
    if os.path.isfile(filepath):
        os.remove(filepath)
    return None


@router.get("")
async def list_files(_admin=Depends(require_admin)):
    """Admin: List all uploaded files."""
    _ensure_dir()
    files = []
    for f in os.listdir(UPLOAD_DIR):
        filepath = os.path.join(UPLOAD_DIR, f)
        if os.path.isfile(filepath):
            # Extract display name: strip "shortid_" prefix
            parts = f.split("_", 1)
            display = parts[1] if len(parts) > 1 else f
            files.append({
                "filename": f,
                "display_name": display,
                "url": f"/api/uploads/{f}",
                "size": os.path.getsize(filepath),
            })
    return sorted(files, key=lambda x: x["display_name"].lower())

