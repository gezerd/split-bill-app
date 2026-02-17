from pydantic import BaseModel, Field
from uuid import UUID


class AssignmentBase(BaseModel):
    item_id: UUID
    person_id: UUID
    share_count: int = Field(default=1, ge=1)


class AssignmentCreate(AssignmentBase):
    pass


class Assignment(AssignmentBase):
    id: UUID

    class Config:
        from_attributes = True


class AssignmentResponse(Assignment):
    pass
