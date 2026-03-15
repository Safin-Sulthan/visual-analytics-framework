from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional


class DatasetAnalysisRequest(BaseModel):
    dataset_id: str
    file_path:  str


class EDAResult(BaseModel):
    statistics:   Dict[str, Any] = {}
    missing_values: Dict[str, Any] = {}
    correlations: Dict[str, Any] = {}
    distributions: Dict[str, Any] = {}
    outliers:     Dict[str, Any] = {}


class MLResult(BaseModel):
    anomalies:  Dict[str, Any] = {}
    clusters:   Dict[str, Any] = {}
    regression: Optional[Dict[str, Any]] = None
    forecast:   Optional[Dict[str, Any]] = None


class InsightScores(BaseModel):
    statistical:     float = 0.0
    businessImpact:  float = 0.0
    anomalySeverity: float = 0.0


class InsightItem(BaseModel):
    text:     str
    category: str
    score:    float = 0.0
    rank:     int   = 0
    scores:   Optional[InsightScores] = None


class InsightsResponse(BaseModel):
    dataset_id: str
    insights:   List[InsightItem] = []
    top5:       List[InsightItem] = []


class NLQueryRequest(BaseModel):
    dataset_id: str
    query:      str
    file_path:  Optional[str] = None


class NLQueryResponse(BaseModel):
    dataset_id:     str
    query:          str
    interpretation: Dict[str, Any] = {}
    chart_type:     Optional[str] = None
    chart_config:   Dict[str, Any] = {}
    data:           List[Any] = []


class PredictionRequest(BaseModel):
    dataset_id: str
    file_path:  Optional[str] = None
    target_col: Optional[str] = None
    periods:    Optional[int] = 30


class MonitoringAlert(BaseModel):
    dataset_id:  str
    alert_type:  str
    severity:    str  # low | medium | high | critical
    description: str
    detected_at: str
