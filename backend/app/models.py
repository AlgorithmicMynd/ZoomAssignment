from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db import Base

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(String, unique=True, nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    scheduled_at = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    invite_link = Column(String, unique=True, nullable=False, index=True)
    status = Column(String, nullable=False, default="active")  # scheduled, active, ended
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)

    participants = relationship("Participant", back_populates="meeting", cascade="all, delete-orphan")

class Participant(Base):
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"), nullable=False, index=True)
    display_name = Column(String, nullable=False)
    joined_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    left_at = Column(DateTime, nullable=True)

    meeting = relationship("Meeting", back_populates="participants")
