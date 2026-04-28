from fastapi import APIRouter
from pydantic import BaseModel
from app.services.ai_engine import ai_engine
from app.api.deps import get_admin_user
from app.models import User
from fastapi import Depends

router = APIRouter()

class SettingsUpdate(BaseModel):
    confidence_threshold: float

@router.get("/")
def get_settings():
    return ai_engine.settings

@router.post("/")
def update_settings(new_settings: SettingsUpdate, admin_user: User = Depends(get_admin_user)):
    # Overwrite the AI Engine's memory
    ai_engine.settings["confidence_threshold"] = new_settings.confidence_threshold
    return {"status": "success", "settings": ai_engine.settings}
