// src/pages/dashboard/Dashboard.tsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useDashboardStats, useDashboardTrends, useActivityFeed } from '../../hooks/useDashboard';
import StatCard from '../../components/ui/StatCard';
import BarChart from '../../components/charts/BarChart';
import LineChart from '../../components/charts/LineChart';
import RecentTransactionsTable from '../../components/tables/RecentTransactionsTable';
import LowStockTable from '../../components/tables/LowStockTable';
import PageLoadingSpinner from '../../components/ui/PageLoadingSpinner';
import ErrorBoundary from '../../components/ErrorBoundary';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  
  // Fetch dashboard data
  const { stats, loading: statsLoading, error: statsError } = useDashboardStats();
  const { trends, loading: trendsLoading } = useDashboardTrends(6);
  const { activities, loading: activitiesLoading } = useActivityFeed(10);

  // Format stats for StatCard components
  const formatStats = (stats: any) => {
    if (!stats) return [];
    
    return [
      {
        id: 1,
        title: 'Total Products',
        value: stats.overview.totalProducts.toLocaleString(),
        change: `${stats.productStats.byStatus.find((s: any) => s.status === 'Available')?.count || 0} available`,
        isPositive: true,
        icon: 'BoxIcon'
      },
      {
        id: 2,
        title: 'Total Categories',
        value: stats.overview.totalCategories.toString(),
        change: `${stats.overview.totalSuppliers} suppliers`,
        isPositive: true,
        icon: 'CategoryIcon'
      },
      {
        id: 3,
        title: 'Total Transactions',
        value: stats.overview.totalTransactions.toLocaleString(),
        change: `${stats.transactions.recent.length} recent`,
        isPositive: true,
        icon: 'TransactionIcon'
      },
      {
        id: 4,
        title: 'Low Stock Items',
        value: stats.alerts.lowStockProducts.length.toString(),
        change: stats.alerts.lowStockProducts.length > 0 ? 'Needs attention' : 'All good',
        isPositive: stats.alerts.lowStockProducts.length === 0,
        icon: 'AlertIcon'
      },
    ];
  };

  // Format data for charts
  const formatCategoryData = (stats: any) => {
    if (!stats?.productStats?.byCategory) return [];
    
    return stats.productStats.byCategory.map((item: any) => ({
      name: item.category,
      value: item.count
    }));
  };

  const formatTrendsData = (trends: any[]) => {
    if (!trends || trends.length === 0) return [];
    
    // Group by month and transaction type
    const monthlyData: { [key: string]: any } = {};
    
    trends.forEach((trend: any) => {
      if (!monthlyData[trend.month]) {
        monthlyData[trend.month] = {
          month: trend.month,
          check_out: 0,
          check_in: 0,
          maintenance: 0,
          repair: 0
        };
      }
      monthlyData[trend.month][trend.transaction_type] = parseInt(trend.count);
    });
    
    return Object.values(monthlyData);
  };

  if (statsLoading) {
    return <PageLoadingSpinner />;
  }

  if (statsError) {
    return <ErrorBoundary message={statsError} />;
  }

  const statCards = formatStats(stats);
  const categoryData = formatCategoryData(stats);
  const trendsData = formatTrendsData(trends);

  return (
    <>
    
      {/* Welcome message */}
      <div className="mb-6 bg-gray-100 dark:bg-gray-900">
        <h1 className="text-2xl font-semibold bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Welcome back, {user?.full_name || 'User'}! Here's what's happening with your inventory today.
        </p>
        {stats?.overview?.totalInventoryValue && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Total Inventory Value: ${stats.overview.totalInventoryValue.toLocaleString()}
          </p>
        )}
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map(stat => (
          <StatCard 
            key={stat.id}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            isPositive={stat.isPositive}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Alert Messages */}
      {stats?.alerts && (
        <div className="mb-8">
          {/* Warranty Expiry Alert */}
          {stats.alerts.productsNearWarrantyExpiry.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    {stats.alerts.productsNearWarrantyExpiry.length} products have warranties expiring within 30 days
                  </h3>
                </div>
              </div>
            </div>
          )}

          {/* Maintenance Alert */}
          {stats.alerts.productsRequiringMaintenance.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    {stats.alerts.productsRequiringMaintenance.length} products require maintenance
                  </h3>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Inventory by Category */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Inventory by Category
          </h2>
          <div className="h-80">
            {categoryData.length > 0 ? (
              <BarChart data={categoryData} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No category data available
              </div>
            )}
          </div>
        </div>
        
        {/* Transaction Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Transaction Trends (Last 6 Months)
          </h2>
          <div className="h-80">
            {!trendsLoading && trendsData.length > 0 ? (
              <LineChart data={trendsData} />
            ) : trendsLoading ? (
              <div className="flex items-center justify-center h-full">
                <PageLoadingSpinner size="sm" />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No trend data available
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Transactions
            </h2>
          </div>
          <div className="p-4">
            {!activitiesLoading ? (
              <RecentTransactionsTable transactions={activities} />
            ) : (
              <div className="flex items-center justify-center py-8">
                <PageLoadingSpinner size="sm" />
              </div>
            )}
          </div>
        </div>
        
        {/* Low Stock Alert */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <span>Low Stock Items</span>
              {stats?.alerts?.lowStockProducts && (
                <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                  stats.alerts.lowStockProducts.length > 0 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                }`}>
                  {stats.alerts.lowStockProducts.length} items
                </span>
              )}
            </h2>
          </div>
          <div className="p-4">
            {stats?.alerts?.lowStockProducts ? (
              <LowStockTable lowStockItems={stats.alerts.lowStockProducts} />
            ) : (
              <div className="flex items-center justify-center py-8">
                <PageLoadingSpinner size="sm" />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;