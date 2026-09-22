import os

os.environ.setdefault("MOCK_OCR", "true")

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services import data_store
from app.routers import bills as bills_router


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture(autouse=True)
def reset_store():
    yield
    data_store.reset()


@pytest.fixture
def mock_ocr(monkeypatch):
    """Returns a setter: mock_ocr(receipt_data) makes the next upload return receipt_data."""

    def _set(receipt_data):
        monkeypatch.setattr(
            bills_router.ocr_service, "extract_receipt_data", lambda image_bytes: receipt_data
        )

    return _set
