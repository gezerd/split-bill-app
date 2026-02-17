from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID


class PersonBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)


class PersonCreate(PersonBase):
    bill_id: UUID


class PersonUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)


class Person(PersonBase):
    id: UUID
    bill_id: UUID

    class Config:
        from_attributes = True


class PersonResponse(Person):
    pass
