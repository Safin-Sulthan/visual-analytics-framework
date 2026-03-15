import React from 'react';
import LoadingSpinner from '../common/LoadingSpinner';

const TYPE_BADGE = {
  numeric:  'bg-blue-50 text-blue-700',
  categorical: 'bg-purple-50 text-purple-700',
  datetime: 'bg-green-50 text-green-700',
  text:     'bg-gray-100 text-gray-600',
};

const DatasetPreview = ({ preview, loading }) => {
  if (loading) return <div className="flex justify-center py-10"><LoadingSpinner size="lg" /></div>;
  if (!preview) return <p className="text-sm text-gray-500">No preview available.</p>;

  const { columns = [], rows = [], totalRows, totalColumns } = preview;

  return (
    <div className="space-y-3">
      <div className="flex gap-4 text-sm text-gray-500">
        <span>
          <span className="font-medium text-gray-800">{totalRows?.toLocaleString()}</span> rows
        </span>
        <span>
          <span className="font-medium text-gray-800">{totalColumns}</span> columns
        </span>
        <span className="text-xs italic">(showing first 20 rows)</span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-sm divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.name}
                  className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    {col.name}
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${TYPE_BADGE[col.type] || TYPE_BADGE.text}`}>
                      {col.type}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td
                    key={col.name}
                    className="px-4 py-2 text-gray-700 max-w-[200px] truncate"
                    title={String(row[col.name] ?? '')}
                  >
                    {row[col.name] ?? <span className="text-gray-300">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DatasetPreview;
