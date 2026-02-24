'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MetricType, DataRow } from '@/lib/types';
import { exportToPDF, exportToExcel } from '@/lib/exportUtils';

interface HeaderProps {
  selectedRegion: string;
  selectedSegment: string;
  selectedMetric: MetricType;
  onRegionChange: (region: string) => void;
  onSegmentChange: (segment: string) => void;
  onMetricChange: (metric: MetricType) => void;
  filteredData?: DataRow[];
}

const regions = [
  { label: 'All Regions', value: 'all' },
  { label: 'West', value: 'West' },
  { label: 'East', value: 'East' },
  { label: 'Central', value: 'Central' },
  { label: 'South', value: 'South' },
];

const segments = [
  { label: 'All Segments', value: 'all' },
  { label: 'Consumer', value: 'Consumer' },
  { label: 'Corporate', value: 'Corporate' },
  { label: 'Home Office', value: 'Home Office' },
];

const metrics = [
  { label: 'Profit', value: 'profit' },
  { label: 'Sales', value: 'sales' },
  { label: 'Quantity', value: 'quantity' },
  { label: 'Profit Margin', value: 'profitMargin' },
];

const Header: React.FC<HeaderProps> = ({
  selectedRegion,
  selectedSegment,
  selectedMetric,
  onRegionChange,
  onSegmentChange,
  onMetricChange,
  filteredData = [],
}) => {
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleExportPDF = async () => {
    setExporting(true);
    setExportOpen(false);
    try {
      await exportToPDF();
    } finally {
      setExporting(false);
    }
  };
  
  const handleExportExcel = async () => {
    setExporting(true);
    setExportOpen(false);
    try {
      await exportToExcel(filteredData, selectedRegion, selectedSegment);
    } finally {
      setExporting(false);
    }
  };
  
  const getRegionLabel = () => {
    return regions.find(r => r.value === selectedRegion)?.label || 'All Regions';
  };
  
  const getMetricLabel = () => {
    return metrics.find(m => m.value === selectedMetric)?.label || 'Profit';
  };
  
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#0b2d79] to-[#1470e6] rounded-b-xl shadow-lg mb-6">
      <div className="px-6 py-3 flex items-center justify-between flex-wrap gap-3">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <span className="text-2xl">📊</span>
          <div>
            <h1 className="text-lg font-bold text-white">MindleStore</h1>
            <p className="text-[10px] text-white/70">Performance Dashboard</p>
          </div>
        </div>
        
        {/* Filters and Export */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Region Dropdown */}
          <div className="relative">
            <select
              value={selectedRegion}
              onChange={(e) => onRegionChange(e.target.value)}
              className="appearance-none bg-white/20 backdrop-blur text-white text-sm px-4 py-2 pr-8 rounded-lg border border-white/30 focus:outline-none focus:border-white/60 cursor-pointer hover:bg-white/30 transition-all"
            >
              {regions.map((region) => (
                <option key={region.value} value={region.value} className="text-[#2c3e50] bg-white">
                  {region.label}
                </option>
              ))}
            </select>
            <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {/* Segment Dropdown */}
          <div className="relative">
            <select
              value={selectedSegment}
              onChange={(e) => onSegmentChange(e.target.value)}
              className="appearance-none bg-white/20 backdrop-blur text-white text-sm px-4 py-2 pr-8 rounded-lg border border-white/30 focus:outline-none focus:border-white/60 cursor-pointer hover:bg-white/30 transition-all"
            >
              {segments.map((segment) => (
                <option key={segment.value} value={segment.value} className="text-[#2c3e50] bg-white">
                  {segment.label}
                </option>
              ))}
            </select>
            <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {/* Metric Dropdown */}
          <div className="relative">
            <select
              value={selectedMetric}
              onChange={(e) => onMetricChange(e.target.value as MetricType)}
              className="appearance-none bg-white/20 backdrop-blur text-white text-sm px-4 py-2 pr-8 rounded-lg border border-white/30 focus:outline-none focus:border-white/60 cursor-pointer hover:bg-white/30 transition-all"
            >
              {metrics.map((metric) => (
                <option key={metric.value} value={metric.value} className="text-[#2c3e50] bg-white">
                  {metric.label}
                </option>
              ))}
            </select>
            <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {/* Export Dropdown */}
          <div className="relative" ref={exportRef}>
            <button
              onClick={() => !exporting && setExportOpen(!exportOpen)}
              disabled={exporting}
              className={`flex items-center gap-2 bg-white text-[#0b2d79] text-sm px-4 py-2 rounded-lg font-medium transition-all shadow-sm ${exporting ? 'opacity-70 cursor-wait' : 'hover:bg-white/90'}`}
            >
              {exporting ? (
                <div className="w-4 h-4 border-2 border-[#0b2d79] border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              {exporting ? 'Exporting...' : 'Export'}
              {!exporting && (
                <svg className={`w-3 h-3 transition-transform ${exportOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
            
            {exportOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg border border-[#e9ecef] overflow-hidden z-50">
                <button
                  onClick={handleExportPDF}
                  className="w-full px-4 py-2 text-sm text-[#2c3e50] hover:bg-[#f8f9fa] text-left flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-[#dc3545]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
                  </svg>
                  PDF
                </button>
                <button
                  onClick={handleExportExcel}
                  className="w-full px-4 py-2 text-sm text-[#2c3e50] hover:bg-[#f8f9fa] text-left flex items-center gap-2 border-t border-[#e9ecef]"
                >
                  <svg className="w-4 h-4 text-[#28a745]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
                  </svg>
                  Excel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
