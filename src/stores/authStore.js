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

        // Normalize user ID - ensure both _id and id are available
        const normalizedUser = { ...data.user };
        if (normalizedUser._id && !normalizedUser.id) {
          normalizedUser.id = normalizedUser._id;
        } else if (normalizedUser.id && !normalizedUser._id) {
          normalizedUser._id = normalizedUser.id;
        }

        this.userData = normalizedUser;
        this.logged = true;
        localStorage.setItem('token', data.token);
        localStorage.setItem('userData', JSON.stringify(normalizedUser));
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

        // Normalize user ID - ensure both _id and id are available
        const normalizedUser = { ...data.user };
        if (normalizedUser._id && !normalizedUser.id) {
          normalizedUser.id = normalizedUser._id;
        } else if (normalizedUser.id && !normalizedUser._id) {
          normalizedUser._id = normalizedUser.id;
        }

        this.userData = normalizedUser;
        this.logged = true;
        localStorage.setItem('token', data.token);
        localStorage.setItem('userData', JSON.stringify(normalizedUser));
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
          const parsedUserData = JSON.parse(userData);
          
          // Normalize user ID - ensure both _id and id are available
          if (parsedUserData._id && !parsedUserData.id) {
            parsedUserData.id = parsedUserData._id;
          } else if (parsedUserData.id && !parsedUserData._id) {
            parsedUserData._id = parsedUserData.id;
          }
          
          this.userData = parsedUserData;
          this.logged = true;
          
          // Update localStorage with normalized data
          localStorage.setItem('userData', JSON.stringify(parsedUserData));
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
      const mergedData = { ...this.userData, ...newUserData };
      
      // Normalize user ID - ensure both _id and id are available
      if (mergedData._id && !mergedData.id) {
        mergedData.id = mergedData._id;
      } else if (mergedData.id && !mergedData._id) {
        mergedData._id = mergedData.id;
      }
      
      this.userData = mergedData;
      localStorage.setItem('userData', JSON.stringify(mergedData));
    }
  }
});
