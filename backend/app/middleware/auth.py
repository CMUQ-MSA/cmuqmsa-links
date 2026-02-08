from fastapi import HTTPException, Request
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired

from app.config import get_settings

settings = get_settings()
serializer = URLSafeTimedSerializer(settings.SECRET_KEY)


def require_admin(request: Request):
    """Dependency: Verify the session cookie is a valid admin token."""
    token = request.cookies.get("session")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        data = serializer.loads(token, max_age=60 * 60 * 24)
    except (BadSignature, SignatureExpired):
        raise HTTPException(status_code=401, detail="Session expired or invalid")
    if data.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    return data
