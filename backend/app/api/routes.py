from fastapi import APIRouter
from app.api.endpoints import inspections

router = APIRouter()

@router.get("/")
def root():
    return {"message": "running"}

router.include_router(inspections.router, prefix="/inspections", tags=["inspections"])
