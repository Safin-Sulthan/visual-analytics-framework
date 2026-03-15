import React, { createContext, useState, useCallback, useContext } from 'react';
import { datasetService } from '../services/dataset.service';
import { analyticsService } from '../services/analytics.service';

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [datasets, setDatasets] = useState([]);
  const [currentDataset, setCurrentDataset] = useState(null);
  const [insights, setInsights] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDatasets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await datasetService.getDatasets();
      setDatasets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectDataset = useCallback(async (dataset) => {
    setCurrentDataset(dataset);
    if (dataset) {
      try {
        const [analyticsData, insightsData] = await Promise.all([
          analyticsService.getAnalytics(dataset._id),
          analyticsService.getInsights(dataset._id),
        ]);
        setAnalytics(analyticsData);
        setInsights(insightsData);
      } catch (err) {
        setError(err.message);
      }
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = {
    datasets,
    currentDataset,
    insights,
    analytics,
    loading,
    error,
    fetchDatasets,
    selectDataset,
    setDatasets,
    clearError,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};
