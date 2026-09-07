# System Architecture

## 1. Architecture Goal

Use a simple three-layer web architecture that is easy to implement, test, deploy, and explain.

```text
┌─────────────────────────────┐
│        Next.js SPA          │
│  Dashboard / Join /         │
│  Schedule / Meeting Room    │
└──────────────┬──────────────┘
               │ HTTP / JSON
               ▼
┌─────────────────────────────┐
│       FastAPI Backend       │
│ Routes → Services → Models  │
│ Validation + Business Logic │
└──────────────┬──────────────┘
               │ SQL / ORM
               ▼
┌─────────────────────────────┐
│          SQLite             │
│         Meetings            │
│   + optional Participants   │
└─────────────────────────────┘
```

## 2. Responsibilities

### Frontend
Responsible for:
- rendering UI
- collecting user input
- client-side navigation
- calling backend APIs
- displaying API responses/errors
- meeting-room presentation and client-side meeting state

### Backend
Responsible for:
- meeting creation
- meeting ID/link generation
- validation
- persistence
- retrieving upcoming/recent meetings
- validating meeting existence
- serving meeting data

### Database
Responsible for persistent meeting records and relationships.

## 3. Separation of Concerns

Recommended backend structure:

```text
backend/
  app/
    main.py
    api/
      meetings.py
    schemas/
      meeting.py
    services/
      meeting_service.py
    models/
      meeting.py
    db/
      database.py
    seed.py
```

Recommended frontend structure:

```text
frontend/
  app/
    page.tsx
    join/
    schedule/
    meeting/
  components/
    Navbar/
    MeetingCard/
    MeetingActions/
    MeetingRoom/
    Forms/
  lib/
    api.ts
```

The exact folder structure may change if the chosen framework version requires it, but responsibilities should remain separated.

## 4. Core Request Flow

### Create Meeting

```text
User
  ↓
New Meeting
  ↓
Next.js
  ↓ POST /meetings
FastAPI
  ↓
Validate + generate ID/link
  ↓
SQLite
  ↓
Created meeting
  ↓
Next.js
  ↓
Meeting Room
```

### Join Meeting

```text
User enters ID/link + display name
  ↓
Next.js
  ↓ GET /meetings/{meeting_id}
FastAPI
  ↓
SQLite lookup
  ↓
Found?
 ├─ No → 404/error UI
 └─ Yes → meeting data
              ↓
        Meeting Room
```

### Schedule Meeting

```text
Schedule Form
  ↓
POST /meetings
  ↓
Validate fields
  ↓
SQLite
  ↓
Upcoming dashboard query
```

## 5. Meeting Room / Real-Time Media Scope

The assignment requires creating/joining meetings and redirecting the user to a meeting room. It does not explicitly require live audio/video communication between two users.

For the one-day MVP, the meeting room should therefore be implemented as an application-level room experience: meeting metadata, participant/join state if useful, video-tile placeholders/local UI state, and conferencing controls can be represented without building a real media transport layer.

Do **not** add WebRTC, signaling, STUN/TURN, SFU/MCU infrastructure, or a media server unless an explicit requirement is introduced. These belong in the future scaling path.

## 6. Scalability Discussion

The assignment uses SQLite because it explicitly requires SQLite. This should not be disguised as a production-scale database.

If scaling beyond the assignment:
- replace SQLite with PostgreSQL;
- add Redis for frequently accessed ephemeral state;
- separate meeting metadata from real-time participant/session state;
- introduce a dedicated signaling service;
- use a WebRTC infrastructure/managed media service for reliable media;
- deploy frontend/backend independently;
- add authentication and authorization;
- add observability, rate limiting, and structured logging.

These are **future architecture considerations**, not requirements for the assignment.

## 7. Key Trade-Off

Do not build distributed infrastructure for a one-day assignment. Demonstrating that you understand the future scaling path is more valuable than implementing unnecessary infrastructure incorrectly.
