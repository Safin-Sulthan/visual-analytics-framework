import logging
import pandas as pd
import numpy as np
from typing import Any

logger = logging.getLogger(__name__)


class EDAEngine:
    """Exploratory Data Analysis engine."""

    def analyze(self, df: pd.DataFrame) -> dict:
        if df.empty:
            return {
                "numeric_stats": {},
                "missing_values": {},
                "correlation_matrix": {},
                "distributions": {},
                "categorical_stats": {},
            }

        try:
            numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
            categorical_cols = df.select_dtypes(
                include=["object", "category", "bool"]
            ).columns.tolist()

            return {
                "numeric_stats": self._numeric_stats(df, numeric_cols),
                "missing_values": self._missing_values(df),
                "correlation_matrix": self._correlation_matrix(df, numeric_cols),
                "distributions": self._distributions(df, numeric_cols),
                "categorical_stats": self._categorical_stats(df, categorical_cols),
            }
        except Exception as exc:
            logger.error("EDA analysis failed: %s", exc, exc_info=True)
            return {"error": str(exc)}

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _numeric_stats(self, df: pd.DataFrame, cols: list) -> dict:
        stats: dict[str, Any] = {}
        for col in cols:
            series = df[col].dropna()
            if series.empty:
                continue
            stats[col] = {
                "mean": self._safe_float(series.mean()),
                "median": self._safe_float(series.median()),
                "std": self._safe_float(series.std()),
                "min": self._safe_float(series.min()),
                "max": self._safe_float(series.max()),
                "count": int(series.count()),
                "q25": self._safe_float(series.quantile(0.25)),
                "q75": self._safe_float(series.quantile(0.75)),
            }
        return stats

    def _missing_values(self, df: pd.DataFrame) -> dict:
        total = len(df)
        result: dict[str, Any] = {}
        for col in df.columns:
            missing = int(df[col].isna().sum())
            result[col] = {
                "count": missing,
                "percentage": round(missing / total * 100, 2) if total > 0 else 0.0,
            }
        return result

    def _correlation_matrix(self, df: pd.DataFrame, cols: list) -> dict:
        cols = cols[:10]
        if len(cols) < 2:
            return {}
        try:
            corr = df[cols].corr()
            return {
                col: {
                    other: self._safe_float(corr.loc[col, other])
                    for other in cols
                }
                for col in cols
            }
        except Exception:
            return {}

    def _distributions(self, df: pd.DataFrame, cols: list) -> dict:
        distributions: dict[str, Any] = {}
        for col in cols:
            series = df[col].dropna()
            if series.empty:
                continue
            try:
                counts, bin_edges = np.histogram(series, bins=10)
                distributions[col] = {
                    "counts": counts.tolist(),
                    "bin_edges": [self._safe_float(v) for v in bin_edges.tolist()],
                    "labels": [
                        f"{self._safe_float(bin_edges[i]):.2f}–{self._safe_float(bin_edges[i+1]):.2f}"
                        for i in range(len(bin_edges) - 1)
                    ],
                }
            except Exception:
                continue
        return distributions

    def _categorical_stats(self, df: pd.DataFrame, cols: list) -> dict:
        stats: dict[str, Any] = {}
        for col in cols:
            try:
                vc = df[col].value_counts().head(10)
                stats[col] = {
                    "value_counts": {str(k): int(v) for k, v in vc.items()},
                    "unique_count": int(df[col].nunique()),
                    "top_value": str(vc.index[0]) if len(vc) > 0 else None,
                }
            except Exception:
                continue
        return stats

    @staticmethod
    def _safe_float(value: Any) -> float | None:
        try:
            v = float(value)
            return None if np.isnan(v) or np.isinf(v) else round(v, 6)
        except (TypeError, ValueError):
            return None
