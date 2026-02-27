'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { Props as ApexChartProps } from 'react-apexcharts';
import type ApexCharts from 'apexcharts';
import Card from './ui/Card';
import Button from './ui/Button';
import { DataRow, MetricType, AggregatedData } from '@/lib/types';
import {
  aggregateByCategory,
  aggregateBySegment,
  aggregateByRegion,
  aggregateByShipMode,
} from '@/lib/dataProcessor';
import { COLORS, formatAxisValue, METRIC_LABELS, formatFullValue } from '@/lib/constants';

// Dynamic import for ApexCharts (client-side only)
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false }) as React.ComponentType<ApexChartProps>;

interface PerformanceChartsProps {
  data: DataRow[];
  metric: MetricType;
  selectedRegion: string;
}

type ChartViewMode = 'bar' | 'pie';

interface SingleChartProps {
  title: string;
  data: AggregatedData[];
  metric: MetricType;
  highlightBar?: string;
  viewMode: ChartViewMode;
}

const SingleChart: React.FC<SingleChartProps> = ({
  title,
  data,
  metric,
  highlightBar,
  viewMode,
}) => {
  const hasNegative = useMemo(() => data.some(d => d.value < 0), [data]);
  const minValue = useMemo(() => Math.min(0, ...data.map(d => d.value)), [data]);
  
  const barChartOptions: ApexCharts.ApexOptions = useMemo(() => ({
    chart: {
      type: 'bar',
      toolbar: { show: false },
      fontFamily: 'inherit',
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 6,
        columnWidth: '65%',
        distributed: true,
      },
    },
    colors: data.map((d) => {
      if (highlightBar && d.name !== highlightBar) {
        return COLORS.borderLight;
      }
      return d.color || COLORS.officeSouth;
    }),
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: data.map((d) => d.name.length > 10 ? d.name.slice(0, 9) + '…' : d.name),
      labels: {
        rotate: 0,
        style: {
          fontSize: '10px',
          colors: COLORS.textGray,
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (val: number) => formatAxisValue(val, metric),
        style: {
          fontSize: '10px',
          colors: COLORS.textGray,
        },
      },
    },
    grid: {
      borderColor: COLORS.borderLight,
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    legend: {
      show: false,
    },
    tooltip: {
      shared: true,
      intersect: false,
      custom: function({ seriesIndex, dataPointIndex, w }) {
        const item = data[dataPointIndex];
        const value = item.value;
        const color = item.color || COLORS.officeSouth;
        const formattedValue = formatFullValue(value, metric);
        
        return `<div style="background: #2c3e50; color: white; padding: 8px 12px; border-radius: 8px; font-size: 12px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <div style="width: 10px; height: 10px; border-radius: 2px; background: ${color};"></div>
            <span style="font-weight: 600;">${item.name}</span>
          </div>
          <div>${METRIC_LABELS[metric]}: ${formattedValue}</div>
        </div>`;
      },
    },
    annotations: hasNegative ? {
      yaxis: [{
        y: minValue,
        y2: 0,
        fillColor: 'rgba(220, 53, 69, 0.15)',
        borderColor: 'transparent',
        label: {
          text: 'Negative',
          borderColor: 'transparent',
          style: { color: '#dc3545', background: 'transparent', fontSize: '9px' },
          position: 'left' as const,
          offsetX: 30,
          offsetY: 8,
        },
      }],
    } : undefined,
  }), [data, metric, highlightBar, hasNegative, minValue]);
  
  const pieChartOptions: ApexCharts.ApexOptions = useMemo(() => ({
    chart: {
      type: 'pie',
      toolbar: { show: false },
      fontFamily: 'inherit',
    },
    labels: data.map((d) => d.name),
    colors: data.map((d) => d.color || COLORS.officeSouth),
    dataLabels: {
      enabled: true,
      formatter: function(val: number) {
        return `${val.toFixed(1)}%`;
      },
      style: {
        fontSize: '10px',
        colors: ['#fff'],
      },
      dropShadow: {
        enabled: false,
      },
      offset: 0,
      minAngleToShowLabel: 10,
    },
    plotOptions: {
      pie: {
        dataLabels: {
          offset: -5,
          minAngleToShowLabel: 10,
        },
      },
    },
    legend: {
      show: true,
      position: 'bottom',
      fontSize: '9px',
      labels: {
        colors: COLORS.textGray,
      },
      markers: {
        size: 6,
      },
      itemMargin: {
        horizontal: 6,
        vertical: 2,
      },
      formatter: function(seriesName: string) {
        // Truncate long names for better legend layout
        return seriesName.length > 12 ? seriesName.slice(0, 10) + '...' : seriesName;
      },
    },
    tooltip: {
      custom: function({ seriesIndex, w }) {
        const item = data[seriesIndex];
        if (!item) return '';
        const value = item.value;
        const color = item.color || COLORS.officeSouth;
        const formattedValue = formatFullValue(Math.abs(value), metric);
        const percentage = w.globals.seriesPercent?.[seriesIndex]?.[0]?.toFixed(1) || '0';
        
        return `<div style="background: #2c3e50; color: white; padding: 8px 12px; border-radius: 8px; font-size: 12px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <div style="width: 10px; height: 10px; border-radius: 2px; background: ${color};"></div>
            <span style="font-weight: 600;">${item.name}</span>
          </div>
          <div>${METRIC_LABELS[metric]}: ${formattedValue}</div>
          <div style="color: rgba(255,255,255,0.7); font-size: 11px;">${percentage}% of total</div>
        </div>`;
      },
    },
    stroke: {
      width: 2,
      colors: ['#fff'],
    },
  }), [data, metric]);
  
  const barSeries = useMemo(() => [{
    name: METRIC_LABELS[metric],
    data: data.map((d) => d.value),
  }], [data, metric]);
  
  const pieSeries = useMemo(() => data.map((d) => Math.abs(d.value)), [data]);
  
  return (
    <Card title={title}>
      <div className="h-[200px]">
        {viewMode === 'bar' ? (
          <Chart
            key={`bar-${title}-${metric}-${data.length}-${data.map(d => d.value).join(',')}`}
            options={barChartOptions}
            series={barSeries}
            type="bar"
            height="100%"
          />
        ) : (
          <Chart
            key={`pie-${title}-${metric}-${data.length}-${data.map(d => d.value).join(',')}`}
            options={pieChartOptions}
            series={pieSeries}
            type="pie"
            height="100%"
          />
        )}
      </div>
    </Card>
  );
};

const PerformanceCharts: React.FC<PerformanceChartsProps> = ({
  data,
  metric,
  selectedRegion,
}) => {
  const [viewMode, setViewMode] = useState<ChartViewMode>('pie');
  
  const categoryData = useMemo(() => aggregateByCategory(data, metric), [data, metric]);
  const segmentData = useMemo(() => aggregateBySegment(data, metric), [data, metric]);
  const regionData = useMemo(() => aggregateByRegion(data, metric), [data, metric]);
  const shipModeData = useMemo(() => aggregateByShipMode(data, metric), [data, metric]);
  
  return (
    <div>
      {/* Chart Type Switcher */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-[#2c3e50]">Performance Breakdown</h3>
          <span className="text-sm text-[#6c757d]">({METRIC_LABELS[metric]})</span>
        </div>
        <div className="flex gap-1">
          <Button
            active={viewMode === 'bar'}
            onClick={() => setViewMode('bar')}
            className="text-xs px-3 py-1.5 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Bar
          </Button>
          <Button
            active={viewMode === 'pie'}
            onClick={() => setViewMode('pie')}
            className="text-xs px-3 py-1.5 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            Pie
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SingleChart
          title="Region Performance"
          data={regionData}
          metric={metric}
          highlightBar={selectedRegion !== 'all' ? selectedRegion : undefined}
          viewMode={viewMode}
        />
        <SingleChart
          title="Segment Performance"
          data={segmentData}
          metric={metric}
          viewMode={viewMode}
        />
        <SingleChart
          title="Category Performance"
          data={categoryData}
          metric={metric}
          viewMode={viewMode}
        />
        <SingleChart
          title="Ship Mode Performance"
          data={shipModeData}
          metric={metric}
          viewMode={viewMode}
        />
      </div>
    </div>
  );
};

export default PerformanceCharts;
