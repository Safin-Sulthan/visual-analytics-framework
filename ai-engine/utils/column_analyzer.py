import pandas as pd


def detect_column_types(df: pd.DataFrame) -> dict[str, str]:
    """Return a mapping of column name -> detected type.

    Types: numeric, categorical, datetime, boolean.
    """
    result: dict[str, str] = {}

    for col in df.columns:
        series = df[col]
        dtype = series.dtype

        if pd.api.types.is_bool_dtype(dtype):
            result[col] = "boolean"
        elif pd.api.types.is_datetime64_any_dtype(dtype):
            result[col] = "datetime"
        elif pd.api.types.is_numeric_dtype(dtype):
            result[col] = "numeric"
        else:
            # Try to parse as datetime
            try:
                parsed = pd.to_datetime(series.dropna(), infer_datetime_format=True)
                if len(parsed) > 0:
                    result[col] = "datetime"
                    continue
            except Exception:
                pass
            # Boolean-like strings
            unique_lower = {str(v).strip().lower() for v in series.dropna().unique()}
            if unique_lower <= {"true", "false", "yes", "no", "1", "0"}:
                result[col] = "boolean"
            else:
                result[col] = "categorical"

    return result
