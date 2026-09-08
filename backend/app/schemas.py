from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class MeetingCreate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    passcode: Optional[str] = None   # caller can set a 4-6 char passcode



class MeetingResponse(BaseModel):
    meeting_id: str
    title: str
    description: Optional[str] = None
    passcode: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    invite_link: str
    status: str
    created_at: datetime
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None

    model_config = {"from_attributes": True}



class JoinRequest(BaseModel):
    display_name: str
    passcode: Optional[str] = None   # required only if meeting has a passcode



class ParticipantResponse(BaseModel):
    id: int
    meeting_id: int
    display_name: str
    joined_at: datetime
    left_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
