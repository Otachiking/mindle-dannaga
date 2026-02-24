// Data processing utility functions
import {
  DataRow,
  ScorecardData,
  AggregatedData,
  CityData,
  StateData,
  SubcategoryData,
  MetricType,
} from './types';
import {
  CATEGORY_COLORS,
  REGION_COLORS,
  SEGMENT_COLORS,
  SHIP_MODE_COLORS,
  getSubcategoryColor,
} from './constants';

// Filter data by region
export const filterByRegion = (data: DataRow[], region: string): DataRow[] => {
  if (region === 'all' || !region) {
    return data;
  }
  return data.filter((row) => row['Region'] === region);
};

// Filter data by segment
export const filterBySegment = (data: DataRow[], segment: string): DataRow[] => {
  if (segment === 'all' || !segment) {
    return data;
  }
  return data.filter((row) => row['Segment'] === segment);
};

// Calculate scorecard metrics
export const calculateScorecard = (
  filteredData: DataRow[],
  selectedRegion: string,
  allData: DataRow[]
): ScorecardData => {
  // Calculate totals for filtered data
  const totalSales = filteredData.reduce((sum, row) => sum + row['Sales'], 0);
  const totalQuantity = filteredData.reduce((sum, row) => sum + row['Quantity'], 0);
  const totalProfit = filteredData.reduce((sum, row) => sum + row['Profit'], 0);
  const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;
  
  // If "All" selected, no comparison needed
  if (selectedRegion === 'all') {
    return {
      totalSales,
      totalQuantity,
      totalProfit,
      profitMargin,
    };
  }
  
  // Calculate totals for all data to compare
  const allSales = allData.reduce((sum, row) => sum + row['Sales'], 0);
  const allQuantity = allData.reduce((sum, row) => sum + row['Quantity'], 0);
  const allProfit = allData.reduce((sum, row) => sum + row['Profit'], 0);
  const allMargin = allSales > 0 ? (allProfit / allSales) * 100 : 0;
  
  // Calculate percentage difference vs all
  const salesComparison = allSales > 0 ? ((totalSales / allSales) * 100) : 0;
  const quantityComparison = allQuantity > 0 ? ((totalQuantity / allQuantity) * 100) : 0;
  const profitComparison = allProfit !== 0 ? ((totalProfit / allProfit) * 100) : 0;
  const marginComparison = profitMargin - allMargin;
  
  return {
    totalSales,
    totalQuantity,
    totalProfit,
    profitMargin,
    salesComparison,
    quantityComparison,
    profitComparison,
    marginComparison,
  };
};

// Get metric value from a row based on metric type
const getMetricValue = (row: DataRow, metric: MetricType): number => {
  switch (metric) {
    case 'sales':
      return row['Sales'];
    case 'profit':
      return row['Profit'];
    case 'quantity':
      return row['Quantity'];
    case 'profitMargin':
      // Individual row margin doesn't make sense, calculate as percentage
      return row['Sales'] > 0 ? (row['Profit'] / row['Sales']) * 100 : 0;
    default:
      return row['Profit'];
  }
};

// Aggregate by category
export const aggregateByCategory = (
  data: DataRow[],
  metric: MetricType
): AggregatedData[] => {
  const categoryMap = new Map<string, { total: number; sales: number; profit: number }>();
  
  for (const row of data) {
    const category = row['Category'];
    const current = categoryMap.get(category) || { total: 0, sales: 0, profit: 0 };
    
    if (metric === 'profitMargin') {
      current.sales += row['Sales'];
      current.profit += row['Profit'];
    } else {
      current.total += getMetricValue(row, metric);
    }
    
    categoryMap.set(category, current);
  }
  
  const result: AggregatedData[] = [];
  categoryMap.forEach((value, key) => {
    result.push({
      name: key,
      value: metric === 'profitMargin' 
        ? (value.sales > 0 ? (value.profit / value.sales) * 100 : 0)
        : value.total,
      color: CATEGORY_COLORS[key] || '#6c757d',
    });
  });
  
  return result.sort((a, b) => b.value - a.value);
};

// Aggregate by segment
export const aggregateBySegment = (
  data: DataRow[],
  metric: MetricType
): AggregatedData[] => {
  const segmentMap = new Map<string, { total: number; sales: number; profit: number }>();
  
  for (const row of data) {
    const segment = row['Segment'];
    const current = segmentMap.get(segment) || { total: 0, sales: 0, profit: 0 };
    
    if (metric === 'profitMargin') {
      current.sales += row['Sales'];
      current.profit += row['Profit'];
    } else {
      current.total += getMetricValue(row, metric);
    }
    
    segmentMap.set(segment, current);
  }
  
  const result: AggregatedData[] = [];
  segmentMap.forEach((value, key) => {
    result.push({
      name: key,
      value: metric === 'profitMargin' 
        ? (value.sales > 0 ? (value.profit / value.sales) * 100 : 0)
        : value.total,
      color: SEGMENT_COLORS[key] || '#6c757d',
    });
  });
  
  return result.sort((a, b) => b.value - a.value);
};

// Aggregate by region
export const aggregateByRegion = (
  data: DataRow[],
  metric: MetricType
): AggregatedData[] => {
  const regionMap = new Map<string, { total: number; sales: number; profit: number }>();
  
  for (const row of data) {
    const region = row['Region'];
    const current = regionMap.get(region) || { total: 0, sales: 0, profit: 0 };
    
    if (metric === 'profitMargin') {
      current.sales += row['Sales'];
      current.profit += row['Profit'];
    } else {
      current.total += getMetricValue(row, metric);
    }
    
    regionMap.set(region, current);
  }
  
  const result: AggregatedData[] = [];
  regionMap.forEach((value, key) => {
    result.push({
      name: key,
      value: metric === 'profitMargin' 
        ? (value.sales > 0 ? (value.profit / value.sales) * 100 : 0)
        : value.total,
      color: REGION_COLORS[key] || '#6c757d',
    });
  });
  
  return result.sort((a, b) => b.value - a.value);
};

// Aggregate by ship mode
export const aggregateByShipMode = (
  data: DataRow[],
  metric: MetricType
): AggregatedData[] => {
  const shipModeMap = new Map<string, { total: number; sales: number; profit: number }>();
  
  for (const row of data) {
    const shipMode = row['Ship Mode'];
    const current = shipModeMap.get(shipMode) || { total: 0, sales: 0, profit: 0 };
    
    if (metric === 'profitMargin') {
      current.sales += row['Sales'];
      current.profit += row['Profit'];
    } else {
      current.total += getMetricValue(row, metric);
    }
    
    shipModeMap.set(shipMode, current);
  }
  
  const result: AggregatedData[] = [];
  shipModeMap.forEach((value, key) => {
    result.push({
      name: key,
      value: metric === 'profitMargin' 
        ? (value.sales > 0 ? (value.profit / value.sales) * 100 : 0)
        : value.total,
      color: SHIP_MODE_COLORS[key] || '#6c757d',
    });
  });
  
  return result.sort((a, b) => b.value - a.value);
};

// Aggregate by subcategory
export const aggregateBySubcategory = (data: DataRow[]): SubcategoryData[] => {
  const subcategoryMap = new Map<string, {
    category: string;
    sales: number;
    profit: number;
    quantity: number;
  }>();
  
  for (const row of data) {
    const subcategory = row['Sub-Category'];
    const current = subcategoryMap.get(subcategory) || {
      category: row['Category'],
      sales: 0,
      profit: 0,
      quantity: 0,
    };
    
    current.sales += row['Sales'];
    current.profit += row['Profit'];
    current.quantity += row['Quantity'];
    
    subcategoryMap.set(subcategory, current);
  }
  
  const result: SubcategoryData[] = [];
  subcategoryMap.forEach((value, key) => {
    result.push({
      subcategory: key,
      category: value.category,
      profit: value.profit,
      sales: value.sales,
      quantity: value.quantity,
      profitMargin: value.sales > 0 ? (value.profit / value.sales) * 100 : 0,
      color: getSubcategoryColor(key),
    });
  });
  
  // Sort by profit descending
  return result.sort((a, b) => b.profit - a.profit);
};

// Aggregate by city for top/bottom 5
export const aggregateByCity = (
  data: DataRow[],
  metric: MetricType,
  top: boolean = true,
  limit: number = 5
): CityData[] => {
  const cityMap = new Map<string, { total: number; sales: number; profit: number; state: string }>();
  
  for (const row of data) {
    const city = row['City'];
    const current = cityMap.get(city) || { total: 0, sales: 0, profit: 0, state: row['State'] };
    
    if (metric === 'profitMargin') {
      current.sales += row['Sales'];
      current.profit += row['Profit'];
    } else {
      current.total += getMetricValue(row, metric);
    }
    
    cityMap.set(city, current);
  }
  
  const result: CityData[] = [];
  cityMap.forEach((value, key) => {
    result.push({
      city: key,
      value: metric === 'profitMargin' 
        ? (value.sales > 0 ? (value.profit / value.sales) * 100 : 0)
        : value.total,
      state: value.state,
    });
  });
  
  // Sort based on top or bottom
  if (top) {
    result.sort((a, b) => b.value - a.value);
  } else {
    result.sort((a, b) => a.value - b.value);
  }
  
  return result.slice(0, limit);
};

// Aggregate by state for the map
export const aggregateByState = (data: DataRow[]): StateData[] => {
  const stateMap = new Map<string, {
    region: string;
    sales: number;
    profit: number;
    quantity: number;
  }>();
  
  for (const row of data) {
    const state = row['State'];
    const current = stateMap.get(state) || {
      region: row['Region'],
      sales: 0,
      profit: 0,
      quantity: 0,
    };
    
    current.sales += row['Sales'];
    current.profit += row['Profit'];
    current.quantity += row['Quantity'];
    
    stateMap.set(state, current);
  }
  
  const result: StateData[] = [];
  stateMap.forEach((value, key) => {
    result.push({
      state: key,
      region: value.region,
      sales: value.sales,
      profit: value.profit,
      quantity: value.quantity,
    });
  });
  
  return result;
};
