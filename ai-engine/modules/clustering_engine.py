import logging
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger(__name__)


class ClusteringEngine:
    """KMeans clustering engine."""

    def cluster(self, df: pd.DataFrame) -> dict:
        empty = {
            "n_clusters": 0,
            "labels": [],
            "centers": [],
            "sizes": {},
            "silhouette_score": None,
            "feature_columns": [],
        }

        if df.empty:
            return empty

        numeric_df = df.select_dtypes(include=[np.number])
        if numeric_df.empty:
            logger.warning("No numeric columns available for clustering.")
            return empty

        try:
            clean = numeric_df.fillna(numeric_df.median()).dropna(axis=1)
            if clean.empty or len(clean) < 3:
                return empty

            n_clusters = min(5, max(2, len(clean) // 10 + 1), len(clean) - 1)

            scaler = StandardScaler()
            scaled = scaler.fit_transform(clean)

            kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
            labels = kmeans.fit_predict(scaled)

            sil_score: float | None = None
            if len(set(labels)) > 1:
                sil_score = round(float(silhouette_score(scaled, labels)), 6)

            # Unscale cluster centers back to original space
            centers_original = scaler.inverse_transform(kmeans.cluster_centers_)
            centers = [
                {col: round(float(v), 6) for col, v in zip(clean.columns, row)}
                for row in centers_original
            ]

            sizes = {
                str(cluster_id): int((labels == cluster_id).sum())
                for cluster_id in range(n_clusters)
            }

            return {
                "n_clusters": n_clusters,
                "labels": labels.tolist(),
                "centers": centers,
                "sizes": sizes,
                "silhouette_score": sil_score,
                "feature_columns": clean.columns.tolist(),
            }
        except Exception as exc:
            logger.error("Clustering failed: %s", exc, exc_info=True)
            return {**empty, "error": str(exc)}
