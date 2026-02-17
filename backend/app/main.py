from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import bills_router, items_router, people_router, assignments_router

app = FastAPI(
    title="Split Bill API",
    description="API for splitting restaurant bills with OCR receipt extraction",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(bills_router)
app.include_router(items_router)
app.include_router(people_router)
app.include_router(assignments_router)


@app.get("/")
def root():
    return {
        "message": "Split Bill API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
