# Zoom Clone — Video Conferencing Platform

A Zoom-inspired video conferencing web application built for the Scaler SDE Fullstack Assignment.

> This project is an original implementation created for the assignment. It is not copied from an existing repository.

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

### Backend
- Python 3.12
- FastAPI
- SQLAlchemy

### Database
- SQLite

## Architecture

```text
Next.js SPA
    ↓ REST/JSON
FastAPI
    ↓ SQLAlchemy
SQLite
```

See `md_files/04_ARCHITECTURE.md`.

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
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (`backend/.env`)
```env
FRONTEND_BASE_URL=http://localhost:3000
```

## Database

The application uses SQLite as required by the assignment.
- Database Initialization: Automatically created on backend startup via SQLAlchemy `create_all()`.
- Seed Command: `python -m app.seed`
- Schema Location: `backend/app/models.py`

## API

See `md_files/06_API_SPEC.md`.

## Assumptions

- No login is required; a default user is assumed.
- Authentication is not part of the initial core implementation.
- SQLite is used because it is explicitly required.
- Advanced production-scale infrastructure (WebRTC signaling, SFU) is simulated for UI purposes.

## Design

The UI is intentionally designed to closely resemble Zoom's visual language and workflows, as required by the assignment.

See `md_files/07_UI_DESIGN.md`.

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
| Public GitHub | ⬜ |
| Deployment | ⬜ |
