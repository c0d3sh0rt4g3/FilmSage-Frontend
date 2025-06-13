import { apiClient } from './axios';

/**
 * Makes an authenticated request to the backend API using Axios
 * @param {string} endpoint - The API endpoint (e.g., '/users/profile')
 * @param {Object} options - Axios options
 * @returns {Promise<Array>} - Returns [error, null] or [null, data]
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

/**
 * User related API functions
 * Handles user authentication, profile management, and user data operations
 */
export const userAPI = {
  /**
   * Register a new user account
   * @param {object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.name - User name
   * @returns {Promise<Array>} Registration result
   */
  register: (userData) => apiRequest('/users/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),

  /**
   * Login user with credentials
   * @param {object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Array>} Login result
   */
  login: (credentials) => apiRequest('/users/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),

  /**
   * Get current user data from localStorage
   * @returns {Array} Current user data or error
   */
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

  /**
   * Get user profile data
   * @returns {Promise<Array>} User profile data
   */
  getProfile: () => {
    const [error, currentUser] = userAPI.getCurrentUser();
    if (error) {
      return [error, null];
    }
    return apiRequest(`/users/${currentUser.id}`);
  },

  /**
   * Update user profile information
   * @param {object} profileData - Updated profile data
   * @returns {Promise<Array>} Update result
   */
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

  /**
   * Get user profile statistics
   * @returns {Promise<Array>} User statistics
   */
  getProfileStats: () => {
    const [error, currentUser] = userAPI.getCurrentUser();
    if (error) {
      return [error, null];
    }
    return apiRequest(`/users/${currentUser.id}/stats`);
  }
};

/**
 * Review related API functions
 * Handles movie/show reviews, comments, and interactions
 */
export const reviewAPI = {
  /**
   * Create a new review
   * @param {object} reviewData - Review data
   * @param {number} reviewData.tmdbId - TMDB ID
   * @param {string} reviewData.contentType - Content type (movie/tv)
   * @param {number} reviewData.rating - Rating (1-10)
   * @param {string} reviewData.content - Review content
   * @returns {Promise<Array>} Created review
   */
  create: (reviewData) => apiRequest('/reviews', {
    method: 'POST',
    body: JSON.stringify(reviewData)
  }),

  /**
   * Get reviews for specific content
   * @param {number} tmdbId - TMDB ID
   * @param {string} contentType - Content type (movie/tv)
   * @returns {Promise<Array>} Reviews list
   */
  getByContent: (tmdbId, contentType) => apiRequest(`/reviews/content/${tmdbId}/${contentType}`),

  /**
   * Get reviews by user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} User reviews
   */
  getUserReviews: (userId) => apiRequest(`/reviews/user/${userId}`),

  /**
   * Like a review
   * @param {number} reviewId - Review ID
   * @returns {Promise<Array>} Like result
   */
  like: (reviewId) => apiRequest(`/reviews/${reviewId}/like`, { method: 'POST' }),

  /**
   * Unlike a review
   * @param {number} reviewId - Review ID
   * @returns {Promise<Array>} Unlike result
   */
  unlike: (reviewId) => apiRequest(`/reviews/${reviewId}/like`, { method: 'DELETE' }),

  /**
   * Add comment to review
   * @param {number} reviewId - Review ID
   * @param {string} comment - Comment content
   * @returns {Promise<Array>} Comment result
   */
  addComment: (reviewId, comment) => apiRequest(`/reviews/${reviewId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content: comment })
  })
};

/**
 * AI Recommendations API functions
 * Handles AI-powered movie recommendations based on user reviews
 */
export const recommendationAPI = {
  /**
   * Get AI-powered movie recommendations
   * @param {Array} reviews - User reviews to analyze
   * @param {number|null} userId - User ID (optional)
   * @param {Array} favoriteGenres - User's favorite genres
   * @returns {Promise<Array>} AI recommendations
   */
  getAIRecommendations: (reviews, userId = null, favoriteGenres = []) => apiRequest('/api/recommendations', {
    method: 'POST',
    body: JSON.stringify({ reviews, userId, favoriteGenres })
  })
};

/**
 * User Interaction API functions
 * Handles user ratings, watchlist, favorites, and social features
 */
export const interactionAPI = {
  /**
   * Add a movie/show rating
   * @param {object} rating - Rating data
   * @param {number} rating.tmdbId - TMDB ID
   * @param {string} rating.contentType - Content type (movie/tv)
   * @param {number} rating.rating - Rating value
   * @returns {Promise<Array>} Rating result
   */
  addRating: (rating) => apiRequest('/userInteractions/ratings', {
    method: 'POST',
    body: JSON.stringify(rating)
  }),

  /**
   * Get user's ratings
   * @returns {Promise<Array>} User ratings
   */
  getUserRatings: () => {
    const [error, currentUser] = userAPI.getCurrentUser();
    if (error) return [error, null];
    return apiRequest(`/userInteractions/ratings/user/${currentUser.id}/from-reviews`);
  },

  /**
   * Remove a rating
   * @param {number} tmdbId - TMDB ID
   * @param {string} contentType - Content type (movie/tv)
   * @returns {Promise<Array>} Remove result
   */
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

/**
 * Admin API functions
 * Handles administrative operations (admin role required)
 */
export const adminAPI = {
  /**
   * Get all users (admin only)
   * @returns {Promise<Array>} Users list
   */
  getAllUsers: () => apiRequest('/users', {
    headers: { 'x-role': 'admin' }
  }),

  /**
   * Delete a user (admin only)
   * @param {number} userId - User ID to delete
   * @returns {Promise<Array>} Delete result
   */
  deleteUser: (userId) => apiRequest(`/users/${userId}`, {
    method: 'DELETE',
    headers: { 'x-role': 'admin' }
  }),

  /**
   * Change user role (admin only)
   * @param {number} userId - User ID
   * @param {string} role - New role to assign
   * @returns {Promise<Array>} Role change result
   */
  changeUserRole: (userId, role) => apiRequest(`/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
    headers: { 'x-role': 'admin' }
  }),

  /**
   * Activate a user account (admin only)
   * @param {number} userId - User ID to activate
   * @returns {Promise<Array>} Activation result
   */
  activateUser: (userId) => apiRequest(`/users/${userId}/activate`, {
    method: 'PATCH',
    headers: { 'x-role': 'admin' }
  }),

  /**
   * Deactivate a user account (admin only)
   * @param {number} userId - User ID to deactivate
   * @returns {Promise<Array>} Deactivation result
   */
  deactivateUser: (userId) => apiRequest(`/users/${userId}/deactivate`, {
    method: 'PATCH',
    headers: { 'x-role': 'admin' }
  })
};

/**
 * Get authentication headers from localStorage token
 * @returns {object} Headers object with Authorization header if token exists
 */
export function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
} 
