// src/pages/auth/Login.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/ui/Logo';
import Button from '../../components/ui/Button';
import TextInput from '../../components/forms/TextInput';

// Define the validation schema
const loginSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading, error, clearError, isAuthenticated } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated && !loading) {
      console.log('User already authenticated, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, navigate]);

  // Clear error when component mounts
  React.useEffect(() => {
    return () => {
      if (clearError) clearError();
    };
  }, [clearError]);
  
  const onSubmit = async (data: LoginFormData) => {
    // Clear any existing errors
    if (clearError) clearError();
    
    try {
      console.log('Attempting login with:', data.username); // Debug log
      const success = await login(data.username, data.password);
      console.log('Login success:', success); // Debug log
      
      if (success) {
        console.log('Navigating to dashboard...'); // Debug log
        navigate('/dashboard');
      }
      // Error handling is managed by AuthContext
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const handleInputChange = () => {
    if (error && clearError) {
      clearError();
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Left side - Branded section */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 bg-indigo-600 text-white">
        <div className="max-w-md">
          <div className="mb-8">
            <Logo size="xl" />
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            ISP Barcode System
          </h1>
          
          <p className="text-lg text-indigo-100 mb-8">
            Streamline your inventory management with our advanced barcode tracking solution
          </p>
          
          <div className="grid grid-cols-2 gap-6 mt-12">
            <div className="border border-indigo-400 rounded-lg p-4">
              <div className="text-indigo-200 mb-2 text-sm font-medium">Quick Tracking</div>
              <div className="font-semibold">Scan & track inventory in seconds</div>
            </div>
            
            <div className="border border-indigo-400 rounded-lg p-4">
              <div className="text-indigo-200 mb-2 text-sm font-medium">Real-time Updates</div>
              <div className="font-semibold">Instant stock level monitoring</div>
            </div>
            
            <div className="border border-indigo-400 rounded-lg p-4">
              <div className="text-indigo-200 mb-2 text-sm font-medium">Detailed Reports</div>
              <div className="font-semibold">Comprehensive analytics & insights</div>
            </div>
            
            <div className="border border-indigo-400 rounded-lg p-4">
              <div className="text-indigo-200 mb-2 text-sm font-medium">Multi-platform</div>
              <div className="font-semibold">Works on desktop, mobile & tablets</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="lg:hidden mb-6">
              <Logo size="lg" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-600">Sign in to your account</p>
          </div>
          
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-5">
              <TextInput
                id="username"
                label="Username"
                type="text"
                autoComplete="username"
                {...register('username')}
                error={errors.username?.message}
                disabled={loading}
                onChange={() => error && clearError()} // Clear error when user types
              />
              
              <TextInput
                id="password"
                label="Password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
                error={errors.password?.message}
                disabled={loading}
                onChange={() => error && clearError()} // Clear error when user types
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  disabled={loading}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              
              <div className="text-sm">
                <a 
                  href="#" 
                  className="font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
                  onClick={(e) => loading && e.preventDefault()}
                >
                  Forgot password?
                </a>
              </div>
            </div>
            
            <div>
              <Button 
                type="submit"
                variant="primary"
                isLoading={loading}
                disabled={loading}
                fullWidth
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
          </form>
          
          <p className="mt-8 text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} ISP Barcode System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;