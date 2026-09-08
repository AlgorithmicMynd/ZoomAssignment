# Zoom Clone — Video Conferencing Platform

A Zoom-inspired video conferencing web application built for the Scaler SDE Fullstack Assignment.

> **AI Assistance:** This project utilized AI models (Claude Sonnet 4.6, Gemini 3.1 Pro, and Flash 3.8) to accelerate development. The use of AI significantly reduced development time by assisting with clean code generation and meticulously replicating the exact look, feel, design tokens, and color codes of the original Zoom platform.

## Features

### Core
- Dashboard
- Instant meeting creation
- Unique Meeting ID
- Shareable invite link
- Join by Meeting ID/link
- Display name before joining
- Meeting existence validation
- Schedule meetings
- Upcoming meetings
- Recent meetings
- SQLite persistence
- Seed/sample data

### Multi-Peer Video Conferencing (WebRTC)
- **Live Video & Audio:** Full-mesh WebRTC topology for low-latency communication.
- **Dynamic UI Grid:** Automatically adapts from 1 to 6 participants seamlessly.
- **Screen Sharing:** Integrated screen sharing capabilities.
- **Real-Time Chat:** In-meeting WebSocket-based chat broadcast.
- **Bandwidth Throttled:** Video constraints and bitrate clamped for performance.

### Bonus
- [x] Responsive design
- [ ] Authentication
- [ ] Host controls

## Tech Stack

### Frontend
- Next.js 15 (App Router)
- React 19
- Tailwind CSS
- Lucide React (Icons)
- WebRTC (Native Browser APIs)

### Backend
- Python 3.12
- FastAPI (with WebSockets)
- SQLAlchemy
- Uvicorn (ASGI)

### Database
- SQLite

## Architecture

```text
Next.js SPA
    ↓ REST (HTTP) / WebRTC Signaling (WebSocket)
FastAPI
    ↓ SQLAlchemy
SQLite
```

## Local Setup

### Prerequisites
- Node.js (v18+)
- Python (3.12+)
- Git

### Frontend

```bash
cd frontend
npm install
npm run dev
```
The frontend will run at `http://localhost:3000`.

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
The backend will run at `http://localhost:8000`.
On the first run, the SQLite database `zoom.db` will automatically be created.

To seed the database with sample meetings:
```bash
python -m app.seed
```

## Environment Variables

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_BASE_URL=ws://localhost:8000
```

### Backend (`backend/.env`)
```env
FRONTEND_BASE_URL=http://localhost:3000
DATABASE_URL=sqlite:///./zoom.db
```

## Deployment

The application is configured for easy deployment on free-tier cloud platforms:
- **Backend:** `render.yaml` is provided for one-click deployment of the FastAPI WebSocket server on Render.com.
- **Frontend:** Next.js is configured for seamless deployment on Vercel.

## Assignment Compliance

| Requirement | Status |
|---|---|
| Next.js SPA | ✅ |
| FastAPI/Django | ✅ |
| SQLite | ✅ |
| Dashboard | ✅ |
| Instant meeting | ✅ |
| Join meeting | ✅ |
| Schedule meeting | ✅ |
| Upcoming meetings | ✅ |
| Recent meetings | ✅ |
| Seed data | ✅ |
| Zoom-like UI | ✅ |
| Multi-Peer WebRTC | ✅ |
| Public GitHub | ✅ |
| Deployment | ✅ |
