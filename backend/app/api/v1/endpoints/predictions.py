from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.models import Prediction, User
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
    try:
        pred = run_prediction(
            patient_id=req.patient_id,
            test_result_id=req.test_result_id,
            db=db,
            created_by_id=current_user.id,
        )
        return pred
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


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
