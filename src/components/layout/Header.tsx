// src/components/layout/Header.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MoonIcon, 
  SunIcon, 
  MenuIcon, 
  BellIcon, 
  SearchIcon,
  UserCircleIcon,
  LogoutIcon,
  CogIcon
} from '../../components/ui/Icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  username: string;
  role: string;
}

interface HeaderProps {
  user: User | null;
  onMenuClick: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  user, 
  onMenuClick, 
  darkMode, 
  onToggleDarkMode 
}) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Enhanced notifications with categories
  const notifications = [
    {
      id: 1,
      message: 'Low stock alert: Printer Paper (ID: 58291)',
      detail: 'Current stock: 5 units, Minimum required: 50 units',
      time: '5 minutes ago',
      isNew: true,
      type: 'warning',
      icon: '⚠️'
    },
    {
      id: 2,
      message: 'New transaction completed',
      detail: 'Order #10045 processed successfully',
      time: '30 minutes ago',
      isNew: true,
      type: 'success',
      icon: '✅'
    },
    {
      id: 3,
      message: 'Monthly inventory report available',
      detail: 'Click to download or view online',
      time: '2 hours ago',
      isNew: false,
      type: 'info',
      icon: '📊'
    },
    {
      id: 4,
      message: 'New supplier registration',
      detail: 'PT Teknologi Maju has been approved',
      time: '1 day ago',
      isNew: false,
      type: 'info',
      icon: '🚚'
    },
  ];

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (isUserMenuOpen) setIsUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    if (isNotificationsOpen) setIsNotificationsOpen(false);
  };

  const newNotificationsCount = notifications.filter(n => n.isNew).length;

  return (
    <header className={`
      ${darkMode 
        ? 'bg-gray-900 border-gray-700' 
        : 'bg-white border-gray-200'
      } 
      border-b shadow-sm transition-all duration-200 backdrop-blur-sm
    `}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left Section */}
          <div className="flex items-center flex-1">
            {/* Mobile menu button */}
            <button
              type="button"
              className={`
                lg:hidden p-2 rounded-xl transition-all duration-200
                ${darkMode 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }
                focus:outline-none focus:ring-2 focus:ring-indigo-500
              `}
              onClick={onMenuClick}
            >
              <MenuIcon className="h-6 w-6" />
            </button>
            
            {/* Search bar - Enhanced */}
            <div className="flex-1 max-w-2xl ml-4 lg:ml-8">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <SearchIcon className={`h-5 w-5 transition-colors ${
                    darkMode ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                </div>
                <input
                  type="text"
                  className={`
                    block w-full pl-12 pr-4 py-3 rounded-2xl transition-all duration-200
                    ${darkMode 
                      ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400 focus:bg-gray-750' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:bg-white'
                    }
                    border focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                    hover:shadow-md focus:shadow-lg
                  `}
                  placeholder="Search products, categories, or scan barcode..."
                />
                {/* Search suggestions could be added here */}
              </div>
            </div>
          </div>
          
          {/* Right section */}
          <div className="flex items-center space-x-3">
            {/* Quick Stats - Hidden on small screens */}
            <div className="hidden xl:flex items-center space-x-4 mr-6">
              <div className={`px-3 py-2 rounded-xl ${
                darkMode ? 'bg-gray-800' : 'bg-gray-50'
              }`}>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Today's Scans</div>
                <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>1,247</div>
              </div>
              <div className={`px-3 py-2 rounded-xl ${
                darkMode ? 'bg-gray-800' : 'bg-gray-50'
              }`}>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Low Stock</div>
                <div className="text-lg font-bold text-red-500">23</div>
              </div>
            </div>

            {/* Dark/Light mode toggle */}
            <button
              onClick={onToggleDarkMode}
              className={`
                p-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500
                ${darkMode 
                  ? 'text-gray-400 hover:text-yellow-400 hover:bg-gray-800' 
                  : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-100'
                }
              `}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <SunIcon className="h-6 w-6" />
              ) : (
                <MoonIcon className="h-6 w-6" />
              )}
            </button>
            
            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                className={`
                  relative p-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500
                  ${darkMode 
                    ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }
                `}
                onClick={toggleNotifications}
                aria-label="View notifications"
              >
                {newNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{newNotificationsCount}</span>
                  </span>
                )}
                <BellIcon className="h-6 w-6" />
              </button>
              
              {/* Enhanced Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className={`
                  origin-top-right absolute right-0 mt-3 w-96 rounded-2xl shadow-2xl ring-1 ring-black ring-opacity-5 z-50 transition-all duration-200
                  ${darkMode ? 'bg-gray-800' : 'bg-white'}
                `}>
                  <div className={`px-6 py-4 border-b ${
                    darkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <h3 className={`text-lg font-semibold ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Notifications
                      </h3>
                      {newNotificationsCount > 0 && (
                        <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded-full text-xs font-medium">
                          {newNotificationsCount} new
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className={`px-6 py-8 text-center ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        <BellIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No new notifications</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {notifications.map((notification) => (
                          <div 
                            key={notification.id}
                            className={`
                              px-6 py-4 transition-colors duration-150 cursor-pointer
                              ${notification.isNew 
                                ? darkMode 
                                  ? 'bg-indigo-900 bg-opacity-20 hover:bg-opacity-30' 
                                  : 'bg-indigo-50 hover:bg-indigo-100'
                                : darkMode 
                                  ? 'hover:bg-gray-700' 
                                  : 'hover:bg-gray-50'
                              }
                            `}
                          >
                            <div className="flex items-start space-x-3">
                              <span className="text-2xl">{notification.icon}</span>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${
                                  darkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {notification.message}
                                </p>
                                <p className={`text-sm mt-1 ${
                                  darkMode ? 'text-gray-300' : 'text-gray-600'
                                }`}>
                                  {notification.detail}
                                </p>
                                <p className={`text-xs mt-2 ${
                                  darkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  {notification.time}
                                </p>
                              </div>
                              {notification.isNew && (
                                <div className="flex-shrink-0">
                                  <span className="inline-block h-2 w-2 rounded-full bg-indigo-500"></span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className={`px-6 py-4 border-t ${
                    darkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <button className={`w-full text-center py-2 px-4 rounded-xl transition-colors ${
                      darkMode 
                        ? 'text-indigo-400 hover:text-indigo-300 hover:bg-gray-700' 
                        : 'text-indigo-600 hover:text-indigo-700 hover:bg-gray-50'
                    }`}>
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Enhanced User menu */}
            <div className="relative">
              <button
                type="button"
                className={`
                  flex items-center space-x-3 p-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500
                  ${darkMode 
                    ? 'hover:bg-gray-800' 
                    : 'hover:bg-gray-100'
                  }
                `}
                onClick={toggleUserMenu}
                aria-label="User menu"
              >
                <div className="hidden md:block text-right">
                  <div className={`text-sm font-semibold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {user?.name || 'Admin User'}
                  </div>
                  <div className={`text-xs ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {user?.role || 'Administrator'}
                  </div>
                </div>
                <div className="relative">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">
                      {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'AU'}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-900"></div>
                </div>
              </button>
              
              {/* Enhanced Profile dropdown */}
              {isUserMenuOpen && (
                <div className={`
                  origin-top-right absolute right-0 mt-3 w-64 rounded-2xl shadow-2xl ring-1 ring-black ring-opacity-5 z-50
                  ${darkMode ? 'bg-gray-800' : 'bg-white'}
                `}>
                  {/* User info section */}
                  <div className={`px-6 py-4 border-b ${
                    darkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-bold">
                          {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'AU'}
                        </span>
                      </div>
                      <div>
                        <p className={`font-semibold ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {user?.name || 'Admin User'}
                        </p>
                        <p className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {user?.username || '@admin'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu items */}
                  <div className="py-2">
                    <Link
                      to="/profile"
                      className={`
                        flex items-center px-6 py-3 text-sm transition-colors duration-150
                        ${darkMode 
                          ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                        }
                      `}
                    >
                      <UserCircleIcon className={`h-5 w-5 mr-3 ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      Your Profile
                    </Link>
                    <Link
                      to="/settings"
                      className={`
                        flex items-center px-6 py-3 text-sm transition-colors duration-150
                        ${darkMode 
                          ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                        }
                      `}
                    >
                      <CogIcon className={`h-5 w-5 mr-3 ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      Settings
                    </Link>
                    <div className={`border-t my-2 ${
                      darkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}></div>
                    <button
                      className={`
                        w-full flex items-center px-6 py-3 text-sm transition-colors duration-150
                        ${darkMode 
                          ? 'text-red-400 hover:text-red-300 hover:bg-gray-700' 
                          : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                        }
                      `}
                      onClick={handleLogout}
                    >
                      <LogoutIcon className="h-5 w-5 mr-3" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;