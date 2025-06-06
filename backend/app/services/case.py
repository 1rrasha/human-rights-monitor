from app.models.case import Case
from app.models.case_status_history import CaseStatusHistory
from app.models.user import User
from app.schemas.case import CaseCreate, CaseUpdate
from app.utils.file_handler import FileHandler
from fastapi import HTTPException, UploadFile
from datetime import datetime
from typing import Optional, List, Dict
from beanie import Link, PydanticObjectId
from beanie.operators import In, RegEx
import re
import logging

# Set up logging
logger = logging.getLogger(__name__)

async def create_case(case: CaseCreate, user_id: str, files: Optional[List[UploadFile]] = None) -> Dict:
    # Check if case ID already exists
    existing_case = await Case.find_one(Case.case_id == case.case_id)
    if existing_case:
        raise HTTPException(status_code=400, detail="Case ID already exists")

    # Fetch the user to validate and use as reference
    user = await User.find_one(User.id == PydanticObjectId(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Process uploaded files
    evidence_list = []
    if files:
        for file in files:
            evidence_data = await FileHandler.upload_file(file, case.case_id)
            evidence_list.append(evidence_data)

    # Update case data with evidence
    case_data = case.model_dump()
    case_data["evidence"] = evidence_list
    case_data["created_by"] = user  # Store User reference
    case_data["created_at"] = datetime.utcnow()
    case_data["updated_at"] = datetime.utcnow()

    # Create and save the case
    db_case = Case(**case_data)
    await db_case.insert()

    # Log initial status in case_status_history
    status_history = CaseStatusHistory(
        case_id=case.case_id,
        status=case_data["status"],
        changed_by=f"{user.full_name} ({user_id})",  # Full name + ID
        change_note="Case created"
    )
    await status_history.insert()

    # Include creator's information, _id, and serialized created_by in the response
    case_dict = db_case.dict()
    case_dict["_id"] = str(db_case.id)
    case_dict["created_by_user"] = {
        "user_id": str(user.id),
        "full_name": user.full_name,
        "email": user.email
    }
    case_dict["created_by"] = str(user.id)

    return case_dict

async def get_case(case_id: str) -> Dict:
    # Fetch case with linked user
    case = await Case.find_one(Case.case_id == case_id, fetch_links=True)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    # Get the user from the created_by reference
    user = case.created_by
    if not user:
        raise HTTPException(status_code=404, detail="Creator user not found")

    # Include creator's information, _id, and serialized created_by in the response
    case_dict = case.dict()
    case_dict["_id"] = str(case.id)
    case_dict["created_by_user"] = {
        "user_id": str(user.id),
        "full_name": user.full_name,
        "email": user.email
    }
    case_dict["created_by"] = str(user.id)

    return case_dict

async def list_cases(
    case_status: Optional[str] = None,
    location: Optional[str] = None,
    violation_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 10
) -> List[Dict]:
    filters = []

    try:
        if case_status:
            filters.append(Case.status == case_status)

        if location:
            # Escape special regex characters and create a case-insensitive regex
            escaped_location = re.escape(location)
            filters.append(RegEx(Case.location.country, f"^{escaped_location}$", options="i"))

        if violation_type:
            filters.append(In(Case.violation_types, [violation_type]))

        # Fetch cases with linked user data
        if filters:
            query = Case.find(*filters, fetch_links=True)
        else:
            query = Case.find(fetch_links=True)

        cases = await query.skip(skip).limit(limit).to_list()

        # Build response with creator information and _id
        result = []
        for case in cases:
            user = case.created_by
            case_dict = case.dict()
            case_dict["_id"] = str(case.id)
            case_dict["created_by_user"] = {
                "user_id": str(user.id),
                "full_name": user.full_name,
                "email": user.email
            } if user else {"user_id": "unknown", "full_name": "Unknown", "email": "unknown"}
            case_dict["created_by"] = str(user.id) if user else "unknown"
            result.append(case_dict)

        return result

    except Exception as e:
        logger.error(f"Error in list_cases: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list cases: {str(e)}")

async def update_case(case_id: str, case_update: CaseUpdate, user_id: str, files: Optional[List[UploadFile]] = None) -> Dict:
    # Fetch case with linked user
    case = await Case.find_one(Case.case_id == case_id, fetch_links=True)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    # Fetch the updating user for status history
    updating_user = await User.find_one(User.id == PydanticObjectId(user_id))
    if not updating_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Process uploaded files
    evidence_list = case.evidence
    if files:
        for file in files:
            evidence_data = await FileHandler.upload_file(file, case_id)
            evidence_list.append(evidence_data)

    # Update case data
    update_data = case_update.model_dump(exclude_unset=True)
    if evidence_list and "evidence" not in update_data:
        update_data["evidence"] = evidence_list

    old_status = case.status
    if update_data:
        for field, value in update_data.items():
            setattr(case, field, value)
        case.updated_at = datetime.utcnow()
        await case.save()

    # Log status change if status was updated
    if "status" in update_data and update_data["status"] != old_status:
        status_history = CaseStatusHistory(
            case_id=case_id,
            status=update_data["status"],
            changed_by=f"{updating_user.full_name} ({user_id})",  # Full name + ID
            change_note="Status updated"
        )
        await status_history.insert()

    # Get the creator user from the reference
    creator_user = case.created_by
    if not creator_user:
        raise HTTPException(status_code=404, detail="Creator user not found")

    # Include creator's information, _id, and serialized created_by in the response
    case_dict = case.dict()
    case_dict["_id"] = str(case.id)
    case_dict["created_by_user"] = {
        "user_id": str(creator_user.id),
        "full_name": creator_user.full_name,
        "email": creator_user.email
    }
    case_dict["created_by"] = str(creator_user.id)

    return case_dict

async def archive_case(case_id: str, user_id: str) -> Dict:
    # Fetch case with linked user
    case = await Case.find_one(Case.case_id == case_id, fetch_links=True)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    # Fetch the updating user
    user = await User.find_one(User.id == PydanticObjectId(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Combine full name and user ID for changed_by in status history
    changed_by_name = f"{user.full_name} ({user_id})"

    old_status = case.status
    case.status = "archived"
    case.updated_at = datetime.utcnow()
    await case.save()

    # Log status change
    status_history = CaseStatusHistory(
        case_id=case_id,
        status="archived",
        changed_by=changed_by_name,  # Full name + ID
        change_note="Case archived"
    )
    await status_history.insert()

    # Get the creator user from the reference
    creator_user = case.created_by
    if not creator_user:
        raise HTTPException(status_code=404, detail="Creator user not found")

    # Include creator's information, _id, and serialized created_by in the response
    case_dict = case.dict()
    case_dict["_id"] = str(case.id)
    case_dict["created_by_user"] = {
        "user_id": str(creator_user.id),
        "full_name": creator_user.full_name,
        "email": user.email
    }
    case_dict["created_by"] = str(creator_user.id)

    return case_dict