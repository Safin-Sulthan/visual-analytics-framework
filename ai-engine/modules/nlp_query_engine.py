import logging
import re
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

# Intent keyword map: (intent, chart_type)
_INTENT_PATTERNS = [
    (r"\btrend\b|\bover time\b|\btime series\b|\bhistory\b", "line", "trend"),
    (r"\bcompare\b|\bhighest\b|\blowest\b|\branking\b|\bbest\b|\bworst\b", "bar", "comparison"),
    (r"\bdistribution\b|\bspread\b|\bfrequency\b|\bhistogram\b", "histogram", "distribution"),
    (r"\bpredict\b|\bforecast\b|\bfuture\b|\bestimate\b", "line", "prediction"),
    (r"\bcorrelat\b|\brelation\b|\bassociat\b|\blink\b", "heatmap", "correlation"),
]


class NLPQueryEngine:
    """Simple keyword-based NLP query processor."""

    def process(
        self, query: str, df: pd.DataFrame, eda_results: dict
    ) -> dict:
        default = {
            "chart_type": "bar",
            "chart_config": {},
            "data": [],
            "insight": "Could not interpret the query.",
            "sql_equivalent": "",
        }

        if df.empty or not query.strip():
            return default

        try:
            intent, chart_type = self._detect_intent(query)
            columns = self._extract_columns(query, df)
            return self._execute(query, intent, chart_type, columns, df, eda_results)
        except Exception as exc:
            logger.error("NLP query processing failed: %s", exc, exc_info=True)
            return {**default, "insight": f"Query processing error: {exc}"}

    # ------------------------------------------------------------------
    # Intent + column detection
    # ------------------------------------------------------------------

    def _detect_intent(self, query: str) -> tuple[str, str]:
        lower = query.lower()
        for pattern, chart_type, intent in _INTENT_PATTERNS:
            if re.search(pattern, lower):
                return intent, chart_type
        return "comparison", "bar"

    def _extract_columns(self, query: str, df: pd.DataFrame) -> list[str]:
        lower = query.lower()
        matched = [col for col in df.columns if col.lower() in lower]
        if not matched:
            # Fuzzy: any query word matching a column word
            words = set(re.findall(r"\w+", lower))
            for col in df.columns:
                col_words = set(re.findall(r"\w+", col.lower()))
                if words & col_words:
                    matched.append(col)
        return matched

    # ------------------------------------------------------------------
    # Execution
    # ------------------------------------------------------------------

    def _execute(
        self,
        query: str,
        intent: str,
        chart_type: str,
        columns: list[str],
        df: pd.DataFrame,
        eda_results: dict,
    ) -> dict:
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        cat_cols = df.select_dtypes(include=["object", "category"]).columns.tolist()

        if intent == "trend":
            return self._trend_response(columns, numeric_cols, df)
        if intent == "comparison":
            return self._comparison_response(columns, numeric_cols, cat_cols, df)
        if intent == "distribution":
            return self._distribution_response(columns, numeric_cols, eda_results)
        if intent == "correlation":
            return self._correlation_response(columns, numeric_cols, df, eda_results)
        if intent == "prediction":
            return self._prediction_response(columns, numeric_cols, df)

        return self._comparison_response(columns, numeric_cols, cat_cols, df)

    # ------------------------------------------------------------------
    # Response builders
    # ------------------------------------------------------------------

    def _trend_response(self, columns: list, numeric_cols: list, df: pd.DataFrame) -> dict:
        target_cols = [c for c in columns if c in numeric_cols] or numeric_cols[:1]
        if not target_cols:
            return self._no_data("No numeric column found for trend analysis.")

        col = target_cols[0]
        data = [
            {"index": i, "value": round(float(v), 6)}
            for i, v in enumerate(df[col].dropna().tolist()[:500])
        ]
        return {
            "chart_type": "line",
            "chart_config": {
                "type": "line",
                "title": f"Trend – {col}",
                "xKey": "index",
                "yKey": "value",
                "dataKey": col,
            },
            "data": data,
            "insight": f"Showing trend for '{col}' over {len(data)} data points.",
            "sql_equivalent": f"SELECT ROW_NUMBER() OVER () AS index, {col} FROM dataset ORDER BY index",
        }

    def _comparison_response(
        self, columns: list, numeric_cols: list, cat_cols: list, df: pd.DataFrame
    ) -> dict:
        num_cols = [c for c in columns if c in numeric_cols] or numeric_cols[:3]
        if not num_cols:
            return self._no_data("No numeric columns found for comparison.")

        data = [
            {
                "column": col,
                "mean": round(float(df[col].mean()), 6),
                "max": round(float(df[col].max()), 6),
                "min": round(float(df[col].min()), 6),
            }
            for col in num_cols
            if df[col].notna().any()
        ]
        return {
            "chart_type": "bar",
            "chart_config": {
                "type": "bar",
                "title": "Column Comparison",
                "xKey": "column",
                "yKey": "mean",
            },
            "data": data,
            "insight": f"Comparing {len(num_cols)} numeric column(s): {', '.join(num_cols)}.",
            "sql_equivalent": (
                "SELECT " + ", ".join(f"AVG({c}) AS {c}_mean" for c in num_cols) + " FROM dataset"
            ),
        }

    def _distribution_response(
        self, columns: list, numeric_cols: list, eda_results: dict
    ) -> dict:
        target_cols = [c for c in columns if c in numeric_cols] or numeric_cols[:1]
        if not target_cols:
            return self._no_data("No numeric column found for distribution.")

        col = target_cols[0]
        dist = eda_results.get("distributions", {}).get(col, {})
        if not dist:
            return self._no_data(f"No distribution data for '{col}'.")

        data = [
            {"bin": label, "count": count}
            for label, count in zip(dist.get("labels", []), dist.get("counts", []))
        ]
        return {
            "chart_type": "histogram",
            "chart_config": {
                "type": "bar",
                "title": f"Distribution – {col}",
                "xKey": "bin",
                "yKey": "count",
            },
            "data": data,
            "insight": f"Distribution of '{col}' across {len(data)} bins.",
            "sql_equivalent": f"SELECT WIDTH_BUCKET({col}, MIN({col}), MAX({col}), 10) AS bin, COUNT(*) FROM dataset GROUP BY bin",
        }

    def _correlation_response(
        self,
        columns: list,
        numeric_cols: list,
        df: pd.DataFrame,
        eda_results: dict,
    ) -> dict:
        target_cols = ([c for c in columns if c in numeric_cols] or numeric_cols)[:10]
        if len(target_cols) < 2:
            return self._no_data("Need at least 2 numeric columns for correlation.")

        corr_matrix = eda_results.get("correlation_matrix", {})
        if not corr_matrix:
            try:
                corr_matrix_df = df[target_cols].corr()
                corr_matrix = corr_matrix_df.to_dict()
            except Exception:
                return self._no_data("Could not compute correlation matrix.")

        data = [
            {"x": col_a, "y": col_b, "value": round(float(v), 4)}
            for col_a, row in corr_matrix.items()
            for col_b, v in row.items()
            if col_a in target_cols and col_b in target_cols and v is not None
        ]
        return {
            "chart_type": "heatmap",
            "chart_config": {
                "type": "heatmap",
                "title": "Correlation Heatmap",
                "xKey": "x",
                "yKey": "y",
                "valueKey": "value",
            },
            "data": data,
            "insight": f"Correlation heatmap for {len(target_cols)} numeric columns.",
            "sql_equivalent": "-- Correlation requires statistical functions not available in standard SQL",
        }

    def _prediction_response(
        self, columns: list, numeric_cols: list, df: pd.DataFrame
    ) -> dict:
        target_cols = [c for c in columns if c in numeric_cols] or numeric_cols[:1]
        if not target_cols:
            return self._no_data("No numeric column found for prediction.")

        col = target_cols[0]
        series = df[col].dropna()
        if len(series) < 5:
            return self._no_data("Not enough data points for prediction.")

        # Simple linear extrapolation for a lightweight preview
        x = np.arange(len(series))
        y = series.values
        coeffs = np.polyfit(x, y, 1)
        future_x = np.arange(len(series), len(series) + 30)
        future_y = np.polyval(coeffs, future_x)

        data = [{"index": int(xi), "value": round(float(yi), 6), "type": "historical"} for xi, yi in zip(x, y)]
        data += [{"index": int(xi), "value": round(float(yi), 6), "type": "forecast"} for xi, yi in zip(future_x, future_y)]

        return {
            "chart_type": "line",
            "chart_config": {
                "type": "line",
                "title": f"Forecast – {col}",
                "xKey": "index",
                "yKey": "value",
            },
            "data": data,
            "insight": f"Linear extrapolation of '{col}' for the next 30 time steps.",
            "sql_equivalent": f"SELECT ROW_NUMBER() OVER () AS index, {col} FROM dataset ORDER BY index",
        }

    @staticmethod
    def _no_data(message: str) -> dict:
        return {
            "chart_type": "bar",
            "chart_config": {},
            "data": [],
            "insight": message,
            "sql_equivalent": "",
        }
