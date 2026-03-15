from fastapi import APIRouter, HTTPException
from app.models.schemas import DatasetAnalysisRequest, EDAResult, MLResult
from app.utils.data_processor import load_csv, preprocess_df
from app.core.eda import EDAAnalyzer
from app.core.ml_analytics import MLAnalytics

router = APIRouter()
eda_analyzer = EDAAnalyzer()
ml_analytics  = MLAnalytics()


@router.post("/eda")
def perform_eda(request: DatasetAnalysisRequest):
    """Run exploratory data analysis on a CSV file."""
    try:
        df = load_csv(request.file_path)
        df = preprocess_df(df)
        return {
            "dataset_id":   request.dataset_id,
            "statistics":   eda_analyzer.compute_statistics(df),
            "missing":      eda_analyzer.detect_missing_values(df),
            "correlations": eda_analyzer.compute_correlations(df),
            "distributions":eda_analyzer.analyze_distribution(df),
            "outliers":     eda_analyzer.detect_outliers(df),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ml")
def perform_ml(request: DatasetAnalysisRequest):
    """Run ML analytics (clustering, anomaly detection) on a CSV file."""
    try:
        df = load_csv(request.file_path)
        df = preprocess_df(df)
        return {
            "dataset_id": request.dataset_id,
            "anomalies":  ml_analytics.run_anomaly_detection(df),
            "clusters":   ml_analytics.run_clustering(df),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/full")
def perform_full_analysis(request: DatasetAnalysisRequest):
    """Run the full analysis pipeline (EDA + ML)."""
    try:
        df = load_csv(request.file_path)
        df = preprocess_df(df)

        eda_result = {
            "statistics":    eda_analyzer.compute_statistics(df),
            "missing_values":eda_analyzer.detect_missing_values(df),
            "correlations":  eda_analyzer.compute_correlations(df),
            "distributions": eda_analyzer.analyze_distribution(df),
            "outliers":      eda_analyzer.detect_outliers(df),
        }
        ml_result = {
            "anomalies": ml_analytics.run_anomaly_detection(df),
            "clusters":  ml_analytics.run_clustering(df),
        }
        return {
            "dataset_id": request.dataset_id,
            "eda":        eda_result,
            "ml":         ml_result,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
