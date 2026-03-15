import re
from typing import Any, Dict, Optional


_STOP_WORDS = {"the", "a", "an", "is", "are", "was", "were", "in", "on", "of", "for", "to", "and"}


def _tokenize(text: str):
    return [t.lower() for t in re.findall(r"\w+", text) if t.lower() not in _STOP_WORDS]


def _find_column(tokens, available_cols):
    col_lower = {c.lower(): c for c in available_cols}
    for tok in tokens:
        if tok in col_lower:
            return col_lower[tok]
    # partial match
    for tok in tokens:
        for lc, orig in col_lower.items():
            if tok in lc or lc in tok:
                return orig
    return None


def answer_query(query: str, dataset_summary: dict) -> dict:
    tokens = _tokenize(query)
    q_lower = query.lower().strip()

    numeric_stats = dataset_summary.get("numeric_stats", {})
    categorical_stats = dataset_summary.get("categorical_stats", {})
    all_cols = list(numeric_stats.keys()) + list(categorical_stats.keys())
    shape = dataset_summary.get("shape", {})

    chart_data: Optional[Dict[str, Any]] = None
    answer = ""
    query_type = "unknown"

    # "how many rows" / "how many records"
    if re.search(r"how many (rows|records)", q_lower):
        rows = shape.get("rows", "unknown")
        answer = f"The dataset contains {rows} rows."
        query_type = "count"

    # "how many columns"
    elif re.search(r"how many columns", q_lower):
        cols = shape.get("cols", "unknown")
        answer = f"The dataset has {cols} columns."
        query_type = "count"

    # "what is average/mean X"
    elif re.search(r"(average|mean|avg)\s+\w+", q_lower):
        col = _find_column(tokens, list(numeric_stats.keys()))
        if col and col in numeric_stats:
            val = numeric_stats[col].get("mean")
            answer = f"The average of '{col}' is {val}."
            query_type = "aggregation"
        else:
            answer = "Could not identify a numeric column for average calculation."
            query_type = "aggregation"

    # "what is max/maximum X"
    elif re.search(r"(max|maximum|highest|largest)\s+\w+", q_lower):
        col = _find_column(tokens, list(numeric_stats.keys()))
        if col and col in numeric_stats:
            val = numeric_stats[col].get("max")
            answer = f"The maximum value of '{col}' is {val}."
            query_type = "aggregation"
        else:
            answer = "Could not identify a numeric column for max calculation."
            query_type = "aggregation"

    # "what is min/minimum X"
    elif re.search(r"(min|minimum|lowest|smallest)\s+\w+", q_lower):
        col = _find_column(tokens, list(numeric_stats.keys()))
        if col and col in numeric_stats:
            val = numeric_stats[col].get("min")
            answer = f"The minimum value of '{col}' is {val}."
            query_type = "aggregation"
        else:
            answer = "Could not identify a numeric column for min calculation."
            query_type = "aggregation"

    # "show top N X by Y" or "top N"
    elif re.search(r"top\s+\d+", q_lower):
        n_match = re.search(r"top\s+(\d+)", q_lower)
        n = int(n_match.group(1)) if n_match else 5
        col = _find_column(tokens, list(categorical_stats.keys()))
        if col and col in categorical_stats:
            top_vals = list(categorical_stats[col]["top_values"].items())[:n]
            answer = f"Top {n} values in '{col}': " + ", ".join(f"{k} ({v})" for k, v in top_vals)
            chart_data = {
                "type": "bar",
                "labels": [item[0] for item in top_vals],
                "values": [item[1] for item in top_vals],
                "title": f"Top {n} values in '{col}'",
            }
            query_type = "top_n"
        else:
            answer = f"Could not identify a categorical column for top-{n} query."
            query_type = "top_n"

    # "how many records have X > Y"
    elif re.search(r"how many.+(>|<|>=|<=|=|equals)\s*\d+", q_lower):
        num_match = re.search(r"(>|<|>=|<=|=|equals)\s*(\d+\.?\d*)", q_lower)
        col = _find_column(tokens, all_cols)
        if num_match and col:
            op = num_match.group(1)
            val = float(num_match.group(2))
            op_map = {">": "greater than", "<": "less than", ">=": "at least", "<=": "at most", "=": "equal to", "equals": "equal to"}
            answer = f"Filtering '{col}' {op_map.get(op, op)} {val}: result depends on actual data. Use EDA for detailed stats."
            query_type = "filter"
        else:
            answer = "Could not parse filter condition."
            query_type = "filter"

    # "list columns" / "what columns"
    elif re.search(r"(list|show|what).+(columns|fields|variables)", q_lower):
        answer = f"The dataset has {len(all_cols)} columns: {', '.join(all_cols)}."
        query_type = "schema"

    # "missing values"
    elif re.search(r"missing", q_lower):
        missing_pct = dataset_summary.get("missing_pct", {})
        if missing_pct:
            top_missing = sorted(missing_pct.items(), key=lambda x: x[1], reverse=True)[:5]
            answer = "Columns with most missing data: " + ", ".join(
                f"{c} ({p:.1f}%)" for c, p in top_missing if p > 0
            )
            if not any(p > 0 for _, p in top_missing):
                answer = "No missing values detected in the dataset."
        else:
            answer = "Missing value information not available."
        query_type = "data_quality"

    else:
        answer = (
            "I can answer queries like: 'what is average X', 'show top 5 X', "
            "'how many rows', 'what columns exist', 'missing values'."
        )
        query_type = "unknown"

    return {
        "query": query,
        "answer": answer,
        "chart_data": chart_data,
        "query_type": query_type,
    }
