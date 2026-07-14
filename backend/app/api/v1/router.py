from fastapi import APIRouter
from app.api.v1.endpoints import auth, patients, tests, predictions, analytics, hospitals, users, events, webauthn

api_router = APIRouter()

api_router.include_router(auth.router,        prefix="/auth",        tags=["Auth"])
api_router.include_router(patients.router,    prefix="/patients",    tags=["Patients"])
api_router.include_router(tests.router,       prefix="/tests",       tags=["Tests"])
api_router.include_router(predictions.router, prefix="/predictions", tags=["Predictions"])
api_router.include_router(analytics.router,   prefix="/analytics",   tags=["Analytics"])
api_router.include_router(hospitals.router,   prefix="/hospitals",   tags=["Hospitals"])
api_router.include_router(users.router,       prefix="/users",       tags=["Users"])
api_router.include_router(events.router,    prefix="/stream",    tags=["Stream"])
api_router.include_router(webauthn.router,  prefix="/webauthn",  tags=["WebAuthn"])
