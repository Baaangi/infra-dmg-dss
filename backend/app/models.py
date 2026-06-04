from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum as SqlEnum, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .database import Base

class SeverityLevel(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

class MaintenancePriority(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_admin = Column(Boolean, default=False)
    full_name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    role = Column(String, nullable=True)
    company_name = Column(String, nullable=True)
    profile_pic_path = Column(String, nullable=True)
    
    inspections = relationship("Inspection", back_populates="owner")

class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True, index=True)
    #user
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) 
    owner = relationship("User", back_populates="inspections")

    image_path = Column(String, nullable=False)
    structure_type = Column(String, index=True) # bridge, road, building
    age_years = Column(Integer)
    environment = Column(String) # urban, coastal, rural
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Store overall analysis results
    risk_score = Column(Float, default=0.0) # 0-100
    maintenance_priority = Column(SqlEnum(MaintenancePriority), default=MaintenancePriority.LOW)
    executive_summary = Column(String, nullable=True)
    overall_recommendation = Column(String, nullable=True)
    
    # Relationships
    defects = relationship("Defect", back_populates="inspection")

class Defect(Base):
    __tablename__ = "defects"

    id = Column(Integer, primary_key=True, index=True)
    inspection_id = Column(Integer, ForeignKey("inspections.id"))
    defect_type = Column(String, index=True) # crack, spalling, corrosion
    confidence = Column(Float)
    severity = Column(SqlEnum(SeverityLevel), default=SeverityLevel.LOW)
    damage_scale = Column(String, default="Minor")
    repair_action = Column(String, default="Monitor")
    
    # Location on image (Bounding Box: [x1, y1, x2, y2])
    bbox = Column(JSON) 
    
    inspection = relationship("Inspection", back_populates="defects")
