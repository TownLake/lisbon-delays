// src/components/HeatMap.js

"use client";

import React, { memo } from 'react';
import '../styles/styles.css';

const DelayHeatMap = memo(({ data, isDarkMode }) => {
  const timeSlots = ['Early', 'Morning', 'Afternoon', 'Evening'];
  const zones = ['Schengen', 'External'];

  const getColor = (value) => {
    if (value <= 5) return 'var(--green)';
    if (value <= 30) return 'var(--yellow)';
    if (value <= 60) return 'var(--orange)';
    return 'var(--red)';
  };

  const getTextColor = (value) => {
    return value <= 30 ? 'var(--bg-dark)' : 'var(--bg-light)';
  };

  const getCellValue = (zone, timeSlot) => {
    const zoneKey = zone === 'Schengen' ? 'schengen' : 'nonSchengen';
    const timeKey = timeSlot.toLowerCase();
    return data?.heatmap?.[zoneKey]?.[timeKey] ?? 0;
  };

  return (
    <div className={`p-4 sm:p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm mb-8`}>
      <h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        🌡️ Delay Heat Map
      </h2>
      <div className="flex flex-col items-center">
        <div className="flex w-full max-w-3xl">
          {timeSlots.map((slot) => (
            <div key={slot} className="heatmap-cell text-center">{slot}</div>
          ))}
        </div>
        {zones.map((zone) => (
          <div key={zone} className="flex w-full max-w-3xl">
            <div className="heatmap-cell">{zone}</div>
            {timeSlots.map((slot) => {
              const value = getCellValue(zone, slot);
              return (
                <div
                  key={`${zone}-${slot}`}
                  className="heatmap-cell"
                  style={{ backgroundColor: getColor(value), color: getTextColor(value) }}
                >
                  {value}m
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
});

// Adding display name to satisfy ESLint requirements
DelayHeatMap.displayName = 'DelayHeatMap';

export default DelayHeatMap;
