import { defineStore } from 'pinia';
import { userAPI } from '@/utils/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    userData: null,
    logged: false,
    errors: {}
  }),

  getters: {
    isAuthenticated: (state) => state.logged,
    getUser: (state) => state.userData,
    getErrors: (state) => state.errors
  },

  actions: {
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

    logout() {
      this.userData = null;
      this.logged = false;
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      this.errors = {};
    },

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
    }
  }
});
