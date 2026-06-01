from fastapi import APIRouter

from app.api.endpoints import auth, books, health, users

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(books.router)
api_router.include_router(health.router)
api_router.include_router(users.router)
