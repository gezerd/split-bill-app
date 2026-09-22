from decimal import Decimal

from tests.fixtures.receipts import SIMPLE_ONE_ITEM, SHARED_ITEM_QTY3, ZERO_TAX_TIP, ODD_CENT_TOTAL


def _upload(client, mock_ocr, receipt_data):
    mock_ocr(receipt_data)
    return client.post(
        "/api/bills/upload-receipt",
        files={"file": ("receipt.jpg", b"fake-image-bytes", "image/jpeg")},
    )


def test_upload_simple_one_item(client, mock_ocr):
    response = _upload(client, mock_ocr, SIMPLE_ONE_ITEM)

    assert response.status_code == 200
    body = response.json()
    assert body["subtotal"] == 10.0
    assert len(body["items"]) == 1
    assert body["items"][0]["name"] == "Burger"


def test_upload_shared_item(client, mock_ocr):
    response = _upload(client, mock_ocr, SHARED_ITEM_QTY3)

    assert response.status_code == 200
    body = response.json()
    assert body["items"][0]["quantity"] == 3
    assert body["subtotal"] == 27.0


def test_upload_zero_tax_tip(client, mock_ocr):
    response = _upload(client, mock_ocr, ZERO_TAX_TIP)

    assert response.status_code == 200
    body = response.json()
    assert body["tax_amount"] == 0.0
    assert body["tip_amount"] == 0.0
    assert len(body["items"]) == 2


def test_upload_odd_cent_total(client, mock_ocr):
    response = _upload(client, mock_ocr, ODD_CENT_TOTAL)

    assert response.status_code == 200
    body = response.json()
    assert body["tax_amount"] == 10.0
    assert body["subtotal"] == 30.0


def test_full_workflow_happy_path(client, mock_ocr):
    upload_body = _upload(client, mock_ocr, SHARED_ITEM_QTY3).json()
    bill_id = upload_body["bill_id"]
    item_id = upload_body["items"][0]["id"]

    alice = client.post("/api/people", json={"bill_id": bill_id, "name": "Alice"}).json()
    bob = client.post("/api/people", json={"bill_id": bill_id, "name": "Bob"}).json()

    client.post(
        "/api/assignments",
        json={"item_id": item_id, "person_id": alice["id"], "share_count": 2},
    )
    client.post(
        "/api/assignments",
        json={"item_id": item_id, "person_id": bob["id"], "share_count": 1},
    )

    breakdown = client.get(f"/api/bills/{bill_id}/breakdown").json()
    by_name = {p["name"]: p for p in breakdown["people"]}

    assert Decimal(str(by_name["Alice"]["subtotal"])) == Decimal("18.00")
    assert Decimal(str(by_name["Bob"]["subtotal"])) == Decimal("9.00")


def test_breakdown_for_unknown_bill_returns_404(client):
    response = client.get("/api/bills/00000000-0000-0000-0000-000000000000/breakdown")

    assert response.status_code == 404
