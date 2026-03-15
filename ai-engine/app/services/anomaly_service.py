import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from scipy import stats
from typing import Any, Dict, List


def detect_anomalies(file_path: str) -> dict:
    df = pd.read_csv(file_path)
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()

    if not numeric_cols:
        raise ValueError("No numeric columns found for anomaly detection.")

    X = df[numeric_cols].fillna(df[numeric_cols].median())

    iso = IsolationForest(contamination=0.05, random_state=42)
    labels = iso.fit_predict(X)
    scores = iso.decision_function(X)

    anomaly_mask = labels == -1
    anomaly_indices = [int(i) for i in np.where(anomaly_mask)[0]]
    severity_scores = [round(float(-s), 4) for s in scores[anomaly_mask]]

    anomaly_records = df.iloc[anomaly_indices].to_dict(orient="records")
    anomaly_records = [
        {k: (None if (isinstance(v, float) and np.isnan(v)) else v) for k, v in rec.items()}
        for rec in anomaly_records
    ]

    univariate_outliers: Dict[str, Any] = {}
    for col in numeric_cols:
        series = df[col].dropna()
        z_scores = np.abs(stats.zscore(series))
        outlier_indices = [int(i) for i in series.index[z_scores > 3]]
        univariate_outliers[col] = {
            "outlier_count": len(outlier_indices),
            "outlier_indices": outlier_indices[:50],
            "threshold_z": 3,
        }

    return {
        "total_anomalies": len(anomaly_indices),
        "anomaly_rate": round(float(len(anomaly_indices) / len(df)), 4),
        "anomaly_indices": anomaly_indices,
        "anomaly_records": anomaly_records,
        "severity_scores": severity_scores,
        "univariate_outliers": univariate_outliers,
    }
