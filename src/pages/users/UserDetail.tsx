import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Hash,
  Building,
  Shield,
  Calendar,
  Clock,
  Edit,
  UserCheck,
  UserX,
  Trash2,
  FileText,
  Activity,
  AlertCircle,
  CheckCircle,
  Settings,
  RefreshCw
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useUserStore } from '../../store/useUserStore';
import { User as UserType } from '../../types/user.types';

// Mock user activities since backend doesn't have this yet
interface UserActivity {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
}

const mockUserActivities: UserActivity[] = [
  {
    id: '1',
    action: 'login',
    description: 'User logged in successfully',
    timestamp: '2024-12-01T10:30:00Z',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    id: '2',
    action: 'profile_update',
    description: 'Updated profile information',
    timestamp: '2024-11-30T14:22:00Z',
    ip_address: '192.168.1.100'
  },
  {
    id: '3',
    action: 'password_change',
    description: 'Changed account password',
    timestamp: '2024-11-25T16:45:00Z',
    ip_address: '192.168.1.100'
  },
  {
    id: '4',
    action: 'logout',
    description: 'User logged out',
    timestamp: '2024-11-30T17:30:00Z',
    ip_address: '192.168.1.100'
  }
];

const UserDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { darkMode } = useTheme();
  
  // Zustand store
  const {
    currentUser,
    userLevels,
    isLoading,
    error,
    getUserById,
    deleteUser,
    toggleUserStatus,
    clearError,
    clearCurrentUser
  } = useUserStore();
  
  const [activities] = useState<UserActivity[]>(mockUserActivities);
  const [activeTab, setActiveTab] = useState<'overview' | 'activities' | 'permissions'>('overview');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  useEffect(() => {
    if (id) {
      getUserById(id);
    }

    // Cleanup when component unmounts
    return () => {
      clearCurrentUser();
      clearError();
    };
  }, [id, getUserById, clearCurrentUser, clearError]);

  const handleToggleActive = async () => {
    if (!currentUser) return;
    
    setIsTogglingStatus(true);
    try {
      await toggleUserStatus(currentUser.id);
    } catch (error) {
      console.error('Failed to update user status:', error);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!currentUser) return;
    
    setIsDeleting(true);
    try {
      const success = await deleteUser(currentUser.id);
      if (success) {
        setDeleteConfirm(false);
        navigate('/users');
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays < 30) return `${diffInDays} days ago`;
    return formatDate(dateString);
  };

  const getUserLevelBadgeColor = (levelId: string) => {
    switch (levelId.toLowerCase()) {
      case 'admin':
      case 'administrator':
        return `${darkMode ? 'bg-red-900/30 text-red-200' : 'bg-red-100 text-red-800'}`;
      case 'manager':
        return `${darkMode ? 'bg-blue-900/30 text-blue-200' : 'bg-blue-100 text-blue-800'}`;
      case 'staff':
        return `${darkMode ? 'bg-green-900/30 text-green-200' : 'bg-green-100 text-green-800'}`;
      case 'viewer':
        return `${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'}`;
      default:
        return `${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'}`;
    }
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'login':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'logout':
        return <UserX className="h-4 w-4 text-gray-500" />;
      case 'transaction_create':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'profile_update':
        return <Settings className="h-4 w-4 text-orange-500" />;
      case 'password_change':
        return <Shield className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get user level info
  const getUserLevel = () => {
    if (currentUser?.UserLevel) {
      return currentUser.UserLevel;
    }
    return userLevels.find(level => level.id === currentUser?.user_level_id);
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-200 ${
        darkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Loading user details...
          </h3>
        </div>
      </div>
    );
  }

  if (error || !currentUser) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-200 ${
        darkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {error || 'User not found'}
          </h2>
          <button
            onClick={() => navigate('/users')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  const userLevel = getUserLevel();

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className={`shadow-sm border-b ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/users')}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  darkMode 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  User Details
                </h1>
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {currentUser.id}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(`/users/edit/${currentUser.id}`)}
                className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm font-medium rounded-md transition-colors duration-200 ${
                  darkMode 
                    ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </button>
              
              <button
                onClick={handleToggleActive}
                disabled={isTogglingStatus}
                className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm font-medium rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  currentUser.is_active
                    ? darkMode 
                      ? 'border-orange-600 text-orange-400 bg-orange-900/20 hover:bg-orange-900/30'
                      : 'border-orange-300 text-orange-700 bg-orange-50 hover:bg-orange-100'
                    : darkMode 
                      ? 'border-green-600 text-green-400 bg-green-900/20 hover:bg-green-900/30'
                      : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                }`}
              >
                {isTogglingStatus ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : currentUser.is_active ? (
                  <UserX className="h-4 w-4 mr-2" />
                ) : (
                  <UserCheck className="h-4 w-4 mr-2" />
                )}
                {currentUser.is_active ? 'Deactivate' : 'Activate'}
              </button>
              
              <button
                onClick={() => setDeleteConfirm(true)}
                className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm font-medium rounded-md transition-colors duration-200 ${
                  darkMode 
                    ? 'border-red-600 text-red-400 bg-red-900/20 hover:bg-red-900/30' 
                    : 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100'
                }`}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={clearError}
                  className="inline-flex text-red-400 hover:text-red-600"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <div className="lg:col-span-1">
            <div className={`rounded-lg shadow border ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="p-6">
                <div className="text-center">
                  <div className={`mx-auto h-20 w-20 rounded-full flex items-center justify-center mb-4 ${
                    darkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                  }`}>
                    {currentUser.profile_image ? (
                      <img
                        src={currentUser.profile_image}
                        alt={currentUser.full_name}
                        className="h-20 w-20 rounded-full object-cover"
                      />
                    ) : (
                      <User className={`h-10 w-10 ${
                        darkMode ? 'text-blue-400' : 'text-blue-600'
                      }`} />
                    )}
                  </div>
                  
                  <h2 className={`text-xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {currentUser.full_name}
                  </h2>
                  
                  <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    @{currentUser.username}
                  </p>
                  
                  <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                    currentUser.is_active
                      ? `${darkMode ? 'bg-green-900/30 text-green-200' : 'bg-green-100 text-green-800'}`
                      : `${darkMode ? 'bg-red-900/30 text-red-200' : 'bg-red-100 text-red-800'}`
                  }`}>
                    {currentUser.is_active ? (
                      <>
                        <UserCheck className="h-3 w-3 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <UserX className="h-3 w-3 mr-1" />
                        Inactive
                      </>
                    )}
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center">
                    <Hash className={`h-4 w-4 mr-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      ID: {currentUser.id}
                    </span>
                  </div>
                  
                  {currentUser.email && (
                    <div className="flex items-center">
                      <Mail className={`h-4 w-4 mr-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {currentUser.email}
                      </span>
                    </div>
                  )}
                  
                  {currentUser.phone && (
                    <div className="flex items-center">
                      <Phone className={`h-4 w-4 mr-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {currentUser.phone}
                      </span>
                    </div>
                  )}
                  
                  {currentUser.department && (
                    <div className="flex items-center">
                      <Building className={`h-4 w-4 mr-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {currentUser.department}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <Shield className={`h-4 w-4 mr-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      getUserLevelBadgeColor(currentUser.user_level_id)
                    }`}>
                      {userLevel?.name || currentUser.user_level_id}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className={`h-4 w-4 mr-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <div>
                      <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Joined {formatDate(currentUser.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  {currentUser.last_login && (
                    <div className="flex items-center">
                      <Clock className={`h-4 w-4 mr-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <div>
                        <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Last login {formatRelativeTime(currentUser.last_login)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className={`rounded-lg shadow border ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <nav className="-mb-px flex space-x-8 px-6">
                  {[
                    { key: 'overview', label: 'Overview', icon: User },
                    { key: 'activities', label: 'Activities', icon: Activity },
                    { key: 'permissions', label: 'Permissions', icon: Shield }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                        activeTab === tab.key
                          ? `border-blue-500 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`
                          : `border-transparent ${
                              darkMode 
                                ? 'text-gray-400 hover:text-gray-300 hover:border-gray-600' 
                                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`
                      }`}
                    >
                      <tab.icon className={`-ml-0.5 mr-2 h-4 w-4 ${
                        activeTab === tab.key
                          ? darkMode ? 'text-blue-400' : 'text-blue-500'
                          : darkMode 
                            ? 'text-gray-500 group-hover:text-gray-400' 
                            : 'text-gray-400 group-hover:text-gray-500'
                      }`} />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        User Information
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Username
                          </label>
                          <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {currentUser.username}
                          </p>
                        </div>
                        
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Full Name
                          </label>
                          <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {currentUser.full_name}
                          </p>
                        </div>
                        
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Email
                          </label>
                          <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {currentUser.email || 'Not provided'}
                          </p>
                        </div>
                        
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Phone
                          </label>
                          <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {currentUser.phone || 'Not provided'}
                          </p>
                        </div>
                        
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Department
                          </label>
                          <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {currentUser.department || 'Not assigned'}
                          </p>
                        </div>
                        
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            User Level
                          </label>
                          <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {userLevel?.name || currentUser.user_level_id}
                          </p>
                        </div>
                        
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Created At
                          </label>
                          <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {formatDate(currentUser.created_at)}
                          </p>
                        </div>
                        
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Last Updated
                          </label>
                          <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {formatDate(currentUser.updated_at)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {currentUser.notes && (
                      <div>
                        <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Notes
                        </h3>
                        <div className={`rounded-lg p-4 ${
                          darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                        }`}>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {currentUser.notes}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Activities Tab */}
                {activeTab === 'activities' && (
                  <div>
                    <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Recent Activities
                    </h3>
                    
                    <div className="flow-root">
                      <ul className="-mb-8">
                        {activities.map((activity, index) => (
                          <li key={activity.id}>
                            <div className="relative pb-8">
                              {index !== activities.length - 1 ? (
                                <span
                                  className={`absolute top-4 left-4 -ml-px h-full w-0.5 ${
                                    darkMode ? 'bg-gray-700' : 'bg-gray-200'
                                  }`}
                                  aria-hidden="true"
                                />
                              ) : null}
                              <div className="relative flex space-x-3">
                                <div>
                                  <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ${
                                    darkMode 
                                      ? 'bg-gray-700 ring-gray-800' 
                                      : 'bg-gray-100 ring-white'
                                  }`}>
                                    {getActivityIcon(activity.action)}
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                  <div>
                                    <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                      {activity.description}
                                    </p>
                                    {activity.ip_address && (
                                      <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        IP: {activity.ip_address}
                                      </p>
                                    )}
                                  </div>
                                  <div className={`text-right text-sm whitespace-nowrap ${
                                    darkMode ? 'text-gray-400' : 'text-gray-500'
                                  }`}>
                                    <time dateTime={activity.timestamp}>
                                      {formatRelativeTime(activity.timestamp)}
                                    </time>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Permissions Tab */}
                {activeTab === 'permissions' && (
                  <div>
                    <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      User Permissions
                    </h3>
                    
                    <div className="space-y-4">
                      <div className={`rounded-lg p-4 ${
                        darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Current Role: {userLevel?.name || currentUser.user_level_id}
                          </h4>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            getUserLevelBadgeColor(currentUser.user_level_id)
                          }`}>
                            {userLevel?.name || currentUser.user_level_id}
                          </span>
                        </div>
                        <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {userLevel?.description || 'No description available'}
                        </p>
                        
                        <div>
                          <h5 className={`text-sm font-medium mb-2 ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Access Level:
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {/* Mock permissions based on user level */}
                            {currentUser.user_level_id === 'admin' && (
                              <>
                                <div className="flex items-center">
                                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    USER MANAGEMENT
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    SYSTEM SETTINGS
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    DATA EXPORT
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    AUDIT LOGS
                                  </span>
                                </div>
                              </>
                            )}
                            {currentUser.user_level_id === 'manager' && (
                              <>
                                <div className="flex items-center">
                                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    USER VIEW
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    TRANSACTION MANAGEMENT
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    REPORTS
                                  </span>
                                </div>
                              </>
                            )}
                            {currentUser.user_level_id === 'staff' && (
                              <>
                                <div className="flex items-center">
                                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    TRANSACTION CREATE
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    INVENTORY VIEW
                                  </span>
                                </div>
                              </>
                            )}
                            {currentUser.user_level_id === 'viewer' && (
                              <div className="flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                  VIEW ONLY
                                </span>
                              </div>
                            )}
                          </div>
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className={`relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="mt-3 text-center">
              <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
                darkMode ? 'bg-red-900/30' : 'bg-red-100'
              }`}>
                <Trash2 className={`h-6 w-6 ${
                  darkMode ? 'text-red-400' : 'text-red-600'
                }`} />
              </div>
              <h3 className={`text-lg font-medium mt-4 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Delete User
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Are you sure you want to delete <strong>{currentUser.full_name}</strong>? This action cannot be undone and will permanently remove all user data.
                </p>
              </div>
              <div className="flex justify-center space-x-3 mt-4">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  disabled={isDeleting}
                  className={`px-4 py-2 border rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    darkMode 
                      ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' 
                      : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 inline-flex items-center"
                >
                  {isDeleting ? (
                    <>
                      <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                      Deleting...
                    </>
                  ) : (
                    'Delete User'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetail;