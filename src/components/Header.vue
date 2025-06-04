<script>
import { useAuthStore } from '@/stores/authStore';
import LoginModal from './LoginModal.vue';
import RegisterModal from './RegisterModal.vue';

export default {
  name: 'Header',
  components: {
    LoginModal,
    RegisterModal
  },
  data() {
    return {
      showLoginModal: false,
      showRegisterModal: false,
      isScrolled: false
    };
  },
  computed: {
    isAuthenticated() {
      const authStore = useAuthStore();
      return authStore.isAuthenticated;
    },
    user() {
      const authStore = useAuthStore();
      return authStore.getUser;
    }
  },
  methods: {
    handleScroll() {
      this.isScrolled = window.scrollY > 20;
    },
    showLogin() {
      this.showLoginModal = true;
      this.showRegisterModal = false;
    },
    showRegister() {
      this.showRegisterModal = true;
      this.showLoginModal = false;
    },
    handleLoginSuccess() {
      this.showLoginModal = false;
      this.$router.push('/search');
    },
    handleRegisterSuccess() {
      this.showRegisterModal = false;
      this.$router.push('/search');
    },
    logout() {
      const authStore = useAuthStore();
      authStore.logout();
      this.$router.push('/');
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }
};
</script>

<template>
  <header :class="['site-header', { 'scrolled': isScrolled }]">
    <div class="header-content">
      <router-link to="/" class="logo">
        <span class="gradient-text">FilmSage</span>
      </router-link>
      
      <nav class="main-nav">
        <router-link to="/" class="nav-link">Home</router-link>
        <router-link v-if="isAuthenticated" to="/search" class="nav-link">Search</router-link>
      </nav>

      <div class="auth-section">
        <template v-if="isAuthenticated">
          <div class="user-menu">
            <span class="username">{{ user?.username }}</span>
            <button @click="logout" class="btn-logout">Sign Out</button>
          </div>
        </template>
        <template v-else>
          <button @click="showLogin" class="btn-login">Sign In</button>
          <button @click="showRegister" class="btn-register">Sign Up</button>
        </template>
      </div>
    </div>

    <LoginModal
      :show="showLoginModal"
      @close="showLoginModal = false"
      @success="handleLoginSuccess"
      @switch-to-register="showRegister"
    />

    <RegisterModal
      :show="showRegisterModal"
      @close="showRegisterModal = false"
      @success="handleRegisterSuccess"
      @switch-to-login="showLogin"
    />
  </header>
</template>

<style src="@/styles/header.scss" scoped></style> 