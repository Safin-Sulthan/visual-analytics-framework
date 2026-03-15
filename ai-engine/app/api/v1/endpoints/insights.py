from fastapi import APIRouter, HTTPException
from app.models.request_models import InsightsRequest
from app.models.response_models import InsightsResponse, Insight
from app.services.insight_service import generate_insights, rank_insights

router = APIRouter()


@router.post("/insights", response_model=InsightsResponse)
async def insights_endpoint(request: InsightsRequest):
    try:
        raw = generate_insights(request.eda_result)
        ranked = rank_insights(raw)
        insights = [Insight(**i) for i in ranked]
        return InsightsResponse(insights=insights, total=len(insights))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
