from typing import Any, Dict, List


def generate_insights(eda_result: dict) -> List[dict]:
    insights = []

    # Missing data insights
    missing_pct = eda_result.get("missing_pct", {})
    for col, pct in missing_pct.items():
        if pct > 50:
            insights.append({
                "type": "missing_data",
                "title": f"High missing rate in '{col}'",
                "description": f"Column '{col}' has {pct:.1f}% missing values. Consider imputation or removal.",
                "score": min(1.0, pct / 100 + 0.3),
                "metadata": {"column": col, "missing_pct": pct},
            })
        elif pct > 20:
            insights.append({
                "type": "missing_data",
                "title": f"Moderate missing values in '{col}'",
                "description": f"Column '{col}' has {pct:.1f}% missing values. Imputation recommended.",
                "score": min(1.0, pct / 100 + 0.1),
                "metadata": {"column": col, "missing_pct": pct},
            })

    # Correlation insights
    corr_matrix = eda_result.get("correlation_matrix", {})
    seen_pairs = set()
    for col_a, row in corr_matrix.items():
        for col_b, val in row.items():
            if col_a == col_b:
                continue
            pair = tuple(sorted([col_a, col_b]))
            if pair in seen_pairs:
                continue
            seen_pairs.add(pair)
            abs_val = abs(val)
            if abs_val >= 0.9:
                insights.append({
                    "type": "correlation",
                    "title": f"Very high correlation: '{col_a}' & '{col_b}'",
                    "description": f"Pearson correlation of {val:.2f} between '{col_a}' and '{col_b}'. Possible multicollinearity.",
                    "score": 0.9,
                    "metadata": {"col_a": col_a, "col_b": col_b, "correlation": val},
                })
            elif abs_val >= 0.7:
                insights.append({
                    "type": "correlation",
                    "title": f"High correlation: '{col_a}' & '{col_b}'",
                    "description": f"Pearson correlation of {val:.2f} indicates a strong relationship.",
                    "score": 0.7,
                    "metadata": {"col_a": col_a, "col_b": col_b, "correlation": val},
                })

    # Skewness insights
    numeric_stats = eda_result.get("numeric_stats", {})
    for col, stats in numeric_stats.items():
        skew = stats.get("skewness")
        if skew is None:
            continue
        if abs(skew) > 2:
            insights.append({
                "type": "skewness",
                "title": f"High skewness in '{col}'",
                "description": f"Column '{col}' has skewness of {skew:.2f}. Log or Box-Cox transform may help.",
                "score": min(1.0, abs(skew) / 10 + 0.5),
                "metadata": {"column": col, "skewness": skew},
            })
        elif abs(skew) > 1:
            insights.append({
                "type": "skewness",
                "title": f"Moderate skewness in '{col}'",
                "description": f"Column '{col}' has skewness of {skew:.2f}.",
                "score": 0.4,
                "metadata": {"column": col, "skewness": skew},
            })

    # Outlier insights (IQR-based)
    for col, stats in numeric_stats.items():
        q25 = stats.get("q25")
        q75 = stats.get("q75")
        mn = stats.get("min")
        mx = stats.get("max")
        if None in (q25, q75, mn, mx):
            continue
        iqr = q75 - q25
        if iqr == 0:
            continue
        lower = q25 - 1.5 * iqr
        upper = q75 + 1.5 * iqr
        if mn < lower or mx > upper:
            insights.append({
                "type": "outliers",
                "title": f"Potential outliers in '{col}'",
                "description": f"Values outside IQR bounds [{lower:.2f}, {upper:.2f}] detected in '{col}'.",
                "score": 0.6,
                "metadata": {"column": col, "lower_bound": lower, "upper_bound": upper},
            })

    # Data quality: low variance
    for col, stats in numeric_stats.items():
        std = stats.get("std")
        mean = stats.get("mean")
        if std is None or mean is None or mean == 0:
            continue
        cv = abs(std / mean)
        if cv < 0.01:
            insights.append({
                "type": "data_quality",
                "title": f"Near-constant column '{col}'",
                "description": f"Column '{col}' has very low variance (CV={cv:.4f}). May not be informative.",
                "score": 0.5,
                "metadata": {"column": col, "cv": cv},
            })

    return insights


def rank_insights(insights: List[dict]) -> List[dict]:
    return sorted(insights, key=lambda x: x.get("score", 0), reverse=True)
