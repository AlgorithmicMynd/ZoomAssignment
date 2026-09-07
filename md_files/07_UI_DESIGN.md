# UI / UX Design Specification

## 1. Assignment Requirement

The assignment explicitly says the application's UI/UX should match the original Zoom application's design, user experience, look and feel, and should totally resemble Zoom.

The PDF also shows the evaluator will score UI/UX visual similarity to Zoom's design and UX patterns.

## 2. Core Screens

### Dashboard
Primary screen containing:
- top navigation/header
- profile/settings placeholders
- prominent New Meeting action
- Join Meeting action
- Schedule Meeting action
- Upcoming Meetings
- Recent Meetings

### Join Screen
Contains:
- Meeting ID / invite link input
- display name input
- Join button
- validation/error state

### Schedule Screen
Contains:
- title
- description
- date
- time
- duration
- create/schedule action

### Meeting Room
Contains:
- meeting content area
- participant/video area
- bottom meeting controls
- leave/end meeting action
- meeting title/ID or other lightweight meeting context

The meeting-room UI should look and behave convincingly as a conferencing room. The assignment does not explicitly require live audio/video transport, so video tiles may use placeholders/local UI state rather than real peer-to-peer media. Do not expand the UI into a full Zoom feature set.

## 3. Visual Language

Target:
- clean professional layout
- Zoom-like spacing and hierarchy
- familiar conferencing controls
- clear primary/secondary actions
- restrained color palette
- strong typography hierarchy
- obvious meeting states
- consistent buttons, cards, inputs, and navigation

## 4. UX Principles

### Fast path
The user should be able to:
`Dashboard → New Meeting → Meeting Room`

### Join path
`Dashboard → Join → Enter ID/name → Meeting Room`

### Schedule path
`Dashboard → Schedule → Submit → Dashboard/Upcoming`

### Error UX
Errors should:
- appear near the relevant control;
- use human-readable messages;
- not expose stack traces.

## 5. Real-Time Media Boundary
The UI must not imply that WebRTC or live media infrastructure exists unless it is actually implemented. Controls such as mute/video can be presented as client-side UI state in the MVP.

## 6. Responsive Design

Responsive design is listed as a bonus feature. Implement it after desktop core workflows are stable.

## 7. Originality

Visual similarity is required, but the codebase must remain original. Do not copy an existing Zoom clone repository.
