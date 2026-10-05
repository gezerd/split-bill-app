# Split Bill — HTML/CSS handoff

Plain, framework-free reference for the Split Bill flow. Every screen is a
standalone HTML page that links one shared stylesheet (`styles.css`). No build
step, no JS, no inline styles — open any file in a browser or read the markup.
Intended as a visual + structural spec to check an implementation against.

## Files

```
handoff/
├── index.html                  ← contact sheet linking every screen
├── styles.css                  ← tokens + all component classes (single source of truth)
├── 01-upload.html              ← Step 1 · upload dropzone (idle)
├── 01-upload-scanning.html     ← Step 1 · scanning ("Scanning with AI…" spinner)
├── 01-upload-processed.html    ← Step 1 · processed ("5 items found!" check)
├── 02-assign-complete.html     ← Step 2 · every Item has Shares → "All assigned ✓"
├── 02-assign-partial.html      ← Step 2 · amber partial Items, "1 unassigned" + "2 partial" pills, Subtotal mismatch banner
├── 02-assign-sharesheet.html   ← Step 2 · Share sheet (names, −/+ stepper, live amounts, status line)
├── 02-assign-focus.html        ← Step 2 · focus mode (a Person selected: banner, tinted + badged cards, others faded)
├── 02-assign-additem.html      ← Step 2 · "Add missing item" modal (name / price per item / quantity / modifiers)
├── 02-assign-edititem.html     ← Step 2 · ✎ edit-item modal (pre-filled, "Save · $X.XX")
├── 02-assign-delete.html       ← Step 2 · ✕ delete-item confirmation dialog
├── 03-taxtip.html              ← Step 3 · "Add tip" → tax field + tip presets + Total pill
├── 03-taxtip-notip.html        ← Step 3 · "No tip" → tip options hidden, tip $0
├── 04-breakdown-cards.html     ← Step 4 · per-person cards
└── 04-breakdown-receipt.html   ← Step 4 · paper-receipt layout
```

Start at `index.html`.

## Design tokens (`:root` in `styles.css`)

| Variable | Value | Role |
|----------|-------|------|
| `--bg` | `#152D42` | page background (deep navy) |
| `--surface` | `#1C3A54` | card / panel surface |
| `--surface-hi` | `#254862` | elevated / inset |
| `--border` | `#2E5674` | borders, dividers |
| `--accent` | `#00FDDC` | **primary brand** (cyan) — CTAs, totals, active states |
| `--accent-dim` | `oklch(92% 0.14 185 / .15)` | accent tint |
| `--on-accent` | `#111111` | text/icons on accent fills |
| `--text` | `#EEF4FA` | primary text |
| `--text-muted` | `#A0C4DC` | secondary text |
| `--text-dim` | `#7AAAB8` | tertiary text |

Avatar palette (cycled by person index): `--c-red #F87171` · `--c-blue #60A5FA`
· `--c-purple #A78BFA` · `--c-green #4ADE80` · `--c-amber #FBBF24` ·
`--c-pink #F472B6` · `--c-orange #FB923C` · `--c-sky #38BDF8`.

**Type:** Plus Jakarta Sans (400–800) everywhere; Courier New for the receipt
breakdown only.

## Class conventions

Block/element naming (loose BEM): `.item-card`, `.item-card__head`,
`.item-card--full`. Avatars combine a base class, an optional size, a palette
class, and a fill state — e.g. `class="avatar avatar--lg ac-blue avatar--filled"`.

## Behavior rules worth knowing

A **Share is a weight** (ADR 0001): an Item's cost is split among everyone holding
Shares on it, in proportion to their Shares. Item status comes only from its Shares:

- **Unassigned** (0 Shares): neutral border (default `.item-card`), status line "Tap a person to assign". Counts toward "N unassigned" and blocks Next.
- **Partially assigned** (≥1 Share, fewer than the quantity): `.item-card--partial` (amber border), amber status line, counts toward the amber "N partial" pill. Never blocks.
- **Fully assigned** (Shares ≥ quantity): `.item-card--full` (cyan border).

Other Step 2 conventions:

- **Calm avatars:** `.avatar--idle` is a grey ring; it fills with the Person's colour (`.avatar--filled`) once they hold a Share, plus a `.x-badge` "×N" above 1. Tapping an avatar toggles ×1 / none.
- **Card footer:** `.item-card__foot` holds the status line and a "Shares ›" link that opens the Share sheet.
- **Focus mode** (`02-assign-focus.html`): while a Person is selected, status borders go neutral, footers are removed, matching cards get `.item-card--match` + `.match-badge`, others `.item-card--dim`.
- **Subtotal mismatch banner** (`.mismatch-banner`): shown when the Items subtotal differs from the receipt subtotal.
- **Chip ×** is an SVG icon centred in a fixed 18px round button (`.person-chip__x`), never a "×" text glyph.
- **Modal controls** are all 46px tall; the Quantity stepper reuses `.stepper` (also used, at 34px, in the Share sheet).
