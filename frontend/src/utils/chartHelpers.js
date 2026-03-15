export function generateColors(n) {
  const palette = [
    '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
    '#84cc16', '#a855f7', '#0ea5e9', '#10b981', '#fb923c'
  ];
  if (n <= palette.length) return palette.slice(0, n);
  const colors = [...palette];
  while (colors.length < n) {
    const r = Math.floor(Math.random() * 200 + 55);
    const g = Math.floor(Math.random() * 200 + 55);
    const b = Math.floor(Math.random() * 200 + 55);
    colors.push(`rgb(${r},${g},${b})`);
  }
  return colors;
}

export function getChartConfig(type, data) {
  const config = {
    line: {
      strokeWidth: 2,
      dot: false,
      activeDot: { r: 4 },
      animationDuration: 500
    },
    bar: {
      radius: [3, 3, 0, 0],
      animationDuration: 500
    },
    pie: {
      cx: '50%',
      cy: '50%',
      outerRadius: 80,
      animationDuration: 500
    },
    scatter: {
      r: 4,
      animationDuration: 500
    }
  };
  return config[type] || {};
}

export function transformEDAData(edaResults) {
  if (!edaResults) return {};
  const transformed = {};
  Object.entries(edaResults).forEach(([column, stats]) => {
    transformed[column] = {
      mean: stats.mean,
      median: stats.median || stats['50%'],
      std: stats.std,
      min: stats.min,
      max: stats.max,
      missing: stats.missing || stats.null_count || 0,
      missingPct: stats.missing_pct || 0,
      dtype: stats.dtype || stats.type,
      unique: stats.unique || stats.nunique
    };
  });
  return transformed;
}

export function buildHistogramBins(data, column, numBins = 20) {
  const values = data
    .map(row => parseFloat(row[column]))
    .filter(v => !isNaN(v));
  if (!values.length) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const binSize = (max - min) / numBins;
  const bins = Array.from({ length: numBins }, (_, i) => ({
    x: min + i * binSize,
    xEnd: min + (i + 1) * binSize,
    count: 0,
    label: `${(min + i * binSize).toFixed(2)}`
  }));
  values.forEach(v => {
    const idx = Math.min(Math.floor((v - min) / binSize), numBins - 1);
    if (bins[idx]) bins[idx].count++;
  });
  return bins;
}

export function normalizeData(data, key) {
  const values = data.map(d => d[key]).filter(v => v !== null && v !== undefined);
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return data.map(d => ({ ...d, [key]: 0.5 }));
  return data.map(d => ({
    ...d,
    [key]: (d[key] - min) / (max - min)
  }));
}

export function getHeatmapColor(value) {
  if (value === null || value === undefined) return '#334155';
  const clamped = Math.max(-1, Math.min(1, value));
  if (clamped >= 0) {
    const r = Math.round(239 + (255 - 239) * clamped);
    const g = Math.round(68 - 68 * clamped);
    const b = Math.round(68 - 68 * clamped);
    const opacity = 0.2 + 0.8 * Math.abs(clamped);
    return `rgba(${r},${g},${b},${opacity})`;
  } else {
    const r = Math.round(59 - 59 * Math.abs(clamped));
    const g = Math.round(130 - 130 * Math.abs(clamped));
    const b = Math.round(246);
    const opacity = 0.2 + 0.8 * Math.abs(clamped);
    return `rgba(${r},${g},${b},${opacity})`;
  }
}
