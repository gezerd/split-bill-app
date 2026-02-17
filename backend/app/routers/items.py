from fastapi import APIRouter, HTTPException
from typing import List
from uuid import UUID

from app.schemas.item import ItemCreate, ItemUpdate, ItemResponse
from app.services import data_store

router = APIRouter(prefix="/api/items", tags=["items"])


@router.post("", response_model=ItemResponse)
def create_item(item: ItemCreate):
    """Create a new item (e.g., if OCR missed something)"""
    # Verify bill exists
    bill = data_store.get_bill(item.bill_id)
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    new_item = data_store.create_item(
        bill_id=item.bill_id, name=item.name, price=item.price, quantity=item.quantity
    )

    return {
        "id": new_item.id,
        "bill_id": new_item.bill_id,
        "name": new_item.name,
        "price": new_item.price,
        "quantity": new_item.quantity,
    }


@router.get("", response_model=List[ItemResponse])
def get_items(bill_id: UUID):
    """Get all items for a bill"""
    items = data_store.get_items_by_bill(bill_id)
    return [
        {
            "id": item.id,
            "bill_id": item.bill_id,
            "name": item.name,
            "price": item.price,
            "quantity": item.quantity,
        }
        for item in items
    ]


@router.put("/{item_id}", response_model=ItemResponse)
def update_item(item_id: UUID, item_update: ItemUpdate):
    """Update an item (e.g., fix OCR errors)"""
    updated_item = data_store.update_item(
        item_id, name=item_update.name, price=item_update.price, quantity=item_update.quantity
    )

    if not updated_item:
        raise HTTPException(status_code=404, detail="Item not found")

    return {
        "id": updated_item.id,
        "bill_id": updated_item.bill_id,
        "name": updated_item.name,
        "price": updated_item.price,
        "quantity": updated_item.quantity,
    }


@router.delete("/{item_id}")
def delete_item(item_id: UUID):
    """Delete an item (and its assignments)"""
    success = data_store.delete_item(item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")

    return {"message": "Item deleted successfully"}
