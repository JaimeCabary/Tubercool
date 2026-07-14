from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.models import User, UserRole
from app.schemas.user import UserCreate, UserOut, UserUpdate
from app.core.security import get_password_hash
from app.api.v1.endpoints.auth import get_current_active_user, require_roles

router = APIRouter()


@router.get("/", response_model=List[UserOut])
def list_users(
    skip: int = 0,
    limit: int = 50,
    hospital_id: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN)),
):
    query = db.query(User)
    if current_user.role == UserRole.HOSPITAL_ADMIN:
        query = query.filter(User.hospital_id == current_user.hospital_id)
    elif hospital_id:
        query = query.filter(User.hospital_id == hospital_id)
    return query.offset(skip).limit(limit).all()


@router.post("/", response_model=UserOut)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN)),
):
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        **{k: v for k, v in user_in.model_dump().items() if k != "password"},
        hashed_password=get_password_hash(user_in.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/{user_id}", response_model=UserOut)
def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/{user_id}", response_model=UserOut)
def update_user(
    user_id: str,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN)),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for field, value in user_in.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user
