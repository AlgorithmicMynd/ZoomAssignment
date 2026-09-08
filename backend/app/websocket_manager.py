"""
WebSocket Signaling Manager for WebRTC Mesh Topology
-----------------------------------------------------
This module manages real-time WebSocket connections grouped by meeting room.
It routes JSON signaling messages (SDP offers/answers, ICE candidates, media
state, chat) between participants so that each browser can establish direct
WebRTC P2P connections with all other participants in the room.

The server NEVER processes audio/video media — it only relays small JSON
packets used to negotiate the peer-to-peer connections.
"""

import asyncio
import json
import logging
from typing import Any

from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    """
    Maintains an in-memory registry of active WebSocket connections
    grouped by meeting room ID.

    Data structure:
        rooms[meeting_id][participant_id] = {
            "ws":        WebSocket,
            "user_name": str,
            "is_muted":  bool,
            "is_video_off": bool,
        }
    """

    def __init__(self) -> None:
        # { meeting_id: { participant_id: { ws, user_name, is_muted, is_video_off } } }
        self.rooms: dict[str, dict[str, dict[str, Any]]] = {}
        self._lock = asyncio.Lock()

    # ─── Internal helpers ────────────────────────────────────────────────

    async def _send(self, ws: WebSocket, payload: dict) -> bool:
        """Send JSON payload to a single WebSocket; return False on failure."""
        try:
            await ws.send_text(json.dumps(payload))
            return True
        except Exception as exc:
            logger.debug("Send failed: %s", exc)
            return False

    async def _broadcast_to_room(
        self,
        meeting_id: str,
        payload: dict,
        exclude_participant_id: str | None = None,
    ) -> None:
        """
        Send a message to all participants in a room, optionally excluding
        the sender.
        """
        room = self.rooms.get(meeting_id, {})
        dead = []
        for pid, peer in room.items():
            if pid == exclude_participant_id:
                continue
            ok = await self._send(peer["ws"], payload)
            if not ok:
                dead.append(pid)
        # Prune any connections that errored during broadcast
        for pid in dead:
            await self.disconnect(meeting_id, pid)

    # ─── Lifecycle ───────────────────────────────────────────────────────

    async def connect(
        self,
        meeting_id: str,
        participant_id: str,
        user_name: str,
        ws: WebSocket,
    ) -> list[dict]:
        """
        Register a new participant in a room after their WebSocket is accepted.
        Returns the list of *existing* participants so the newcomer can
        initiate peer connections with each of them.
        """
        async with self._lock:
            if meeting_id not in self.rooms:
                self.rooms[meeting_id] = {}

            room = self.rooms[meeting_id]

            # Snapshot existing peers BEFORE adding newcomer
            existing_peers = [
                {
                    "participantId": pid,
                    "userName": peer["user_name"],
                    "isMuted": peer["is_muted"],
                    "isVideoOff": peer["is_video_off"],
                }
                for pid, peer in room.items()
            ]

            # Register the newcomer
            room[participant_id] = {
                "ws": ws,
                "user_name": user_name,
                "is_muted": False,
                "is_video_off": False,
            }

        # Tell everyone else that this participant just joined
        await self._broadcast_to_room(
            meeting_id,
            {
                "type": "user-joined",
                "participantId": participant_id,
                "userName": user_name,
            },
            exclude_participant_id=participant_id,
        )

        logger.info(
            "[%s] %s (%s) joined — %d peer(s) in room",
            meeting_id,
            user_name,
            participant_id,
            len(existing_peers),
        )
        return existing_peers

    async def disconnect(self, meeting_id: str, participant_id: str) -> None:
        """
        Remove a participant and notify remaining peers so they can close
        their corresponding RTCPeerConnection objects.
        """
        async with self._lock:
            room = self.rooms.get(meeting_id, {})
            peer = room.pop(participant_id, None)
            if not room:
                # Last person left — clean up the room entry
                self.rooms.pop(meeting_id, None)

        if peer:
            logger.info(
                "[%s] %s (%s) left",
                meeting_id,
                peer.get("user_name", "unknown"),
                participant_id,
            )
            await self._broadcast_to_room(
                meeting_id,
                {
                    "type": "user-left",
                    "participantId": participant_id,
                },
            )

    # ─── Signaling message dispatch ──────────────────────────────────────

    async def handle_message(
        self,
        meeting_id: str,
        sender_id: str,
        raw: str,
    ) -> None:
        """
        Parse an incoming message from a participant and route it appropriately.

        Supported message types:
        ┌─────────────────────┬─────────────────────────────────────────────┐
        │ Type                │ Action                                      │
        ├─────────────────────┼─────────────────────────────────────────────┤
        │ signal-offer        │ Route SDP offer to target peer              │
        │ signal-answer       │ Route SDP answer back to caller             │
        │ signal-ice-candidate│ Route ICE candidate to target peer          │
        │ media-state         │ Broadcast mute / video state to whole room  │
        │ chat-message        │ Broadcast chat text to whole room           │
        │ ping                │ Internal keepalive — no routing needed      │
        └─────────────────────┴─────────────────────────────────────────────┘
        """
        try:
            data: dict = json.loads(raw)
        except json.JSONDecodeError:
            logger.warning("[%s] Invalid JSON from %s", meeting_id, sender_id)
            return

        msg_type: str = data.get("type", "")

        if msg_type == "ping":
            # Keepalive — just acknowledge; nothing to route
            room = self.rooms.get(meeting_id, {})
            peer = room.get(sender_id)
            if peer:
                await self._send(peer["ws"], {"type": "pong"})
            return

        if msg_type in ("signal-offer", "signal-answer", "signal-ice-candidate"):
            # Point-to-point routing: sender → specific target
            target_id: str = data.get("targetId", "")
            room = self.rooms.get(meeting_id, {})
            target = room.get(target_id)
            if target:
                # Inject the sender's ID so the receiver knows who sent it
                await self._send(
                    target["ws"],
                    {**data, "senderId": sender_id},
                )
            else:
                logger.debug(
                    "[%s] Target %s not found for %s", meeting_id, target_id, msg_type
                )
            return

        if msg_type == "media-state":
            # Update the server-side snapshot and broadcast to the room
            is_muted: bool = data.get("isMuted", False)
            is_video_off: bool = data.get("isVideoOff", False)
            async with self._lock:
                room = self.rooms.get(meeting_id, {})
                if sender_id in room:
                    room[sender_id]["is_muted"] = is_muted
                    room[sender_id]["is_video_off"] = is_video_off
            await self._broadcast_to_room(
                meeting_id,
                {
                    "type": "media-state",
                    "participantId": sender_id,
                    "isMuted": is_muted,
                    "isVideoOff": is_video_off,
                },
                exclude_participant_id=sender_id,
            )
            return

        if msg_type == "chat-message":
            # Broadcast chat message to entire room including sender for echo
            room = self.rooms.get(meeting_id, {})
            sender_peer = room.get(sender_id)
            sender_name = sender_peer["user_name"] if sender_peer else "Unknown"
            await self._broadcast_to_room(
                meeting_id,
                {
                    "type": "chat-message",
                    "senderId": sender_id,
                    "senderName": sender_name,
                    "text": data.get("text", ""),
                    "timestamp": data.get("timestamp", ""),
                },
                # Do NOT exclude sender — they need to see their own message
                exclude_participant_id=None,
            )
            return

        logger.debug("[%s] Unknown message type '%s' from %s", meeting_id, msg_type, sender_id)

    # ─── Room introspection ──────────────────────────────────────────────

    def get_room_participants(self, meeting_id: str) -> list[dict]:
        """Return a snapshot of all participants in a room (for debugging/REST)."""
        room = self.rooms.get(meeting_id, {})
        return [
            {
                "participantId": pid,
                "userName": peer["user_name"],
                "isMuted": peer["is_muted"],
                "isVideoOff": peer["is_video_off"],
            }
            for pid, peer in room.items()
        ]

    def active_room_count(self) -> int:
        return len(self.rooms)


# Module-level singleton shared across the FastAPI app
manager = ConnectionManager()
