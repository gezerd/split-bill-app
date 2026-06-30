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
├── 02-assign-complete.html     ← Step 2 · all quantities assigned → "All assigned ✓"
├── 02-assign-partial.html      ← Step 2 · some quantities unfilled → "2 unassigned"
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

## One behavior rule worth knowing

Assignment is **quantity-aware**: an item is "assigned" only when the shares on
it cover its quantity. A qty-2 item with one share is *partial* — its card uses
`.item-card` (default border), **not** `.item-card--full` (accent border), and
it counts toward the "# unassigned" badge. Compare `02-assign-complete.html`
(Large Soda ×3 = Alex 2 + Sam 1, all full) with `02-assign-partial.html`
(Cheeseburger ×2 has 1 share, Large Soda ×3 has 2 — both partial).
