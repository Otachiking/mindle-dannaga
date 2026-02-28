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
  profit: number;
  sales: number;
  quantity: number;
  count: number;
}

interface SubcategoryScatter {
  subcategory: string;
  category: string;
  avgDiscount: number;
  minDiscount: number;
  maxDiscount: number;
  modeDiscount: number;
  profit: number;
  metricValue: number;
  color: string;
}

// Helper: compute mode of a number array (most frequent value)
function mode(arr: number[]): number {
  if (arr.length === 0) return 0;
  const freq = new Map<number, number>();
  let maxFreq = 0;
  let modeVal = arr[0];
  for (const val of arr) {
    const count = (freq.get(val) || 0) + 1;
    freq.set(val, count);
    if (count > maxFreq) {
      maxFreq = count;
      modeVal = val;
    }
  }
  return modeVal;
}

const DiscountAnalysis: React.FC<DiscountAnalysisProps> = ({ data, metric }) => {
  // Aggregate data by discount level for line chart
  const discountLineData = useMemo(() => {
    const bucketMap = new Map<number, { sales: number; profit: number; count: number; quantity: number }>();
    
    for (const row of data) {
      const discount = Math.round(row['Discount'] * 100) / 100;
      const current = bucketMap.get(discount) || { sales: 0, profit: 0, count: 0, quantity: 0 };
      current.sales += row['Sales'];
      current.profit += row['Profit'];
      current.quantity += row['Quantity'];
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
        count: val.count,
      });
    });
    
    return result.sort((a, b) => a.discount - b.discount);
  }, [data]);
  
  // Check for negative profit values (for red area)
  const hasNegativeProfit = useMemo(() => discountLineData.some(d => d.profit < 0), [discountLineData]);
  const minProfit = useMemo(() => Math.min(0, ...discountLineData.map(d => d.profit)), [discountLineData]);
  
  // Discrete markers: green if profit >= 0, red if negative
  const profitDiscreteMarkers = useMemo(() => {
    return discountLineData.map((d, index) => ({
      seriesIndex: 0, // Profit is first series
      dataPointIndex: index,
      fillColor: d.profit >= 0 ? '#28a745' : '#dc3545',
      strokeColor: '#fff',
      size: 6,
    }));
  }, [discountLineData]);
  
  // Smooth combo line chart: Sales, Profit, Qty (3 lines)
  // Profit: left Y-axis with green/red markers
  // Sales: left Y-axis
  // Qty: right Y-axis
  const comboChartOptions: ApexCharts.ApexOptions = useMemo(() => {
    const maxRevenue = Math.max(
      ...discountLineData.map(d => Math.max(Math.abs(d.profit), d.sales))
    );
    const maxQty = Math.max(...discountLineData.map(d => d.quantity));
    
    // Calculate aligned ranges so 0 lines match
    const leftMin = hasNegativeProfit ? Math.min(minProfit * 1.1, -50000) : -50000;
    const leftMax = maxRevenue * 1.1;
    const zeroRatio = leftMin < 0 ? Math.abs(leftMin) / (Math.abs(leftMin) + leftMax) : 0;
    const rightMax = maxQty * 1.1;
    const rightMin = zeroRatio > 0 ? -(rightMax * zeroRatio / (1 - zeroRatio)) : 0;
    
    return {
      chart: {
        type: 'line',
        toolbar: { show: false },
        fontFamily: 'inherit',
        zoom: { enabled: false },
      },
      stroke: {
        curve: 'smooth',
        width: [2.5, 2.5, 2.5],
        dashArray: [0, 0, 5],
      },
      fill: {
        opacity: [1, 0.7, 0.7],
      },
      colors: ['#0b2d79', '#1470e6', '#9852d9'],
      markers: {
        size: [6, 0, 0],
        strokeWidth: 2,
        strokeColors: '#fff',
        hover: { size: 8 },
        discrete: profitDiscreteMarkers,
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
          seriesName: 'Profit',
          title: { text: 'Revenue ($)', style: { color: COLORS.textGray, fontSize: '11px' } },
          min: leftMin,
          max: leftMax,
          labels: {
            formatter: (val: number) => formatAxisValue(val, 'sales'),
            style: { fontSize: '10px', colors: COLORS.textGray },
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
          title: { text: 'Quantity', style: { color: '#6c757d', fontSize: '11px' } },
          min: Math.min(rightMin, -5000),
          max: rightMax,
          labels: {
            formatter: (val: number) => {
              if (val < 0) return '';
              return formatAxisValue(val, 'quantity');
            },
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
          const profitColor = item.profit >= 0 ? '#69db7c' : '#ff6b6b';
          return `<div style="background:#2c3e50;color:white;padding:10px 14px;border-radius:8px;font-size:12px;min-width:180px;">
            <div style="font-weight:600;margin-bottom:6px;font-size:13px;">Discount: ${(item.discount * 100).toFixed(0)}%</div>
            <div style="margin-bottom:4px;"><span style="color:${profitColor};">●</span> Profit: ${formatFullValue(item.profit, 'profit')}</div>
            <div style="margin-bottom:4px;"><span style="color:#1470e6;">●</span> Sales: ${formatFullValue(item.sales, 'sales')}</div>
            <div style="margin-bottom:4px;"><span style="color:#9852d9;">●</span> Quantity: ${item.quantity.toLocaleString()}</div>
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
    };
  }, [discountLineData, hasNegativeProfit, minProfit, profitDiscreteMarkers]);
  
  const comboSeries = useMemo(() => [
    { name: 'Profit', data: discountLineData.map(d => d.profit), type: 'line' as const },
    { name: 'Sales', data: discountLineData.map(d => d.sales), type: 'line' as const },
    { name: 'Quantity', data: discountLineData.map(d => d.quantity), type: 'line' as const },
  ], [discountLineData]);
  
  // Scatter plot: aggregate by subcategory (Avg Discount on X)
  const scatterData = useMemo(() => {
    // Collect all discounts per subcategory
    const subcatMap = new Map<string, { category: string; sales: number; profit: number; quantity: number; discounts: number[] }>();
    
    for (const row of data) {
      const subcat = row['Sub-Category'];
      const current = subcatMap.get(subcat) || {
        category: row['Category'],
        sales: 0, profit: 0, quantity: 0, discounts: [],
      };
      current.sales += row['Sales'];
      current.profit += row['Profit'];
      current.quantity += row['Quantity'];
      current.discounts.push(row['Discount']);
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
      const avgDiscount = val.discounts.reduce((a, b) => a + b, 0) / val.discounts.length;
      const minDiscount = Math.min(...val.discounts);
      const maxDiscount = Math.max(...val.discounts);
      const modeDiscount = mode(val.discounts.map(d => Math.round(d * 100) / 100));
      
      result.push({
        subcategory: subcat,
        category: val.category,
        avgDiscount,
        minDiscount,
        maxDiscount,
        modeDiscount,
        profit: val.profit,
        metricValue: metricVal,
        color: CATEGORY_COLORS[val.category] || COLORS.textGray,
      });
    });
    
    return result;
  }, [data, metric]);
  
  const maxDiscount = useMemo(() => {
    const max = Math.max(...scatterData.map(s => s.avgDiscount * 100));
    return Math.ceil(max / 5) * 5 + 5;
  }, [scatterData]);
  
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
          profit: s.profit,
          minDiscount: s.minDiscount,
          maxDiscount: s.maxDiscount,
          modeDiscount: s.modeDiscount,
        })),
    }));
  }, [scatterData]);
  
  const scatterHasNegative = useMemo(() => scatterData.some(s => s.metricValue < 0), [scatterData]);
  const scatterMinValue = useMemo(() => Math.min(0, ...scatterData.map(s => s.metricValue)), [scatterData]);
  
  const scatterChartOptions: ApexCharts.ApexOptions = useMemo(() => ({
    chart: {
      type: 'scatter',
      toolbar: { show: false },
      fontFamily: 'inherit',
      zoom: { enabled: true, type: 'xy' },
      selection: { enabled: true },
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
      shared: false,
      intersect: true,
      fixed: {
        enabled: true,     
        position: 'topRight', 
        offsetX: 0,           
        offsetY: 0,           // adjust vertical offset
      },
      custom: function({ seriesIndex, dataPointIndex, w }: { seriesIndex: number; dataPointIndex: number; w: { config: { series: { name: string; data: { x: number; y: number; subcategory: string; profit: number; minDiscount: number; maxDiscount: number; modeDiscount: number }[] }[] } } }) {
        const point = w.config.series[seriesIndex].data[dataPointIndex];
        const cat = w.config.series[seriesIndex].name;
        const color = [CATEGORY_COLORS['Technology'], CATEGORY_COLORS['Office Supplies'], CATEGORY_COLORS['Furniture']][seriesIndex];
        const profitColor = point.profit >= 0 ? '#69db7c' : '#ff6b6b';
        return `<div style="background:#2c3e50;color:white;padding:8px 12px;border-radius:8px;font-size:12px;min-width:180px;">
          <div style="font-weight:600;margin-bottom:4px;">${point.subcategory}</div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid rgba(255,255,255,0.2);">
            <div style="width:10px;height:10px;border-radius:2px;background:${color};"></div>
            <span style="color:rgba(255,255,255,0.7);">${cat}</span>
          </div>
          <div style="margin-bottom:4px;"><span style="color:${profitColor};">●</span> Profit: ${formatFullValue(point.profit, 'profit')}</div>
          <div style="margin-top:6px;padding-top:4px;border-top:1px solid rgba(255,255,255,0.2);font-size:11px;">
            <div>Avg. Discount: ${point.x.toFixed(1)}%</div>
            <!-- <div>Min Discount: ${(point.minDiscount * 100).toFixed(0)}%</div> -->
            <div>Max Discount: ${(point.maxDiscount * 100).toFixed(0)}%</div>
            <div>Mode Discount: ${(point.modeDiscount * 100).toFixed(0)}%</div>
          </div>
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
  
  const scatterMetricIndicator = (
    <span className="text-xs font-normal text-[#6c757d]">({METRIC_LABELS[metric]})</span>
  );
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Discount Impact">
        <div className="h-[320px] overflow-x-auto">
          <div className="min-w-[500px] h-full">
            <Chart
              key={`discount-combo-${discountLineData.length}`}
              options={comboChartOptions}
              series={comboSeries}
              type="line"
              height="100%"
            />
          </div>
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
