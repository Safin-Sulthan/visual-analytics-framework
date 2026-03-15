import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import (
    r2_score, mean_squared_error,
    accuracy_score, f1_score, classification_report,
)
from sklearn.preprocessing import LabelEncoder
from typing import Any, Dict


def _is_classification(series: pd.Series) -> bool:
    if series.dtype == "object":
        return True
    n_unique = series.nunique()
    return n_unique <= 20 and n_unique / len(series) < 0.05


def run_predictions(file_path: str, target_col: str) -> dict:
    df = pd.read_csv(file_path)

    if target_col not in df.columns:
        raise ValueError(f"Target column '{target_col}' not found in dataset.")

    y = df[target_col].dropna()
    df = df.loc[y.index]

    # Encode categoricals in features
    X = df.drop(columns=[target_col])
    for col in X.select_dtypes(include=["object"]).columns:
        X[col] = LabelEncoder().fit_transform(X[col].astype(str))
    X = X.select_dtypes(include=[np.number]).fillna(X.select_dtypes(include=[np.number]).median())

    task_type = "classification" if _is_classification(y) else "regression"

    if task_type == "classification":
        le = LabelEncoder()
        y_enc = le.fit_transform(y.astype(str))
    else:
        y_enc = y.values.astype(float)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y_enc, test_size=0.2, random_state=42
    )

    metrics: Dict[str, Any] = {}
    feature_importances: Dict[str, float] = {}

    if task_type == "regression":
        lr = LinearRegression().fit(X_train, y_train)
        rf = RandomForestRegressor(n_estimators=100, random_state=42).fit(X_train, y_train)

        for name, model in [("linear_regression", lr), ("random_forest", rf)]:
            preds = model.predict(X_test)
            metrics[name] = {
                "r2": round(float(r2_score(y_test, preds)), 4),
                "rmse": round(float(np.sqrt(mean_squared_error(y_test, preds))), 4),
            }

        rf_preds = rf.predict(X_test)
        feature_importances = {
            col: round(float(imp), 4)
            for col, imp in sorted(
                zip(X.columns, rf.feature_importances_),
                key=lambda x: x[1],
                reverse=True,
            )
        }
        sample_predictions = [
            {"actual": float(a), "predicted": round(float(p), 4)}
            for a, p in list(zip(y_test[:20], rf_preds[:20]))
        ]
    else:
        lr = LogisticRegression(max_iter=1000, random_state=42).fit(X_train, y_train)
        rf = RandomForestClassifier(n_estimators=100, random_state=42).fit(X_train, y_train)

        for name, model in [("logistic_regression", lr), ("random_forest", rf)]:
            preds = model.predict(X_test)
            metrics[name] = {
                "accuracy": round(float(accuracy_score(y_test, preds)), 4),
                "f1_weighted": round(float(f1_score(y_test, preds, average="weighted", zero_division=0)), 4),
            }

        rf_preds = rf.predict(X_test)
        feature_importances = {
            col: round(float(imp), 4)
            for col, imp in sorted(
                zip(X.columns, rf.feature_importances_),
                key=lambda x: x[1],
                reverse=True,
            )
        }
        sample_predictions = [
            {"actual": str(a), "predicted": str(p)}
            for a, p in list(zip(y_test[:20], rf_preds[:20]))
        ]

    return {
        "task_type": task_type,
        "target_col": target_col,
        "metrics": metrics,
        "feature_importances": feature_importances,
        "sample_predictions": sample_predictions,
    }
