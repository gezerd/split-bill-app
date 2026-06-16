# Handoff: Split Bill

A 4-step flow to scan a restaurant receipt, assign each item to people, add tax & tip, and show what everyone owes.

---

## About the design files

The files in this bundle are a **design reference**. They were authored as a self-contained HTML/React prototype (`reference/Split Bill App.html`) and then **converted into clean, framework-portable React + Tailwind source** under `src/`. Treat the `src/` files as a faithful, idiomatic starting point — **not** as drop-in production code. Your job is to **recreate this design inside the target codebase**, using its existing conventions (its state layer, its data-fetching, its component primitives, its lint/format rules). If there is no codebase yet, this `src/` tree is a reasonable foundation to build on directly.

The prototype runs entirely on **mock data** and **simulated** receipt scanning — there is no backend, OCR, auth, or persistence. Those are yours to wire up.

## Fidelity

**High-fidelity.** Final colors, typography, spacing, radii, interactions, and copy are all settled. Recreate the UI pixel-for-pixel using your codebase's libraries. Exact token values are below and encoded in `tailwind.config.js` + `src/styles/globals.css`.

---

## Screen reference (`screens/`)

Static, **full-height** snapshots of each screen, captured straight from the live prototype with scripts stripped so each opens frozen on its state. Open `screens/index.html` for a contact sheet that links all five, or open any file directly and use your browser's dev tools to read exact spacing, color, and type off any element. These render with the **gold (default) accent**.

| File | Screen |
|------|--------|
| `screens/index.html` | Contact sheet — thumbnails linking all screens |
| `screens/01-upload.html` | Step 1 — upload dropzone (idle) |
| `screens/02-assign-complete.html` | Step 2 — every item fully assigned (Large Soda ×3 split 2 / 1) → "All assigned ✓" |
| `screens/02-assign-partial.html` | Step 2 — some quantities unfilled (Cheeseburger ×2 with 1 share, Large Soda ×3 with 2) → "2 unassigned" |
| `screens/03-taxtip.html` | Step 3 — tax field, 20% tip, Total pill |
| `screens/04-breakdown-cards.html` | Step 4 — per-person cards layout |
| `screens/05-breakdown-receipt.html` | Step 4 — paper-receipt layout |

> These are **visual reference only** — flattened DOM snapshots, not the source to build from. Build from `src/` (and the runnable `reference/` prototype). Note one cosmetic artifact carried from the live capture: the receipt's torn-edge SVG uses `fill='%23232E27'` as its "behind the paper" color; against the `#152D42` page it reads slightly off. In `src/components/breakdown/ReceiptBreakdown.tsx` that fill is documented — match it to `--bg` for a clean tear.

## Tech & conventions used here

- **React 18** function components + hooks. No external state library — all state lives in `SplitBillApp` and flows down via props.
- **Tailwind CSS** for styling. Design tokens are exposed as CSS variables and mapped to semantic Tailwind color names (see token table). Truly *dynamic* values (per-person avatar color, parameterized pixel sizes, state-driven conditional colors) are kept as inline `style={}` — this is intentional and called out in component comments.
- **TypeScript** (`.tsx` / `.ts`). To use plain JS, strip the type annotations and `src/types.ts`; nothing else depends on TS.

> The prototype exposed the five design variants (assignment style, etc.) through a floating "Tweaks" panel driven by `postMessage`. That panel was a **prototyping harness and is intentionally omitted** from `src/`. The same variants survive as a typed `SplitBillConfig` prop on `<SplitBillApp>`.

---

## File map

```
design_handoff_split_bill/
├── README.md                      ← you are here
├── tailwind.config.js             ← color/font/animation tokens (CSS-var backed)
├── reference/
│   └── Split Bill App.html        ← original runnable prototype (open in a browser)
├── screens/                       ← static full-height snapshots of each screen
│   ├── index.html                 ← contact sheet linking all five
│   ├── 01-upload.html
│   ├── 02-assign.html
│   ├── 03-taxtip.html
│   ├── 04-breakdown-cards.html
│   └── 05-breakdown-receipt.html
└── src/
    ├── styles/globals.css         ← @font import, CSS-var tokens, keyframes, scrollbar
    ├── types.ts                   ← Item, Person, Assignments, variant unions, PersonBreakdown
    ├── lib/
    │   ├── format.ts              ← initials(), fmt()  (money formatting)
    │   ├── assignments.ts         ← share helpers + calcBreakdown() (the core math)
    │   ├── constants.ts           ← AVATAR_COLORS, ACCENTS, TEXT_CONTRAST, tips, mock data
    │   └── theme.ts               ← useTheme() — applies accent/text vars to :root
    └── components/
        ├── SplitBillApp.tsx       ← top-level state machine + layout shell (start here)
        ├── StepBar.tsx            ← 4-step progress indicator
        ├── Avatar.tsx             ← circular initials chip
        ├── Stepper.tsx            ← −/value/+ control (md & sm)
        ├── ItemCard.tsx           ← receipt line item + 3 assignment UIs
        ├── AssignModal.tsx        ← modal assignment editor
        ├── steps/
        │   ├── UploadStep.tsx     ← Step 1: dropzone + simulated scan
        │   ├── AssignStep.tsx     ← Step 2: add people + assign items
        │   ├── TaxTipStep.tsx     ← Step 3: tax field + tip presets/custom
        │   └── BreakdownStep.tsx  ← Step 4: cards/receipt toggle
        └── breakdown/
            ├── CardBreakdown.tsx  ← per-person summary cards
            └── ReceiptBreakdown.tsx ← paper-receipt layout
```

**Quick start in an existing app:** copy `src/` in, ensure `globals.css` is imported once at the root, merge `tailwind.config.js`'s `theme.extend`, then render `<SplitBillApp />`.

---

## Design tokens

### Colors

Tokens live as CSS variables in `globals.css` and are mapped to semantic Tailwind names in `tailwind.config.js`. The semantic names avoid Tailwind's built-in `text-*` collision.

| CSS variable     | Default              | Tailwind name              | Role |
|------------------|----------------------|----------------------------|------|
| `--bg`           | `#152D42`            | `canvas` (`bg-canvas`)     | Page background (deep navy) |
| `--surface`      | `#1C3A54`            | `surface` (`bg-surface`)   | Card / panel surface |
| `--surface-hi`   | `#254862`            | `surface.hi` (`bg-surface-hi`) | Elevated / inset surface |
| `--border`       | `#2E5674`            | `line` (`border-line`)     | Borders, dividers |
| `--accent`       | `#00FDDC`            | `accent` (`bg-accent`)     | **Primary brand** — CTAs, totals, active states (cyan) |
| `--accent-dim`   | `oklch(92% 0.14 185 / .15)` | `accent.dim` (`bg-accent-dim`) | Accent tint (selected backgrounds) |
| `--text`         | `#EEF4FA`            | `ink` (`text-ink`)         | Primary text |
| `--text-muted`   | `#A0C4DC`            | `ink.muted` (`text-ink-muted`) | Secondary text |
| `--text-dim`     | `#7AAAB8`            | `ink.dim` (`text-ink-dim`) | Tertiary text |

- **On-accent foreground:** `#111` (near-black) for any text/icon sitting on an accent fill — written as `text-[#111]` in components.
- **`--accent` is the one true primary color.** The deep navy `--bg` is the secondary identity color.

**Avatar palette** (`AVATAR_COLORS`, cycled by person index — data-driven, not a Tailwind token):
`#F87171` `#60A5FA` `#A78BFA` `#4ADE80` `#FBBF24` `#F472B6` `#FB923C` `#38BDF8`

### Runtime theme variants

`useTheme(accent, textContrast)` overwrites the relevant CSS vars on `:root`:

- **Accent** (`ACCENTS`): `cyan #00FDDC` *(default)* · `mint oklch(76% 0.22 148)` · `gold oklch(78% 0.16 85)` · `coral oklch(70% 0.18 25)`
- **Secondary text** (`TEXT_CONTRAST`): `subtle {#7AAAC4,#4A7898}` · `balanced {#A0C4DC,#7AAAB8}` *(default)* · `bright {#C4DCF0,#9BBAD0}`

### Typography

- **Family:** `Plus Jakarta Sans` (weights 400/500/600/700/800), loaded via Google Fonts in `globals.css`.
- **Mono:** `Courier New` — used **only** in the Step-4 receipt view.
- **Scale observed:** 34/800 (page title) · 26/800 (step heading) · 22/800 (person total) · 17–18/800 (item / modal title) · 15–16 (body / input) · 13–14 (labels) · 11–12 (meta) · 10 (modifier chip). Letter-spacing: `-0.5px` on the big title, `-1px` on the total figure, `+1–3px` on uppercase labels/receipt headers.

### Radius scale

`6` chips · `9–12` buttons/inputs/small tiles · `13–14` primary buttons/inputs · `18` item card / total pill · `20–24` panels & dropzone · `full` avatars, people chips, steppers, status pills.

### Spacing & layout

- App shell: `max-w-[760px]`, centered, padding `36px 20px 80px`.
- Item grid (Step 2) and card grid (Step 4): CSS Grid, `repeat(auto-fill, minmax(250px / 270px, 1fr))`, gap `12–14px`.
- TaxTip and Upload steps constrained to `max-w-[500px]` / `max-w-[540px]`; receipt to `max-w-[380px]`.

### Motion

| Name | Value | Used on |
|------|-------|---------|
| `fade-up` | `fadeUp .3s ease both` (12px rise + fade) | every step on mount |
| `scale-in` | `scaleIn .25s cubic-bezier(.34,1.56,.64,1)` (springy) | modal, upload success check |
| `spin` | `spin .7s linear infinite` | upload scanning spinner |
| transitions | `.15s` controls · `.2s` cards · `.35s cubic-bezier(.4,0,.2,1)` step bar | hovers, selection, progress |

---

## Screens / views

The flow is a 4-step linear state machine (`step` 0→3 in `SplitBillApp`). A `StepBar` shows progress on steps 2–4 (it maps Upload→Assign→Tax & Tip→Done).

### 1 · Upload (`UploadStep`)
- **Purpose:** Bring in a receipt; AI extracts line items.
- **Layout:** Centered, max 540px. H1 "Split the bill." + subtitle, then a large dashed-border dropzone (radius 24, padding 72×40).
- **States:** `idle` (upload glyph + "Drop your receipt here") → `uploading` (spinner + "Scanning with AI…", 2s) → `done` (accent check + "5 items found!", 0.7s) → advances. Border turns accent on drag-over and on success; background becomes `accent-dim` while dragging.
- **To wire up:** Replace the simulated `setTimeout` with a real file input + upload + OCR. On success, set `items` and advance. Accepts PNG/JPG/HEIC ≤10MB (copy only — not enforced).

### 2 · Assign (`AssignStep`)
- **Purpose:** Add the people splitting, then assign every item.
- **Layout:** Name input + "Add" button row → wrap of removable people chips → "Items from receipt" label with an unassigned/all-assigned status pill → responsive grid of `ItemCard`s → right-aligned Next button.
- **Behavior:** Enter or "+ Add" appends a person (`id: Date.now()`); removing a person also strips them from all assignments. **Assignment is quantity-aware:** an item counts as assigned only when the shares on it cover its `quantity` (sum of shares ≥ quantity). A qty-2 item with one share is *partial* — its card is **not** highlighted and it counts toward the "# unassigned" pill. Next is disabled until `people.length > 0` **and** every item is fully assigned; the button label reflects what's blocking (e.g. "2 items remaining").
- **`ItemCard` has three assignment UIs** (selected by config):
  - `inline` + `cycle` *(default)* — tap an avatar to cycle shares `0→1→…→max→0`; a `×N` badge shows counts >1 (`max = max(quantity, 2)`).
  - `inline` + `stepper` — tap an unfilled avatar to add at 1, then a small −/+ `Stepper` appears in an accent pill.
  - `modal` — avatars + an "Assign" button open `AssignModal` (per-person steppers, live "pays $X", running share total, Cancel/Save).
  - Card border turns accent only once the item is **fully assigned** (shares ≥ quantity); a partially-assigned card keeps the default border.

### 3 · Tax & Tip (`TaxTipStep`)
- **Purpose:** Confirm tax and choose a tip.
- **Layout:** Max 500px panel — Subtotal row, editable Tax `$` field (pre-filled, "Auto-extracted from receipt, tap to edit"), Tip preset buttons `15/18/20/22/25%` + Custom, then a full-width **accent Total pill** (28px figure). Back + "See Breakdown" buttons.
- **Behavior:** Tip is either a % of subtotal (default 18%) or a custom dollar amount. `total = subtotal + tax + tip`. Tax & tip are stored, then split proportionally in Step 4.

### 4 · Breakdown (`BreakdownStep`)
- **Purpose:** Show what each person owes.
- **Layout:** "All settled!" heading + a **Cards / Receipt** segmented toggle (seeded from config).
  - `CardBreakdown` — grid of per-person cards: avatar, item count, accent total, itemized lines with `(myShares/totalShares)` annotations, and a Subtotal/Tax/Tip footer (rows hidden when ~0).
  - `ReceiptBreakdown` — 380px monospace "paper receipt" with torn zig-zag top/bottom edges (inline SVG mask), dashed/dotted dividers, per-person colored names, and grand totals.
- **Actions:** Back, and "Start New Bill" which resets all state to Step 1.

---

## The core math (`lib/assignments.ts`)

`Assignments` is `{ [itemId]: { [personId]: shareCount } }`. **An item's cost is divided in proportion to share counts, not split evenly** — `personAmount = (price × quantity) × myShares / totalShares`. `calcBreakdown()` then allocates **tax and tip per person in proportion to that person's share of the subtotal**. This is the heart of the product — port it exactly; everything visual depends on it.

---

## State

All in `SplitBillApp` (lift into your store/router as needed):

| State | Type | Notes |
|-------|------|-------|
| `step` | `0–3` | linear flow index |
| `people` | `Person[]` | `{ id, name }`, id from `Date.now()` in the prototype — use real ids |
| `items` | `Item[]` | from receipt scan (mocked as `MOCK_ITEMS`) |
| `assignments` | `Assignments` | nested share map (see above) |
| `tax` | `number` | seeded from `MOCK_TAX` (1.87) |
| `tip` | `number` | dollar amount (computed from % or custom) |

Variant selection is the `SplitBillConfig` prop: `assignStyle` `inline\|modal`, `inlineMode` `cycle\|stepper`, `breakdownStyle` `cards\|receipt`, `accentColor` `mint\|gold\|coral\|cyan`, `textContrast` `subtle\|balanced\|bright`.

---

## Build-out checklist (mock → real)

- [ ] Receipt **upload + OCR** to produce `Item[]` (replace `UploadStep`'s simulated scan & `MOCK_ITEMS`).
- [ ] Real **person ids** and, if multiuser, contacts/invites (replace `Date.now()`).
- [ ] **Persistence** of a bill (items, people, assignments, tax, tip) + share/export of the breakdown.
- [ ] **Validation:** file type/size on upload; numeric guards on tax/custom-tip.
- [ ] Decide whether the five variants are fixed product config or user-facing settings.
- [ ] Accessibility pass: focus traps in `AssignModal`, keyboard operation of avatar-toggle assignment, `aria-current` on `StepBar`, labels on icon-only buttons.

## Assets

No external image/icon assets — the upload arrow and torn receipt edge are inline SVG, and the wordmark is a styled `$` glyph. Fonts load from Google Fonts. Nothing to copy.
