from app.core.config import get_settings
from app.schemas.health import HealthResponse


class HealthService:
    def get_status(self) -> HealthResponse:
        settings = get_settings()
        return HealthResponse(
            status="ok",
            service=settings.project_name,
            version=settings.version,
        )


def get_health_service() -> HealthService:
    return HealthService()
