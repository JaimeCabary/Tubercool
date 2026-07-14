from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.core.database import get_db
from app.models.models import Patient, User, UserRole
from app.schemas.clinical import PatientCreate, PatientUpdate, PatientOut
from app.api.v1.endpoints.auth import get_current_active_user, require_roles

router = APIRouter()


def generate_patient_id(db: Session) -> str:
    from datetime import datetime
    year = datetime.utcnow().year
    count = db.query(Patient).count() + 1
    return f"TBP-{year}-{count:04d}"


@router.get("/", response_model=List[PatientOut])
def list_patients(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    hospital_id: Optional[str] = None,
    state: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = db.query(Patient)
    if current_user.role == UserRole.HOSPITAL_ADMIN or current_user.role == UserRole.CLINICIAN:
        query = query.filter(Patient.hospital_id == current_user.hospital_id)
    elif hospital_id:
        query = query.filter(Patient.hospital_id == hospital_id)
    if search:
        query = query.filter(
            (Patient.first_name.ilike(f"%{search}%")) |
            (Patient.last_name.ilike(f"%{search}%")) |
            (Patient.patient_id.ilike(f"%{search}%"))
        )
    if state:
        query = query.filter(Patient.state == state)
    return query.offset(skip).limit(limit).all()


@router.post("/", response_model=PatientOut)
def create_patient(
    patient_in: PatientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    patient = Patient(
        **patient_in.model_dump(),
        patient_id=generate_patient_id(db),
        created_by_id=current_user.id,
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


@router.get("/{patient_id}", response_model=PatientOut)
def get_patient(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@router.put("/{patient_id}", response_model=PatientOut)
def update_patient(
    patient_id: str,
    patient_in: PatientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    for field, value in patient_in.model_dump(exclude_unset=True).items():
        setattr(patient, field, value)
    db.commit()
    db.refresh(patient)
    return patient


@router.delete("/{patient_id}")
def delete_patient(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN)),
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    patient.is_active = False
    db.commit()
    return {"message": "Patient archived"}
