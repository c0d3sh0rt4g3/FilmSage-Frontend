<template>
  <main class="movies-page">
    <!-- Search Section -->
    <section class="search-hero">
      <div class="search-content">
        <h1 class="search-title">
          Descubre <span class="gradient-text">películas increíbles</span>
        </h1>
        <p class="search-subtitle">
          Explora miles de películas y encuentra tu próxima obsesión cinematográfica
        </p>

        <div class="search-bar">
          <input
            type="text"
            v-model="searchQuery"
            @keyup.enter="searchMovies"
            placeholder="Buscar películas..."
            class="search-input"
          />
          <button
            @click="searchMovies"
            class="btn-search"
            :disabled="loading"
          >
            {{ loading ? 'Buscando...' : 'Buscar' }}
          </button>
        </div>
      </div>
    </section>

    <!-- Results Section -->
    <section class="results-section">
      <div class="container">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Buscando películas...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <h3>Oops! Algo salió mal</h3>
          <p>{{ error }}</p>
          <button @click="retrySearch" class="btn-retry">Intentar de nuevo</button>
        </div>

        <!-- No Results -->
        <div v-else-if="movies.length === 0 && hasSearched" class="no-results">
          <h3>No se encontraron resultados</h3>
          <p>Intenta con otro término de búsqueda</p>
        </div>

        <!-- Movies Grid -->
        <div v-else-if="movies.length > 0" class="movies-container">
          <h2 class="results-title">
            Resultados para "<span class="gradient-text">{{ lastSearchQuery }}</span>"
          </h2>

          <div class="movies-grid">
            <div
              v-for="movie in movies"
              :key="movie.id"
              class="movie-card"
              @click="selectMovie(movie)"
            >
              <div class="movie-poster">
                <img
                  :src="getMoviePoster(movie)"
                  :alt="movie.title"
                  @error="handleImageError"
                />
                <div class="card-overlay">
                  <span class="rating">{{ formatRating(movie.vote_average) }}</span>
                </div>
              </div>

              <div class="movie-info">
                <h4>{{ movie.title }}</h4>
                <p>{{ formatYear(movie.release_date) }}</p>
              </div>
            </div>
          </div>

          <!-- Load More Button -->
          <div v-if="canLoadMore" class="load-more-container">
            <button
              @click="loadMoreMovies"
              class="btn-load-more"
              :disabled="loadingMore"
            >
              {{ loadingMore ? 'Cargando...' : 'Cargar más películas' }}
            </button>
          </div>
        </div>

        <!-- Welcome State -->
        <div v-else class="welcome-state">
          <h2>¡Comienza tu búsqueda!</h2>
          <p>Usa el buscador para encontrar tus películas favoritas</p>
        </div>
      </div>
    </section>

    <!-- Movie Detail Modal -->
    <div v-if="selectedMovie" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeModal">&times;</button>

        <div class="modal-body">
          <div class="modal-poster">
            <img
              :src="getMoviePoster(selectedMovie)"
              :alt="selectedMovie.title"
            />
          </div>

          <div class="modal-details">
            <h2>{{ selectedMovie.title }}</h2>
            <div class="movie-meta">
              <span class="year">{{ formatYear(selectedMovie.release_date) }}</span>
              <span class="rating">⭐ {{ formatRating(selectedMovie.vote_average) }}</span>
            </div>

            <p class="overview">{{ selectedMovie.overview || 'Sin descripción disponible' }}</p>

            <div class="genres" v-if="selectedMovie.genre_ids">
              <span
                v-for="genreId in selectedMovie.genre_ids.slice(0, 3)"
                :key="genreId"
                class="genre-tag"
              >
                {{ getGenreName(genreId) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
export default {
  name: 'MoviesPage',
  data() {
    return {
      searchQuery: '',
      lastSearchQuery: '',
      movies: [],
      selectedMovie: null,
      loading: false,
      loadingMore: false,
      error: null,
      hasSearched: false,
      currentPage: 1,
      totalPages: 1,
      genres: {
        28: 'Acción',
        12: 'Aventura',
        16: 'Animación',
        35: 'Comedia',
        80: 'Crimen',
        99: 'Documental',
        18: 'Drama',
        10751: 'Familia',
        14: 'Fantasía',
        36: 'Historia',
        27: 'Terror',
        10402: 'Música',
        9648: 'Misterio',
        10749: 'Romance',
        878: 'Ciencia ficción',
        10770: 'Película de TV',
        53: 'Thriller',
        10752: 'Guerra',
        37: 'Western'
      }
    }
  },
  computed: {
    canLoadMore() {
      return this.currentPage < this.totalPages && this.movies.length > 0;
    }
  },
  methods: {
    async searchMovies() {
      if (!this.searchQuery.trim()) return;

      this.loading = true;
      this.error = null;
      this.hasSearched = true;
      this.currentPage = 1;
      this.lastSearchQuery = this.searchQuery;

      try {
        const response = await this.fetchMovies(this.searchQuery, 1);
        this.movies = response.results || [];
        this.totalPages = response.total_pages || 1;
      } catch (error) {
        this.error = 'Error al buscar películas. Por favor, inténtalo de nuevo.';
        console.error('Error searching movies:', error);
      } finally {
        this.loading = false;
      }
    },

    async loadMoreMovies() {
      if (!this.canLoadMore || this.loadingMore) return;

      this.loadingMore = true;

      try {
        const response = await this.fetchMovies(this.lastSearchQuery, this.currentPage + 1);
        this.movies.push(...(response.results || []));
        this.currentPage++;
      } catch (error) {
        this.error = 'Error al cargar más películas.';
        console.error('Error loading more movies:', error);
      } finally {
        this.loadingMore = false;
      }
    },

    async fetchMovies(query, page = 1) {
      const apiKey = '01eab7cf7274849e56bf6b0969c6627d'; // Replace with your API key
      const baseUrl = 'https://api.themoviedb.org/3';

      const url = `${baseUrl}/search/movie?api_key=${apiKey}&language=es-ES&query=${encodeURIComponent(query)}&page=${page}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    },

    selectMovie(movie) {
      this.selectedMovie = movie;
      document.body.style.overflow = 'hidden';
    },

    closeModal() {
      this.selectedMovie = null;
      document.body.style.overflow = '';
    },

    retrySearch() {
      if (this.lastSearchQuery) {
        this.searchQuery = this.lastSearchQuery;
        this.searchMovies();
      }
    },

    getMoviePoster(movie) {
      const baseUrl = 'https://image.tmdb.org/t/p/w500';
      return movie.poster_path
        ? `${baseUrl}${movie.poster_path}`
        : '/images/placeholder-movie.jpg';
    },

    handleImageError(event) {
      event.target.src = '/images/placeholder-movie.jpg';
    },

    formatRating(rating) {
      return rating ? rating.toFixed(1) : 'N/A';
    },

    formatYear(date) {
      return date ? date.split('-')[0] : 'N/A';
    },

    getGenreName(genreId) {
      return this.genres[genreId] || 'Desconocido';
    }
  },

  beforeUnmount() {
    document.body.style.overflow = '';
  }
}
</script>

<style src="@/styles/search.scss" scoped></style>
