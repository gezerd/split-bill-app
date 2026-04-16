from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional
from uuid import UUID
from decimal import Decimal


class ItemBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str = Field(..., min_length=1, max_length=255)
    price: Decimal = Field(..., ge=0)
    quantity: int = Field(default=1, ge=1)
    custom_modifiers: List[str] = Field(default_factory=list, serialization_alias="customModifiers")


class ItemCreate(ItemBase):
    bill_id: UUID


class ItemUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    price: Optional[Decimal] = Field(None, ge=0)
    quantity: Optional[int] = Field(None, ge=1)


class Item(ItemBase):
    id: UUID
    bill_id: UUID

    class Config:
        from_attributes = True


class ItemResponse(Item):
    pass
