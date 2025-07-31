import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { 
  UserGroupIcon, 
  ShieldCheckIcon,
  ShieldExclamationIcon,
  NoSymbolIcon,
  CheckBadgeIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

export const AdminPanel = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.getUsers();
      setUsers(response.data);
    } catch (error) {
      setError('Failed to load users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (username, duration = 0) => {
    setActionLoading(username);
    try {
      await api.banUser(username, duration);
      await fetchUsers();
    } catch (error) {
      console.error('Error banning user:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnbanUser = async (username) => {
    setActionLoading(username);
    try {
      await api.unbanUser(username);
      await fetchUsers();
    } catch (error) {
      console.error('Error unbanning user:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerifyUser = async (username, verified) => {
    setActionLoading(username);
    try {
      await api.verifyUser(username, verified);
      await fetchUsers();
    } catch (error) {
      console.error('Error updating verification:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMakeAdmin = async (username, admin) => {
    setActionLoading(username);
    try {
      await api.makeAdmin(username, admin);
      await fetchUsers();
    } catch (error) {
      console.error('Error updating admin status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const isBanned = (user) => {
    return user.banned_until && new Date(user.banned_until) > new Date();
  };

  if (!user?.admin) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="text-center py-8">
          <ShieldExclamationIcon className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to access the admin panel.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-20 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20 lg:pb-4">
      <div className="sticky top-0 bg-white z-10 pb-4 border-b border-gray-200 mb-6">
        <div className="flex items-center space-x-2">
          <Cog6ToothIcon className="h-8 w-8 text-cloudtype-blue" />
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        </div>
        <p className="text-gray-600 mt-1">Manage users and content</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <UserGroupIcon className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-medium text-gray-900">Users ({users.length})</h2>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {users.map((userData) => (
            <div key={userData.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-cloudtype-blue flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {userData.display_name?.charAt(0) || userData.username?.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900">
                        {userData.display_name || userData.username}
                      </p>
                      {userData.verified && (
                        <CheckBadgeIcon className="h-4 w-4 text-cloudtype-blue" />
                      )}
                      {userData.admin && (
                        <ShieldCheckIcon className="h-4 w-4 text-green-600" />
                      )}
                      {isBanned(userData) && (
                        <NoSymbolIcon className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">@{userData.username}</p>
                    <p className="text-xs text-gray-400">{userData.email}</p>
                    {isBanned(userData) && (
                      <p className="text-xs text-red-600">
                        Banned until: {new Date(userData.banned_until).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Verification - Admin only */}
                  {user?.admin && (
                    <button
                      onClick={() => handleVerifyUser(userData.username, !userData.verified)}
                      disabled={actionLoading === userData.username}
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        userData.verified 
                          ? 'bg-cloudtype-blue text-white hover:bg-cloudtype-blue-hover' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      } disabled:opacity-50`}
                    >
                      {userData.verified ? 'Verified' : 'Verify'}
                    </button>
                  )}

                  {/* Admin Controls - Only show for admin users */}
                  {user?.admin && (
                    <>
                      {/* Admin */}
                      {userData.username !== 'admin' && (
                        <button
                          onClick={() => handleMakeAdmin(userData.username, !userData.admin)}
                          disabled={actionLoading === userData.username}
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            userData.admin 
                              ? 'bg-green-600 text-white hover:bg-green-700' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          } disabled:opacity-50`}
                        >
                          {userData.admin ? 'Admin' : 'Make Admin'}
                        </button>
                      )}

                      {/* Ban/Unban */}
                      {userData.username !== 'admin' && userData.username !== user.username && (
                        <>
                          {isBanned(userData) ? (
                            <button
                              onClick={() => handleUnbanUser(userData.username)}
                              disabled={actionLoading === userData.username}
                              className="px-3 py-1 text-xs font-medium rounded-full bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                            >
                              Unban
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleBanUser(userData.username, 24)}
                                disabled={actionLoading === userData.username}
                                className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-600 text-white hover:bg-yellow-700 disabled:opacity-50"
                              >
                                Ban 24h
                              </button>
                              <button
                                onClick={() => handleBanUser(userData.username, 0)}
                                disabled={actionLoading === userData.username}
                                className="px-3 py-1 text-xs font-medium rounded-full bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                              >
                                Ban Permanent
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};