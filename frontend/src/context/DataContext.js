import React, { createContext, useContext, useState, useCallback } from 'react';
import datasetService from '../services/datasetService';
import insightService from '../services/insightService';
import alertService from '../services/alertService';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [datasets, setDatasets] = useState([]);
  const [currentDataset, setCurrentDatasetState] = useState(null);
  const [insights, setInsights] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [datasetsLoading, setDatasetsLoading] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const fetchDatasets = useCallback(async () => {
    setDatasetsLoading(true);
    try {
      const data = await datasetService.getDatasets();
      setDatasets(data);
    } catch (err) {
      console.error('Failed to fetch datasets:', err);
    } finally {
      setDatasetsLoading(false);
    }
  }, []);

  const setCurrentDataset = useCallback((dataset) => {
    setCurrentDatasetState(dataset);
  }, []);

  const fetchInsights = useCallback(async (datasetId) => {
    setInsightsLoading(true);
    try {
      const data = await insightService.getInsights(datasetId);
      setInsights(data);
    } catch (err) {
      console.error('Failed to fetch insights:', err);
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await alertService.getAlerts();
      setAlerts(data);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    }
  }, []);

  const addDataset = (dataset) => {
    setDatasets(prev => [dataset, ...prev]);
  };

  const removeDataset = (datasetId) => {
    setDatasets(prev => prev.filter(d => d.id !== datasetId));
    if (currentDataset?.id === datasetId) {
      setCurrentDatasetState(null);
    }
  };

  return (
    <DataContext.Provider value={{
      datasets,
      currentDataset,
      insights,
      alerts,
      datasetsLoading,
      insightsLoading,
      fetchDatasets,
      setCurrentDataset,
      fetchInsights,
      fetchAlerts,
      addDataset,
      removeDataset
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}

export default DataContext;
