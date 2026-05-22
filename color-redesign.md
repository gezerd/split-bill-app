# Color Redesign — Linear Wave Palette

## New Palette

| Token | Value | Role |
|---|---|---|
| `--bg` | `#152D42` | Page background |
| `--surface` | `#1C3A54` | Card / panel surface |
| `--surface-hi` | `#254862` | Elevated surface |
| `--border` | `#2E5674` | Border / divider |
| `--text` | `#EEF4FA` | Primary text |
| `--text-muted` | `#A0C4DC` | Secondary text |
| `--text-dim` | `#7AAAB8` | Tertiary text |
| `--accent` | `#E6AE00` | Warm gold — CTA buttons, totals |
| `--accent-dim` | `#E6AE0026` | Subtle accent fill |
| `--on-accent` | `#111` | Dark text rendered on accent backgrounds |

---

## ~~Step 1 — tailwind.config.js~~ ✅

**File:** `frontend/tailwind.config.js`

| Key | Current value | New value |
|---|---|---|
| `accent` | `'#00FDDC'` | `'#E6AE00'` |
| `accent-dim` | *(missing)* | `'#E6AE0026'` — add new key |
| `on-accent` | *(missing)* | `'#111'` — add new key |
| `surface.DEFAULT` | `'#3A4D45'` | `'#1C3A54'` |
| `surface.2` | `'#4A5E56'` | `'#254862'` |
| `surface.3` | `'#3D4E44'` | `'#254862'` |
| `border` | *(missing)* | `'#2E5674'` — add new key |
| `gray.100` | *(not set)* | `'#EEF4FA'` |
| `gray.200` | *(not set)* | `'#C8DCEE'` |
| `gray.300` | *(not set)* | `'#A0C4DC'` |
| `gray.400` | *(not set)* | `'#A0C4DC'` |
| `gray.500` | *(not set)* | `'#7AAAB8'` |
| `gray.600` | *(not set)* | `'#7AAAB8'` |
| `gray.700` | *(not set)* | `'#2E5674'` |
| `primary.500` | `'#5A6E66'` | `'#E6AE00'` — remap to accent gold |
| `primary.600` | `'#4A5C54'` | `'oklch(72% 0.16 85)'` — slightly darker gold for hover |
| `secondary.50` | `'#22293A'` | `'#E6AE0026'` — remap to accent-dim |
| `secondary.500` | `'#CDD1DE'` | `'#E6AE00'` — remap to accent gold |

Keep the `primary` and `secondary` keys — just remap the slots used in components so class names in JSX don't need to change.

---

## Step 2 — PeopleManager.jsx

**File:** `frontend/src/components/PeopleManager.jsx`

Replace `AVATAR_COLORS` array:

| Slot | Current | New |
|---|---|---|
| 0 | `'bg-red-500/80'` | `'bg-[#F87171]'` |
| 1 | `'bg-blue-500/80'` | `'bg-[#60A5FA]'` |
| 2 | `'bg-purple-500/80'` | `'bg-[#A78BFA]'` |
| 3 | `'bg-pink-500/80'` | `'bg-[#4ADE80]'` |
| 4 | `'bg-yellow-500/80'` | `'bg-[#FBBF24]'` |
| 5 | `'bg-indigo-500/80'` | `'bg-[#F472B6]'` |
| 6 | *(add)* | `'bg-[#FB923C]'` |
| 7 | *(add)* | `'bg-[#38BDF8]'` |

---

## Step 3 — StepIndicator.jsx

**File:** `frontend/src/components/StepIndicator.jsx`

- `text-background` → `text-on-accent` on the active/completed step circle

---

## Step 4 — ReceiptUpload.jsx

**File:** `frontend/src/components/ReceiptUpload.jsx`

- `text-white` → `text-gray-100` (heading + dropzone label)
- `bg-accent/5` → `bg-accent-dim` (drag-active dropzone fill)
- `border-gray-600` → `border-border` (default dropzone border)

---

## Step 5 — ItemCard.jsx

**File:** `frontend/src/components/ItemCard.jsx`

- `bg-accent text-background` → `bg-accent text-on-accent` on the `×N` share count badge

---

## Step 6 — TipTaxInput.jsx

**File:** `frontend/src/components/TipTaxInput.jsx`

- `bg-accent text-background` → `bg-accent text-on-accent` on selected tip preset pills
- `bg-accent text-background` → `bg-accent text-on-accent` on the "See Breakdown →" footer button
- `border-gray-700` → `border-border` on the card `<hr>` and inputs

---

## Step 7 — FinalBreakdown.jsx

**File:** `frontend/src/components/FinalBreakdown.jsx`

- `bg-accent text-background` → `bg-accent text-on-accent` on the "Start New Bill" button

---

## Step 8 — App.jsx

**File:** `frontend/src/App.jsx`

- `text-background` → `text-on-accent` on the "Next: Tax & Tip →" button (step 2)

---

## Step 9 — AssignmentModal.jsx

**File:** `frontend/src/components/AssignmentModal.jsx`

- `border-gray-700` / `border-gray-600` → `border-border`
- `text-white` → `text-on-accent` on the Save button (keeps `bg-primary-500 hover:bg-primary-600`, color now resolves to gold)

> `border-secondary-500 bg-secondary-50` and `focus:ring-primary-500` require no class changes — the remapped config values handle them.

---

## Step 10 — ItemForm.jsx

**File:** `frontend/src/components/ItemForm.jsx`

- `border-gray-700` / `border-gray-600` → `border-border`
- `text-white` → `text-on-accent` on the submit button (keeps `bg-primary-500 hover:bg-primary-600`)

> `focus:ring-primary-500` on inputs requires no class change — the remapped config value handles it.
