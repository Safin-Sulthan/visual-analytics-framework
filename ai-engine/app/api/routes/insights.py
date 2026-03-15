from fastapi import APIRouter, HTTPException
from app.models.schemas import NLQueryRequest, DatasetAnalysisRequest
from app.utils.data_processor import load_csv, preprocess_df
from app.core.insight_generator import InsightGenerator
from app.core.nlp_query import NLPQueryProcessor

router = APIRouter()
generator = InsightGenerator()
nlp       = NLPQueryProcessor()


@router.post("/generate")
def generate_insights(request: DatasetAnalysisRequest):
    """Generate AI insights from analysis results."""
    try:
        df = load_csv(request.file_path)
        df = preprocess_df(df)
        insights = generator.generate_insights(df, {}, {})
        ranked   = generator.rank_insights(insights)
        return {
            "dataset_id": request.dataset_id,
            "insights":   ranked,
            "top5":       ranked[:5],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/rank")
def rank_insights(payload: dict):
    """Rank a list of insight dictionaries by composite score."""
    try:
        insights = payload.get("insights", [])
        ranked   = sorted(insights, key=lambda x: x.get("score", 0), reverse=True)
        for i, item in enumerate(ranked):
            item["rank"] = i + 1
        return {"insights": ranked, "top5": ranked[:5]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/nlquery")
def nl_query(request: NLQueryRequest):
    """Process a natural language query against a dataset."""
    try:
        df = load_csv(request.file_path) if hasattr(request, "file_path") and request.file_path else None
        parsed   = nlp.parse_query(request.query)
        viz_cfg  = nlp.map_to_visualization(parsed.get("intent"), parsed.get("entities", []))
        if df is not None:
            result = nlp.execute_query(df, parsed)
            response = nlp.format_response(result)
        else:
            response = {"data": [], "summary": "No data available"}
        return {
            "dataset_id":     request.dataset_id,
            "query":          request.query,
            "interpretation": parsed,
            "chart_type":     viz_cfg.get("chart_type"),
            "chart_config":   viz_cfg,
            "data":           response.get("data", []),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
