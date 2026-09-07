# UI Design: Join Meeting Modal (`joinMeeting.png`)

## General Layout
- An overlay modal centered on the Home Screen.
- The background (home screen) is dimmed/darkened with a semi-transparent black overlay to focus attention on the modal.

## Modal Design
- **Background:** Dark gray (`#232325` approx), matching the cards on the home screen.
- **Shape:** Rounded rectangle, with subtle drop shadow.
- **Header:**
    - Title: "Join meeting" (White, bold, large font).
- **Inputs:**
    - **Meeting ID Input:** Rounded border, dark background. Contains a dropdown arrow. Placeholder: "Meeting ID or personal link name". Currently focused (blue border).
    - **Name Input:** Rounded border. Contains the user's name: "Harsh Shukla".
- **Checkboxes:**
    - "Don't connect to audio"
    - "Turn off my video"
    - Standard square checkboxes, un-checked.
- **Action Buttons (Bottom Right):**
    - **Cancel:** Dark gray background, white text.
    - **Join:** Disabled state (darker gray text/background), becomes blue when valid input is entered.
