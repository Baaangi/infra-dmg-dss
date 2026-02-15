from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum as SqlEnum, JSON
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

class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True, index=True)
    image_path = Column(String, nullable=False)
    structure_type = Column(String, index=True) # bridge, road, building
    age_years = Column(Integer)
    environment = Column(String) # urban, coastal, rural
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Store overall analysis results
    risk_score = Column(Float, default=0.0) # 0-100
    maintenance_priority = Column(SqlEnum(MaintenancePriority), default=MaintenancePriority.LOW)
    
    # Relationships
    defects = relationship("Defect", back_populates="inspection")

class Defect(Base):
    __tablename__ = "defects"

    id = Column(Integer, primary_key=True, index=True)
    inspection_id = Column(Integer, ForeignKey("inspections.id"))
    defect_type = Column(String, index=True) # crack, spalling, corrosion
    confidence = Column(Float)
    severity = Column(SqlEnum(SeverityLevel), default=SeverityLevel.LOW)
    
    # Location on image (Bounding Box: [x1, y1, x2, y2])
    bbox = Column(JSON) 
    
    inspection = relationship("Inspection", back_populates="defects")
