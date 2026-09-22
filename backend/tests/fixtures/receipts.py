from decimal import Decimal

# Mirrors the shape OCRService.extract_receipt_data returns.

SIMPLE_ONE_ITEM = {
    "items": [
        {"name": "Burger", "price": Decimal("10.00"), "quantity": 1, "customModifiers": []},
    ],
    "tax": Decimal("0.00"),
    "tip": Decimal("0.00"),
    "subtotal": Decimal("10.00"),
    "total": Decimal("10.00"),
}

SHARED_ITEM_QTY3 = {
    "items": [
        {"name": "Pizza", "price": Decimal("9.00"), "quantity": 3, "customModifiers": []},
    ],
    "tax": Decimal("0.00"),
    "tip": Decimal("0.00"),
    "subtotal": Decimal("27.00"),
    "total": Decimal("27.00"),
}

ZERO_TAX_TIP = {
    "items": [
        {"name": "Coffee", "price": Decimal("3.50"), "quantity": 2, "customModifiers": []},
        {"name": "Muffin", "price": Decimal("2.75"), "quantity": 1, "customModifiers": []},
    ],
    "tax": Decimal("0.00"),
    "tip": Decimal("0.00"),
    "subtotal": Decimal("9.75"),
    "total": Decimal("9.75"),
}

ODD_CENT_TOTAL = {
    "items": [
        {"name": "Entree", "price": Decimal("10.00"), "quantity": 3, "customModifiers": []},
    ],
    "tax": Decimal("10.00"),
    "tip": Decimal("0.00"),
    "subtotal": Decimal("30.00"),
    "total": Decimal("40.00"),
}
