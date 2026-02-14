from fastapi import FastAPI
from app.api.routes import router

app = FastAPI(title="infra-dmg-dss")
app.include_router(router)