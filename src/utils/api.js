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
    if (response.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      window.location.href = '/login';
      return [new Error('Authentication required'), null];
    }

    const data = await response.json();
    return response.ok ? [null, data] : [new Error(data.message || 'API Error'), null];
  } catch (error) {
    console.error('API Request Error:', error);
    return [error, null];
  }
}

export function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
} 