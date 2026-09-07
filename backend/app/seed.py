from app.db import SessionLocal, engine, Base
from app.models import Meeting, Participant
from app import services
from datetime import datetime, timedelta
import pytz

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# Clear existing data
db.query(Participant).delete()
db.query(Meeting).delete()

# Seed sample meetings
now = datetime.utcnow()
ist = pytz.timezone('Asia/Kolkata')

# Upcoming meeting
upcoming = Meeting(
    meeting_id="123-456-789",
    title="Harsh Shukla's Zoom Meeting",
    description="Team sync meeting",
    scheduled_at=now + timedelta(hours=1),
    duration_minutes=30,
    invite_link="/meeting/123-456-789",
    status="scheduled",
    created_at=now,
)

# Recent meeting (past)
recent = Meeting(
    meeting_id="987-654-321",
    title="Project Planning Session",
    description="Q4 planning and roadmap",
    scheduled_at=now - timedelta(days=2),
    duration_minutes=60,
    invite_link="/meeting/987-654-321",
    status="ended",
    created_at=now - timedelta(days=3),
    ended_at=now - timedelta(days=2, hours=-1),
)

db.add(upcoming)
db.add(recent)
db.commit()

print("Seed data created successfully!")
db.close()
