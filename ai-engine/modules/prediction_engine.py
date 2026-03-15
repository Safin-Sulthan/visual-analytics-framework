import logging
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import r2_score

logger = logging.getLogger(__name__)


class PredictionEngine:
    """Regression and time-series prediction engine."""

    # ------------------------------------------------------------------
    # Regression
    # ------------------------------------------------------------------

    def predict_regression(
        self, df: pd.DataFrame, target_col: str | None = None
    ) -> dict:
        empty = {
            "predictions": [],
            "r2_score": None,
            "coefficients": {},
            "feature_importance": {},
        }

        if df.empty:
            return empty

        numeric_df = df.select_dtypes(include=[np.number])
        if numeric_df.shape[1] < 2:
            return {**empty, "error": "Need at least 2 numeric columns for regression."}

        # Resolve target column
        if target_col and target_col in numeric_df.columns:
            target = target_col
        else:
            target = numeric_df.columns[-1]

        feature_cols = [c for c in numeric_df.columns if c != target]

        try:
            data = numeric_df[feature_cols + [target]].dropna()
            if len(data) < 5:
                return {**empty, "error": "Insufficient data for regression."}

            X = data[feature_cols].values
            y = data[target].values

            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )

            scaler = StandardScaler()
            X_train_s = scaler.fit_transform(X_train)
            X_test_s = scaler.transform(X_test)

            model = LinearRegression()
            model.fit(X_train_s, y_train)

            y_pred = model.predict(X_test_s)
            score = round(float(r2_score(y_test, y_pred)), 6)

            coefs = {col: round(float(c), 6) for col, c in zip(feature_cols, model.coef_)}
            abs_coefs = np.abs(model.coef_)
            importance = abs_coefs / (abs_coefs.sum() or 1.0)
            feat_importance = {
                col: round(float(v), 6) for col, v in zip(feature_cols, importance)
            }

            return {
                "predictions": [round(float(v), 6) for v in y_pred.tolist()],
                "actual": [round(float(v), 6) for v in y_test.tolist()],
                "r2_score": score,
                "coefficients": coefs,
                "feature_importance": feat_importance,
                "target_column": target,
                "feature_columns": feature_cols,
            }
        except Exception as exc:
            logger.error("Regression failed: %s", exc, exc_info=True)
            return {**empty, "error": str(exc)}

    # ------------------------------------------------------------------
    # Time-series
    # ------------------------------------------------------------------

    def predict_timeseries(
        self,
        df: pd.DataFrame,
        date_col: str | None = None,
        value_col: str | None = None,
    ) -> dict:
        empty = {"historical": [], "forecast": [], "trend": "unknown"}

        if df.empty:
            return empty

        try:
            from prophet import Prophet  # lazy import – optional dependency
        except ImportError:
            logger.warning("Prophet not installed; skipping time-series prediction.")
            return {**empty, "error": "Prophet not installed."}

        try:
            # Detect date column
            resolved_date = date_col
            if not resolved_date:
                for col in df.columns:
                    if pd.api.types.is_datetime64_any_dtype(df[col]):
                        resolved_date = col
                        break
                if not resolved_date:
                    for col in df.columns:
                        try:
                            pd.to_datetime(df[col], infer_datetime_format=True)
                            resolved_date = col
                            break
                        except Exception:
                            continue

            if not resolved_date:
                return {**empty, "error": "No date column found for time-series."}

            # Detect value column
            numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
            resolved_value = value_col
            if not resolved_value and numeric_cols:
                resolved_value = numeric_cols[0]

            if not resolved_value:
                return {**empty, "error": "No numeric column found for time-series."}

            ts = df[[resolved_date, resolved_value]].copy()
            ts[resolved_date] = pd.to_datetime(ts[resolved_date], infer_datetime_format=True)
            ts = ts.dropna().sort_values(resolved_date)

            if len(ts) < 2:
                return {**empty, "error": "Insufficient time-series data."}

            prophet_df = ts.rename(
                columns={resolved_date: "ds", resolved_value: "y"}
            )

            model = Prophet(daily_seasonality=False, weekly_seasonality=True, yearly_seasonality=True)
            model.fit(prophet_df)

            future = model.make_future_dataframe(periods=30)
            forecast = model.predict(future)

            historical = [
                {"ds": str(row["ds"].date()), "y": round(float(row["y"]), 6)}
                for _, row in prophet_df.iterrows()
            ]

            forecast_rows = forecast[forecast["ds"] > prophet_df["ds"].max()]
            forecast_list = [
                {
                    "ds": str(row["ds"].date()),
                    "yhat": round(float(row["yhat"]), 6),
                    "yhat_lower": round(float(row["yhat_lower"]), 6),
                    "yhat_upper": round(float(row["yhat_upper"]), 6),
                }
                for _, row in forecast_rows.iterrows()
            ]

            # Determine trend from overall slope
            trend_col = forecast["trend"]
            trend = "upward" if trend_col.iloc[-1] > trend_col.iloc[0] else "downward"

            return {
                "historical": historical,
                "forecast": forecast_list,
                "trend": trend,
                "date_column": resolved_date,
                "value_column": resolved_value,
            }
        except Exception as exc:
            logger.error("Time-series prediction failed: %s", exc, exc_info=True)
            return {**empty, "error": str(exc)}
