import React, { useEffect, useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import LoadingSpinner from '../components/LoadingSpinner';
import { useData } from '../context/DataContext';
import datasetService from '../services/datasetService';
import { formatDate, formatFileSize, formatNumber } from '../utils/formatters';
import { Upload, Trash2, Eye, X, AlertCircle, CheckCircle, Clock, Database } from 'lucide-react';
import toast from 'react-hot-toast';

const statusConfig = {
  ready: { color: 'text-green-400 bg-green-900/30', icon: CheckCircle },
  processed: { color: 'text-green-400 bg-green-900/30', icon: CheckCircle },
  processing: { color: 'text-yellow-400 bg-yellow-900/30', icon: Clock },
  pending: { color: 'text-blue-400 bg-blue-900/30', icon: Clock },
  error: { color: 'text-red-400 bg-red-900/30', icon: AlertCircle },
  uploaded: { color: 'text-blue-400 bg-blue-900/30', icon: CheckCircle }
};

function DatasetManager() {
  const { datasets, fetchDatasets, addDataset, removeDataset } = useData();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewDataset, setPreviewDataset] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchDatasets().finally(() => setLoading(false));
  }, [fetchDatasets]);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.json')) {
      toast.error('Please upload a CSV, Excel, or JSON file');
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    try {
      const result = await datasetService.uploadDataset(file, (event) => {
        const pct = Math.round((event.loaded * 100) / event.total);
        setUploadProgress(pct);
      });
      addDataset(result);
      toast.success(`"${file.name}" uploaded successfully!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [addDataset]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'application/json': ['.json'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
    maxFiles: 1,
    disabled: uploading
  });

  const handlePreview = async (dataset) => {
    setPreviewDataset(dataset);
    setPreviewLoading(true);
    try {
      const data = await datasetService.getDatasetPreview(dataset.id);
      setPreviewData(data.rows || data.data || []);
    } catch {
      toast.error('Failed to load preview');
      setPreviewData([]);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDelete = async (dataset) => {
    try {
      await datasetService.deleteDataset(dataset.id);
      removeDataset(dataset.id);
      setDeleteConfirm(null);
      toast.success(`"${dataset.name}" deleted`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <Layout title="Datasets">
      <div className="space-y-6">
        {/* Upload zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-900/20'
              : uploading
              ? 'border-slate-600 bg-slate-800/50 cursor-not-allowed'
              : 'border-slate-600 hover:border-blue-500 hover:bg-blue-900/10 bg-slate-800/30'
          }`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <LoadingSpinner size="md" />
              <p className="text-slate-300 text-sm">Uploading... {uploadProgress}%</p>
              <div className="w-48 bg-slate-700 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-slate-700 rounded-full">
                <Upload className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">
                  {isDragActive ? 'Drop the file here' : 'Drop a file or click to upload'}
                </p>
                <p className="text-slate-400 text-xs mt-1">CSV, Excel (.xlsx), or JSON · Max 100MB</p>
              </div>
            </div>
          )}
        </div>

        {/* Dataset list */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Your Datasets</h2>
            <span className="text-sm text-slate-400">{datasets.length} total</span>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading datasets..." />
          ) : datasets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Database className="w-12 h-12 mb-3 opacity-40" />
              <p className="text-base font-medium text-slate-400">No datasets yet</p>
              <p className="text-sm mt-1">Upload a CSV or Excel file to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    {['Name', 'Rows', 'Columns', 'Size', 'Status', 'Uploaded', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {datasets.map(ds => {
                    const sc = statusConfig[ds.status?.toLowerCase()] || statusConfig.pending;
                    const StatusIcon = sc.icon;
                    return (
                      <tr key={ds.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-white">{ds.name}</td>
                        <td className="px-4 py-3 text-slate-300">{formatNumber(ds.rows || ds.num_rows, 0)}</td>
                        <td className="px-4 py-3 text-slate-300">{ds.columns || ds.num_columns || '—'}</td>
                        <td className="px-4 py-3 text-slate-300">{formatFileSize(ds.size || ds.file_size)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {ds.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">{formatDate(ds.created_at || ds.upload_date)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handlePreview(ds)}
                              className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(ds)}
                              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewDataset && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-700">
              <div>
                <h3 className="text-lg font-semibold text-white">{previewDataset.name}</h3>
                <p className="text-sm text-slate-400 mt-0.5">
                  {formatNumber(previewDataset.rows || previewDataset.num_rows, 0)} rows · {previewDataset.columns || previewDataset.num_columns || '?'} columns
                </p>
              </div>
              <button onClick={() => setPreviewDataset(null)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-5">
              {previewLoading ? (
                <LoadingSpinner message="Loading preview..." />
              ) : (
                <DataTable data={previewData} pageSize={15} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Dataset</h3>
            <p className="text-sm text-slate-300 mb-1">
              Are you sure you want to delete <span className="font-medium text-white">"{deleteConfirm.name}"</span>?
            </p>
            <p className="text-xs text-slate-400 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default DatasetManager;
