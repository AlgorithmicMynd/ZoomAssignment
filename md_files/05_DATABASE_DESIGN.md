# Database Design

## 1. Design Goal

The assignment explicitly evaluates database design and asks the candidate to design their own SQLite schema.

The schema should remain small but demonstrate:
- proper primary keys
- unique identifiers
- relationships where useful
- clear timestamps
- data types appropriate to the application

## 2. Recommended Schema

### meetings

| Column | Type | Constraints | Purpose |
|---|---|---|---|
| id | INTEGER | PK | Internal database identifier |
| meeting_id | TEXT | UNIQUE, NOT NULL | Public meeting identifier |
| title | TEXT | NOT NULL | Meeting title |
| description | TEXT | NULL | Optional description |
| scheduled_at | DATETIME | NULL | Scheduled start time; null for instant meetings if desired |
| duration_minutes | INTEGER | NULL | Scheduled duration |
| invite_link | TEXT | UNIQUE, NOT NULL | Shareable link |
| status | TEXT | NOT NULL | e.g. scheduled/active/ended |
| created_at | DATETIME | NOT NULL | Creation timestamp |
| started_at | DATETIME | NULL | Actual start time |
| ended_at | DATETIME | NULL | Actual end time |

### participants (optional)

Use this only if the meeting-room implementation actually needs persistent participant information. The assignment requires collecting a display name before joining, but it does not require persistent participant history. Do not add this table solely to simulate a production conferencing backend.

| Column | Type | Constraints | Purpose |
|---|---|---|---|
| id | INTEGER | PK | Participant record |
| meeting_id | INTEGER | FK → meetings.id | Meeting relationship |
| display_name | TEXT | NOT NULL | Name entered before joining |
| joined_at | DATETIME | NOT NULL | Join timestamp |
| left_at | DATETIME | NULL | Leave timestamp |

## 3. Relationship

```text
meetings 1 ─────────── N participants
```

A meeting can have multiple participant records.

If participants are purely ephemeral and are not needed for the assignment, do not persist them just to make the schema look more sophisticated.

## 4. Indexes

Recommended:
- unique index on `meeting_id`
- unique index on `invite_link`
- index on `scheduled_at`
- optional index on participant `meeting_id`

## 5. Meeting ID Strategy

The public Meeting ID should be generated independently from the database's internal integer primary key.

Reason:
- avoids exposing database sequence numbers;
- provides a clean public identifier;
- makes links independent of database internals.

## 6. Recent vs Upcoming

Recommended query semantics:
- Upcoming: `scheduled_at >= current_time`
- Recent: meetings whose `ended_at`/`started_at`/creation time falls within the application's chosen recent window.

Document whichever exact definition is implemented.

## 7. Why SQLite

SQLite is explicitly required by the assignment. It is appropriate for a small assignment and keeps setup simple.

Production evolution would likely move to PostgreSQL.
