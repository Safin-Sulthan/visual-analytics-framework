import React from 'react';

const Card = ({ title, subtitle, children, className = '', headerAction }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
    {(title || headerAction) && (
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          {title && <h3 className="text-base font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
        </div>
        {headerAction && <div>{headerAction}</div>}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

export default Card;
