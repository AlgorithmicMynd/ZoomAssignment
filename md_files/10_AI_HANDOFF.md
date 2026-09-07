# AI Handoff Protocol

This file is intended to be pasted into or supplied to any new AI coding assistant.

## You Are Joining an Existing Project

Do not assume the repository is yours to redesign.

Read:
1. `01_PROJECT_CONTEXT.md`
2. `02_SYSTEM_PROMPT.md`
3. `03_SRS.md`
4. `04_ARCHITECTURE.md`
5. `05_DATABASE_DESIGN.md`
6. `06_API_SPEC.md`
7. `07_UI_DESIGN.md`
8. `08_DEVELOPMENT_PLAN.md`
9. `09_DECISION_LOG.md`

Then inspect the actual repository before changing anything.

## First Response

Before writing code, return:
1. your understanding of the current architecture;
2. current implementation status;
3. missing requirements;
4. files you intend to change;
5. any contradictions between documentation and code.

Do not rewrite the project just because you would personally structure it differently.

## Context Rules

- Documentation is the intended architectural source of truth.
- Existing working code is evidence of current implementation.
- If documentation and code conflict, flag the conflict before changing it.
- Never silently remove working functionality.
- Keep the assignment's must-have features above bonuses.
- Do not assume that "video conferencing" means live WebRTC is required. The assignment does not specify a real-time media layer.
- If proposing WebRTC or any media infrastructure, first explain what explicit requirement it satisfies and why the MVP cannot meet the requirement without it.

## Change Rules

For each requested feature:
1. explain the approach briefly;
2. implement only the required scope;
3. test it;
4. report changed files;
5. update documentation if the architecture or API changed.

## Code Quality

Prefer:
- small modules
- explicit names
- predictable API contracts
- reusable UI components
- clear validation
- minimal dependencies

Avoid:
- unnecessary abstractions
- premature microservices
- giant components
- duplicated API logic
- unexplained magic values
- adding libraries without justification

## Interview Readiness

Any code you generate must be explainable.

When requested, explain:
- data flow
- request lifecycle
- database interaction
- component responsibilities
- failure cases
- trade-offs
- scaling path
