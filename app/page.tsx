'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Scorecard from '@/components/Scorecard';
import CityChart from '@/components/CityChart';
import GeographicMap from '@/components/GeographicMap';
import SubcategoryCombo from '@/components/SubcategoryCombo';
import PerformanceCharts from '@/components/PerformanceCharts';
import DiscountAnalysis from '@/components/DiscountAnalysis';
import { DataRow, MetricType } from '@/lib/types';
import { loadCSV } from '@/lib/dataLoader';
import { filterByRegion, filterBySegment, calculateScorecard } from '@/lib/dataProcessor';

// Map filter type for drill-down
interface MapFilter {
  type: 'region' | 'state' | 'city' | 'zipcode';
  value: string;
}

export default function Dashboard() {
  const [data, setData] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('profit');
  const [mapFilter, setMapFilter] = useState<MapFilter | null>(null);
  const [chartKey, setChartKey] = useState(0);
  
  const handleRefresh = () => setChartKey(k => k + 1);

  // Auto-refresh charts when any filter changes
  useEffect(() => {
    if (!loading) {
      handleRefresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRegion, selectedSegment, selectedMetric]);

  // Load CSV data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const csvData = await loadCSV('/data/MindleStore.csv');
        setData(csvData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter data by selected region and segment
  const filteredData = useMemo(() => {
    let filtered = filterByRegion(data, selectedRegion);
    filtered = filterBySegment(filtered, selectedSegment);
    
    // Apply map drill-down filter
    if (mapFilter) {
      switch (mapFilter.type) {
        case 'region':
          filtered = filtered.filter(row => row['Region'] === mapFilter.value);
          break;
        case 'state':
          filtered = filtered.filter(row => row['State'] === mapFilter.value);
          break;
        case 'city':
          filtered = filtered.filter(row => row['City'] === mapFilter.value);
          break;
        case 'zipcode':
          filtered = filtered.filter(row => String(row['Postal Code']) === mapFilter.value);
          break;
      }
    }
    
    return filtered;
  }, [data, selectedRegion, selectedSegment, mapFilter]);
  
  // Handle map drill-down click
  const handleMapFilter = (type: 'region' | 'state' | 'city' | 'zipcode', value: string) => {
    // Toggle off if clicking same filter
    if (mapFilter?.type === type && mapFilter?.value === value) {
      setMapFilter(null);
    } else {
      setMapFilter({ type, value });
    }
  };
  
  // Clear map filter
  const clearMapFilter = () => setMapFilter(null);

  // Calculate scorecard metrics
  const scorecardData = useMemo(() => {
    return calculateScorecard(filteredData, selectedRegion, data);
  }, [filteredData, selectedRegion, data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#1470e6] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#6c757d] font-medium">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Sticky Header with Filters */}
      <Header
        selectedRegion={selectedRegion}
        selectedSegment={selectedSegment}
        selectedMetric={selectedMetric}
        onRegionChange={setSelectedRegion}
        onSegmentChange={setSelectedSegment}
        onMetricChange={setSelectedMetric}
        onRefresh={handleRefresh}
        filteredData={filteredData}
      />
      
      <div className="max-w-[1600px] mx-auto px-4 pb-6">
        {/* Row 1: Scorecard KPIs */}
        <Scorecard data={scorecardData} selectedRegion={selectedRegion} />
        
        {/* Row 2: Performance Breakdown (Bar/Pie) */}
        <div className="mb-6">
          <PerformanceCharts
            data={filteredData}
            metric={selectedMetric}
            selectedRegion={selectedRegion}
            key={`perf-${chartKey}`}
          />
        </div>
        
        {/* Row 3: City Performance + Map */}
        <div className="grid grid-cols-1 lg:grid-cols-[30fr_70fr] gap-4 mb-6">
          <CityChart data={filteredData} metric={selectedMetric} key={`city-${chartKey}`} />
          <GeographicMap
            data={filteredData}
            selectedRegion={selectedRegion}
            metric={selectedMetric}
            mapFilter={mapFilter}
            onMapFilter={handleMapFilter}
            onClearFilter={clearMapFilter}
          />
        </div>
        
        {/* Row 4: Subcategory Combo Chart */}
        <SubcategoryCombo data={filteredData} metric={selectedMetric} key={`subcat-${chartKey}`} />
        
        {/* Row 5: Discount Analysis - Smooth Combo + Avg Scatter */}
        <div className="mb-6">
          <DiscountAnalysis data={filteredData} metric={selectedMetric} key={`discount-${chartKey}`} />
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
