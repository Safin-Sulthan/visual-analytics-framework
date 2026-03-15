from pydantic import BaseModel, Field
from typing import Optional, Any


class EDARequest(BaseModel):
    file_path: str = Field(..., description="Path to the CSV file")
    dataset_id: Optional[str] = Field(None, description="Optional dataset identifier")


class InsightsRequest(BaseModel):
    eda_result: dict = Field(..., description="EDA result from the EDA endpoint")


class TemporalRequest(BaseModel):
    file_path: str = Field(..., description="Path to the CSV file")
    date_col: Optional[str] = Field(None, description="Date column name; auto-detected if omitted")


class PredictionRequest(BaseModel):
    file_path: str = Field(..., description="Path to the CSV file")
    target_col: str = Field(..., description="Target column for prediction")


class AnomalyRequest(BaseModel):
    file_path: str = Field(..., description="Path to the CSV file")


class NLPRequest(BaseModel):
    query: str = Field(..., description="Natural language query")
    dataset_summary: dict = Field(..., description="Dataset summary/EDA result")


class ReportRequest(BaseModel):
    dataset_info: dict = Field(..., description="Basic dataset metadata")
    eda_result: dict = Field(..., description="EDA result")
    insights: list = Field(..., description="List of ranked insights")
    output_path: str = Field(..., description="Path to save the PDF report")
