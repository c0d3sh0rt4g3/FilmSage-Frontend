import { defineStore } from 'pinia';

const BACKEND_URL = process.env.BACKEND_URL

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
        const response = await fetch('${BACKEND_URL}/users/login', {
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
          this.errors = {};
          return [null, data];
        } else {
          if (response.status === 401) {
            this.errors = { message: "Email o contraseña incorrectos" };
          } else if (response.status === 404) {
            this.errors = { message: "Usuario no encontrado" };
          } else {
            this.errors = { message: data.message || "Error al iniciar sesión" };
          }
          return [new Error(this.errors.message), null];
        }
      } catch (error) {
        this.errors = { message: "Error de conexión. Por favor, inténtalo de nuevo." };
        return [error, null];
      }
    },

    async register(userData) {
      try {
        const response = await fetch('${BACKEND_URL}/users/register', {
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
          this.errors = {};
          return [null, data];
        } else {
          if (response.status === 409) {
            this.errors = { message: "Ya existe un usuario con este email o nombre de usuario" };
          } else if (data.errors) {
            this.errors = { message: "Error en los datos proporcionados" };
          } else {
            this.errors = { message: data.message || "Error al crear la cuenta" };
          }
          return [new Error(this.errors.message), null];
        }
      } catch (error) {
        this.errors = { message: "Error de conexión. Por favor, inténtalo de nuevo." };
        return [error, null];
      }
    },

    logout() {
      this.userData = null;
      this.logged = false;
      this.errors = {};
      localStorage.removeItem('userData');
    },

    clearErrors() {
      this.errors = {};
    },

    checkLocalStorage() {
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          this.userData = JSON.parse(userData);
          this.logged = true;
        } catch (e) {
          localStorage.removeItem('userData');
        }
      }
    }
  }
});
