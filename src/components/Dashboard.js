'use client'

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Plane, PlaneLanding, PlaneTakeoff } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [viewType, setViewType] = useState('departures');
  const [flightData, setFlightData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
                  {data.flightsOnTime}%
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
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>✅ On Time</p>
                <p className="text-2xl font-bold text-green-500">
                  {data.delays.onTime}%
                </p>
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>⚠️ 5-30 Minutes</p>
                <p className="text-2xl font-bold text-yellow-500">
                  {data.delays.minor}%
                </p>
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>🟧 31-60 Minutes</p>
                <p className="text-2xl font-bold text-orange-500">
                  {data.delays.medium}%
                </p>
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>🔴 60+ Minutes</p>
                <p className="text-2xl font-bold text-red-500">
                  {data.delays.major}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm mb-8`}>
          <h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            📊 Weekly Delay Trends
          </h2>
          <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Week numbers in 2024
          </p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.weeklyData}>
                <XAxis 
                  dataKey="week" 
                  stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
                />
                <YAxis 
                  stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: isDarkMode ? '#FFFFFF' : '#000000'
                  }}
                />
                <Legend />
                <Bar dataKey="onTime" stackId="a" fill="#10B981" name="On Time" />
                <Bar dataKey="minor" stackId="a" fill="#F59E0B" name="5-30 Min" />
                <Bar dataKey="medium" stackId="a" fill="#F97316" name="31-60 Min" />
                <Bar dataKey="major" stackId="a" fill="#EF4444" name="60+ Min" />
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