// TypeScript interfaces for MindleStore Dashboard

// Raw data row from CSV
export interface DataRow {
  'Row ID': number;
  'Order ID': string;
  'Order Date': string;
  'Ship Date': string;
  'Ship Mode': string;
  'Customer ID': string;
  'Customer Name': string;
  'Segment': string;
  'Country': string;
  'City': string;
  'State': string;
  'Postal Code': string;
  'Region': string;
  'Product ID': string;
  'Category': string;
  'Sub-Category': string;
  'Product Name': string;
  'Sales': number;
  'Quantity': number;
  'Discount': number;
  'Profit': number;
}

// Filter state
export interface FilterState {
  selectedRegion: string;
  selectedMetric: MetricType;
}

// Metric types
export type MetricType = 'profit' | 'sales' | 'quantity' | 'profitMargin';

// Region types
export type RegionType = 'all' | 'West' | 'East' | 'North' | 'South';

// Scorecard data
export interface ScorecardData {
  totalSales: number;
  totalQuantity: number;
  totalProfit: number;
  profitMargin: number;
  
  // Comparison vs All (when specific region selected)
  salesComparison?: number;
  quantityComparison?: number;
  profitComparison?: number;
  marginComparison?: number;
}

// Aggregated data for charts
export interface AggregatedData {
  name: string;
  value: number;
  color?: string;
}

// City performance data
export interface CityData {
  city: string;
  value: number;
  state: string;
}

// State map data
export interface StateData {
  state: string;
  region: string;
  sales: number;
  profit: number;
  quantity: number;
}

// Subcategory combo chart data
export interface SubcategoryData {
  subcategory: string;
  category: string;
  profit: number;
  sales: number;
  quantity: number;
  profitMargin: number;
  color: string;
}

// Performance chart data
export interface PerformanceData {
  category: AggregatedData[];
  segment: AggregatedData[];
  region: AggregatedData[];
  shipMode: AggregatedData[];
}

// Chart toggle state for city chart
export type CityChartMode = 'top5' | 'bottom5';

// Chart toggle state for subcategory combo
export type ComboChartMode = 'combo' | 'profit' | 'sales';

// Map toggle state
export type MapMetricType = 'profit' | 'sales' | 'quantity' | 'profitMargin';
