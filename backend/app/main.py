from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
import os

from app.db import engine, get_db, Base
from app.models import Meeting, Participant
from app.schemas import MeetingCreate, MeetingResponse, JoinRequest, ParticipantResponse
from app import services

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Zoom Clone API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_BASE_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.post("/api/meetings", response_model=MeetingResponse, status_code=201)
def create_meeting(meeting: MeetingCreate, db: Session = Depends(get_db)):
    """Create a new meeting (instant or scheduled)"""
    created = services.create_meeting(db, meeting, os.getenv("FRONTEND_BASE_URL", ""))
    return created

@app.get("/api/meetings/{meeting_id}", response_model=MeetingResponse)
def get_meeting(meeting_id: str, db: Session = Depends(get_db)):
    """Get meeting by ID"""
    meeting = services.get_meeting(db, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting

@app.get("/api/meetings/upcoming/list")
def list_upcoming(db: Session = Depends(get_db)):
    """Get upcoming meetings"""
    meetings = services.get_upcoming_meetings(db)
    return [MeetingResponse.from_orm(m) for m in meetings]

@app.get("/api/meetings/recent/list")
def list_recent(db: Session = Depends(get_db)):
    """Get recent meetings"""
    meetings = services.get_recent_meetings(db)
    return [MeetingResponse.from_orm(m) for m in meetings]

@app.post("/api/meetings/{meeting_id}/join", response_model=ParticipantResponse, status_code=201)
def join_meeting(meeting_id: str, join_req: JoinRequest, db: Session = Depends(get_db)):
    """Join a meeting by ID"""
    meeting = services.get_meeting(db, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    participant = services.add_participant(db, meeting.id, join_req.display_name)
    return participant

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
