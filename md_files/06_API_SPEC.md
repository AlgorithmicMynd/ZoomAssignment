# API Specification

Base URL example:

```text
/api
```

The exact prefix may be changed, but frontend and backend must share one documented contract.

## 1. Create Meeting

### Request
`POST /meetings`

```json
{
  "title": "Optional meeting title",
  "description": "Optional description",
  "scheduled_at": "2026-09-08T10:00:00",
  "duration_minutes": 60
}
```

For an instant meeting, scheduled fields may be omitted/null according to the implemented schema.

### Response

```json
{
  "meeting_id": "123-456-789",
  "invite_link": "/meeting/123-456-789",
  "title": "Optional meeting title",
  "description": "Optional description",
  "scheduled_at": null,
  "duration_minutes": null,
  "status": "active"
}
```

## 2. Get Meeting

`GET /meetings/{meeting_id}`

Purpose:
- validate meeting existence;
- retrieve meeting metadata.

Success: `200 OK`

Missing meeting: `404 Not Found`

## 3. List Upcoming Meetings

`GET /meetings/upcoming`

Returns scheduled meetings whose start time is in the future.

## 4. List Recent Meetings

`GET /meetings/recent`

Returns meetings classified as recent according to the documented query logic.

## 5. Optional Join Endpoint

`POST /meetings/{meeting_id}/join`

Request:

```json
{
  "display_name": "Harsh"
}
```

This endpoint is optional if joining only requires validating the meeting and the display name can remain frontend state.

## 6. Meeting Room Scope
The API is responsible for meeting metadata and existence validation. It is not a media transport API. No WebRTC signaling, audio/video stream, STUN/TURN, or media-server endpoints are required for the MVP.

If participant presence is implemented, keep it lightweight and explicitly separate from persistent meeting metadata.

## 7. Error Contract

Use a consistent structure such as:

```json
{
  "detail": "Meeting not found"
}
```

Typical statuses:
- `200` successful retrieval
- `201` successful creation
- `400` invalid input
- `404` meeting does not exist
- `422` validation failure
- `500` unexpected server error

## 8. API Principles

- Validate at the backend.
- Never trust client-provided meeting existence.
- Keep response shapes predictable.
- Do not expose unnecessary database fields.
- Keep the frontend API client centralized in one module.
