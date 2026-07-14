from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.models import Hospital, User, UserRole
from app.schemas.clinical import HospitalCreate, HospitalUpdate, HospitalOut
from app.api.v1.endpoints.auth import get_current_active_user, require_roles

router = APIRouter()


@router.get("/", response_model=List[HospitalOut])
def list_hospitals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return db.query(Hospital).filter(Hospital.is_active == True).all()


@router.post("/", response_model=HospitalOut)
def create_hospital(
    hosp_in: HospitalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN)),
):
    hosp = Hospital(**hosp_in.model_dump())
    db.add(hosp)
    db.commit()
    db.refresh(hosp)
    return hosp


@router.get("/{hospital_id}", response_model=HospitalOut)
def get_hospital(
    hospital_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    hosp = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hosp:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return hosp


@router.put("/{hospital_id}", response_model=HospitalOut)
def update_hospital(
    hospital_id: str,
    hosp_in: HospitalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN)),
):
    hosp = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hosp:
        raise HTTPException(status_code=404, detail="Hospital not found")
    for field, value in hosp_in.model_dump(exclude_unset=True).items():
        setattr(hosp, field, value)
    db.commit()
    db.refresh(hosp)
    return hosp
