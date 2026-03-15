import { useState, useCallback } from 'react';
import { analyticsService } from '../services/analytics.service';

export const useAnalytics = (datasetId) => {
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState([]);
  const [predictions, setPredictions] = useState(null);
  const [monitoring, setMonitoring] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async (id = datasetId) => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await analyticsService.getAnalytics(id);
      setAnalytics(data);
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [datasetId]);

  const fetchInsights = useCallback(async (id = datasetId) => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await analyticsService.getInsights(id);
      setInsights(data);
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [datasetId]);

  const fetchPredictions = useCallback(async (id = datasetId) => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await analyticsService.getPredictions(id);
      setPredictions(data);
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [datasetId]);

  const fetchMonitoring = useCallback(async (id = datasetId) => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await analyticsService.getMonitoring(id);
      setMonitoring(data);
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [datasetId]);

  const runNLQuery = useCallback(async (query, id = datasetId) => {
    if (!id) return;
    return analyticsService.runNLQuery(id, query);
  }, [datasetId]);

  return {
    analytics,
    insights,
    predictions,
    monitoring,
    loading,
    error,
    fetchAnalytics,
    fetchInsights,
    fetchPredictions,
    fetchMonitoring,
    runNLQuery,
  };
};
