from decimal import Decimal

from app.services import data_store, CalculationService


def _make_bill(tax=Decimal("0.00"), tip=Decimal("0.00")):
    return data_store.create_bill(tax_amount=tax, tip_amount=tip)


def test_even_three_way_split_no_tax_tip():
    bill = _make_bill()
    item = data_store.create_item(bill_id=bill.id, name="Pizza", price=Decimal("10.00"), quantity=3)
    people = [data_store.create_person(bill_id=bill.id, name=f"Person{i}") for i in range(3)]
    for person in people:
        data_store.create_assignment(item_id=item.id, person_id=person.id, share_count=1)

    result = CalculationService.calculate_breakdown(bill.id)

    subtotals = [entry["subtotal"] for entry in result["people"]]
    assert subtotals == [Decimal("10.00")] * 3


def test_non_divisible_tax_split_reconciles_exactly():
    bill = _make_bill(tax=Decimal("10.00"))
    item = data_store.create_item(bill_id=bill.id, name="Entree", price=Decimal("10.00"), quantity=3)
    people = [data_store.create_person(bill_id=bill.id, name=f"Person{i}") for i in range(3)]
    for person in people:
        data_store.create_assignment(item_id=item.id, person_id=person.id, share_count=1)

    result = CalculationService.calculate_breakdown(bill.id)

    tax_amounts = [entry["tax_amount"] for entry in result["people"]]
    assert sum(tax_amounts) == Decimal("10.00")
    assert sorted(tax_amounts, reverse=True) == [Decimal("3.34"), Decimal("3.33"), Decimal("3.33")]


def test_shared_item_split_by_share_count():
    bill = _make_bill()
    item = data_store.create_item(bill_id=bill.id, name="Fries", price=Decimal("2.00"), quantity=4)
    alice = data_store.create_person(bill_id=bill.id, name="Alice")
    bob = data_store.create_person(bill_id=bill.id, name="Bob")
    data_store.create_assignment(item_id=item.id, person_id=alice.id, share_count=3)
    data_store.create_assignment(item_id=item.id, person_id=bob.id, share_count=1)

    result = CalculationService.calculate_breakdown(bill.id)

    by_name = {entry["name"]: entry for entry in result["people"]}
    assert by_name["Alice"]["subtotal"] == Decimal("6.00")
    assert by_name["Bob"]["subtotal"] == Decimal("2.00")


def test_person_with_zero_assignments():
    bill = _make_bill()
    data_store.create_person(bill_id=bill.id, name="Lonely")

    result = CalculationService.calculate_breakdown(bill.id)

    entry = result["people"][0]
    assert entry["subtotal"] == Decimal("0.00")
    assert entry["tax_amount"] == Decimal("0.00")
    assert entry["tip_amount"] == Decimal("0.00")
    assert entry["total"] == Decimal("0.00")


def test_zero_tax_and_tip():
    bill = _make_bill(tax=Decimal("0.00"), tip=Decimal("0.00"))
    item = data_store.create_item(bill_id=bill.id, name="Water", price=Decimal("1.00"), quantity=1)
    person = data_store.create_person(bill_id=bill.id, name="Solo")
    data_store.create_assignment(item_id=item.id, person_id=person.id, share_count=1)

    result = CalculationService.calculate_breakdown(bill.id)

    entry = result["people"][0]
    assert entry["tax_amount"] == Decimal("0.00")
    assert entry["tip_amount"] == Decimal("0.00")
    assert entry["total"] == entry["subtotal"]


def test_no_people_returns_empty_list():
    bill = _make_bill()

    result = CalculationService.calculate_breakdown(bill.id)

    assert result == {"people": []}


def test_no_items_or_assignments_with_people_present():
    bill = _make_bill()
    data_store.create_person(bill_id=bill.id, name="A")
    data_store.create_person(bill_id=bill.id, name="B")

    result = CalculationService.calculate_breakdown(bill.id)

    for entry in result["people"]:
        assert entry["subtotal"] == Decimal("0.00")
        assert entry["tax_amount"] == Decimal("0.00")
        assert entry["tip_amount"] == Decimal("0.00")
        assert entry["total"] == Decimal("0.00")


def test_partial_assignment_computes_without_error():
    bill = _make_bill()
    item = data_store.create_item(bill_id=bill.id, name="Sushi", price=Decimal("5.00"), quantity=3)
    person = data_store.create_person(bill_id=bill.id, name="Partial")
    data_store.create_assignment(item_id=item.id, person_id=person.id, share_count=1)

    result = CalculationService.calculate_breakdown(bill.id)

    entry = result["people"][0]
    assert entry["subtotal"] == Decimal("5.00")
