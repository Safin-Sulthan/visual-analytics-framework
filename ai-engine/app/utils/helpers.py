import pandas as pd
import numpy as np
from typing import Any, List


def safe_divide(a: float, b: float, default: float = 0.0) -> float:
    """Division that returns `default` when b is zero."""
    return a / b if b != 0 else default


def normalize_score(value: float, min_val: float, max_val: float) -> float:
    """Normalize a value to the [0, 1] range."""
    if max_val == min_val:
        return 0.0
    return max(0.0, min(1.0, (value - min_val) / (max_val - min_val)))


def df_to_dict(df: pd.DataFrame) -> List[dict]:
    """Convert a DataFrame to a list of JSON-serializable dicts."""
    # Replace NaN / Inf with None for JSON compatibility
    return df.replace([np.inf, -np.inf], np.nan).where(pd.notnull(df), None).to_dict(orient="records")


def generate_color_scale(n: int) -> List[str]:
    """Generate n visually distinct hex colors using the HSL color space."""
    colors = []
    for i in range(n):
        hue = int(360 * i / max(n, 1))
        colors.append(f"hsl({hue}, 70%, 55%)")
    return colors


def clamp(value: float, lo: float = 0.0, hi: float = 1.0) -> float:
    """Clamp a float to [lo, hi]."""
    return max(lo, min(hi, value))
