import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useDataset } from '../hooks/useDataset';
import { datasetService } from '../services/dataset.service';
import Card from '../components/common/Card';
import DatasetUpload from '../components/Dataset/DatasetUpload';
import DatasetList from '../components/Dataset/DatasetList';
import DatasetPreview from '../components/Dataset/DatasetPreview';
import Modal from '../components/common/Modal';

const Datasets = () => {
  const { datasets, loading } = useAppContext();
  const { fetchDatasets, uploadDataset, deleteDataset, uploading, uploadProgress } = useDataset();
  const [previewDataset, setPreviewDataset] = useState(null);
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => { fetchDatasets(); }, []);

  const handleView = async (dataset) => {
    setPreviewDataset(dataset);
    setPreviewLoading(true);
    try {
      const data = await datasetService.getDatasetPreview(dataset._id);
      setPreview(data);
    } catch {
      setPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this dataset and all related analytics?')) {
      await deleteDataset(id);
    }
  };

  const handleClosePreview = () => {
    setPreviewDataset(null);
    setPreview(null);
  };

  return (
    <div className="space-y-6 fade-in">
      <h2 className="text-xl font-bold text-gray-900">Datasets</h2>

      <Card title="Upload Dataset" subtitle="Upload a CSV file to begin analysis">
        <DatasetUpload
          onUpload={uploadDataset}
          uploading={uploading}
          progress={uploadProgress}
        />
      </Card>

      <Card title="Your Datasets" subtitle={`${datasets.length} dataset${datasets.length !== 1 ? 's' : ''} uploaded`}>
        <DatasetList
          datasets={datasets}
          loading={loading}
          onView={handleView}
          onDelete={handleDelete}
        />
      </Card>

      <Modal
        isOpen={!!previewDataset}
        onClose={handleClosePreview}
        title={`Preview: ${previewDataset?.name}`}
        size="xl"
      >
        <DatasetPreview preview={preview} loading={previewLoading} />
      </Modal>
    </div>
  );
};

export default Datasets;
