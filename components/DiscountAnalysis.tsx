'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { Props as ApexChartProps } from 'react-apexcharts';
import type ApexCharts from 'apexcharts';
import Card from './ui/Card';
import Button from './ui/Button';
import { DataRow, MetricType } from '@/lib/types';
import { COLORS, CATEGORY_COLORS, METRIC_LABELS, formatAxisValue, formatFullValue } from '@/lib/constants';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false }) as React.ComponentType<ApexChartProps>;

interface DiscountAnalysisProps {
  data: DataRow[];
  metric: MetricType;
}

interface DiscountBucket {
  discount: number;
  profit: number;
  sales: number;
  quantity: number;
  avgDiscount: number;
  count: number;
}

interface SubcategoryScatter {
  subcategory: string;
  category: string;
  avgDiscount: number;
  metricValue: number;
  color: string;
}

type LineChartMode = 'combo' | 'profit';

const DiscountAnalysis: React.FC<DiscountAnalysisProps> = ({ data, metric }) => {
  const [lineMode, setLineMode] = useState<LineChartMode>('profit');
  
  // Aggregate data by discount level for line chart
  const discountLineData = useMemo(() => {
    const bucketMap = new Map<number, { sales: number; profit: number; count: number; quantity: number; totalDiscount: number }>();
    
    for (const row of data) {
      const discount = Math.round(row['Discount'] * 100) / 100;
      const current = bucketMap.get(discount) || { sales: 0, profit: 0, count: 0, quantity: 0, totalDiscount: 0 };
      current.sales += row['Sales'];
      current.profit += row['Profit'];
      current.quantity += row['Quantity'];
      current.totalDiscount += row['Discount'];
      current.count += 1;
      bucketMap.set(discount, current);
    }
    
    const result: DiscountBucket[] = [];
    bucketMap.forEach((val, discount) => {
      result.push({
        discount,
        profit: val.profit,
        sales: val.sales,
        quantity: val.quantity,
        avgDiscount: val.totalDiscount / val.count,
        count: val.count,
      });
    });
    
    return result.sort((a, b) => a.discount - b.discount);
  }, [data]);
  
  // Check for negative profit values (for red area)
  const hasNegativeProfit = useMemo(() => discountLineData.some(d => d.profit < 0), [discountLineData]);
  const minProfit = useMemo(() => Math.min(0, ...discountLineData.map(d => d.profit)), [discountLineData]);
  
  // Point colors for profit mode: green if positive, red if negative
  const profitPointColors = useMemo(() => {
    return discountLineData.map(d => d.profit >= 0 ? '#28a745' : '#dc3545');
  }, [discountLineData]);
  
  // Line chart options for COMBO mode
  const comboChartOptions: ApexCharts.ApexOptions = useMemo(() => ({
    chart: {
      type: 'line',
      toolbar: { show: false },
      fontFamily: 'inherit',
      zoom: { enabled: false },
    },
    stroke: {
      curve: 'straight',
      width: [2.5, 2.5, 2.5, 2.5],
    },
    colors: ['#0b2d79', '#1470e6', '#e43fdd', '#9852d9'],
    markers: {
      size: 5,
      strokeWidth: 1,
      strokeColors: '#fff',
      hover: { size: 7 },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: discountLineData.map(d => `${(d.discount * 100).toFixed(0)}%`),
      title: {
        text: 'Discount Level',
        style: { color: COLORS.textGray, fontSize: '11px' },
      },
      labels: {
        style: { fontSize: '10px', colors: COLORS.textGray },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: [
      {
        title: { text: 'Revenue ($)', style: { color: COLORS.textGray, fontSize: '11px' } },
        labels: {
          formatter: (val: number) => formatAxisValue(val, 'sales'),
          style: { fontSize: '10px', colors: COLORS.textGray },
        },
      },
      {
        opposite: true,
        title: { text: 'Quantity', style: { color: '#6c757d', fontSize: '11px' } },
        labels: {
          formatter: (val: number) => formatAxisValue(val, 'quantity'),
          style: { fontSize: '10px', colors: '#6c757d' },
        },
      },
    ],
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
      shared: true,
      intersect: false,
      custom: function({ dataPointIndex }: { dataPointIndex: number }) {
        const item = discountLineData[dataPointIndex];
        return `<div style="background:#2c3e50;color:white;padding:10px 14px;border-radius:8px;font-size:12px;min-width:180px;">
          <div style="font-weight:600;margin-bottom:6px;font-size:13px;">Discount: ${(item.discount * 100).toFixed(0)}%</div>
          <div style="margin-bottom:4px;"><span style="color:#0b2d79;">●</span> Profit: ${formatFullValue(item.profit, 'profit')}</div>
          <div style="margin-bottom:4px;"><span style="color:#1470e6;">●</span> Sales: ${formatFullValue(item.sales, 'sales')}</div>
          <div style="margin-bottom:4px;"><span style="color:#e43fdd;">●</span> Quantity: ${item.quantity.toLocaleString()}</div>
          <div><span style="color:#9852d9;">●</span> Avg Discount: ${(item.avgDiscount * 100).toFixed(1)}%</div>
          <div style="color:rgba(255,255,255,0.7);font-size:11px;margin-top:6px;">${item.count.toLocaleString()} transactions</div>
        </div>`;
      },
    },
    annotations: hasNegativeProfit ? {
      yaxis: [{
        y: minProfit,
        y2: 0,
        fillColor: 'rgba(220, 53, 69, 0.15)',
        borderColor: 'transparent',
        label: {
          text: 'Negative Profit',
          borderColor: 'transparent',
          style: { color: '#dc3545', background: 'transparent', fontSize: '10px' },
          position: 'left' as const,
          offsetX: 50,
          offsetY: 10,
        },
      }],
    } : undefined,
  }), [discountLineData, hasNegativeProfit, minProfit]);
  
  const comboSeries = useMemo(() => [
    { name: 'Profit', data: discountLineData.map(d => d.profit) },
    { name: 'Sales', data: discountLineData.map(d => d.sales) },
    { name: 'Quantity', data: discountLineData.map(d => d.quantity), type: 'line' },
    { name: 'Avg Discount', data: discountLineData.map(d => d.avgDiscount * 100) },
  ], [discountLineData]);
  
  // Line chart options for PROFIT mode (with green/red markers)
  const profitChartOptions: ApexCharts.ApexOptions = useMemo(() => ({
    chart: {
      type: 'line',
      toolbar: { show: false },
      fontFamily: 'inherit',
      zoom: { enabled: false },
    },
    stroke: {
      curve: 'straight',
      width: 2.5,
      colors: [COLORS.officeSouth],
    },
    colors: [COLORS.officeSouth],
    markers: {
      size: 6,
      strokeWidth: 2,
      strokeColors: '#fff',
      colors: profitPointColors,
      discrete: profitPointColors.map((color, index) => ({
        seriesIndex: 0,
        dataPointIndex: index,
        fillColor: color,
        strokeColor: '#fff',
        size: 6,
      })),
      hover: { size: 8 },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: discountLineData.map(d => `${(d.discount * 100).toFixed(0)}%`),
      title: {
        text: 'Discount Level',
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
        text: 'Profit ($)',
        style: { color: COLORS.textGray, fontSize: '11px' },
      },
      labels: {
        formatter: (val: number) => formatAxisValue(val, 'profit'),
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
        const isNegative = val < 0;
        return `<div style="background:#2c3e50;color:white;padding:8px 12px;border-radius:8px;font-size:12px;">
          <div style="font-weight:600;margin-bottom:4px;">Discount: ${(item.discount * 100).toFixed(0)}%</div>
          <div style="color:${isNegative ? '#ff6b6b' : '#69db7c'};">Profit: ${formatFullValue(val, 'profit')}</div>
          <div style="color:rgba(255,255,255,0.7);font-size:11px;">${item.count.toLocaleString()} transactions</div>
        </div>`;
      },
    },
    annotations: hasNegativeProfit ? {
      yaxis: [{
        y: minProfit,
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
  }), [discountLineData, hasNegativeProfit, minProfit, profitPointColors]);
  
  const profitSeries = useMemo(() => [{
    name: 'Profit',
    data: discountLineData.map(d => d.profit),
  }], [discountLineData]);
  
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
  
  // Max discount for x-axis range
  const maxDiscount = useMemo(() => {
    const max = Math.max(...scatterData.map(s => s.avgDiscount * 100));
    return Math.ceil(max / 5) * 5 + 5; // Round up and add padding
  }, [scatterData]);
  
  // Group scatter data by category for series
  const scatterSeries = useMemo(() => {
    const categories = ['Technology', 'Office Supplies', 'Furniture'];
    return categories.map(cat => ({
      name: cat,
      data: scatterData
        .filter(s => s.category === cat)
        .map(s => ({
          x: Math.round(s.avgDiscount * 10000) / 100,
          y: Math.round(s.metricValue * 100) / 100,
          subcategory: s.subcategory,
        })),
    }));
  }, [scatterData]);
  
  // Check for negative scatter values
  const scatterHasNegative = useMemo(() => scatterData.some(s => s.metricValue < 0), [scatterData]);
  const scatterMinValue = useMemo(() => Math.min(0, ...scatterData.map(s => s.metricValue)), [scatterData]);
  
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
    dataLabels: {
      enabled: true,
      formatter: function(_val: number, opts: { seriesIndex: number; dataPointIndex: number; w: { config: { series: { data: { subcategory: string }[] }[] } } }) {
        return opts.w.config.series[opts.seriesIndex].data[opts.dataPointIndex].subcategory;
      },
      textAnchor: 'middle' as const,
      offsetY: 8,
      style: {
        fontSize: '8px',
        fontWeight: '500',
        colors: [CATEGORY_COLORS['Technology'], CATEGORY_COLORS['Office Supplies'], CATEGORY_COLORS['Furniture']],
      },
      background: { enabled: false },
    },
    xaxis: {
      min: 0,
      max: maxDiscount,
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
    annotations: scatterHasNegative ? {
      yaxis: [{
        y: scatterMinValue,
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
  }), [metric, scatterHasNegative, scatterMinValue, maxDiscount]);
  
  const lineModeButtons = (
    <div className="flex gap-1">
      <Button
        active={lineMode === 'combo'}
        onClick={() => setLineMode('combo')}
        className="text-xs px-2 py-1"
      >
        Combo
      </Button>
      <Button
        active={lineMode === 'profit'}
        onClick={() => setLineMode('profit')}
        className="text-xs px-2 py-1"
      >
        Profit
      </Button>
    </div>
  );
  
  const scatterMetricIndicator = (
    <span className="text-xs font-normal text-[#6c757d]">({METRIC_LABELS[metric]})</span>
  );
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Discount Impact" headerRight={lineModeButtons}>
        <div className="h-[320px]">
          {lineMode === 'combo' ? (
            <Chart
              key={`discount-combo-${discountLineData.length}`}
              options={comboChartOptions}
              series={comboSeries}
              type="line"
              height="100%"
            />
          ) : (
            <Chart
              key={`discount-profit-${discountLineData.length}`}
              options={profitChartOptions}
              series={profitSeries}
              type="line"
              height="100%"
            />
          )}
        </div>
      </Card>
      <Card title="Discount vs Performance" titleExtra={scatterMetricIndicator}>
        <div className="h-[320px]">
          <Chart
            key={`discount-scatter-${metric}-${scatterData.length}`}
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
