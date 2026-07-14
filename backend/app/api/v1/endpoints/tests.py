from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.models.models import TestResult, Patient, User, UserRole
from app.schemas.clinical import TestResultCreate, TestResultUpdate, TestResultOut
from app.api.v1.endpoints.auth import get_current_active_user

router = APIRouter()


@router.get("/", response_model=List[TestResultOut])
def list_tests(
    patient_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = db.query(TestResult)
    if patient_id:
        query = query.filter(TestResult.patient_id == patient_id)
    return query.order_by(TestResult.created_at.desc()).offset(skip).limit(limit).all()


@router.post("/", response_model=TestResultOut)
def create_test(
    test_in: TestResultCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    patient = db.query(Patient).filter(Patient.id == test_in.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    test = TestResult(**test_in.model_dump())
    db.add(test)
    db.commit()
    db.refresh(test)
    return test


@router.get("/{test_id}", response_model=TestResultOut)
def get_test(
    test_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    test = db.query(TestResult).filter(TestResult.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test result not found")
    return test


@router.put("/{test_id}", response_model=TestResultOut)
def update_test(
    test_id: str,
    test_in: TestResultUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    test = db.query(TestResult).filter(TestResult.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test result not found")
    for field, value in test_in.model_dump(exclude_unset=True).items():
        setattr(test, field, value)
    db.commit()
    db.refresh(test)
    return test
