import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatColumnName } from '../utils/formatters';

function DataTable({ data = [], columns = [], pageSize = 20, loading = false }) {
  const [page, setPage] = useState(1);

  const derivedColumns = columns.length > 0
    ? columns
    : (data.length > 0 ? Object.keys(data[0]).map(k => ({ key: k, label: formatColumnName(k) })) : []);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageData = data.slice(start, start + pageSize);

  const formatCell = (value) => {
    if (value === null || value === undefined) return <span className="text-slate-600">—</span>;
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'number') return value.toLocaleString();
    const str = String(value);
    return str.length > 60 ? str.slice(0, 60) + '…' : str;
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-10 bg-slate-700 rounded" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 bg-slate-700/60 rounded" />
        ))}
      </div>
    );
  }

  if (derivedColumns.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-sm">No data to display.</div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-slate-800 border-b border-slate-700">
              {derivedColumns.map(col => (
                <th
                  key={col.key}
                  className="px-3 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/60">
            {pageData.map((row, i) => (
              <tr key={i} className="hover:bg-slate-700/30 transition-colors table-row-hover">
                {derivedColumns.map(col => (
                  <td key={col.key} className="px-3 py-2 text-slate-300 whitespace-nowrap max-w-xs">
                    {formatCell(row[col.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">
            Rows {start + 1}–{Math.min(start + pageSize, data.length)} of {data.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 hover:bg-slate-700 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-slate-300 px-2">
              Page {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 hover:bg-slate-700 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
