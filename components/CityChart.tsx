'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { Props as ApexChartProps } from 'react-apexcharts';
import type ApexCharts from 'apexcharts';
import Card from './ui/Card';
import Button from './ui/Button';
import { DataRow, MetricType, CityChartMode } from '@/lib/types';
import { aggregateByCity } from '@/lib/dataProcessor';
import { COLORS, formatAxisValue, formatFullValue, METRIC_LABELS } from '@/lib/constants';

// Dynamic import for ApexCharts (client-side only)
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false }) as React.ComponentType<ApexChartProps>;

interface CityChartProps {
  data: DataRow[];
  metric: MetricType;
}

const CityChart: React.FC<CityChartProps> = ({ data, metric }) => {
  const [mode, setMode] = useState<CityChartMode>('top5');
  
  const metricIndicator = (
    <span className="text-xs font-normal text-[#6c757d]">({METRIC_LABELS[metric]})</span>
  );
  
  const cityData = useMemo(() => {
    return aggregateByCity(data, metric, mode === 'top5', 5);
  }, [data, metric, mode]);
  
  const chartOptions: ApexCharts.ApexOptions = useMemo(() => ({
    chart: {
      type: 'bar',
      toolbar: { show: false },
      fontFamily: 'inherit',
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
        barHeight: '60%',
        dataLabels: {
          position: 'top',
        },
      },
    },
    colors: [mode === 'top5' ? COLORS.officeSouth : COLORS.danger],
    dataLabels: {
      enabled: true,
      formatter: (val: number) => formatAxisValue(val, metric),
      offsetX: 30,
      style: {
        fontSize: '11px',
        colors: [COLORS.textDark],
      },
    },
    xaxis: {
      categories: cityData.map((c) => c.city),
      labels: {
        formatter: (val: string) => formatAxisValue(Number(val), metric),
        style: {
          fontSize: '11px',
          colors: COLORS.textGray,
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '11px',
          colors: COLORS.textDark,
        },
        maxWidth: 100,
      },
    },
    grid: {
      borderColor: COLORS.borderLight,
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
    tooltip: {
      custom: function({ series, seriesIndex, dataPointIndex }) {
        const city = cityData[dataPointIndex];
        const value = series[seriesIndex][dataPointIndex];
        return `<div class="bg-[#2c3e50] text-white px-3 py-2 rounded-lg text-sm shadow-lg">
          <div class="font-semibold">${city.city}</div>
          <div class="text-white/70 text-xs">${city.state}</div>
          <div class="mt-1">${METRIC_LABELS[metric]}: ${formatFullValue(value, metric)}</div>
        </div>`;
      },
    },
  }), [cityData, metric, mode]);
  
  const series = useMemo(() => [{
    name: METRIC_LABELS[metric],
    data: cityData.map((c) => c.value),
  }], [cityData, metric]);
  
  const toggleButtons = (
    <div className="flex gap-1">
      <Button
        active={mode === 'top5'}
        onClick={() => setMode('top5')}
        className="text-xs px-2 py-1"
      >
        Top 5
      </Button>
      <Button
        active={mode === 'bottom5'}
        onClick={() => setMode('bottom5')}
        className="text-xs px-2 py-1"
      >
        Bottom 5
      </Button>
    </div>
  );
  
  return (
    <Card title="City Performance" titleExtra={metricIndicator} headerRight={toggleButtons}>
      <div className="h-[400px]">
        <Chart
          options={chartOptions}
          series={series}
          type="bar"
          height="100%"
        />
      </div>
    </Card>
  );
};

export default CityChart;
