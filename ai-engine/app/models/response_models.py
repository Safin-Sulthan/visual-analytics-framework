from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional


class EDAResponse(BaseModel):
    dataset_id: Optional[str] = None
    shape: Dict[str, int]
    column_types: Dict[str, str]
    missing_values: Dict[str, int]
    missing_pct: Dict[str, float]
    numeric_stats: Dict[str, Any]
    categorical_stats: Dict[str, Any]
    correlation_matrix: Dict[str, Any]
    distributions: Dict[str, Any]


class Insight(BaseModel):
    type: str
    title: str
    description: str
    score: float = Field(..., ge=0.0, le=1.0)
    metadata: Optional[Dict[str, Any]] = None


class InsightsResponse(BaseModel):
    insights: List[Insight]
    total: int


class TemporalResponse(BaseModel):
    date_col: str
    aggregations: Dict[str, Any]
    trend: Dict[str, Any]
    moving_averages: Dict[str, Any]
    seasonality: Dict[str, Any]


class PredictionResponse(BaseModel):
    task_type: str
    target_col: str
    metrics: Dict[str, Any]
    feature_importances: Dict[str, float]
    sample_predictions: List[Any]


class AnomalyResponse(BaseModel):
    total_anomalies: int
    anomaly_rate: float
    anomaly_indices: List[int]
    anomaly_records: List[Dict[str, Any]]
    severity_scores: List[float]
    univariate_outliers: Dict[str, Any]


class NLPResponse(BaseModel):
    query: str
    answer: str
    chart_data: Optional[Dict[str, Any]] = None
    query_type: str


class ReportResponse(BaseModel):
    file_path: str
    message: str = "Report generated successfully"


class HealthResponse(BaseModel):
    status: str = "ok"
    version: str
