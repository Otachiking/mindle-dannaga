'use client';

import React from 'react';
import Button from './ui/Button';
import Card from './ui/Card';
import { MetricType, RegionType } from '@/lib/types';

interface FilterRowProps {
  selectedRegion: string;
  selectedMetric: MetricType;
  onRegionChange: (region: string) => void;
  onMetricChange: (metric: MetricType) => void;
}

const regions: { label: string; value: RegionType }[] = [
  { label: 'All', value: 'all' },
  { label: 'West', value: 'West' },
  { label: 'East', value: 'East' },
  { label: 'North', value: 'North' },
  { label: 'South', value: 'South' },
];

const metrics: { label: string; value: MetricType }[] = [
  { label: 'Profit', value: 'profit' },
  { label: 'Sales', value: 'sales' },
  { label: 'Quantity', value: 'quantity' },
  { label: 'Profit Margin', value: 'profitMargin' },
];

const FilterRow: React.FC<FilterRowProps> = ({
  selectedRegion,
  selectedMetric,
  onRegionChange,
  onMetricChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Region Filter */}
      <Card title="Filter by Region">
        <div className="flex flex-wrap gap-2">
          {regions.map((region) => (
            <Button
              key={region.value}
              active={selectedRegion === region.value}
              onClick={() => onRegionChange(region.value)}
            >
              {region.label}
            </Button>
          ))}
        </div>
      </Card>
      
      {/* Metric Filter */}
      <Card title="View by Metric">
        <div className="flex flex-wrap gap-2">
          {metrics.map((metric) => (
            <Button
              key={metric.value}
              active={selectedMetric === metric.value}
              onClick={() => onMetricChange(metric.value)}
            >
              {metric.label}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default FilterRow;
