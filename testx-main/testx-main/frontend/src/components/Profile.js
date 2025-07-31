import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { UserIcon } from '@heroicons/react/24/outline';

export const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.getUser(username);
      setUser(response.data);
      // TODO: Fetch user's posts
      setPosts([]);
    } catch (error) {
      setError('User not found');
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-32 rounded-lg mb-4"></div>
          <div className="bg-gray-200 h-4 rounded w-1/3 mb-2"></div>
          <div className="bg-gray-200 h-4 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="text-center py-8">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">User not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The user you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20 lg:pb-4">
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="h-20 w-20 rounded-full bg-cloudtype-blue flex items-center justify-center">
              <span className="text-2xl font-medium text-white">
                {user?.display_name?.charAt(0) || user?.username?.charAt(0)}
              </span>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.display_name || user?.username}
              </h1>
              {user?.verified && (
                <span className="text-cloudtype-blue text-xl">✓</span>
              )}
            </div>
            <p className="text-gray-500">@{user?.username}</p>
            
            {user?.bio && (
              <p className="mt-3 text-gray-900">{user.bio}</p>
            )}
            
            <div className="flex space-x-6 mt-4 text-sm">
              <div>
                <span className="font-bold">{user?.posts_count || 0}</span>
                <span className="text-gray-500 ml-1">Posts</span>
              </div>
              <div>
                <span className="font-bold">{user?.following_count || 0}</span>
                <span className="text-gray-500 ml-1">Following</span>
              </div>
              <div>
                <span className="font-bold">{user?.followers_count || 0}</span>
                <span className="text-gray-500 ml-1">Followers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {user?.username === currentUser?.username 
                ? "You haven't posted anything yet." 
                : `@${user?.username} hasn't posted anything yet.`
              }
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg border border-gray-200 p-4">
              {/* TODO: Render post */}
            </div>
          ))
        )}
      </div>
    </div>
  );
};