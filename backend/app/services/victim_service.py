from fastapi import HTTPException
from app.models.victim import Victim
from app.schemas.victim import VictimCreate, VictimResponse
from datetime import datetime
from bson import ObjectId
from typing import List

class VictimService:
    @staticmethod
    async def create_victim(victim: VictimCreate, user_role: str) -> VictimResponse:
        if user_role not in ["admin", "manager"]:  # Placeholder role check
            raise HTTPException(status_code=403, detail="Unauthorized")
        victim_dict = victim.dict()
        victim_dict["created_at"] = datetime.utcnow()
        victim_dict["updated_at"] = datetime.utcnow()
        victim_doc = Victim(**victim_dict)
        await victim_doc.insert()
        return VictimResponse.from_orm(victim_doc)

    @staticmethod
    async def get_victim(victim_id: str, user_role: str) -> VictimResponse:
        if user_role not in ["admin", "manager"]:
            raise HTTPException(status_code=403, detail="Unauthorized")
        victim = await Victim.get(victim_id)
        if not victim:
            raise HTTPException(status_code=404, detail="Victim not found")
        return VictimResponse.from_orm(victim)

    @staticmethod
    async def update_victim(victim_id: str, update: dict, user_role: str) -> VictimResponse:
        if user_role not in ["admin", "manager"]:
            raise HTTPException(status_code=403, detail="Unauthorized")
        victim = await Victim.get(victim_id)
        if not victim:
            raise HTTPException(status_code=404, detail="Victim not found")
        update["updated_at"] = datetime.utcnow()
        await victim.update({"$set": update})
        updated_victim = await Victim.get(victim_id)
        return VictimResponse.from_orm(updated_victim)

    @staticmethod
    async def list_victims_by_case(case_id: str, user_role: str) -> List[VictimResponse]:
        if user_role not in ["admin", "manager"]:
            raise HTTPException(status_code=403, detail="Unauthorized")
        victims = await Victim.find({"cases_involved": ObjectId(case_id)}).to_list()
        return [VictimResponse.from_orm(victim) for victim in victims]