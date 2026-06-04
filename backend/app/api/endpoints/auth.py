import os
import shutil
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.models import User, Inspection
from app.core.security import get_password_hash, verify_password, create_access_token
from app.api.deps import get_current_user

router = APIRouter()
AVATAR_DIR = "uploads/avatars"
os.makedirs(AVATAR_DIR, exist_ok=True)

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    company_name: Optional[str] = None

@router.post("/register")
async def register(
    username: str = Form(...),
    password: str = Form(...),
    is_admin: bool = Form(False),
    full_name: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    role: Optional[str] = Form(None),
    company_name: Optional[str] = Form(None),
    profile_pic: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == username).first()
    if user: raise HTTPException(status_code=400, detail="Username already exists")
    
    file_location = None
    if profile_pic:
        file_location = f"{AVATAR_DIR}/{datetime.now().timestamp()}_{profile_pic.filename}"
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(profile_pic.file, buffer)

    new_user = User(
        username=username, hashed_password=get_password_hash(password),
        is_admin=is_admin, full_name=full_name, email=email,
        role=role, company_name=company_name, profile_pic_path=file_location
    )
    db.add(new_user)
    db.commit()
    return {"message": "Account Provisioned"}

@router.post("/login")
def login(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect credentials")
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer", "is_admin": user.is_admin}

@router.get("/me")
def get_user_status(current_user: User = Depends(get_current_user)):
    return {
        "username": current_user.username, "is_admin": current_user.is_admin,
        "full_name": current_user.full_name, "email": current_user.email,
        "role": current_user.role, "company_name": current_user.company_name,
        "profile_pic_path": current_user.profile_pic_path
    }

@router.put("/me")
def update_user_status(profile_in: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if profile_in.full_name is not None: current_user.full_name = profile_in.full_name
    if profile_in.email is not None: current_user.email = profile_in.email
    if profile_in.role is not None: current_user.role = profile_in.role
    if profile_in.company_name is not None: current_user.company_name = profile_in.company_name
    db.commit()
    return {"message": "Profile synced successfully"}

@router.post("/me/avatar")
async def update_avatar(profile_pic: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    file_location = f"{AVATAR_DIR}/{datetime.now().timestamp()}_{profile_pic.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(profile_pic.file, buffer)
    current_user.profile_pic_path = file_location
    db.commit()
    return {"message": "Avatar Hot-Swapped"}

# ==========================================
# ADMIN SYSTEM ROUTES
# ==========================================

@router.get("/users")
def get_all_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Clearance Level 4 Required")
    users = db.query(User).all()
    
    result = []
    for u in users:
        result.append({
            "id": u.id,
            "username": u.username,
            "full_name": u.full_name,
            "email": u.email,
            "role": u.role,
            "company_name": u.company_name,
            "profile_pic_path": u.profile_pic_path,
            "is_admin": u.is_admin,
            "total_scans": len(u.inspections)
        })
    return result

@router.delete("/users/{user_id}")
def terminate_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Clearance Level 4 Required")
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot terminate your own root account")
    
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user: raise HTTPException(status_code=404)
    
    # Hard Delete all inspections uploaded by this user, then terminate the user
    db.query(Inspection).filter(Inspection.user_id == user_id).delete()
    db.delete(target_user)
    db.commit()
    return {"message": "Personnel Terminated and Data Purged"}

@router.put("/users/{user_id}/clearance")
def toggle_admin(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Clearance Level 4 Required")
    
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user: raise HTTPException(status_code=404)
    
    target_user.is_admin = not target_user.is_admin
    db.commit()
    return {"message": f"Clearance Updated"}

