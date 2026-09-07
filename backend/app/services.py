from sqlalchemy.orm import Session
from app.models import Meeting, Participant
from app.schemas import MeetingCreate
from datetime import datetime, timedelta
import random
import string

def generate_meeting_id():
    """Generate a unique meeting ID (format: XXX-XXX-XXX)"""
    digits = ''.join(random.choices(string.digits, k=9))
    return f"{digits[:3]}-{digits[3:6]}-{digits[6:9]}"

def create_meeting(db: Session, meeting_data: MeetingCreate, base_url: str):
    """Create a new meeting"""
    meeting_id = generate_meeting_id()
    invite_link = f"/meeting/{meeting_id}"

    title = meeting_data.title or f"Meeting"
    status = "scheduled" if meeting_data.scheduled_at else "active"

    meeting = Meeting(
        meeting_id=meeting_id,
        title=title,
        description=meeting_data.description,
        scheduled_at=meeting_data.scheduled_at,
        duration_minutes=meeting_data.duration_minutes,
        invite_link=invite_link,
        status=status,
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return meeting

def get_meeting(db: Session, meeting_id: str):
    """Get meeting by meeting_id"""
    return db.query(Meeting).filter(Meeting.meeting_id == meeting_id).first()

def get_upcoming_meetings(db: Session):
    """Get all upcoming/scheduled meetings"""
    now = datetime.utcnow()
    return db.query(Meeting).filter(
        Meeting.scheduled_at >= now
    ).order_by(Meeting.scheduled_at.asc()).all()

def get_recent_meetings(db: Session, days: int = 30):
    """Get recent meetings (ended or past scheduled)"""
    now = datetime.utcnow()
    past_date = now - timedelta(days=days)

    return db.query(Meeting).filter(
        (Meeting.status == "ended") | (Meeting.scheduled_at < now),
        Meeting.created_at >= past_date
    ).order_by(Meeting.created_at.desc()).all()

def add_participant(db: Session, meeting_id: int, display_name: str):
    """Add a participant to a meeting"""
    participant = Participant(
        meeting_id=meeting_id,
        display_name=display_name,
    )
    db.add(participant)
    db.commit()
    db.refresh(participant)
    return participant

def get_meeting_participants(db: Session, meeting_id: int):
    """Get all participants in a meeting"""
    return db.query(Participant).filter(
        Participant.meeting_id == meeting_id,
        Participant.left_at.is_(None)
    ).all()
