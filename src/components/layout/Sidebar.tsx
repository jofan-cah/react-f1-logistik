// src/components/layout/Sidebar.tsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Logo from '../ui/Logo';
import {
  HomeIcon,
  BoxIcon,
  TagIcon,
  UsersIcon,
  TruckIcon,
  ChartBarIcon,
  SettingsIcon,
  ScannerIcon,
  XIcon,
  LockOutlined // Icon untuk User Levels
} from '../ui/Icons';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, darkMode }) => {
  const location = useLocation();
  
  // Define navigation items with descriptions
  const navigationItems = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: <HomeIcon className="h-5 w-5" />,
      description: 'Overview & Analytics'
    },
    { 
      name: 'Products', 
      path: '/products', 
      icon: <BoxIcon className="h-5 w-5" />,
      description: 'Inventory Management'
    },
    { 
      name: 'Categories', 
      path: '/categories', 
      icon: <TagIcon className="h-5 w-5" />,
      description: 'Product Categories'
    },
    { 
      name: 'Suppliers', 
      path: '/suppliers', 
      icon: <TruckIcon className="h-5 w-5" />,
      description: 'Vendor Management'
    },
    { 
      name: 'Transactions', 
      path: '/transactions', 
      icon: <ScannerIcon className="h-5 w-5" />,
      description: 'Barcode Transactions'
    },
    { 
      name: 'Users', 
      path: '/users', 
      icon: <UsersIcon className="h-5 w-5" />,
      description: 'User Management'
    },
    { 
      name: 'User Levels', 
      path: '/user-levels', 
      icon: <LockOutlined className="h-5 w-5" />,
      description: 'Roles & Permissions'
    },
    // { 
    //   name: 'Reports', 
    //   path: '/reports', 
    //   icon: <ChartBarIcon className="h-5 w-5" />,
    //   description: 'Analytics & Reports'
    // }
  ];
  
  // const secondaryNavItems = [
  //   { 
  //     name: 'Settings', 
  //     path: '/settings', 
  //     icon: <SettingsIcon className="h-5 w-5" />,
  //     description: 'App Configuration'
  //   }
  // ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        ></div>
      )}
      
      {/* Sidebar Container - Designed to work with MainLayout */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-30 w-72 
          transition-transform transform lg:relative lg:translate-x-0 
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${darkMode ? 'bg-gray-900' : 'bg-white'} 
          shadow-2xl
        `}
      >
        {/* Sidebar Inner Container - Full height with flex layout */}
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className={`
            flex items-center justify-between h-20 px-6 flex-shrink-0
            ${darkMode 
              ? 'bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700' 
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 border-b border-indigo-100'
            }
          `}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <BoxIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="text-white">
                <h2 className="text-lg font-bold">Logistic</h2>
                <p className="text-xs opacity-80">Fiber One</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-white hover:bg-white hover:bg-opacity-20 lg:hidden transition-colors"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
          
          {/* Scrollable Navigation Content */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            {/* Main Navigation */}
            <div className="space-y-1">
              <div className={`text-xs font-semibold uppercase tracking-wider px-3 mb-3 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Main Menu
              </div>
              
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.path || 
                  (item.path === '/user-levels' && location.pathname.startsWith('/user-levels'));
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={`
                      group relative flex items-center px-3 py-2 text-sm font-medium rounded-lg 
                      transition-all duration-200 ease-in-out
                      ${isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                        : darkMode
                          ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    {/* Icon with background */}
                    <div className={`
                      flex items-center justify-center w-8 h-8 rounded-lg mr-3 transition-colors
                      ${isActive
                        ? 'bg-white bg-opacity-20'
                        : darkMode
                          ? 'bg-gray-800 group-hover:bg-gray-700'
                          : 'bg-gray-100 group-hover:bg-gray-200'
                      }
                    `}>
                      {React.cloneElement(item.icon, {
                        className: `w-4 h-4 ${
                          isActive 
                            ? 'text-white' 
                            : darkMode 
                              ? 'text-gray-400 group-hover:text-gray-200'
                              : 'text-gray-500 group-hover:text-gray-700'
                        }`
                      })}
                    </div>
                    
                    {/* Text content */}
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className={`text-xs mt-0.5 ${
                        isActive 
                          ? 'text-white text-opacity-70' 
                          : darkMode
                            ? 'text-gray-400'
                            : 'text-gray-500'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute right-2 w-1.5 h-6 bg-white rounded-full opacity-80"></div>
                    )}
                  </NavLink>
                );
              })}
            </div>
            
            {/* Secondary navigation */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className={`text-xs font-semibold uppercase tracking-wider px-3 mb-3 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                System
              </div>
              
              {/* {secondaryNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={`
                      group relative flex items-center px-3 py-2 text-sm font-medium rounded-lg 
                      transition-all duration-200 ease-in-out
                      ${isActive
                        ? 'bg-gradient-to-r from-gray-700 to-gray-600 text-white shadow-md'
                        : darkMode
                          ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <div className={`
                      flex items-center justify-center w-8 h-8 rounded-lg mr-3 transition-colors
                      ${isActive
                        ? 'bg-white bg-opacity-20'
                        : darkMode
                          ? 'bg-gray-800 group-hover:bg-gray-700'
                          : 'bg-gray-100 group-hover:bg-gray-200'
                      }
                    `}>
                      {React.cloneElement(item.icon, {
                        className: `w-4 h-4 ${
                          isActive 
                            ? 'text-white' 
                            : darkMode 
                              ? 'text-gray-400 group-hover:text-gray-200'
                              : 'text-gray-500 group-hover:text-gray-700'
                        }`
                      })}
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className={`text-xs mt-0.5 ${
                        isActive 
                          ? 'text-white text-opacity-70' 
                          : darkMode
                            ? 'text-gray-400'
                            : 'text-gray-500'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                  </NavLink>
                );
              })} */}
            </div>
          </div>
          
          {/* Fixed Footer */}
          <div className={`
            flex-shrink-0 p-4 border-t 
            ${darkMode 
              ? 'border-gray-700 bg-gray-800' 
              : 'border-gray-200 bg-gray-50'
            }
          `}>
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-lg font-bold text-indigo-600">AU</span>
                </div>
              </div>
              <div className="flex-1 text-white min-w-0">
                <p className="text-sm font-semibold truncate">Admin User</p>
                <p className="text-xs opacity-80 truncate">System Administrator</p>
              </div>
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
              </div>
            </div>
            
         
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;