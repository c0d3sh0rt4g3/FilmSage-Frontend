const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

/**
 * Makes an authenticated request to the backend API
 * @param {string} endpoint - The API endpoint (e.g., '/users/profile')
 * @param {Object} options - Fetch options
 * @returns {Promise<[Error, null] | [null, Object]>} - Returns [error, null] or [null, data]
 */
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  // Only add token for non-auth endpoints
  const isAuthEndpoint = endpoint.includes('/login') || endpoint.includes('/register');
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(!isAuthEndpoint && token && { 'Authorization': `Bearer ${token}` })
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  try {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, config);
    
    // If the token is invalid or expired
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      window.location.href = '/login';
      return [new Error('Unauthorized'), null];
    }

    const data = await response.json();
    if (!response.ok) {
      return [new Error(data.message || 'API request failed'), null];
    }

    return [null, data];
  } catch (error) {
    console.error('API Request Error:', error);
    return [error, null];
  }
}

// User related API functions
export const userAPI = {
  register: (userData) => apiRequest('/users/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),

  login: (credentials) => apiRequest('/users/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),

  getCurrentUser: () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return [new Error('No authentication token found'), null];
      }

      const userData = localStorage.getItem('userData');
      if (!userData) {
        return [new Error('No user data found'), null];
      }

      return [null, JSON.parse(userData)];
    } catch (error) {
      console.error('Error getting current user:', error);
      return [error, null];
    }
  },

  getProfile: () => {
    const [error, currentUser] = userAPI.getCurrentUser();
    if (error) {
      return [error, null];
    }
    return apiRequest(`/users/${currentUser.id}`);
  },

  updateProfile: (profileData) => {
    const [error, currentUser] = userAPI.getCurrentUser();
    if (error) {
      return [error, null];
    }
    return apiRequest(`/users/${currentUser.id}`, {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  getProfileStats: () => {
    const [error, currentUser] = userAPI.getCurrentUser();
    if (error) {
      return [error, null];
    }
    return apiRequest(`/users/${currentUser.id}/stats`);
  }
};

// Review related API functions
export const reviewAPI = {
  create: (reviewData) => apiRequest('/reviews', {
    method: 'POST',
    body: JSON.stringify(reviewData)
  }),

  getByContent: (tmdbId, contentType) => apiRequest(`/reviews/content/${tmdbId}/${contentType}`),

  getUserReviews: (userId) => apiRequest(`/reviews/user/${userId}`),

  like: (reviewId) => apiRequest(`/reviews/${reviewId}/like`, { method: 'POST' }),

  unlike: (reviewId) => apiRequest(`/reviews/${reviewId}/like`, { method: 'DELETE' }),

  addComment: (reviewId, comment) => apiRequest(`/reviews/${reviewId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content: comment })
  })
};

// User Interaction API functions
export const interactionAPI = {
  // Ratings
  addRating: (rating) => apiRequest('/userInteractions/ratings', {
    method: 'POST',
    body: JSON.stringify(rating)
  }),

  getUserRatings: () => apiRequest('/userInteractions/ratings/user/me'),

  removeRating: (tmdbId, contentType) => apiRequest(`/userInteractions/ratings/me/${tmdbId}/${contentType}`, {
    method: 'DELETE'
  }),

  // Watchlist
  addToWatchlist: (item) => apiRequest('/userInteractions/watchlist', {
    method: 'POST',
    body: JSON.stringify(item)
  }),

  getWatchlist: () => apiRequest('/userInteractions/watchlist/user/me'),

  removeFromWatchlist: (id) => apiRequest(`/userInteractions/watchlist/${id}`, {
    method: 'DELETE'
  }),

  // Favorites
  addToFavorites: (item) => apiRequest('/userInteractions/favorites', {
    method: 'POST',
    body: JSON.stringify(item)
  }),

  getFavorites: () => apiRequest('/userInteractions/favorites/user/me'),

  removeFromFavorites: (tmdbId, contentType) => apiRequest(`/userInteractions/favorites/me/${tmdbId}/${contentType}`, {
    method: 'DELETE'
  }),

  // Follow System
  followUser: (userId) => apiRequest('/userInteractions/follow', {
    method: 'POST',
    body: JSON.stringify({ followedId: userId })
  }),

  unfollowUser: (userId) => apiRequest(`/userInteractions/follow/me/${userId}`, {
    method: 'DELETE'
  }),

  getFollowers: (userId) => apiRequest(`/userInteractions/followers/${userId}`),

  getFollowing: (userId) => apiRequest(`/userInteractions/following/${userId}`),

  // Activity
  getUserActivity: (userId) => apiRequest(`/userInteractions/activity/${userId}`)
};

// Admin API functions
export const adminAPI = {
  getAllUsers: () => apiRequest('/users', {
    headers: { 'x-role': 'admin' }
  }),

  deleteUser: (userId) => apiRequest(`/users/${userId}`, {
    method: 'DELETE',
    headers: { 'x-role': 'admin' }
  }),

  changeUserRole: (userId, role) => apiRequest(`/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
    headers: { 'x-role': 'admin' }
  }),

  activateUser: (userId) => apiRequest(`/users/${userId}/activate`, {
    method: 'PATCH',
    headers: { 'x-role': 'admin' }
  }),

  deactivateUser: (userId) => apiRequest(`/users/${userId}/deactivate`, {
    method: 'PATCH',
    headers: { 'x-role': 'admin' }
  })
};

export function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
} 