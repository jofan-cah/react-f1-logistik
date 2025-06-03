// src/App.tsx
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

// Scanner/Transactions
const Scanner = lazy(() => import('./pages/transactions/TransactionsList'));
const ScannerDetail = lazy(() => import('./pages/transactions/TransactionDetail'));
const ScannerForm = lazy(() => import('./pages/transactions/TransactionForm'));
const ScannerR = lazy(() => import('./pages/transactions/Scanner'));

// Product
const ProductsList = lazy(() => import('./pages/products/ProductsList'));
const ProductForm = lazy(() => import('./pages/products/ProductForm'));
const ProductDetail = lazy(() => import('./pages/products/ProductDetail'));

// Users - FIXED IMPORT PATHS
const UsersList = lazy(() => import('./pages/users/UsersList'));
const UsersForm = lazy(() => import('./pages/users/UserForm'));
const UsersDetail = lazy(() => import('./pages/users/UserDetail'));

// User Levels - NEW IMPORT
const UserLevels = lazy(() => import('./pages/user-levels/UserLevels'));

const NotFound = lazy(() => import('./pages/NotFound'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="w-16 h-16 border-t-4 border-b-4 border-indigo-500 rounded-full animate-spin"></div>
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

          {/* Transactions */}
          <Route path="transactions" element={<Scanner />} />
          <Route path="transactions/new" element={<ScannerForm />} />
          <Route path="scanner" element={<ScannerR />} />
          <Route path="transactions/:id" element={<ScannerDetail />} />
          <Route path="transactions/edit/:id" element={<SupplierForm />} />

          {/* Products */}
          <Route path="products" element={<ProductsList />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />
          <Route path="products/:id" element={<ProductDetail />} />
          
          {/* Users - FIXED ROUTES */}
          <Route path="users" element={<UsersList />} />
          <Route path="users/create" element={<UsersForm mode="create" />} />
          <Route path="users/edit/:id" element={<UsersForm mode="edit" />} />
          <Route path="users/:id" element={<UsersDetail />} />

          {/* User Levels - NEW ROUTES */}
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