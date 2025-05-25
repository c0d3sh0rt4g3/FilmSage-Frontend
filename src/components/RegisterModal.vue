<template>
  <teleport to="body">
    <transition name="modal" appear>
      <div v-if="show" class="modal-overlay" @click="closeModal">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h2>Únete a <span class="gradient-text">FilmSage</span></h2>
            <button class="close-btn" @click="closeModal">&times;</button>
          </div>

          <div class="modal-body">
            <form @submit.prevent="submitForm">
              <div class="form-group">
                <label for="username">Nombre de usuario</label>
                <input
                  id="username"
                  v-model="form.username"
                  type="text"
                  :class="{ 'error': errors.username }"
                  placeholder="Ingresa tu nombre de usuario"
                  required
                />
                <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
              </div>

              <div class="form-group">
                <label for="email">Correo electrónico</label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  :class="{ 'error': errors.email }"
                  placeholder="tu@email.com"
                  required
                />
                <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
              </div>

              <div class="form-group">
                <label for="password">Contraseña</label>
                <input
                  id="password"
                  v-model="form.password"
                  type="password"
                  :class="{ 'error': errors.password }"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
              </div>

              <div class="form-group">
                <label for="confirmPassword">Confirmar contraseña</label>
                <input
                  id="confirmPassword"
                  v-model="form.confirmPassword"
                  type="password"
                  :class="{ 'error': errors.confirmPassword }"
                  placeholder="Repite tu contraseña"
                  required
                />
                <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
              </div>

              <div class="form-group checkbox-group">
                <label class="checkbox-label">
                  <input
                    v-model="form.terms"
                    type="checkbox"
                    required
                  />
                  <span class="checkmark"></span>
                  Acepto los <a href="#" @click.prevent>términos y condiciones</a>
                </label>
                <span v-if="errors.terms" class="error-message">{{ errors.terms }}</span>
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
                {{ loading ? 'Creando cuenta...' : 'Comenzar mi aventura' }}
              </button>
            </form>

            <div class="login-link">
              ¿Ya tienes cuenta? <a href="#" @click.prevent="switchToLogin">Inicia sesión</a>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
export default {
  name: 'RegisterModal',
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'success', 'switch-to-login'],
  data() {
    return {
      form: {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        terms: false
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
        const response = await fetch('http://localhost:3000/users/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: this.form.username,
            email: this.form.email,
            password: this.form.password,
            role: 'user'
          })
        });

        const data = await response.json();

        if (response.ok) {
          this.$emit('success', data);
          this.resetForm();
          this.closeModal();
          alert('¡Cuenta creada exitosamente! Bienvenido a FilmSage.');
        } else {
          if (response.status === 409) {
            this.generalError = 'Ya existe un usuario con este email o nombre de usuario';
          } else if (data.errors) {
            this.handleValidationErrors(data.errors);
          } else {
            this.generalError = data.message || 'Error al crear la cuenta';
          }
        }
      } catch (error) {
        console.error('Error de registro:', error);
        this.generalError = 'Error de conexión. Por favor, inténtalo de nuevo.';
      } finally {
        this.loading = false;
      }
    },

    validateForm() {
      let isValid = true;

      if (!this.form.username.trim()) {
        this.errors.username = 'El nombre de usuario es requerido';
        isValid = false;
      } else if (this.form.username.length < 3) {
        this.errors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
        isValid = false;
      }

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
      } else if (this.form.password.length < 6) {
        this.errors.password = 'La contraseña debe tener al menos 6 caracteres';
        isValid = false;
      }

      if (this.form.password !== this.form.confirmPassword) {
        this.errors.confirmPassword = 'Las contraseñas no coinciden';
        isValid = false;
      }

      if (!this.form.terms) {
        this.errors.terms = 'Debes aceptar los términos y condiciones';
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
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        terms: false
      };
      this.clearErrors();
    },

    closeModal() {
      this.resetForm();
      this.$emit('close');
    },

    switchToLogin() {
      this.$emit('switch-to-login');
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
  max-width: 480px;
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

.form-group input[type="text"],
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
  align-items: flex-start;
  cursor: pointer;
  font-size: 0.9rem;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.9);
}

.checkbox-label input[type="checkbox"] {
  margin-right: 12px;
  margin-top: 2px;
  accent-color: #ff6b6b;
}

.checkbox-label a {
  color: #feca57;
  text-decoration: none;
  font-weight: 600;
}

.checkbox-label a:hover {
  text-decoration: underline;
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.login-link {
  text-align: center;
  margin-top: 25px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.login-link a {
  color: #feca57;
  text-decoration: none;
  font-weight: 600;
}

.login-link a:hover {
  text-decoration: underline;
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

  .form-group input[type="text"],
  .form-group input[type="email"],
  .form-group input[type="password"] {
    padding: 14px;
  }
}
</style>
