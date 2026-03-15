import pandas as pd
import numpy as np
from typing import Tuple, List


def load_csv(file_path: str) -> pd.DataFrame:
    """Load a CSV file into a DataFrame, trying multiple encodings."""
    for encoding in ("utf-8", "latin-1", "iso-8859-1"):
        try:
            return pd.read_csv(file_path, encoding=encoding)
        except UnicodeDecodeError:
            continue
    raise ValueError(f"Unable to decode CSV file: {file_path}")


def preprocess_df(df: pd.DataFrame) -> pd.DataFrame:
    """Clean and type-cast a DataFrame."""
    df = df.copy()
    # Strip whitespace from string columns
    for col in df.select_dtypes(include="object").columns:
        df[col] = df[col].str.strip()

    # Attempt to convert numeric-looking object columns
    for col in df.select_dtypes(include="object").columns:
        converted = pd.to_numeric(df[col], errors="coerce")
        if converted.notna().sum() / max(len(df), 1) > 0.8:
            df[col] = converted

    # Attempt to parse datetime-looking columns
    for col in df.select_dtypes(include="object").columns:
        try:
            df[col] = pd.to_datetime(df[col], infer_datetime_format=True, errors="raise")
        except Exception:
            pass

    return df


def detect_column_types(df: pd.DataFrame) -> dict:
    """Classify each column as numeric, categorical, datetime, or text."""
    result = {}
    for col in df.columns:
        dtype = df[col].dtype
        if pd.api.types.is_numeric_dtype(dtype):
            result[col] = "numeric"
        elif pd.api.types.is_datetime64_any_dtype(dtype):
            result[col] = "datetime"
        else:
            nunique = df[col].nunique()
            result[col] = "categorical" if nunique / max(len(df), 1) < 0.5 else "text"
    return result


def detect_date_columns(df: pd.DataFrame) -> List[str]:
    """Return a list of columns that are datetime type."""
    return [col for col in df.columns if pd.api.types.is_datetime64_any_dtype(df[col].dtype)]


def split_features_target(df: pd.DataFrame, target_col: str) -> Tuple[pd.DataFrame, pd.Series]:
    """Split a DataFrame into features (X) and target (y)."""
    if target_col not in df.columns:
        raise ValueError(f"Target column '{target_col}' not found")
    X = df.drop(columns=[target_col])
    y = df[target_col]
    return X, y
