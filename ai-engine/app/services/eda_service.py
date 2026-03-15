import pandas as pd
import numpy as np
from typing import Optional


def run_eda(file_path: str, dataset_id: Optional[str] = None) -> dict:
    df = pd.read_csv(file_path)

    shape = {"rows": int(df.shape[0]), "cols": int(df.shape[1])}

    column_types = {col: str(dtype) for col, dtype in df.dtypes.items()}

    missing_values = {col: int(df[col].isna().sum()) for col in df.columns}
    missing_pct = {
        col: round(float(df[col].isna().sum() / len(df) * 100), 2)
        for col in df.columns
    }

    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = df.select_dtypes(include=["object", "category"]).columns.tolist()

    numeric_stats = {}
    for col in numeric_cols:
        s = df[col].dropna()
        numeric_stats[col] = {
            "mean": round(float(s.mean()), 4) if len(s) > 0 else None,
            "median": round(float(s.median()), 4) if len(s) > 0 else None,
            "std": round(float(s.std()), 4) if len(s) > 0 else None,
            "min": round(float(s.min()), 4) if len(s) > 0 else None,
            "max": round(float(s.max()), 4) if len(s) > 0 else None,
            "q25": round(float(s.quantile(0.25)), 4) if len(s) > 0 else None,
            "q75": round(float(s.quantile(0.75)), 4) if len(s) > 0 else None,
            "skewness": round(float(s.skew()), 4) if len(s) > 0 else None,
            "kurtosis": round(float(s.kurtosis()), 4) if len(s) > 0 else None,
            "count": int(s.count()),
        }

    categorical_stats = {}
    for col in categorical_cols:
        vc = df[col].value_counts().head(10)
        categorical_stats[col] = {
            "top_values": {str(k): int(v) for k, v in vc.items()},
            "unique_count": int(df[col].nunique()),
            "count": int(df[col].count()),
        }

    corr_matrix = {}
    if len(numeric_cols) > 1:
        corr = df[numeric_cols].corr()
        corr_matrix = {
            col: {c: round(float(v), 4) for c, v in row.items()}
            for col, row in corr.to_dict().items()
        }

    distributions = {}
    for col in numeric_cols:
        s = df[col].dropna()
        if len(s) > 0:
            counts, bin_edges = np.histogram(s, bins=min(30, len(s.unique())))
            distributions[col] = {
                "counts": counts.tolist(),
                "bin_edges": [round(float(e), 4) for e in bin_edges.tolist()],
            }

    return {
        "dataset_id": dataset_id,
        "shape": shape,
        "column_types": column_types,
        "missing_values": missing_values,
        "missing_pct": missing_pct,
        "numeric_stats": numeric_stats,
        "categorical_stats": categorical_stats,
        "correlation_matrix": corr_matrix,
        "distributions": distributions,
    }
