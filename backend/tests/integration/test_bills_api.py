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


def _breakdown_for(client, price, quantity, share_counts):
    bill_id = client.post("/api/bills/upload-receipt", files={"file": ("r.jpg", b"x", "image/jpeg")}).json()["bill_id"]
    item = client.post(
        "/api/items", json={"bill_id": bill_id, "name": "Dish", "price": price, "quantity": quantity}
    ).json()
    for i, count in enumerate(share_counts):
        person = client.post("/api/people", json={"bill_id": bill_id, "name": f"P{i}"}).json()
        client.post(
            "/api/assignments",
            json={"item_id": item["id"], "person_id": person["id"], "share_count": count},
        )
    return client.get(f"/api/bills/{bill_id}/breakdown").json()["people"]


def _item_amounts(people):
    return [Decimal(str(p["items"][0]["share_amount"])) for p in people]


def test_breakdown_three_way_split_is_cent_exact(client):
    people = _breakdown_for(client, 4.25, 1, [1, 1, 1])
    assert _item_amounts(people) == [Decimal("1.42"), Decimal("1.42"), Decimal("1.41")]


def test_breakdown_shares_beyond_quantity_act_as_weights(client):
    people = _breakdown_for(client, 3.00, 1, [2, 1])
    assert _item_amounts(people) == [Decimal("2.00"), Decimal("1.00")]


def test_breakdown_single_share_on_multi_quantity_pays_full_item(client):
    people = _breakdown_for(client, 5.00, 3, [1])
    assert _item_amounts(people) == [Decimal("15.00")]


def test_breakdown_total_shares_is_sum_of_shares(client):
    people = _breakdown_for(client, 5.00, 3, [2, 1, 4])
    assert [p["items"][0]["total_shares"] for p in people] == [7, 7, 7]


def test_create_empty_bill_has_upload_shape_and_accepts_items(client):
    response = client.post("/api/bills")
    assert response.status_code == 200
    data = response.json()
    assert data["items"] == []
    for field in ("tax_amount", "tip_amount", "subtotal", "total"):
        assert data[field] == 0

    item = client.post(
        "/api/items",
        json={"bill_id": data["bill_id"], "name": "Soup", "price": 4.5, "quantity": 1},
    )
    assert item.status_code in (200, 201)
    assert item.json()["name"] == "Soup"
