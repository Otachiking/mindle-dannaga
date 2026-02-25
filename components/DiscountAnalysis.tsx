'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { Props as ApexChartProps } from 'react-apexcharts';
import type ApexCharts from 'apexcharts';
import Card from './ui/Card';
import { DataRow, MetricType } from '@/lib/types';
import { COLORS, CATEGORY_COLORS, METRIC_LABELS, formatAxisValue, formatFullValue } from '@/lib/constants';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false }) as React.ComponentType<ApexChartProps>;

interface DiscountAnalysisProps {
  data: DataRow[];
  metric: MetricType;
}

interface DiscountBucket {
  discount: number;
  value: number;
  count: number;
}

interface SubcategoryScatter {
  subcategory: string;
  category: string;
  avgDiscount: number;
  metricValue: number;
  color: string;
}

const DiscountAnalysis: React.FC<DiscountAnalysisProps> = ({ data, metric }) => {
  // Aggregate data by discount level for line chart
  const discountLineData = useMemo(() => {
    const bucketMap = new Map<number, { total: number; sales: number; profit: number; count: number; quantity: number }>();
    
    for (const row of data) {
      const discount = Math.round(row['Discount'] * 100) / 100; // round to 2 decimal
      const current = bucketMap.get(discount) || { total: 0, sales: 0, profit: 0, count: 0, quantity: 0 };
      current.sales += row['Sales'];
      current.profit += row['Profit'];
      current.quantity += row['Quantity'];
      current.count += 1;
      bucketMap.set(discount, current);
    }
    
    const result: DiscountBucket[] = [];
    bucketMap.forEach((val, discount) => {
      let metricVal: number;
      switch (metric) {
        case 'sales': metricVal = val.sales; break;
        case 'quantity': metricVal = val.quantity; break;
        case 'profitMargin': metricVal = val.sales > 0 ? (val.profit / val.sales) * 100 : 0; break;
        default: metricVal = val.profit;
      }
      result.push({ discount, value: metricVal, count: val.count });
    });
    
    return result.sort((a, b) => a.discount - b.discount);
  }, [data, metric]);
  
  // Check for negative values
  const hasNegative = useMemo(() => discountLineData.some(d => d.value < 0), [discountLineData]);
  const minValue = useMemo(() => Math.min(0, ...discountLineData.map(d => d.value)), [discountLineData]);
  
  // Line chart options
  const lineChartOptions: ApexCharts.ApexOptions = useMemo(() => ({
    chart: {
      type: 'area',
      toolbar: { show: false },
      fontFamily: 'inherit',
      zoom: { enabled: false },
    },
    stroke: {
      curve: 'smooth',
      width: 2.5,
      colors: [COLORS.officeSouth],
    },
    fill: {
      type: 'solid',
      opacity: 0,
    },
    colors: [COLORS.officeSouth],
    dataLabels: { enabled: false },
    xaxis: {
      categories: discountLineData.map(d => `${(d.discount * 100).toFixed(0)}%`),
      title: {
        text: 'Discount',
        style: { color: COLORS.textGray, fontSize: '11px' },
      },
      labels: {
        style: { fontSize: '10px', colors: COLORS.textGray },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      title: {
        text: METRIC_LABELS[metric],
        style: { color: COLORS.textGray, fontSize: '11px' },
      },
      labels: {
        formatter: (val: number) => formatAxisValue(val, metric),
        style: { fontSize: '10px', colors: COLORS.textGray },
      },
    },
    grid: {
      borderColor: COLORS.borderLight,
      strokeDashArray: 4,
    },
    tooltip: {
      shared: true,
      intersect: false,
      custom: function({ series, dataPointIndex }: { series: number[][]; dataPointIndex: number }) {
        const item = discountLineData[dataPointIndex];
        const val = series[0][dataPointIndex];
        return `<div style="background:#2c3e50;color:white;padding:8px 12px;border-radius:8px;font-size:12px;">
          <div style="font-weight:600;margin-bottom:4px;">Discount: ${(item.discount * 100).toFixed(0)}%</div>
          <div>${METRIC_LABELS[metric]}: ${formatFullValue(val, metric)}</div>
          <div style="color:rgba(255,255,255,0.7);font-size:11px;">${item.count.toLocaleString()} transactions</div>
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
          style: { color: '#dc3545', background: 'transparent', fontSize: '10px' },
          position: 'left' as const,
          offsetX: 40,
          offsetY: 10,
        },
      }],
    } : undefined,
  }), [discountLineData, metric, hasNegative, minValue]);
  
  const lineSeries = useMemo(() => [{
    name: METRIC_LABELS[metric],
    data: discountLineData.map(d => d.value),
  }], [discountLineData, metric]);
  
  // Scatter plot: aggregate by subcategory
  const scatterData = useMemo(() => {
    const subcatMap = new Map<string, { category: string; sales: number; profit: number; quantity: number; totalDiscount: number; count: number }>();
    
    for (const row of data) {
      const subcat = row['Sub-Category'];
      const current = subcatMap.get(subcat) || {
        category: row['Category'],
        sales: 0, profit: 0, quantity: 0, totalDiscount: 0, count: 0,
      };
      current.sales += row['Sales'];
      current.profit += row['Profit'];
      current.quantity += row['Quantity'];
      current.totalDiscount += row['Discount'];
      current.count += 1;
      subcatMap.set(subcat, current);
    }
    
    const result: SubcategoryScatter[] = [];
    subcatMap.forEach((val, subcat) => {
      let metricVal: number;
      switch (metric) {
        case 'sales': metricVal = val.sales; break;
        case 'quantity': metricVal = val.quantity; break;
        case 'profitMargin': metricVal = val.sales > 0 ? (val.profit / val.sales) * 100 : 0; break;
        default: metricVal = val.profit;
      }
      result.push({
        subcategory: subcat,
        category: val.category,
        avgDiscount: val.totalDiscount / val.count,
        metricValue: metricVal,
        color: CATEGORY_COLORS[val.category] || COLORS.textGray,
      });
    });
    
    return result;
  }, [data, metric]);
  
  // Group scatter data by category for series
  const scatterSeries = useMemo(() => {
    const categories = ['Technology', 'Office Supplies', 'Furniture'];
    return categories.map(cat => ({
      name: cat,
      data: scatterData
        .filter(s => s.category === cat)
        .map(s => ({
          x: Math.round(s.avgDiscount * 10000) / 100, // as percentage
          y: Math.round(s.metricValue * 100) / 100,
          subcategory: s.subcategory,
        })),
    }));
  }, [scatterData]);
  
  const scatterChartOptions: ApexCharts.ApexOptions = useMemo(() => ({
    chart: {
      type: 'scatter',
      toolbar: { show: false },
      fontFamily: 'inherit',
      zoom: { enabled: false },
    },
    colors: [CATEGORY_COLORS['Technology'], CATEGORY_COLORS['Office Supplies'], CATEGORY_COLORS['Furniture']],
    markers: {
      size: 8,
      strokeWidth: 1,
      strokeColors: '#fff',
    },
    xaxis: {
      title: {
        text: 'Avg. Discount (%)',
        style: { color: COLORS.textGray, fontSize: '11px' },
      },
      labels: {
        formatter: (val: string) => `${Number(val).toFixed(0)}%`,
        style: { fontSize: '10px', colors: COLORS.textGray },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tickAmount: 6,
    },
    yaxis: {
      title: {
        text: METRIC_LABELS[metric],
        style: { color: COLORS.textGray, fontSize: '11px' },
      },
      labels: {
        formatter: (val: number) => formatAxisValue(val, metric),
        style: { fontSize: '10px', colors: COLORS.textGray },
      },
    },
    grid: {
      borderColor: COLORS.borderLight,
      strokeDashArray: 4,
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '10px',
      labels: { colors: COLORS.textGray },
      markers: { size: 6 },
    },
    tooltip: {
      custom: function({ seriesIndex, dataPointIndex, w }: { seriesIndex: number; dataPointIndex: number; w: { config: { series: { name: string; data: { x: number; y: number; subcategory: string }[] }[] } } }) {
        const point = w.config.series[seriesIndex].data[dataPointIndex];
        const cat = w.config.series[seriesIndex].name;
        const color = [CATEGORY_COLORS['Technology'], CATEGORY_COLORS['Office Supplies'], CATEGORY_COLORS['Furniture']][seriesIndex];
        return `<div style="background:#2c3e50;color:white;padding:8px 12px;border-radius:8px;font-size:12px;min-width:160px;">
          <div style="font-weight:600;margin-bottom:4px;">${point.subcategory}</div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid rgba(255,255,255,0.2);">
            <div style="width:10px;height:10px;border-radius:2px;background:${color};"></div>
            <span style="color:rgba(255,255,255,0.7);">${cat}</span>
          </div>
          <div>Avg. Discount: ${point.x.toFixed(1)}%</div>
          <div>${METRIC_LABELS[metric]}: ${formatFullValue(point.y, metric)}</div>
        </div>`;
      },
    },
  }), [metric]);
  
  const lineMetricIndicator = (
    <span className="text-xs font-normal text-[#6c757d]">({METRIC_LABELS[metric]})</span>
  );
  
  const scatterMetricIndicator = (
    <span className="text-xs font-normal text-[#6c757d]">({METRIC_LABELS[metric]})</span>
  );
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Discount Impact" titleExtra={lineMetricIndicator}>
        <div className="h-[320px]">
          <Chart
            key={`discount-line-${metric}`}
            options={lineChartOptions}
            series={lineSeries}
            type="area"
            height="100%"
          />
        </div>
      </Card>
      <Card title="Discount vs Performance" titleExtra={scatterMetricIndicator}>
        <div className="h-[320px]">
          <Chart
            key={`discount-scatter-${metric}`}
            options={scatterChartOptions}
            series={scatterSeries}
            type="scatter"
            height="100%"
          />
        </div>
      </Card>
    </div>
  );
};

export default DiscountAnalysis;
