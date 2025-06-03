// src/components/charts/BarChart.tsx
import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface BarChartProps {
  darkMode?: boolean; // Optional prop for backward compatibility
}

const BarChart: React.FC<BarChartProps> = ({ darkMode: propDarkMode }) => {
  // Get darkMode from context
  const { darkMode: contextDarkMode } = useTheme();
  const darkMode = propDarkMode !== undefined ? propDarkMode : contextDarkMode;
  // Sample data for inventory by category
  const data = [
    { category: 'Electronics', count: 458 },
    { category: 'Office Supplies', count: 320 },
    { category: 'Furniture', count: 142 },
    { category: 'Networking', count: 98 },
    { category: 'Storage', count: 85 },
    { category: 'Software', count: 65 },
  ];

  // Sort data by count descending
  const sortedData = [...data].sort((a, b) => b.count - a.count);

  // Find the maximum value for scaling
  const maxValue = Math.max(...data.map(item => item.count));
  
  // Colors based on dark mode
  const barColor = darkMode ? 'bg-indigo-500' : 'bg-indigo-600';
  const textColor = darkMode ? 'text-gray-300' : 'text-gray-600';
  const labelColor = darkMode ? 'text-white' : 'text-gray-900';

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 flex flex-col justify-end space-y-2">
        {sortedData.map((item, index) => (
          <div key={index} className="flex items-center group">
            <div className="w-32 truncate pr-2">
              <span className={`text-sm font-medium ${labelColor}`}>{item.category}</span>
            </div>
            <div className="flex-1 h-8 bg-gray-200 dark:bg-gray-700 rounded-sm overflow-hidden">
              <div
                className={`h-full ${barColor} group-hover:bg-opacity-80 transition-all duration-200`}
                style={{ width: `${(item.count / maxValue) * 100}%` }}
              ></div>
            </div>
            <div className="w-16 pl-2">
              <span className={`text-sm font-medium ${labelColor}`}>{item.count}</span>
            </div>
          </div>
        ))}
      </div>
      
      {/* X-axis label */}
      <div className={`mt-4 text-center text-sm ${textColor}`}>
        Number of Items
      </div>
    </div>
  );
};

export default BarChart;