# TuberCool

AI-assisted TB diagnosis prediction & surveillance platform for Southeastern Nigeria.

## Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Recharts, React Query, Zustand
- **Backend**: FastAPI, uv, SQLAlchemy, Alembic, PostgreSQL
- **ML**: Rule-based scoring (WHO 2022 guidelines) → upgradeable to XGBoost/scikit-learn

---

## Quick Start

### 1. Backend

```bash
cd backend

# Copy env and fill in your database URL
cp .env.example .env

# Install deps (if not already done)
uv sync --system-certs

# Run migrations (once DB is running)
uv run alembic upgrade head

# Start server
uv run uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/api/docs

### 2. Frontend

```bash
cd frontend

# Install deps (if not already done)
pnpm install

# Start dev server
pnpm dev
```

App: http://localhost:3000

---

## Screens (29 pages → expands with patient/test IDs)

| Section | Pages |
|---------|-------|
| Auth | Login, Register |
| Dashboard | Overview with stats + charts |
| Patients | List, New, Detail |
| Tests | List, New, Detail |
| Predictions | List, Detail (with feature importance chart) |
| Analytics | Prevalence, Trends, Demographics, Risk Factors, By Hospital |
| Hospitals | List, New, Detail |
| Users | List, New, Detail |
| Reports | List, Generate, History |
| Settings | Profile, Security, Notifications, System |

## Roles

| Role | Access |
|------|--------|
| Super Admin | Everything |
| Hospital Admin | Own hospital + users |
| Clinician | Patient entry + tests + predictions |
| Researcher | Read-only analytics |

## Data Sources

- 6 University Teaching Hospitals — Southeastern Nigeria
- Abia, Anambra, Ebonyi, Enugu, Imo states
- 2010–2026

## ML Model

Currently ships a rule-based scorer using WHO 2022 diagnostic weights:
- GeneXpert result (highest weight)
- AFB smear (×3)
- AFB culture
- Mantoux (TST)
- IGRA
- CXR
- Risk factors (HIV, diabetes, previous TB, TB contact)

Replace `backend/app/ml/predictor.py` with a trained scikit-learn/XGBoost model when data is collected.
