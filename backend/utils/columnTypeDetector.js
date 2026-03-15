const BOOLEAN_VALUES = new Set(['true', 'false', 'yes', 'no', '1', '0', 't', 'f']);

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}(T[\d:.Z+-]+)?$/;
const COMMON_DATE_RE = /^(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{2}[\/\-]\d{2})$/;

const detectType = (values) => {
  const nonEmpty = values.filter((v) => v !== null && v !== undefined && String(v).trim() !== '');

  if (nonEmpty.length === 0) return 'unknown';

  const sample = nonEmpty.slice(0, 200);

  const boolCount = sample.filter((v) => BOOLEAN_VALUES.has(String(v).toLowerCase())).length;
  if (boolCount / sample.length >= 0.95) return 'boolean';

  const dateCount = sample.filter((v) => {
    const s = String(v).trim();
    return ISO_DATE_RE.test(s) || COMMON_DATE_RE.test(s);
  }).length;
  if (dateCount / sample.length >= 0.8) return 'datetime';

  const numCount = sample.filter((v) => !isNaN(parseFloat(v)) && isFinite(v)).length;
  if (numCount / sample.length >= 0.8) return 'numeric';

  return 'categorical';
};

const analyzeColumns = (headers, rows) => {
  return headers.map((header) => {
    const values = rows.map((row) => row[header]);
    const nonEmpty = values.filter((v) => v !== null && v !== undefined && String(v).trim() !== '');
    const nullable = nonEmpty.length < values.length;
    const type = detectType(values);
    return { name: header, type, nullable };
  });
};

module.exports = { detectType, analyzeColumns };
