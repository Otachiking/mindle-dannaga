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
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  comparison,
  isPercentage = false,
  isMarginComparison = false,
}) => {
  const hasComparison = comparison !== undefined;
  
  // For margin comparison, positive difference is good
  // For percentage share, just show the share
  const isPositive = isMarginComparison ? (comparison ?? 0) >= 0 : true;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#e9ecef] p-5">
      <p className="text-xs font-medium text-[#6c757d] uppercase tracking-wide mb-2">
        {title}
      </p>
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
      />
      <KPICard
        title="Total Quantity"
        value={data.totalQuantity.toLocaleString()}
        comparison={isFiltered ? data.quantityComparison : undefined}
      />
      <KPICard
        title="Total Profit"
        value={formatMetricValue(data.totalProfit, 'profit')}
        comparison={isFiltered ? data.profitComparison : undefined}
      />
      <KPICard
        title="Profit Margin"
        value={`${data.profitMargin.toFixed(1)}%`}
        comparison={isFiltered ? data.marginComparison : undefined}
        isPercentage
        isMarginComparison
      />
    </div>
  );
};

export default Scorecard;
