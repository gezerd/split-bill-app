from decimal import Decimal

from app.services import data_store


def _make_bill_with_item_and_people():
    bill = data_store.create_bill()
    item = data_store.create_item(bill_id=bill.id, name="Taco", price=Decimal("5.00"), quantity=2)
    alice = data_store.create_person(bill_id=bill.id, name="Alice")
    bob = data_store.create_person(bill_id=bill.id, name="Bob")
    return bill, item, alice, bob


def test_reassigning_same_pair_updates_share_count_in_place(client):
    bill, item, alice, _ = _make_bill_with_item_and_people()

    first = client.post(
        "/api/assignments",
        json={"item_id": str(item.id), "person_id": str(alice.id), "share_count": 1},
    ).json()
    second = client.post(
        "/api/assignments",
        json={"item_id": str(item.id), "person_id": str(alice.id), "share_count": 2},
    ).json()

    assert first["id"] == second["id"]
    assert second["share_count"] == 2

    all_assignments = client.get("/api/assignments", params={"bill_id": str(bill.id)}).json()
    assert len(all_assignments) == 1


def test_deleting_person_cascades_assignments(client):
    bill, item, alice, bob = _make_bill_with_item_and_people()
    client.post(
        "/api/assignments",
        json={"item_id": str(item.id), "person_id": str(alice.id), "share_count": 1},
    )
    client.post(
        "/api/assignments",
        json={"item_id": str(item.id), "person_id": str(bob.id), "share_count": 1},
    )

    response = client.delete(f"/api/people/{alice.id}")
    assert response.status_code == 200

    remaining = client.get("/api/assignments", params={"bill_id": str(bill.id)}).json()
    assert len(remaining) == 1
    assert remaining[0]["person_id"] == str(bob.id)


def test_deleting_item_cascades_assignments(client):
    bill, item, alice, _ = _make_bill_with_item_and_people()
    client.post(
        "/api/assignments",
        json={"item_id": str(item.id), "person_id": str(alice.id), "share_count": 1},
    )

    response = client.delete(f"/api/items/{item.id}")
    assert response.status_code == 200

    remaining = client.get("/api/assignments", params={"bill_id": str(bill.id)}).json()
    assert remaining == []


def test_deleting_bill_cascades_items_people_and_assignments(client):
    bill, item, alice, _ = _make_bill_with_item_and_people()
    client.post(
        "/api/assignments",
        json={"item_id": str(item.id), "person_id": str(alice.id), "share_count": 1},
    )

    response = client.delete(f"/api/bills/{bill.id}")
    assert response.status_code == 200

    assert data_store.get_item(item.id) is None
    assert data_store.get_person(alice.id) is None
    assert data_store.get_assignments_by_bill(bill.id) == []
    assert data_store.get_assignments_by_item(item.id) == []


def test_assignment_across_mismatched_bills_returns_400(client):
    bill_a = data_store.create_bill()
    bill_b = data_store.create_bill()
    item = data_store.create_item(bill_id=bill_a.id, name="Soda", price=Decimal("2.00"), quantity=1)
    person = data_store.create_person(bill_id=bill_b.id, name="Outsider")

    response = client.post(
        "/api/assignments",
        json={"item_id": str(item.id), "person_id": str(person.id), "share_count": 1},
    )

    assert response.status_code == 400
