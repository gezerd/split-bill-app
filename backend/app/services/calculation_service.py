from typing import List, Dict
from uuid import UUID
from decimal import Decimal, ROUND_DOWN
from .data_store import data_store


class CalculationService:
    """Service for calculating bill splits with shared items and proportional tax/tip"""

    @staticmethod
    def _distribute(
        total_amount: Decimal, raw_subtotals: List[Decimal], total_subtotal: Decimal
    ) -> List[Decimal]:
        """
        Distribute total_amount proportionally across raw_subtotals using the
        largest-remainder method, so the returned amounts sum exactly to
        round(total_amount, 2) instead of drifting from independent rounding.
        """
        n = len(raw_subtotals)
        if total_subtotal <= 0 or total_amount == 0:
            return [Decimal("0.00")] * n

        total_cents = int((total_amount * 100).to_integral_value())

        raw_share_cents = [
            (raw_subtotals[i] / total_subtotal) * total_amount * 100 for i in range(n)
        ]
        floor_cents = [
            int(raw_share_cents[i].to_integral_value(rounding=ROUND_DOWN)) for i in range(n)
        ]
        remainder_cents = total_cents - sum(floor_cents)

        remainders = sorted(
            range(n), key=lambda i: (raw_share_cents[i] - floor_cents[i]), reverse=True
        )

        result_cents = list(floor_cents)
        for i in remainders[:remainder_cents]:
            result_cents[i] += 1

        return [Decimal(cents) / 100 for cents in result_cents]

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
        raw_subtotals = []
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

                # Each share = 1 unit at unit price
                share_amount = item.price * Decimal(assignment.share_count)

                person_items.append(
                    {
                        "name": item.name,
                        "price": item.price,
                        "quantity": item.quantity,
                        "share_count": assignment.share_count,
                        "total_shares": item.quantity,
                        "share_amount": round(share_amount, 2),
                    }
                )

                person_subtotal += share_amount

            total_subtotal += person_subtotal
            raw_subtotals.append(person_subtotal)

            breakdown.append(
                {
                    "person_id": str(person.id),
                    "name": person.name,
                    "items": person_items,
                    "subtotal": round(person_subtotal, 2),
                }
            )

        # Distribute tax and tip proportionally so per-person amounts sum
        # exactly to the bill's tax/tip (no penny-drift from independent rounding)
        tax_amounts = CalculationService._distribute(bill.tax_amount, raw_subtotals, total_subtotal)
        tip_amounts = CalculationService._distribute(bill.tip_amount, raw_subtotals, total_subtotal)

        for entry, tax_amount, tip_amount in zip(breakdown, tax_amounts, tip_amounts):
            entry["tax_amount"] = tax_amount
            entry["tip_amount"] = tip_amount
            entry["total"] = round(
                Decimal(entry["subtotal"]) + entry["tax_amount"] + entry["tip_amount"], 2
            )

        return {"people": breakdown}
