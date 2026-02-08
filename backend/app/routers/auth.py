from fastapi import APIRouter, Response, HTTPException, Depends
from itsdangerous import URLSafeTimedSerializer

from app.config import get_settings
from app.schemas import LoginRequest
from app.middleware.auth import require_admin

router = APIRouter(prefix="/api/auth", tags=["auth"])
settings = get_settings()
serializer = URLSafeTimedSerializer(settings.SECRET_KEY)


@router.post("/login")
def login(data: LoginRequest, response: Response):
    """Validate master password and set a signed session cookie."""
    if data.password != settings.ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid password")

    token = serializer.dumps({"role": "admin"})
    response.set_cookie(
        key="session",
        value=token,
        httponly=True,
        samesite="lax",
        max_age=60 * 60 * 24,  # 24 hours
    )
    return {"status": "ok"}


@router.post("/logout")
def logout(response: Response):
    """Clear the session cookie."""
    response.delete_cookie("session")
    return {"status": "ok"}


@router.get("/me")
def me(_admin=Depends(require_admin)):
    """Check if the current session is valid."""
    return {"role": "admin"}
