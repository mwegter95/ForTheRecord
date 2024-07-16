from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from ..db import logs_collection
from ..auth import get_current_user, User, Role

router = APIRouter()

class LogEntry(BaseModel):
    action: str
    reaction: str

@router.post("/log")
async def log_entry(log: LogEntry, user: User = Depends(get_current_user)):
    if user.role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    log_entry = log.dict()
    logs_collection.insert_one(log_entry)
    return {"message": "Log entry added"}

@router.get("/logs")
async def get_logs(user: User = Depends(get_current_user)):
    if user.role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    logs = list(logs_collection.find({}, {"_id": 0}))
    return logs
