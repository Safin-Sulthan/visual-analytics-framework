import pandas as pd
import numpy as np
from datetime import datetime


class TemporalMonitor:
    """Monitor datasets over time and detect temporal patterns."""

    def track_dataset_version(self, dataset_id: str, df: pd.DataFrame) -> dict:
        """Save a lightweight snapshot of dataset statistics."""
        return {
            "dataset_id": dataset_id,
            "timestamp":  datetime.utcnow().isoformat(),
            "row_count":  len(df),
            "col_count":  len(df.columns),
            "null_total": int(df.isna().sum().sum()),
        }

    def detect_trends(self, df: pd.DataFrame, date_col: str, value_col: str) -> dict:
        """Detect the overall trend direction and magnitude via linear regression slope."""
        try:
            ts = df[[date_col, value_col]].copy()
            ts[date_col] = pd.to_datetime(ts[date_col], errors="coerce")
            ts = ts.dropna().sort_values(date_col)
            x = np.arange(len(ts))
            y = ts[value_col].values.astype(float)
            slope = float(np.polyfit(x, y, 1)[0]) if len(x) > 1 else 0.0
            direction = "upward" if slope > 0.01 else ("downward" if slope < -0.01 else "stable")
            return {
                "direction": direction,
                "slope":     round(slope, 6),
                "data_points": len(ts),
            }
        except Exception as e:
            return {"error": str(e)}

    def detect_seasonal_patterns(self, df: pd.DataFrame, date_col: str, value_col: str) -> dict:
        """Detect basic seasonal patterns by grouping by month."""
        try:
            ts = df[[date_col, value_col]].copy()
            ts[date_col] = pd.to_datetime(ts[date_col], errors="coerce")
            ts = ts.dropna()
            ts["month"] = ts[date_col].dt.month
            monthly = ts.groupby("month")[value_col].mean()
            cv = float(monthly.std() / monthly.mean()) if monthly.mean() != 0 else 0
            return {
                "has_seasonality": cv > 0.1,
                "monthly_avg":     {str(k): round(float(v), 4) for k, v in monthly.items()},
                "cv":              round(cv, 4),
            }
        except Exception as e:
            return {"error": str(e)}

    def detect_anomalies_temporal(self, df: pd.DataFrame, date_col: str, value_col: str) -> list:
        """Detect time-based anomalies using rolling z-score."""
        try:
            ts = df[[date_col, value_col]].copy()
            ts[date_col] = pd.to_datetime(ts[date_col], errors="coerce")
            ts = ts.dropna().sort_values(date_col)
            window = max(7, len(ts) // 10)
            ts["rolling_mean"] = ts[value_col].rolling(window, min_periods=1).mean()
            ts["rolling_std"]  = ts[value_col].rolling(window, min_periods=1).std().fillna(1)
            ts["z_score"]      = abs((ts[value_col] - ts["rolling_mean"]) / ts["rolling_std"])
            alerts = ts[ts["z_score"] > 2.5]
            return [
                {
                    "date":        str(row[date_col]),
                    "value":       float(row[value_col]),
                    "z_score":     round(float(row["z_score"]), 4),
                    "severity":    "critical" if row["z_score"] > 4 else "high" if row["z_score"] > 3 else "medium",
                    "description": f"Anomalous value {row[value_col]:.2f} detected in {value_col}.",
                    "detectedAt":  datetime.utcnow().isoformat(),
                }
                for _, row in alerts.iterrows()
            ]
        except Exception as e:
            return []

    def analyze_growth(self, df: pd.DataFrame, date_col: str, value_col: str) -> dict:
        """Compute period-over-period growth rates."""
        try:
            ts = df[[date_col, value_col]].copy()
            ts[date_col] = pd.to_datetime(ts[date_col], errors="coerce")
            ts = ts.dropna().sort_values(date_col)
            if len(ts) < 2:
                return {"growth_rate": 0.0, "trend": "insufficient data"}
            first, last = float(ts[value_col].iloc[0]), float(ts[value_col].iloc[-1])
            growth = ((last - first) / abs(first)) * 100 if first != 0 else 0
            return {
                "growth_rate":  round(growth, 2),
                "trend":        "growing" if growth > 0 else "declining",
                "start_value":  round(first, 4),
                "end_value":    round(last, 4),
            }
        except Exception as e:
            return {"error": str(e)}
