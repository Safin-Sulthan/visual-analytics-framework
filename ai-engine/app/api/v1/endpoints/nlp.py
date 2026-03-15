from fastapi import APIRouter, HTTPException
from app.models.request_models import NLPRequest
from app.models.response_models import NLPResponse
from app.services.nlp_service import answer_query

router = APIRouter()


@router.post("/nlp", response_model=NLPResponse)
async def nlp_endpoint(request: NLPRequest):
    try:
        result = answer_query(request.query, request.dataset_summary)
        return NLPResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
