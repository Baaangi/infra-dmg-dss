from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from sqlalchemy.orm import Session
from typing import List
import shutil
import os
from datetime import datetime

from app.database import get_db
from app.models import Inspection, Defect, SeverityLevel, MaintenancePriority
from app.schemas import InspectionResponse, InspectionCreate
from app.services.ai_engine import ai_engine

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=InspectionResponse)
async def upload_inspection(
    file: UploadFile = File(...),
    structure_type: str = Form(...),
    age_years: int = Form(...),
    environment: str = Form(...),
    db: Session = Depends(get_db)
):
    # 1. Save Image
    file_location = f"{UPLOAD_DIR}/{datetime.now().timestamp()}_{file.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 2. Trigger AI Analysis
    detected_defects = await ai_engine.detect_damage(file_location)
    risk_score = ai_engine.calculate_risk_score(detected_defects)

    # Determine Priority (Simple logic)
    priority = MaintenancePriority.LOW
    if risk_score > 80: priority = MaintenancePriority.CRITICAL
    elif risk_score > 50: priority = MaintenancePriority.HIGH
    elif risk_score > 20: priority = MaintenancePriority.MEDIUM

    # 3. Save to DB
    new_inspection = Inspection(
        image_path=file_location,
        structure_type=structure_type,
        age_years=age_years,
        environment=environment,
        risk_score=risk_score,
        maintenance_priority=priority
    )
    db.add(new_inspection)
    db.commit()
    db.refresh(new_inspection)

    # Save Defects
    for d in detected_defects:
        new_defect = Defect(
            inspection_id=new_inspection.id,
            defect_type=d["defect_type"],
            confidence=d["confidence"],
            severity=SeverityLevel(d["severity"]),
            bbox=d["bbox"]
        )
        db.add(new_defect)
    
    db.commit()
    db.refresh(new_inspection) # Refresh to load relationships
    
    return new_inspection

@router.get("/{inspection_id}", response_model=InspectionResponse)
def get_inspection(inspection_id: int, db: Session = Depends(get_db)):
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")
    return inspection
