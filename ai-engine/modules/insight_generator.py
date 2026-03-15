import logging
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


class InsightGenerator:
    """Generate ranked natural-language insights from analytics results."""

    def generate(
        self,
        eda_results: dict,
        anomaly_results: dict,
        cluster_results: dict,
        prediction_results: dict,
        df: pd.DataFrame,
    ) -> list[dict]:
        insights: list[dict] = []

        try:
            insights.extend(self._missing_value_insights(eda_results))
            insights.extend(self._correlation_insights(eda_results))
            insights.extend(self._anomaly_insights(anomaly_results))
            insights.extend(self._cluster_insights(cluster_results))
            insights.extend(self._trend_insights(eda_results, df))
            insights.extend(self._top_column_insights(eda_results))
        except Exception as exc:
            logger.error("Insight generation failed: %s", exc, exc_info=True)

        for ins in insights:
            ins["score"] = round(
                0.5 * ins.get("statistical_significance", 0)
                + 0.3 * ins.get("business_impact", 0)
                + 0.2 * ins.get("anomaly_severity", 0),
                4,
            )

        insights.sort(key=lambda x: x["score"], reverse=True)
        return insights[:10]

    # ------------------------------------------------------------------
    # Insight builders
    # ------------------------------------------------------------------

    def _missing_value_insights(self, eda: dict) -> list[dict]:
        insights = []
        mv = eda.get("missing_values", {})
        for col, info in mv.items():
            pct = info.get("percentage", 0)
            if pct < 5:
                continue
            severity = min(pct / 100, 1.0)
            insights.append(
                self._make_insight(
                    insight_type="eda",
                    title=f"High missing values in '{col}'",
                    description=f"Column '{col}' has {info['count']} missing values ({pct}% of data). Consider imputation or removal.",
                    statistical_significance=round(severity, 4),
                    business_impact=round(severity * 0.8, 4),
                    anomaly_severity=0.0,
                    chart_config={
                        "type": "bar",
                        "title": f"Missing Values – {col}",
                        "xKey": "category",
                        "yKey": "value",
                    },
                    data=[
                        {"category": "Present", "value": info["count"]},
                        {"category": "Missing", "value": info["count"]},
                    ],
                )
            )
        return insights

    def _correlation_insights(self, eda: dict) -> list[dict]:
        insights = []
        corr = eda.get("correlation_matrix", {})
        seen: set[frozenset] = set()
        for col_a, row in corr.items():
            for col_b, val in row.items():
                if col_a == col_b or val is None:
                    continue
                pair = frozenset([col_a, col_b])
                if pair in seen:
                    continue
                seen.add(pair)
                abs_val = abs(val)
                if abs_val < 0.7:
                    continue
                direction = "positive" if val > 0 else "negative"
                insights.append(
                    self._make_insight(
                        insight_type="correlation",
                        title=f"Strong {direction} correlation: '{col_a}' & '{col_b}'",
                        description=(
                            f"A {direction} correlation of {val:.3f} was detected between "
                            f"'{col_a}' and '{col_b}'. This relationship may be analytically meaningful."
                        ),
                        statistical_significance=round(abs_val, 4),
                        business_impact=round(abs_val * 0.9, 4),
                        anomaly_severity=0.0,
                        chart_config={
                            "type": "scatter",
                            "title": f"Correlation: {col_a} vs {col_b}",
                            "xKey": col_a,
                            "yKey": col_b,
                        },
                        data=[],
                    )
                )
        return insights

    def _anomaly_insights(self, anomaly: dict) -> list[dict]:
        count = anomaly.get("anomaly_count", 0)
        pct = anomaly.get("anomaly_percentage", 0.0)
        if count == 0:
            return []
        severity = min(pct / 20, 1.0)
        return [
            self._make_insight(
                insight_type="anomaly",
                title=f"{count} anomalies detected ({pct}% of data)",
                description=(
                    f"Isolation Forest identified {count} anomalous records representing "
                    f"{pct}% of the dataset. Review these records for data quality issues."
                ),
                statistical_significance=round(severity, 4),
                business_impact=round(severity * 0.85, 4),
                anomaly_severity=round(severity, 4),
                chart_config={
                    "type": "scatter",
                    "title": "Anomaly Distribution",
                    "xKey": "index",
                    "yKey": "score",
                },
                data=[
                    {"index": idx, "score": score, "anomaly": True}
                    for idx, score in zip(
                        anomaly.get("anomaly_indices", []),
                        [
                            anomaly["anomaly_scores"][i]
                            for i in anomaly.get("anomaly_indices", [])
                            if i < len(anomaly.get("anomaly_scores", []))
                        ],
                    )
                ][:50],
            )
        ]

    def _cluster_insights(self, cluster: dict) -> list[dict]:
        n = cluster.get("n_clusters", 0)
        if n < 2:
            return []
        sil = cluster.get("silhouette_score")
        sil_desc = f" (silhouette score: {sil:.3f})" if sil is not None else ""
        quality = sil if sil is not None else 0.5
        sizes = cluster.get("sizes", {})
        size_desc = ", ".join(f"Cluster {k}: {v}" for k, v in sizes.items())
        return [
            self._make_insight(
                insight_type="cluster",
                title=f"Data clusters into {n} distinct groups",
                description=(
                    f"KMeans clustering found {n} distinct groups{sil_desc}. "
                    f"Cluster distribution – {size_desc}."
                ),
                statistical_significance=round(max(quality, 0), 4),
                business_impact=round(max(quality * 0.8, 0), 4),
                anomaly_severity=0.0,
                chart_config={
                    "type": "bar",
                    "title": "Cluster Size Distribution",
                    "xKey": "cluster",
                    "yKey": "count",
                },
                data=[{"cluster": f"Cluster {k}", "count": v} for k, v in sizes.items()],
            )
        ]

    def _trend_insights(self, eda: dict, df: pd.DataFrame) -> list[dict]:
        insights = []
        stats = eda.get("numeric_stats", {})
        for col, info in stats.items():
            series = df[col].dropna()
            if len(series) < 10:
                continue
            try:
                half = len(series) // 2
                first_half_mean = float(series.iloc[:half].mean())
                second_half_mean = float(series.iloc[half:].mean())
                if first_half_mean == 0:
                    continue
                change_pct = (second_half_mean - first_half_mean) / abs(first_half_mean) * 100
                if abs(change_pct) < 10:
                    continue
                direction = "upward" if change_pct > 0 else "downward"
                significance = min(abs(change_pct) / 100, 1.0)
                insights.append(
                    self._make_insight(
                        insight_type="trend",
                        title=f"Column '{col}' shows {direction} trend",
                        description=(
                            f"'{col}' shows a {direction} trend with a {abs(change_pct):.1f}% "
                            f"change between the first and second halves of the dataset."
                        ),
                        statistical_significance=round(significance, 4),
                        business_impact=round(significance * 0.75, 4),
                        anomaly_severity=0.0,
                        chart_config={
                            "type": "line",
                            "title": f"Trend – {col}",
                            "xKey": "index",
                            "yKey": col,
                        },
                        data=[
                            {"index": i, col: round(float(v), 6)}
                            for i, v in enumerate(series.tolist()[:200])
                        ],
                    )
                )
            except Exception:
                continue
        return insights

    def _top_column_insights(self, eda: dict) -> list[dict]:
        insights = []
        stats = eda.get("numeric_stats", {})
        if not stats:
            return []
        top_mean_col = max(stats, key=lambda c: stats[c].get("mean") or 0)
        top_mean = stats[top_mean_col].get("mean", 0)
        insights.append(
            self._make_insight(
                insight_type="eda",
                title=f"'{top_mean_col}' has the highest mean value",
                description=(
                    f"Column '{top_mean_col}' has the highest mean of {top_mean:.4f} "
                    "across all numeric columns."
                ),
                statistical_significance=0.6,
                business_impact=0.5,
                anomaly_severity=0.0,
                chart_config={
                    "type": "bar",
                    "title": "Column Means",
                    "xKey": "column",
                    "yKey": "mean",
                },
                data=[
                    {"column": c, "mean": round(info.get("mean") or 0, 6)}
                    for c, info in stats.items()
                ],
            )
        )
        return insights

    # ------------------------------------------------------------------
    # Factory
    # ------------------------------------------------------------------

    @staticmethod
    def _make_insight(
        *,
        insight_type: str,
        title: str,
        description: str,
        statistical_significance: float,
        business_impact: float,
        anomaly_severity: float,
        chart_config: dict,
        data: list,
    ) -> dict:
        return {
            "type": insight_type,
            "title": title,
            "description": description,
            "score": 0.0,  # computed later
            "statistical_significance": statistical_significance,
            "business_impact": business_impact,
            "anomaly_severity": anomaly_severity,
            "chart_config": chart_config,
            "data": data,
        }
