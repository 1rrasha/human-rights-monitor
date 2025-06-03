# from fastapi import APIRouter, HTTPException, Depends
# from app.database import get_db
# from app.schemas.victim import VictimCreate, VictimResponse
# from bson import ObjectId
# from datetime import datetime

# router = APIRouter(prefix="/victims", tags=["Victims"])

# @router.post("/", response_model=VictimResponse)
# async def create_victim(victim: VictimCreate, db=Depends(get_db)):
#     victim_dict = victim.dict()
#     victim_dict["created_at"] = datetime.utcnow()
#     victim_dict["updated_at"] = datetime.utcnow()
#     result = db.individuals.insert_one(victim_dict)
#     victim_dict["_id"] = result.inserted_id
#     return VictimResponse(**victim_dict)

# @router.get("/{victim_id}", response_model=VictimResponse)
# async def get_victim(victim_id: str, db=Depends(get_db)):
#     victim = db.individuals.find_one({"_id": ObjectId(victim_id)})
#     if not victim:
#         raise HTTPException(status_code=404, detail="Victim not found")
#     return VictimResponse(**victim)

# @router.patch("/{victim_id}", response_model=VictimResponse)
# async def update_victim(victim_id: str, update: dict, db=Depends(get_db)):
#     update["updated_at"] = datetime.utcnow()
#     result = db.individuals.find_one_and_update(
#         {"_id": ObjectId(victim_id)},
#         {"$set": update},
#         return_document=True
#     )
#     if not result:
#         raise HTTPException(status_code=404, detail="Victim not found")
#     return VictimResponse(**result)