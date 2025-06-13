/**
 * Axios HTTP client configurations for different APIs
 * Provides pre-configured axios instances for backend and TMDB APIs
 */
import axios from 'axios';

/**
 * Backend API base URL configuration
 */
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

/**
 * Axios instance for backend API communication
 * Includes authentication token handling and error management
 */
export const apiClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to automatically add authentication token
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for error handling and authentication
 * Automatically redirects to login on 401 unauthorized responses
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * TMDB API base URL
 */
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

/**
 * Axios instance for TMDB API communication
 * Pre-configured with API key and language settings
 */
export const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    language: 'en-US',
  },
});

/**
 * Request interceptor to add TMDB API key to all requests
 */
tmdbClient.interceptors.request.use(
  (config) => {
    const apiKey = import.meta.env.VITE_MOVIEDB_API_KEY;
    if (!apiKey) {
      throw new Error('TMDB API key is not configured');
    }
    config.params = {
      ...config.params,
      api_key: apiKey,
    };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Generic HTTP client for other external APIs
 * Basic axios instance without specific configurations
 */
export const httpClient = axios.create({
});

export default apiClient; 