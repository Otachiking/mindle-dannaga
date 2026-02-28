'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { Props as ApexChartProps } from 'react-apexcharts';
import type ApexCharts from 'apexcharts';
import Card from './ui/Card';
import { DataRow, MetricType } from '@/lib/types';
import { COLORS, CATEGORY_COLORS, METRIC_LABELS, formatAxisValue, formatFullValue } from '@/lib/constants';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false }) as React.ComponentType<ApexChartProps>;

interface Props {
  data: DataRow[];
  metric: MetricType;
}

// Colors for the 4 metrics in stacked chart
const STACKED_METRIC_COLORS = {
  quantity: '#e43fdd',    // Pink
  profit: '#0b2d79',     // Dark blue
  sales: '#1470e6',      // Medium blue
  profitMargin: '#9852d9', // Purple
};

// Helper: compute median of a number array
function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

const DiscountAnalysisStacked: React.FC<Props> = ({ data, metric }) => {
  // ──────────── LEFT CHART: 100% Stacked Line with Markers ────────────
  // Aggregate by discount level
  const discountData = useMemo(() => {
    const bucketMap = new Map<number, { sales: number; profit: number; quantity: number; count: number }>();
    
    for (const row of data) {
      const discount = Math.round(row['Discount'] * 100) / 100;
      const current = bucketMap.get(discount) || { sales: 0, profit: 0, quantity: 0, count: 0 };
      current.sales += row['Sales'];
      current.profit += row['Profit'];
      current.quantity += row['Quantity'];
      current.count += 1;
      bucketMap.set(discount, current);
    }
    
    const result: { discount: number; sales: number; profit: number; quantity: number; profitMargin: number; count: number }[] = [];
    bucketMap.forEach((val, discount) => {
      result.push({
        discount,
        sales: val.sales,
        profit: val.profit,
        quantity: val.quantity,
        profitMargin: val.sales > 0 ? (val.profit / val.sales) * 100 : 0,
        count: val.count,
      });
    });
    
    return result.sort((a, b) => a.discount - b.discount);
  }, [data]);
  
  // Convert to percentages for 100% stacked
  const stackedPercentages = useMemo(() => {
    return discountData.map(d => {
      // Use absolute values for proportional stacking (profit can be negative)
      const absProfit = Math.abs(d.profit);
      const absSales = Math.abs(d.sales);
      const absQty = d.quantity;
      const absMargin = Math.abs(d.profitMargin);
      const total = absProfit + absSales + absQty + absMargin;
      
      if (total === 0) return { quantity: 25, profit: 25, sales: 25, profitMargin: 25 };
      
      return {
        quantity: (absQty / total) * 100,
        profit: (absProfit / total) * 100,
        sales: (absSales / total) * 100,
        profitMargin: (absMargin / total) * 100,
      };
    });
  }, [discountData]);
  
  const stackedChartOptions: ApexCharts.ApexOptions = useMemo(() => ({
    chart: {
      type: 'area',
      stacked: true,
      stackType: '100%',
      toolbar: { show: false },
      fontFamily: 'inherit',
      zoom: { enabled: false },
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    colors: [
      STACKED_METRIC_COLORS.sales,
      STACKED_METRIC_COLORS.profit,
      STACKED_METRIC_COLORS.quantity,
    ],
    markers: {
      size: 4,
      strokeWidth: 1,
      strokeColors: '#fff',
      hover: { size: 6 },
    },
    fill: {
      type: 'solid',
      opacity: 0.6,
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: discountData.map(d => `${(d.discount * 100).toFixed(0)}%`),
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
      title: { text: 'Proportion (%)', style: { color: COLORS.textGray, fontSize: '11px' } },
      labels: {
        formatter: (val: number) => `${val.toFixed(0)}%`,
        style: { fontSize: '10px', colors: COLORS.textGray },
      },
      max: 100,
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
      shared: true,
      intersect: false,
      custom: function({ dataPointIndex }: { dataPointIndex: number }) {
        const item = discountData[dataPointIndex];
        const pct = stackedPercentages[dataPointIndex];
        const profitColor = item.profit >= 0 ? '#69db7c' : '#ff6b6b';
        const marginColor = item.profitMargin >= 0 ? '#69db7c' : '#ff6b6b';
        return `<div style="background:#2c3e50;color:white;padding:10px 14px;border-radius:8px;font-size:12px;min-width:200px;">
          <div style="font-weight:600;margin-bottom:6px;font-size:13px;">Discount: ${(item.discount * 100).toFixed(0)}%</div>
          <div style="margin-bottom:4px;"><span style="color:#1470e6;">●</span> Sales: ${formatFullValue(item.sales, 'sales')} <span style="color:rgba(255,255,255,0.5);">(${pct.sales.toFixed(1)}%)</span></div>
          <div style="margin-bottom:4px;"><span style="color:${profitColor};">●</span> Profit: ${formatFullValue(item.profit, 'profit')} <span style="color:rgba(255,255,255,0.5);">(${pct.profit.toFixed(1)}%)</span></div>
          <div style="margin-bottom:4px;"><span style="color:#e43fdd;">●</span> Quantity: ${item.quantity.toLocaleString()} <span style="color:rgba(255,255,255,0.5);">(${pct.quantity.toFixed(1)}%)</span></div>
          <div style="color:rgba(255,255,255,0.7);font-size:11px;margin-top:6px;">${item.count.toLocaleString()} transactions</div>
        </div>`;
      },
    },
  }), [discountData, stackedPercentages]);
  
  const stackedSeries = useMemo(() => [
    { name: 'Sales', data: stackedPercentages.map(p => p.sales) },
    { name: 'Profit', data: stackedPercentages.map(p => p.profit) },
    { name: 'Quantity', data: stackedPercentages.map(p => p.quantity) },
  ], [stackedPercentages]);
  
  // ──────────── RIGHT CHART: Scatter with MEDIAN Discount on X ────────────
  // Why Median over Mode:
  // Median gives the central tendency of each subcategory's discount distribution,
  // which is more robust than Mode (which only shows the most frequent single value,
  // often 0% for many subcategories, losing granularity).
  
  const scatterData = useMemo(() => {
    // Collect all discounts per subcategory
    const subcatDiscounts = new Map<string, { category: string; discounts: number[]; sales: number; profit: number; quantity: number }>();
    
    for (const row of data) {
      const subcat = row['Sub-Category'];
      const current = subcatDiscounts.get(subcat) || {
        category: row['Category'],
        discounts: [],
        sales: 0, profit: 0, quantity: 0,
      };
      current.discounts.push(row['Discount']);
      current.sales += row['Sales'];
      current.profit += row['Profit'];
      current.quantity += row['Quantity'];
      subcatDiscounts.set(subcat, current);
    }
    
    const result: { subcategory: string; category: string; medianDiscount: number; metricValue: number; sales: number }[] = [];
    subcatDiscounts.forEach((val, subcat) => {
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
        medianDiscount: median(val.discounts),
        metricValue: metricVal,
        sales: val.sales,
      });
    });
    
    return result;
  }, [data, metric]);
  
  const maxMedianDiscount = useMemo(() => {
    const max = Math.max(...scatterData.map(s => s.medianDiscount * 100));
    return Math.ceil(max / 5) * 5 + 5;
  }, [scatterData]);
  
  // Scale sales for bubble size (normalize to reasonable range)
  const maxSales = useMemo(() => Math.max(...scatterData.map(s => s.sales)), [scatterData]);
  
  const scatterSeries = useMemo(() => {
    const categories = ['Technology', 'Office Supplies', 'Furniture'];
    return categories.map(cat => ({
      name: cat,
      data: scatterData
        .filter(s => s.category === cat)
        .map(s => ({
          x: Math.round(s.metricValue * 100) / 100,
          y: Math.round(s.medianDiscount * 10000) / 100,
          z: Math.round((s.sales / maxSales) * 50) + 5, // Scale to 5-55 range for bubble size
          subcategory: s.subcategory,
          salesValue: s.sales,
        })),
    }));
  }, [scatterData, maxSales]);
  
  const scatterHasNegative = useMemo(() => scatterData.some(s => s.metricValue < 0), [scatterData]);
  const scatterMinValue = useMemo(() => Math.min(0, ...scatterData.map(s => s.metricValue)), [scatterData]);
  
  const scatterChartOptions: ApexCharts.ApexOptions = useMemo(() => ({
    chart: {
      type: 'bubble',
      toolbar: {
        show: true,
        tools: {
          download: false,
          selection: false,
          zoom: false,
          zoomin: true,
          zoomout: true,
          pan: false,
          reset: true,
        },
      },
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
      title: {
        text: METRIC_LABELS[metric],
        style: { color: COLORS.textGray, fontSize: '11px' },
      },
      labels: {
        formatter: (val: string) => formatAxisValue(Number(val), metric),
        style: { fontSize: '10px', colors: COLORS.textGray },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      max: maxMedianDiscount,
      title: {
        text: 'Median Discount (%)',
        style: { color: COLORS.textGray, fontSize: '11px' },
      },
      labels: {
        formatter: (val: number) => `${val.toFixed(0)}%`,
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
      shared: false,
      intersect: true,
      custom: function({ seriesIndex, dataPointIndex, w }: { seriesIndex: number; dataPointIndex: number; w: { config: { series: { name: string; data: { x: number; y: number; subcategory: string; salesValue: number }[] }[] } } }) {
        const point = w.config.series[seriesIndex].data[dataPointIndex];
        const cat = w.config.series[seriesIndex].name;
        const color = [CATEGORY_COLORS['Technology'], CATEGORY_COLORS['Office Supplies'], CATEGORY_COLORS['Furniture']][seriesIndex];
        return `<div style="background:#2c3e50;color:white;padding:8px 12px;border-radius:8px;font-size:12px;min-width:160px;">
          <div style="font-weight:600;margin-bottom:4px;">${point.subcategory}</div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid rgba(255,255,255,0.2);">
            <div style="width:10px;height:10px;border-radius:2px;background:${color};"></div>
            <span style="color:rgba(255,255,255,0.7);">${cat}</span>
          </div>
          <div>${METRIC_LABELS[metric]}: ${formatFullValue(point.x, metric)}</div>
          <div>Median Discount: ${point.y.toFixed(1)}%</div>
          <div>Total Sales: ${formatFullValue(point.salesValue, 'sales')}</div>
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
  }), [metric, scatterHasNegative, scatterMinValue, maxMedianDiscount]);
  
  const scatterMetricIndicator = (
    <span className="text-xs font-normal text-[#6c757d]">({METRIC_LABELS[metric]})</span>
  );
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Discount Proportion" titleExtra={<span className="text-xs font-normal text-[#6c757d]">(100% Stacked)</span>}>
        <div className="h-[320px]">
          <Chart
            key={`discount-stacked-${discountData.length}`}
            options={stackedChartOptions}
            series={stackedSeries}
            type="area"
            height="100%"
          />
        </div>
      </Card>
      <Card title="Median Discount vs Performance" titleExtra={scatterMetricIndicator}>
        <div className="h-[320px]">
          <Chart
            key={`discount-median-scatter-${metric}-${scatterData.length}`}
            options={scatterChartOptions}
            series={scatterSeries}
            type="bubble"
            height="100%"
          />
        </div>
      </Card>
    </div>
  );
};

export default DiscountAnalysisStacked;
