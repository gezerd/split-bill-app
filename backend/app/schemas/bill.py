from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from decimal import Decimal


class BillBase(BaseModel):
    receipt_image_url: Optional[str] = None
    subtotal: Decimal = Field(default=Decimal("0.00"), ge=0)
    tax_amount: Decimal = Field(default=Decimal("0.00"), ge=0)
    tip_amount: Decimal = Field(default=Decimal("0.00"), ge=0)
    total: Decimal = Field(default=Decimal("0.00"), ge=0)


class BillCreate(BillBase):
    pass


class BillUpdate(BaseModel):
    tax_amount: Optional[Decimal] = Field(default=None, ge=0)
    tip_amount: Optional[Decimal] = Field(default=None, ge=0)


class Bill(BillBase):
    id: UUID

    class Config:
        from_attributes = True


class BillResponse(Bill):
    pass


class ItemBreakdown(BaseModel):
    name: str
    price: Decimal
    quantity: int
    share_count: int
    total_shares: int
    share_amount: Decimal


class PersonBreakdown(BaseModel):
    person_id: UUID
    name: str
    items: List[ItemBreakdown]
    subtotal: Decimal
    tax_amount: Decimal
    tip_amount: Decimal
    total: Decimal


class BillBreakdownResponse(BaseModel):
    people: List[PersonBreakdown]
