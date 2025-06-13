<script>
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/composables/useTheme';
import LoginModal from './LoginModal.vue';
import RegisterModal from './RegisterModal.vue';
import ThemeToggle from './ThemeToggle.vue';

export default {
  name: 'Header',
  components: {
    LoginModal,
    RegisterModal,
    ThemeToggle
  },
  data() {
    return {
      showLoginModal: false,
      showRegisterModal: false,
      showUserMenu: false,
      userMenuPosition: { top: 0, right: 0 }
    };
  },
  computed: {
    isAuthenticated() {
      return useAuthStore().isAuthenticated;
    },
    user() {
      return useAuthStore().getUser;
    },
    isAdmin() {
      const user = useAuthStore().getUser;
      return user?.role === 'admin';
    }
  },
  methods: {
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
      this.showRegisterModal = false;
    },
    handleRegisterSuccess() {
      this.showLoginModal = false;
      this.showRegisterModal = false;
    },
    logout() {
      const authStore = useAuthStore();
      authStore.logout();
      this.$router.push('/');
    },
    toggleUserMenu() {
      if (!this.showUserMenu) {
        // Calcular posición antes de mostrar el menú
        const userSection = this.$refs.userSection;
        if (userSection) {
          const rect = userSection.getBoundingClientRect();
          this.userMenuPosition = {
            top: rect.bottom + 8, // 8px de margen
            right: window.innerWidth - rect.right
          };
        }
      }
      this.showUserMenu = !this.showUserMenu;
    },
    closeUserMenu() {
      this.showUserMenu = false;
    }
  },
  setup() {
    const { loadFromStorage } = useTheme();
    return { loadFromStorage };
  },
  mounted() {
    // Check localStorage for authentication on app start
    const authStore = useAuthStore();
    authStore.checkLocalStorage();
    
    // Initialize theme
    this.loadFromStorage();
    
    // Header is now always fixed - no scroll listener needed
    
    // Cerrar menu de usuario cuando se hace click fuera
    document.addEventListener('click', (e) => {
      if (!this.$refs.userSection?.contains(e.target)) {
        this.closeUserMenu();
      }
    });
  },
  beforeUnmount() {
    // No scroll listener to remove
  }
};
</script>

<template>
  <div>
    <header 
      class="site-header" 
      style="position: static !important;"
    >
      <div class="header-content">
        <router-link to="/" class="logo">
          <img src="@/assets/logo.png" alt="FilmSage Logo" class="logo-image" />
          <span class="gradient-text">FilmSage</span>
        </router-link>
        
        <nav class="main-nav">
          <router-link to="/" class="nav-link">Home</router-link>
          <router-link v-if="isAuthenticated" to="/search" class="nav-link">Search</router-link>
          <router-link v-if="isAuthenticated" to="/recommendations" class="nav-link">Recommendations</router-link>
          <router-link to="/contact" class="nav-link">Contact</router-link>
        </nav>

        <div class="auth-section">
          <!-- Theme Toggle -->
          <ThemeToggle />
          
          <!-- User Section -->
          <div v-if="isAuthenticated" class="user-section" ref="userSection">
            <span 
              @click="toggleUserMenu" 
              class="username" 
              :class="{ 'active': showUserMenu }"
            >
              {{ user?.username || 'User' }}
            </span>
          </div>
          
          <!-- Auth Buttons -->
          <template v-else>
            <button @click="showLogin" class="btn-login">Sign In</button>
            <button @click="showRegister" class="btn-register">Sign Up</button>
          </template>
        </div>
      </div>
    </header>

    <!-- Login Modal -->
    <LoginModal 
      :show="showLoginModal" 
      @close="showLoginModal = false"
      @switch-to-register="showRegister"
      @success="handleLoginSuccess"
    />

    <!-- Register Modal -->
    <RegisterModal 
      :show="showRegisterModal" 
      @close="showRegisterModal = false"
      @switch-to-login="showLogin"
      @success="handleRegisterSuccess"
    />

    <!-- User Menu Portal (positioned outside header for maximum z-index) -->
    <div 
      v-if="isAuthenticated && showUserMenu" 
      class="user-menu-portal"
      :style="{
        top: userMenuPosition.top + 'px',
        right: userMenuPosition.right + 'px'
      }"
    >
      <div class="user-menu">
        <router-link to="/profile" class="menu-item" @click="closeUserMenu">
          Profile
        </router-link>
        <router-link to="/favorites" class="menu-item" @click="closeUserMenu">
          Favorites
        </router-link>
        <router-link v-if="isAdmin" to="/admin" class="menu-item" @click="closeUserMenu">
          Admin Dashboard
        </router-link>
        <button @click="logout" class="menu-item">
          Sign Out
        </button>
      </div>
    </div>
  </div>
</template>

<style src="@/styles/header.scss" lang="scss" scoped></style> 