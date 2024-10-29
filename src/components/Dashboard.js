'use client'

import React, { useState, useEffect } from 'react';
import { Sun, Moon, PlaneLanding, PlaneTakeoff } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DelayHeatMap from './HeatMap';

const Dashboard = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [viewType, setViewType] = useState('departures');
  const [flightData, setFlightData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Custom Legend renderer for consistent styling across charts
  const CustomLegend = ({ payload }) => (
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
  );

  // Common chart configuration
  const chartConfig = {
    labelStyle: {
      fontSize: '12px',
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error || !flightData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-xl">{error || 'Failed to load data'}</div>
      </div>
    );
  }

  const data = viewType === 'arrivals' ? flightData.arrivals : flightData.departures;

  // Transform the timeOfDay data from the API into the format needed for the chart
  const timeOfDayData = Object.entries(data.timeOfDay).map(([timeKey, values]) => {
    const timeSlotLabels = {
      early: "Early",
      morning: "Morning",
      afternoon: "Afternoon",
      evening: "Evening"
    };

    return {
      timeSlot: timeSlotLabels[timeKey],
      onTime: values.onTime,
      minor: values.minor,
      medium: values.medium,
      major: values.major,
    };
  });

  // Transform the Schengen data into the format needed for the chart
  const schengenData = [
    {
      zone: "Schengen",
      ...data.schengen.schengen
    },
    {
      zone: "External",
      ...data.schengen.nonSchengen
    }
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

        {/* Toggle */}
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
          {/* Flights Stats */}
          <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              🛫 Flight Statistics
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>✈️ Flights per Day</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {data.flightsPerDay}
                </p>
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>📅 Days Tracked</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {data.daysTracked}
                </p>
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>✅ Flights On Time</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {data.delays.onTime}%
                </p>
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>⏱️ Average Delay</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {data.averageDelay}m
                </p>
              </div>
            </div>
          </div>

          {/* Delay Stats */}
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
                <p className="text-2xl font-bold text-green-500">
                  {data.delays.onTime}%
                </p>
              </div>
              <div>
                <div className="flex items-center mb-1">
                  <div className="w-4 h-4 rounded bg-yellow-500 mr-2" />
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>5-30 Minutes</p>
                </div>
                <p className="text-2xl font-bold text-yellow-500">
                  {data.delays.minor}%
                </p>
              </div>
              <div>
                <div className="flex items-center mb-1">
                  <div className="w-4 h-4 rounded bg-orange-500 mr-2" />
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>31-60 Minutes</p>
                </div>
                <p className="text-2xl font-bold text-orange-500">
                  {data.delays.medium}%
                </p>
              </div>
              <div>
                <div className="flex items-center mb-1">
                  <div className="w-4 h-4 rounded bg-red-500 mr-2" />
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>60+ Minutes</p>
                </div>
                <p className="text-2xl font-bold text-red-500">
                  {data.delays.major}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Time of Day Analysis */}
        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm mb-8`}>
          <h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            🕒 Time of Day Trends
          </h2>
          <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            How does the time of day impact your delay?
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={timeOfDayData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
              >
                <XAxis 
                  type="number" 
                  tick={chartConfig.labelStyle}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis 
                  type="category" 
                  dataKey="timeSlot" 
                  tick={chartConfig.labelStyle}
                />
                <Tooltip 
                  contentStyle={chartConfig.tooltipStyle}
                  formatter={(value) => `${value}%`}
                />
                <Legend content={<CustomLegend />} />
                <Bar dataKey="onTime" stackId="a" fill={chartConfig.colors.onTime} name={chartConfig.labels.onTime} />
                <Bar dataKey="minor" stackId="a" fill={chartConfig.colors.minor} name={chartConfig.labels.minor} />
                <Bar dataKey="medium" stackId="a" fill={chartConfig.colors.medium} name={chartConfig.labels.medium} />
                <Bar dataKey="major" stackId="a" fill={chartConfig.colors.major} name={chartConfig.labels.major} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Schengen vs Non-Schengen Analysis */}
        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm mb-8`}>
          <h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            🌍 Schengen vs Non-Schengen
          </h2>
          <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            How do delays compare between Schengen and non-Schengen flights?
          </p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={schengenData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
              >
                <XAxis 
                  type="number" 
                  tick={chartConfig.labelStyle}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis 
                  type="category" 
                  dataKey="zone" 
                  tick={chartConfig.labelStyle}
                />
                <Tooltip 
                  contentStyle={chartConfig.tooltipStyle}
                  formatter={(value) => `${value}%`}
                />
                <Legend content={<CustomLegend />} />
                <Bar dataKey="onTime" stackId="a" fill={chartConfig.colors.onTime} name={chartConfig.labels.onTime} />
                <Bar dataKey="minor" stackId="a" fill={chartConfig.colors.minor} name={chartConfig.labels.minor} />
                <Bar dataKey="medium" stackId="a" fill={chartConfig.colors.medium} name={chartConfig.labels.medium} />
                <Bar dataKey="major" stackId="a" fill={chartConfig.colors.major} name={chartConfig.labels.major} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <DelayHeatMap data={viewType === 'arrivals' ? flightData.arrivals : flightData.departures} isDarkMode={isDarkMode} />
    
        {/* Weekly Chart */}
        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm mb-8`}>
          <h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            📊 Weekly Trends
          </h2>
          <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Are delays getting better or worse over time?
          </p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={data.weeklyData}
                margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
              >
                <XAxis 
                  dataKey="week" 
                  tick={chartConfig.labelStyle}
                />
                <YAxis 
                  tick={chartConfig.labelStyle}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  contentStyle={chartConfig.tooltipStyle}
                  formatter={(value) => `${value}%`}
                />
                <Legend content={<CustomLegend />} />
                <Bar dataKey="onTime" stackId="a" fill={chartConfig.colors.onTime} name={chartConfig.labels.onTime} />
                <Bar dataKey="minor" stackId="a" fill={chartConfig.colors.minor} name={chartConfig.labels.minor} />
                <Bar dataKey="medium" stackId="a" fill={chartConfig.colors.medium} name={chartConfig.labels.medium} />
                <Bar dataKey="major" stackId="a" fill={chartConfig.colors.major} name={chartConfig.labels.major} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

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
};

export default Dashboard;
