from fastapi import APIRouter, HTTPException
from app.models.request_models import AnomalyRequest
from app.models.response_models import AnomalyResponse
from app.services.anomaly_service import detect_anomalies

router = APIRouter()


@router.post("/anomalies", response_model=AnomalyResponse)
async def anomalies_endpoint(request: AnomalyRequest):
    try:
        result = detect_anomalies(request.file_path)
        return AnomalyResponse(**result)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"File not found: {request.file_path}")
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
