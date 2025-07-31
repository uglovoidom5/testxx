import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API service functions
export const api = {
  // Auth
  login: (username, password) => 
    apiClient.post('/auth/login', { username, password }),
  
  register: (userData) => 
    apiClient.post('/auth/register', userData),

  // Users
  getMe: () => apiClient.get('/users/me'),
  getUser: (username) => apiClient.get(`/users/${username}`),

  // Posts
  createPost: (postData) => {
    const formData = new FormData();
    formData.append('content', postData.content);
    if (postData.image) {
      formData.append('image', postData.image);
    }
    if (postData.reply_to) {
      formData.append('reply_to', postData.reply_to);
    }
    return apiClient.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  getFeed: (limit = 20, offset = 0) => 
    apiClient.get(`/posts/feed?limit=${limit}&offset=${offset}`),

  likePost: (postId) => apiClient.post(`/posts/${postId}/like`),
  unlikePost: (postId) => apiClient.delete(`/posts/${postId}/like`),

  // Admin
  banUser: (username, duration) => 
    apiClient.post('/admin/ban-user', { username, duration }),
  
  unbanUser: (username) => 
    apiClient.post('/admin/unban-user', { username }),
  
  verifyUser: (username, verified) => 
    apiClient.post('/admin/verify-user', { username, verified }),
  
  makeAdmin: (username, admin) => 
    apiClient.post('/admin/make-admin', { username, admin }),
  
  getUsers: () => apiClient.get('/admin/users'),
};