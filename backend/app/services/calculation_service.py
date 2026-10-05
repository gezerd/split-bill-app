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

        # Split each item to whole cents by Share weight (largest remainder),
        # so holders' amounts add up exactly to the item total.
        item_splits = {}
        item_total_shares = {}
        for item in items:
            holders = [
                (person.id, a.share_count)
                for person in people
                for a in assignments
                if a.item_id == item.id and a.person_id == person.id and a.share_count > 0
            ]
            total_shares = sum(c for _, c in holders)
            item_total_shares[item.id] = total_shares
            if total_shares == 0:
                continue
            total_cents = int((item.price * item.quantity * 100).to_integral_value())
            raw = [Decimal(total_cents * c) / total_shares for _, c in holders]
            floors = [int(r.to_integral_value(rounding=ROUND_DOWN)) for r in raw]
            leftover = total_cents - sum(floors)
            order = sorted(range(len(holders)), key=lambda i: raw[i] - floors[i], reverse=True)
            for i in order[:leftover]:
                floors[i] += 1
            item_splits[item.id] = {pid: floors[i] for i, (pid, _) in enumerate(holders)}

        items_by_id = {item.id: item for item in items}
        breakdown = []
        raw_subtotals = []
        total_subtotal = Decimal("0.00")

        for person in people:
            person_items = []
            person_subtotal = Decimal("0.00")

            for assignment in assignments:
                if assignment.person_id != person.id or assignment.share_count <= 0:
                    continue
                item = items_by_id.get(assignment.item_id)
                if not item:
                    continue

                share_amount = Decimal(item_splits[item.id][person.id]) / 100

                person_items.append(
                    {
                        "name": item.name,
                        "price": item.price,
                        "quantity": item.quantity,
                        "share_count": assignment.share_count,
                        "total_shares": item_total_shares[item.id],
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
