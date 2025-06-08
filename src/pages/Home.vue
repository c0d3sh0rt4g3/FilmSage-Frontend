<template>
  <main class="home-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            Discover your next
            <span class="gradient-text">cinematic obsession</span>
          </h1>
          <p class="hero-subtitle">
            FilmSage uses artificial intelligence to offer you personalized recommendations 
            that truly connect with you. Forget about spending hours looking for what to watch.
          </p>
          <div class="hero-buttons">
            <button class="btn-primary" @click="startDiscovery">
              Start my journey
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
        <h2 class="section-title">The revolution of personalized entertainment</h2>
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
          <h2>Ready to discover your new cinematic world?</h2>
          <p>Join thousands of users who have already transformed their way of discovering entertainment</p>
          <button class="btn-cta" @click="openRegisterModal">
            Create free account
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

    <!-- Already Logged In modal -->
    <AlreadyLoggedInModal
      :show="showAlreadyLoggedInModal"
      @close="closeAlreadyLoggedInModal"
      @go-to-search="goToSearch"
    />
  </main>
</template>

<script>
import RegisterModal from "@/components/RegisterModal.vue";
import LoginModal from "@/components/LoginModal.vue";
import AlreadyLoggedInModal from "@/components/AlreadyLoggedInModal.vue";
import { useAuthStore } from '@/stores/authStore'
import { userAPI } from '@/utils/api'

export default {
  name: 'HomePage',
  components: {
    RegisterModal,
    LoginModal,
    AlreadyLoggedInModal
  },
  data() {
    return {
      showRegisterModal: false,
      showLoginModal: false,
      showAlreadyLoggedInModal: false,
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
      ],
      features: [
        {
          id: 1,
          icon: 'icon-ai',
          title: 'Personalized AI',
          description: 'Advanced algorithms that learn from your preferences to offer unique recommendations.'
        },
        {
          id: 2,
          icon: 'icon-search',
          title: 'Smart Search',
          description: 'Find exactly what you\'re looking for with autocomplete and advanced filters.'
        },
        {
          id: 3,
          icon: 'icon-social',
          title: 'Social Experience',
          description: 'Share your discoveries and connect with other movie and series enthusiasts.'
        },
        {
          id: 4,
          icon: 'icon-trending',
          title: 'Current Trends',
          description: 'Stay up to date with what\'s popular and the latest news in the audiovisual world.'
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
        const [error, data] = await userAPI.register({
          username: this.form.username,
          email: this.form.email,
          password: this.form.password,
          role: 'user'
        });

        if (error) {
          if (error.message.includes('already exists')) {
            this.generalError = 'A user with this email or username already exists';
          } else if (error.errors) {
            this.handleValidationErrors(error.errors);
          } else {
            this.generalError = error.message || 'Error creating account';
          }
          return;
        }

        this.handleRegistrationSuccess(data);
        this.resetForm();
        this.closeRegisterModal();
        alert('Account created successfully! Welcome to FilmSage.');
      } catch (error) {
        console.error('Registration error:', error);
        this.generalError = 'Connection error. Please try again.';
      } finally {
        this.loading = false;
      }
    },

    validateForm() {
      let isValid = true;

      if (!this.form.username.trim()) {
        this.errors.username = 'Username is required';
        isValid = false;
      } else if (this.form.username.length < 3) {
        this.errors.username = 'Username must be at least 3 characters long';
        isValid = false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!this.form.email.trim()) {
        this.errors.email = 'Email is required';
        isValid = false;
      } else if (!emailRegex.test(this.form.email)) {
        this.errors.email = 'Please enter a valid email';
        isValid = false;
      }

      if (!this.form.password) {
        this.errors.password = 'Password is required';
        isValid = false;
      } else if (this.form.password.length < 6) {
        this.errors.password = 'Password must be at least 6 characters long';
        isValid = false;
      }

      if (this.form.password !== this.form.confirmPassword) {
        this.errors.confirmPassword = 'Passwords do not match';
        isValid = false;
      }

      if (!this.form.terms) {
        this.errors.terms = 'You must accept the terms and conditions';
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
      const authStore = useAuthStore();
      if (authStore.isAuthenticated) {
        this.showAlreadyLoggedInModal = true;
        document.body.style.overflow = 'hidden';
      } else {
        this.showRegisterModal = true;
        document.body.style.overflow = 'hidden';
      }
    },

    closeRegisterModal() {
      this.resetForm();
      this.showRegisterModal = false;
      document.body.style.overflow = '';
    },

    handleRegistrationSuccess(userData) {
      this.closeRegisterModal();
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
      console.log('User logged in successfully:', userData);
    },

    switchToRegister() {
      this.closeLoginModal();
      this.showRegisterModal = true;
    },

    closeAlreadyLoggedInModal() {
      this.showAlreadyLoggedInModal = false;
      document.body.style.overflow = '';
    },

    goToSearch() {
      this.$router.push('/search');
    },

    async loadRandomMovies() {
      try {
        const apiKey = import.meta.env.VITE_MOVIEDB_API_KEY;
        if (!apiKey) {
          throw new Error('TMDB API key is not configured');
        }

        // Get popular movies first
        const popularUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`;
        const popularResponse = await fetch(popularUrl);
        if (!popularResponse.ok) {
          throw new Error(`Failed to fetch popular movies: ${popularResponse.status}`);
        }

        const popularData = await popularResponse.json();
        const movies = popularData.results || [];

        // Randomly select 3 movies
        const randomMovies = [];
        const usedIndices = new Set();

        while (randomMovies.length < 3 && usedIndices.size < movies.length) {
          const randomIndex = Math.floor(Math.random() * movies.length);
          if (!usedIndices.has(randomIndex)) {
            usedIndices.add(randomIndex);
            const movieDetails = await this.fetchMovieDetails(movies[randomIndex].id);
            if (movieDetails) {
              randomMovies.push(movieDetails);
            }
          }
        }

        this.featuredMovies = randomMovies;
      } catch (error) {
        console.error('Error loading random movies:', error);
        this.error = error.message;
      }
    },

    async fetchMovieDetails(movieId) {
      try {
        const apiKey = import.meta.env.VITE_MOVIEDB_API_KEY;
        const baseUrl = 'https://api.themoviedb.org/3';
        const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

        // Check if API key is available
        if (!apiKey) {
          console.error('TMDB API key is not available:', {
            envKeys: Object.keys(import.meta.env),
            hasMovieDBKey: 'VITE_MOVIEDB_API_KEY' in import.meta.env
          });
          throw new Error('TMDB API key is not configured');
        }

        const url = `${baseUrl}/movie/${movieId}?api_key=${apiKey}&language=en-US`;
        console.log('Fetching movie from:', url.replace(apiKey, 'API_KEY'));

        const response = await fetch(url);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `HTTP error! status: ${response.status}${errorData.status_message ? ` - ${errorData.status_message}` : ''}`
          );
        }

        const data = await response.json();

        return {
          id: data.id,
          imdbID: data.imdb_id,
          Title: data.title,
          Year: data.release_date ? data.release_date.split('-')[0] : 'N/A',
          Poster: data.poster_path ? `${imageBaseUrl}${data.poster_path}` : '/images/placeholder-movie.jpg',
          imdbRating: data.vote_average ? data.vote_average.toFixed(1) : 'N/A',
          Genre: data.genres ? data.genres.map(g => g.name).join(', ') : 'N/A',
          Plot: data.overview || 'No description available',
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
          Title: 'The Shawshank Redemption',
          Year: '1994',
          Poster: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
          imdbRating: '8.7',
          Genre: 'Drama',
          Plot: 'Two imprisoned men bond over a number of years...'
        },
        {
          id: 238,
          Title: 'The Godfather',
          Year: '1972',
          Poster: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
          imdbRating: '8.7',
          Genre: 'Drama, Crime',
          Plot: 'The patriarch of an organized crime dynasty...'
        },
        {
          id: 424,
          Title: 'The Dark Knight',
          Year: '2008',
          Poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
          imdbRating: '8.5',
          Genre: 'Action, Crime, Drama',
          Plot: 'When the menace known as the Joker...'
        }
      ];
    },

    startDiscovery() {
      const authStore = useAuthStore();
      if (authStore.isAuthenticated) {
        this.$router.push('/search');
      } else {
        this.openRegisterModal();
      }
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
