from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List
from uuid import UUID
from decimal import Decimal

from app.schemas.bill import (
    BillResponse,
    BillUpdate,
    BillBreakdownResponse,
)
from app.schemas.item import ItemResponse
from app.services import data_store, OCRService, CalculationService

router = APIRouter(prefix="/api/bills", tags=["bills"])
ocr_service = OCRService()
calc_service = CalculationService()


@router.post("/upload-receipt", response_model=dict)
async def upload_receipt(file: UploadFile = File(...)):
    """
    Upload a receipt image and extract items using OCR

    Returns:
        Dict with bill_id and extracted items, tax, tip, subtotal, total
    """
    try:
        # Read image file
        image_bytes = await file.read()

        # Extract receipt data using OCR
        receipt_data = ocr_service.extract_receipt_data(image_bytes)

        # Create bill in memory
        bill = data_store.create_bill(
            receipt_image_url=file.filename,
            subtotal=receipt_data["subtotal"],
            tax_amount=receipt_data["tax"],
            tip_amount=receipt_data["tip"],
            total=receipt_data["total"],
        )

        # Create items in memory
        items = []
        for item_data in receipt_data["items"]:
            item = data_store.create_item(
                bill_id=bill.id,
                name=item_data["name"],
                price=item_data["price"],
                quantity=item_data["quantity"],
                custom_modifiers=item_data.get("customModifiers", []),
            )
            items.append(
                {
                    "id": str(item.id),
                    "name": item.name,
                    "price": float(item.price),
                    "quantity": item.quantity,
                    "customModifiers": item.custom_modifiers,
                }
            )

        return {
            "bill_id": str(bill.id),
            "items": items,
            "tax_amount": float(bill.tax_amount),
            "tip_amount": float(bill.tip_amount),
            "subtotal": float(bill.subtotal),
            "total": float(bill.total),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process receipt: {str(e)}")


@router.get("/{bill_id}", response_model=BillResponse)
def get_bill(bill_id: UUID):
    """Get bill by ID"""
    bill = data_store.get_bill(bill_id)
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    return {
        "id": bill.id,
        "receipt_image_url": bill.receipt_image_url,
        "subtotal": bill.subtotal,
        "tax_amount": bill.tax_amount,
        "tip_amount": bill.tip_amount,
        "total": bill.total,
    }


@router.put("/{bill_id}/tip")
def update_tip(bill_id: UUID, tip_amount: Decimal):
    """Update tip amount for a bill"""
    bill = data_store.update_bill(bill_id, tip_amount=tip_amount)
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    return {
        "id": bill.id,
        "receipt_image_url": bill.receipt_image_url,
        "subtotal": bill.subtotal,
        "tax_amount": bill.tax_amount,
        "tip_amount": bill.tip_amount,
        "total": bill.total,
    }


@router.put("/{bill_id}/tax")
def update_tax(bill_id: UUID, tax_amount: Decimal):
    """Update tax amount for a bill"""
    bill = data_store.update_bill(bill_id, tax_amount=tax_amount)
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    return {
        "id": bill.id,
        "receipt_image_url": bill.receipt_image_url,
        "subtotal": bill.subtotal,
        "tax_amount": bill.tax_amount,
        "tip_amount": bill.tip_amount,
        "total": bill.total,
    }


@router.delete("/{bill_id}")
def delete_bill(bill_id: UUID):
    """Delete a bill and all associated data"""
    success = data_store.delete_bill(bill_id)
    if not success:
        raise HTTPException(status_code=404, detail="Bill not found")

    return {"message": "Bill deleted successfully"}


@router.get("/{bill_id}/breakdown", response_model=BillBreakdownResponse)
def get_breakdown(bill_id: UUID):
    """Calculate and return the final breakdown of who owes what"""
    try:
        breakdown = calc_service.calculate_breakdown(bill_id)
        return breakdown
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate breakdown: {str(e)}")
