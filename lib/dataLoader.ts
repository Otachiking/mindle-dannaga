// Data loading utility using PapaParse
import Papa from 'papaparse';
import { DataRow } from './types';

interface RawCSVRow {
  'Row ID': string;
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
  'Sales': string;
  'Quantity': string;
  'Discount': string;
  'Profit': string;
}

// Parse and convert raw CSV row to typed DataRow
const parseRow = (row: RawCSVRow): DataRow | null => {
  const sales = parseFloat(row['Sales']);
  const quantity = parseInt(row['Quantity'], 10);
  const discount = parseFloat(row['Discount']);
  const profit = parseFloat(row['Profit']);
  
  // Skip rows with invalid numeric values
  if (isNaN(sales) || isNaN(quantity) || isNaN(profit)) {
    return null;
  }
  
  return {
    'Row ID': parseInt(row['Row ID'], 10),
    'Order ID': row['Order ID'],
    'Order Date': row['Order Date'],
    'Ship Date': row['Ship Date'],
    'Ship Mode': row['Ship Mode'],
    'Customer ID': row['Customer ID'],
    'Customer Name': row['Customer Name'],
    'Segment': row['Segment'],
    'Country': row['Country'],
    'City': row['City'],
    'State': row['State'],
    'Postal Code': row['Postal Code'],
    'Region': row['Region'],
    'Product ID': row['Product ID'],
    'Category': row['Category'],
    'Sub-Category': row['Sub-Category'],
    'Product Name': row['Product Name'],
    'Sales': sales,
    'Quantity': quantity,
    'Discount': discount,
    'Profit': profit,
  };
};

// Load CSV from public folder
export const loadCSV = async (path: string): Promise<DataRow[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse<RawCSVRow>(path, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedData: DataRow[] = [];
        
        for (const row of results.data) {
          const parsed = parseRow(row);
          if (parsed) {
            parsedData.push(parsed);
          }
        }
        
        console.log(`Loaded ${parsedData.length} rows from CSV`);
        resolve(parsedData);
      },
      error: (error: Error) => {
        console.error('Error parsing CSV:', error);
        reject(error);
      },
    });
  });
};

export default loadCSV;
