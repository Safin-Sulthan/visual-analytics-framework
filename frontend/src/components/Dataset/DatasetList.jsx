import React from 'react';
import { Eye, Trash2, Database } from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import { DATASET_STATUS } from '../../utils/constants';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

const DatasetList = ({ datasets, loading, onView, onDelete }) => {
  if (loading) return <div className="flex justify-center py-10"><LoadingSpinner size="lg" /></div>;
  if (!datasets?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Database size={48} className="text-gray-300 mb-3" />
        <p className="text-gray-500 font-medium">No datasets uploaded yet</p>
        <p className="text-sm text-gray-400 mt-1">Upload a CSV file to get started</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {datasets.map((ds) => {
        const status = DATASET_STATUS[ds.status] || DATASET_STATUS.pending;
        return (
          <div
            key={ds._id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{ds.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(ds.uploadedAt)}</p>
              </div>
              <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
            </div>

            <div className="flex gap-4 text-sm text-gray-500 mb-4">
              <span><span className="font-medium text-gray-800">{ds.rowCount?.toLocaleString() ?? '—'}</span> rows</span>
              <span><span className="font-medium text-gray-800">{ds.columnCount ?? '—'}</span> cols</span>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => onView(ds)} className="flex-1 justify-center gap-1">
                <Eye size={14} /> View
              </Button>
              <Button size="sm" variant="danger" onClick={() => onDelete(ds._id)} className="px-3">
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DatasetList;
