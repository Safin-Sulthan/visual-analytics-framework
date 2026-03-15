import pandas as pd
import numpy as np
from scipy import stats


class EDAAnalyzer:
    """Exploratory Data Analysis module."""

    def compute_statistics(self, df: pd.DataFrame) -> dict:
        """Compute descriptive statistics for numeric columns."""
        numeric = df.select_dtypes(include="number")
        result = {}
        for col in numeric.columns:
            series = numeric[col].dropna()
            result[col] = {
                "mean":   float(series.mean()),
                "median": float(series.median()),
                "std":    float(series.std()),
                "min":    float(series.min()),
                "max":    float(series.max()),
                "q25":    float(series.quantile(0.25)),
                "q75":    float(series.quantile(0.75)),
                "count":  int(series.count()),
            }
        return result

    def detect_missing_values(self, df: pd.DataFrame) -> dict:
        """Return count and percentage of missing values per column."""
        total = len(df)
        result = {}
        for col in df.columns:
            count = int(df[col].isna().sum())
            result[col] = {
                "count":      count,
                "percentage": round(count / total * 100, 2) if total > 0 else 0.0,
            }
        return result

    def compute_correlations(self, df: pd.DataFrame) -> dict:
        """Compute the Pearson correlation matrix for numeric columns."""
        numeric = df.select_dtypes(include="number")
        if numeric.shape[1] < 2:
            return {}
        corr = numeric.corr().round(4)
        return corr.to_dict()

    def analyze_distribution(self, df: pd.DataFrame) -> dict:
        """Compute distribution stats (skewness, kurtosis, histogram bins) per numeric column."""
        numeric = df.select_dtypes(include="number")
        result = {}
        for col in numeric.columns:
            series = numeric[col].dropna()
            if series.empty:
                continue
            counts, bin_edges = np.histogram(series, bins=20)
            result[col] = {
                "skewness": float(series.skew()),
                "kurtosis": float(series.kurtosis()),
                "buckets": [
                    {"bin": f"{bin_edges[i]:.2f}–{bin_edges[i+1]:.2f}", "count": int(counts[i])}
                    for i in range(len(counts))
                ],
            }
        return result

    def detect_outliers(self, df: pd.DataFrame) -> dict:
        """Detect outliers using the IQR method per numeric column."""
        numeric = df.select_dtypes(include="number")
        result = {}
        for col in numeric.columns:
            series = numeric[col].dropna()
            q1, q3 = series.quantile(0.25), series.quantile(0.75)
            iqr = q3 - q1
            lower, upper = q1 - 1.5 * iqr, q3 + 1.5 * iqr
            outlier_mask = (series < lower) | (series > upper)
            result[col] = {
                "count":      int(outlier_mask.sum()),
                "lower_fence": round(float(lower), 4),
                "upper_fence": round(float(upper), 4),
                "indices":    series[outlier_mask].index.tolist()[:50],
            }
        return result
