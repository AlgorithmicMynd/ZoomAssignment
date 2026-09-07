# Architecture & Engineering Decision Log

This file preserves decisions so a different AI model can continue the project without losing context.

## Decision Format

For every important decision:

### [DATE] Decision Title
**Decision:**  
What was chosen.

**Reason:**  
Why it was chosen.

**Alternatives:**  
What else was considered.

**Trade-off:**  
What is gained/lost.

**Status:**  
Active / Superseded.

---

## Initial Decisions

### [2026-09-07] Keep Core Scope Small
**Decision:** Implement all must-have assignment workflows before bonus features.

**Reason:** Deadline is one day and functionality is explicitly evaluated.

**Alternatives:** Implement authentication, responsive behavior, advanced host controls, and sophisticated media infrastructure first.

**Trade-off:** Less feature breadth, but substantially lower delivery risk.

**Status:** Active.

### [2026-09-07] FastAPI Preferred
**Decision:** Prefer FastAPI for the Python backend unless a concrete project constraint favors Django.

**Reason:** Small REST API, fast setup, straightforward validation, and easy separation of routes/services/models.

**Alternatives:** Django.

**Trade-off:** Less built-in full-stack functionality than Django, but lower complexity for this assignment.

**Status:** Active.

### [2026-09-07] SQLite
**Decision:** Use SQLite.

**Reason:** Explicit assignment requirement.

**Alternatives:** None for the submitted assignment.

**Trade-off:** Simple deployment and setup, but not the production-scale database choice.

**Status:** Active.

### [2026-09-07] No Authentication
**Decision:** Do not implement authentication initially.

**Reason:** Assignment explicitly says no login is required and assumes a default user.

**Alternatives:** Login/signup.

**Trade-off:** Simpler product, less realistic user isolation.

**Status:** Active.

### [2026-09-07] AI Context Files
**Decision:** Maintain project documentation as persistent context for AI-assisted development.

**Reason:** The project may be developed using multiple AI systems, so architectural and product context must not depend on a single conversation.

**Trade-off:** Documentation requires maintenance, but prevents context loss and inconsistent implementation.

**Status:** Active.

### [2026-09-07] Real-Time Media Out of MVP Scope
**Decision:** Do not implement WebRTC/live audio-video transport unless the evaluator introduces an explicit requirement. Build a convincing meeting-room workflow with application-level meeting/participant state and conferencing UI.

**Reason:** The assignment explicitly requires meeting creation, invite links, joining, display-name collection, validation, and redirecting to a meeting room, but does not specify live media transport, WebRTC, signaling, STUN/TURN, or media servers. The deadline is one day.

**Alternatives:** Build full browser-to-browser WebRTC communication and supporting signaling/media infrastructure.

**Trade-off:** The MVP is not a real video-conferencing transport system, but scope, reliability, implementation speed, and interview explainability are substantially better.

**Status:** Active.
