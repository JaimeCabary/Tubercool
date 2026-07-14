import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.models import Prediction, TestResult, Patient, User
from app.schemas.clinical import PredictionRequest, PredictionOut
from app.api.v1.endpoints.auth import get_current_active_user
from app.ml.predictor import run_prediction

router = APIRouter()


@router.post("/", response_model=PredictionOut)
def create_prediction(
    req: PredictionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    # Fetch the test result
    test = db.query(TestResult).filter(TestResult.id == req.test_result_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test result not found")

    # Fetch the patient
    patient = db.query(Patient).filter(Patient.id == test.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    try:
        result = run_prediction(test=test, patient=patient, db=db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

    # Persist the prediction
    pred = Prediction(
        id=str(uuid.uuid4()),
        patient_id=patient.id,
        test_result_id=test.id,
        created_by_id=current_user.id,
        probability_positive=result["probability_positive"],
        probability_negative=result["probability_negative"],
        probability_mdr=result.get("probability_mdr", 0.0),
        confidence=result["confidence"],
        risk_level=result["risk_level"],
        recommendation=result["recommendation"],
        feature_importance=result["feature_importance"],
        model_version=result.get("model_version", "Bayesian-Ibegbulem-2026-v1"),
    )
    db.add(pred)
    db.commit()
    db.refresh(pred)
    return pred


@router.get("/", response_model=List[PredictionOut])
def list_predictions(
    patient_id: str = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = db.query(Prediction)
    if patient_id:
        query = query.filter(Prediction.patient_id == patient_id)
    return query.order_by(Prediction.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{prediction_id}", response_model=PredictionOut)
def get_prediction(
    prediction_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    pred = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return pred
