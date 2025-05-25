<template>
  <div class="home-page">
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
                <h4>{{ movie.Title }}</h4>
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
  </div>
</template>

<script>
import RegisterModal from "@/components/RegisterModal.vue";
import LoginModal from "@/components/LoginModal.vue";

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
        278, 238, 240, 424, 389, 129, 155, 497, 680, 13,
        122, 12, 11, 769, 19, 637, 423, 98, 429, 510,
        346, 120, 372, 274, 475, 207, 105, 857, 311, 324,
        329, 49, 745, 539, 424, 680, 769, 637, 423, 98,
        429, 510, 346, 120, 372, 274, 475, 207, 105, 857
      ],
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
        const apiKey = '01eab7cf7274849e56bf6b0969c6627d';
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

<style scoped>
/* Estilos del Home existentes */
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: 100vw;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

.hero {
  padding: 80px 0 60px;
  position: relative;
  overflow: hidden;
  width: 100%;
}

.hero-content {
  width: 95%;
  max-width: none;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5%;
  align-items: center;
  padding: 0 2.5%;
}

.hero-title {
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 2rem;
}

.gradient-text {
  background: linear-gradient(45deg, #ff6b6b, #feca57);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: clamp(1.1rem, 2.5vw, 1.6rem);
  line-height: 1.6;
  margin-bottom: 2.5rem;
  opacity: 0.9;
}

.hero-buttons {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary {
  padding: 1.2rem 2.5rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: clamp(1rem, 2vw, 1.2rem);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 200px;
}

.btn-primary {
  background: linear-gradient(45deg, #ff6b6b, #feca57);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.btn-secondary {
  background: transparent;
  color: white;
  border: 2px solid rgba(255,255,255,0.3);
}

.btn-secondary:hover {
  background: rgba(255,255,255,0.1);
}

.floating-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2%;
  transform: perspective(1000px) rotateY(-15deg);
  width: 100%;
}

.movie-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  animation: float 6s ease-in-out infinite;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  cursor: pointer;
  transition: transform 0.3s ease;
}

.movie-card:hover {
  transform: scale(1.05);
}

.movie-card img {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.card-overlay {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0,0,0,0.8);
  padding: 8px 12px;
  border-radius: 20px;
  z-index: 2;
}

.rating {
  color: #feca57;
  font-weight: 600;
}

.movie-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.9));
  padding: 20px 15px 15px;
  color: white;
}

.movie-info h4 {
  margin: 0 0 5px 0;
  font-size: 1rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.movie-info p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

.features {
  padding: 8rem 0;
  background: rgba(255,255,255,0.05);
  width: 100%;
}

.container {
  width: 95%;
  max-width: none;
  margin: 0 auto;
  padding: 0 2.5%;
}

.section-title {
  text-align: center;
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 700;
  margin-bottom: 5rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 3%;
  width: 100%;
}

.feature-card {
  text-align: center;
  padding: 3rem 2rem;
  border-radius: 24px;
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(15px);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-10px);
}

.feature-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  background: linear-gradient(45deg, #ff6b6b, #feca57);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.ai-showcase {
  padding: 8rem 0;
  width: 100%;
}

.showcase-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5%;
  align-items: center;
  width: 95%;
  margin: 0 auto;
  padding: 0 2.5%;
}

.ai-features {
  list-style: none;
  padding: 0;
  margin-top: 32px;
}

.ai-features li {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  font-size: 1.1rem;
}

.cta {
  padding: 8rem 0;
  text-align: center;
  width: 100%;
}

.cta-content {
  width: 95%;
  margin: 0 auto;
  padding: 0 2.5%;
}

.cta-content h2 {
  font-size: clamp(2rem, 4vw, 3.5rem);
  margin-bottom: 2rem;
}

.cta-content p {
  font-size: clamp(1.1rem, 2.5vw, 1.4rem);
  margin-bottom: 3rem;
  opacity: 0.9;
}

.btn-cta {
  padding: 20px 40px;
  font-size: 1.2rem;
  font-weight: 700;
  background: linear-gradient(45deg, #ff6b6b, #feca57);
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cta:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.3);
}

/* Estilos del Modal */
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

/* Animaciones */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
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

/* Responsive */
@media (max-width: 768px) {
  .hero-content {
    grid-template-columns: 1fr;
    text-align: center;
    width: 90%;
  }

  .showcase-content {
    grid-template-columns: 1fr;
    width: 90%;
  }

  .floating-cards {
    grid-template-columns: 1fr;
    transform: none;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

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

body {
  margin: 0;
  padding: 0;
  width: 100%;
  overflow-x: hidden;
}

* {
  box-sizing: border-box;
}
</style>
