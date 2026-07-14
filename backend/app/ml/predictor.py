"""
TB Diagnostic Predictor — Bayesian Inference Model
====================================================
Implements the Bayesian inference framework described in:

    Ibegbulem, C.R. (2026). Development and Integration of Bayesian Inference
    and Machine Learning Model for Prediction of Early Detection of
    Multidrug-Resistant Mycobacterium Tuberculosis. PhD Proposal,
    Federal University of Technology, Owerri (FUTO).

The posterior probability P(MTb+|evidence) is computed by sequentially
updating the prior (SE Nigeria baseline prevalence + risk-factor adjustment)
with each available diagnostic test using Bayes' theorem:

    PPV = [P(MTb+) × Sensitivity] /
          [P(MTb+) × Sensitivity + (1-P(MTb+)) × (1-Specificity)]

Sensitivity / specificity sources:
    - GeneXpert MTB/RIF: Abayneh & Teressa (2022)
    - Mantoux (≥10 mm): Nayak & Acharjya (2012)
    - IGRA QuantiFERON: Mitchell et al. (2021)
    - AFB Smear: Bayot, Mirza & Sharma (2023)
    - Chest X-ray: Joo et al. (2021)
    - AFB Culture: WHO 2022 reference standard

Bayesian equation: Webb & Sidebotham (2020) — BJA Education 20(6):208-213
SE Nigeria prevalence: Chukwuocha, Johnson & Aguoru (2024) — 21.3-22.1%
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional
from sqlalchemy.orm import Session

from app.models.models import TestResult, Patient, Prediction, TBStatus


# ---------------------------------------------------------------------------
# Test sensitivity / specificity (evidence-based)
# ---------------------------------------------------------------------------
_TEST_PARAMS: dict[str, dict] = {
    "genexpert_positive":   {"sens": 0.880, "spec": 0.980},
    "genexpert_negative":   {"sens": 0.880, "spec": 0.980},
    "afb_positive":         {"sens": 0.600, "spec": 0.980},
    "afb_negative":         {"sens": 0.600, "spec": 0.980},
    "afb_culture_positive": {"sens": 0.800, "spec": 0.990},
    "afb_culture_negative": {"sens": 0.800, "spec": 0.990},
    "mantoux_positive":     {"sens": 0.770, "spec": 0.660},
    "mantoux_negative":     {"sens": 0.770, "spec": 0.660},
    "igra_positive":        {"sens": 0.800, "spec": 0.970},
    "igra_negative":        {"sens": 0.800, "spec": 0.970},
    "cxr_positive":         {"sens": 0.870, "spec": 0.890},
    "cxr_negative":         {"sens": 0.870, "spec": 0.890},
}

# Mantoux positive threshold per WHO / Nayak & Acharjya (2012)
MANTOUX_POSITIVE_MM = 10

# SE Nigeria baseline TB prevalence among respiratory suspects
# Source: Chukwuocha, Johnson & Aguoru (2024) — 21.3–22.1%
SE_NIGERIA_BASE_PREVALENCE = 0.213


# ---------------------------------------------------------------------------
# Bayesian update — single test
# ---------------------------------------------------------------------------
def _bayesian_update(prior: float, sens: float, spec: float, positive: bool) -> float:
    """
    Single sequential Bayes update (Webb & Sidebotham, 2020).

    Positive test:
        posterior = (prior × sens) / [prior × sens + (1-prior) × (1-spec)]
    Negative test:
        posterior = (prior × (1-sens)) / [prior × (1-sens) + (1-prior) × spec]
    """
    if positive:
        num = prior * sens
        den = prior * sens + (1.0 - prior) * (1.0 - spec)
    else:
        num = prior * (1.0 - sens)
        den = prior * (1.0 - sens) + (1.0 - prior) * spec

    return num / den if den > 0 else prior


# ---------------------------------------------------------------------------
# Risk-factor prior adjustment (Table 3.2 of proposal)
# ---------------------------------------------------------------------------
def _compute_prior(
    hiv_status: Optional[str],
    has_diabetes: bool,
    previous_tb: bool,
    tb_contact: bool,
    crowded_living: bool = False,
    no_bcg: bool = False,
    age: Optional[int] = None,
) -> tuple[float, dict[str, float]]:
    """
    Start from SE Nigeria baseline prevalence and adjust upward for each
    confirmed risk factor.  Returns (adjusted_prior, contributions_dict).
    """
    prior = SE_NIGERIA_BASE_PREVALENCE
    contribs: dict[str, float] = {}

    if hiv_status and hiv_status.upper() == "POSITIVE":
        d = 0.25
        prior = min(prior + d, 0.95)
        contribs["HIV positive"] = d

    if has_diabetes:
        d = 0.10
        prior = min(prior + d, 0.95)
        contribs["Diabetes"] = d

    if previous_tb:
        d = 0.15
        prior = min(prior + d, 0.95)
        contribs["Previous TB"] = d

    if tb_contact:
        d = 0.20
        prior = min(prior + d, 0.95)
        contribs["TB close contact"] = d

    if crowded_living:
        d = 0.05
        prior = min(prior + d, 0.95)
        contribs["Crowded living / poor ventilation"] = d

    if no_bcg:
        d = 0.05
        prior = min(prior + d, 0.95)
        contribs["No BCG vaccination"] = d

    # Age 16–40 disproportionately affected in SE Nigeria (Chukwuocha et al., 2024)
    if age is not None and 16 <= age <= 40:
        d = 0.03
        prior = min(prior + d, 0.95)
        contribs["Age 16–40 (high-burden group)"] = d

    return prior, contribs


# ---------------------------------------------------------------------------
# AFB smear grade helper
# ---------------------------------------------------------------------------
def _afb_positive(grade: Optional[str]) -> Optional[bool]:
    if not grade:
        return None
    g = grade.upper().strip()
    if g == "NEGATIVE":
        return False
    if g in ("1+", "2+", "3+", "SCANTY", "+", "POSITIVE"):
        return True
    return None


# ---------------------------------------------------------------------------
# Main prediction entry point
# ---------------------------------------------------------------------------
def run_prediction(
    test: TestResult,
    patient: Patient,
    db: Session,
) -> dict:
    """
    Run Bayesian inference on a TestResult + Patient record.
    Returns a dict with all fields needed to populate a Prediction row.
    """
    steps: list[dict] = []
    feature_importance: dict[str, float] = {}

    # ── Prior from risk factors ──────────────────────────────────────────────
    age = None
    if patient.date_of_birth:
        from datetime import date
        age = (date.today() - patient.date_of_birth).days // 365

    prior, risk_contribs = _compute_prior(
        hiv_status=patient.hiv_status.value if patient.hiv_status else None,
        has_diabetes=bool(patient.has_diabetes),
        previous_tb=bool(patient.previous_tb),
        tb_contact=bool(patient.tb_contact),
        crowded_living=False,   # extend Patient model if needed
        no_bcg=False,
        age=age,
    )
    feature_importance.update(risk_contribs)
    steps.append({
        "step": "Prior — SE Nigeria prevalence + risk factors",
        "prior": SE_NIGERIA_BASE_PREVALENCE,
        "posterior": round(prior, 4),
        "components": risk_contribs,
    })

    posterior = prior

    # ── GeneXpert MTB/RIF ────────────────────────────────────────────────────
    gx = getattr(test, "genexpert_result", None)
    if gx and str(gx).upper() not in ("INVALID", "PENDING", ""):
        is_pos = str(gx).upper() == "POSITIVE"
        key = "genexpert_positive" if is_pos else "genexpert_negative"
        p = _TEST_PARAMS[key]
        pre = posterior
        posterior = _bayesian_update(posterior, p["sens"], p["spec"], is_pos)
        feature_importance["GeneXpert MTB/RIF"] = round(abs(posterior - pre), 4)
        steps.append({
            "step": f"GeneXpert ({gx})",
            "sensitivity": p["sens"], "specificity": p["spec"],
            "prior": round(pre, 4), "posterior": round(posterior, 4),
        })

    # ── AFB Smear (any positive across 3 specimens) ──────────────────────────
    grades = [
        _afb_positive(getattr(test, "afb_smear_1", None)),
        _afb_positive(getattr(test, "afb_smear_2", None)),
        _afb_positive(getattr(test, "afb_smear_3", None)),
    ]
    grades = [g for g in grades if g is not None]
    if grades:
        any_pos = any(grades)
        key = "afb_positive" if any_pos else "afb_negative"
        p = _TEST_PARAMS[key]
        pre = posterior
        posterior = _bayesian_update(posterior, p["sens"], p["spec"], any_pos)
        feature_importance["AFB Smear Microscopy"] = round(abs(posterior - pre), 4)
        steps.append({
            "step": f"AFB Smear ({'Positive' if any_pos else 'Negative'})",
            "sensitivity": p["sens"], "specificity": p["spec"],
            "prior": round(pre, 4), "posterior": round(posterior, 4),
        })

    # ── AFB Culture ──────────────────────────────────────────────────────────
    culture = getattr(test, "afb_culture", None)
    if culture and str(culture).upper() in ("POSITIVE", "NEGATIVE"):
        is_pos = str(culture).upper() == "POSITIVE"
        key = "afb_culture_positive" if is_pos else "afb_culture_negative"
        p = _TEST_PARAMS[key]
        pre = posterior
        posterior = _bayesian_update(posterior, p["sens"], p["spec"], is_pos)
        feature_importance["AFB Culture"] = round(abs(posterior - pre), 4)
        steps.append({
            "step": f"AFB Culture ({culture})",
            "sensitivity": p["sens"], "specificity": p["spec"],
            "prior": round(pre, 4), "posterior": round(posterior, 4),
        })

    # ── Mantoux TST ──────────────────────────────────────────────────────────
    mantoux = getattr(test, "mantoux_mm", None)
    if mantoux is not None:
        is_pos = float(mantoux) >= MANTOUX_POSITIVE_MM
        key = "mantoux_positive" if is_pos else "mantoux_negative"
        p = _TEST_PARAMS[key]
        pre = posterior
        posterior = _bayesian_update(posterior, p["sens"], p["spec"], is_pos)
        feature_importance["Mantoux TST"] = round(abs(posterior - pre), 4)
        steps.append({
            "step": f"Mantoux TST ({mantoux} mm — {'≥' if is_pos else '<'}{MANTOUX_POSITIVE_MM} mm)",
            "sensitivity": p["sens"], "specificity": p["spec"],
            "prior": round(pre, 4), "posterior": round(posterior, 4),
        })

    # ── IGRA / QuantiFERON Gold Plus ─────────────────────────────────────────
    igra = getattr(test, "igra_result", None)
    if igra and str(igra).upper() in ("POSITIVE", "NEGATIVE"):
        is_pos = str(igra).upper() == "POSITIVE"
        key = "igra_positive" if is_pos else "igra_negative"
        p = _TEST_PARAMS[key]
        pre = posterior
        posterior = _bayesian_update(posterior, p["sens"], p["spec"], is_pos)
        feature_importance["IGRA / QuantiFERON"] = round(abs(posterior - pre), 4)
        steps.append({
            "step": f"IGRA ({igra})",
            "sensitivity": p["sens"], "specificity": p["spec"],
            "prior": round(pre, 4), "posterior": round(posterior, 4),
        })

    # ── Chest X-ray ──────────────────────────────────────────────────────────
    cxr = getattr(test, "cxr_result", None)
    if cxr and str(cxr).upper() not in ("PENDING", ""):
        cxr_str = str(cxr).upper()
        is_pos = cxr_str in ("ABNORMAL", "SUGGESTIVE")
        key = "cxr_positive" if is_pos else "cxr_negative"
        p = _TEST_PARAMS[key]
        pre = posterior
        posterior = _bayesian_update(posterior, p["sens"], p["spec"], is_pos)
        feature_importance["Chest X-ray"] = round(abs(posterior - pre), 4)
        steps.append({
            "step": f"Chest X-ray ({cxr})",
            "sensitivity": p["sens"], "specificity": p["spec"],
            "prior": round(pre, 4), "posterior": round(posterior, 4),
        })

    # ── MDR-TB probability ───────────────────────────────────────────────────
    mdr_flags: list[str] = []
    mdr_score = 0.0

    if getattr(test, "genexpert_rif_resistance", None):
        mdr_flags.append("GeneXpert: RIF resistance detected")
        mdr_score = max(mdr_score, 0.70)

    if getattr(test, "dst_rifampicin", None) == "RESISTANT":
        mdr_flags.append("DST: Rifampicin resistant")
        mdr_score = max(mdr_score, 0.85)

    if getattr(test, "dst_isoniazid", None) == "RESISTANT":
        mdr_flags.append("DST: Isoniazid resistant")
        mdr_score = max(mdr_score, 0.80)

    if patient.previous_tb:
        mdr_flags.append("Previous TB treatment history")
        mdr_score = min(mdr_score + 0.10, 1.0)

    prob_pos = round(min(max(posterior, 0.0), 1.0), 4)
    prob_mdr = round(min(prob_pos * mdr_score, 1.0), 4) if mdr_score > 0 else 0.0

    # ── Confidence ───────────────────────────────────────────────────────────
    lab_tests_used = len(steps) - 1   # exclude the prior step
    if lab_tests_used >= 3:
        confidence = "HIGH"
    elif lab_tests_used >= 1:
        confidence = "MEDIUM"
    else:
        confidence = "LOW"

    # ── Recommendation ───────────────────────────────────────────────────────
    if prob_pos >= 0.70:
        risk_level = "HIGH"
        if prob_mdr >= 0.50:
            recommendation = (
                "HIGH PROBABILITY OF MDR-TB. Immediate isolation required. "
                "Refer to Infectious Disease specialist. Initiate second-line DST "
                "panel and MDR-TB treatment per NTBLCP guidelines."
            )
        else:
            recommendation = (
                "HIGH PROBABILITY OF TB. Initiate standard first-line regimen "
                "(2HRZE / 4HR) immediately. Perform DST to exclude MDR-TB. "
                "Notify TB Programme Officer and register patient."
            )
    elif prob_pos >= 0.40:
        risk_level = "MEDIUM"
        recommendation = (
            "MODERATE TB PROBABILITY. Collect additional sputum specimens for "
            "repeat GeneXpert or culture. Correlate with clinical symptoms and "
            "contact history before committing to a treatment decision."
        )
    else:
        risk_level = "LOW"
        recommendation = (
            "LOW TB PROBABILITY based on available evidence. "
            "Monitor if symptoms persist; consider alternative differential diagnoses. "
            "Reassess with additional testing in 4–6 weeks if clinical suspicion remains."
        )

    return {
        "probability_positive": prob_pos,
        "probability_negative": round(1.0 - prob_pos, 4),
        "probability_mdr": prob_mdr,
        "confidence": confidence,
        "risk_level": risk_level,
        "recommendation": recommendation,
        "feature_importance": feature_importance,
        "bayesian_steps": steps,
        "mdr_flags": mdr_flags,
        "model_version": "Bayesian-Ibegbulem-2026-v1",
    }
