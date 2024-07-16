from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from ..db import logs_collection
from ..auth import get_current_user, User

router = APIRouter()

class LogEntry(BaseModel):
    action: str
    reaction: str

SECRET_KEY = "your_secret_key"

def validate_secret_key(secret_key: str = Header(...)):
    if secret_key != SECRET_KEY:
        raise HTTPException(status_code=401, detail="Invalid secret key")

@router.post("/log", dependencies=[Depends(validate_secret_key)])
async def log_entry(log: LogEntry):
    log_entry = log.dict()
    logs_collection.insert_one(log_entry)
    return {"message": "Log entry added"}

@router.get("/logs")
async def get_logs(current_user: User = Depends(get_current_user)):
    if current_user.role not in [Role.ADMIN, Role.OWNER]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    logs = list(logs_collection.find({}))
    for log in logs:
        log["_id"] = str(log["_id"])
    return logs
