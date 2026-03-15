from fastapi import APIRouter, HTTPException
from app.models.request_models import EDARequest
from app.models.response_models import EDAResponse
from app.services.eda_service import run_eda

router = APIRouter()


@router.post("/eda", response_model=EDAResponse)
async def eda_endpoint(request: EDARequest):
    try:
        result = run_eda(request.file_path, request.dataset_id)
        return EDAResponse(**result)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"File not found: {request.file_path}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
