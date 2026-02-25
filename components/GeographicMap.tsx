'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import Card from './ui/Card';
import Button from './ui/Button';
import { DataRow, MetricType, MapMetricType } from '@/lib/types';
import { aggregateByState } from '@/lib/dataProcessor';
import { REGION_COLORS, formatMetricValue, STATE_TO_REGION } from '@/lib/constants';

const geoUrl = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

interface GeographicMapProps {
  data: DataRow[];
  selectedRegion: string;
  metric: MetricType;
}

type MapViewMode = 'value' | 'region';

const GeographicMap: React.FC<GeographicMapProps> = ({ data, selectedRegion, metric }) => {
  const [mapMetric, setMapMetric] = useState<MapMetricType>('profit');
  const [viewMode, setViewMode] = useState<MapViewMode>('value');
  const [tooltipContent, setTooltipContent] = useState<string>('');
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([-96, 38]);
  
  const stateData = useMemo(() => {
    const aggregated = aggregateByState(data);
    const stateMap = new Map(aggregated.map((s) => [s.state, s]));
    return stateMap;
  }, [data]);
  
  // Calculate min/max values for color scale
  const { minValue, maxValue } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    
    stateData.forEach((state) => {
      let value: number;
      if (mapMetric === 'profitMargin') {
        value = state.sales > 0 ? (state.profit / state.sales) * 100 : 0;
      } else {
        value = mapMetric === 'profit' ? state.profit : 
                     mapMetric === 'sales' ? state.sales : state.quantity;
      }
      if (value < min) min = value;
      if (value > max) max = value;
    });
    
    return { minValue: min === Infinity ? 0 : min, maxValue: max === -Infinity ? 0 : max };
  }, [stateData, mapMetric]);
  
  // 3-color scale: Blue (high) -> White (zero) -> Pink (low/negative)
  const getValueColor = (stateName: string): { color: string; opacity: number } => {
    const state = stateData.get(stateName);
    if (!state) return { color: '#1a1a1a', opacity: 0.3 }; // Black with low opacity for no data
    
    let value: number;
    if (mapMetric === 'profitMargin') {
      value = state.sales > 0 ? (state.profit / state.sales) * 100 : 0;
    } else {
      value = mapMetric === 'profit' ? state.profit : 
                   mapMetric === 'sales' ? state.sales : state.quantity;
    }
    
    // If all values are the same or zero range, return white
    if (maxValue === minValue) return { color: '#ffffff', opacity: 1 };
    
    if (value >= 0) {
      // Positive: White to Blue (#0b2d79)
      const ratio = maxValue > 0 ? value / maxValue : 0;
      const r = Math.round(255 - (255 - 11) * ratio);
      const g = Math.round(255 - (255 - 45) * ratio);
      const b = Math.round(255 - (255 - 121) * ratio);
      return { color: `rgb(${r}, ${g}, ${b})`, opacity: 1 };
    } else {
      // Negative: White to Pink (#e43fdd)
      const ratio = minValue < 0 ? Math.abs(value) / Math.abs(minValue) : 0;
      const r = Math.round(255 - (255 - 228) * ratio);
      const g = Math.round(255 - (255 - 63) * ratio);
      const b = Math.round(255 - (255 - 221) * ratio);
      return { color: `rgb(${r}, ${g}, ${b})`, opacity: 1 };
    }
  };
  
  const getRegionColor = (stateName: string): { color: string; opacity: number } => {
    const region = STATE_TO_REGION[stateName];
    if (!region) return { color: '#1a1a1a', opacity: 0.3 };
    
    // If a specific region is selected, dim other regions
    if (selectedRegion !== 'all' && region !== selectedRegion) {
      return { color: '#e9ecef', opacity: 1 };
    }
    
    return { color: REGION_COLORS[region] || '#1a1a1a', opacity: 1 };
  };
  
  const getStateColorAndOpacity = (stateName: string): { color: string; opacity: number } => {
    return viewMode === 'value' ? getValueColor(stateName) : getRegionColor(stateName);
  };
  
  const getStateMetricValue = (stateName: string): string => {
    const state = stateData.get(stateName);
    if (!state) return 'No data';
    
    switch (mapMetric) {
      case 'sales':
        return formatMetricValue(state.sales, 'sales');
      case 'profit':
        return formatMetricValue(state.profit, 'profit');
      case 'quantity':
        return formatMetricValue(state.quantity, 'quantity');
      case 'profitMargin':
        const margin = state.sales > 0 ? (state.profit / state.sales) * 100 : 0;
        return formatMetricValue(margin, 'profitMargin');
      default:
        return 'No data';
    }
  };
  
  const handleMouseEnter = (
    geo: { properties: { name: string } },
    event: React.MouseEvent
  ) => {
    const stateName = geo.properties.name;
    const region = STATE_TO_REGION[stateName] || 'Unknown';
    const value = getStateMetricValue(stateName);
    const metricLabel = mapMetric === 'profitMargin' ? 'Margin' : mapMetric.charAt(0).toUpperCase() + mapMetric.slice(1);
    setTooltipContent(`${stateName} (${region})\n${metricLabel}: ${value}`);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };
  
  const handleMouseLeave = () => {
    setTooltipContent('');
    setTooltipPosition(null);
  };
  
  const handleZoomIn = () => {
    if (zoom < 4) setZoom(zoom * 1.5);
  };
  
  const handleZoomOut = () => {
    if (zoom > 1) setZoom(zoom / 1.5);
  };
  
  const handleReset = () => {
    setZoom(1);
    setCenter([-96, 38]);
  };
  
  const handleMoveEnd = useCallback((position: { coordinates: [number, number]; zoom: number }) => {
    setCenter(position.coordinates);
    setZoom(position.zoom);
  }, []);
  
  const metricButtons = (
    <div className="flex gap-1 flex-wrap">
      <Button
        active={mapMetric === 'profit'}
        onClick={() => setMapMetric('profit')}
        className="text-xs px-2 py-1"
      >
        Profit
      </Button>
      <Button
        active={mapMetric === 'sales'}
        onClick={() => setMapMetric('sales')}
        className="text-xs px-2 py-1"
      >
        Sales
      </Button>
      <Button
        active={mapMetric === 'quantity'}
        onClick={() => setMapMetric('quantity')}
        className="text-xs px-2 py-1"
      >
        Qty
      </Button>
      <Button
        active={mapMetric === 'profitMargin'}
        onClick={() => setMapMetric('profitMargin')}
        className="text-xs px-2 py-1"
      >
        Margin
      </Button>
    </div>
  );
  
  return (
    <Card title="Geographic Distribution" headerRight={metricButtons}>
      <div className="relative h-[400px]">
        {/* Color By Dropdown - Top Left */}
        <div className="absolute top-2 left-2 z-10">
          <div className="bg-white/95 border border-[#e9ecef] rounded-lg shadow-sm px-2.5 py-1.5 flex items-center gap-1.5">
            <span className="text-[10px] text-[#6c757d]">Color by:</span>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as MapViewMode)}
              className="appearance-none bg-transparent text-xs font-medium text-[#2c3e50] pr-4 cursor-pointer focus:outline-none"
            >
              <option value="value">Value</option>
              <option value="region">Region</option>
            </select>
            <svg className="w-3 h-3 text-[#6c757d] pointer-events-none -ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        
        {/* Zoom Controls - Top Right */}
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 bg-white border border-[#e9ecef] rounded-lg shadow-sm flex items-center justify-center hover:bg-[#f8f9fa] transition-colors"
            title="Zoom In"
          >
            <svg className="w-4 h-4 text-[#2c3e50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 bg-white border border-[#e9ecef] rounded-lg shadow-sm flex items-center justify-center hover:bg-[#f8f9fa] transition-colors"
            title="Zoom Out"
          >
            <svg className="w-4 h-4 text-[#2c3e50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <button
            onClick={handleReset}
            className="w-8 h-8 bg-white border border-[#e9ecef] rounded-lg shadow-sm flex items-center justify-center hover:bg-[#f8f9fa] transition-colors"
            title="Reset"
          >
            <svg className="w-4 h-4 text-[#2c3e50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        
        <ComposableMap
          projection="geoAlbersUsa"
          style={{ width: '100%', height: '100%' }}
        >
          <ZoomableGroup
            center={center}
            zoom={zoom}
            onMoveEnd={handleMoveEnd}
            minZoom={1}
            maxZoom={4}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const { color, opacity } = getStateColorAndOpacity(geo.properties.name);
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={color}
                      stroke="#ffffff"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: 'none', opacity },
                        hover: { outline: 'none', opacity: Math.max(0.6, opacity - 0.2), cursor: 'pointer' },
                        pressed: { outline: 'none', opacity: 0.5 },
                      }}
                      onMouseEnter={(event) => handleMouseEnter(geo, event as unknown as React.MouseEvent)}
                      onMouseLeave={handleMouseLeave}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
        
        {/* Tooltip */}
        {tooltipContent && tooltipPosition && (
          <div
            className="fixed z-50 bg-[#2c3e50] text-white px-3 py-2 rounded-lg text-sm shadow-lg pointer-events-none whitespace-pre-line"
            style={{
              left: tooltipPosition.x + 10,
              top: tooltipPosition.y - 40,
            }}
          >
            {tooltipContent}
          </div>
        )}
        
        {/* Legend */}
        <div className="absolute bottom-2 left-2 bg-white/95 rounded-lg px-3 py-2 shadow-sm">
          {viewMode === 'value' ? (
            <div className="flex items-center gap-4">
              {/* No Data first */}
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-[#1a1a1a] opacity-30" />
                <span className="text-[10px] text-[#6c757d]">No Data</span>
              </div>
              {/* Color Range */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#6c757d]">Negative</span>
                <div className="w-16 h-3 rounded" style={{ background: 'linear-gradient(to right, #e43fdd, #ffffff, #0b2d79)' }} />
                <span className="text-[10px] text-[#6c757d]">High</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {Object.entries(REGION_COLORS).map(([region, color]) => (
                <div key={region} className="flex items-center gap-1">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs text-[#2c3e50]">{region}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default GeographicMap;
