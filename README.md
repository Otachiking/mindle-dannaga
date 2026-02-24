# MindleStore Performance Dashboard

An interactive data visualization dashboard built with Next.js for the Mindle Data Analyst Competition 2026.

![MindleStore Dashboard](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?logo=tailwindcss)

## Features

- **Interactive Filters**: Filter data by Region, Segment, and Metric
- **KPI Scorecards**: Display key metrics (Sales, Profit, Quantity, Margin)
- **Geographic Map**: US choropleth map with zoom/pan controls
- **City Performance**: Top/Bottom 5 cities chart
- **Subcategory Analysis**: Combo chart with Profit, Sales, and Quantity
- **Performance Breakdown**: Bar and Pie chart views for Categories, Segments, Regions, and Ship Modes
- **Export Functionality**: Export dashboard to PDF or Excel

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Charts**: ApexCharts (react-apexcharts)
- **Maps**: React Simple Maps
- **Data Parsing**: PapaParse
- **PDF Export**: jsPDF + html2canvas
- **Excel Export**: xlsx

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/mindle-dannaga.git

# Navigate to the project directory
cd mindle-dannaga

# Install dependencies
npm install --legacy-peer-deps

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Project Structure

```
mindlestore-dashboard/
├── app/
│   ├── page.tsx          # Main dashboard page
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── Header.tsx        # Navigation header with filters
│   ├── Footer.tsx        # Copyright footer
│   ├── Scorecard.tsx     # KPI cards
│   ├── CityChart.tsx     # City performance chart
│   ├── GeographicMap.tsx # US map visualization
│   ├── SubcategoryCombo.tsx  # Subcategory combo chart
│   ├── PerformanceCharts.tsx # Bar/Pie performance charts
│   └── ui/               # Reusable UI components
├── lib/
│   ├── constants.ts      # Colors and formatting
│   ├── dataLoader.ts     # CSV data loading
│   ├── dataProcessor.ts  # Data aggregation functions
│   ├── exportUtils.ts    # PDF/Excel export utilities
│   └── types.ts          # TypeScript interfaces
└── public/
    └── data/
        └── MindleStore.csv  # Dataset
```

## Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/mindle-dannaga)

## Authors

**Dan Naga**
- Muhammad Iqbal Rasyid
- Dilla

## License

Copyright © 2026 - Mindle Data Analyst Competition
