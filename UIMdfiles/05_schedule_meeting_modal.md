# UI Design: Schedule Meeting Modal (`schedule01.png`, `schedule02.png`, `schedule03.png`, `scheduleFullscreenPlacement.png`)

## General Layout & Placement
- A large modal window overlay, typically centered. The background application is dimmed.
- **Close Button:** Top right corner `x` and expand `⤢` arrows.
- **Modal Background:** Dark gray (`#232325`).
- Scrollable vertically.

## Form Sections

### Header & Title
- **Banner:** Optional blue alert banner at the very top ("You haven't connected your calendar yet...").
- **Meeting Topic:** A large text input field prominently outlined in blue when focused. Pre-filled with "[User]'s Zoom Meeting" (e.g., "Harsh Shukla's Zoom Meeting").
- **Date/Time Selectors:**
    - Start Date, Start Time -> End Time, End Date. Rounded dark input boxes.
    - Timezone dropdown below: "(GMT+05:30) Mumbai, Kolkata, ...".
    - "Repeat" dropdown: "Never ˅".

### Invitees & Meeting ID
- **Invitees:** Label, followed by a dark rounded input box "Add invitees".
- **Meeting ID:** Radio buttons.
    - Checked (Blue dot): "Generate Automatically"
    - Unchecked: "Personal Meeting ID ..."

### Agenda, Attachments, Security
- **Meeting agenda:** "Create agenda" blue link next to a white "NEW" pill badge.
- **Attachments:** Label with `i` info icon. Button: `+ Add attachments` (dark outline).
- **Meeting Security:**
    - Checkbox: "Waiting Room" (Only users admitted by the host can join...).
    - **Encryption:** Radio buttons.
        - Checked (Blue dot): "Enhanced encryption" with a green shield icon.
        - Unchecked: "End-to-end encryption" with a green lock icon.

### Options & Workflows
- **AI Companion:** Checkboxes for "Automatically start AI Companion", "Automatically start meeting questions", "Automatically start meeting summary".
- **Workflows:** Blue link "Attach workflow to this meeting".
- **My Notes:** Checkbox (checked, blue background with white tick) "Allow everyone to use the meeting transcript with My Notes".
- **Meeting chat:** Checkbox (checked) "Enable Continuous Meeting Chat".

### Video, Audio, Calendar
- **Video:** Toggle switches for "Host: Off" and "Participant: Off". Gray when off.
- **Audio:** Radio button (checked) "Computer Audio".
- **Calendar:** Radio buttons for "iCal", "Outlook" (checked, blue dot), "Google Calendar", "Other Calendars".
- **Advanced:** An expandable chevron `> Advanced`.

### Footer
- Fixed at the bottom of the modal.
- Left/Center: "More Options" blue link.
- Right: Prominent "Save" button (solid blue `#0E72ED`).
