import enum
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Boolean, DateTime, Enum, ForeignKey,
    Float, Integer, Text, JSON, Date
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class UserRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    HOSPITAL_ADMIN = "hospital_admin"
    CLINICIAN = "clinician"
    RESEARCHER = "researcher"


class Gender(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class TestStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TBStatus(str, enum.Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    INDETERMINATE = "indeterminate"
    PENDING = "pending"


class HIVStatus(str, enum.Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    UNKNOWN = "unknown"


# ─── Hospital ──────────────────────────────────────────────────────────────────

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False, unique=True)
    code = Column(String, unique=True)
    address = Column(String)
    state = Column(String)
    lga = Column(String)
    phone = Column(String)
    email = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    users = relationship("User", back_populates="hospital")
    patients = relationship("Patient", back_populates="hospital")


# ─── User ──────────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    phone = Column(String)
    role = Column(Enum(UserRole), default=UserRole.CLINICIAN)
    hospital_id = Column(String, ForeignKey("hospitals.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    hospital = relationship("Hospital", back_populates="users")
    patients = relationship("Patient", back_populates="created_by")
    predictions = relationship("Prediction", back_populates="created_by")


# ─── Patient ───────────────────────────────────────────────────────────────────

class Patient(Base):
    __tablename__ = "patients"

    id = Column(String, primary_key=True, default=gen_uuid)
    patient_id = Column(String, unique=True, nullable=False)  # e.g. TBP-2024-001
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    date_of_birth = Column(Date)
    gender = Column(Enum(Gender))
    phone = Column(String)
    address = Column(String)
    state = Column(String)
    lga = Column(String)
    occupation = Column(String)
    education_level = Column(String)
    hiv_status = Column(Enum(HIVStatus), default=HIVStatus.UNKNOWN)
    diabetes = Column(Boolean, default=False)
    smoking = Column(Boolean, default=False)
    alcohol = Column(Boolean, default=False)
    previous_tb = Column(Boolean, default=False)
    tb_contact = Column(Boolean, default=False)
    hospital_id = Column(String, ForeignKey("hospitals.id"))
    created_by_id = Column(String, ForeignKey("users.id"))
    is_active = Column(Boolean, default=True)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    hospital = relationship("Hospital", back_populates="patients")
    created_by = relationship("User", back_populates="patients")
    test_results = relationship("TestResult", back_populates="patient")
    predictions = relationship("Prediction", back_populates="patient")


# ─── TestResult ────────────────────────────────────────────────────────────────

class TestResult(Base):
    __tablename__ = "test_results"

    id = Column(String, primary_key=True, default=gen_uuid)
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    test_date = Column(Date, nullable=False)
    status = Column(Enum(TestStatus), default=TestStatus.PENDING)

    # Sputum smear / AFB
    afb_smear_1 = Column(String)   # negative, scanty, 1+, 2+, 3+
    afb_smear_2 = Column(String)
    afb_smear_3 = Column(String)
    afb_culture = Column(String)   # negative, positive, contaminated

    # GeneXpert / Xpert MTB/RIF
    genexpert_result = Column(String)   # MTB not detected, MTB detected
    genexpert_rif_resistance = Column(String)  # detected, not detected, indeterminate
    genexpert_ct_value = Column(Float)

    # Mantoux (TST)
    mantoux_result_mm = Column(Float)   # induration in mm
    mantoux_interpretation = Column(String)  # negative, positive

    # Chest X-ray
    cxr_done = Column(Boolean, default=False)
    cxr_findings = Column(Text)
    cxr_result = Column(String)  # normal, abnormal
    cxr_file_url = Column(String)

    # IGRA
    igra_result = Column(String)  # negative, positive, indeterminate

    # Drug Sensitivity
    dst_isoniazid = Column(String)    # sensitive, resistant
    dst_rifampicin = Column(String)
    dst_ethambutol = Column(String)
    dst_pyrazinamide = Column(String)
    dst_streptomycin = Column(String)

    # Final TB status
    tb_status = Column(Enum(TBStatus), default=TBStatus.PENDING)
    tb_type = Column(String)  # pulmonary, extra-pulmonary, MDR-TB, XDR-TB

    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    patient = relationship("Patient", back_populates="test_results")
    predictions = relationship("Prediction", back_populates="test_result")


# ─── Prediction ────────────────────────────────────────────────────────────────

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String, primary_key=True, default=gen_uuid)
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    test_result_id = Column(String, ForeignKey("test_results.id"), nullable=True)
    created_by_id = Column(String, ForeignKey("users.id"))

    model_version = Column(String)
    probability_positive = Column(Float)  # 0.0 – 1.0
    probability_negative = Column(Float)
    prediction = Column(String)   # positive, negative, indeterminate
    confidence = Column(String)   # high, medium, low
    feature_importance = Column(JSON)  # {feature: weight}
    input_features = Column(JSON)

    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="predictions")
    test_result = relationship("TestResult", back_populates="predictions")
    created_by = relationship("User", back_populates="predictions")
