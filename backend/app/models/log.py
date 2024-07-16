from pydantic import BaseModel

class LogEntry(BaseModel):
    action: str
    reaction: str

