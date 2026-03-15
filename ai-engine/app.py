import logging
import os
from contextlib import asynccontextmanager

import pandas as pd
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from modules import (
    AnomalyDetector,
    ClusteringEngine,
    EDAEngine,
    InsightGenerator,
    NLPQueryEngine,
    PredictionEngine,
)
from utils.column_analyzer import detect_column_types
from utils.data_loader import load_csv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s – %(message)s",
)
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Shared module instances (initialised once at startup)
# ---------------------------------------------------------------------------

_eda = EDAEngine()
_anomaly = AnomalyDetector()
_cluster = ClusteringEngine()
_prediction = PredictionEngine()
_insight = InsightGenerator()
_nlp = NLPQueryEngine()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("AI Engine starting up.")
    yield
    logger.info("AI Engine shutting down.")


app = FastAPI(
    title="Visual Analytics AI Engine",
    version="1.0.0",
    description="AI-powered analytics engine for the Visual Analytics Framework.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------


class AnalyzeRequest(BaseModel):
    file_path: str
    dataset_id: str | None = None
    target_col: str | None = None
    date_col: str | None = None
    value_col: str | None = None


class NLQueryRequest(BaseModel):
    query: str
    file_path: str
    dataset_id: str | None = None


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@app.get("/health")
async def health():
    return {"status": "ok", "service": "ai-engine"}


@app.post("/analyze")
async def analyze(request: AnalyzeRequest):
    """Run the full analytics pipeline on a CSV dataset."""
    df = load_csv(request.file_path)

    if df.empty:
        raise HTTPException(
            status_code=422,
            detail=f"Could not load data from '{request.file_path}'. "
                   "Check that the file exists and is a valid CSV.",
        )

    logger.info(
        "Analyzing dataset_id=%s  shape=%s",
        request.dataset_id,
        df.shape,
    )

    try:
        column_types = detect_column_types(df)
        eda_results = _eda.analyze(df)
        anomaly_results = _anomaly.detect(df)
        cluster_results = _cluster.cluster(df)

        regression_results = _prediction.predict_regression(df, target_col=request.target_col)
        timeseries_results = _prediction.predict_timeseries(
            df, date_col=request.date_col, value_col=request.value_col
        )

        prediction_results = {
            "regression": regression_results,
            "timeseries": timeseries_results,
        }

        insights = _insight.generate(
            eda_results,
            anomaly_results,
            cluster_results,
            prediction_results,
            df,
        )

        return {
            "dataset_id": request.dataset_id,
            "row_count": len(df),
            "column_count": len(df.columns),
            "column_types": column_types,
            "eda": eda_results,
            "anomaly_detection": anomaly_results,
            "clustering": cluster_results,
            "prediction": prediction_results,
            "insights": insights,
        }
    except Exception as exc:
        logger.error("Analysis pipeline error: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/nl-query")
async def nl_query(request: NLQueryRequest):
    """Answer a natural-language query against a dataset."""
    df = load_csv(request.file_path)

    if df.empty:
        raise HTTPException(
            status_code=422,
            detail=f"Could not load data from '{request.file_path}'.",
        )

    logger.info("NL query='%s' dataset_id=%s", request.query, request.dataset_id)

    try:
        eda_results = _eda.analyze(df)
        result = _nlp.process(request.query, df, eda_results)
        return {"dataset_id": request.dataset_id, "query": request.query, **result}
    except Exception as exc:
        logger.error("NL query error: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc)) from exc


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("AI_ENGINE_PORT", "8000"))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=False)
