/**
 * Format a number with locale-aware separators and optional decimal places.
 */
export const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format an ISO date string into a human-readable date.
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '—';
  const defaults = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', { ...defaults, ...options });
};

/**
 * Truncate text to a maximum length, appending ellipsis if needed.
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  return text.length <= maxLength ? text : `${text.slice(0, maxLength)}...`;
};

/**
 * Calculate the percentage change between two values.
 */
export const calculatePercentageChange = (previous, current) => {
  if (!previous || previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
};

/**
 * Sort an array of insight objects by their score in descending order.
 */
export const sortByScore = (items, scoreKey = 'score') =>
  [...items].sort((a, b) => (b[scoreKey] ?? 0) - (a[scoreKey] ?? 0));

/**
 * Convert bytes to a human-readable file size string.
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
};

/**
 * Generate initials from a full name string.
 */
export const getInitials = (name = '') =>
  name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('');
