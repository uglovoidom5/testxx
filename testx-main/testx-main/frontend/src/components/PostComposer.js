import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { PhotoIcon } from '@heroicons/react/24/outline';

export const PostComposer = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;

    setLoading(true);
    try {
      await api.createPost({ content: content.trim(), image });
      setContent('');
      setImage(null);
      onPostCreated();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-3">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-cloudtype-blue flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.display_name?.charAt(0) || user?.username?.charAt(0)}
              </span>
            </div>
          </div>
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening?"
              className="w-full border-0 resize-none focus:ring-0 focus:outline-none text-lg placeholder-gray-500"
              rows={3}
            />
            
            {image && (
              <div className="mt-2">
                <div className="relative inline-block">
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Preview"
                    className="max-w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setImage(null)}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center mt-3">
              <div className="flex space-x-3">
                <label className="cursor-pointer text-cloudtype-blue hover:text-cloudtype-blue-hover">
                  <PhotoIcon className="h-5 w-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              
              <button
                type="submit"
                disabled={loading || (!content.trim() && !image)}
                className="px-4 py-2 bg-cloudtype-blue text-white font-medium rounded-full hover:bg-cloudtype-blue-hover disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};