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

export default function Dashboard() {
  const [data, setData] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('profit');

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
    return filtered;
  }, [data, selectedRegion, selectedSegment]);

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
          />
        </div>
        
        {/* Row 3: City Performance + Map */}
        <div className="grid grid-cols-1 lg:grid-cols-[30fr_70fr] gap-4 mb-6">
          <CityChart data={filteredData} metric={selectedMetric} />
          <GeographicMap data={filteredData} selectedRegion={selectedRegion} metric={selectedMetric} />
        </div>
        
        {/* Row 4: Subcategory Combo Chart */}
        <SubcategoryCombo data={filteredData} metric={selectedMetric} />
        
        {/* Row 5: Discount Analysis */}
        <div className="mb-6">
          <DiscountAnalysis data={filteredData} metric={selectedMetric} />
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
