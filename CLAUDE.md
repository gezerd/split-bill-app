# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Docker (recommended)
```bash
# Start all services (frontend, backend, postgres)
docker-compose up --build

# Use mock OCR to avoid API calls during development
MOCK_OCR=true docker-compose up --build

# Stop all services
docker-compose down
```

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
npm run build
```

### Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload          # http://localhost:8000
MOCK_OCR=true uvicorn app.main:app --reload   # skip Anthropic API
```

API docs available at `http://localhost:8000/docs` when running.

## Architecture

**Three-service Docker stack**: React frontend (5173) → FastAPI backend (8000) → PostgreSQL (5432). The database is infrastructure-only in v1; all data lives in a thread-safe in-memory store (`backend/app/services/data_store.py`).

### Request flow

1. User uploads receipt image → `POST /api/bills/upload-receipt`
2. `OCRService` sends image to Claude Haiku 4.5 (base64-encoded) and parses JSON response → creates `Bill` + `Item` records in `InMemoryStore`
3. Frontend (`useBillData` hook) holds all state: `billId`, `items`, `people`, `assignments`, `tax`, `tip`
4. User adds people, taps items to assign via `AssignmentModal` (supports `share_count` for splitting a single item between multiple people)
5. `GET /api/bills/{bill_id}/breakdown` → `CalculationService` computes proportional tax/tip per person based on their subtotal share

### Frontend state management

All API calls and React state live in `frontend/src/hooks/useBillData.js`. Components are pure presentational — they receive handlers and data as props. `App.jsx` manages step (1–4) and passes everything down.

### Backend layers

- `app/routers/` — FastAPI route handlers (bills, items, people, assignments)
- `app/services/data_store.py` — `InMemoryStore` singleton with threading locks
- `app/services/ocr_service.py` — Claude API integration; set `MOCK_OCR=true` to use hardcoded In-N-Out data
- `app/services/calculation_service.py` — proportional split logic
- `app/schemas/` — Pydantic request/response models

### Splitting logic

An `Assignment` links a `Person` to an `Item` with a `share_count`. The item price is `unit_price × quantity`; a person's share is `unit_price × their_share_count`. Tax and tip are distributed proportionally based on each person's subtotal divided by total subtotal.

## Key environment variables

| Variable | Where | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | `backend/.env` | Required for live OCR; get from platform.claude.com |
| `MOCK_OCR` | shell / `.env` | Set to `true` to skip Claude API calls |
| `VITE_API_URL` | frontend env | Backend URL (default: `http://localhost:8000`) |
| `CORS_ORIGINS` | backend env | Comma-separated allowed origins |

## UI Verification Rule

**After making any UI change**, verify the result matches the design handoff before considering the task complete. Follow these steps every time:

1. **Run the app** — start the Vite dev server (`cd frontend && npm run dev`) if not already running.
2. **Navigate** to `http://localhost:5173` and reach the affected screen/step.
3. **Screenshot** the current UI state.
4. **Read the reference** — the pixel-perfect screenshot and component source for that screen (see map below).
5. **Compare** — check colors, spacing, typography, radius, layout, and interactive states against the reference.
6. **Fix and repeat** — make the necessary code changes and loop back to step 3 until the live UI matches exactly.

If no reference exists for the changed area, note that and skip.

### Design reference files

All design files live in `designs/`. The handoff is **high-fidelity** — final colors, typography, spacing, radii, interactions, and copy are all settled. Recreate pixel-for-pixel.

**Screen reference** (`designs/screens/`): Static full-height HTML snapshots — open in a browser and use dev tools to inspect exact spacing, color, and type off any element. All render with the **cyan (default) accent**.

| File | Screen |
|------|--------|
| `screens/index.html` | Contact sheet — thumbnails linking all screens |
| `screens/01-upload.html` | Step 1 — upload dropzone (idle) |
| `screens/02-assign-complete.html` | Step 2 — every item fully assigned → "All assigned ✓" |
| `screens/02-assign-partial.html` | Step 2 — some quantities unfilled → "2 unassigned" |
| `screens/03-taxtip.html` | Step 3 — tax field, 20% tip, Total pill |
| `screens/04-breakdown-cards.html` | Step 4 — per-person cards layout |
| `screens/05-breakdown-receipt.html` | Step 4 — paper-receipt layout |

**Component source** (`designs/src/components/`): `SplitBillApp.tsx`, `ItemCard.tsx`, `AssignModal.tsx`, `StepBar.tsx`, `Stepper.tsx`, `Avatar.tsx`, `steps/UploadStep.tsx`, `steps/AssignStep.tsx`, `steps/TaxTipStep.tsx`, `steps/BreakdownStep.tsx`, `breakdown/CardBreakdown.tsx`, `breakdown/ReceiptBreakdown.tsx`.

**Full interactive prototype**: `designs/reference/Split Bill App.html` — open in a browser for live reference.

### Design tokens (source of truth)

Colors are CSS-variable-backed. Use the semantic Tailwind names from `designs/tailwind.config.js`:

| CSS var | Value | Tailwind class | Role |
|---------|-------|----------------|------|
| `--bg` | `#152D42` | `bg-canvas` | Page background (deep navy) |
| `--surface` | `#1C3A54` | `bg-surface` | Card / panel |
| `--surface-hi` | `#254862` | `bg-surface-hi` | Elevated / inset surface |
| `--border` | `#2E5674` | `border-line` | Borders, dividers |
| `--accent` | `#00FDDC` (cyan) | `bg-accent` / `text-accent` | Primary brand — CTAs, totals, active |
| `--accent-dim` | `oklch(92% 0.14 185 / .15)` | `bg-accent-dim` | Accent tint (selected backgrounds) |
| `--text` | `#EEF4FA` | `text-ink` | Primary text |
| `--text-muted` | `#A0C4DC` | `text-ink-muted` | Secondary text |
| `--text-dim` | `#7AAAB8` | `text-ink-dim` | Tertiary text |

- On-accent foreground: `text-[#111]` (near-black on any accent fill)
- Avatar colors (cycled by person index): `#F87171` `#60A5FA` `#A78BFA` `#4ADE80` `#FBBF24` `#F472B6` `#FB923C` `#38BDF8`

### Typography

- **Font:** Plus Jakarta Sans (weights 400/500/600/700/800) — already loaded via CDN in `index.html`
- **Mono:** Courier New — Step 4 receipt view only
- **Scale:** 34/800 page title · 26/800 step heading · 22/800 person total · 17–18/800 item/modal title · 15–16 body/input · 13–14 labels · 11–12 meta · 10 modifier chip
- **Letter-spacing:** `-0.5px` on big title, `-1px` on total figure, `+1–3px` on uppercase labels

### Radius scale

`6` chips · `9–12` buttons/inputs/small tiles · `13–14` primary buttons/inputs · `18` item card / total pill · `20–24` panels & dropzone · `full` avatars, people chips, steppers, status pills

### Spacing & layout

- App shell: `max-w-[760px]`, centered, padding `36px 20px 80px`
- Item grid (Step 2) and card grid (Step 4): CSS Grid, `repeat(auto-fill, minmax(250px, 1fr))`, gap `12–14px`
- TaxTip and Upload steps: `max-w-[500px]` / `max-w-[540px]`; receipt: `max-w-[380px]`

### Motion

| Animation | Value | Used on |
|-----------|-------|---------|
| `fade-up` | `fadeUp .3s ease both` (12px rise + fade) | Every step on mount |
| `scale-in` | `scaleIn .25s cubic-bezier(.34,1.56,.64,1)` (springy) | Modal, upload success check |
| `spin-slow` | `spin .7s linear infinite` | Upload scanning spinner |
| Transitions | `.15s` controls · `.2s` cards · `.35s cubic-bezier(.4,0,.2,1)` step bar | Hovers, selection, progress |

### Screen-by-screen spec (quick reference)

**Step 1 — Upload:** Centered max-540px. H1 "Split the bill." + subtitle. Large dashed dropzone (radius 24, padding ~72×40). States: idle → uploading (spinner + "Scanning with AI…") → done (accent check + item count) → auto-advance. Border turns accent on drag-over and success; bg becomes `accent-dim` while dragging.

**Step 2 — Assign:** Name input + "Add" row → wrap of removable people chips → status pill (unassigned/all-assigned) → item card grid → right-aligned Next button. Next disabled until ≥1 person and all items assigned. ItemCard border turns accent when assigned.

**Step 3 — Tax & Tip:** Max-500px panel. Subtotal row → editable Tax `$` field → Tip preset buttons (15/18/20/22/25% + Custom) → full-width **accent Total pill** (28px figure). Back + "See Breakdown".

**Step 4 — Breakdown:** "All settled!" heading + Cards/Receipt segmented toggle. Cards: grid of per-person cards with avatar, item count, accent total, itemized lines with `(myShares/totalShares)`, Subtotal/Tax/Tip footer. Receipt: 380px monospace with torn SVG edges, dashed dividers, per-person colored names.

## Design tokens

Tailwind theme is extended in `frontend/tailwind.config.js`. Key tokens:
- `background` → `#152D42` (dark blue page bg)
- `surface` → `#1C3A54` (card bg)
- `accent` → `#00FDDC` (cyan — primary interactive color)
- `border` → `#2E5674`

Font: Plus Jakarta Sans (loaded via CDN in `index.html`).
