// src/App.tsx - ADD NEW LAZY IMPORTS
import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// Components to load eagerly (critical path)
import MainLayout from './components/layout/MainLayout';
import Login from './pages/auth/Login';

// Lazy-loaded components
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));

// Category
const Category = lazy(() => import('./pages/categories/ListCategory'));
const CategoryDetail = lazy(() => import('./pages/categories/CategoryDetail'));
const CategoryForm = lazy(() => import('./pages/categories/CategoryForm'));

// Supplier
const Supplier = lazy(() => import('./pages/suppliers/SuppliersList'));
const SupplierDetail = lazy(() => import('./pages/suppliers/SupplierDetail'));
const SupplierForm = lazy(() => import('./pages/suppliers/SupplierForm'));

// Purchasing
const PurchasingList = lazy(() => import('./pages/purchasing/PurchasingList'));
const PurchasingDetail = lazy(() => import('./pages/purchasing/PurchasingDetail'));
const PurchasingForm = lazy(() => import('./pages/purchasing/PurchasingForm'));

// Pengadaan
const PengadaanList = lazy(() => import('./pages/pengadaan/PengadaanList'));

// Transactions - EXISTING
const TransactionsList = lazy(() => import('./pages/transactions/TransactionsList'));
const TransactionDetail = lazy(() => import('./pages/transactions/TransactionDetail'));
const TransactionForm = lazy(() => import('./pages/transactions/TransactionForm'));
const Scanner = lazy(() => import('./pages/transactions/Scanner'));

// Transactions - NEW DEDICATED PAGES
const CheckOut = lazy(() => import('./pages/transactions/CheckOut'));
const CheckIn = lazy(() => import('./pages/transactions/CheckIn'));
const Repair = lazy(() => import('./pages/transactions/Repair'));
const Lost = lazy(() => import('./pages/transactions/Lost'));
const TransactionHistory = lazy(() => import('./pages/transactions/TransactionHistory'));

// Product
const ProductsList = lazy(() => import('./pages/products/ProductsList'));
const ProductForm = lazy(() => import('./pages/products/ProductForm'));
const ProductDetail = lazy(() => import('./pages/products/ProductDetail'));

// Users
const UsersList = lazy(() => import('./pages/users/UsersList'));
const UsersForm = lazy(() => import('./pages/users/UserForm'));
const UsersDetail = lazy(() => import('./pages/users/UserDetail'));

// User Levels
const UserLevels = lazy(() => import('./pages/user-levels/UserLevels'));

const NotFound = lazy(() => import('./pages/NotFound'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
    <div className="w-16 h-16 border-t-4 border-b-4 border-indigo-500 dark:border-indigo-400 rounded-full animate-spin"></div>
    <p className="ml-4 text-gray-600 dark:text-gray-400">Loading...</p>
  </div>
);

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading, user } = useAuth();

  console.log('ProtectedRoute - Auth status:', { isAuthenticated, loading, user: !!user });

  if (loading) {
    console.log('ProtectedRoute - Still loading auth...');
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute - Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('ProtectedRoute - Authenticated, rendering children');
  return <>{children}</>;
};

// Public route component (redirect if already authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  console.log('PublicRoute - Auth status:', { isAuthenticated, loading });

  if (loading) {
    console.log('PublicRoute - Still loading auth...');
    return <LoadingFallback />;
  }

  if (isAuthenticated) {
    console.log('PublicRoute - Already authenticated, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('PublicRoute - Not authenticated, showing login');
  return <>{children}</>;
};

// App Routes Component
const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected routes with MainLayout */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* Categories */}
          <Route path="categories" element={<Category />} />
          <Route path="categories/create" element={<CategoryForm />} />
          <Route path="categories/:id" element={<CategoryDetail />} />
          <Route path="categories/edit/:id" element={<CategoryForm />} />

          {/* Suppliers */}
          <Route path="suppliers" element={<Supplier />} />
          <Route path="suppliers/create" element={<SupplierForm />} />
          <Route path="suppliers/:id" element={<SupplierDetail />} />
          <Route path="suppliers/edit/:id" element={<SupplierForm />} />

          {/* Purchasing */}
          <Route path="purchasing" element={<PurchasingList />} />
          <Route path="purchasing/create" element={<PurchasingForm mode="create" />} />
          <Route path="purchasing/edit/:id" element={<PurchasingForm mode="edit" />} />
          <Route path="purchasing/:id" element={<PurchasingDetail />} />

          {/* Pengadaan */}
          <Route path="pengadaan" element={<PengadaanList />} />

          {/* Transactions - NEW DEDICATED ROUTES */}
          <Route path="transactions" element={<TransactionHistory />} /> {/* Default to history */}
          <Route path="transactions/check-out" element={<CheckOut />} />
          <Route path="transactions/check-in" element={<CheckIn />} />
          <Route path="transactions/repair" element={<Repair />} />
          <Route path="transactions/lost" element={<Lost />} />
          <Route path="transactions/history" element={<TransactionHistory />} />
          
          {/* Transactions - EXISTING ROUTES (keep for backward compatibility) */}
          <Route path="transactions/new" element={<TransactionForm mode="create" />} />
          <Route path="transactions/:id" element={<TransactionDetail />} />
          <Route path="transactions/edit/:id" element={<TransactionForm mode="edit" />} />

          {/* Scanner - SEPARATE ROUTE */}
          <Route path="scanner" element={<Scanner />} />

          {/* Products */}
          <Route path="products" element={<ProductsList />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />
          <Route path="products/:id" element={<ProductDetail />} />

          {/* Users */}
          <Route path="users" element={<UsersList />} />
          <Route path="users/create" element={<UsersForm mode="create" />} />
          <Route path="users/edit/:id" element={<UsersForm mode="edit" />} />
          <Route path="users/:id" element={<UsersDetail />} />

          {/* User Levels */}
          <Route path="user-levels/*" element={<UserLevels />} />
        </Route>

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    console.log('App component mounted');
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <AppRoutes />
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;