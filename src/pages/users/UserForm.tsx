import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Hash,
  Building,
  Shield,
  Eye,
  EyeOff,
  Upload,
  X,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { CreateUserRequest, UpdateUserRequest } from '../../types/user.types';

interface UserFormProps {
  mode: 'create' | 'edit';
}

const UserForm: React.FC<UserFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const {
    currentUser,
    userLevels,
    isLoading,
    error,
    getUserById,
    createUser,
    updateUser,
    fetchUserLevels,
    clearCurrentUser,
    clearError
  } = useUserStore();

  const [showPassword, setShowPassword] = useState(false);
  const [userLevelsLoaded, setUserLevelsLoaded] = useState(false);
  const [formInitialized, setFormInitialized] = useState(false);
  
  const [formData, setFormData] = useState<Partial<CreateUserRequest & UpdateUserRequest>>({
    username: '',
    full_name: '',
    email: '',
    phone: '',
    user_level_id: '',
    department: '',
    is_active: true,
    notes: ''
  });

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Debug state
  const [debugInfo, setDebugInfo] = useState<any>({});

  // Load user levels first
  useEffect(() => {
    const loadUserLevels = async () => {
      try {
        console.log('🔄 Loading user levels...');
        await fetchUserLevels();
        setUserLevelsLoaded(true);
        console.log('✅ User levels loaded:', userLevels);
      } catch (error) {
        console.error('❌ Failed to load user levels:', error);
      }
    };

    loadUserLevels();
  }, [fetchUserLevels]);

  // Initialize form after user levels are loaded
  useEffect(() => {
    if (userLevelsLoaded && userLevels.length > 0 && !formInitialized) {
      console.log('🚀 Initializing form with user levels:', userLevels);
      
      if (mode === 'create') {
        // Use the first available user level as default
        const defaultLevel = userLevels.find(level => 
          level.id === 'staff' || level.level_name.toLowerCase().includes('staff')
        ) || userLevels[0];
        
        console.log('📝 Setting default user level:', defaultLevel);
        
        setFormData({
          username: '',
          full_name: '',
          email: '',
          phone: '',
          user_level_id: defaultLevel.id,
          department: '',
          is_active: true,
          notes: ''
        });
        
        clearCurrentUser();
        setFormInitialized(true);
      } else if (mode === 'edit' && id) {
        console.log('📝 Edit mode - Loading user with ID:', id);
        loadUser();
      }
    }
  }, [userLevelsLoaded, userLevels, mode, id, formInitialized]);

  // Update form when currentUser is loaded (edit mode)
  useEffect(() => {
    if (currentUser && mode === 'edit' && userLevelsLoaded) {
      console.log('📝 Populating form with user data:', currentUser);
      
      // Verify user level exists in available levels
      const userLevelExists = userLevels.find(level => level.id === currentUser.user_level_id);
      if (!userLevelExists) {
        console.warn('⚠️ User level not found in available levels:', currentUser.user_level_id);
      }
      
      setFormData({
        username: currentUser.username,
        full_name: currentUser.full_name,
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        user_level_id: currentUser.user_level_id,
        department: currentUser.department || '',
        is_active: currentUser.is_active,
        notes: currentUser.notes || ''
      });
      
      setFormInitialized(true);
    }
  }, [currentUser, mode, userLevelsLoaded, userLevels]);

  // Update debug info
  useEffect(() => {
    setDebugInfo({
      mode,
      id,
      userLevelsLoaded,
      userLevelsCount: userLevels.length,
      availableUserLevels: userLevels.map(level => ({ id: level.id, level_name: level.level_name })),
      selectedUserLevelId: formData.user_level_id,
      selectedUserLevelExists: userLevels.find(level => level.id === formData.user_level_id),
      formInitialized,
      currentUser: currentUser ? { id: currentUser.id, username: currentUser.username } : null,
      isLoading,
      error
    });
  }, [mode, id, userLevelsLoaded, userLevels, formData.user_level_id, formInitialized, currentUser, isLoading, error]);

  const loadUser = async () => {
    if (!id) {
      console.error('❌ No ID provided for loading user');
      return;
    }
    
    console.log('🔄 Loading user with ID:', id);
    try {
      const user = await getUserById(id);
      console.log('✅ User loaded successfully:', user);
      if (!user) {
        console.error('❌ User not found with ID:', id);
        navigate('/users');
      }
    } catch (error) {
      console.error('❌ Failed to load user:', error);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.username?.trim()) {
      errors.username = 'Username is required';
    }

    if (mode === 'create' && !password.trim()) {
      errors.password = 'Password is required';
    }

    if (mode === 'create' && password && password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (mode === 'create' && password !== confirmPassword) {
      errors.confirmPassword = 'Password confirmation does not match';
    }

    if (!formData.full_name?.trim()) {
      errors.full_name = 'Full name is required';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (!formData.user_level_id) {
      errors.user_level_id = 'User level is required';
    } else {
      // Check if selected user level exists
      const levelExists = userLevels.find(level => level.id === formData.user_level_id);
      if (!levelExists) {
        errors.user_level_id = `Selected user level "${formData.user_level_id}" does not exist`;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof (CreateUserRequest & UpdateUserRequest), value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Form submission started');
    console.log('📝 Form data:', formData);
    
    if (!validateForm()) {
      console.log('❌ Form validation failed:', validationErrors);
      return;
    }

    try {
      let success = false;

      if (mode === 'create') {
        const createData: CreateUserRequest = {
          username: formData.username!,
          password: password,
          confirm_password: confirmPassword,
          full_name: formData.full_name!,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          user_level_id: formData.user_level_id!,
          department: formData.department || undefined,
          is_active: formData.is_active,
          notes: formData.notes || undefined
        };
        
        console.log('📤 Creating user with data:', createData);
        success = await createUser(createData);
        
        if (success) {
          console.log('✅ User created successfully');
          navigate('/users');
        } else {
          console.log('❌ User creation failed');
        }
      } else if (mode === 'edit' && id) {
        const updateData: UpdateUserRequest = {
          username: formData.username!,
          full_name: formData.full_name!,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          user_level_id: formData.user_level_id!,
          department: formData.department || undefined,
          is_active: formData.is_active,
          notes: formData.notes || undefined
        };
        
        console.log('📤 Updating user with data:', updateData);
        success = await updateUser(id, updateData);
        
        if (success) {
          console.log('✅ User updated successfully');
          navigate(`/users/${id}`);
        } else {
          console.log('❌ User update failed');
        }
      }
    } catch (error) {
      console.error('❌ Failed to save user:', error);
    }
  };

  if (isLoading && (mode === 'edit' || !userLevelsLoaded)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {mode === 'edit' ? 'Loading user data...' : 'Loading user levels...'}
          </p>
        </div>
      </div>
    );
  }

  if (!userLevelsLoaded || userLevels.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-200">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            User Levels Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No user levels are available. Please create user levels first before adding users.
          </p>
          <div className="space-y-2">
            <button
              onClick={() => fetchUserLevels()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Loading
            </button>
            <button
              onClick={() => navigate('/users')}
              className="block w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/users')}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {mode === 'create' ? 'Add New User' : 'Edit User'}
              </h1>
              {currentUser?.id && mode === 'edit' && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {currentUser.id}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
        <div onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">User Information</h2>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <User className="inline h-4 w-4 mr-1" />
                        Username *
                      </label>
                      <input
                        type="text"
                        value={formData.username || ''}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        placeholder="Enter username"
                        className={`w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                          validationErrors.username ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                      {validationErrors.username && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.username}</p>
                      )}
                    </div>

                    {mode === 'create' && (
                      <>
                        <div className="md:col-span-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Password *
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => {
                                setPassword(e.target.value);
                                if (validationErrors.password) {
                                  setValidationErrors(prev => ({ ...prev, password: '' }));
                                }
                              }}
                              placeholder="Enter password"
                              className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                                validationErrors.password ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          {validationErrors.password && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.password}</p>
                          )}
                        </div>

                        <div className="md:col-span-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Confirm Password *
                          </label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              if (validationErrors.confirmPassword) {
                                setValidationErrors(prev => ({ ...prev, confirmPassword: '' }));
                              }
                            }}
                            placeholder="Confirm password"
                            className={`w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                              validationErrors.confirmPassword ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                            }`}
                          />
                          {validationErrors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.confirmPassword}</p>
                          )}
                        </div>
                      </>
                    )}

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.full_name || ''}
                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                        placeholder="Enter full name"
                        className={`w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                          validationErrors.full_name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                      {validationErrors.full_name && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.full_name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Mail className="inline h-4 w-4 mr-1" />
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter email address"
                        className={`w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                          validationErrors.email ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                      {validationErrors.email && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Phone className="inline h-4 w-4 mr-1" />
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter phone number"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Shield className="inline h-4 w-4 mr-1" />
                        User Level *
                      </label>
                      <select
                        value={formData.user_level_id || ''}
                        onChange={(e) => handleInputChange('user_level_id', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                          validationErrors.user_level_id ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <option value="">Select user level</option>
                        {userLevels.map(level => (
                          <option key={level.id} value={level.id}>
                            {level.level_name} 
                          </option>
                        ))}
                      </select>
                      {validationErrors.user_level_id && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.user_level_id}</p>
                      )}
                  
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Building className="inline h-4 w-4 mr-1" />
                        Department
                      </label>
                      <input
                        type="text"
                        value={formData.department || ''}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        placeholder="Enter department"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notes
                      </label>
                      <textarea
                        value={formData.notes || ''}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        rows={3}
                        placeholder="Additional notes about the user..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">User Settings</h2>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) => handleInputChange('is_active', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Active User</span>
                      </label>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Inactive users cannot log in to the system
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <button
                      onClick={handleSubmit}
                      disabled={isLoading || !formInitialized}
                      className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? 'Saving...' : mode === 'create' ? 'Create User' : 'Update User'}
                    </button>

                    <button
                      onClick={() => navigate('/users')}
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mt-6">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-500" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Error</h3>
                      <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                        <p>{error}</p>
                      </div>
                      <div className="mt-4">
                        <button
                          onClick={clearError}
                          className="text-sm font-medium text-red-800 dark:text-red-300 hover:text-red-900 dark:hover:text-red-200 transition-colors duration-200"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserForm;