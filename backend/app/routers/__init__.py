from .bills import router as bills_router
from .items import router as items_router
from .people import router as people_router
from .assignments import router as assignments_router

__all__ = ["bills_router", "items_router", "people_router", "assignments_router"]
