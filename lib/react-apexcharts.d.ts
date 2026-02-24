declare module 'react-apexcharts' {
  import { Component } from 'react';
  import ApexCharts from 'apexcharts';

  export interface Props {
    options?: ApexCharts.ApexOptions;
    series?: ApexCharts.ApexAxisChartSeries | ApexCharts.ApexNonAxisChartSeries;
    type?:
      | 'line'
      | 'area'
      | 'bar'
      | 'pie'
      | 'donut'
      | 'radialBar'
      | 'scatter'
      | 'bubble'
      | 'heatmap'
      | 'candlestick'
      | 'boxPlot'
      | 'radar'
      | 'polarArea'
      | 'rangeBar'
      | 'rangeArea'
      | 'treemap';
    width?: string | number;
    height?: string | number;
  }

  export default class ReactApexChart extends Component<Props> {}
}
