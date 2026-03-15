import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const BASE = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

const VARIANTS = {
  primary:   'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
  secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500',
  danger:    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  ghost:     'text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-400',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...rest
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled || loading}
    className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    {...rest}
  >
    {loading && <LoadingSpinner size="sm" />}
    {children}
  </button>
);

export default Button;
