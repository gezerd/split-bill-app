# Split Bill App

A web application to split restaurant bills among multiple people using AI to automatically extract receipt data.

## Features

- 📸 Upload receipt images with automatic extraction (Claude AI)
- 👥 Add, edit, and remove people splitting the bill
- 🍕 Assign items to individuals or share among multiple people
- ➕ Add, edit, or delete items if extraction misses something
- 💰 Automatic proportional tax and tip distribution
- 📊 Detailed breakdown showing each person's share

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Python 3.12 + FastAPI
- **Database**: PostgreSQL (infrastructure setup, v1 uses in-memory storage)
- **AI**: Claude API (Haiku 4.5) for receipt extraction
- **Image Processing**: pillow-heif (HEIC support)
- **Containerization**: Docker Compose

## Prerequisites

Install these once per machine. After that, every command in this README is the same on Windows and macOS.

| Tool | Windows | macOS |
|---|---|---|
| **Node.js 18+** | `winget install OpenJS.NodeJS.LTS` | `brew install node` |
| **uv** (Python toolchain) | `winget install astral-sh.uv` | `brew install uv` |
| **Docker** (optional, for the full stack) | [Docker Desktop](https://www.docker.com/products/docker-desktop/) | [Docker Desktop](https://www.docker.com/products/docker-desktop/) |

You do **not** need to install Python yourself: uv reads `backend/.python-version` and downloads Python 3.12 automatically. Restart your terminal after installing uv so it's on your `PATH`.

You'll also need an Anthropic API key for live receipt scanning (get one at [platform.claude.com](https://platform.claude.com)). Mock mode works without one.

## Quick Start

```bash
git clone <repository-url>
cd split-bill-app
npm run setup
```

`npm run setup` creates `.env` from `.env.example` (if missing), installs the root and frontend npm packages, creates the backend virtualenv with `uv sync` (fetching Python 3.12 if needed), and installs Chromium for Playwright. Re-run it any time dependencies change.

Then put your key in the root `.env`:
```
ANTHROPIC_API_KEY=sk-ant-...
```

## Commands

Run everything from the repo root:

| Command | What it does |
|---|---|
| `npm run setup` | Install all dependencies (npm, uv, Playwright browser) |
| `npm run dev` | Start backend (:8000) and frontend (:5173) together, using the Anthropic API |
| `npm run dev:mock` | Same, but with mock OCR — no API key or credits needed |
| `npm test` | Backend (pytest) + frontend unit tests (Vitest) — fast, no servers needed |
| `npm run test:e2e` | Playwright end-to-end tests (starts its own servers) |
| `npm run test:all` | `npm test`, then `npm run test:e2e` |

Open http://localhost:5173 once `dev` is running. Stop it with Ctrl+C.

Individual pieces are also available: `dev:backend`, `dev:frontend`, `test:backend`, `test:frontend`. Extra arguments go after `--`, e.g. `npm run test:backend -- --cov=app`.

### Running with Docker

```bash
docker-compose up --build   # frontend :5173, backend :8000, postgres :5432
docker-compose down
```

Docker Compose reads the root `.env`, so `ANTHROPIC_API_KEY` and `MOCK_OCR` are set there.

## Testing

### Mock Mode (no Anthropic API call)

Mock mode bypasses the Anthropic API and uses hardcoded receipt data. The app behaves normally — items are created in the data store and all features (assignments, breakdown, etc.) work as usual.

- **Local:** `npm run dev:mock`
- **Docker:** set `MOCK_OCR=true` in the root `.env`, then `docker-compose up --build`

The mock returns an In-N-Out order with 9 items including custom modifiers (e.g. "Protein Style", "Grilled Onions") so you can test the full UI without spending API credits.

### With the Anthropic API

Set `ANTHROPIC_API_KEY` in the root `.env` and leave `MOCK_OCR` as `false`. Then run `npm run dev` (or Docker). The backend will call Claude Haiku 4.5 to extract items from the uploaded receipt image.

### Automated Tests

- `npm test` runs the backend pytest suite and the frontend Vitest + React Testing Library suite.
- `npm run test:e2e` runs the Playwright suite in a real browser. It starts its own mock-OCR backend on **:8001** and Vite on **:5174**, so it never touches (or spends credits through) a dev session you have running on :8000/:5173.
- `npm run test:all` runs both, stopping early if the fast tests fail.

## API Documentation

Once the backend is running, view the interactive API docs at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## How to Use

1. **Upload Receipt**: Click to upload a photo of your receipt
2. **Review Items**: Verify extracted items, edit/add/delete as needed
3. **Add People**: Add names of people splitting the bill
4. **Assign Items**: Click items to assign them to people (supports sharing with custom share counts)
5. **Adjust Tip/Tax**: Enter tip as percentage or amount, edit tax if needed
6. **View Breakdown**: See detailed split with each person's total

## Architecture

### Project Structure

```
split-bill-app/
├── frontend/          # React + Vite + Tailwind
├── backend/           # FastAPI + Claude AI
├── postgres/          # Database schema
└── docker-compose.yml # Service orchestration
```

### Data Flow

1. Receipt image uploaded → Claude AI extracts items, prices, tax, tip
2. User manages people and assigns items (with optional share counts)
3. Calculation engine computes proportional splits
4. Frontend displays itemized breakdown

## Troubleshooting

### "uv: command not found" / "'uv' is not recognized"

Restart your terminal (or VS Code) after installing uv so the updated `PATH` is picked up. Verify with `uv --version`.

### HEIC Image Upload Fails

The app supports iPhone HEIC images. If conversion fails:
1. Make sure dependencies are up to date: `npm run setup`
2. Try converting the HEIC to JPG first using macOS Preview or another tool
3. Check backend logs for specific error messages

### Port Already in Use

```bash
# macOS
lsof -i :8000

# Windows (PowerShell)
Get-NetTCPConnection -LocalPort 8000 | Select-Object OwningProcess
```

Ports used: 8000 (backend), 5173 (frontend), 5432 (PostgreSQL), and 8001/5174 during `test:e2e`. Stop the conflicting process, or change ports in `docker-compose.yml`.

## Future Enhancements

- Database persistence for saving and sharing bills
- User accounts and bill history
- PDF/image export of breakdowns
- Support for percentage-based splits
- Multiple currency support
- Receipt image preprocessing for better extraction accuracy

## License

MIT