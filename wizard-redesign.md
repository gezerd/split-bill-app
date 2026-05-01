# Wizard Redesign

Redesign the frontend from a single-page layout to a 4-step wizard matching the design mockups.
Steps: Upload → Assign → Tax & Tip → Done.
The accent color `#00FDDC` is applied heavily: CTA buttons, active step indicator, selected states, totals.

---

## Step 1 — StepIndicator component

**New file:** `frontend/src/components/StepIndicator.jsx`

- 4 nodes: Upload, Assign, Tax & Tip, Done
- Connecting lines between nodes
- Completed step: accent circle with checkmark ✓
- Active step: accent circle with number, label in accent below
- Future step: surface-2 circle with number, muted label below

---

## Step 2 — App.jsx wizard shell

**File:** `frontend/src/App.jsx`

- Add `step` state (1–4); starts at 1, advances to 2 after successful upload
- Persistent header: `$` logo (accent square) + "splitbill" wordmark + "STEP N OF 4" right-aligned
- `StepIndicator` shown below header when `billId` exists
- Route step content:
  - Step 1 → `ReceiptUpload`
  - Step 2 → people manager + item list + Next button
  - Step 3 → `TipTaxInput` (receives `onBack` / `onNext` props)
  - Step 4 → `FinalBreakdown` (receives `onBack` prop)
- Step 2→3 Next button disabled until all item quantities are assigned
- Compute `tipPercentage` from `tip / subtotal` and pass to `FinalBreakdown`

---

## Step 3 — ReceiptUpload.jsx

**File:** `frontend/src/components/ReceiptUpload.jsx`

- Hero text above dropzone:
  - `"Split the bill."` — large bold white
  - `"Upload a receipt and AI extracts every item automatically."` — muted subtitle
- Dropzone copy: "Drop your receipt here" / "or click to browse · PNG, JPG, HEIC up to 10MB"
- "Powered by Claude AI" caption below dropzone (small, muted)
- Keep existing drag-over and upload-in-progress states

---

## Step 4 — PeopleManager.jsx

**File:** `frontend/src/components/PeopleManager.jsx`

- Input + "+ Add" button styled with accent color
- People rendered as colored initials bubbles (2-char: first letter of each word, or first 2 chars) + full name beside each
- Delete (×) button on each chip
- Remove `window.confirm` on delete — just delete directly

---

## Step 5 — ItemCard.jsx

**File:** `frontend/src/components/ItemCard.jsx`

- Item name bold; modifier tags as small pill badges below name
- Price top-right; show `×N @ $X.XX` for quantity > 1
- "Assigned to:" row with initials avatar bubbles matching person colors; show "split N ways" if shared
- Accent left border when fully assigned, no border when unassigned
- Keep edit/delete icon buttons (subtle, top-right corner)
- Clicking card body opens AssignmentModal (unchanged)

---

## Step 6 — ItemList.jsx

**File:** `frontend/src/components/ItemList.jsx`

- 2-column grid (1 col mobile, 2 col tablet+)
- Remove top-level section heading (heading is now in App.jsx step 2)
- Keep "Add item manually" toggle and `ItemForm`

---

## Step 7 — TipTaxInput.jsx

**File:** `frontend/src/components/TipTaxInput.jsx`

- Heading: "Tax & tip" + subtitle "These are split proportionally based on what each person ordered."
- Card:
  - Subtotal row (read-only)
  - TAX label + `$`-prefixed input (pre-filled from OCR); "Auto-extracted from receipt" note if value came from OCR
  - TIP label + preset pill buttons: 15% | 18% | 20% | 22% | 25% | Custom
    - Selected: accent bg with dark text
    - Unselected: surface-2 bg with gray text
    - Custom: reveals a number input when selected
  - `= $X.XX` calculated tip amount shown below buttons
- Total bar: accent background, "Total" label + bold total (dark text on teal)
- Footer: "← Back" (surface button) + "See Breakdown →" (accent button)
- Receives `onBack` and `onNext` props from App

---

## Step 8 — FinalBreakdown.jsx

**File:** `frontend/src/components/FinalBreakdown.jsx`

- Heading: "All settled!" + subtitle "Here's what everyone owes."
- Fetch breakdown on mount (called by App when entering step 4)
- Per-person cards in responsive row: 1 col mobile → 2 col → 3 col desktop
  - Header: colored initials avatar + name + "N item(s)" + total in accent (large)
  - Item list: name + per-share amount
  - Divider
  - Subtotal, Tax, Tip rows
  - Total row in accent
- Grand total bar: muted summary "N people · N items · X% tip" + accent bold total
- Footer: "← Back" (calls `onBack`) + "Start New Bill" (reloads page)
- Receives `onBack` and `tipPercentage` props from App

---

## Out of scope

- "Receipt" view toggle on Step 4 (cards view only)
- Backend changes
