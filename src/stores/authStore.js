/**
 * Authentication store using Pinia
 * Manages user authentication state, login, registration, and profile updates
 */
import { defineStore } from 'pinia';
import { userAPI } from '@/utils/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    userData: null,
    logged: false,
    errors: {}
  }),

  getters: {
    /**
     * Check if user is authenticated
     * @returns {boolean} Authentication status
     */
    isAuthenticated: (state) => state.logged,
    
    /**
     * Get current user data
     * @returns {object|null} User data or null if not logged in
     */
    getUser: (state) => state.userData,
    
    /**
     * Get current error messages
     * @returns {object} Error messages object
     */
    getErrors: (state) => state.errors
  },

  actions: {
    /**
     * Authenticate user with credentials
     * @param {object} credentials - User login credentials
     * @param {string} credentials.email - User email
     * @param {string} credentials.password - User password
     * @returns {Promise<boolean>} Success status
     */
    async login(credentials) {
      try {
        const [error, data] = await userAPI.login(credentials);

        if (error) {
          this.errors = {
            login: error.message || 'Login failed. Please try again.'
          };
          return false;
        }

        this.userData = data.user;
        this.logged = true;
        localStorage.setItem('token', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        this.errors = {};
        return true;
      } catch (error) {
        console.error('Login error:', error);
        this.errors = {
          login: 'An unexpected error occurred. Please try again.'
        };
        return false;
      }
    },

    /**
     * Register new user account
     * @param {object} userData - User registration data
     * @param {string} userData.email - User email
     * @param {string} userData.password - User password
     * @param {string} userData.name - User name
     * @returns {Promise<boolean>} Success status
     */
    async register(userData) {
      try {
        const [error, data] = await userAPI.register(userData);

        if (error) {
          this.errors = {
            register: error.message || 'Registration failed. Please try again.'
          };
          return false;
        }

        this.userData = data.user;
        this.logged = true;
        localStorage.setItem('token', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        this.errors = {};
        return true;
      } catch (error) {
        console.error('Registration error:', error);
        this.errors = {
          register: 'An unexpected error occurred. Please try again.'
        };
        return false;
      }
    },

    /**
     * Logout user and clear all stored data
     * Removes authentication tokens and user data from localStorage
     */
    logout() {
      this.userData = null;
      this.logged = false;
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      // Clear favorites on logout for privacy
      localStorage.removeItem('filmsage_favorites');
      this.errors = {};
    },

    /**
     * Check localStorage for existing authentication data
     * Restores user session if valid data is found
     */
    checkLocalStorage() {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('userData');

      if (token && userData) {
        try {
          this.userData = JSON.parse(userData);
          this.logged = true;
        } catch (error) {
          console.error('Error parsing user data:', error);
          this.logout();
        }
      }
    },

    /**
     * Update user profile information
     * @param {object} profileData - Updated profile data
     * @returns {Promise<boolean>} Success status
     */
    async updateProfile(profileData) {
      try {
        const [error, data] = await userAPI.updateProfile(profileData);

        if (error) {
          this.errors = {
            profile: error.message || 'Failed to update profile. Please try again.'
          };
          return false;
        }

        this.userData = { ...this.userData, ...data.user };
        localStorage.setItem('userData', JSON.stringify(this.userData));
        this.errors = {};
        return true;
      } catch (error) {
        console.error('Profile update error:', error);
        this.errors = {
          profile: 'An unexpected error occurred. Please try again.'
        };
        return false;
      }
    },

    /**
     * Update user data in store and localStorage
     * Utility method to keep data synchronized
     * @param {object} newUserData - New user data to merge
     */
    updateUserData(newUserData) {
      this.userData = { ...this.userData, ...newUserData };
      localStorage.setItem('userData', JSON.stringify(this.userData));
    }
  }
});
