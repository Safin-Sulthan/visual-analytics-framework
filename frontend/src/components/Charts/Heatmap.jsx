import React from 'react';

const interpolateColor = (value) => {
  // value in [-1, 1] → red (negative) / white (0) / blue (positive)
  if (value > 0) {
    const t = value;
    const r = Math.round(255 - t * (255 - 99));
    const g = Math.round(255 - t * (255 - 102));
    const b = Math.round(255);
    return `rgb(${r},${g},${b})`;
  }
  const t = -value;
  const r = Math.round(255);
  const g = Math.round(255 - t * (255 - 68));
  const b = Math.round(255 - t * (255 - 68));
  return `rgb(${r},${g},${b})`;
};

const Heatmap = ({ data = [], xLabels = [], yLabels = [], title, cellSize = 40 }) => (
  <div className="overflow-x-auto">
    {title && <h4 className="text-sm font-semibold text-gray-700 mb-3">{title}</h4>}
    <div className="inline-block">
      {/* Column headers */}
      <div className="flex ml-[80px]">
        {xLabels.map((label) => (
          <div
            key={label}
            className="text-[10px] text-gray-500 font-medium text-center truncate"
            style={{ width: cellSize, paddingBottom: 4 }}
            title={label}
          >
            {label.length > 6 ? label.slice(0, 6) + '…' : label}
          </div>
        ))}
      </div>

      {/* Rows */}
      {yLabels.map((rowLabel, ri) => (
        <div key={rowLabel} className="flex items-center">
          <div
            className="text-[10px] text-gray-500 font-medium text-right pr-2 truncate"
            style={{ width: 80 }}
            title={rowLabel}
          >
            {rowLabel.length > 8 ? rowLabel.slice(0, 8) + '…' : rowLabel}
          </div>
          {xLabels.map((colLabel, ci) => {
            const val = data[ri]?.[ci] ?? 0;
            return (
              <div
                key={colLabel}
                className="flex items-center justify-center text-[10px] font-medium border border-white"
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: interpolateColor(val),
                  color: Math.abs(val) > 0.5 ? '#fff' : '#374151',
                }}
                title={`${rowLabel} × ${colLabel}: ${val.toFixed(3)}`}
              >
                {val.toFixed(2)}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  </div>
);

export default Heatmap;
