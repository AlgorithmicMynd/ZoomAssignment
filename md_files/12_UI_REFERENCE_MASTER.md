# UI Reference Master Index

Mapping of Zoom reference screenshots to their detailed specifications.

| Screenshot | File | Spec File | Description |
|---|---|---|---|
| Home (empty) | [homeScreen.png](../uiImages/homeScreen.png) | [01_home_screen.md](../UIMdfiles/01_home_screen.md) | Dashboard with no upcoming meetings |
| Home (scheduled) | [homeScreenWithUpcomingMeetings.png](../uiImages/homeScreenWithUpcomingMeetings.png) | [02_home_screen_scheduled.md](../UIMdfiles/02_home_screen_scheduled.md) | Dashboard with one upcoming meeting card |
| Action buttons | [howereffect.png](../uiImages/howereffect.png) | [07_action_buttons.md](../UIMdfiles/07_action_buttons.md) | Close-up of squircle buttons (New meeting, Join, Schedule, Share screen, My Notes) |
| Join modal | [joinMeeting.png](../uiImages/joinMeeting.png) | [04_join_meeting_modal.md](../UIMdfiles/04_join_meeting_modal.md) | Modal overlay for joining by ID/link with display name input |
| Schedule modal (top) | [schedule01.png](../uiImages/schedule01.png) | [05_schedule_meeting_modal.md](../UIMdfiles/05_schedule_meeting_modal.md) | Schedule form with title, date/time, timezone, repeat, invitees, meeting ID options |
| Schedule modal (middle) | [schedule02.png](../uiImages/schedule02.png) | [05_schedule_meeting_modal.md](../UIMdfiles/05_schedule_meeting_modal.md) | Schedule form with waiting room, encryption, AI Companion options |
| Schedule modal (bottom) | [schedule03.png](../uiImages/schedule03.png) | [05_schedule_meeting_modal.md](../UIMdfiles/05_schedule_meeting_modal.md) | Schedule form with video, audio, calendar, advanced options, Save button |
| Schedule modal (full) | [scheduleFullscreenPlacement.png](../uiImages/scheduleFullscreenPlacement.png) | [05_schedule_meeting_modal.md](../UIMdfiles/05_schedule_meeting_modal.md) | Full-screen modal context on dashboard |
| Meeting detail popup | [ClickingUpcomingMeetingPopup.png](../uiImages/ClickingUpcomingMeetingPopup.png) | [06_upcoming_meeting_popup.md](../UIMdfiles/06_upcoming_meeting_popup.md) | Side panel with meeting details, start/chat buttons, join link, invitees |
| Meeting room | [insideMeetingUI.png](../uiImages/insideMeetingUI.png) | [03_inside_meeting.md](../UIMdfiles/03_inside_meeting.md) | Meeting room with participant tiles at top, main speaker feed, bottom control bar |

---

## Color Reference

See [13_DESIGN_TOKENS.md](13_DESIGN_TOKENS.md) for all color, spacing, typography, and component tokens.

Key colors from the screenshots:
- Primary background: `#1C1C1E`
- Secondary background (cards/modals): `#232325`
- Primary blue: `#0E72ED`
- Orange (New Meeting CTA): `#F26D21`
- Green (Share Screen): `#23D959`
- Red (End button): `#E02828`

---

## Implementation Notes

### Desktop-First
Screenshots are desktop-only. Build desktop experience first; responsive is a bonus feature (Phase 8).

### Dark Mode Only
All reference UI is dark theme. Do not implement light mode.

### Zoom Fidelity
Visual similarity is explicitly scored in the evaluation. Use the tokens and screenshot specs as the source of truth for spacing, colors, typography, and component layout.

### Excluded Features
The following are rendered in the reference UI but are **not** functional MVP requirements:
- Calendar integration
- AI Companion functionality
- Workflow attachment
- Meeting recording
- Real encryption selection
- Waiting room logic

Implement as **presentational UI only** — no backend required.

### Included Features (Functional)
- Meeting creation (instant + scheduled)
- Meeting ID generation and validation
- Invite link generation
- Join by ID or link
- Display name collection
- Meeting persistence
- Upcoming meetings list
- Recent meetings list
- Meeting room navigation
- Basic room controls (mute, video, chat, share, end — client-side state only)
- Participant count display
