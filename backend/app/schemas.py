from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any
from datetime import datetime
from enum import Enum

# Shared Enums
class SeverityLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

class MaintenancePriority(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

# --- Defect Schemas ---
class DefectBase(BaseModel):
    defect_type: str
    confidence: float
    severity: SeverityLevel
    bbox: List[float] # [x1, y1, x2, y2]

class DefectCreate(DefectBase):
    pass

class Defect(DefectBase):
    id: int
    inspection_id: int

    # V2 Syntax: Use model_config instead of class Config
    model_config = ConfigDict(from_attributes=True)

# --- Inspection Schemas ---
class InspectionBase(BaseModel):
    structure_type: str
    age_years: int
    environment: str

class InspectionCreate(InspectionBase):
    pass 

class InspectionResponse(InspectionBase):
    id: int
    image_path: str
    timestamp: datetime
    risk_score: float
    maintenance_priority: MaintenancePriority
    defects: List[Defect] = []

    # V2 Syntax: Use model_config instead of class Config
    model_config = ConfigDict(from_attributes=True)