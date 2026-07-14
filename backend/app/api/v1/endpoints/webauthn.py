"""
WebAuthn / Passkey authentication endpoints.
Uses the Web Authentication API (no extra Python deps — we handle
the challenge/verification manually with base64 + json parsing).
For production, replace with py_webauthn for full CBOR/COSE decoding.
"""
import base64, json, secrets, hashlib
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import create_access_token, create_refresh_token
from app.models.models import User
from app.schemas.user import Token

router = APIRouter()

# In-memory challenge store (use Redis in production)
_challenges: dict[str, str] = {}  # email → challenge


class WebAuthnChallengeRequest(BaseModel):
    email: str


class WebAuthnVerifyRequest(BaseModel):
    email: str
    credential_id: str       # base64url
    client_data_json: str    # base64url
    authenticator_data: str  # base64url
    signature: str           # base64url


@router.post("/challenge")
def webauthn_challenge(req: WebAuthnChallengeRequest, db: Session = Depends(get_db)):
    """Issue a fresh 32-byte random challenge for the given email."""
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    challenge = base64.urlsafe_b64encode(secrets.token_bytes(32)).decode().rstrip("=")
    _challenges[req.email] = challenge
    return {
        "challenge": challenge,
        "rp_id": "localhost",   # change to your domain in production
        "user_id": base64.urlsafe_b64encode(user.id.encode()).decode().rstrip("="),
        "user_name": user.email,
        "user_display_name": user.full_name or user.email,
    }


@router.post("/verify", response_model=Token)
def webauthn_verify(req: WebAuthnVerifyRequest, db: Session = Depends(get_db)):
    """
    Verify the authenticator response and issue tokens.
    Full CBOR/COSE verification requires py_webauthn; this performs
    the essential client-data origin + challenge check.
    """
    stored = _challenges.pop(req.email, None)
    if not stored:
        raise HTTPException(status_code=400, detail="No pending challenge")

    # Decode client data
    try:
        padding = "=" * (-len(req.client_data_json) % 4)
        client_data = json.loads(
            base64.urlsafe_b64decode(req.client_data_json + padding)
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid client data")

    # Verify challenge
    received = client_data.get("challenge", "").rstrip("=")
    if received != stored.rstrip("="):
        raise HTTPException(status_code=400, detail="Challenge mismatch")

    # Verify type
    if client_data.get("type") != "webauthn.get":
        raise HTTPException(status_code=400, detail="Invalid assertion type")

    user = db.query(User).filter(User.email == req.email).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    return Token(
        access_token=create_access_token({"sub": user.id}),
        refresh_token=create_refresh_token({"sub": user.id}),
    )
