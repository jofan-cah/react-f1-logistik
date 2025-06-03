// src/components/charts/LineChart.tsx
import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface LineChartProps {
  darkMode?: boolean; // Optional prop for backward compatibility
}

const LineChart: React.FC<LineChartProps> = ({ darkMode: propDarkMode }) => {
  // Get darkMode from context
  const { darkMode: contextDarkMode } = useTheme();
  const darkMode = propDarkMode !== undefined ? propDarkMode : contextDarkMode;
  // Sample data for last 30 days of transactions
  const data = [
    { day: '1', count: 5 },
    { day: '2', count: 8 },
    { day: '3', count: 12 },
    { day: '4', count: 10 },
    { day: '5', count: 9 },
    { day: '6', count: 14 },
    { day: '7', count: 16 },
    { day: '8', count: 7 },
    { day: '9', count: 6 },
    { day: '10', count: 8 },
    { day: '11', count: 9 },
    { day: '12', count: 11 },
    { day: '13', count: 13 },
    { day: '14', count: 15 },
    { day: '15', count: 17 },
    { day: '16', count: 18 },
    { day: '17', count: 14 },
    { day: '18', count: 16 },
    { day: '19', count: 12 },
    { day: '20', count: 10 },
    { day: '21', count: 8 },
    { day: '22', count: 9 },
    { day: '23', count: 12 },
    { day: '24', count: 14 },
    { day: '25', count: 16 },
    { day: '26', count: 18 },
    { day: '27', count: 20 },
    { day: '28', count: 22 },
    { day: '29', count: 24 },
    { day: '30', count: 28 },
  ];

  // Find min and max values
  const maxValue = Math.max(...data.map(item => item.count));
  const minValue = Math.min(...data.map(item => item.count));
  
  // Chart dimensions
  const chartHeight = 250;
  const chartWidth = 1200; // Maximum width
  
  // Apply scaling
  const normalizeValue = (value: number) => {
    return chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;
  };
  
  // Generate SVG path
  const generatePath = () => {
    const interval = chartWidth / (data.length - 1);
    
    return data.map((item, index) => {
      const x = index * interval;
      const y = normalizeValue(item.count);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };
  
  // Colors based on dark mode
  const lineColor = darkMode ? '#6366f1' : '#4f46e5'; // indigo-500 or indigo-600
  const areaColor1 = darkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(79, 70, 229, 0.1)';
  const areaColor2 = darkMode ? 'rgba(99, 102, 241, 0)' : 'rgba(79, 70, 229, 0)';
  const gridColor = darkMode ? '#374151' : '#e5e7eb'; // gray-700 or gray-200
  const textColor = darkMode ? '#d1d5db' : '#6b7280'; // gray-300 or gray-500

  return (
    <div className="w-full h-full overflow-hidden">
      <div className="relative h-full w-full">
        {/* Y-axis grid lines */}
        {[0, 1, 2, 3, 4].map((line) => (
          <div 
            key={line} 
            className="absolute left-0 right-0 border-t border-dashed"
            style={{ 
              top: `${line * 25}%`, 
              borderColor: gridColor,
              zIndex: 1
            }}
          />
        ))}
        
        {/* Y-axis labels */}
        <div className="absolute top-0 left-0 h-full flex flex-col justify-between text-xs">
          {[maxValue, Math.ceil(maxValue * 0.75), Math.ceil(maxValue * 0.5), Math.ceil(maxValue * 0.25), minValue].map((value, index) => (
            <div 
              key={index} 
              className="flex items-center h-6"
              style={{ transform: 'translateY(-50%)' }}
            >
              <span style={{ color: textColor }}>{value}</span>
            </div>
          ))}
        </div>
        
        {/* SVG Chart */}
        <div className="absolute inset-0 ml-8">
          <svg
            className="w-full h-full overflow-visible"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          >
            {/* Area fill under the line */}
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={areaColor1} />
                <stop offset="100%" stopColor={areaColor2} />
              </linearGradient>
            </defs>
            
            <path
              d={`${generatePath()} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`}
              fill="url(#areaGradient)"
              strokeWidth="0"
            />
            
            {/* Line */}
            <path
              d={generatePath()}
              fill="none"
              stroke={lineColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Data points */}
            {data.map((item, index) => {
              const x = index * (chartWidth / (data.length - 1));
              const y = normalizeValue(item.count);
              
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="3"
                  fill={darkMode ? '#1f2937' : 'white'} // dark:bg-gray-800 or white
                  stroke={lineColor}
                  strokeWidth="2"
                  className="hover:r-4 transition-all duration-200"
                />
              );
            })}
          </svg>
        </div>
        
        {/* X-axis (days) */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-8">
          {[1, 5, 10, 15, 20, 25, 30].map(day => (
            <span 
              key={day} 
              className="text-xs"
              style={{ color: textColor }}
            >
              Day {day}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LineChart;