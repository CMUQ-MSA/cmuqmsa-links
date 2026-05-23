from fastapi import APIRouter, Response, HTTPException, Depends, Request
from itsdangerous import URLSafeTimedSerializer
import time

from app.config import get_settings
from app.schemas import LoginRequest
from app.middleware.auth import require_admin

router = APIRouter(prefix="/api/auth", tags=["auth"])
settings = get_settings()
serializer = URLSafeTimedSerializer(settings.SECRET_KEY)
LOGIN_ATTEMPTS: dict[str, tuple[int, float]] = {}
LOGIN_MAX_ATTEMPTS = 10
LOGIN_WINDOW_SECONDS = 15 * 60


def client_key(request: Request) -> str:
    return (
        request.headers.get("x-forwarded-for", "").split(",")[0].strip()
        or request.headers.get("x-real-ip")
        or "unknown"
    )


def check_login_rate_limit(request: Request) -> bool:
    key = client_key(request)
    now = time.time()
    count, reset_at = LOGIN_ATTEMPTS.get(key, (0, now + LOGIN_WINDOW_SECONDS))
    if now > reset_at:
        count, reset_at = 0, now + LOGIN_WINDOW_SECONDS
    if count >= LOGIN_MAX_ATTEMPTS:
        return False
    LOGIN_ATTEMPTS[key] = (count + 1, reset_at)
    return True


@router.post("/login")
def login(request: Request, data: LoginRequest, response: Response):
    """Validate master password and set a signed session cookie."""
    if not check_login_rate_limit(request):
        raise HTTPException(status_code=429, detail="Too many login attempts")

    if data.password != settings.ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid password")

    token = serializer.dumps({"role": "admin"})
    response.set_cookie(
        key="session",
        value=token,
        httponly=True,
        samesite="lax",
        secure=settings.USE_HTTPS,
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
