# UI Design: Inside Meeting UI (`insideMeetingUI.png`)

## General Layout
- **Theme:** Video-first, minimal UI overlays.
- **Main View:** Large video feed of the main speaker (host).
- **Top Bar:** Floating video gallery of other participants.
- **Bottom Bar:** Meeting control bar with action buttons.

## Top Gallery (Speaker View)
- A horizontal row of smaller video feeds at the top center.
- The feeds have rounded corners.
- The active speaker (or pinned video) in the top gallery has a bright green border (approx `#00FF00`).
- Each small feed has a name label in the bottom left corner (semi-transparent black background, white text).
- E.g., "Victoria Reyes", "Henry Park", "Marketing Huddle" (with a red muted mic icon).
- Top right of the screen has a "View" button (grid icon).

## Main Video Feed
- Takes up the majority of the screen.
- Shows the primary speaker in high quality.

## Bottom Control Bar
- Background: Very dark gray/black, slightly transparent or solid.
- Spans the entire width of the screen at the bottom.
- **Left Side:**
    - **Mute:** Microphone icon.
    - **Stop Video:** Camera icon.
    - Both have small `^` arrows next to them for device settings.
- **Center:**
    - **Security:** Shield icon.
    - **Participants:** Two people icon, with a notification badge "3" (indicating participant count).
    - **Chat:** Speech bubble icon.
    - **Share Screen:** Green button (`#23D959` approx) with an upward arrow. Distinct from other buttons to stand out.
    - **Record:** Circle icon.
    - **Apps:** Four squares icon.
- **Right Side:**
    - **End:** Prominent red rectangular button (`#E02828` approx) with white text "End".
