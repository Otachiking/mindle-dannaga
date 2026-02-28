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
        <div className="flex items-center justify-between px-2 lg:px-4 py-2 lg:py-3 border-b border-[#e9ecef]">
          <div className="flex items-center gap-2 shrink-0">
            {title && (
              <h3 className="text-xs lg:text-sm font-semibold text-[#2c3e50] whitespace-nowrap">{title}</h3>
            )}
            {titleExtra}
          </div>
          {headerRight && (
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide ml-2">{headerRight}</div>
          )}
        </div>
      )}
      <div className="p-2 lg:p-4">{children}</div>
    </div>
  );
};

export default Card;
