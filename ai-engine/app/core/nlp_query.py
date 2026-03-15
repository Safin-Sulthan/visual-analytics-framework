import re
import pandas as pd


INTENT_PATTERNS = {
    "trend":       [r"\btrend\b", r"\bover time\b", r"\bchange\b", r"\bhistory\b"],
    "distribution":[r"\bdistribution\b", r"\bspread\b", r"\bhistogram\b"],
    "correlation": [r"\bcorrelation\b", r"\brelationship\b", r"\bvs\b"],
    "top":         [r"\btop\b", r"\bhighest\b", r"\bmost\b"],
    "average":     [r"\baverage\b", r"\bmean\b", r"\btypical\b"],
    "anomaly":     [r"\banomaly\b", r"\boutlier\b", r"\bunusual\b"],
}

CHART_MAP = {
    "trend":       {"chart_type": "line",    "description": "Line chart showing trend over time"},
    "distribution":{"chart_type": "histogram","description": "Histogram of value distribution"},
    "correlation": {"chart_type": "scatter",  "description": "Scatter plot showing correlation"},
    "top":         {"chart_type": "bar",      "description": "Bar chart of top values"},
    "average":     {"chart_type": "bar",      "description": "Bar chart of averages"},
    "anomaly":     {"chart_type": "scatter",  "description": "Scatter plot highlighting anomalies"},
}


class NLPQueryProcessor:
    """Process natural language queries and map them to visualizations."""

    def parse_query(self, query_text: str) -> dict:
        """Extract intent and entities from a query string."""
        text = query_text.lower().strip()
        intent = "general"
        for name, patterns in INTENT_PATTERNS.items():
            if any(re.search(p, text) for p in patterns):
                intent = name
                break

        # Naive entity extraction: capitalized words or quoted strings
        entities = re.findall(r"'([^']+)'|\"([^\"]+)\"", query_text)
        entities = [e[0] or e[1] for e in entities]

        return {"intent": intent, "entities": entities, "raw_query": query_text}

    def map_to_visualization(self, intent: str, entities: list) -> dict:
        """Return a chart type and config based on detected intent."""
        cfg = CHART_MAP.get(intent, {"chart_type": "bar", "description": "General bar chart"})
        return {**cfg, "intent": intent, "entities": entities}

    def execute_query(self, df: pd.DataFrame, parsed_query: dict) -> dict:
        """Execute a parsed query against a DataFrame."""
        intent = parsed_query.get("intent", "general")
        numeric = df.select_dtypes(include="number")
        if numeric.empty:
            return {"data": [], "summary": "No numeric columns found"}

        col = numeric.columns[0]
        if intent == "average":
            data = [{"column": c, "mean": round(float(numeric[c].mean()), 4)} for c in numeric.columns]
            return {"data": data, "summary": f"Mean values for all numeric columns"}

        if intent == "top":
            top = df.nlargest(10, col)
            return {"data": top.to_dict(orient="records"), "summary": f"Top 10 rows by {col}"}

        # Default: return summary stats
        return {
            "data":    numeric.describe().round(4).to_dict(),
            "summary": f"Summary statistics for {len(numeric.columns)} numeric columns",
        }

    def format_response(self, query_result: dict) -> dict:
        """Format query result for frontend consumption."""
        return {
            "data":    query_result.get("data", []),
            "summary": query_result.get("summary", ""),
        }
