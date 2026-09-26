# Shares are weights, not units

Until now a Share was one unit of an Item's quantity: a Person paid unit price × their Shares, and an Item could never have more Shares than its quantity. That made it impossible to split a single family-style dish between several people. We changed a Share to a weight. Each Person pays the Item total × their Shares ÷ all Shares on the Item. Three people with one Share each on one platter each pay a third. For a quantity-3 Item, holding 2 of 3 Shares still means paying for two of the three units.

## Consequences

- Shares on an Item are no longer capped at its quantity.
- If fewer Shares have been assigned than the Item's quantity, the people holding them cover the whole Item. For example, one Person with ×2 on a quantity-3 Item pays for all 3. The UI flags this as **Partially assigned** but doesn't block it, because fewer Shares than the quantity is often deliberate (two people splitting three orders of fries equally).
