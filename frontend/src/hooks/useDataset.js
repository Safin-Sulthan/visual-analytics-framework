import { useState, useCallback } from 'react';
import { datasetService } from '../services/dataset.service';
import { useAppContext } from '../context/AppContext';

export const useDataset = () => {
  const { setDatasets, selectDataset } = useAppContext();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const fetchDatasets = useCallback(async () => {
    try {
      const data = await datasetService.getDatasets();
      setDatasets(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [setDatasets]);

  const uploadDataset = useCallback(async (file) => {
    setUploading(true);
    setUploadProgress(0);
    setError(null);
    try {
      const data = await datasetService.uploadDataset(file, (progress) => {
        setUploadProgress(progress);
      });
      await fetchDatasets();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [fetchDatasets]);

  const deleteDataset = useCallback(async (id) => {
    try {
      await datasetService.deleteDataset(id);
      await fetchDatasets();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchDatasets]);

  return {
    fetchDatasets,
    uploadDataset,
    deleteDataset,
    selectDataset,
    uploading,
    uploadProgress,
    error,
  };
};
