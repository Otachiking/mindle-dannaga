import { DataRow } from './types';
import { formatMetricValue } from './constants';
import {
  calculateScorecard,
  aggregateByState,
  aggregateBySubcategory,
  aggregateByCategory,
  aggregateBySegment,
  aggregateByRegion,
  aggregateByShipMode,
} from './dataProcessor';

// Excel Export
export const exportToExcel = async (data: DataRow[], selectedRegion: string, selectedSegment: string) => {
  const { utils, writeFile } = await import('xlsx');
  
  // Create workbook
  const workbook = utils.book_new();
  
  // Summary Sheet
  const scorecard = calculateScorecard(data, selectedRegion, data);
  const summaryData = [
    ['MindleStore Dashboard Export'],
    [`Generated: ${new Date().toLocaleString()}`],
    [`Region Filter: ${selectedRegion === 'all' ? 'All Regions' : selectedRegion}`],
    [`Segment Filter: ${selectedSegment === 'all' ? 'All Segments' : selectedSegment}`],
    [],
    ['Summary'],
    ['Metric', 'Value'],
    ['Total Sales', formatMetricValue(scorecard.totalSales, 'sales')],
    ['Total Profit', formatMetricValue(scorecard.totalProfit, 'profit')],
    ['Total Quantity', formatMetricValue(scorecard.totalQuantity, 'quantity')],
    ['Profit Margin', formatMetricValue(scorecard.profitMargin, 'profitMargin')],
  ];
  const summarySheet = utils.aoa_to_sheet(summaryData);
  utils.book_append_sheet(workbook, summarySheet, 'Summary');
  
  // Raw Data Sheet
  const rawHeaders = ['Order ID', 'Ship Mode', 'Segment', 'Country', 'City', 'State', 'Region', 'Category', 'Sub-Category', 'Sales', 'Quantity', 'Discount', 'Profit'];
  const rawRows = data.map(row => [
    row['Order ID'],
    row['Ship Mode'],
    row['Segment'],
    row['Country'],
    row['City'],
    row['State'],
    row['Region'],
    row['Category'],
    row['Sub-Category'],
    row['Sales'],
    row['Quantity'],
    row['Discount'],
    row['Profit'],
  ]);
  const rawSheet = utils.aoa_to_sheet([rawHeaders, ...rawRows]);
  utils.book_append_sheet(workbook, rawSheet, 'Raw Data');
  
  // State Performance Sheet
  const stateData = aggregateByState(data);
  const stateHeaders = ['State', 'Region', 'Profit', 'Sales', 'Quantity'];
  const stateRows = stateData.map(s => [s.state, s.region, s.profit, s.sales, s.quantity]);
  const stateSheet = utils.aoa_to_sheet([stateHeaders, ...stateRows]);
  utils.book_append_sheet(workbook, stateSheet, 'State Performance');
  
  // Subcategory Performance Sheet
  const subcatData = aggregateBySubcategory(data);
  const subcatHeaders = ['Sub-Category', 'Category', 'Profit', 'Sales', 'Quantity'];
  const subcatRows = subcatData.map(s => [s.subcategory, s.category, s.profit, s.sales, s.quantity]);
  const subcatSheet = utils.aoa_to_sheet([subcatHeaders, ...subcatRows]);
  utils.book_append_sheet(workbook, subcatSheet, 'Subcategory Performance');
  
  // Category Performance Sheet
  const catData = aggregateByCategory(data, 'profit');
  const catHeaders = ['Category', 'Value'];
  const catRows = catData.map(c => [c.name, c.value]);
  const catSheet = utils.aoa_to_sheet([catHeaders, ...catRows]);
  utils.book_append_sheet(workbook, catSheet, 'Category Performance');
  
  // Segment Performance Sheet
  const segData = aggregateBySegment(data, 'profit');
  const segHeaders = ['Segment', 'Value'];
  const segRows = segData.map(s => [s.name, s.value]);
  const segSheet = utils.aoa_to_sheet([segHeaders, ...segRows]);
  utils.book_append_sheet(workbook, segSheet, 'Segment Performance');
  
  // Region Performance Sheet
  const regData = aggregateByRegion(data, 'profit');
  const regHeaders = ['Region', 'Value'];
  const regRows = regData.map(r => [r.name, r.value]);
  const regSheet = utils.aoa_to_sheet([regHeaders, ...regRows]);
  utils.book_append_sheet(workbook, regSheet, 'Region Performance');
  
  // Ship Mode Performance Sheet
  const shipData = aggregateByShipMode(data, 'profit');
  const shipHeaders = ['Ship Mode', 'Value'];
  const shipRows = shipData.map(s => [s.name, s.value]);
  const shipSheet = utils.aoa_to_sheet([shipHeaders, ...shipRows]);
  utils.book_append_sheet(workbook, shipSheet, 'Ship Mode Performance');
  
  // Generate and download
  const fileName = `MindleStore_Dashboard_${new Date().toISOString().slice(0, 10)}.xlsx`;
  writeFile(workbook, fileName);
};

// PDF Export - captures the dashboard as screenshot
export const exportToPDF = async () => {
  const { default: jsPDF } = await import('jspdf');
  const { default: html2canvas } = await import('html2canvas');
  
  // Get the dashboard content (excluding header for cleaner PDF)
  const dashboardContent = document.querySelector('.max-w-\\[1600px\\]');
  
  if (!dashboardContent) {
    alert('Could not find dashboard content');
    return;
  }
  
  // Show loading state
  const loadingDiv = document.createElement('div');
  loadingDiv.innerHTML = `
    <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999;">
      <div style="background: white; padding: 20px 40px; border-radius: 8px; font-family: sans-serif;">
        <p style="margin: 0; font-size: 16px;">Generating PDF...</p>
      </div>
    </div>
  `;
  document.body.appendChild(loadingDiv);
  
  try {
    // Capture the dashboard
    const canvas = await html2canvas(dashboardContent as HTMLElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#f8f9fa',
    });
    
    const imgData = canvas.toDataURL('image/png');
    
    // Calculate PDF dimensions (A4 landscape)
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Calculate image dimensions to fit page
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min((pageWidth - 20) / imgWidth, (pageHeight - 30) / imgHeight);
    const scaledWidth = imgWidth * ratio;
    const scaledHeight = imgHeight * ratio;
    
    // Add title
    pdf.setFontSize(16);
    pdf.setTextColor(11, 45, 121); // #0b2d79
    pdf.text('MindleStore Performance Dashboard', 10, 12);
    
    pdf.setFontSize(8);
    pdf.setTextColor(108, 117, 125); // #6c757d
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 10, 17);
    
    // Add the dashboard image
    const xOffset = (pageWidth - scaledWidth) / 2;
    pdf.addImage(imgData, 'PNG', xOffset, 20, scaledWidth, scaledHeight);
    
    // Add footer
    pdf.setFontSize(8);
    pdf.setTextColor(108, 117, 125);
    pdf.text('Copyright © 2026 - Mindle Data Analyst Competition - Created by Dan Naga', pageWidth / 2, pageHeight - 5, { align: 'center' });
    
    // Save the PDF
    const fileName = `MindleStore_Dashboard_${new Date().toISOString().slice(0, 10)}.pdf`;
    pdf.save(fileName);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try again.');
  } finally {
    document.body.removeChild(loadingDiv);
  }
};
