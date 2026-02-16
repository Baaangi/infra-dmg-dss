from fastapi import FastAPI
from app.api.routes import router
from app.database import engine, Base
from app import models
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(title="infra-dmg-dss")

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # The URL of your Frontend
    allow_credentials=True,
    allow_methods=["*"], # Allow all methods (GET, POST, etc.)
    allow_headers=["*"], # Allow all headers
)

app.include_router(router)