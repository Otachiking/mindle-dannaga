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
  onRefresh?: () => void;
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
  onRefresh,
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
      <div className="px-4 md:px-6 py-3 flex items-center justify-between gap-2">
        {/* Left: Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xl md:text-2xl">📊</span>
          <div className="hidden lg:block">
            <h1 className="text-base md:text-lg font-bold text-white leading-tight">MindleStore</h1>
            <p className="text-[9px] md:text-[10px] text-white/70">Performance Dashboard</p>
          </div>
        </div>
        
        {/* Center: Filters */}
        <div className="flex items-center gap-2 justify-center flex-1 min-w-0">
          {/* Region */}
          <div className="relative">
            <select
              value={selectedRegion}
              onChange={(e) => onRegionChange(e.target.value)}
              className="appearance-none bg-white/20 backdrop-blur text-white text-xs md:text-sm pl-7 lg:pl-4 pr-6 md:pr-8 py-1.5 md:py-2 rounded-lg border border-white/30 focus:outline-none focus:border-white/60 cursor-pointer hover:bg-white/30 transition-all max-[767px]:w-10"
              title={getRegionLabel()}
            >
              {regions.map((region) => (
                <option key={region.value} value={region.value} className="text-[#2c3e50] bg-white">
                  {region.label}
                </option>
              ))}
            </select>
            {/* Globe icon for tablet & mobile */}
            <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/70 pointer-events-none lg:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg className="absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 w-3 md:w-4 h-3 md:h-4 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {/* Segment */}
          <div className="relative">
            <select
              value={selectedSegment}
              onChange={(e) => onSegmentChange(e.target.value)}
              className="appearance-none bg-white/20 backdrop-blur text-white text-xs md:text-sm pl-7 lg:pl-4 pr-6 md:pr-8 py-1.5 md:py-2 rounded-lg border border-white/30 focus:outline-none focus:border-white/60 cursor-pointer hover:bg-white/30 transition-all max-[767px]:w-10"
              title={segments.find(s => s.value === selectedSegment)?.label || 'All Segments'}
            >
              {segments.map((segment) => (
                <option key={segment.value} value={segment.value} className="text-[#2c3e50] bg-white">
                  {segment.label}
                </option>
              ))}
            </select>
            {/* Users icon for tablet & mobile */}
            <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/70 pointer-events-none lg:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <svg className="absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 w-3 md:w-4 h-3 md:h-4 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {/* Metric */}
          <div className="relative">
            <select
              value={selectedMetric}
              onChange={(e) => onMetricChange(e.target.value as MetricType)}
              className="appearance-none bg-white/20 backdrop-blur text-white text-xs md:text-sm pl-7 lg:pl-4 pr-6 md:pr-8 py-1.5 md:py-2 rounded-lg border border-white/30 focus:outline-none focus:border-white/60 cursor-pointer hover:bg-white/30 transition-all max-[767px]:w-10"
              title={getMetricLabel()}
            >
              {metrics.map((metric) => (
                <option key={metric.value} value={metric.value} className="text-[#2c3e50] bg-white">
                  {metric.label}
                </option>
              ))}
            </select>
            {/* Funnel icon for tablet & mobile */}
            <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/70 pointer-events-none lg:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <svg className="absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 w-3 md:w-4 h-3 md:h-4 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        
        {/* Right: Refresh + Export */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center gap-1.5 px-2 py-1.5 lg:px-3 lg:py-2 bg-white/20 backdrop-blur text-white rounded-lg border border-white/30 hover:bg-white/30 transition-all text-xs font-medium"
              title="Refresh all charts"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden lg:inline">Fix Chart</span>
            </button>
          )}
          
          {/* Export */}
          <div className="relative" ref={exportRef}>
          <button
            onClick={() => !exporting && setExportOpen(!exportOpen)}
            disabled={exporting}
            className={`flex items-center gap-1.5 md:gap-2 bg-white text-[#0b2d79] text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium transition-all shadow-sm ${exporting ? 'opacity-70 cursor-wait' : 'hover:bg-white/90'}`}
          >
            {exporting ? (
              <div className="w-4 h-4 border-2 border-[#0b2d79] border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
            <span className="hidden sm:inline">{exporting ? 'Exporting...' : 'Export'}</span>
            {!exporting && (
              <svg className={`w-3 h-3 hidden sm:block transition-transform ${exportOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
