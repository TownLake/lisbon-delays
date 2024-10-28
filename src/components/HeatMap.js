'use client'

import React from 'react';

const DelayHeatMap = ({ data, isDarkMode }) => {
  const timeSlots = ['Early', 'Morning', 'Afternoon', 'Evening'];
  const zones = ['Schengen', 'External'];
  
  const getColor = (value) => {
    if (value <= 5) return '#10B981';
    if (value <= 30) return '#F59E0B';
    if (value <= 60) return '#F97316';
    return '#EF4444';
  };

  const getTextColor = (value) => {
    return value <= 30 ? '#1F2937' : '#FFFFFF';
  };

  const getCellValue = (zone, timeSlot) => {
    const zoneKey = zone === 'Schengen Zone' ? 'schengen' : 'nonSchengen';
    const timeKey = timeSlot.toLowerCase();
    return data.heatmap?.[zoneKey]?.[timeKey] ?? 0;
  };

  // Desktop/Landscape Layout
  const LandscapeHeatMap = () => (
    <div className="hidden sm:block w-full">
      <div className="flex flex-col items-center">
        {/* Header row */}
        <div className="flex w-full max-w-3xl">
          <div className="w-32 shrink-0" />
          {timeSlots.map((slot) => (
            <div 
              key={slot}
              className={`w-32 p-2 text-center text-sm shrink-0 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              {slot}
            </div>
          ))}
        </div>
        
        {/* Data rows */}
        {zones.map((zone) => (
          <div key={zone} className="flex w-full max-w-3xl">
            <div 
              className={`w-32 p-2 text-sm flex items-center shrink-0 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              {zone}
            </div>
            {timeSlots.map((slot) => {
              const value = getCellValue(zone, slot);
              return (
                <div
                  key={`${zone}-${slot}`}
                  className="w-32 h-24 p-2 m-1 rounded-lg flex items-center justify-center transition-colors duration-200 shrink-0"
                  style={{
                    backgroundColor: getColor(value),
                    color: getTextColor(value)
                  }}
                >
                  <span className="font-bold text-lg">
                    {value}m
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  // Mobile/Portrait Layout
  const PortraitHeatMap = () => (
    <div className="block sm:hidden w-full">
      <div className="flex justify-center">
        <div className="flex">
          {/* Time slots column */}
          <div className="flex flex-col">
            <div className="h-20 p-2 flex items-center justify-end">
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Time of Day
              </div>
            </div>
            {timeSlots.map((slot) => (
              <div 
                key={slot}
                className={`h-20 p-2 flex items-center justify-end text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {slot}
              </div>
            ))}
          </div>

          {/* Data columns */}
          {zones.map((zone) => (
            <div key={zone} className="flex flex-col">
              <div 
                className={`h-20 p-2 flex items-center justify-center text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {zone}
              </div>
              {timeSlots.map((slot) => {
                const value = getCellValue(zone, slot);
                return (
                  <div
                    key={`${zone}-${slot}`}
                    className="w-28 h-20 p-2 m-1 rounded-lg flex items-center justify-center transition-colors duration-200"
                    style={{
                      backgroundColor: getColor(value),
                      color: getTextColor(value)
                    }}
                  >
                    <span className="font-bold text-base">
                      {value}m
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`p-4 sm:p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm mb-8`}>
      <h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        🌡️ Delay Heat Map
      </h2>
      <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        Average delays by time of day and flight region
      </p>
      
      <LandscapeHeatMap />
      <PortraitHeatMap />
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-green-500 mr-2" />
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>On Time</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-yellow-500 mr-2" />
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>15-30m</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-orange-500 mr-2" />
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>31-60m</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-red-500 mr-2" />
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{'>60m'}</span>
        </div>
      </div>
    </div>
  );
};

export default DelayHeatMap;