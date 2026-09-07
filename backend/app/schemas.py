from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class MeetingCreate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None

class MeetingResponse(BaseModel):
    meeting_id: str
    title: str
    description: Optional[str]
    scheduled_at: Optional[datetime]
    duration_minutes: Optional[int]
    invite_link: str
    status: str
    created_at: datetime
    started_at: Optional[datetime]
    ended_at: Optional[datetime]

    class Config:
        from_attributes = True

class JoinRequest(BaseModel):
    display_name: str

class ParticipantResponse(BaseModel):
    id: int
    meeting_id: int
    display_name: str
    joined_at: datetime
    left_at: Optional[datetime]

    class Config:
        from_attributes = True
