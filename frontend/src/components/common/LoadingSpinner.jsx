import React from 'react';

const SIZES = {
  sm:  'w-4 h-4 border-2',
  md:  'w-8 h-8 border-2',
  lg:  'w-12 h-12 border-4',
  xl:  'w-16 h-16 border-4',
};

const LoadingSpinner = ({ size = 'md', className = '' }) => (
  <div
    className={`
      ${SIZES[size]}
      rounded-full
      border-gray-200
      border-t-indigo-600
      animate-spin
      ${className}
    `}
    role="status"
    aria-label="Loading"
  />
);

export const FullPageSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="xl" />
  </div>
);

export default LoadingSpinner;
