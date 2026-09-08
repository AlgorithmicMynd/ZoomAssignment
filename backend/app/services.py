from sqlalchemy.orm import Session
from app.models import Meeting, Participant
from app.schemas import MeetingCreate
from datetime import datetime, timedelta
import random
import string


def generate_meeting_id():
    """Generate a unique 9-digit public meeting ID (format: XXX-XXX-XXX)."""
    digits = ''.join(random.choices(string.digits, k=9))
    return f"{digits[:3]}-{digits[3:6]}-{digits[6:9]}"


def create_meeting(db: Session, meeting_data: MeetingCreate, base_url: str):
    """Create a new instant or scheduled meeting."""
    meeting_id = generate_meeting_id()
    invite_link = f"/meeting/{meeting_id}"

    title = meeting_data.title or "Zoom Meeting"
    # Scheduled meetings start in 'scheduled' state; instant ones are 'active'
    status = "scheduled" if meeting_data.scheduled_at else "active"

    # Auto-generate a 6-digit passcode if caller didn't supply one
    passcode = meeting_data.passcode or ''.join(random.choices(string.digits, k=6))

    meeting = Meeting(
        meeting_id=meeting_id,
        title=title,
        description=meeting_data.description,
        passcode=passcode,
        scheduled_at=meeting_data.scheduled_at,
        duration_minutes=meeting_data.duration_minutes,
        invite_link=invite_link,
        status=status,
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return meeting


def _normalize_meeting_id(raw: str) -> str:
    """
    Normalise a user-supplied meeting ID to the canonical XXX-XXX-XXX format.
    Accepts: '123456789', '123 456 789', '123-456-789' etc.
    """
    digits = ''.join(c for c in raw if c.isdigit())
    if len(digits) == 9:
        return f"{digits[:3]}-{digits[3:6]}-{digits[6:9]}"
    # Return raw value so the DB lookup fails cleanly with a 404
    return raw.strip()


def get_meeting(db: Session, meeting_id: str):
    """Get meeting by its public meeting_id string (accepts dashes or plain digits)."""
    canonical = _normalize_meeting_id(meeting_id)
    return db.query(Meeting).filter(Meeting.meeting_id == canonical).first()



def get_upcoming_meetings(db: Session):
    """
    Upcoming = scheduled meetings whose scheduled_at is strictly in the future.
    Ordered by scheduled_at ascending (soonest first).
    """
    now = datetime.utcnow()
    return (
        db.query(Meeting)
        .filter(
            Meeting.status == "scheduled",
            Meeting.scheduled_at > now,
        )
        .order_by(Meeting.scheduled_at.asc())
        .all()
    )


def get_recent_meetings(db: Session, days: int = 30):
    """
    Recent = any of the following within the last `days` days:
      - meetings that have status = 'ended'
      - scheduled meetings whose scheduled_at has already passed (past-due)
      - instant meetings (no scheduled_at) that are 'active' or 'ended'
    Ordered by created_at descending (newest first), capped at 20.
    """
    now = datetime.utcnow()
    past_date = now - timedelta(days=days)

    from sqlalchemy import or_, and_

    return (
        db.query(Meeting)
        .filter(
            Meeting.created_at >= past_date,
            or_(
                Meeting.status == "ended",
                # Scheduled meeting whose time has passed
                and_(Meeting.scheduled_at.isnot(None), Meeting.scheduled_at <= now),
                # Instant meeting (no scheduled_at) — show after creation
                and_(Meeting.scheduled_at.is_(None), Meeting.status.in_(["active", "ended"])),
            ),
        )
        .order_by(Meeting.created_at.desc())
        .limit(20)
        .all()
    )


def end_meeting(db: Session, meeting_id: str):
    """Mark a meeting as ended and record ended_at timestamp."""
    meeting = get_meeting(db, meeting_id)
    if meeting:
        meeting.status = "ended"
        meeting.ended_at = datetime.utcnow()
        db.commit()
        db.refresh(meeting)
    return meeting


def add_participant(db: Session, meeting_id: int, display_name: str):
    """Register a participant joining a meeting."""
    participant = Participant(
        meeting_id=meeting_id,
        display_name=display_name,
    )
    db.add(participant)
    db.commit()
    db.refresh(participant)
    return participant


def get_meeting_participants(db: Session, meeting_id: int):
    """Get all currently active participants (left_at is NULL)."""
    return (
        db.query(Participant)
        .filter(
            Participant.meeting_id == meeting_id,
            Participant.left_at.is_(None),
        )
        .all()
    )
