from app.models.case import Case
from app.schemas.case import CaseCreate, CaseUpdate
from fastapi import HTTPException
from datetime import datetime
from typing import Optional, List

async def create_case(case: CaseCreate, user_id: str) -> Case:
    # Check if case ID already exists
    existing_case = await Case.find_one(Case.case_id == case.case_id)
    if existing_case:
        raise HTTPException(status_code=400, detail="Case ID already exists")
    
    # Convert Pydantic model to dict using model_dump() instead of dict()
    case_data = case.model_dump()
    case_data["created_by"] = user_id
    case_data["created_at"] = datetime.utcnow()
    case_data["updated_at"] = datetime.utcnow()
    
    # Create and save the case
    db_case = Case(**case_data)
    await db_case.insert()
    return db_case

async def get_case(case_id: str) -> Case:
    case = await Case.find_one(Case.case_id == case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case

async def list_cases(
    status: Optional[str] = None,
    location: Optional[str] = None,
    violation_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 10
) -> List[Case]:
    # Build query filters properly
    filters = []
    
    if status:
        filters.append(Case.status == status)
    
    if location:
        # Use regex for partial matching on country
        filters.append(Case.location.country.regex(location, "i"))
    
    if violation_type:
        # Check if violation_type is in the violation_types array
        filters.append(Case.violation_types.in_([violation_type]))
    
    # Combine filters with AND logic
    if filters:
        query = Case.find(*filters)
    else:
        query = Case.find()
    
    cases = await query.skip(skip).limit(limit).to_list()
    return cases

async def update_case(case_id: str, case_update: CaseUpdate) -> Case:
    case = await Case.find_one(Case.case_id == case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Get update data using model_dump() instead of dict()
    update_data = case_update.model_dump(exclude_unset=True)
    
    if update_data:
        # Update the case object directly
        for field, value in update_data.items():
            setattr(case, field, value)
        
        # Set updated timestamp
        case.updated_at = datetime.utcnow()
        
        # Save the updated case
        await case.save()
    
    return case

async def archive_case(case_id: str):
    case = await Case.find_one(Case.case_id == case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Option 1: Soft delete (recommended for audit trail)
    case.status = "archived"
    case.updated_at = datetime.utcnow()
    await case.save()
    
    # Option 2: Hard delete (uncomment if you prefer this)
    # await case.delete()