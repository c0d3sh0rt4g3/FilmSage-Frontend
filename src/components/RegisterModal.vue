<template>
  <teleport to="body">
    <transition name="modal" appear>
      <div v-if="show" class="modal-overlay" @click="closeModal">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h2>Join <span class="gradient-text">FilmSage</span></h2>
            <button class="modal-close-btn" @click="closeModal">&times;</button>
          </div>

          <div class="modal-body">
            <form @submit.prevent="registerUser">
              <div class="modal-form-group">
                <label for="username" class="modal-form-label">Username</label>
                <input
                  id="username"
                  v-model="username"
                  type="text"
                  class="modal-form-input"
                  :class="{ 'error': usernameError }"
                  placeholder="Enter your username"
                  @blur="validateUsername"
                  required
                />
                <span v-if="usernameError" class="modal-error-message">{{ usernameError }}</span>
              </div>

              <div class="modal-form-group">
                <label for="email" class="modal-form-label">Email</label>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  class="modal-form-input"
                  :class="{ 'error': emailError }"
                  placeholder="you@email.com"
                  @blur="validateEmail"
                  required
                />
                <span v-if="emailError" class="modal-error-message">{{ emailError }}</span>
              </div>

              <div class="modal-form-group">
                <label for="password" class="modal-form-label">Password</label>
                <input
                  id="password"
                  v-model="password"
                  type="password"
                  class="modal-form-input"
                  :class="{ 'error': passwordError }"
                  placeholder="Minimum 6 characters"
                  @blur="validatePassword"
                  required
                />
                <span v-if="passwordError" class="modal-error-message">{{ passwordError }}</span>
              </div>

              <div class="modal-form-group">
                <label for="confirmPassword" class="modal-form-label">Confirm Password</label>
                <input
                  id="confirmPassword"
                  v-model="confirmPassword"
                  type="password"
                  class="modal-form-input"
                  :class="{ 'error': confirmPasswordError }"
                  placeholder="Repeat your password"
                  @blur="validateConfirmPassword"
                  required
                />
                <span v-if="confirmPasswordError" class="modal-error-message">{{ confirmPasswordError }}</span>
              </div>

              <div class="modal-checkbox-group">
                <label class="modal-checkbox-label">
                  <input v-model="terms" type="checkbox" required />
                  <span class="checkmark"></span>
                  I accept the <a href="#" @click.prevent>terms and conditions</a>
                </label>
                <span v-if="termsError" class="modal-error-message">{{ termsError }}</span>
              </div>

              <div v-if="registerError" class="modal-general-error">
                {{ registerError }}
              </div>

              <button type="submit" class="modal-submit-btn" :disabled="loading">
                <span v-if="loading" class="modal-spinner"></span>
                {{ loading ? 'Creating account...' : 'Start my journey' }}
              </button>
            </form>

            <div class="modal-link-section">
              Already have an account? <a href="#" @click.prevent="switchToLogin">Sign in</a>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
import { useAuthStore } from '@/stores/authStore.js';
import { validateName, validateMail, validatePassword, validateRepeatPassword } from '@/utils/validation.js';

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
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
      usernameError: '',
      emailError: '',
      passwordError: '',
      confirmPasswordError: '',
      termsError: '',
      registerError: '',
      loading: false
    }
  },
  methods: {
    validateUsername() {
      this.usernameError = '';
      const validName = validateName(this.username);
      if (!validName) {
        this.usernameError = 'Username must be at least 3 characters long.';
      }
    },

    validateEmail() {
      this.emailError = '';
      const validMail = validateMail(this.email);
      if (!validMail) {
        this.emailError = 'Please enter a valid email.';
      }
    },

    validatePassword() {
      this.passwordError = '';
      const validPassword = validatePassword(this.password);
      if (!validPassword) {
        this.passwordError = 'Password must be at least 6 characters long.';
      }
    },

    validateConfirmPassword() {
      this.confirmPasswordError = '';
      const validRepeatPassword = validateRepeatPassword(this.password, this.confirmPassword);
      if (!validRepeatPassword) {
        this.confirmPasswordError = 'Passwords do not match.';
      }
    },

    validateTerms() {
      this.termsError = '';
      if (!this.terms) {
        this.termsError = 'You must accept the terms and conditions.';
      }
    },

    async registerUser() {
      this.registerError = '';

      this.validateUsername();
      this.validateEmail();
      this.validatePassword();
      this.validateConfirmPassword();
      this.validateTerms();

      if (this.usernameError || this.emailError || this.passwordError || this.confirmPasswordError || this.termsError) {
        return;
      }

      this.loading = true;

      const authStore = useAuthStore();
      const [error, data] = await authStore.register({
        username: this.username,
        email: this.email,
        password: this.password,
        role: 'user'
      });

      if (error) {
        this.registerError = authStore.getErrors.message;
        this.loading = false;
        return;
      }

      this.$emit('success', data);
      this.resetForm();
      this.closeModal();
      this.loading = false;
      this.$router.push('/search');
    },

    resetForm() {
      this.username = '';
      this.email = '';
      this.password = '';
      this.confirmPassword = '';
      this.terms = false;
      this.clearErrors();
    },

    clearErrors() {
      this.usernameError = '';
      this.emailError = '';
      this.passwordError = '';
      this.confirmPasswordError = '';
      this.termsError = '';
      this.registerError = '';
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

<style src="@/styles/login-register.scss" scoped></style>
