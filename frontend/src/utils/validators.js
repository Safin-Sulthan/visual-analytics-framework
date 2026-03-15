import { MAX_FILE_SIZE_MB, ALLOWED_FILE_TYPES } from './constants';

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!re.test(email)) return 'Enter a valid email address';
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  return null;
};

export const validatePasswordConfirm = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return null;
};

export const validateFileType = (file) => {
  if (!file) return 'No file selected';
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  const mime = file.type;
  const allowed = ALLOWED_FILE_TYPES;
  if (!allowed.includes(ext) && !allowed.includes(mime)) {
    return 'Only CSV files are allowed';
  }
  return null;
};

export const validateFileSize = (file) => {
  if (!file) return 'No file selected';
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > MAX_FILE_SIZE_MB) {
    return `File size must be less than ${MAX_FILE_SIZE_MB} MB`;
  }
  return null;
};

export const validateName = (name) => {
  if (!name || name.trim().length === 0) return 'Name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  return null;
};
