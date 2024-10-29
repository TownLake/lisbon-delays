'use client'

import React, { useState, useEffect, Suspense } from 'react';
import { Sun, Moon, PlaneLanding, PlaneTakeoff, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DelayHeatMap from './HeatMap';

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="h-32 w-32 animate-spin text-blue-500" />
  </div>
);
LoadingSpinner.displayName = 'LoadingSpinner';

const CustomLegend = React.memo(({ payload, isDarkMode }) => (
  <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
    {payload.map((entry, index) => (
      <div key={`legend-${index}`} className="flex items-center">
        <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: entry.color }} />
        <span 
          className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
          style={{ fontSize: '14px' }}
        >
          {entry.value}
        </span>
      </div>
    ))}
  </div>
));
CustomLegend.displayName = 'CustomLegend';

const StatCard = React.memo(({ label, value, icon, isDarkMode }) => (
  <div>
    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{icon} {label}</p>
    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      {value}
    </p>
  </div>
));
StatCard.displayName = 'StatCard';

const DelayBreakdown = React.memo(({ delays, isDarkMode }) => (
  <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
    <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      ⏱️ Delay Breakdown
    </h2>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <div className="flex items-center mb-1">
          <div className="w-4 h-4 rounded bg-green-500 mr-2" />
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>On Time</p>
        </div>
        <p className="text-2xl font-bold text-green-500">{delays.onTime}%</p>
      </div>
      <div>
        <div className="flex items-center mb-1">
          <div className="w-4 h-4 rounded bg-yellow-500 mr-2" />
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>5-30 Minutes</p>
        </div>
        <p className="text-2xl font-bold text-yellow-500">{delays.minor}%</p>
      </div>
      <div>
        <div className="flex items-center mb-1">
          <div className="w-4 h-4 rounded bg-orange-500 mr-2" />
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>31-60 Minutes</p>
        </div>
        <p className="text-2xl font-bold text-orange-500">{delays.medium}%</p>
      </div>
      <div>
        <div className="flex items-center mb-1">
          <div className="w-4 h-4 rounded bg-red-500 mr-2" />
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>60+ Minutes</p>
        </div>
        <p className="text-2xl font-bold text-red-500">{delays.major}%</p>
      </div>
    </div>
  </div>
));
DelayBreakdown.displayName = 'DelayBreakdown';

const ChartSection = React.memo(({ title, description, data, isDarkMode, config, height = "64" }) => (
  <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm mb-8`}>
    <h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      {title}
    </h2>
    <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
      {description}
    </p>
    <div className={`h-${height}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
          layout={config.layout}
        >
          <XAxis 
            type={config.xAxisType}
            dataKey={config.xDataKey}
            tick={config.labelStyle}
            tickFormatter={config.xTickFormatter}
          />
          <YAxis 
            type={config.yAxisType}
            dataKey={config.yDataKey}
            tick={config.labelStyle}
            tickFormatter={config.yTickFormatter}
          />
          <Tooltip 
            contentStyle={config.tooltipStyle}
            formatter={config.tooltipFormatter}
          />
          <Legend content={<CustomLegend isDarkMode={isDarkMode} />} />
          {config.bars.map((bar, index) => (
            <Bar 
              key={index}
              dataKey={bar.dataKey}
              stackId={bar.stackId}
              fill={bar.fill}
              name={bar.name}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
));
ChartSection.displayName = 'ChartSection';

const Dashboard = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [viewType, setViewType] = useState('departures');
  const [flightData, setFlightData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const chartConfig = {
    labelStyle: {
      fontSize: '14px',
      fill: isDarkMode ? '#9CA3AF' : '#6B7280',
    },
    tooltipStyle: {
      backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
      border: 'none',
      borderRadius: '0.5rem',
      color: isDarkMode ? '#FFFFFF' : '#000000',
    },
    colors: {
      onTime: '#10B981',
      minor: '#F59E0B',
      medium: '#F97316',
      major: '#EF4444',
    },
    labels: {
      onTime: 'On Time',
      minor: '5-30m',
      medium: '31-60m',
      major: '>60m',
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/flight-data');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setFlightData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load flight data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  const MainContent = React.memo(() => {
    if (!flightData) return null;

    const data = viewType === 'arrivals' ? flightData.arrivals : flightData.departures;

    const timeOfDayData = Object.entries(data.timeOfDay).map(([timeKey, values]) => ({
      timeSlot: {
        early: "Early",
        morning: "Morning",
        afternoon: "Afternoon",
        evening: "Evening"
      }[timeKey],
      ...values
    }));

    const schengenData = [
      { zone: "Schengen", ...data.schengen.schengen },
      { zone: "External", ...data.schengen.nonSchengen }
    ];

    return (
      <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex-grow text-center">
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ✈️ LIS-b-On Time
              </h1>
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}
            >
              {isDarkMode ? <Moon size={24} /> : <Sun size={24} />}
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex justify-center mb-8">
            <div className={`inline-flex rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} p-1`}>
              <button
                onClick={() => setViewType('arrivals')}
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  viewType === 'arrivals'
                    ? `${isDarkMode ? 'bg-blue-600 text-white' : 'bg-white shadow-sm text-blue-600'}`
                    : `${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`
                }`}
              >
                <PlaneLanding size={20} className="mr-2" />
                Arrivals
              </button>
              <button
                onClick={() => setViewType('departures')}
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  viewType === 'departures'
                    ? `${isDarkMode ? 'bg-blue-600 text-white' : 'bg-white shadow-sm text-blue-600'}`
                    : `${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`
                }`}
              >
                <PlaneTakeoff size={20} className="mr-2" />
                Departures
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Flight Stats */}
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                🛫 Flight Statistics
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  label="Flights per Day"
                  value={data.flightsPerDay}
                  icon="✈️"
                  isDarkMode={isDarkMode}
                />
                <StatCard
                  label="Days Tracked"
                  value={data.daysTracked}
                  icon="📅"
                  isDarkMode={isDarkMode}
                />
                <StatCard
                  label="Flights On Time"
                  value={`${data.delays.onTime}%`}
                  icon="✅"
                  isDarkMode={isDarkMode}
                />
                <StatCard
                  label="Average Delay"
                  value={`${data.averageDelay}m`}
                  icon="⏱️"
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>

            {/* Delay Stats */}
            <DelayBreakdown delays={data.delays} isDarkMode={isDarkMode} />
          </div>

          {/* Time of Day Analysis */}
          <ChartSection
            title="🕒 Time of Day Trends"
            description="How does the time of day impact your delay?"
            data={timeOfDayData}
            isDarkMode={isDarkMode}
            config={{
              xAxisType: "number",
              yAxisType: "category",
              yDataKey: "timeSlot",
              xTickFormatter: (value) => `${value}%`,
              tooltipFormatter: (value) => `${value}%`,
              labelStyle: chartConfig.labelStyle,
              tooltipStyle: chartConfig.tooltipStyle,
              layout: "vertical",
              bars: [
                { dataKey: "onTime", stackId: "a", fill: chartConfig.colors.onTime, name: chartConfig.labels.onTime },
                { dataKey: "minor", stackId: "a", fill: chartConfig.colors.minor, name: chartConfig.labels.minor },
                { dataKey: "medium", stackId: "a", fill: chartConfig.colors.medium, name: chartConfig.labels.medium },
                { dataKey: "major", stackId: "a", fill: chartConfig.colors.major, name: chartConfig.labels.major }
              ]
            }}
            height="64"
          />

          {/* Schengen Analysis */}
          <ChartSection
            title="🌍 Schengen vs Non-Schengen"
            description="How do delays compare between Schengen and non-Schengen flights?"
            data={schengenData}
            isDarkMode={isDarkMode}
            config={{
              xAxisType: "number",
              yAxisType: "category",
              yDataKey: "zone",
              xTickFormatter: (value) => `${value}%`,
              tooltipFormatter: (value) => `${value}%`,
              labelStyle: chartConfig.labelStyle,
              tooltipStyle: chartConfig.tooltipStyle,
              layout: "vertical",
              bars: [
                { dataKey: "onTime", stackId: "a", fill: chartConfig.colors.onTime, name: chartConfig.labels.onTime },
                { dataKey: "minor", stackId: "a", fill: chartConfig.colors.minor, name: chartConfig.labels.minor },
                { dataKey: "medium", stackId: "a", fill: chartConfig.colors.medium, name: chartConfig.labels.medium },
                { dataKey: "major", stackId: "a", fill: chartConfig.colors.major, name: chartConfig.labels.major }
              ]
            }}
            height="48"
          />

          {/* HeatMap */}
          <DelayHeatMap data={data} isDarkMode={isDarkMode} />

          {/* Weekly Trends */}
          <ChartSection
            title="📊 Weekly Trends"
            description="Are delays getting better or worse over time?"
            data={data.weeklyData}
            isDarkMode={isDarkMode}
            config={{
              xAxisType: "category",
              yAxisType: "number",
              xDataKey: "week",
              yTickFormatter: (value) => `${value}%`,
              tooltipFormatter: (value) => `${value}%`,
              labelStyle: chartConfig.labelStyle,
              tooltipStyle: chartConfig.tooltipStyle,
              bars: [
                { dataKey: "onTime", stackId: "a", fill: chartConfig.colors.onTime, name: chartConfig.labels.onTime },
                { dataKey: "minor", stackId: "a", fill: chartConfig.colors.minor, name: chartConfig.labels.minor },
                { dataKey: "medium", stackId: "a", fill: chartConfig.colors.medium, name: chartConfig.labels.medium },
                { dataKey: "major", stackId: "a", fill: chartConfig.colors.major, name: chartConfig.labels.major }
              ]
            }}
            height="80"
          />

          {/* Footer */}
          <footer className={`text-center py-4 border-t ${isDarkMode ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-600'}`}>
            <p className="text-sm">
              Built by{' '}
              <a 
                href="https://blog.samrhea.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={`hover:underline ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}
              >
                Sam Rhea
              </a>
              {' '}with love from Lisbon
            </p>
          </footer>
        </div>
      </div>
    );
  });
  MainContent.displayName = 'MainContent';

  return (
    <Suspense fallback={<LoadingSpinner />}>
      {isLoading ? <LoadingSpinner /> : <MainContent />}
    </Suspense>
  );
};

Dashboard.displayName = 'Dashboard';

export default Dashboard;