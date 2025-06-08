<template>
  <main class="movies-page">
    <!-- Search Section -->
    <section class="search-hero">
      <div class="search-content">
        <h1 class="search-title">
          Discover <span class="gradient-text">amazing movies</span>
        </h1>
        <p class="search-subtitle">
          Explore thousands of movies and find your next cinematic obsession
        </p>

        <div class="search-bar">
          <input
            type="text"
            v-model="searchQuery"
            @keyup.enter="searchMovies"
            placeholder="Search movies..."
            class="search-input"
          />
          <button
            @click="searchMovies"
            class="btn-search"
            :disabled="loading"
          >
            {{ loading ? 'Searching...' : 'Search' }}
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
          <p>Searching movies...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <h3>Oops! Something went wrong</h3>
          <p>{{ error }}</p>
          <button @click="retrySearch" class="btn-retry">Try again</button>
        </div>

        <!-- No Results -->
        <div v-else-if="movies.length === 0 && hasSearched" class="no-results">
          <h3>No results found</h3>
          <p>Try another search term</p>
        </div>

        <!-- Movies Grid -->
        <div v-else-if="movies.length > 0" class="movies-container">
          <h2 class="results-title">
            Results for "<span class="gradient-text">{{ lastSearchQuery }}</span>"
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
              {{ loadingMore ? 'Loading...' : 'Load more movies' }}
            </button>
          </div>
        </div>

        <!-- Welcome State -->
        <div v-else class="welcome-state">
          <h2>Start your search!</h2>
          <p>Use the search bar to find your favorite movies</p>
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

            <p class="overview">{{ selectedMovie.overview || 'No description available' }}</p>

            <div class="genres" v-if="selectedMovie.genre_ids">
              <span
                v-for="genreId in selectedMovie.genre_ids.slice(0, 3)"
                :key="genreId"
                class="genre-tag"
              >
                {{ getGenreName(genreId) }}
              </span>
            </div>

            <button v-if="selectedMovie" @click="createReview" class="btn-review">
              Write Review
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { useAuthStore } from '@/stores/authStore';
import { apiRequest } from '@/utils/api';

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
        28: 'Action',
        12: 'Adventure',
        16: 'Animation',
        35: 'Comedy',
        80: 'Crime',
        99: 'Documentary',
        18: 'Drama',
        10751: 'Family',
        14: 'Fantasy',
        36: 'History',
        27: 'Horror',
        10402: 'Music',
        9648: 'Mystery',
        10749: 'Romance',
        878: 'Science Fiction',
        10770: 'TV Movie',
        53: 'Thriller',
        10752: 'War',
        37: 'Western'
      }
    }
  },
  computed: {
    canLoadMore() {
      return this.currentPage < this.totalPages && this.movies.length > 0;
    },
    isAuthenticated() {
      const authStore = useAuthStore();
      return authStore.isAuthenticated;
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
        this.error = 'Error searching movies. Please try again.';
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
        this.error = 'Error loading more movies.';
        console.error('Error loading more movies:', error);
      } finally {
        this.loadingMore = false;
      }
    },

    async fetchMovies(query, page = 1) {
      const apiKey = import.meta.env.VITE_MOVIEDB_API_KEY;
      const baseUrl = 'https://api.themoviedb.org/3';
      const url = `${baseUrl}/search/movie?api_key=${apiKey}&language=en-US&query=${encodeURIComponent(query)}&page=${page}`;
      
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
      return this.genres[genreId] || 'Unknown';
    },

    async createReview() {
      if (!this.selectedMovie) {
        console.warn('No movie selected for review');
        return;
      }

      // Store movie data before closing the modal
      const movieData = {
        id: this.selectedMovie.id,
        title: this.selectedMovie.title,
        poster_path: this.selectedMovie.poster_path,
        release_date: this.selectedMovie.release_date,
        vote_average: this.selectedMovie.vote_average
      };

      // Check authentication before proceeding
      if (!this.isAuthenticated) {
        this.$router.push('/login');
        return;
      }

      // Close the modal
      this.closeModal();

      // Navigate to review page with movie data
      this.$router.push({
        name: 'create-review',
        params: {
          movieData: btoa(JSON.stringify(movieData))
        }
      });
    }
  },

  beforeUnmount() {
    document.body.style.overflow = '';
  }
}
</script>

<style src="@/styles/search.scss" scoped></style>

<style lang="scss" scoped>
.btn-review {
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #ff6b6b, #feca57);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
  }
}
</style>
