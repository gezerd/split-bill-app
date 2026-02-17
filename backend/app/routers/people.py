from fastapi import APIRouter, HTTPException
from typing import List
from uuid import UUID

from app.schemas.person import PersonCreate, PersonUpdate, PersonResponse
from app.services import data_store

router = APIRouter(prefix="/api/people", tags=["people"])


@router.post("", response_model=PersonResponse)
def create_person(person: PersonCreate):
    """Create a new person for bill splitting"""
    # Verify bill exists
    bill = data_store.get_bill(person.bill_id)
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    new_person = data_store.create_person(bill_id=person.bill_id, name=person.name)

    return {"id": new_person.id, "bill_id": new_person.bill_id, "name": new_person.name}


@router.get("", response_model=List[PersonResponse])
def get_people(bill_id: UUID):
    """Get all people for a bill"""
    people = data_store.get_people_by_bill(bill_id)
    return [{"id": person.id, "bill_id": person.bill_id, "name": person.name} for person in people]


@router.put("/{person_id}", response_model=PersonResponse)
def update_person(person_id: UUID, person_update: PersonUpdate):
    """Update a person's name"""
    if person_update.name is None:
        raise HTTPException(status_code=400, detail="Name is required")

    updated_person = data_store.update_person(person_id, name=person_update.name)

    if not updated_person:
        raise HTTPException(status_code=404, detail="Person not found")

    return {
        "id": updated_person.id,
        "bill_id": updated_person.bill_id,
        "name": updated_person.name,
    }


@router.delete("/{person_id}")
def delete_person(person_id: UUID):
    """Delete a person (and their assignments)"""
    success = data_store.delete_person(person_id)
    if not success:
        raise HTTPException(status_code=404, detail="Person not found")

    return {"message": "Person deleted successfully"}
