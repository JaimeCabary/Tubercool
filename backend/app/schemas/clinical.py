from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from app.models.models import Gender, TBStatus, TestStatus, HIVStatus


# ─── Patient schemas ──────────────────────────────────────────────────────────

class PatientBase(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: Optional[date] = None
    gender: Optional[Gender] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    state: Optional[str] = None
    lga: Optional[str] = None
    occupation: Optional[str] = None
    education_level: Optional[str] = None
    hiv_status: Optional[HIVStatus] = HIVStatus.UNKNOWN
    diabetes: bool = False
    smoking: bool = False
    alcohol: bool = False
    previous_tb: bool = False
    tb_contact: bool = False
    hospital_id: str
    notes: Optional[str] = None


class PatientCreate(PatientBase):
    pass


class PatientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[Gender] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    state: Optional[str] = None
    lga: Optional[str] = None
    occupation: Optional[str] = None
    hiv_status: Optional[HIVStatus] = None
    diabetes: Optional[bool] = None
    smoking: Optional[bool] = None
    alcohol: Optional[bool] = None
    previous_tb: Optional[bool] = None
    tb_contact: Optional[bool] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class PatientOut(PatientBase):
    id: str
    patient_id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ─── TestResult schemas ───────────────────────────────────────────────────────

class TestResultBase(BaseModel):
    patient_id: str
    test_date: date
    afb_smear_1: Optional[str] = None
    afb_smear_2: Optional[str] = None
    afb_smear_3: Optional[str] = None
    afb_culture: Optional[str] = None
    genexpert_result: Optional[str] = None
    genexpert_rif_resistance: Optional[str] = None
    genexpert_ct_value: Optional[float] = None
    mantoux_result_mm: Optional[float] = None
    mantoux_interpretation: Optional[str] = None
    cxr_done: bool = False
    cxr_findings: Optional[str] = None
    cxr_result: Optional[str] = None
    igra_result: Optional[str] = None
    dst_isoniazid: Optional[str] = None
    dst_rifampicin: Optional[str] = None
    dst_ethambutol: Optional[str] = None
    dst_pyrazinamide: Optional[str] = None
    dst_streptomycin: Optional[str] = None
    tb_status: TBStatus = TBStatus.PENDING
    tb_type: Optional[str] = None
    notes: Optional[str] = None


class TestResultCreate(TestResultBase):
    pass


class TestResultUpdate(BaseModel):
    afb_smear_1: Optional[str] = None
    afb_smear_2: Optional[str] = None
    afb_smear_3: Optional[str] = None
    afb_culture: Optional[str] = None
    genexpert_result: Optional[str] = None
    genexpert_rif_resistance: Optional[str] = None
    genexpert_ct_value: Optional[float] = None
    mantoux_result_mm: Optional[float] = None
    mantoux_interpretation: Optional[str] = None
    cxr_done: Optional[bool] = None
    cxr_findings: Optional[str] = None
    cxr_result: Optional[str] = None
    igra_result: Optional[str] = None
    dst_isoniazid: Optional[str] = None
    dst_rifampicin: Optional[str] = None
    dst_ethambutol: Optional[str] = None
    dst_pyrazinamide: Optional[str] = None
    dst_streptomycin: Optional[str] = None
    tb_status: Optional[TBStatus] = None
    tb_type: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[TestStatus] = None


class TestResultOut(TestResultBase):
    id: str
    status: TestStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ─── Prediction schemas ───────────────────────────────────────────────────────

class PredictionRequest(BaseModel):
    patient_id: str
    test_result_id: Optional[str] = None


class PredictionOut(BaseModel):
    id: str
    patient_id: str
    test_result_id: Optional[str] = None
    model_version: Optional[str] = None
    probability_positive: Optional[float] = None
    probability_negative: Optional[float] = None
    prediction: Optional[str] = None
    confidence: Optional[str] = None
    feature_importance: Optional[dict] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Hospital schemas ─────────────────────────────────────────────────────────

class HospitalBase(BaseModel):
    name: str
    code: Optional[str] = None
    address: Optional[str] = None
    state: Optional[str] = None
    lga: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None


class HospitalCreate(HospitalBase):
    pass


class HospitalUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    state: Optional[str] = None
    lga: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    is_active: Optional[bool] = None


class HospitalOut(HospitalBase):
    id: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Analytics schemas ────────────────────────────────────────────────────────

class PrevalenceData(BaseModel):
    year: int
    hospital: str
    state: str
    total_cases: int
    positive_cases: int
    negative_cases: int
    prevalence_rate: float


class TrendData(BaseModel):
    period: str
    total_tested: int
    total_positive: int
    positivity_rate: float


class DemographicsData(BaseModel):
    age_group: str
    male: int
    female: int
    total: int
    positive_rate: float
