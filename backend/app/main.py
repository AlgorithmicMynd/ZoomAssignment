from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
import os
import asyncio

from app.db import engine, get_db, Base
from app.models import Meeting, Participant
from app.schemas import MeetingCreate, MeetingResponse, JoinRequest, ParticipantResponse
from app import services
from app.websocket_manager import manager as ws_manager

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Zoom Clone API", version="1.0.0")

# CORS — allow the frontend origin (and wildcard for dev)
_allowed_origins = [
    os.getenv("FRONTEND_BASE_URL", "http://localhost:3000"),
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # Allow any Vercel preview/production deploy and local dev
    "https://zoom-clone.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health ──────────────────────────────────────────────────────────────
@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "active_rooms": ws_manager.active_room_count(),
    }


# ── WebSocket Signaling ──────────────────────────────────────────────────
@app.websocket("/ws/meeting/{meeting_id}/{participant_id}")
async def websocket_signaling(
    websocket: WebSocket,
    meeting_id: str,
    participant_id: str,
):
    """
    Primary real-time signaling channel for WebRTC Mesh topology.

    Query params:
      - userName: display name of the connecting participant (default: "Guest")

    Message lifecycle:
      1. Accept the connection and register participant.
      2. Send the new participant the list of existing peers so they can
         initiate RTCPeerConnection offers to each one.
      3. Route all incoming messages (SDP, ICE, media-state, chat) until
         the socket closes.
      4. Notify remaining peers on disconnect.
    """
    user_name: str = websocket.query_params.get("userName", "Guest")

    await websocket.accept()

    # Register in room and receive the list of already-connected peers
    existing_peers = await ws_manager.connect(
        meeting_id=meeting_id,
        participant_id=participant_id,
        user_name=user_name,
        ws=websocket,
    )

    # Tell the newcomer who is already in the room so they can initiate offers
    await websocket.send_text(
        __import__("json").dumps(
            {
                "type": "room-joined",
                "participantId": participant_id,
                "existingPeers": existing_peers,
            }
        )
    )

    try:
        while True:
            raw = await asyncio.wait_for(websocket.receive_text(), timeout=120.0)
            await ws_manager.handle_message(meeting_id, participant_id, raw)
    except asyncio.TimeoutError:
        # No data for 2 minutes — close cleanly
        pass
    except WebSocketDisconnect:
        pass
    except Exception as exc:
        import logging
        logging.getLogger(__name__).warning("WS error for %s/%s: %s", meeting_id, participant_id, exc)
    finally:
        await ws_manager.disconnect(meeting_id, participant_id)


# ── Debug: live room participants ─────────────────────────────────────────
@app.get("/api/rooms/{meeting_id}/participants")
def room_participants(meeting_id: str):
    """Debug endpoint — lists currently connected WebSocket participants."""
    return ws_manager.get_room_participants(meeting_id)


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
