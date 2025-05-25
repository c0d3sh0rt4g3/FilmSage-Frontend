<template>
  <teleport to="body">
    <transition name="modal" appear>
      <div v-if="show" class="modal-overlay" @click="closeModal">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h2>Bienvenido a <span class="gradient-text">FilmSage</span></h2>
            <button class="close-btn" @click="closeModal">&times;</button>
          </div>

          <div class="modal-body">
            <form @submit.prevent="submitForm">
              <div class="form-group">
                <label for="loginEmail">Correo electrónico</label>
                <input
                  id="loginEmail"
                  v-model="form.email"
                  type="email"
                  :class="{ 'error': errors.email }"
                  placeholder="tu@email.com"
                  required
                />
                <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
              </div>

              <div class="form-group">
                <label for="loginPassword">Contraseña</label>
                <input
                  id="loginPassword"
                  v-model="form.password"
                  type="password"
                  :class="{ 'error': errors.password }"
                  placeholder="Ingresa tu contraseña"
                  required
                />
                <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
              </div>

              <div class="form-group checkbox-group">
                <label class="checkbox-label">
                  <input
                    v-model="form.rememberMe"
                    type="checkbox"
                  />
                  <span class="checkmark"></span>
                  Recordarme
                </label>
              </div>

              <div v-if="generalError" class="general-error">
                {{ generalError }}
              </div>

              <button
                type="submit"
                class="submit-btn"
                :disabled="loading"
              >
                <span v-if="loading" class="spinner"></span>
                {{ loading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
              </button>
            </form>

            <div class="forgot-password">
              <a href="#" @click.prevent="forgotPassword">¿Olvidaste tu contraseña?</a>
            </div>

            <div class="register-link">
              ¿No tienes cuenta? <a href="#" @click.prevent="switchToRegister">Crear cuenta</a>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
export default {
  name: 'LoginModal',
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'success', 'switch-to-register'],
  data() {
    return {
      form: {
        email: '',
        password: '',
        rememberMe: false
      },
      errors: {},
      generalError: '',
      loading: false
    }
  },
  methods: {
    async submitForm() {
      this.clearErrors();

      if (!this.validateForm()) {
        return;
      }

      this.loading = true;

      try {
        const response = await fetch('http://localhost:3000/users/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: this.form.email,
            password: this.form.password,
            rememberMe: this.form.rememberMe
          })
        });

        const data = await response.json();

        if (response.ok) {
          this.$emit('success', data);
          this.resetForm();
          this.closeModal();
          alert('¡Bienvenido de nuevo a FilmSage!');
        } else {
          if (response.status === 401) {
            this.generalError = 'Email o contraseña incorrectos';
          } else if (response.status === 404) {
            this.generalError = 'Usuario no encontrado';
          } else if (data.errors) {
            this.handleValidationErrors(data.errors);
          } else {
            this.generalError = data.message || 'Error al iniciar sesión';
          }
        }
      } catch (error) {
        console.error('Error de login:', error);
        this.generalError = 'Error de conexión. Por favor, inténtalo de nuevo.';
      } finally {
        this.loading = false;
      }
    },

    validateForm() {
      let isValid = true;

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!this.form.email.trim()) {
        this.errors.email = 'El email es requerido';
        isValid = false;
      } else if (!emailRegex.test(this.form.email)) {
        this.errors.email = 'Ingresa un email válido';
        isValid = false;
      }

      if (!this.form.password) {
        this.errors.password = 'La contraseña es requerida';
        isValid = false;
      }

      return isValid;
    },

    handleValidationErrors(errors) {
      errors.forEach(error => {
        if (error.param) {
          this.errors[error.param] = error.msg;
        }
      });
    },

    clearErrors() {
      this.errors = {};
      this.generalError = '';
    },

    resetForm() {
      this.form = {
        email: '',
        password: '',
        rememberMe: false
      };
      this.clearErrors();
    },

    closeModal() {
      this.resetForm();
      this.$emit('close');
    },

    switchToRegister() {
      this.$emit('switch-to-register');
    },

    forgotPassword() {
      // Implementar funcionalidad de recuperar contraseña
      alert('Funcionalidad de recuperar contraseña próximamente');
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  },
  beforeUnmount() {
    document.body.style.overflow = '';
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  width: 90%;
  max-width: 450px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
  color: white;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px 30px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
}

.gradient-text {
  background: linear-gradient(45deg, #ff6b6b, #feca57);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.modal-body {
  padding: 30px;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);
}

.form-group input[type="email"],
.form-group input[type="password"] {
  width: 100%;
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 1rem;
  color: white;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.form-group input:focus {
  outline: none;
  border-color: rgba(255, 107, 107, 0.6);
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.2);
  background: rgba(255, 255, 255, 0.15);
}

.form-group input.error {
  border-color: #ff4757;
  box-shadow: 0 0 0 3px rgba(255, 71, 87, 0.2);
}

.error-message {
  color: #ff6b6b;
  font-size: 0.85rem;
  margin-top: 5px;
  display: block;
  background: rgba(255, 107, 107, 0.1);
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 107, 107, 0.3);
}

.checkbox-group {
  margin-bottom: 20px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
}

.checkbox-label input[type="checkbox"] {
  margin-right: 12px;
  accent-color: #ff6b6b;
}

.general-error {
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  border: 1px solid rgba(255, 107, 107, 0.4);
  backdrop-filter: blur(10px);
}

.submit-btn {
  width: 100%;
  padding: 18px;
  background: linear-gradient(45deg, #ff6b6b, #feca57);
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(255, 107, 107, 0.4);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.forgot-password {
  text-align: center;
  margin: 20px 0;
}

.forgot-password a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 0.9rem;
}

.forgot-password a:hover {
  color: #feca57;
  text-decoration: underline;
}

.register-link {
  text-align: center;
  margin-top: 25px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.register-link a {
  color: #feca57;
  text-decoration: none;
  font-weight: 600;
}

.register-link a:hover {
  text-decoration: underline;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.modal-enter-active, .modal-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(50px);
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.8) translateY(50px);
}

@media (max-width: 480px) {
  .modal-container {
    width: 95%;
    margin: 20px;
  }

  .modal-header,
  .modal-body {
    padding: 20px;
  }

  .modal-header h2 {
    font-size: 1.5rem;
  }

  .form-group input[type="email"],
  .form-group input[type="password"] {
    padding: 14px;
  }
}
</style>
