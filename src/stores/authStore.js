import { defineStore } from 'pinia';
import { apiRequest } from '@/utils/api';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

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
        const response = await fetch(`${BACKEND_URL}/users/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials)
        });

        const data = await response.json();

        if (response.ok) {
          this.userData = data.user;
          this.logged = true;
          localStorage.setItem('userData', JSON.stringify(data.user));
          localStorage.setItem('token', data.token);
          this.errors = {};
          return [null, data];
        } else {
          if (response.status === 401) {
            this.errors = { message: "Invalid email or password" };
          } else if (response.status === 404) {
            this.errors = { message: "User not found" };
          } else {
            this.errors = { message: data.message || "Login error" };
          }
          return [new Error(this.errors.message), null];
        }
      } catch (error) {
        this.errors = { message: "Connection error. Please try again." };
        return [error, null];
      }
    },

    async register(userData) {
      try {
        const response = await fetch(`${BACKEND_URL}/users/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok) {
          this.userData = data.user;
          this.logged = true;
          localStorage.setItem('userData', JSON.stringify(data.user));
          localStorage.setItem('token', data.token);
          this.errors = {};
          return [null, data];
        } else {
          if (response.status === 409) {
            this.errors = { message: "A user with this email or username already exists" };
          } else if (data.errors) {
            this.errors = { message: "Error in provided data" };
          } else {
            this.errors = { message: data.message || "Error creating account" };
          }
          return [new Error(this.errors.message), null];
        }
      } catch (error) {
        this.errors = { message: "Connection error. Please try again." };
        return [error, null];
      }
    },

    logout() {
      this.userData = null;
      this.logged = false;
      this.errors = {};
      localStorage.removeItem('userData');
      localStorage.removeItem('token');
    },

    clearErrors() {
      this.errors = {};
    },

    checkLocalStorage() {
      const userData = localStorage.getItem('userData');
      const token = localStorage.getItem('token');
      
      if (userData && token) {
        try {
          this.userData = JSON.parse(userData);
          this.logged = true;
        } catch (e) {
          this.logout();
        }
      } else {
        this.logout();
      }
    }
  }
});
