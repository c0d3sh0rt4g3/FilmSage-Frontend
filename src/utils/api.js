import { apiClient } from './axios';

/**
 * Makes an authenticated request to the backend API using Axios
 * @param {string} endpoint - The API endpoint (e.g., '/users/profile')
 * @param {Object} options - Axios options
 * @returns {Promise<[Error, null] | [null, Object]>} - Returns [error, null] or [null, data]
 */
export async function apiRequest(endpoint, options = {}) {
  try {
    // Convert fetch-style options to axios-style
    const axiosConfig = {
      url: endpoint,
      method: options.method || 'GET',
      ...options
    };

    // Handle body data for POST/PUT requests
    if (options.body) {
      axiosConfig.data = JSON.parse(options.body);
      delete axiosConfig.body;
    }

    // Handle custom headers
    if (options.headers) {
      axiosConfig.headers = {
        ...axiosConfig.headers,
        ...options.headers
      };
    }

    const response = await apiClient(axiosConfig);
    return [null, response.data];
  } catch (error) {
    console.error('API Request Error:', error);
    
    // Extract error message from axios error
    let errorMessage = error.message;
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.statusText) {
      errorMessage = error.response.statusText;
    }
    
    const apiError = new Error(errorMessage);
    apiError.status = error.response?.status;
    
    return [apiError, null];
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

// AI Recommendations API functions
export const recommendationAPI = {
  getAIRecommendations: (reviews, userId = null) => apiRequest('/api/recommendations', {
    method: 'POST',
    body: JSON.stringify({ reviews, userId })
  })
};

// User Interaction API functions
export const interactionAPI = {
  // Ratings
  addRating: (rating) => apiRequest('/userInteractions/ratings', {
    method: 'POST',
    body: JSON.stringify(rating)
  }),

  getUserRatings: () => {
    const [error, currentUser] = userAPI.getCurrentUser();
    if (error) return [error, null];
    return apiRequest(`/userInteractions/ratings/user/${currentUser.id}/from-reviews`);
  },

  removeRating: (tmdbId, contentType) => {
    const [error, currentUser] = userAPI.getCurrentUser();
    if (error) return [error, null];
    return apiRequest(`/userInteractions/ratings/${currentUser.id}/${tmdbId}/${contentType}`, {
      method: 'DELETE'
    });
  },

  // Watchlist
  addToWatchlist: (item) => apiRequest('/userInteractions/watchlist', {
    method: 'POST',
    body: JSON.stringify(item)
  }),

  getWatchlist: () => {
    const [error, currentUser] = userAPI.getCurrentUser();
    if (error) return [error, null];
    return apiRequest(`/userInteractions/watchlist/user/${currentUser.id}`);
  },

  removeFromWatchlist: (id) => {
    const [error, currentUser] = userAPI.getCurrentUser();
    if (error) return [error, null];
    return apiRequest(`/userInteractions/watchlist/${currentUser.id}/${id}`, {
      method: 'DELETE'
    });
  },

  // Favorites
  addToFavorites: (item) => {
    return apiRequest('/userInteractions/favorites', {
      method: 'POST',
      body: JSON.stringify(item)
    });
  },

  getFavorites: () => {
    const [error, currentUser] = userAPI.getCurrentUser();
    if (error) return [error, null];
    return apiRequest(`/userInteractions/favorites/user/${currentUser.id}`);
  },

  removeFromFavorites: (tmdbId, contentType) => {
    const [error, currentUser] = userAPI.getCurrentUser();
    if (error) return [error, null];
    return apiRequest(`/userInteractions/favorites/${currentUser.id}/${tmdbId}/${contentType}`, {
      method: 'DELETE'
    });
  },

  // Follow System
  followUser: (userId) => apiRequest('/userInteractions/follow', {
    method: 'POST',
    body: JSON.stringify({ followedId: userId })
  }),

  unfollowUser: (userId) => {
    const [error, currentUser] = userAPI.getCurrentUser();
    if (error) return [error, null];
    return apiRequest(`/userInteractions/follow/${currentUser.id}/${userId}`, {
      method: 'DELETE'
    });
  },

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