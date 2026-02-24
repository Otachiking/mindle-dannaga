// MindleStore Dashboard Color Constants and Configuration

export const COLORS = {
  // Category & Region Colors
  techWest: '#0b2d79',      // Technology & West
  officeSouth: '#1470e6',   // Office Supplies & South
  furnitureEast: '#9852d9', // Furniture & East
  central: '#e43fdd',       // Central region
  noData: '#1a1a1a',        // Black for no data
  
  // UI Colors
  bgLight: '#f8f9fa',
  textDark: '#2c3e50',
  textGray: '#6c757d',
  borderLight: '#e9ecef',
  white: '#ffffff',
  success: '#28a745',
  danger: '#dc3545',
};

// Category to color mapping
export const CATEGORY_COLORS: Record<string, string> = {
  'Technology': COLORS.techWest,
  'Office Supplies': COLORS.officeSouth,
  'Furniture': COLORS.furnitureEast,
};

// Subcategory to parent category mapping
export const SUBCATEGORY_TO_CATEGORY: Record<string, string> = {
  // Technology
  'Phones': 'Technology',
  'Copiers': 'Technology',
  'Accessories': 'Technology',
  'Machines': 'Technology',
  
  // Office Supplies
  'Paper': 'Office Supplies',
  'Binders': 'Office Supplies',
  'Art': 'Office Supplies',
  'Storage': 'Office Supplies',
  'Appliances': 'Office Supplies',
  'Labels': 'Office Supplies',
  'Fasteners': 'Office Supplies',
  'Envelopes': 'Office Supplies',
  'Supplies': 'Office Supplies',
  
  // Furniture
  'Chairs': 'Furniture',
  'Tables': 'Furniture',
  'Furnishings': 'Furniture',
  'Bookcases': 'Furniture',
};

// Get subcategory color based on parent category
export const getSubcategoryColor = (subcategory: string): string => {
  const category = SUBCATEGORY_TO_CATEGORY[subcategory];
  return CATEGORY_COLORS[category] || COLORS.textGray;
};

// Region colors
export const REGION_COLORS: Record<string, string> = {
  'West': COLORS.techWest,
  'South': COLORS.officeSouth,
  'East': COLORS.furnitureEast,
  'Central': COLORS.central,
};

// Segment colors
export const SEGMENT_COLORS: Record<string, string> = {
  'Consumer': COLORS.officeSouth,
  'Corporate': COLORS.techWest,
  'Home Office': COLORS.furnitureEast,
};

// Ship mode colors - Central is pink, no gray
export const SHIP_MODE_COLORS: Record<string, string> = {
  'Standard Class': COLORS.officeSouth,
  'Second Class': COLORS.techWest,
  'First Class': COLORS.furnitureEast,
  'Same Day': COLORS.central, // Pink instead of gray
};

// US States to Region mapping
export const STATE_TO_REGION: Record<string, string> = {
  // West
  'California': 'West',
  'Oregon': 'West',
  'Washington': 'West',
  'Nevada': 'West',
  'Arizona': 'West',
  'Utah': 'West',
  'Colorado': 'West',
  'New Mexico': 'West',
  'Wyoming': 'West',
  'Montana': 'West',
  'Idaho': 'West',
  'Alaska': 'West',
  'Hawaii': 'West',
  
  // South
  'Texas': 'South',
  'Oklahoma': 'South',
  'Louisiana': 'South',
  'Arkansas': 'South',
  'Mississippi': 'South',
  'Alabama': 'South',
  'Tennessee': 'South',
  'Kentucky': 'South',
  'Florida': 'South',
  'Georgia': 'South',
  'South Carolina': 'South',
  'North Carolina': 'South',
  'Virginia': 'South',
  'West Virginia': 'South',
  'Maryland': 'South',
  'Delaware': 'South',
  'District of Columbia': 'South',
  
  // East
  'New York': 'East',
  'Pennsylvania': 'East',
  'New Jersey': 'East',
  'Connecticut': 'East',
  'Massachusetts': 'East',
  'Rhode Island': 'East',
  'Vermont': 'East',
  'New Hampshire': 'East',
  'Maine': 'East',
  
  // Central (Midwest)
  'Ohio': 'Central',
  'Michigan': 'Central',
  'Indiana': 'Central',
  'Illinois': 'Central',
  'Wisconsin': 'Central',
  'Minnesota': 'Central',
  'Iowa': 'Central',
  'Missouri': 'Central',
  'Kansas': 'Central',
  'Nebraska': 'Central',
  'South Dakota': 'Central',
  'North Dakota': 'Central',
};

// Metric display formats
export const METRIC_LABELS: Record<string, string> = {
  'profit': 'Profit',
  'sales': 'Sales',
  'quantity': 'Quantity',
  'profitMargin': 'Profit Margin',
};

// Format values based on metric
export const formatMetricValue = (value: number, metric: string): string => {
  if (metric === 'profitMargin') {
    return `${value.toFixed(1)}%`;
  }
  if (metric === 'quantity') {
    return value.toLocaleString();
  }
  // Sales and profit - format as currency
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
};

// Format large numbers for chart axes
export const formatAxisValue = (value: number, metric: string): string => {
  if (metric === 'profitMargin') {
    return `${value.toFixed(0)}%`;
  }
  if (metric === 'quantity') {
    if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(0);
  }
  // Sales and profit - format as currency
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
};

// Format full values without abbreviation (for tooltips)
export const formatFullValue = (value: number, metric: string): string => {
  if (metric === 'profitMargin') {
    return `${value.toFixed(2)}%`;
  }
  if (metric === 'quantity') {
    return value.toLocaleString();
  }
  // Sales and profit - format as full currency
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
