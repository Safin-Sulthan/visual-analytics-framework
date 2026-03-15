from fastapi import APIRouter, HTTPException
from app.models.schemas import PredictionRequest
from app.utils.data_processor import load_csv, preprocess_df, detect_date_columns
from app.core.ml_analytics import MLAnalytics

router = APIRouter()
ml = MLAnalytics()


@router.post("/forecast")
def forecast(request: PredictionRequest):
    """Prophet-based time series forecast."""
    try:
        df = load_csv(request.file_path) if hasattr(request, "file_path") else None
        if df is None:
            raise HTTPException(status_code=400, detail="file_path is required for forecast")

        df = preprocess_df(df)
        date_cols = detect_date_columns(df)
        if not date_cols:
            raise HTTPException(status_code=400, detail="No datetime columns found for forecasting")

        date_col  = date_cols[0]
        value_col = request.target_col or df.select_dtypes(include="number").columns[0]

        result = ml.run_time_series_forecast(
            df, date_col, value_col, periods=request.periods or 30
        )
        return {"dataset_id": request.dataset_id, "forecast": result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/regression")
def regression(request: PredictionRequest):
    """Linear regression predictions."""
    try:
        df = load_csv(request.file_path) if hasattr(request, "file_path") else None
        if df is None:
            raise HTTPException(status_code=400, detail="file_path is required")

        df = preprocess_df(df)
        if not request.target_col:
            raise HTTPException(status_code=400, detail="target_col is required for regression")

        result = ml.run_regression(df, request.target_col)
        return {"dataset_id": request.dataset_id, "regression": result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/anomaly")
def anomaly_detection(request: PredictionRequest):
    """Isolation Forest anomaly detection."""
    try:
        df = load_csv(request.file_path) if hasattr(request, "file_path") else None
        if df is None:
            raise HTTPException(status_code=400, detail="file_path is required")

        df = preprocess_df(df)
        result = ml.run_anomaly_detection(df)
        return {"dataset_id": request.dataset_id, "anomalies": result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
