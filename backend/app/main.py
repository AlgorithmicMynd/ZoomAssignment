from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
import os

from app.db import engine, get_db, Base
from app.models import Meeting, Participant
from app.schemas import MeetingCreate, MeetingResponse, JoinRequest, ParticipantResponse
from app import services

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Zoom Clone API", version="1.0.0")

# CORS — allow the frontend origin (and wildcard for dev)
_allowed_origins = [
    os.getenv("FRONTEND_BASE_URL", "http://localhost:3000"),
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health ──────────────────────────────────────────────────────────────
@app.get("/api/health")
def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


# ── Static sub-routes MUST come before /{meeting_id} ─────────────────
@app.get("/api/meetings/upcoming/list")
def list_upcoming(db: Session = Depends(get_db)):
    """Get all upcoming (future scheduled) meetings, ascending."""
    meetings = services.get_upcoming_meetings(db)
    return [MeetingResponse.model_validate(m) for m in meetings]


@app.get("/api/meetings/recent/list")
def list_recent(db: Session = Depends(get_db)):
    """Get recent meetings (ended or past scheduled, last 30 days), descending."""
    meetings = services.get_recent_meetings(db)
    return [MeetingResponse.model_validate(m) for m in meetings]


# ── CRUD ──────────────────────────────────────────────────────────────
@app.post("/api/meetings", response_model=MeetingResponse, status_code=201)
def create_meeting(meeting: MeetingCreate, db: Session = Depends(get_db)):
    """Create an instant or scheduled meeting."""
    base_url = os.getenv("FRONTEND_BASE_URL", "http://localhost:3000")
    created = services.create_meeting(db, meeting, base_url)
    return created


@app.get("/api/meetings/{meeting_id}", response_model=MeetingResponse)
def get_meeting(meeting_id: str, db: Session = Depends(get_db)):
    """Get meeting metadata by its public meeting_id."""
    meeting = services.get_meeting(db, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting


@app.post("/api/meetings/{meeting_id}/join", response_model=ParticipantResponse, status_code=201)
def join_meeting(meeting_id: str, join_req: JoinRequest, db: Session = Depends(get_db)):
    """Register display_name as a participant and return the participant record."""
    meeting = services.get_meeting(db, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    participant = services.add_participant(db, meeting.id, join_req.display_name)
    return participant


@app.post("/api/meetings/{meeting_id}/end", response_model=MeetingResponse)
def end_meeting(meeting_id: str, db: Session = Depends(get_db)):
    """Mark a meeting as ended (status = 'ended', records ended_at)."""
    meeting = services.get_meeting(db, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    updated = services.end_meeting(db, meeting_id)
    return updated


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
