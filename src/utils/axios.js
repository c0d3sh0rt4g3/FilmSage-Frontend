import axios from 'axios';

// Backend API configuration
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// Create axios instance for backend API
export const apiClient = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor for error handling
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

// TMDB API configuration
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 10000,
  params: {
    language: 'en-US',
  },
});

// TMDB request interceptor to add API key
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

// Generic HTTP client for other APIs
export const httpClient = axios.create({
  timeout: 10000,
});

export default apiClient; 