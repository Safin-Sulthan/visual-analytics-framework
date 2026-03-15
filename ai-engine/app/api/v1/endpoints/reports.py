from fastapi import APIRouter, HTTPException
from app.models.request_models import ReportRequest
from app.models.response_models import ReportResponse
from app.services.report_service import generate_pdf_report

router = APIRouter()


@router.post("/reports", response_model=ReportResponse)
async def reports_endpoint(request: ReportRequest):
    try:
        path = generate_pdf_report(
            request.dataset_info,
            request.eda_result,
            request.insights,
            request.output_path,
        )
        return ReportResponse(file_path=path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
