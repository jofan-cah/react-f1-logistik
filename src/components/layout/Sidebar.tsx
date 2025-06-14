// src/components/layout/Sidebar.tsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Logo from '../ui/Logo';
import {
  Home,
  Package,
  Tag,
  Users,
  Truck,
  BarChart3,
  Settings,
  Bell,
  Scan,
  X,
  Lock, // Icon untuk User Levels
  ArrowRightCircle, // Check Out
  ArrowLeftCircle,  // Check In
  Wrench, // Repair
  AlertTriangle, // Lost
  ClipboardList, // Transaction History
} from 'lucide-react';

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
      icon: <Home className="h-5 w-5" />,
      description: 'Overview & Analytics'
    },
    { 
      name: 'Products', 
      path: '/products', 
      icon: <Package className="h-5 w-5" />,
      description: 'Inventory Management'
    },
    { 
      name: 'Categories', 
      path: '/categories', 
      icon: <Tag className="h-5 w-5" />,
      description: 'Product Categories'
    },
    { 
      name: 'Suppliers', 
      path: '/suppliers', 
      icon: <Truck className="h-5 w-5" />,
      description: 'Vendor Management'
    },
    { 
      name: 'Purchasing', 
      path: '/purchasing', 
      icon: <BarChart3 className="h-5 w-5" />,
      description: 'Purchase Receipts & PO'
    },
    { 
      name: 'Pengadaan', 
      path: '/pengadaan', 
      icon: <Bell className="h-5 w-5" />,
      description: 'Procurement Management'
    },
    // UPDATED: Transaction menu dengan sub-menu
    { 
      name: 'Transactions', 
      path: '/transactions', 
      icon: <Scan className="h-5 w-5" />,
      description: 'Asset Transactions',
      subItems: [
        {
          name: 'Check Out',
          path: '/transactions/check-out',
          icon: <ArrowRightCircle className="h-4 w-4" />,
          description: 'Issue/Borrow Assets'
        },
        {
          name: 'Check In',
          path: '/transactions/check-in',
          icon: <ArrowLeftCircle className="h-4 w-4" />,
          description: 'Return Assets'
        },
        {
          name: 'Repair',
          path: '/transactions/repair',
          icon: <Wrench className="h-4 w-4" />,
          description: 'Maintenance & Repair'
        },
        {
          name: 'Lost',
          path: '/transactions/lost',
          icon: <AlertTriangle className="h-4 w-4" />,
          description: 'Report Lost Assets'
        },
        {
          name: 'All Transactions',
          path: '/transactions/history',
          icon: <ClipboardList className="h-4 w-4" />,
          description: 'Transaction History'
        }
      ]
    },
    { 
      name: 'Users', 
      path: '/users', 
      icon: <Users className="h-5 w-5" />,
      description: 'User Management'
    },
    { 
      name: 'User Levels', 
      path: '/user-levels', 
      icon: <Lock className="h-5 w-5" />,
      description: 'Roles & Permissions'
    }
  ];

  const [expandedMenu, setExpandedMenu] = React.useState<string | null>(null);

  // Auto-expand transactions menu if we're on a transaction page
  React.useEffect(() => {
    if (location.pathname.startsWith('/transactions')) {
      setExpandedMenu('Transactions');
    }
  }, [location.pathname]);

  const toggleSubmenu = (menuName: string) => {
    setExpandedMenu(expandedMenu === menuName ? null : menuName);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        ></div>
      )}
      
      {/* Sidebar Container */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-30 w-72 
          transition-transform transform lg:relative lg:translate-x-0 
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${darkMode ? 'bg-gray-900' : 'bg-white'} 
          shadow-2xl
        `}
      >
        {/* Sidebar Inner Container */}
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
                <Package className="w-6 h-6 text-indigo-600" />
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
              <X className="w-5 h-5" />
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
                  (item.path === '/user-levels' && location.pathname.startsWith('/user-levels')) ||
                  (item.path === '/purchasing' && location.pathname.startsWith('/purchasing')) ||
                  (item.path === '/pengadaan' && location.pathname.startsWith('/pengadaan')) ||
                  (item.path === '/transactions' && location.pathname.startsWith('/transactions'));
                
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isExpanded = expandedMenu === item.name;

                return (
                  <div key={item.name}>
                    {/* Main menu item */}
                    <div
                      className={`
                        group relative flex items-center px-3 py-2 text-sm font-medium rounded-lg 
                        transition-all duration-200 ease-in-out cursor-pointer
                        ${isActive && !hasSubItems
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                          : isActive && hasSubItems
                            ? darkMode
                              ? 'bg-gray-800 text-white'
                              : 'bg-gray-100 text-gray-900'
                            : darkMode
                              ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                      onClick={() => hasSubItems ? toggleSubmenu(item.name) : null}
                    >
                      {/* Icon with background */}
                      <div className={`
                        flex items-center justify-center w-8 h-8 rounded-lg mr-3 transition-colors
                        ${isActive && !hasSubItems
                          ? 'bg-white bg-opacity-20'
                          : darkMode
                            ? 'bg-gray-800 group-hover:bg-gray-700'
                            : 'bg-gray-100 group-hover:bg-gray-200'
                        }
                      `}>
                        {React.cloneElement(item.icon, {
                          className: `w-4 h-4 ${
                            isActive && !hasSubItems
                              ? 'text-white' 
                              : darkMode 
                                ? 'text-gray-400 group-hover:text-gray-200'
                                : 'text-gray-500 group-hover:text-gray-700'
                          }`
                        })}
                      </div>
                      
                      {/* Text content */}
                      <div className="flex-1">
                        {hasSubItems ? (
                          <div className="font-medium text-sm">{item.name}</div>
                        ) : (
                          <NavLink to={item.path} className="block">
                            <div className="font-medium text-sm">{item.name}</div>
                          </NavLink>
                        )}
                        <div className={`text-xs mt-0.5 ${
                          isActive && !hasSubItems
                            ? 'text-white text-opacity-70' 
                            : darkMode
                              ? 'text-gray-400'
                              : 'text-gray-500'
                        }`}>
                          {item.description}
                        </div>
                      </div>
                      
                      {/* Expand/Collapse icon for submenus */}
                      {hasSubItems && (
                        <div className={`
                          transform transition-transform duration-200 
                          ${isExpanded ? 'rotate-90' : 'rotate-0'}
                        `}>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      
                      {/* Active indicator */}
                      {isActive && !hasSubItems && (
                        <div className="absolute right-2 w-1.5 h-6 bg-white rounded-full opacity-80"></div>
                      )}
                    </div>

                    {/* Submenu items */}
                    {hasSubItems && isExpanded && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.subItems!.map((subItem) => {
                          const isSubActive = location.pathname === subItem.path;
                          
                          return (
                            <NavLink
                              key={subItem.name}
                              to={subItem.path}
                              className={`
                                group flex items-center px-3 py-2 text-sm rounded-lg 
                                transition-all duration-200 ease-in-out
                                ${isSubActive
                                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                                  : darkMode
                                    ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                }
                              `}
                            >
                              {/* Sub-item icon */}
                              <div className={`
                                flex items-center justify-center w-6 h-6 rounded-md mr-3 transition-colors
                                ${isSubActive
                                  ? 'bg-white bg-opacity-20'
                                  : darkMode
                                    ? 'bg-gray-800 group-hover:bg-gray-700'
                                    : 'bg-gray-100 group-hover:bg-gray-200'
                                }
                              `}>
                                {React.cloneElement(subItem.icon, {
                                  className: `w-3 h-3 ${
                                    isSubActive 
                                      ? 'text-white' 
                                      : darkMode 
                                        ? 'text-gray-500 group-hover:text-gray-300'
                                        : 'text-gray-400 group-hover:text-gray-600'
                                  }`
                                })}
                              </div>
                              
                              {/* Sub-item text */}
                              <div className="flex-1">
                                <div className="font-medium text-sm">{subItem.name}</div>
                                <div className={`text-xs mt-0.5 ${
                                  isSubActive 
                                    ? 'text-white text-opacity-70' 
                                    : darkMode
                                      ? 'text-gray-500'
                                      : 'text-gray-400'
                                }`}>
                                  {subItem.description}
                                </div>
                              </div>
                              
                              {/* Sub-item active indicator */}
                              {isSubActive && (
                                <div className="w-1 h-4 bg-white rounded-full opacity-80"></div>
                              )}
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
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