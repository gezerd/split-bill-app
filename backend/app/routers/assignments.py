from fastapi import APIRouter, HTTPException
from typing import List
from uuid import UUID

from app.schemas.assignment import AssignmentCreate, AssignmentResponse
from app.services import data_store

router = APIRouter(prefix="/api/assignments", tags=["assignments"])


@router.post("", response_model=AssignmentResponse)
def create_assignment(assignment: AssignmentCreate):
    """Assign an item to a person with optional share count"""
    # Verify item and person exist
    item = data_store.get_item(assignment.item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    person = data_store.get_person(assignment.person_id)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")

    # Verify they belong to the same bill
    if item.bill_id != person.bill_id:
        raise HTTPException(
            status_code=400, detail="Item and person must belong to the same bill"
        )

    new_assignment = data_store.create_assignment(
        item_id=assignment.item_id,
        person_id=assignment.person_id,
        share_count=assignment.share_count,
    )

    return {
        "id": new_assignment.id,
        "item_id": new_assignment.item_id,
        "person_id": new_assignment.person_id,
        "share_count": new_assignment.share_count,
    }


@router.get("", response_model=List[AssignmentResponse])
def get_assignments(bill_id: UUID):
    """Get all assignments for a bill"""
    assignments = data_store.get_assignments_by_bill(bill_id)
    return [
        {
            "id": assignment.id,
            "item_id": assignment.item_id,
            "person_id": assignment.person_id,
            "share_count": assignment.share_count,
        }
        for assignment in assignments
    ]


@router.delete("/{assignment_id}")
def delete_assignment(assignment_id: UUID):
    """Delete an assignment (unassign item from person)"""
    success = data_store.delete_assignment(assignment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Assignment not found")

    return {"message": "Assignment deleted successfully"}
