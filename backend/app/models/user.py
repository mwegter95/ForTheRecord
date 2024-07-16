from pydantic import BaseModel
from enum import Enum
from typing import Optional

class Role(str, Enum):
    OWNER = "owner"
    ADMIN = "admin"
    USER = "user"
    GUEST = "guest"

class User(BaseModel):
    username: str
    email: str
    hashed_password: str
    role: Role
    first_name: Optional[str] = None
    last_name: Optional[str] = None
