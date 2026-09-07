# Development Plan

## Priority Strategy

The deadline is one day. Therefore the project must be developed in vertical slices.

### Phase 0 — Understand
- Read all project docs.
- Confirm stack.
- Identify core workflows.
- Do not start with bonus features.

### Phase 1 — Scaffold
- Create Next.js frontend.
- Create FastAPI backend.
- Configure SQLite.
- Establish frontend → backend connection.
- Add environment configuration.
- Verify a basic health endpoint.

### Phase 2 — Database
- Implement meetings table.
- Add migrations/table creation strategy appropriate to the chosen ORM.
- Seed sample data.
- Verify create/read queries.

### Phase 3 — Backend Core
Implement:
1. create meeting
2. get meeting
3. upcoming meetings
4. recent meetings
5. validation/errors

Test these before building complex UI.

### Phase 4 — Dashboard
Implement:
- layout
- navigation
- meeting actions
- upcoming list
- recent list
- Zoom-like visual hierarchy

### Phase 5 — Join Flow
Implement:
- meeting ID/link parsing
- display name
- existence validation
- meeting room transition

### Phase 6 — Schedule Flow
Implement:
- form
- validation
- backend persistence
- redirect/update dashboard
- upcoming meeting display

### Phase 7 — Meeting Room
Implement the minimum room experience required by the assignment:
- route to a valid meeting room after create/join;
- show meeting information;
- show convincing participant/video tile UI;
- provide lightweight local UI state for meeting controls;
- support leaving the room back to the dashboard or appropriate screen.

The assignment does not explicitly require live audio/video communication. Do not spend the deadline building WebRTC, signaling, STUN/TURN, SFU/MCU, or media-server infrastructure unless Scaler adds that requirement.

### Phase 8 — Visual Polish
- spacing
- typography
- cards
- buttons
- hover/focus states
- responsive improvements
- empty/loading/error states

### Phase 9 — Quality
- remove dead code
- fix console errors
- verify API failures
- verify database persistence
- run production build
- test deployed version

### Phase 10 — Submission
- README
- assumptions
- GitHub
- deployment
- verify both links
- final manual test

## Definition of Done

A feature is done only when:
- it works through the UI;
- API behavior is correct;
- data persists where required;
- errors are handled;
- implementation is understandable;
- no unrelated complexity was introduced.

## AI Usage Strategy

Use AI for:
- architecture review
- boilerplate
- debugging
- refactoring
- test generation
- documentation

Do not ask AI to dump an entire unfamiliar codebase and then submit it blindly.

After every major AI-generated section:
1. read it;
2. run it;
3. understand it;
4. ask for an explanation if unclear;
5. record important decisions.
