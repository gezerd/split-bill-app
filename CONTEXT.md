# Split Bill

Splits one restaurant receipt between the people at the table. Each person pays for what they had, plus a share of tax and tip in proportion to it.

## Language

### The bill

**Bill**:
One receipt being split, holding its Items, People, tax and tip.
_Avoid_: Receipt (the paper or image the Bill was made from), check

**Item**:
One line on the Bill: a name, a unit price and a quantity. Its total is unit price × quantity.
_Avoid_: Line item, dish, order

**Person**:
Someone at the table who pays part of the Bill.
_Avoid_: User, diner, member

**Items subtotal**:
The sum of every Item's total. It is the subtotal the split uses.
_Avoid_: Subtotal (when you mean this one and not the Receipt subtotal)

**Receipt subtotal**:
The subtotal printed on the receipt, as read by OCR. It is used only to check the Items subtotal, never to split.

### Splitting

**Share**:
One portion of an Item. Each Person pays the Item total × their Shares ÷ all Shares on that Item.
_Avoid_: Unit (a Share is a weight, not one piece of the quantity)

**Assignment**:
A link between one Person and one Item, recording how many Shares that Person holds.

**Fully assigned**:
An Item whose total Shares are at least its quantity. A quantity-1 Item is fully assigned as soon as anyone holds a Share.

**Partially assigned**:
An Item with at least one Share, but fewer Shares than its quantity. This can be deliberate (two people splitting three orders of fries equally), so it is a warning, never a blocker.

**Unassigned item**:
An Item with no Shares at all. Nobody would pay for it, so the split cannot finish until every Item has at least one Share.

**Unassigned person**:
A Person who holds no Shares on any Item, so they owe nothing. Allowed, with a warning.

**Selected person**:
The Person picked in the people row. While someone is selected, tapping an Item gives that Person a Share or takes it away.
_Avoid_: Active user, current person

### Checking

**Subtotal mismatch**:
When the Items subtotal differs from the Receipt subtotal, which usually means an Item was missed or misread. It is only checked when the receipt had a subtotal.
