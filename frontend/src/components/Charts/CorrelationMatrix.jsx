import React from 'react';
import Heatmap from './Heatmap';

const CorrelationMatrix = ({ correlations = {}, title = 'Correlation Matrix' }) => {
  const columns = Object.keys(correlations);

  if (!columns.length) {
    return <p className="text-sm text-gray-500">No correlation data available.</p>;
  }

  const matrixData = columns.map((row) =>
    columns.map((col) => {
      const val = correlations[row]?.[col];
      return val !== undefined ? Number(val.toFixed(3)) : 0;
    })
  );

  return (
    <div>
      {title && <h4 className="text-sm font-semibold text-gray-700 mb-3">{title}</h4>}
      <Heatmap
        data={matrixData}
        xLabels={columns}
        yLabels={columns}
        cellSize={44}
      />
      {/* Legend */}
      <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
        <div className="w-20 h-3 rounded" style={{ background: 'linear-gradient(to right, rgb(255,68,68), white, rgb(99,102,255))' }} />
        <span>-1 (negative)</span>
        <span className="mx-2">→</span>
        <span>+1 (positive)</span>
      </div>
    </div>
  );
};

export default CorrelationMatrix;
