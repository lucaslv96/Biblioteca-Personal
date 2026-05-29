from fastapi import FastAPI

from app.api.v1.router import api_router
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title=settings.project_name,
    version=settings.version,
    description="REST API for managing a personal book library.",
)

app.include_router(api_router, prefix=settings.api_v1_prefix)
