<template>
  <teleport to="body">
    <transition name="modal" appear>
      <div v-if="show" class="modal-overlay" @click="closeModal">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h2>Bienvenido a <span class="gradient-text">FilmSage</span></h2>
            <button class="modal-close-btn" @click="closeModal">&times;</button>
          </div>

          <div class="modal-body">
            <form @submit.prevent="loginUser">
              <div class="modal-form-group">
                <label for="loginEmail" class="modal-form-label">Correo electrónico</label>
                <input
                  id="loginEmail"
                  v-model="email"
                  type="email"
                  class="modal-form-input"
                  :class="{ 'error': emailError }"
                  placeholder="tu@email.com"
                  @blur="validateEmail"
                  required
                />
                <span v-if="emailError" class="modal-error-message">{{ emailError }}</span>
              </div>

              <div class="modal-form-group">
                <label for="loginPassword" class="modal-form-label">Contraseña</label>
                <input
                  id="loginPassword"
                  v-model="password"
                  type="password"
                  class="modal-form-input"
                  :class="{ 'error': passwordError }"
                  placeholder="Ingresa tu contraseña"
                  @blur="validatePassword"
                  required
                />
                <span v-if="passwordError" class="modal-error-message">{{ passwordError }}</span>
              </div>

              <div class="modal-checkbox-group">
                <label class="modal-checkbox-label">
                  <input v-model="rememberMe" type="checkbox" />
                  <span class="checkmark"></span>
                  Recordarme
                </label>
              </div>

              <div v-if="loginError" class="modal-general-error">
                {{ loginError }}
              </div>

              <button type="submit" class="modal-submit-btn" :disabled="loading">
                <span v-if="loading" class="modal-spinner"></span>
                {{ loading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
              </button>
            </form>

            <div class="modal-forgot-password">
              <a href="#" @click.prevent="forgotPassword">¿Olvidaste tu contraseña?</a>
            </div>

            <div class="modal-link-section">
              ¿No tienes cuenta? <a href="#" @click.prevent="switchToRegister">Crear cuenta</a>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
import { useAuthStore } from '@/stores/authStore.js';
import { validateMail, validatePassword } from '@/utils/validation.js';

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
      email: '',
      password: '',
      rememberMe: false,
      emailError: '',
      passwordError: '',
      loginError: '',
      loading: false
    }
  },
  methods: {
    validateEmail() {
      this.emailError = '';
      const validMail = validateMail(this.email);
      if (!validMail) {
        this.emailError = 'Por favor ingresa un email válido.';
      }
    },

    validatePassword() {
      this.passwordError = '';
      const validPassword = validatePassword(this.password);
      if (!validPassword) {
        this.passwordError = 'La contraseña debe tener al menos 6 caracteres.';
      }
    },

    async loginUser() {
      this.loginError = '';

      this.validateEmail();
      this.validatePassword();
      if (this.emailError || this.passwordError) {
        return;
      }

      this.loading = true;

      const authStore = useAuthStore();
      const [error, data] = await authStore.login({
        email: this.email,
        password: this.password
      });

      if (error) {
        this.loginError = authStore.getErrors.message;
        this.loading = false;
        return;
      }

      this.$emit('success', data);
      this.resetForm();
      this.closeModal();
      this.loading = false;
    },

    resetForm() {
      this.email = '';
      this.password = '';
      this.rememberMe = false;
      this.clearErrors();
    },

    clearErrors() {
      this.emailError = '';
      this.passwordError = '';
      this.loginError = '';
    },

    closeModal() {
      this.resetForm();
      this.$emit('close');
    },

    switchToRegister() {
      this.$emit('switch-to-register');
    },

    forgotPassword() {
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

<style src="@/styles/login-register.scss" scoped></style>
