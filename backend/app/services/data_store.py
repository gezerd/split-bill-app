from typing import Dict, List, Optional
from uuid import UUID, uuid4
from decimal import Decimal
import threading
from dataclasses import dataclass, field


@dataclass
class Bill:
    id: UUID
    receipt_image_url: Optional[str] = None
    subtotal: Decimal = Decimal("0.00")
    tax_amount: Decimal = Decimal("0.00")
    tip_amount: Decimal = Decimal("0.00")
    total: Decimal = Decimal("0.00")


@dataclass
class Item:
    id: UUID
    bill_id: UUID
    name: str
    price: Decimal
    quantity: int = 1
    custom_modifiers: List[str] = field(default_factory=list)


@dataclass
class Person:
    id: UUID
    bill_id: UUID
    name: str


@dataclass
class Assignment:
    id: UUID
    item_id: UUID
    person_id: UUID
    share_count: int = 1


class InMemoryStore:
    """Thread-safe in-memory data store for v1 (no database persistence)"""

    def __init__(self):
        self._bills: Dict[UUID, Bill] = {}
        self._items: Dict[UUID, Item] = {}
        self._people: Dict[UUID, Person] = {}
        self._assignments: Dict[UUID, Assignment] = {}
        self._lock = threading.Lock()

    # Bill operations
    def create_bill(
        self,
        receipt_image_url: Optional[str] = None,
        subtotal: Decimal = Decimal("0.00"),
        tax_amount: Decimal = Decimal("0.00"),
        tip_amount: Decimal = Decimal("0.00"),
        total: Decimal = Decimal("0.00"),
    ) -> Bill:
        with self._lock:
            bill = Bill(
                id=uuid4(),
                receipt_image_url=receipt_image_url,
                subtotal=subtotal,
                tax_amount=tax_amount,
                tip_amount=tip_amount,
                total=total,
            )
            self._bills[bill.id] = bill
            return bill

    def get_bill(self, bill_id: UUID) -> Optional[Bill]:
        return self._bills.get(bill_id)

    def update_bill(
        self,
        bill_id: UUID,
        tax_amount: Optional[Decimal] = None,
        tip_amount: Optional[Decimal] = None,
    ) -> Optional[Bill]:
        with self._lock:
            bill = self._bills.get(bill_id)
            if bill:
                if tax_amount is not None:
                    bill.tax_amount = tax_amount
                if tip_amount is not None:
                    bill.tip_amount = tip_amount
                # Recalculate total
                bill.total = bill.subtotal + bill.tax_amount + bill.tip_amount
            return bill

    def delete_bill(self, bill_id: UUID) -> bool:
        with self._lock:
            # Delete all associated data
            self._items = {k: v for k, v in self._items.items() if v.bill_id != bill_id}
            self._people = {k: v for k, v in self._people.items() if v.bill_id != bill_id}
            # Delete assignments for items that were deleted
            item_ids = {item.id for item in self._items.values() if item.bill_id == bill_id}
            self._assignments = {
                k: v for k, v in self._assignments.items() if v.item_id not in item_ids
            }
            return self._bills.pop(bill_id, None) is not None

    # Item operations
    def create_item(
        self, bill_id: UUID, name: str, price: Decimal, quantity: int = 1, custom_modifiers: List[str] = None
    ) -> Item:
        with self._lock:
            item = Item(id=uuid4(), bill_id=bill_id, name=name, price=price, quantity=quantity, custom_modifiers=custom_modifiers or [])
            self._items[item.id] = item
            return item

    def get_item(self, item_id: UUID) -> Optional[Item]:
        return self._items.get(item_id)

    def get_items_by_bill(self, bill_id: UUID) -> List[Item]:
        return [item for item in self._items.values() if item.bill_id == bill_id]

    def update_item(
        self,
        item_id: UUID,
        name: Optional[str] = None,
        price: Optional[Decimal] = None,
        quantity: Optional[int] = None,
    ) -> Optional[Item]:
        with self._lock:
            item = self._items.get(item_id)
            if item:
                if name is not None:
                    item.name = name
                if price is not None:
                    item.price = price
                if quantity is not None:
                    item.quantity = quantity
            return item

    def delete_item(self, item_id: UUID) -> bool:
        with self._lock:
            # Delete all assignments for this item
            self._assignments = {
                k: v for k, v in self._assignments.items() if v.item_id != item_id
            }
            return self._items.pop(item_id, None) is not None

    # Person operations
    def create_person(self, bill_id: UUID, name: str) -> Person:
        with self._lock:
            person = Person(id=uuid4(), bill_id=bill_id, name=name)
            self._people[person.id] = person
            return person

    def get_person(self, person_id: UUID) -> Optional[Person]:
        return self._people.get(person_id)

    def get_people_by_bill(self, bill_id: UUID) -> List[Person]:
        return [person for person in self._people.values() if person.bill_id == bill_id]

    def update_person(self, person_id: UUID, name: str) -> Optional[Person]:
        with self._lock:
            person = self._people.get(person_id)
            if person:
                person.name = name
            return person

    def delete_person(self, person_id: UUID) -> bool:
        with self._lock:
            # Delete all assignments for this person
            self._assignments = {
                k: v for k, v in self._assignments.items() if v.person_id != person_id
            }
            return self._people.pop(person_id, None) is not None

    # Assignment operations
    def create_assignment(
        self, item_id: UUID, person_id: UUID, share_count: int = 1
    ) -> Assignment:
        with self._lock:
            # Check if assignment already exists
            existing = next(
                (
                    a
                    for a in self._assignments.values()
                    if a.item_id == item_id and a.person_id == person_id
                ),
                None,
            )
            if existing:
                # Update share count
                existing.share_count = share_count
                return existing

            assignment = Assignment(
                id=uuid4(), item_id=item_id, person_id=person_id, share_count=share_count
            )
            self._assignments[assignment.id] = assignment
            return assignment

    def get_assignment(self, assignment_id: UUID) -> Optional[Assignment]:
        return self._assignments.get(assignment_id)

    def get_assignments_by_bill(self, bill_id: UUID) -> List[Assignment]:
        # Get all items for this bill
        bill_item_ids = {item.id for item in self._items.values() if item.bill_id == bill_id}
        return [
            assignment
            for assignment in self._assignments.values()
            if assignment.item_id in bill_item_ids
        ]

    def get_assignments_by_item(self, item_id: UUID) -> List[Assignment]:
        return [
            assignment for assignment in self._assignments.values() if assignment.item_id == item_id
        ]

    def get_assignments_by_person(self, person_id: UUID) -> List[Assignment]:
        return [
            assignment
            for assignment in self._assignments.values()
            if assignment.person_id == person_id
        ]

    def delete_assignment(self, assignment_id: UUID) -> bool:
        with self._lock:
            return self._assignments.pop(assignment_id, None) is not None


# Global singleton instance
data_store = InMemoryStore()
