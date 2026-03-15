from fastapi import APIRouter, HTTPException
from app.models.request_models import TemporalRequest
from app.models.response_models import TemporalResponse
from app.services.temporal_service import run_temporal_analysis

router = APIRouter()


@router.post("/temporal", response_model=TemporalResponse)
async def temporal_endpoint(request: TemporalRequest):
    try:
        result = run_temporal_analysis(request.file_path, request.date_col)
        return TemporalResponse(**result)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"File not found: {request.file_path}")
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
