"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Plane, PlaneLanding, Sun, Moon } from "lucide-react";

const FlightDelays = () => {
  const [flightType, setFlightType] = useState("departures");
  const [isDark, setIsDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);
    setIsLoaded(true);

    const handleChange = (e) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => setIsDark(!isDark);

  const summaryStats = {
    departures: {
      totalFlights: 3842,
      onTimeCount: 2882,
      onTimePercent: 75,
      delay5to30Percent: 15,
      delay30to60Percent: 7,
      delay60PlusPercent: 3,
      averageDelay: 18,
      medianDelay: 12
    },
    arrivals: {
      totalFlights: 3756,
      onTimeCount: 2741,
      onTimePercent: 73,
      delay5to30Percent: 17,
      delay30to60Percent: 8,
      delay60PlusPercent: 2,
      averageDelay: 16,
      medianDelay: 11
    }
  };

  const weeklyData = [
    {
      week: 'Sep 1',
      onTime: 78,
      delay5to30: 14,
      delay30to60: 6,
      delay60Plus: 2
    },
    {
      week: 'Sep 8',
      onTime: 72,
      delay5to30: 18,
      delay30to60: 8,
      delay60Plus: 2
    },
    {
      week: 'Sep 15',
      onTime: 65,
      delay5to30: 22,
      delay30to60: 10,
      delay60Plus: 3
    },
    {
      week: 'Sep 22',
      onTime: 70,
      delay5to30: 19,
      delay30to60: 8,
      delay60Plus: 3
    },
    {
      week: 'Sep 29',
      onTime: 75,
      delay5to30: 16,
      delay30to60: 7,
      delay60Plus: 2
    },
    {
      week: 'Oct 6',
      onTime: 77,
      delay5to30: 15,
      delay30to60: 6,
      delay60Plus: 2
    },
    {
      week: 'Oct 13',
      onTime: 73,
      delay5to30: 17,
      delay30to60: 8,
      delay60Plus: 2
    },
    {
      week: 'Oct 20',
      onTime: 68,
      delay5to30: 20,
      delay30to60: 9,
      delay60Plus: 3
    }
  ];

  // Stats metadata with emojis
  const metrics = {
    totalFlights: { label: '✈️ Total Flights', formatter: (val) => val.toLocaleString() },
    onTimeCount: { label: '🎯 On Time Flights', formatter: (val) => val.toLocaleString() },
    averageDelay: { label: '⏱️ Average Delay', formatter: (val) => `${val.toLocaleString()} min` },
    medianDelay: { label: '⌛ Median Delay', formatter: (val) => `${val.toLocaleString()} min` }
  };

  const delayMetrics = {
    onTime: { label: '🟢 On Time', formatter: (val) => `${val.toLocaleString()}%` },
    delay5to30: { label: '🟡 5-30 Minutes Late', formatter: (val) => `${val.toLocaleString()}%` },
    delay30to60: { label: '🟠 30-60 Minutes Late', formatter: (val) => `${val.toLocaleString()}%` },
    delay60Plus: { label: '🔴 60+ Minutes Late', formatter: (val) => `${val.toLocaleString()}%` }
  };

  // Memoize colors to prevent recreating on every render
  const chartColors = useMemo(() => ({
    onTime: "#86efac", // pastel green
    delay5to30: "#fde047", // pastel yellow
    delay30to60: "#fdba74", // pastel orange
    delay60Plus: "#fca5a5", // pastel red
  }), []);

  // Memoize styles to prevent recreating on every render
  const styles = useMemo(() => ({
    containerClasses: `min-h-screen transition-colors duration-200 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`,
    cardClasses: `rounded-lg shadow p-6 transition-colors duration-200 ${isDark ? 'bg-gray-900' : 'bg-white'}`,
    headingClasses: `text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`,
    labelClasses: `text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`,
    valueClasses: `text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`,
    sectionHeadingClasses: `text-lg font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`,
    dividerClasses: `border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`,
    subCardClasses: `rounded-lg p-4 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`,
  }), [isDark]);

  const currentStats = summaryStats[flightType];

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.containerClasses}>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header Section with Title and Theme Toggle */}
        <div className="flex justify-between items-start mb-8">
          <div className="text-center flex-grow">
            <h1 className={`text-4xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Lisb-<span className="font-black">On Time</span> Rates
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Airport delay trends at LIS
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ml-4 ${
              isDark 
                ? 'bg-gray-900 hover:bg-gray-800 text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>

        {/* Flight Type Toggle */}
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setFlightType("departures")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              flightType === "departures"
                ? "bg-blue-500 text-white"
                : isDark 
                  ? "bg-gray-900 hover:bg-gray-800 text-white" 
                  : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            <Plane className="h-4 w-4" />
            Departures
          </button>
          <button
            onClick={() => setFlightType("arrivals")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              flightType === "arrivals"
                ? "bg-blue-500 text-white"
                : isDark 
                  ? "bg-gray-900 hover:bg-gray-800 text-white" 
                  : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            <PlaneLanding className="h-4 w-4" />
            Arrivals
          </button>
        </div>

        {/* Summary Stats */}
        <div className={styles.cardClasses}>
          <h2 className={styles.headingClasses}>Summary Statistics</h2>
          
          {/* Key Metrics Section */}
          <div className="space-y-4">
            <h3 className={styles.sectionHeadingClasses}>Key Metrics</h3>
            <div className={styles.subCardClasses}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(metrics).map(([key, meta]) => (
                  <div key={key} className="space-y-1">
                    <p className={styles.labelClasses}>{meta.label}</p>
                    <p className={styles.valueClasses}>
                      {meta.formatter(currentStats[key])}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.dividerClasses + " my-6"} />

          {/* Delay Distribution Section */}
          <div className="space-y-4">
            <h3 className={styles.sectionHeadingClasses}>Delay Distribution</h3>
            <div className={styles.subCardClasses}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(delayMetrics).map(([key, meta]) => (
                  <div key={key} className="space-y-1">
                    <p className={styles.labelClasses}>{meta.label}</p>
                    <p className="text-2xl font-bold" style={{ color: chartColors[key] }}>
                      {meta.formatter(currentStats[`${key}Percent`])}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className={styles.cardClasses}>
          <h2 className={styles.headingClasses}>📊 Weekly Delay Distribution</h2>
          <div className="w-full h-96">
            <ResponsiveContainer>
              <BarChart 
                data={weeklyData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <XAxis 
                  dataKey="week" 
                  stroke={isDark ? "#9ca3af" : "#4b5563"}
                />
                <YAxis 
                  stroke={isDark ? "#9ca3af" : "#4b5563"}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    border: '1px solid #374151',
                    color: isDark ? '#ffffff' : '#000000'
                  }}
                />
                <Legend />
                <Bar dataKey="onTime" fill={chartColors.onTime} name="On Time" />
                <Bar dataKey="delay5to30" fill={chartColors.delay5to30} name="5-30 Minutes" />
                <Bar dataKey="delay30to60" fill={chartColors.delay30to60} name="30-60 Minutes" />
                <Bar dataKey="delay60Plus" fill={chartColors.delay60Plus} name="60+ Minutes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
          Built by <a 
            href="https://blog.samrhea.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Sam Rhea
          </a> on Cloudflare Workers
        </footer>
      </div>
    </div>
  );
};

export default FlightDelays;