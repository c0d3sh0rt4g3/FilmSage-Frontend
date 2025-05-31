<template>
  <main class="home-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            Descubre tu próxima
            <span class="gradient-text">obsesión cinematográfica</span>
          </h1>
          <p class="hero-subtitle">
            FilmSage utiliza inteligencia artificial para ofrecerte recomendaciones
            personalizadas que realmente conectan contigo. Olvídate de perder horas
            buscando qué ver.
          </p>
          <div class="hero-buttons">
            <button class="btn-primary" @click="startDiscovery">
              Comenzar mi viaje
            </button>
          </div>
        </div>
        <div class="hero-visual">
          <div class="floating-cards">
            <div class="movie-card" v-for="movie in featuredMovies" :key="movie.imdbID">
              <img :src="movie.Poster !== 'N/A' ? movie.Poster : '/images/placeholder-movie.jpg'" :alt="movie.Title" />
              <div class="card-overlay">
                <span class="rating">{{ movie.imdbRating || 'N/A' }}</span>
              </div>
              <div class="movie-info">
                <p>{{ movie.Year }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <h2 class="section-title">La revolución del entretenimiento personalizado</h2>
        <div class="features-grid">
          <div class="feature-card" v-for="feature in features" :key="feature.id">
            <div class="feature-icon">
              <i :class="feature.icon"></i>
            </div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="cta">
      <div class="container">
        <div class="cta-content">
          <h2>¿Listo para descubrir tu nuevo mundo cinematográfico?</h2>
          <p>Únete a miles de usuarios que ya han transformado su forma de descubrir entretenimiento</p>
          <button class="btn-cta" @click="openRegisterModal">
            Crear cuenta gratuita
          </button>
        </div>
      </div>
    </section>

    <!-- Register modal -->
    <RegisterModal
      :show="showRegisterModal"
      @close="closeRegisterModal"
      @success="handleRegistrationSuccess"
      @switch-to-login="switchToLogin"
    />

    <!-- Login modal -->
    <LoginModal
      :show="showLoginModal"
      @close="closeLoginModal"
      @success="handleLoginSuccess"
      @switch-to-register="switchToRegister"
    />
  </main>
</template>

<script>
import RegisterModal from "@/components/RegisterModal.vue";
import LoginModal from "@/components/LoginModal.vue";
import { useAuthStore } from '@/stores/authStore'

export default {
  name: 'HomePage',
  components: {
    RegisterModal,
    LoginModal
  },
  data() {
    return {
      showRegisterModal: false,
      showLoginModal: false,
      form: {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        terms: false
      },
      errors: {},
      generalError: '',
      loading: false,
      featuredMovies: [],
      popularMovieIds: [
        278, 238, 240, 424, 389, 129, 19, 637, 13, 155,
        11, 1891, 1892, 105, 120, 121, 122, 680, 769, 497,
        98, 429, 510, 346, 372, 274, 475, 207, 857, 311,
        324, 329, 49, 745, 539, 299534, 299536, 634649, 284054, 438631,
        414906, 76600, 27205, 550, 807, 1422, 157336, 244786, 335984, 181808,
        181812, 330457, 568124, 508947, 508442, 502356, 447365, 569094, 385687, 447277,
        594767, 616037, 435041, 284053, 363088, 315635, 338958, 580489, 335787, 632357,
        675353, 370172, 524047, 581389, 476669, 460465, 399566, 539681, 718930, 760104,
        675278, 862, 103, 73, 423, 599, 1726, 1891, 1892, 1893,
        1894, 1895, 1896, 1897, 1898, 1899, 1900, 1901, 1902, 1903
      ]
      ,
      features: [
        {
          id: 1,
          icon: 'icon-ai',
          title: 'IA Personalizada',
          description: 'Algoritmos avanzados que aprenden de tus gustos para ofrecerte recomendaciones únicas.'
        },
        {
          id: 2,
          icon: 'icon-search',
          title: 'Búsqueda Inteligente',
          description: 'Encuentra exactamente lo que buscas con autocompletado y filtros avanzados.'
        },
        {
          id: 3,
          icon: 'icon-social',
          title: 'Experiencia Social',
          description: 'Comparte tus descubrimientos y conecta con otros amantes del cine y las series.'
        },
        {
          id: 4,
          icon: 'icon-trending',
          title: 'Tendencias Actuales',
          description: 'Mantente al día con lo más popular y las últimas novedades del mundo audiovisual.'
        }
      ]
    }
  },
  async mounted() {
    const authStore = useAuthStore();
    authStore.checkLocalStorage();
    await this.loadRandomMovies();
    this.initAnimations();
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
          this.handleRegistrationSuccess(data);
          this.resetForm();
          this.closeRegisterModal();
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

    openRegisterModal() {
      this.showRegisterModal = true;
      document.body.style.overflow = 'hidden';
    },

    closeRegisterModal() {
      this.resetForm();
      this.showRegisterModal = false;
      document.body.style.overflow = '';
    },

    handleRegistrationSuccess(userData) {
      console.log('Usuario registrado exitosamente:', userData);
    },

    switchToLogin() {
      this.closeRegisterModal();
      this.showLoginModal = true;
    },

    openLoginModal() {
      this.showLoginModal = true;
      document.body.style.overflow = 'hidden';
    },

    closeLoginModal() {
      this.showLoginModal = false;
      document.body.style.overflow = '';
    },

    handleLoginSuccess(userData) {
      console.log('Usuario logueado exitosamente:', userData);
    },

    switchToRegister() {
      this.closeLoginModal();
      this.showRegisterModal = true;
    },

    async loadRandomMovies() {
      this.loading = true;
      try {
        const selectedMovies = this.getRandomMovieIds(3);
        const moviePromises = selectedMovies.map(id => this.fetchMovieDetails(id));
        const movies = await Promise.all(moviePromises);

        const validMovies = movies.filter(movie => movie !== null);

        if (validMovies.length > 0) {
          this.featuredMovies = validMovies;
        } else {
          this.loadFallbackMovies();
        }
      } catch (error) {
        console.error('Error cargando películas:', error);
        this.loadFallbackMovies();
      } finally {
        this.loading = false;
      }
    },

    getRandomMovieIds(count) {
      const shuffled = [...this.popularMovieIds].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    },

    async fetchMovieDetails(movieId) {
      try {
        const apiKey = process.env.VUE_APP_API_KEY;
        const baseUrl = 'https://api.themoviedb.org/3';
        const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

        const url = `${baseUrl}/movie/${movieId}?api_key=${apiKey}&language=es-ES`;

        console.log(`Fetching movie: ${url}`);

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        console.log('Movie data received:', data);

        return {
          id: data.id,
          imdbID: data.imdb_id,
          Title: data.title,
          Year: data.release_date ? data.release_date.split('-')[0] : 'N/A',
          Poster: data.poster_path ? `${imageBaseUrl}${data.poster_path}` : '/images/placeholder-movie.jpg',
          imdbRating: data.vote_average ? data.vote_average.toFixed(1) : 'N/A',
          Genre: data.genres ? data.genres.map(g => g.name).join(', ') : 'N/A',
          Plot: data.overview || 'Sin descripción disponible',
          Director: 'N/A',
          Actors: 'N/A',
          Runtime: data.runtime ? `${data.runtime} min` : 'N/A',
          Language: data.original_language?.toUpperCase() || 'N/A'
        };
      } catch (error) {
        console.error('Error fetching movie details:', error);
        return null;
      }
    },

    loadFallbackMovies() {
      this.featuredMovies = [
        {
          id: 278,
          Title: 'Cadena perpetua',
          Year: '1994',
          Poster: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
          imdbRating: '8.7',
          Genre: 'Drama',
          Plot: 'Dos hombres encarcelados se unen a lo largo de varios años...'
        },
        {
          id: 238,
          Title: 'El Padrino',
          Year: '1972',
          Poster: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
          imdbRating: '8.7',
          Genre: 'Drama, Crimen',
          Plot: 'El patriarca de una dinastía del crimen organizado...'
        },
        {
          id: 424,
          Title: 'El Caballero Oscuro',
          Year: '2008',
          Poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
          imdbRating: '8.5',
          Genre: 'Acción, Crimen, Drama',
          Plot: 'Cuando la amenaza conocida como el Joker...'
        }
      ];
    },

    startDiscovery() {
      this.openRegisterModal();
    },

    signUp() {
      this.openRegisterModal();
    },

    initAnimations() {
      this.$nextTick(() => {
        const cards = document.querySelectorAll('.movie-card');
        cards.forEach((card, index) => {
          card.style.animationDelay = `${index * 0.2}s`;
        });
      });
    }
  },
  beforeUnmount() {
    document.body.style.overflow = '';
  }
}
</script>

<style src="@/styles/home.scss" scoped></style>
