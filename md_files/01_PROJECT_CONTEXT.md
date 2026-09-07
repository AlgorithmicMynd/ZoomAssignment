# Zoom Clone — Project Context

## Purpose
This repository is being built for the Scaler SDE Fullstack Assignment: **Video Conferencing Platform (Zoom Clone)**.

The assignment explicitly allows and encourages AI tools, but requires the candidate to understand every submitted line of code and be able to explain implementation decisions during evaluation.

## Source-of-Truth Requirements
- Frontend: **Next.js (Single Page Application)**
- Backend: **Python with FastAPI or Django**
- Database: **SQLite**
- Authentication: **Not required**; assume a default user is logged in.
- UI/UX: Must closely replicate Zoom's design, user experience, look and feel.
- Deadline: **1 day from receiving the assignment**.

## Must-Have Features
1. Landing dashboard
   - Professional Zoom-like UI
   - Navbar with profile/settings placeholders
   - New Meeting
   - Join Meeting
   - Schedule Meeting
   - Upcoming Meetings
   - Recent Meetings

2. Instant Meeting Creation
   - Create meeting instantly
   - Generate unique Meeting ID
   - Generate shareable invite link
   - Redirect to meeting room

3. Join Meeting
   - Join using Meeting ID or invite link
   - Ask for display name before joining
   - Validate that the meeting exists

4. Schedule Meeting
   - Title
   - Description
   - Date & time
   - Duration
   - Automatically generated meeting link
   - Persist to SQLite
   - Show in Upcoming Meetings

## Bonus Features
Only implement after all must-have functionality is stable:
- Responsive mobile/tablet/desktop design
- Authentication
- Host controls such as mute-all/remove-participant

## Submission Requirements
- Public GitHub repository
- Deployed application
- Submit both repository and deployed application links
- Include README with setup instructions, tech stack, and assumptions

## Evaluation Criteria
- Functionality
- UI/UX similarity to Zoom
- Database design and relationships
- Code quality
- Modularity and separation of concerns
- Ability to explain the implementation

## Hard Constraints
- Do not copy an existing repository.
- Do not add complex features that threaten the deadline.
- Do not introduce authentication unless core requirements are already complete.
- Do not use an architecture that cannot be explained confidently in an interview.
- Do not treat real-time audio/video transport as a required deliverable unless Scaler provides an additional requirement.
- The assignment requires the meeting workflow and meeting-room transition, but it does not specify WebRTC, live media transport, signaling, STUN/TURN, or a media server.

## Meeting Room Scope
The application must support the required meeting workflow: a meeting can be created, a valid Meeting ID/invite link can be used to join, and the user is redirected into a meeting room.

The assignment does **not** explicitly require two users to exchange live audio/video. Therefore, do not introduce WebRTC, signaling infrastructure, STUN/TURN, or a media server unless needed later or explicitly requested. A convincing meeting-room UI and application-level participant/join state are sufficient for the defined scope.

This is a scope decision, not a claim that the submitted product is a production video-conferencing system.

## Working Principle
**Build the smallest complete product first, then improve visual fidelity, modularity, and polish.**
