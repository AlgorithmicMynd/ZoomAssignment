# Design Tokens

All values extracted from Zoom's reference design (screenshots + [UIMdfiles/](../UIMdfiles/)).

## Colors

### Backgrounds
- `--color-bg-primary`: `#1C1C1E` — main app background
- `--color-bg-secondary`: `#232325` — cards, modals, elevated surfaces
- `--color-bg-tertiary`: `#2D2D2E` — input backgrounds, subtle elevation
- `--color-bg-dark`: `#0A0A0A` — near-black, meeting room overlay

### Foreground / Text
- `--color-text-primary`: `#FFFFFF` — primary text
- `--color-text-secondary`: `#A0A0A0` — secondary/dim text
- `--color-text-tertiary`: `#6A6A6A` — very dim text

### Brand Colors
- `--color-brand-primary-blue`: `#0E72ED` — buttons, links, accents, brand
- `--color-brand-orange`: `#F26D21` — "New Meeting" button, high-attention CTA
- `--color-brand-green`: `#23D959` — "Share Screen" button, positive action
- `--color-status-red`: `#E02828` — "End" button, destructive action
- `--color-status-green-accent`: `#00FF00` — active speaker border

### UI Elements
- `--color-border`: `#3A3A3C` — subtle borders and dividers
- `--color-hover`: `#383838` — hover state background lift
- `--color-focus-ring`: `#0E72ED` — focus indicator (= primary blue)

## Spacing

Tailwind default scale (0.25rem = 4px baseline):

- `--spacing-xs`: `0.25rem` (4px)
- `--spacing-sm`: `0.5rem` (8px)
- `--spacing-md`: `1rem` (16px)
- `--spacing-lg`: `1.5rem` (24px)
- `--spacing-xl`: `2rem` (32px)
- `--spacing-2xl`: `3rem` (48px)

Use Tailwind's `gap-`, `p-`, `m-` utilities directly.

## Typography

### Fonts
- `--font-family-sans`: System stack (SF Pro Display, Helvetica Neue, etc.)

### Sizes & Weights
- **Display:** `text-5xl` (3rem), `font-bold` (700) — clock display
- **Heading 1:** `text-2xl` (1.5rem), `font-semibold` (600) — page titles
- **Heading 2:** `text-lg` (1.125rem), `font-semibold` (600) — card titles
- **Body:** `text-base` (1rem), `font-normal` (400) — standard text
- **Label:** `text-sm` (0.875rem), `font-medium` (500) — button labels, badges
- **Caption:** `text-xs` (0.75rem), `font-normal` (400) — secondary info

### Line Height
- `--line-height-tight`: `1.2` — headings
- `--line-height-normal`: `1.5` — body text
- `--line-height-relaxed`: `1.75` — descriptions

## Radius

- `--radius-none`: `0`
- `--radius-sm`: `0.375rem` (6px) — subtle rounding
- `--radius-md`: `0.5rem` (8px) — most UI elements (cards, buttons, inputs)
- `--radius-lg`: `0.75rem` (12px) — modals, larger components
- `--radius-squircle`: `1rem` (16px) — action buttons (squircle approximation)
- `--radius-full`: `9999px` — pills, full circles

## Shadows

- `--shadow-none`: none
- `--shadow-sm`: `0 1px 2px rgba(0, 0, 0, 0.05)`
- `--shadow-md`: `0 4px 6px rgba(0, 0, 0, 0.1)`
- `--shadow-lg`: `0 10px 15px rgba(0, 0, 0, 0.1)` — modals, floating panels
- `--shadow-xl`: `0 20px 25px rgba(0, 0, 0, 0.15)`

## Transitions

- `--duration-fast`: `150ms`
- `--duration-normal`: `200ms`
- `--duration-slow`: `300ms`
- `--easing-ease-out`: `cubic-bezier(0.4, 0, 0.2, 1)`

## Component Tokens

### Buttons

**Primary (Brand):**
- Background: `--color-brand-primary-blue`
- Text: `--color-text-primary`
- Padding: `0.75rem 1.5rem` (py-3 px-6)
- Border radius: `--radius-md`

**Secondary (Outline):**
- Background: transparent
- Border: `1px --color-border`
- Text: `--color-text-primary`
- Padding: `0.75rem 1.5rem`

**Squircle (Action Buttons):**
- Width/Height: `5rem` (80px)
- Background: `--color-brand-primary-blue` or `--color-brand-orange`
- Border radius: `--radius-squircle`
- Icon: centered, white

### Inputs

- Background: `--color-bg-tertiary`
- Border: `1px --color-border`
- Border (focused): `2px --color-focus-ring`
- Text: `--color-text-primary`
- Padding: `0.75rem 1rem`
- Border radius: `--radius-md`

### Cards

- Background: `--color-bg-secondary`
- Border radius: `--radius-lg`
- Padding: `1.5rem`
- Shadow: `--shadow-md`
- Border: `1px --color-border` (optional, subtle)

### Modals

- Overlay: `rgba(0, 0, 0, 0.5)` — semi-transparent dim
- Modal background: `--color-bg-secondary`
- Border radius: `--radius-lg`
- Shadow: `--shadow-xl`

---

## Usage

Encode as CSS custom properties in `globals.css`. Use Tailwind utilities wherever possible; reserve custom properties for values not in the default scale.
