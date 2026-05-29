from fastapi import APIRouter, Depends, status

from app.schemas.health import HealthResponse
from app.services.health_service import HealthService, get_health_service

router = APIRouter(prefix="/health", tags=["Health"])


@router.get(
    "",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Check API health",
)
def health_check(
    health_service: HealthService = Depends(get_health_service),
) -> HealthResponse:
    return health_service.get_status()
