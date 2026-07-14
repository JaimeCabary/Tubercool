from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Optional

from app.core.database import get_db
from app.models.models import Patient, TestResult, Prediction, Hospital, TBStatus
from app.api.v1.endpoints.auth import get_current_active_user
from app.models.models import User

router = APIRouter()


@router.get("/overview")
def get_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    total_patients = db.query(Patient).count()
    total_tests = db.query(TestResult).count()
    positive_cases = db.query(TestResult).filter(
        TestResult.tb_status == TBStatus.POSITIVE
    ).count()
    total_predictions = db.query(Prediction).count()
    hospitals = db.query(Hospital).filter(Hospital.is_active == True).count()

    positivity_rate = (positive_cases / total_tests * 100) if total_tests > 0 else 0

    return {
        "total_patients": total_patients,
        "total_tests": total_tests,
        "positive_cases": positive_cases,
        "positivity_rate": round(positivity_rate, 2),
        "total_predictions": total_predictions,
        "active_hospitals": hospitals,
    }


@router.get("/prevalence-by-year")
def prevalence_by_year(
    hospital_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = db.query(
        extract("year", TestResult.test_date).label("year"),
        func.count(TestResult.id).label("total"),
        func.sum(
            func.cast(TestResult.tb_status == TBStatus.POSITIVE, db.bind.dialect.dbapi.INTEGER if hasattr(db.bind, 'dialect') else int)
        ).label("positive"),
    ).group_by("year").order_by("year")

    results = []
    for row in query.all():
        total = row.total or 0
        positive = row.positive or 0
        results.append({
            "year": int(row.year),
            "total": total,
            "positive": positive,
            "rate": round(positive / total * 100, 2) if total > 0 else 0,
        })
    return results


@router.get("/by-hospital")
def by_hospital(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    hospitals = db.query(Hospital).filter(Hospital.is_active == True).all()
    result = []
    for h in hospitals:
        patients = db.query(Patient).filter(Patient.hospital_id == h.id).count()
        tests = db.query(TestResult).join(Patient).filter(Patient.hospital_id == h.id).count()
        positive = db.query(TestResult).join(Patient).filter(
            Patient.hospital_id == h.id,
            TestResult.tb_status == TBStatus.POSITIVE
        ).count()
        result.append({
            "hospital": h.name,
            "state": h.state,
            "patients": patients,
            "tests": tests,
            "positive": positive,
            "rate": round(positive / tests * 100, 2) if tests > 0 else 0,
        })
    return result


@router.get("/demographics")
def demographics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    from datetime import date
    from sqlalchemy import case

    patients = db.query(Patient).all()
    age_groups = {"0-14": 0, "15-24": 0, "25-44": 0, "45-64": 0, "65+": 0}
    gender_counts = {"male": 0, "female": 0, "other": 0}
    today = date.today()

    for p in patients:
        if p.gender:
            gender_counts[p.gender.value] = gender_counts.get(p.gender.value, 0) + 1
        if p.date_of_birth:
            age = (today - p.date_of_birth).days // 365
            if age < 15:
                age_groups["0-14"] += 1
            elif age < 25:
                age_groups["15-24"] += 1
            elif age < 45:
                age_groups["25-44"] += 1
            elif age < 65:
                age_groups["45-64"] += 1
            else:
                age_groups["65+"] += 1

    return {
        "age_groups": [{"group": k, "count": v} for k, v in age_groups.items()],
        "gender": [{"gender": k, "count": v} for k, v in gender_counts.items()],
    }


@router.get("/risk-factors")
def risk_factors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    total = db.query(Patient).count() or 1
    return {
        "hiv_positive": db.query(Patient).filter(Patient.hiv_status == "positive").count(),
        "diabetes": db.query(Patient).filter(Patient.diabetes == True).count(),
        "smoking": db.query(Patient).filter(Patient.smoking == True).count(),
        "alcohol": db.query(Patient).filter(Patient.alcohol == True).count(),
        "previous_tb": db.query(Patient).filter(Patient.previous_tb == True).count(),
        "tb_contact": db.query(Patient).filter(Patient.tb_contact == True).count(),
        "total_patients": total,
    }
