from typing import List, Dict
from uuid import UUID
from decimal import Decimal
from .data_store import data_store


class CalculationService:
    """Service for calculating bill splits with shared items and proportional tax/tip"""

    @staticmethod
    def calculate_breakdown(bill_id: UUID) -> Dict:
        """
        Calculate the final breakdown of who owes what

        Args:
            bill_id: UUID of the bill

        Returns:
            Dict with 'people' key containing list of PersonBreakdown dicts
        """
        bill = data_store.get_bill(bill_id)
        if not bill:
            raise ValueError(f"Bill {bill_id} not found")

        people = data_store.get_people_by_bill(bill_id)
        items = data_store.get_items_by_bill(bill_id)
        assignments = data_store.get_assignments_by_bill(bill_id)

        if not people:
            return {"people": []}

        breakdown = []
        total_subtotal = Decimal("0.00")

        # Calculate each person's share
        for person in people:
            person_items = []
            person_subtotal = Decimal("0.00")

            # Get all assignments for this person
            person_assignments = [a for a in assignments if a.person_id == person.id]

            for assignment in person_assignments:
                item = data_store.get_item(assignment.item_id)
                if not item:
                    continue

                # Calculate total shares for this item (sum of all share_counts)
                item_assignments = data_store.get_assignments_by_item(item.id)
                total_shares = sum(a.share_count for a in item_assignments)

                if total_shares == 0:
                    continue

                # Calculate this person's share amount
                item_total = item.price * item.quantity
                share_amount = item_total * Decimal(assignment.share_count) / Decimal(total_shares)

                person_items.append(
                    {
                        "name": item.name,
                        "price": item.price,
                        "quantity": item.quantity,
                        "share_count": assignment.share_count,
                        "total_shares": total_shares,
                        "share_amount": round(share_amount, 2),
                    }
                )

                person_subtotal += share_amount

            total_subtotal += person_subtotal

            breakdown.append(
                {
                    "person_id": str(person.id),
                    "name": person.name,
                    "items": person_items,
                    "subtotal": round(person_subtotal, 2),
                }
            )

        # Calculate proportional tax and tip for each person
        for entry in breakdown:
            if total_subtotal > 0:
                percentage = Decimal(entry["subtotal"]) / total_subtotal
            else:
                percentage = Decimal("0.00")

            entry["tax_amount"] = round(bill.tax_amount * percentage, 2)
            entry["tip_amount"] = round(bill.tip_amount * percentage, 2)
            entry["total"] = round(
                Decimal(entry["subtotal"]) + entry["tax_amount"] + entry["tip_amount"], 2
            )

        return {"people": breakdown}
