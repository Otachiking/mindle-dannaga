'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { Props as ApexChartProps } from 'react-apexcharts';
import type ApexCharts from 'apexcharts';
import Card from './ui/Card';
import Button from './ui/Button';
import { DataRow, MetricType } from '@/lib/types';
import { aggregateBySubcategory } from '@/lib/dataProcessor';
import { COLORS, formatAxisValue, formatFullValue } from '@/lib/constants';

// Dynamic import for ApexCharts (client-side only)
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false }) as React.ComponentType<ApexChartProps>;

interface SubcategoryComboProps {
  data: DataRow[];
  metric: MetricType;
}

// Stacked bar colors: Profit (dark blue), Sales (medium blue), Quantity line (purple), Profit Margin (pink)
const STACKED_COLORS = {
  profit: '#0b2d79',  // Dark blue
  sales: '#1470e6',   // Medium blue
  quantity: '#9852d9', // Purple
  profitMargin: '#e43fdd', // Pink
};

type ChartMode = 'combo' | 'profit' | 'quantity' | 'sales';

const SubcategoryCombo: React.FC<SubcategoryComboProps> = ({ data, metric }) => {
  const [chartMode, setChartMode] = useState<ChartMode>('combo');
  
  const subcategoryData = useMemo(() => {
    return aggregateBySubcategory(data);
  }, [data]);
  
  // Check if there are any negative profit values
  const hasNegativeProfit = useMemo(() => {
    return subcategoryData.some(s => s.profit < 0);
  }, [subcategoryData]);
  
  const minProfit = useMemo(() => {
    return Math.min(0, ...subcategoryData.map(s => s.profit));
  }, [subcategoryData]);
  
  // Get chart configuration based on mode
  const { chartOptions, series, chartType } = useMemo(() => {
    const categories = subcategoryData.map((s) => s.subcategory);
    
    // Common options
    const baseOptions: ApexCharts.ApexOptions = {
      chart: {
        toolbar: { show: false },
        fontFamily: 'inherit',
        zoom: { enabled: false },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          borderRadius: 4,
          columnWidth: chartMode === 'combo' ? '60%' : '50%',
          distributed: chartMode !== 'combo',
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories,
        labels: {
          rotate: -45,
          rotateAlways: true,
          style: {
            fontSize: '10px',
            colors: COLORS.textGray,
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      grid: {
        borderColor: COLORS.borderLight,
        strokeDashArray: 4,
      },
      tooltip: {
        shared: true,
        intersect: false,
        custom: function({ series, seriesIndex, dataPointIndex, w }) {
          const subcatItem = subcategoryData[dataPointIndex];
          const categoryColor = subcatItem.color;
          
          if (chartMode === 'combo') {
            const marginColor = subcatItem.profitMargin >= 0 ? '#69db7c' : '#ff6b6b';
            return `<div style="background: #2c3e50; color: white; padding: 10px 14px; border-radius: 8px; font-size: 12px; min-width: 180px;">
              <div style="font-weight: 600; margin-bottom: 6px; font-size: 13px;">${subcatItem.subcategory}</div>
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.2);">
                <div style="width: 10px; height: 10px; border-radius: 2px; background: ${categoryColor};"></div>
                <span style="color: rgba(255,255,255,0.7);">${subcatItem.category}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <div style="width: 10px; height: 10px; border-radius: 2px; background: ${STACKED_COLORS.profit};"></div>
                <span>Profit: ${formatFullValue(subcatItem.profit, 'profit')}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <div style="width: 10px; height: 10px; border-radius: 2px; background: ${STACKED_COLORS.sales};"></div>
                <span>Sales: ${formatFullValue(subcatItem.sales, 'sales')}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <div style="width: 10px; height: 10px; border-radius: 50%; background: ${STACKED_COLORS.quantity};"></div>
                <span>Quantity: ${subcatItem.quantity.toLocaleString()}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <div style="width: 10px; height: 10px; border-radius: 50%; background: ${STACKED_COLORS.profitMargin};"></div>
                <span style="color: ${marginColor};">Profit Margin: ${subcatItem.profitMargin.toFixed(1)}%</span>
              </div>
            </div>`;
          } else {
            const metricLabel = chartMode.charAt(0).toUpperCase() + chartMode.slice(1);
            const value = chartMode === 'profit' ? subcatItem.profit : chartMode === 'sales' ? subcatItem.sales : subcatItem.quantity;
            const formattedValue = chartMode === 'quantity' ? value.toLocaleString() : formatFullValue(value, chartMode);
            const marginColor = subcatItem.profitMargin >= 0 ? '#69db7c' : '#ff6b6b';
            
            return `<div style="background: #2c3e50; color: white; padding: 10px 14px; border-radius: 8px; font-size: 12px; min-width: 160px;">
              <div style="font-weight: 600; margin-bottom: 6px; font-size: 13px;">${subcatItem.subcategory}</div>
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px; padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.2);">
                <div style="width: 10px; height: 10px; border-radius: 2px; background: ${categoryColor};"></div>
                <span style="color: rgba(255,255,255,0.7);">${subcatItem.category}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <div style="width: 10px; height: 10px; border-radius: 2px; background: ${STACKED_COLORS[chartMode]};"></div>
                <span>${metricLabel}: ${formattedValue}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <div style="width: 10px; height: 10px; border-radius: 50%; background: ${STACKED_COLORS.profitMargin};"></div>
                <span style="color: ${marginColor};">Margin: ${subcatItem.profitMargin.toFixed(1)}%</span>
              </div>
            </div>`;
          }
        },
      },
    };
    
    if (chartMode === 'combo') {
      // Combo mode: Profit bar + Sales bar (left axis), Quantity line (right axis)
      // Calculate value ranges for axis alignment
      const maxSales = Math.max(...subcategoryData.map(s => s.sales));
      const maxProfit = Math.max(...subcategoryData.map(s => s.profit));
      const maxLeftValue = Math.max(maxSales, maxProfit);
      const maxQuantity = Math.max(...subcategoryData.map(s => s.quantity));
      
      // Calculate aligned ranges so 0 lines match
      const leftMin = hasNegativeProfit ? minProfit : 0;
      const leftMax = maxLeftValue * 1.1;
      
      // Calculate right axis to align 0 with left axis 0
      // ratio = leftMin / (leftMin - leftMax) gives the fraction where 0 sits
      const zeroRatio = leftMin < 0 ? Math.abs(leftMin) / (Math.abs(leftMin) + leftMax) : 0;
      const rightMax = maxQuantity * 1.1;
      const rightMin = zeroRatio > 0 ? -(rightMax * zeroRatio / (1 - zeroRatio)) : 0;
      
      return {
        chartOptions: {
          ...baseOptions,
          chart: {
            ...baseOptions.chart,
            type: 'line' as const,
            stacked: false,
          },
          stroke: {
            width: [0, 0, 3, 2.5],
            curve: 'smooth' as const,
            dashArray: [0, 0, 5, 0],
          },
          fill: {
            opacity: 1,
          },
          colors: [STACKED_COLORS.profit, STACKED_COLORS.sales, STACKED_COLORS.quantity, STACKED_COLORS.profitMargin],
          yaxis: [
            {
              seriesName: 'Profit',
              title: { 
                text: 'Revenue ($)',
                style: { color: COLORS.textGray, fontSize: '11px' },
              },
              min: leftMin,
              max: leftMax,
              labels: {
                formatter: (val: number) => formatAxisValue(val, 'profit'),
                style: { colors: COLORS.textGray, fontSize: '11px' },
              },
            },
            {
              seriesName: 'Sales',
              show: false,
              min: leftMin,
              max: leftMax,
              labels: {
                formatter: (val: number) => formatAxisValue(val, 'sales'),
              },
            },
            {
              seriesName: 'Quantity',
              opposite: true,
              title: { 
                text: 'Quantity (units)',
                style: { color: COLORS.textGray, fontSize: '11px' },
              },
              min: rightMin,
              max: rightMax,
              labels: {
                formatter: (val: number) => {
                  if (val < 0) return '';
                  return formatAxisValue(val, 'quantity');
                },
                style: { colors: COLORS.textGray, fontSize: '11px' },
              },
            },
            {
              seriesName: 'Profit Margin',
              opposite: true,
              show: false,
              labels: {
                formatter: (val: number) => `${val.toFixed(0)}%`,
                style: { colors: COLORS.textGray, fontSize: '11px' },
              },
            },
          ],
          legend: {
            show: true,
            position: 'top' as const,
            horizontalAlign: 'right' as const,
            markers: {
              size: 8,
              shape: 'circle' as const,
            },
          },
          annotations: hasNegativeProfit ? {
            yaxis: [{
              y: minProfit,
              y2: 0,
              fillColor: 'rgba(220, 53, 69, 0.25)',
              borderColor: 'transparent',
              label: {
                text: 'Negative',
                borderColor: 'transparent',
                style: {
                  color: '#dc3545',
                  background: 'transparent',
                  fontSize: '10px',
                },
                position: 'left' as const,
                offsetX: 40,
                offsetY: 10,
              },
            }],
          } : undefined,
        } as ApexCharts.ApexOptions,
        series: [
          {
            name: 'Profit',
            type: 'bar',
            data: subcategoryData.map((s) => s.profit),
          },
          {
            name: 'Sales',
            type: 'bar',
            data: subcategoryData.map((s) => s.sales),
          },
          {
            name: 'Quantity',
            type: 'line',
            data: subcategoryData.map((s) => s.quantity),
          },
          {
            name: 'Profit Margin',
            type: 'line',
            data: subcategoryData.map((s) => Math.round(s.profitMargin * 100) / 100),
          },
        ],
        chartType: 'line' as const,
      };
    } else {
      // Single metric mode: simple bar chart with category colors
      const metricKey = chartMode as 'profit' | 'sales' | 'quantity';
      const values = subcategoryData.map((s) => s[metricKey]);
      const colors = subcategoryData.map((s) => s.color);
      
      return {
        chartOptions: {
          ...baseOptions,
          chart: {
            ...baseOptions.chart,
            type: 'bar' as const,
          },
          colors: colors,
          yaxis: {
            title: { 
              text: metricKey === 'quantity' ? 'Quantity (units)' : `${metricKey.charAt(0).toUpperCase() + metricKey.slice(1)} ($)`,
              style: { color: COLORS.textGray, fontSize: '11px' },
            },
            min: metricKey === 'profit' && hasNegativeProfit ? minProfit : 0,
            labels: {
              formatter: (val: number) => formatAxisValue(val, metricKey),
              style: { colors: COLORS.textGray, fontSize: '11px' },
            },
          },
          legend: {
            show: false,
          },
          annotations: metricKey === 'profit' && hasNegativeProfit ? {
            yaxis: [{
              y: minProfit,
              y2: 0,
              fillColor: 'rgba(220, 53, 69, 0.25)',
              borderColor: 'transparent',
            }],
          } : undefined,
        } as ApexCharts.ApexOptions,
        series: [{
          name: metricKey.charAt(0).toUpperCase() + metricKey.slice(1),
          data: values,
        }],
        chartType: 'bar' as const,
      };
    }
  }, [subcategoryData, chartMode, hasNegativeProfit, minProfit]);
  
  const modeButtons = (
    <div className="flex gap-1 shrink-0">
      <Button
        active={chartMode === 'combo'}
        onClick={() => setChartMode('combo')}
        className="text-xs px-2 py-1"
      >
        Combo
      </Button>
      <span className="border-l border-[#e9ecef] mx-1" />
      <Button
        active={chartMode === 'profit'}
        onClick={() => setChartMode('profit')}
        className="text-xs px-2 py-1"
      >
        Profit
      </Button>
      <Button
        active={chartMode === 'quantity'}
        onClick={() => setChartMode('quantity')}
        className="text-xs px-2 py-1"
      >
        Quantity
      </Button>
      <Button
        active={chartMode === 'sales'}
        onClick={() => setChartMode('sales')}
        className="text-xs px-2 py-1"
      >
        Sales
      </Button>
    </div>
  );
  
  return (
    <Card 
      title="Subcategory Performance" 
      className="mb-6"
      headerRight={modeButtons}
    >
      <div className="h-[380px] overflow-x-auto">
        <div className="min-w-[700px] h-full">
          <Chart
            key={chartMode}
            options={chartOptions}
            series={series}
            type={chartType}
            height="100%"
          />
        </div>
      </div>
    </Card>
  );
};

export default SubcategoryCombo;
