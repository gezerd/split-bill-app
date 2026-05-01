# Split Bill App — Project Reference

## Context

A web app that lets a group of people split a restaurant bill. The user uploads a receipt photo, the app parses it with Claude's vision API, then the user assigns each item (or quantity unit) to one or more people. The app calculates each person's share including proportional tax and tip.

Not designed to persist data across sessions — each page load starts a fresh bill.

### OCR Provider History

The app originally used **Google Cloud Vision** for receipt parsing. GCV performs raw text extraction well but has no semantic understanding — it returns a flat block of text with no awareness of what fields like quantity, unit price, or line total mean. Transforming that output into structured bill data (items, quantities, prices, modifiers) required brittle post-processing that broke on receipt format variations. Replaced with **Anthropic claude-haiku-4-5** (vision), which understands receipt structure directly and returns structured JSON in a single API call.

---

## Original Prompt / Product Spec

> I want to create a React app that splits bills. Here is a workflow:
> 1. Upload an image of a receipt.
> 2. Assign different items to different people.
> 3. Create new names, add, or remove people.
> 4. If there are multiples of an item, they can be assigned to different people.
> 5. If tip is not included in the receipt, it can be manually entered as percentage or dollar amount.
> 6. Once submitted, return a list of users with their amount owed and the items they bought.
>
> Stack: React (frontend), Python FastAPI (backend), Postgres (database), Docker for local dev.
> Use Claude's API for OCR receipt parsing.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Python FastAPI |
| Database | PostgreSQL |
| OCR | Anthropic claude-haiku-4-5 (vision) — haiku chosen over larger models to minimize API costs |
| Containerization | Docker + docker-compose |
| Font | Plus Jakarta Sans (Google Fonts) |

---

## Architecture

### Frontend (`frontend/src/`)

```
App.jsx                      — root component, orchestrates state
hooks/useBillData.js         — all API calls + shared state
api/client.js                — fetch wrappers for each endpoint
components/
  ReceiptUpload.jsx           — file picker, calls upload-receipt API
  PeopleManager.jsx           — add/remove people
  ItemList.jsx                — lists all items, edit/delete, assign button
  ItemCard.jsx                — single item row
  ItemForm.jsx                — add item manually
  AssignmentModal.jsx         — modal to assign item quantities to people
  TipTaxInput.jsx             — manual tax/tip entry (% or $)
  FinalBreakdown.jsx          — per-person totals (only shown when all quantities assigned)
styles/index.css              — global styles, @tailwind directives
```

### Backend (`backend/app/`)

```
main.py                      — FastAPI app, CORS, router mount
routers/bills.py             — all REST endpoints
services/ocr_service.py      — Anthropic API call + JSON parsing
models/                      — SQLAlchemy models (Bill, Item, Person, Assignment)
schemas/                     — Pydantic request/response schemas
```

---

## Key Workflows

### 1. Upload Receipt
1. User selects image (JPEG, PNG, HEIC, WEBP supported).
2. Frontend POSTs to `/api/bills/upload-receipt`.
3. Backend detects media type; converts HEIC → JPEG if needed (pillow-heif).
4. Sends base64 image + `RECEIPT_PROMPT` to `claude-haiku-4-5-20251001`.
5. Parses JSON response; derives `unit_price = totalPrice / quantity` for each item.
6. Creates Bill, Items, and seed Tax/Tip rows in Postgres.
7. Returns `bill_id`, items, tax, tip, subtotal.

### 2. Assign Items
- Each item has a `quantity`. The AssignmentModal lets the user pick people and set `share_count` per person.
- The sum of share_counts across all assignees must equal `item.quantity` before FinalBreakdown appears.
- "Pays:" in the modal shows `unitPrice × shareCount` (not a proportion of the line total).

### 3. Final Breakdown
- Only rendered when every item's assigned share_count sum ≥ item.quantity.
- Calls `GET /api/bills/{bill_id}/breakdown`.
- Backend prorates tax and tip to each person based on their subtotal share.

---

## OCR Prompt (`ocr_service.py` → `RECEIPT_PROMPT`)

```
Read the text from this photo of a receipt and return only valid JSON with no other text.

Rules:
- Each item must include a "customModifiers" array. If the item has modifiers printed on
  the receipt (e.g. "No tomatoes", "Extra onions", "Add bacon"), list each one as
  {"description": "..."}. If there are no modifiers, use an empty array [].
- Use 0 for any field not found on the receipt.
- "totalPrice" per item is the line total printed on the receipt for that item (the amount
  charged for all units of that item combined).
- "unitPrice" per item is the price for a single unit. If the receipt only shows a line total,
  divide it by the quantity (e.g. line total $7.05 for quantity 3 → unitPrice 2.35, totalPrice 7.05).
- The top-level "totalPrice" is the grand total of the entire receipt (including tax and tip
  if on the receipt).

Return JSON in exactly this format:
{
  "items": [
    {
      "description": "Cheeseburger",
      "customModifiers": [{"description": "No tomatoes"}, {"description": "Extra onions"}],
      "quantity": 1,
      "unitPrice": 12.99,
      "totalPrice": 12.99
    }
  ],
  "subtotal": 0.00,
  "tax": 0.00,
  "taxPercentage": 0.0,
  "totalPrice": 0.00,
  "tip": 0.00,
  "tipPercentage": 0.0
}
```

**Important:** The backend always recalculates `unit_price = totalPrice / quantity` regardless of what the model returns for `unitPrice`, to prevent model hallucination on multi-quantity items.

---

## Design System (Tailwind)

### Colors (`tailwind.config.js`)

| Token | Value | Usage |
|---|---|---|
| `background` | `#152D42` | Page background |
| `accent` | `#00FDDC` | Highlights (registered, not yet applied) |
| `surface` | `#3A4D45` | Cards, modals, panels |
| `surface-2` | `#4A5E56` | Inputs, secondary panels |
| `surface-3` | `#3D4E44` | Subtle interactive areas |
| `primary-500` | `#5A6E66` | Buttons (save, add) |
| `secondary-500` | `#CDD1DE` | Selected state borders |

### Font
- Plus Jakarta Sans (Google Fonts) — loaded in `index.html`, configured as `font-sans` default in tailwind.config.js.

### People Color Chips
```js
const COLORS = [
  'bg-secondary-500/20 text-secondary-300',
  'bg-green-500/20 text-green-300',
  'bg-purple-500/20 text-purple-300',
  'bg-pink-500/20 text-pink-300',
  'bg-yellow-500/20 text-yellow-300',
  'bg-indigo-500/20 text-indigo-300',
];
```
Used in both `PeopleManager.jsx` and `ItemCard.jsx`.

---

## Known Bugs Fixed

| Bug | Fix |
|---|---|
| Upload API returned totalPrice instead of unitPrice for multi-quantity items | Backend always computes `unit_price = totalPrice / quantity` |
| Anthropic model sometimes returns line total as unitPrice | Prompt clarified; backend derivation is the authoritative source |
| AssignmentModal "Pays:" showed full item total, not per-share | Fixed formula to `item.price × shareCount` |
| FinalBreakdown shown before all quantities assigned | `allAssigned` now checks `sum(share_count) >= item.quantity` for every item |
| HEIC images not supported by Anthropic API | HEIC files are converted to JPEG via pillow-heif before sending (`_convert_heic_to_jpeg` in `ocr_service.py`) |
| Converted HEIC images sometimes exceed Anthropic's 5 MB limit | After conversion, if the JPEG is over 5 MB, quality is reduced in 15-point increments (starting at 85) until the file is under 5 MB or quality floor of 30 is reached |

---

## Pending / Open Items

- Apply `accent` color (`#00FDDC`) to specific UI elements (buttons, focus rings, highlights) — token registered but not yet used in components.

---

## Local Dev

```bash
docker-compose up        # starts frontend, backend, postgres
# Frontend: http://localhost:5173
# Backend:  http://localhost:8000
# API docs: http://localhost:8000/docs
```

Set `MOCK_OCR=true` in the backend env to skip Anthropic API calls and use hardcoded receipt data (a fixed In-N-Out order defined in `ocr_service.py` → `_MOCK_DATA`). Use this during local development to avoid incurring API costs on every receipt upload test.
