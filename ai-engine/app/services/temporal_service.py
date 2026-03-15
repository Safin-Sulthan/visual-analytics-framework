import pandas as pd
import numpy as np
from typing import Optional
from scipy import stats


def detect_temporal_column(df: pd.DataFrame) -> Optional[str]:
    for col in df.columns:
        if df[col].dtype == "object":
            sample = df[col].dropna().head(50)
            try:
                parsed = pd.to_datetime(sample, infer_datetime_format=True)
                if parsed.notna().sum() > len(sample) * 0.8:
                    return col
            except Exception:
                continue
        elif "datetime" in str(df[col].dtype):
            return col
    return None


def run_temporal_analysis(file_path: str, date_col: Optional[str] = None) -> dict:
    df = pd.read_csv(file_path)

    if date_col is None:
        date_col = detect_temporal_column(df)
    if date_col is None:
        raise ValueError("No temporal column detected. Please specify date_col.")

    df[date_col] = pd.to_datetime(df[date_col], infer_datetime_format=True, errors="coerce")
    df = df.dropna(subset=[date_col]).sort_values(date_col)

    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()

    aggregations = {}
    for freq, label in [("D", "daily"), ("W", "weekly"), ("ME", "monthly")]:
        agg = df.set_index(date_col)[numeric_cols].resample(freq).mean().reset_index()
        aggregations[label] = {
            "dates": agg[date_col].dt.strftime("%Y-%m-%d").tolist(),
            "values": {
                col: [round(float(v), 4) if not np.isnan(v) else None for v in agg[col]]
                for col in numeric_cols
            },
        }

    trend = {}
    for col in numeric_cols:
        series = df[col].dropna()
        if len(series) < 3:
            continue
        x = np.arange(len(series))
        slope, intercept, r_value, p_value, _ = stats.linregress(x, series.values)
        trend[col] = {
            "slope": round(float(slope), 6),
            "r_squared": round(float(r_value ** 2), 4),
            "p_value": round(float(p_value), 4),
            "direction": "increasing" if slope > 0 else "decreasing",
            "significant": bool(p_value < 0.05),
        }

    moving_averages = {}
    for col in numeric_cols:
        series = df[col].dropna()
        if len(series) < 7:
            continue
        ma7 = series.rolling(7).mean()
        ma30 = series.rolling(30).mean() if len(series) >= 30 else None
        moving_averages[col] = {
            "ma7": [round(float(v), 4) if not np.isnan(v) else None for v in ma7],
            "ma30": [round(float(v), 4) if not np.isnan(v) else None for v in ma30] if ma30 is not None else [],
        }

    seasonality = {}
    for col in numeric_cols:
        series = df.set_index(date_col)[col].dropna()
        if len(series) < 14:
            continue
        monthly_avg = series.resample("ME").mean()
        if len(monthly_avg) >= 12:
            std_monthly = float(monthly_avg.std())
            mean_monthly = float(monthly_avg.mean())
            seasonality[col] = {
                "monthly_variation": round(std_monthly / mean_monthly, 4) if mean_monthly != 0 else 0,
                "peak_month": int(monthly_avg.idxmax().month) if len(monthly_avg) > 0 else None,
                "trough_month": int(monthly_avg.idxmin().month) if len(monthly_avg) > 0 else None,
            }

    return {
        "date_col": date_col,
        "aggregations": aggregations,
        "trend": trend,
        "moving_averages": moving_averages,
        "seasonality": seasonality,
    }
