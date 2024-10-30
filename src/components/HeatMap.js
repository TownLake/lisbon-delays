'use client'

import React from 'react';

// Memoized cell component
const HeatMapCell = React.memo(({ value, getColor, getTextColor }) => (
  <div
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
));
HeatMapCell.displayName = 'HeatMapCell';

// Memoized LandscapeHeatMap component
const LandscapeHeatMap = React.memo(({ timeSlots, zones, getCellValue, isDarkMode, getColor, getTextColor }) => (
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
            style={{ fontSize: '14px' }}
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
            style={{ fontSize: '14px' }}
          >
            {zone}
          </div>
          {timeSlots.map((slot) => (
            <HeatMapCell
              key={`${zone}-${slot}`}
              value={getCellValue(zone, slot)}
              getColor={getColor}
              getTextColor={getTextColor}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
));
LandscapeHeatMap.displayName = 'LandscapeHeatMap';

// Memoized PortraitHeatMap component
const PortraitHeatMap = React.memo(({ timeSlots, zones, getCellValue, isDarkMode, getColor, getTextColor }) => (
  <div className="block sm:hidden w-full">
    <div className="flex justify-center">
      <div className="flex">
        <div className="flex flex-col">
          <div className="h-20 p-2 flex items-center justify-end">
            <div 
              className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
              style={{ fontSize: '14px' }}
            >
              Time of Day
            </div>
          </div>
          {timeSlots.map((slot) => (
            <div 
              key={slot}
              className={`h-20 p-2 flex items-center justify-end text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
              style={{ fontSize: '14px' }}
            >
              {slot}
            </div>
          ))}
        </div>

        {zones.map((zone) => (
          <div key={zone} className="flex flex-col">
            <div 
              className={`h-20 p-2 flex items-center justify-center text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
              style={{ fontSize: '14px' }}
            >
              {zone}
            </div>
            {timeSlots.map((slot) => (
              <HeatMapCell
                key={`${zone}-${slot}`}
                value={getCellValue(zone, slot)}
                getColor={getColor}
                getTextColor={getTextColor}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  </div>
));
PortraitHeatMap.displayName = 'PortraitHeatMap';

// Memoized Legend component
const Legend = React.memo(({ isDarkMode }) => (
  <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
    <div className="flex items-center">
      <div className="w-4 h-4 rounded bg-green-500 mr-2" />
      <span 
        className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
        style={{ fontSize: '14px' }}
      >
        On Time
      </span>
    </div>
    <div className="flex items-center">
      <div className="w-4 h-4 rounded bg-yellow-500 mr-2" />
      <span 
        className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
        style={{ fontSize: '14px' }}
      >
        15-30m
      </span>
    </div>
    <div className="flex items-center">
      <div className="w-4 h-4 rounded bg-orange-500 mr-2" />
      <span 
        className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
        style={{ fontSize: '14px' }}
      >
        31-60m
      </span>
    </div>
    <div className="flex items-center">
      <div className="w-4 h-4 rounded bg-red-500 mr-2" />
      <span 
        className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
        style={{ fontSize: '14px' }}
      >
        {'>60m'}
      </span>
    </div>
  </div>
));
Legend.displayName = 'Legend';

const DelayHeatMap = React.memo(({ data, isDarkMode }) => {
  const timeSlots = ['Early', 'Morning', 'Afternoon', 'Evening'];
  const zones = ['Schengen', 'External'];
  
  const getColor = React.useCallback((value) => {
    if (value <= 5) return '#10B981';  // green-500
    if (value <= 30) return '#F59E0B'; // yellow-500
    if (value <= 60) return '#F97316'; // orange-500
    return '#EF4444';                  // red-500
  }, []);

  const getTextColor = React.useCallback((value) => {
    return value <= 30 ? '#1F2937' : '#FFFFFF';
  }, []);

  const getCellValue = React.useCallback((zone, timeSlot) => {
    const zoneKey = zone === 'Schengen' ? 'schengen' : 'nonSchengen';
    const timeKey = timeSlot.toLowerCase();
    return data?.heatmap?.[zoneKey]?.[timeKey] ?? 0;
  }, [data]);

  return (
    <div className={`p-4 sm:p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm mb-8`}>
      <h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        🌡️ Delay Heat Map
      </h2>
      <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        Average delays by time of day and Schengen status of destination/origin city.
      </p>
      
      <LandscapeHeatMap 
        timeSlots={timeSlots}
        zones={zones}
        getCellValue={getCellValue}
        isDarkMode={isDarkMode}
        getColor={getColor}
        getTextColor={getTextColor}
      />
      <PortraitHeatMap 
        timeSlots={timeSlots}
        zones={zones}
        getCellValue={getCellValue}
        isDarkMode={isDarkMode}
        getColor={getColor}
        getTextColor={getTextColor}
      />
      <Legend isDarkMode={isDarkMode} />
    </div>
  );
});
DelayHeatMap.displayName = 'DelayHeatMap';

export default DelayHeatMap;
