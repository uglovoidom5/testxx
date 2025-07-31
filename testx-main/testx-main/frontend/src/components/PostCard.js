import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartIcon, 
  ChatBubbleOvalLeftIcon, 
  ArrowPathIcon 
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

export const PostCard = ({ post, onLike, currentUser }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) {
      return `${minutes}m`;
    } else if (hours < 24) {
      return `${hours}h`;
    } else {
      return `${days}d`;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
      <div className="flex space-x-3">
        <div className="flex-shrink-0">
          <Link to={`/profile/${post.username}`}>
            <div className="h-10 w-10 rounded-full bg-cloudtype-blue flex items-center justify-center hover:bg-cloudtype-blue-hover">
              <span className="text-sm font-medium text-white">
                {post.display_name?.charAt(0) || post.username?.charAt(0)}
              </span>
            </div>
          </Link>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <Link 
              to={`/profile/${post.username}`}
              className="font-medium text-gray-900 hover:underline"
            >
              {post.display_name || post.username}
            </Link>
            {post.verified && (
              <span className="text-cloudtype-blue">✓</span>
            )}
            <span className="text-gray-500">@{post.username}</span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500 text-sm">{formatDate(post.created_at)}</span>
          </div>
          
          <div className="mt-2">
            <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
            
            {post.image && (
              <div className="mt-3">
                <img
                  src={`${process.env.REACT_APP_BACKEND_URL}${post.image}`}
                  alt="Post content"
                  className="max-w-full h-auto rounded-lg border border-gray-200"
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-4 max-w-md">
            <button className="flex items-center space-x-2 text-gray-500 hover:text-cloudtype-blue group">
              <div className="p-2 rounded-full group-hover:bg-cloudtype-blue group-hover:bg-opacity-10">
                <ChatBubbleOvalLeftIcon className="h-5 w-5" />
              </div>
              <span className="text-sm">{post.replies_count || 0}</span>
            </button>
            
            <button className="flex items-center space-x-2 text-gray-500 hover:text-green-600 group">
              <div className="p-2 rounded-full group-hover:bg-green-600 group-hover:bg-opacity-10">
                <ArrowPathIcon className="h-5 w-5" />
              </div>
              <span className="text-sm">{post.reposts_count || 0}</span>
            </button>
            
            <button 
              onClick={() => onLike(post.id, post.liked_by_user)}
              className={`flex items-center space-x-2 group ${
                post.liked_by_user ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
              }`}
            >
              <div className="p-2 rounded-full group-hover:bg-red-600 group-hover:bg-opacity-10">
                {post.liked_by_user ? (
                  <HeartIconSolid className="h-5 w-5" />
                ) : (
                  <HeartIcon className="h-5 w-5" />
                )}
              </div>
              <span className="text-sm">{post.likes_count || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};