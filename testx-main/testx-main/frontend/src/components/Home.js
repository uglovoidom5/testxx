import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { PostComposer } from './PostComposer';
import { PostCard } from './PostCard';

export const Home = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const response = await api.getFeed();
      setPosts(response.data);
    } catch (error) {
      setError('Failed to load feed');
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewPost = (newPost) => {
    fetchFeed(); // Refresh the feed
  };

  const handleLike = async (postId, liked) => {
    try {
      if (liked) {
        await api.unlikePost(postId);
      } else {
        await api.likePost(postId);
      }
      fetchFeed(); // Refresh to get updated counts
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20 lg:pb-4">
      <div className="sticky top-0 bg-white z-10 pb-4 border-b border-gray-200 mb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Home</h1>
        <PostComposer onPostCreated={handleNewPost} />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No posts yet. Be the first to share something!</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              currentUser={user}
            />
          ))
        )}
      </div>
    </div>
  );
};