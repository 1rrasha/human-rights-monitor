from beanie import PydanticObjectId
from app.models.victim import Victim, VictimRiskAssessment
from app.schemas.victim import VictimCreate, VictimUpdate, VictimOut
from app.models.user import User
from fastapi import HTTPException
from datetime import datetime
from typing import Optional, List
from beanie.operators import In

async def create_victim(victim: VictimCreate, user_id: str) -> Victim:
    from app.models.case import Case
    # Validate case IDs and resolve to Link[Case]
    cases = []
    if victim.cases_involved:
        cases = await Case.find(In(Case.case_id, victim.cases_involved)).to_list()
        if len(cases) != len(victim.cases_involved):
            raise HTTPException(status_code=400, detail="One or more case IDs are invalid")

    victim_data = victim.model_dump()
    victim_data["cases_involved"] = cases  # Assign resolved Case documents
    victim_data["created_by"] = user_id
    victim_data["created_at"] = datetime.utcnow()
    victim_data["updated_at"] = datetime.utcnow()

    db_victim = Victim(**victim_data)
    await db_victim.insert()

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
    # Validate and convert case_id to ObjectId
    try:
        case_id_obj = PydanticObjectId(case_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid case ID format")

    # Find case by _id
    case = await Case.find_one(Case.id == case_id_obj)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    # Role-based access check
    if current_user.role not in ["admin", "case_worker"]:
        raise HTTPException(status_code=403, detail="Unauthorized to view victim details")

    # Find victims where cases_involved contains the case's _id
    victims = await Victim.find(
        {"cases_involved": {
            "$elemMatch": {
                "$ref": "cases",
                "$id": case_id_obj
            }
        }}
    ).to_list()
    return victims