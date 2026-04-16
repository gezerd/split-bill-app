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

### For Docker (Recommended)
- Docker and Docker Compose
- Anthropic API key (get one at [platform.claude.com](https://platform.claude.com))

### For Local Development
- **Python 3.12** (required for backend development)
- **Node.js 18+** (required for frontend development)
- Anthropic API key

## Python Installation (Local Development Only)

If you want to run the backend locally (without Docker), you need Python 3.12 installed.

### Option 1: Using pyenv (Recommended)

```bash
# Install pyenv (if not already installed)
# macOS
brew install pyenv

# Linux
curl https://pyenv.run | bash

# Install Python 3.12
pyenv install 3.12.0

# Set Python 3.12 for this project
cd /path/to/split-bill-app
pyenv local 3.12.0

# Verify installation
python --version  # Should show Python 3.12.0
pip --version     # Should now work
```

### Option 2: Direct Installation

**macOS:**
```bash
brew install python@3.12
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install python3.12 python3.12-venv python3-pip
```

**Windows:**
Download from [python.org/downloads](https://www.python.org/downloads/) and install Python 3.12

### Verify Installation

```bash
python --version  # or python3 --version
pip --version     # or pip3 --version
```

## Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd split-bill-app
```

### 2. Set up your Anthropic API key

```bash
cd backend
cp .env.example .env
# Edit .env and set ANTHROPIC_API_KEY=your-api-key-here
```

Get your API key at [platform.claude.com](https://platform.claude.com).

### 3. Install dependencies

```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

### 4. Start the application

```bash
docker-compose up --build
```

This will start three services:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **PostgreSQL**: localhost:5432

### 5. Access the application

Open your browser and navigate to http://localhost:5173

## Development

### Setup for Local Development

**1. Install Python 3.12** (see Python Installation section above)

**2. Set up Python environment:**
```bash
# Navigate to project root
cd split-bill-app

# Set Python 3.12 for this project (if using pyenv)
pyenv local 3.12.0

# Verify Python version
python --version  # Should show Python 3.12.x
```

**3. Install backend dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

**4. Create backend .env file:**
```bash
cd backend
cp .env.example .env
# Edit .env and set ANTHROPIC_API_KEY=your-api-key-here
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

Runs at http://localhost:5173

### Backend Development

```bash
cd backend

# Make sure you're using Python 3.12
python --version

# Run the development server
uvicorn app.main:app --reload
```

Runs at http://localhost:8000

### Running with Docker (Recommended)

```bash
# Build and start all services
docker-compose up --build

# Stop all services
docker-compose down
```

This approach ensures:
- Consistent Python 3.12 environment
- All dependencies installed correctly
- No local Python version conflicts

## Testing

### Mock Mode (no Anthropic API call)

Set `MOCK_OCR=true` to bypass the Anthropic API and use hardcoded receipt data. The app behaves normally — items are created in the data store and all features (assignments, breakdown, etc.) work as usual.

**Docker:**
```bash
MOCK_OCR=true docker-compose up --build
```

**Local backend:**
```bash
MOCK_OCR=true uvicorn app.main:app --reload
```

The mock returns an In-N-Out order with 9 items including custom modifiers (e.g. "Protein Style", "Grilled Onions") so you can test the full UI without spending API credits.

### With the Anthropic API

Make sure `ANTHROPIC_API_KEY` is set and `MOCK_OCR` is unset (or set to `false`). The backend will call Claude Haiku 4.5 to extract items from the uploaded receipt image.

**Docker:** add your key to the root `.env` file:
```
ANTHROPIC_API_KEY=sk-ant-...
```

**Local backend:** export it in your shell or add it to `backend/.env`:
```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

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

### "pip: command not found"

**Solution 1: Activate Python 3.12 with pyenv**
```bash
cd split-bill-app
pyenv local 3.12.0
python --version  # Verify it shows 3.12.x
pip --version     # Should now work
```

**Solution 2: Use python -m pip**
```bash
python -m pip install -r backend/requirements.txt
# or
python3 -m pip install -r backend/requirements.txt
```

### HEIC Image Upload Fails

The app supports iPhone HEIC images. If conversion fails:
1. Make sure `pillow-heif` is installed
2. Try converting the HEIC to JPG first using macOS Preview or another tool
3. Check backend logs for specific error messages

### Port Already in Use

```bash
# Check what's using the port
lsof -i :8000  # Backend
lsof -i :5173  # Frontend
lsof -i :5432  # PostgreSQL

# Stop conflicting process or change ports in docker-compose.yml
```

## Future Enhancements

- Database persistence for saving and sharing bills
- User accounts and bill history
- PDF/image export of breakdowns
- Support for percentage-based splits
- Multiple currency support
- Receipt image preprocessing for better extraction accuracy

## License

MIT