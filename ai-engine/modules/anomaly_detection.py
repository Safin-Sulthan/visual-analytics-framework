import logging
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

logger = logging.getLogger(__name__)


class AnomalyDetector:
    """Anomaly detection using Isolation Forest."""

    def detect(self, df: pd.DataFrame) -> dict:
        empty = {
            "anomaly_indices": [],
            "anomaly_count": 0,
            "anomaly_percentage": 0.0,
            "anomaly_scores": [],
            "feature_importance": {},
        }

        if df.empty:
            return empty

        numeric_df = df.select_dtypes(include=[np.number])
        if numeric_df.empty:
            logger.warning("No numeric columns found for anomaly detection.")
            return empty

        try:
            clean = numeric_df.fillna(numeric_df.median())
            if len(clean) < 2:
                return empty

            model = IsolationForest(
                contamination=0.1,
                random_state=42,
                n_estimators=100,
            )
            preds = model.fit_predict(clean)
            scores = model.decision_function(clean)

            anomaly_mask = preds == -1
            anomaly_indices = [int(i) for i in np.where(anomaly_mask)[0]]
            anomaly_count = int(anomaly_mask.sum())
            anomaly_percentage = round(anomaly_count / len(df) * 100, 2)

            # Feature importance: mean absolute deviation contribution per column
            feature_importance: dict[str, float] = {}
            for col in clean.columns:
                normal_mean = float(clean.loc[~anomaly_mask, col].mean())
                anomaly_mean = float(clean.loc[anomaly_mask, col].mean()) if anomaly_count > 0 else normal_mean
                col_std = float(clean[col].std()) or 1.0
                feature_importance[col] = round(abs(anomaly_mean - normal_mean) / col_std, 4)

            return {
                "anomaly_indices": anomaly_indices,
                "anomaly_count": anomaly_count,
                "anomaly_percentage": anomaly_percentage,
                "anomaly_scores": [round(float(s), 6) for s in scores.tolist()],
                "feature_importance": feature_importance,
            }
        except Exception as exc:
            logger.error("Anomaly detection failed: %s", exc, exc_info=True)
            return {**empty, "error": str(exc)}
