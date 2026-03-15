import React from 'react';
import { getHeatmapColor } from '../utils/chartHelpers';

function HeatmapComponent({ data = {}, columns = [], title, height }) {
  if (!columns.length || !Object.keys(data).length) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
        No correlation data available
      </div>
    );
  }

  const cellSize = Math.max(28, Math.min(52, Math.floor(480 / columns.length)));
  const labelWidth = 80;

  return (
    <div>
      {title && <h3 className="text-sm font-medium text-slate-300 mb-3">{title}</h3>}
      <div className="overflow-x-auto">
        <div style={{ minWidth: labelWidth + columns.length * cellSize }}>
          {/* Column headers */}
          <div className="flex" style={{ marginLeft: labelWidth }}>
            {columns.map(col => (
              <div
                key={col}
                style={{ width: cellSize, minWidth: cellSize }}
                className="text-center text-slate-400 pb-1"
              >
                <span
                  className="text-xs block truncate"
                  style={{
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                    transform: 'rotate(180deg)',
                    height: 60,
                    lineHeight: `${cellSize}px`,
                    fontSize: Math.max(9, Math.min(11, cellSize / 4))
                  }}
                  title={col}
                >
                  {col}
                </span>
              </div>
            ))}
          </div>
          {/* Rows */}
          {columns.map(row => (
            <div key={row} className="flex items-center">
              <div
                style={{ width: labelWidth, minWidth: labelWidth }}
                className="text-xs text-slate-400 truncate pr-2 text-right"
                title={row}
              >
                {row}
              </div>
              {columns.map(col => {
                const value = data[row]?.[col] ?? null;
                const bgColor = getHeatmapColor(value);
                const displayVal = value !== null ? value.toFixed(2) : '—';
                return (
                  <div
                    key={col}
                    style={{
                      width: cellSize,
                      minWidth: cellSize,
                      height: cellSize,
                      backgroundColor: bgColor
                    }}
                    className="flex items-center justify-center border border-slate-900 cursor-default"
                    title={`${row} × ${col}: ${displayVal}`}
                  >
                    <span
                      className="text-white font-medium"
                      style={{ fontSize: Math.max(8, Math.min(11, cellSize / 4)) }}
                    >
                      {value !== null ? value.toFixed(1) : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
          {/* Color scale legend */}
          <div className="mt-3 flex items-center gap-2 justify-end">
            <span className="text-xs text-slate-500">-1</span>
            <div className="flex h-3 rounded overflow-hidden" style={{ width: 120 }}>
              {Array.from({ length: 20 }, (_, i) => {
                const v = -1 + (2 * i) / 19;
                return <div key={i} style={{ flex: 1, backgroundColor: getHeatmapColor(v) }} />;
              })}
            </div>
            <span className="text-xs text-slate-500">+1</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeatmapComponent;
