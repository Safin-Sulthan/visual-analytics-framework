import pandas as pd
from typing import Any


class InsightGenerator:
    """Generate, score, and rank analytical insights."""

    def generate_insights(self, df: pd.DataFrame, eda_results: dict, ml_results: dict) -> list:
        """Generate a list of insight dicts from EDA and ML results."""
        insights = []

        # Statistical insights
        numeric = df.select_dtypes(include="number")
        for col in numeric.columns:
            series = numeric[col].dropna()
            if series.empty:
                continue

            skew = float(series.skew())
            if abs(skew) > 1:
                direction = "right" if skew > 0 else "left"
                insights.append({
                    "text":     f"Column '{col}' shows strong {direction}-skewed distribution (skewness={skew:.2f}).",
                    "category": "distribution",
                    "scores":   {"statistical": min(abs(skew) / 3, 1.0), "businessImpact": 0.3, "anomalySeverity": 0.2},
                })

            std = float(series.std())
            mean = float(series.mean())
            cv = std / mean if mean != 0 else 0
            if cv > 0.5:
                insights.append({
                    "text":     f"Column '{col}' has high variability (CV={cv:.2f}), suggesting inconsistent values.",
                    "category": "statistical",
                    "scores":   {"statistical": min(cv / 2, 1.0), "businessImpact": 0.4, "anomalySeverity": 0.3},
                })

        # Correlation insights
        if eda_results.get("correlations"):
            corr = eda_results["correlations"]
            for col1, row in corr.items():
                for col2, val in row.items():
                    if col1 < col2 and abs(val) > 0.7:
                        label = "strong positive" if val > 0 else "strong negative"
                        insights.append({
                            "text":     f"'{col1}' and '{col2}' have a {label} correlation ({val:.2f}).",
                            "category": "correlation",
                            "scores":   {"statistical": abs(val), "businessImpact": 0.6, "anomalySeverity": 0.1},
                        })

        # Missing value insights
        total = len(df)
        for col in df.columns:
            pct = df[col].isna().sum() / total * 100
            if pct > 20:
                insights.append({
                    "text":     f"Column '{col}' has {pct:.1f}% missing values, which may affect analysis quality.",
                    "category": "statistical",
                    "scores":   {"statistical": pct / 100, "businessImpact": 0.5, "anomalySeverity": 0.4},
                })

        return [self._attach_score(i) for i in insights]

    def _attach_score(self, insight: dict) -> dict:
        """Compute and attach the composite score to an insight dict."""
        insight["score"] = self.score_insight(insight)
        return insight

    def score_insight(self, insight: dict) -> float:
        """Composite score: 0.5 * statistical + 0.3 * businessImpact + 0.2 * anomalySeverity."""
        s = insight.get("scores", {})
        return round(
            0.5 * s.get("statistical", 0.0) +
            0.3 * s.get("businessImpact", 0.0) +
            0.2 * s.get("anomalySeverity", 0.0),
            6,
        )

    def rank_insights(self, insights: list) -> list:
        """Sort insights by score descending and assign rank."""
        sorted_insights = sorted(insights, key=lambda x: x.get("score", 0), reverse=True)
        for i, item in enumerate(sorted_insights):
            item["rank"] = i + 1
        return sorted_insights

    def format_insight_text(self, insight_data: dict) -> str:
        """Generate a natural language insight text from raw insight data."""
        return insight_data.get("text", "No insight text available.")
