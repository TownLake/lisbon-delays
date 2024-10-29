// src/components/Dashboard.js

"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { Sun, Moon, PlaneLanding, PlaneTakeoff } from 'lucide-react';
import DelayHeatMap from './HeatMap';
import SkeletonLoader from './SkeletonLoader';
import '../styles/styles.css';

const Dashboard = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [viewType, setViewType] = useState('departures');
  const [flightData, setFlightData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/flight-data');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        setFlightData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load flight data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [viewType]);

  const toggleDarkMode = () => setIsDarkMode((prevMode) => !prevMode);
  const toggleViewType = () => setViewType((prevType) => (prevType === 'arrivals' ? 'departures' : 'arrivals'));

  if (isLoading) return <SkeletonLoader />;

  if (error || !flightData) {
    return (
      <div className="centered-flex min-h-screen">
        <p className="text-red-500 text-xl">{error || 'Failed to load data'}</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            ✈️ LIS-b-On Time
          </h1>
          <button onClick={toggleDarkMode} className={`toggle-button ${isDarkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}>
            {isDarkMode ? <Moon size={24} /> : <Sun size={24} />}
          </button>
        </div>

        {/* Toggle Button for Arrivals/Departures */}
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

        {/* Flight Statistics */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              🛫 Flight Statistics
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>✈️ Flights per Day</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {flightData[viewType].flightsPerDay}
                </p>
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>📅 Days Tracked</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {flightData[viewType].daysTracked}
                </p>
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>✅ Flights On Time</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {flightData[viewType].delays.onTime}%
                </p>
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>⏱️ Average Delay</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {flightData[viewType].averageDelay}m
                </p>
              </div>
            </div>
          </div>

          {/* Delay Breakdown */}
          <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              ⏱️ Delay Breakdown
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="legend-item">
                <div className="w-4 h-4 rounded bg-green-500" />
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>On Time</p>
                <span className="text-2xl font-bold text-green-500">{flightData[viewType].delays.onTime}%</span>
              </div>
              <div className="legend-item">
                <div className="w-4 h-4 rounded bg-yellow-500" />
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>5-30 Minutes</p>
                <span className="text-2xl font-bold text-yellow-500">{flightData[viewType].delays.minor}%</span>
              </div>
              <div className="legend-item">
                <div className="w-4 h-4 rounded bg-orange-500" />
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>31-60 Minutes</p>
                <span className="text-2xl font-bold text-orange-500">{flightData[viewType].delays.medium}%</span>
              </div>
              <div className="legend-item">
                <div className="w-4 h-4 rounded bg-red-500" />
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>60+ Minutes</p>
                <span className="text-2xl font-bold text-red-500">{flightData[viewType].delays.major}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delay Heat Map */}
        <Suspense fallback={<SkeletonLoader />}>
          <DelayHeatMap data={flightData[viewType]} isDarkMode={isDarkMode} />
        </Suspense>
      </div>
    </div>
  );
};

export default Dashboard;
