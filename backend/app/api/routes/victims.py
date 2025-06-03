from fastapi import APIRouter, Depends
from app.schemas.victim import VictimCreate, VictimOut, VictimUpdate
from app.services.victim import create_victim, get_victim, update_victim, list_victims_by_case
from app.models.user import User
from app.core.security import get_current_user
from typing import List

router = APIRouter(prefix="/victims", tags=["Victims"])

@router.post("/", response_model=VictimOut)
async def add_victim(victim: VictimCreate, current_user: User = Depends(get_current_user)):
    db_victim = await create_victim(victim, str(current_user.id))
    return VictimOut.from_document(db_victim, include_sensitive=current_user.role in ["admin", "case_worker"])

@router.get("/{victim_id}", response_model=VictimOut)
async def get_victim_details(victim_id: str, current_user: User = Depends(get_current_user)):
    victim = await get_victim(victim_id, current_user)
    return VictimOut.from_document(victim, include_sensitive=current_user.role in ["admin", "case_worker"])

@router.patch("/{victim_id}", response_model=VictimOut)
async def update_victim_risk(victim_id: str, victim_update: VictimUpdate, current_user: User = Depends(get_current_user)):
    victim = await update_victim(victim_id, victim_update, str(current_user.id))
    return VictimOut.from_document(victim, include_sensitive=current_user.role in ["admin", "case_worker"])

@router.get("/case/{case_id}", response_model=List[VictimOut])
async def list_victims_for_case(case_id: str, current_user: User = Depends(get_current_user)):
    victims = await list_victims_by_case(case_id, current_user)
    return [
        VictimOut.from_document(victim, include_sensitive=current_user.role in ["admin", "case_worker"])
        for victim in victims
    ]