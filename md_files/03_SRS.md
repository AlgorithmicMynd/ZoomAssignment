# Software Requirements Specification (SRS)

## 1. Introduction

### 1.1 Product
A functional web-based video conferencing platform inspired by Zoom.

### 1.2 Objective
Provide the core workflows of a modern Zoom-like meeting platform:
- create an instant meeting
- join an existing meeting
- schedule a meeting
- view upcoming meetings
- view recent meetings

### 1.3 Scope
The product is intentionally limited to the assignment's core workflows. Authentication and advanced host controls are bonus features.

---

## 2. Functional Requirements

### FR-01 Dashboard
The system shall provide a dashboard/homepage containing:
- navigation/header area
- profile/settings placeholders
- New Meeting action
- Join Meeting action
- Schedule Meeting action
- Upcoming Meetings section
- Recent Meetings section

### FR-02 Create Instant Meeting
The system shall:
1. allow the user to create an instant meeting;
2. generate a unique Meeting ID;
3. generate a shareable meeting link;
4. redirect the user to the meeting room.

### FR-03 Join Meeting
The system shall:
1. accept a Meeting ID or invite link;
2. request a display name;
3. validate that the meeting exists;
4. enter the meeting room when valid;
5. show an appropriate error when invalid.

### FR-04 Meeting Room
The system shall provide a meeting-room destination after successful meeting creation or joining.

The assignment specifies the meeting workflow and redirect to a meeting room, but does not explicitly specify live audio/video communication between multiple browsers/users. Therefore the MVP shall prioritize meeting validation, room navigation, meeting metadata, and convincing conferencing UI.

The system shall NOT require WebRTC, live media transport, signaling servers, STUN/TURN, or a dedicated media server unless an additional evaluator requirement is introduced.

### FR-05 Schedule Meeting
The system shall allow:
- title
- description
- date and time
- duration

The system shall:
1. generate a meeting link;
2. store the meeting;
3. make it visible in Upcoming Meetings.

### FR-06 Recent Meetings
The dashboard shall show meetings that qualify as recent according to the application's documented query logic.

### FR-07 Sample Data
The application shall include seeded sample data.

---

## 3. Non-Functional Requirements

### NFR-01 Usability
The interface should feel like a modern professional conferencing product.

### NFR-02 Visual Fidelity
The UI/UX should closely replicate Zoom's design, patterns, and look and feel because this is explicitly evaluated.

### NFR-03 Maintainability
Code should be readable, modular, and separated by responsibility.

### NFR-04 Data Integrity
Meeting records must have stable unique identifiers and valid required fields.

### NFR-05 Error Handling
Invalid meeting IDs/links and invalid form inputs should produce understandable errors.

### NFR-06 Deployability
The project must be deployable and documented.

---

## 4. Bonus Requirements

These are lower priority than core functionality:
- responsive design
- authentication
- host controls

---

## 5. Assumptions

1. There is one default application user.
2. Authentication is intentionally omitted.
3. A meeting has a persistent record and a meeting-room destination.
4. The assignment does not explicitly require live audio/video transport; real-time media infrastructure is therefore out of MVP scope.
5. SQLite is sufficient for the assignment's scale.
6. The UI should use original implementation/assets rather than copying an existing repository.

---

## 6. Acceptance Criteria

The assignment is considered functionally complete when:
- dashboard loads;
- instant meeting creation works;
- unique meeting ID/link are generated;
- user is redirected to the meeting room;
- joining by ID works;
- joining by link works;
- display name is collected;
- nonexistent meetings are rejected;
- scheduled meetings are persisted;
- upcoming meetings display scheduled records;
- recent meetings display recent records;
- a successful create/join flow reaches a meeting-room UI;
- the implementation does not depend on unrequested real-time media infrastructure;
- seed data exists;
- application can be deployed;
- README explains setup, stack, and assumptions.
