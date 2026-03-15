from fastapi import APIRouter
from app.api.v1.endpoints import eda, insights, temporal, predictions, anomalies, nlp, reports
from app.models.response_models import HealthResponse
from app.core.config import settings

router = APIRouter()

router.include_router(eda.router, tags=["EDA"])
router.include_router(insights.router, tags=["Insights"])
router.include_router(temporal.router, tags=["Temporal"])
router.include_router(predictions.router, tags=["Predictions"])
router.include_router(anomalies.router, tags=["Anomalies"])
router.include_router(nlp.router, tags=["NLP"])
router.include_router(reports.router, tags=["Reports"])


@router.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    return HealthResponse(status="ok", version=settings.APP_VERSION)
