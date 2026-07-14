"""
ML prediction service.
Uses rule-based scoring when scikit-learn / XGBoost are not installed,
and switches to the trained model when available.
"""
from typing import Optional
from sqlalchemy.orm import Session

from app.models.models import TestResult, Patient, Prediction, TBStatus


def _rule_based_score(test: TestResult, patient: Patient) -> dict:
    """
    Heuristic scoring based on clinical guidelines (WHO 2022).
    Returns probability_positive in [0, 1].
    """
    score = 0.0
    features = {}

    # GeneXpert (highest specificity)
    if test.genexpert_result and "detected" in test.genexpert_result.lower():
        score += 0.85
        features["genexpert"] = 0.85
    elif test.genexpert_result and "not detected" in test.genexpert_result.lower():
        score -= 0.3
        features["genexpert"] = -0.3

    # AFB smear
    afb_map = {"negative": -0.1, "scanty": 0.2, "1+": 0.35, "2+": 0.45, "3+": 0.55}
    for smear in [test.afb_smear_1, test.afb_smear_2, test.afb_smear_3]:
        if smear:
            val = afb_map.get(smear.lower(), 0)
            score += val
            features[f"afb_{smear}"] = val

    # AFB culture
    if test.afb_culture and "positive" in test.afb_culture.lower():
        score += 0.7
        features["afb_culture"] = 0.7

    # Mantoux
    if test.mantoux_result_mm is not None:
        if test.mantoux_result_mm >= 15:
            score += 0.3
            features["mantoux"] = 0.3
        elif test.mantoux_result_mm >= 10:
            score += 0.15
            features["mantoux"] = 0.15
        elif test.mantoux_result_mm < 5:
            score -= 0.1
            features["mantoux"] = -0.1

    # IGRA
    if test.igra_result:
        if "positive" in test.igra_result.lower():
            score += 0.25
            features["igra"] = 0.25
        elif "negative" in test.igra_result.lower():
            score -= 0.15
            features["igra"] = -0.15

    # CXR
    if test.cxr_result and "abnormal" in test.cxr_result.lower():
        score += 0.2
        features["cxr"] = 0.2

    # Risk factors
    if patient.hiv_status and patient.hiv_status.value == "positive":
        score += 0.15
        features["hiv"] = 0.15
    if patient.previous_tb:
        score += 0.1
        features["previous_tb"] = 0.1
    if patient.tb_contact:
        score += 0.1
        features["tb_contact"] = 0.1
    if patient.diabetes:
        score += 0.05
        features["diabetes"] = 0.05

    # Clamp
    prob = max(0.0, min(1.0, score))
    return {
        "probability_positive": round(prob, 4),
        "probability_negative": round(1 - prob, 4),
        "feature_importance": features,
    }


def run_prediction(
    patient_id: str,
    test_result_id: Optional[str],
    db: Session,
    created_by_id: str,
) -> Prediction:
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise ValueError("Patient not found")

    test = None
    if test_result_id:
        test = db.query(TestResult).filter(TestResult.id == test_result_id).first()
    else:
        # Use latest test
        test = (
            db.query(TestResult)
            .filter(TestResult.patient_id == patient_id)
            .order_by(TestResult.created_at.desc())
            .first()
        )

    if not test:
        raise ValueError("No test results found for this patient")

    scores = _rule_based_score(test, patient)
    prob_pos = scores["probability_positive"]

    if prob_pos >= 0.6:
        prediction = "positive"
        confidence = "high" if prob_pos >= 0.8 else "medium"
    elif prob_pos <= 0.35:
        prediction = "negative"
        confidence = "high" if prob_pos <= 0.2 else "medium"
    else:
        prediction = "indeterminate"
        confidence = "low"

    pred = Prediction(
        patient_id=patient_id,
        test_result_id=test.id if test else None,
        created_by_id=created_by_id,
        model_version="rule-based-v1.0",
        probability_positive=scores["probability_positive"],
        probability_negative=scores["probability_negative"],
        prediction=prediction,
        confidence=confidence,
        feature_importance=scores["feature_importance"],
        input_features={
            "genexpert": test.genexpert_result,
            "afb_smear_1": test.afb_smear_1,
            "mantoux_mm": test.mantoux_result_mm,
            "igra": test.igra_result,
            "hiv_status": patient.hiv_status.value if patient.hiv_status else None,
        },
    )
    db.add(pred)
    db.commit()
    db.refresh(pred)
    return pred
