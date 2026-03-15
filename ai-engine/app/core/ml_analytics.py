import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.cluster import KMeans
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler


class MLAnalytics:
    """Machine Learning analytics module."""

    def _get_numeric_scaled(self, df: pd.DataFrame):
        numeric = df.select_dtypes(include="number").dropna(axis=1)
        if numeric.empty:
            return None, None
        scaler = StandardScaler()
        X = scaler.fit_transform(numeric)
        return X, numeric.columns.tolist()

    def run_anomaly_detection(self, df: pd.DataFrame, contamination: float = 0.05) -> dict:
        """Detect anomalies using Isolation Forest."""
        X, cols = self._get_numeric_scaled(df)
        if X is None:
            return {"points": [], "anomaly_count": 0}

        model = IsolationForest(contamination=contamination, random_state=42)
        labels = model.fit_predict(X)
        scores = model.decision_function(X)

        points = []
        for i in range(len(X)):
            points.append({
                "x":        round(float(X[i, 0]), 4) if X.shape[1] > 0 else 0,
                "y":        round(float(X[i, 1]), 4) if X.shape[1] > 1 else 0,
                "anomaly":  bool(labels[i] == -1),
                "score":    round(float(scores[i]), 4),
            })

        return {
            "points":        points,
            "anomaly_count": int((labels == -1).sum()),
            "total":         len(labels),
        }

    def run_clustering(self, df: pd.DataFrame, n_clusters: int = 3) -> dict:
        """Cluster data using KMeans."""
        X, cols = self._get_numeric_scaled(df)
        if X is None or X.shape[0] < n_clusters:
            return {"points": [], "n_clusters": 0}

        k = min(n_clusters, X.shape[0])
        model = KMeans(n_clusters=k, random_state=42, n_init=10)
        labels = model.fit_predict(X)

        points = []
        for i in range(len(X)):
            points.append({
                "x":       round(float(X[i, 0]), 4) if X.shape[1] > 0 else 0,
                "y":       round(float(X[i, 1]), 4) if X.shape[1] > 1 else 0,
                "cluster": int(labels[i]),
            })

        return {
            "points":    points,
            "n_clusters": k,
            "inertia":   round(float(model.inertia_), 4),
        }

    def run_regression(self, df: pd.DataFrame, target_col: str) -> dict:
        """Linear regression with train/test split."""
        if target_col not in df.columns:
            return {"error": f"Column '{target_col}' not found"}

        numeric = df.select_dtypes(include="number").dropna()
        if target_col not in numeric.columns:
            return {"error": f"Column '{target_col}' must be numeric"}

        feature_cols = [c for c in numeric.columns if c != target_col]
        if not feature_cols:
            return {"error": "No feature columns available"}

        X = numeric[feature_cols].values
        y = numeric[target_col].values

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        model = LinearRegression()
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)

        points = [{"actual": round(float(a), 4), "predicted": round(float(p), 4)}
                  for a, p in zip(y_test, y_pred)]

        return {
            "points": points,
            "metrics": {
                "mse":  round(float(mean_squared_error(y_test, y_pred)), 6),
                "rmse": round(float(mean_squared_error(y_test, y_pred) ** 0.5), 6),
                "r2":   round(float(r2_score(y_test, y_pred)), 6),
            },
        }

    def run_time_series_forecast(
        self, df: pd.DataFrame, date_col: str, value_col: str, periods: int = 30
    ) -> dict:
        """Prophet time series forecast."""
        try:
            from prophet import Prophet  # type: ignore
        except ImportError:
            return {"error": "prophet package not installed", "data": []}

        if date_col not in df.columns or value_col not in df.columns:
            return {"error": "date_col or value_col not found", "data": []}

        prophet_df = df[[date_col, value_col]].rename(columns={date_col: "ds", value_col: "y"})
        prophet_df["ds"] = pd.to_datetime(prophet_df["ds"], errors="coerce")
        prophet_df = prophet_df.dropna().sort_values("ds")

        model = Prophet(daily_seasonality=True)
        model.fit(prophet_df)

        future   = model.make_future_dataframe(periods=periods)
        forecast = model.predict(future)

        data = forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]].tail(periods).copy()
        data["ds"] = data["ds"].dt.strftime("%Y-%m-%d")

        return {
            "data":    data.to_dict(orient="records"),
            "periods": periods,
            "metrics": {
                "mae": round(float(
                    (prophet_df["y"].values - model.predict(prophet_df)[["yhat"]].values.flatten()).mean()
                ), 4),
            },
        }
