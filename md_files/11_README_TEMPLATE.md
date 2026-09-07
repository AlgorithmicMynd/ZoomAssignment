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
- [ ] Responsive design
- [ ] Authentication
- [ ] Host controls

## Tech Stack

### Frontend
- Next.js
- [CSS/Tailwind/etc. — fill in actual choice]

### Backend
- Python
- FastAPI

### Database
- SQLite
- [ORM — fill in actual choice]

## Architecture

```text
Next.js SPA
    ↓ REST/JSON
FastAPI
    ↓
SQLite
```

See `04_ARCHITECTURE.md`.

## Local Setup

### Prerequisites
- Node.js
- Python
- Git

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Adjust commands to the actual implementation.

## Environment Variables

Document actual variables here.

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Database

The application uses SQLite as required by the assignment.

Describe:
- database initialization
- seed command
- schema location

## API

See `06_API_SPEC.md`.

## Assumptions

- No login is required; a default user is assumed.
- Authentication is not part of the initial core implementation.
- SQLite is used because it is explicitly required.
- Advanced production-scale infrastructure is outside the assignment scope.

## Design

The UI is intentionally designed to closely resemble Zoom's visual language and workflows, as required by the assignment.

See `07_UI_DESIGN.md`.

## Testing

Document actual tests and manual verification steps here.

## Deployment

### Frontend
`<deployed URL>`

### Backend
`<backend URL if separately deployed>`

### Repository
`<public GitHub URL>`

## Assignment Compliance

| Requirement | Status |
|---|---|
| Next.js SPA | ⬜ |
| FastAPI/Django | ⬜ |
| SQLite | ⬜ |
| Dashboard | ⬜ |
| Instant meeting | ⬜ |
| Join meeting | ⬜ |
| Schedule meeting | ⬜ |
| Upcoming meetings | ⬜ |
| Recent meetings | ⬜ |
| Seed data | ⬜ |
| Zoom-like UI | ⬜ |
| Public GitHub | ⬜ |
| Deployment | ⬜ |
