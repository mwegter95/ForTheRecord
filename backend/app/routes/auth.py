from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from ..db import db
from ..auth import create_access_token, get_password_hash, verify_password, get_current_user
from ..models.user import User, Role
import re

router = APIRouter()

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    first_name: str
    last_name: str

class UserLogin(BaseModel):
    username: str
    password: str

def validate_password(password: str):
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
    if not re.search("[a-zA-Z]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one letter")
    if not re.search("[0-9]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one number")
    if re.search(r'[~`!@#$%^&*()_\-+=\[\]{}\\|;:"\',<.>/?]', password):
        raise HTTPException(status_code=400, detail="Password contains invalid characters")

@router.post("/signup")
async def sign_up(user: UserCreate):
    if db.users.find_one({"username": user.username}) or db.users.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Username or email already registered")
    validate_password(user.password)
    hashed_password = get_password_hash(user.password)
    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role=Role.USER,
        first_name=user.first_name,
        last_name=user.last_name
    )
    db.users.insert_one(new_user.dict())
    return {"message": "User created successfully"}

@router.post("/login")
async def login(user: UserLogin):
    db_user = db.users.find_one({"username": user.username})
    if not db_user or not verify_password(user.password, db_user['hashed_password']):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    access_token = create_access_token(data={"sub": db_user["username"], "role": db_user["role"]})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "first_name": db_user.get("first_name", ""),
        "last_name": db_user.get("last_name", "")
    }

@router.get("/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
