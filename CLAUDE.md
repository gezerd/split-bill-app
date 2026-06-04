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

## Design tokens

Tailwind theme is extended in `frontend/tailwind.config.js`. Key tokens:
- `background` → `#152D42` (dark blue page bg)
- `surface` → `#1C3A54` (card bg)
- `accent` → `#E6AE00` (gold — primary interactive color)
- `border` → `#2E5674`

Font: Plus Jakarta Sans (loaded via CDN in `index.html`).
