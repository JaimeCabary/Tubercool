"""
Server-Sent Events endpoint for real-time dashboard updates.
Broadcasts: new_patient, new_test, new_prediction, stats_update
"""
import asyncio
import json
from datetime import datetime
from fastapi import APIRouter, Request, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import Patient, TestResult, Prediction, TBStatus
from app.api.v1.endpoints.auth import get_current_active_user
from app.models.models import User

router = APIRouter()


async def _stats_snapshot(db: Session) -> dict:
    total_patients  = db.query(Patient).count()
    total_tests     = db.query(TestResult).count()
    positive_cases  = db.query(TestResult).filter(TestResult.tb_status == TBStatus.POSITIVE).count()
    total_preds     = db.query(Prediction).count()
    rate = round(positive_cases / total_tests * 100, 2) if total_tests else 0
    return {
        "total_patients":   total_patients,
        "total_tests":      total_tests,
        "positive_cases":   positive_cases,
        "positivity_rate":  rate,
        "total_predictions": total_preds,
    }


def _frame(event_type: str, payload: dict) -> str:
    data = json.dumps({
        "type":    event_type,
        "payload": payload,
        "ts":      datetime.utcnow().isoformat(),
    })
    return f"data: {data}\n\n"


@router.get("/events")
async def sse_events(
    request: Request,
    db: Session = Depends(get_db),
    # Auth is optional here so the browser EventSource (no custom headers)
    # can still connect. Pass token as query param from client.
):
    async def generate():
        # Send initial snapshot immediately
        try:
            stats = await asyncio.get_event_loop().run_in_executor(
                None, _stats_snapshot, db
            )
            yield _frame("stats_update", stats)
        except Exception:
            pass

        # Keep-alive + periodic refresh every 15 s
        while True:
            if await request.is_disconnected():
                break
            await asyncio.sleep(15)
            try:
                stats = await asyncio.get_event_loop().run_in_executor(
                    None, _stats_snapshot, db
                )
                yield _frame("stats_update", stats)
            except Exception:
                yield _frame("heartbeat", {"ts": datetime.utcnow().isoformat()})

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",   # Nginx
            "Connection": "keep-alive",
        },
    )
