'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  titleExtra?: React.ReactNode;
  className?: string;
  headerRight?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  titleExtra,
  className = '',
  headerRight,
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-[#e9ecef] overflow-hidden ${className}`}>
      {(title || headerRight) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#e9ecef]">
          <div className="flex items-center gap-2">
            {title && (
              <h3 className="text-sm font-semibold text-[#2c3e50]">{title}</h3>
            )}
            {titleExtra}
          </div>
          {headerRight && (
            <div className="flex items-center gap-2">{headerRight}</div>
          )}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
};

export default Card;
