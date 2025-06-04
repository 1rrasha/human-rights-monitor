from fastapi import APIRouter, Depends, Query
from app.schemas.case import CaseCreate, CaseOut, CaseUpdate
from app.services.case import create_case, get_case, list_cases, update_case, archive_case
from app.models.user import User
from app.core.security import get_current_user
from typing import List, Optional

router = APIRouter(prefix="/cases", tags=["Cases"])

@router.post("/", response_model=CaseOut)
async def create_new_case(case: CaseCreate, current_user: User = Depends(get_current_user)):
    db_case = await create_case(case, str(current_user.id))
    # Convert Case document to CaseOut schema
    return CaseOut.from_document(db_case)

@router.get("/{case_id}", response_model=CaseOut)
async def get_specific_case(case_id: str):
    case = await get_case(case_id)
    return CaseOut.from_document(case)

@router.get("/", response_model=List[CaseOut])
async def list_all_cases(
    status: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    violation_type: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
):
    cases = await list_cases(status, location, violation_type, skip, limit)
    return [CaseOut.from_document(case) for case in cases]

@router.patch("/{case_id}", response_model=CaseOut)
async def update_case_status(case_id: str, case_update: CaseUpdate, current_user: User = Depends(get_current_user)):
    case = await update_case(case_id, case_update)
    return CaseOut.from_document(case)

@router.delete("/{case_id}")
async def archive_specific_case(case_id: str, current_user: User = Depends(get_current_user)):
    await archive_case(case_id)
    return {"message": "Case archived"}