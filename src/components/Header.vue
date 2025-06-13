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
      isScrolled: false,
      showUserMenu: false
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
    },
    isAdmin() {
      return this.user?.role === 'admin';
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
    },
    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu;
    },
    closeUserMenu() {
      this.showUserMenu = false;
    }
  },
  mounted() {
    // Check localStorage for authentication on app start
    const authStore = useAuthStore();
    authStore.checkLocalStorage();
    
    window.addEventListener('scroll', this.handleScroll);
    document.addEventListener('click', (e) => {
      const userMenu = this.$refs.userMenu;
      const userButton = this.$refs.userButton;
      if (userMenu && !userMenu.contains(e.target) && !userButton.contains(e.target)) {
        this.closeUserMenu();
      }
    });
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
        <router-link v-if="isAuthenticated" to="/recommendations" class="nav-link">Recommendations</router-link>
      </nav>

      <div class="auth-section">
        <template v-if="isAuthenticated">
          <div class="user-menu">
            <div class="user-menu-container" ref="userMenu">
              <button 
                ref="userButton"
                class="username" 
                @click="toggleUserMenu"
              >
                {{ user?.username }}
                <span class="arrow" :class="{ 'up': showUserMenu }">▼</span>
              </button>
              <div v-show="showUserMenu" class="dropdown-menu">
                <router-link to="/profile" class="menu-item" @click="closeUserMenu">
                  <i class="fas fa-user"></i>
                  Profile
                </router-link>
                <router-link to="/favorites" class="menu-item" @click="closeUserMenu">
                  <i class="fas fa-heart"></i>
                  Favorites
                </router-link>
                <router-link v-if="isAdmin" to="/admin" class="menu-item" @click="closeUserMenu">
                  <i class="fas fa-cog"></i>
                  Admin Dashboard
                </router-link>
                <button @click="logout" class="menu-item logout">
                  <i class="fas fa-sign-out-alt"></i>
                  Sign Out
                </button>
              </div>
            </div>
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

<style src="@/styles/header.scss" lang="scss" scoped></style> 