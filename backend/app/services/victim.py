from app.models.victim import Victim, VictimRiskAssessment
from app.schemas.victim import VictimCreate, VictimUpdate, VictimOut
from app.models.user import User
from fastapi import HTTPException
from datetime import datetime
from typing import Optional, List
from beanie.operators import In

async def create_victim(victim: VictimCreate, user_id: str) -> Victim:
    # Validate case IDs exist
    if victim.cases_involved:
        from app.models.case import Case
        existing_cases = await Case.find(In(Case.case_id, victim.cases_involved)).to_list()
        if len(existing_cases) != len(victim.cases_involved):
            raise HTTPException(status_code=400, detail="One or more case IDs are invalid")

    # Prepare victim data
    victim_data = victim.model_dump()
    victim_data["created_by"] = user_id
    victim_data["created_at"] = datetime.utcnow()
    victim_data["updated_at"] = datetime.utcnow()

    # Create and save victim
    db_victim = Victim(**victim_data)
    await db_victim.insert()

    # Save risk assessment if provided
    if victim.risk_assessment:
        risk_assessment = VictimRiskAssessment(
            victim_id=str(db_victim.id),
            level=victim.risk_assessment.level,
            threats=victim.risk_assessment.threats,
            protection_needed=victim.risk_assessment.protection_needed,
            assessed_by=user_id
        )
        await risk_assessment.insert()

    return db_victim

async def get_victim(victim_id: str, current_user: User) -> Victim:
    victim = await Victim.find_one(Victim.id == PydanticObjectId(victim_id))
    if not victim:
        raise HTTPException(status_code=404, detail="Victim not found")

    # Role-based access check
    if current_user.role not in ["admin", "case_worker"]:
        raise HTTPException(status_code=403, detail="Unauthorized to view victim details")

    return victim

async def update_victim(victim_id: str, victim_update: VictimUpdate, user_id: str) -> Victim:
    victim = await Victim.find_one(Victim.id == PydanticObjectId(victim_id))
    if not victim:
        raise HTTPException(status_code=404, detail="Victim not found")

    update_data = victim_update.model_dump(exclude_unset=True)
    if update_data:
        for field, value in update_data.items():
            setattr(victim, field, value)

        victim.updated_at = datetime.utcnow()
        await victim.save()

        # Update risk assessment if provided
        if "risk_assessment" in update_data:
            await VictimRiskAssessment.find(VictimRiskAssessment.victim_id == str(victim_id)).delete()
            risk_assessment = VictimRiskAssessment(
                victim_id=str(victim_id),
                level=victim_update.risk_assessment.level,
                threats=victim_update.risk_assessment.threats,
                protection_needed=victim_update.risk_assessment.protection_needed,
                assessed_by=user_id
            )
            await risk_assessment.insert()

    return victim

async def list_victims_by_case(case_id: str, current_user: User) -> List[Victim]:
    from app.models.case import Case
    case = await Case.find_one(Case.case_id == case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    # Role-based access check
    if current_user.role not in ["admin", "case_worker"]:
        raise HTTPException(status_code=403, detail="Unauthorized to view victim details")

    victims = await Victim.find(In(Victim.cases_involved, [case_id])).to_list()
    return victims