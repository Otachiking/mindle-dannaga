'use client';

import React from 'react';
import { ScorecardData } from '@/lib/types';
import { formatMetricValue } from '@/lib/constants';

interface ScorecardProps {
  data: ScorecardData;
  selectedRegion: string;
}

interface KPICardProps {
  title: string;
  value: string;
  comparison?: number;
  isPercentage?: boolean;
  isMarginComparison?: boolean;
  icon: React.ReactNode;
  iconBg: string;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  comparison,
  isPercentage = false,
  isMarginComparison = false,
  icon,
  iconBg,
}) => {
  const hasComparison = comparison !== undefined;
  
  // For margin comparison, positive difference is good
  // For percentage share, just show the share
  const isPositive = isMarginComparison ? (comparison ?? 0) >= 0 : true;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#e9ecef] p-5">
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs font-medium text-[#6c757d] uppercase tracking-wide">
          {title}
        </p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-[#2c3e50] mb-1">{value}</p>
      {hasComparison && (
        <p className={`text-xs font-medium flex items-center gap-1 ${
          isMarginComparison
            ? isPositive ? 'text-[#28a745]' : 'text-[#dc3545]'
            : 'text-[#6c757d]'
        }`}>
          {isMarginComparison ? (
            <>
              <span>{isPositive ? '↑' : '↓'}</span>
              <span>
                {Math.abs(comparison).toFixed(1)}
                {isPercentage ? 'pp' : '%'} vs All Regions
              </span>
            </>
          ) : (
            <span>{comparison.toFixed(1)}% of Total</span>
          )}
        </p>
      )}
    </div>
  );
};

const Scorecard: React.FC<ScorecardProps> = ({ data, selectedRegion }) => {
  const isFiltered = selectedRegion !== 'all';
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <KPICard
        title="Total Sales"
        value={formatMetricValue(data.totalSales, 'sales')}
        comparison={isFiltered ? data.salesComparison : undefined}
        iconBg="bg-[#e3f2fd]"
        icon={
          <svg className="w-5 h-5 text-[#1470e6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
      <KPICard
        title="Total Quantity"
        value={data.totalQuantity.toLocaleString()}
        comparison={isFiltered ? data.quantityComparison : undefined}
        iconBg="bg-[#f3e5f5]"
        icon={
          <svg className="w-5 h-5 text-[#9852d9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        }
      />
      <KPICard
        title="Total Profit"
        value={formatMetricValue(data.totalProfit, 'profit')}
        comparison={isFiltered ? data.profitComparison : undefined}
        iconBg="bg-[#e8eaf6]"
        icon={
          <svg className="w-5 h-5 text-[#0b2d79]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        }
      />
      <KPICard
        title="Profit Margin"
        value={`${data.profitMargin.toFixed(1)}%`}
        comparison={isFiltered ? data.marginComparison : undefined}
        isPercentage
        isMarginComparison
        iconBg="bg-[#fce4ec]"
        icon={
          <svg className="w-5 h-5 text-[#e43fdd]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        }
      />
    </div>
  );
};

export default Scorecard;
