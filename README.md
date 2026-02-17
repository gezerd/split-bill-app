# Split Bill App

A web application to split restaurant bills among multiple people using OCR technology to automatically extract receipt data.

## Features

- 📸 Upload receipt images with automatic OCR extraction (Google Cloud Vision API)
- 👥 Add, edit, and remove people splitting the bill
- 🍕 Assign items to individuals or share among multiple people
- ➕ Add, edit, or delete items if OCR misses something
- 💰 Automatic proportional tax and tip distribution
- 📊 Detailed breakdown showing each person's share

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Python FastAPI
- **Database**: PostgreSQL (infrastructure setup, v1 uses in-memory storage)
- **OCR**: Google Cloud Vision API
- **Containerization**: Docker Compose

## Prerequisites

- Docker and Docker Compose
- Google Cloud Vision API credentials (see setup below)

## Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd split-bill-app
```

### 2. Set up Google Cloud Vision API

1. Create a Google Cloud project
2. Enable the Cloud Vision API
3. Create a service account and download the JSON credentials file
4. Save the credentials file (e.g., `google-credentials.json`) in a secure location

### 3. Configure environment variables

Create a `.env` file in the root directory:

```bash
GOOGLE_CLOUD_VISION_CREDENTIALS=/path/to/your/google-credentials.json
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

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Backend Development

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## API Documentation

Once the backend is running, view the interactive API docs at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## How to Use

1. **Upload Receipt**: Click to upload a photo of your receipt
2. **Review Items**: Verify OCR-extracted items, edit/add/delete as needed
3. **Add People**: Add names of people splitting the bill
4. **Assign Items**: Click items to assign them to people (supports sharing with custom share counts)
5. **Adjust Tip/Tax**: Enter tip as percentage or amount, edit tax if needed
6. **View Breakdown**: See detailed split with each person's total

## Architecture

### Project Structure

```
split-bill-app/
├── frontend/          # React + Vite + Tailwind
├── backend/           # FastAPI + Google Cloud Vision
├── postgres/          # Database schema
└── docker-compose.yml # Service orchestration
```

### Data Flow

1. Receipt image uploaded → Google Cloud Vision API extracts text
2. Parser identifies items, prices, tax, tip
3. User manages people and assigns items (with optional share counts)
4. Calculation engine computes proportional splits
5. Frontend displays itemized breakdown

## Future Enhancements

- Database persistence for saving and sharing bills
- User accounts and bill history
- PDF/image export of breakdowns
- Support for percentage-based splits
- Multiple currency support

## License

MIT
