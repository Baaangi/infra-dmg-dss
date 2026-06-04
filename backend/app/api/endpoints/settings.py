from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.services.ai_engine import ai_engine
from app.api.deps import get_admin_user
from app.models import User

router = APIRouter()

class SettingsUpdate(BaseModel):
    confidence_threshold_road: float
    confidence_threshold_bridge: float
    confidence_threshold_building: float

@router.get("/")
def get_settings():
    return ai_engine.settings

@router.post("/")
@router.put("/")
def update_settings(new_settings: SettingsUpdate, admin_user: User = Depends(get_admin_user)):
    ai_engine.settings["confidence_threshold_road"] = new_settings.confidence_threshold_road
    ai_engine.settings["confidence_threshold_bridge"] = new_settings.confidence_threshold_bridge
    ai_engine.settings["confidence_threshold_building"] = new_settings.confidence_threshold_building
    ai_engine.save_settings()
    return {"status": "success", "settings": ai_engine.settings}
