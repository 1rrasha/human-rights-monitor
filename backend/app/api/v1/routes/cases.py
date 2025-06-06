import json
from fastapi import APIRouter, Depends, Query, UploadFile, File, Form, status, HTTPException
from app.schemas.case import CaseCreate, CaseOut, CaseUpdate
from app.services.case import create_case, get_case, list_cases, update_case, archive_case
from app.models.user import User
from app.core.security import get_current_user
from typing import List, Optional
import random
import logging

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/cases", tags=["Cases"])

def generate_case_id():
    # Generate random numbers for the format HRM-XXX-XXXX
    first_part = random.randint(100, 999)
    second_part = random.randint(1000, 9999)
    return f"HRM-{first_part}-{second_part}"

@router.post("/", response_model=CaseOut)
async def create_new_case(
    case: str = Form(...),  # Accept case as a JSON string
    files: Optional[List[UploadFile]] = File(None),
    current_user: User = Depends(get_current_user)
):
    try:
        case_data = json.loads(case)  # Parse the JSON string into a dictionary
        if "case_id" not in case_data:
            case_data["case_id"] = generate_case_id()
        case_obj = CaseCreate(**case_data)  # Validate with Pydantic
    except json.JSONDecodeError:
        raise HTTPException(status_code=422, detail="Invalid JSON in case field")
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    db_case = await create_case(case_obj, str(current_user.id), files)
    return CaseOut.from_document(db_case)

@router.get("/{case_id}", response_model=CaseOut)
async def get_specific_case(case_id: str):
    case = await get_case(case_id)
    return CaseOut.from_document(case)

@router.get("/", response_model=List[CaseOut])
async def list_all_cases(
    case_status: Optional[str] = None,
    location: Optional[str] = None,
    violation_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 10
):
    try:
        cases = await list_cases(case_status, location, violation_type, skip, limit)
        return [CaseOut.from_document(case) for case in cases]
    except Exception as e:
        logger.error(f"Error in list_all_cases: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.patch("/{case_id}", response_model=CaseOut)
async def update_case_status(
    case_id: str,
    case_update: str = Form(...),  # Accept case_update as a JSON string
    files: Optional[List[UploadFile]] = File(None),
    current_user: User = Depends(get_current_user)
):
    try:
        update_data = json.loads(case_update)
        case_update_obj = CaseUpdate(**update_data)
    except json.JSONDecodeError:
        raise HTTPException(status_code=422, detail="Invalid JSON in case_update field")
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    case = await update_case(case_id, case_update_obj, str(current_user.id), files)
    return CaseOut.from_document(case)

@router.delete("/{case_id}")
async def archive_specific_case(case_id: str, current_user: User = Depends(get_current_user)):
    await archive_case(case_id, str(current_user.id))
    return {"message": "Case archived"}