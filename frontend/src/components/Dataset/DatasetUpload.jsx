import React, { useCallback, useState } from 'react';
import { UploadCloud, FileText, X, CheckCircle } from 'lucide-react';
import { validateFileType, validateFileSize } from '../../utils/validators';
import { formatFileSize } from '../../utils/helpers';
import Button from '../common/Button';

const DatasetUpload = ({ onUpload, uploading, progress }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');

  const validateAndSet = (file) => {
    const typeErr = validateFileType(file);
    const sizeErr = validateFileSize(file);
    if (typeErr) { setFileError(typeErr); return; }
    if (sizeErr) { setFileError(sizeErr); return; }
    setFileError('');
    setSelectedFile(file);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSet(file);
  }, []);

  const handleDragOver = (e) => { e.preventDefault(); setDragActive(true); };
  const handleDragLeave = () => setDragActive(false);

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) validateAndSet(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    await onUpload(selectedFile);
    setSelectedFile(null);
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${
          dragActive ? 'drag-active border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
        }`}
        onClick={() => document.getElementById('file-input').click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleFileInput}
        />
        <UploadCloud size={40} className="mx-auto text-gray-400 mb-3" />
        <p className="text-sm font-medium text-gray-700">
          Drag & drop a CSV file here, or <span className="text-indigo-600">browse</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">Supported: .csv · Max size: 50 MB</p>
      </div>

      {fileError && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <X size={14} /> {fileError}
        </p>
      )}

      {selectedFile && !fileError && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-indigo-500" />
            <div>
              <p className="text-sm font-medium text-gray-800">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleUpload}
            loading={uploading}
            disabled={uploading}
          >
            Upload
          </Button>
        </div>
      )}

      {uploading && (
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Uploading…</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DatasetUpload;
