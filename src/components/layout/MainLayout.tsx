// src/components/layout/MainLayout.tsx
import React, { useState, ReactNode, Suspense, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Sidebar from './Sidebar';
import Header from './Header';
// import PageLoadingSpinner from '../ui/PageLoadingSpinner';

interface MainLayoutProps {
  children?: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  // Simulate loading for smooth transition
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Auto-close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full"></div>
          </div>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Loading LogisticF1...
          </h3>
          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Preparing your workspace
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex transition-colors duration-200 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Sidebar - Full Height */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        darkMode={darkMode}
      />
      
      {/* Main Content Area - Full Height */}
      <div className="flex-1 h-screen flex flex-col overflow-hidden">
        {/* Header */}
        <Header 
          user={user}
          onMenuClick={toggleSidebar}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
        />
        
        {/* Main Content with integrated footer */}
        <main className={`flex-1 overflow-hidden transition-colors duration-200 ${
          darkMode ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
          {/* Scrollable Content Container */}
          <div className="h-full flex flex-col">
            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
              <div className={`min-h-full ${
                darkMode ? 'bg-gray-900' : 'bg-gray-50'
              }`}>
                {/* Page Wrapper with enhanced padding and responsive design */}
                <div className="max-w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                  {/* Quick Actions Bar - Only visible on larger screens */}
                  <div className="hidden lg:flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      {/* Breadcrumb placeholder - could be enhanced */}
                      <nav className="flex items-center space-x-2">
                        <span className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Home
                        </span>
                        <span className={`text-sm ${
                          darkMode ? 'text-gray-600' : 'text-gray-300'
                        }`}>
                          /
                        </span>
                        <span className={`text-sm font-medium ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          Dashboard
                        </span>
                      </nav>
                    </div>
                    
                   
                  </div>

                  {/* Mobile Quick Actions */}
                  <div className="lg:hidden mb-6">
                    <div className="flex space-x-3">
                      <button className={`
                        flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200
                        ${darkMode 
                          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                        }
                        border border-gray-200 dark:border-gray-700
                      `}>
                        Quick Scan
                      </button>
                      <button className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium text-sm rounded-xl transition-all duration-200">
                        Add Product
                      </button>
                    </div>
                  </div>

                  {/* Page Content */}
                  <div className={`
                    transition-all duration-300 ease-in-out pb-20
                    ${darkMode ? 'text-gray-100' : 'text-gray-900'}
                  `}>
                    <Suspense 
                      fallback={
                        <div className={`flex items-center justify-center min-h-96 ${
                          darkMode ? 'bg-gray-800' : 'bg-white'
                        } rounded-2xl shadow-sm border ${
                          darkMode ? 'border-gray-700' : 'border-gray-200'
                        }`}>
                          <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg mb-4">
                              <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                            </div>
                            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              Loading...
                            </h3>
                            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Please wait
                            </p>
                          </div>
                        </div>
                      }
                    >
                      {children || <Outlet />}
                    </Suspense>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer - Fixed at bottom of main content only */}
            <div className={`
              border-t transition-colors duration-200 flex-shrink-0
              ${darkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
              }
            `}>
              <div className="max-w-full px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`text-xs ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      © 2024 LogisticF1. All rights reserved.
                    </div>
                    <div className="hidden md:flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      <span className={`text-xs ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        System Online
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`text-xs ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      v1.0.0
                    </span>
                    {/* Real-time clock */}
                    <div className={`text-xs font-mono ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {new Date().toLocaleTimeString('id-ID', { 
                        hour: '2-digit', 
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;