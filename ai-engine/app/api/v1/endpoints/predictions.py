from fastapi import APIRouter, HTTPException
from app.models.request_models import PredictionRequest
from app.models.response_models import PredictionResponse
from app.services.prediction_service import run_predictions

router = APIRouter()


@router.post("/predictions", response_model=PredictionResponse)
async def predictions_endpoint(request: PredictionRequest):
    try:
        result = run_predictions(request.file_path, request.target_col)
        return PredictionResponse(**result)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"File not found: {request.file_path}")
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
