<template>
  <div class="movies-page">
    <section class="search-hero">
      <div class="search-content">
        <h1 class="search-title">
          Find your next <span class="gradient-text">favorite movie</span>
        </h1>
        <p class="search-subtitle">
          Search through thousands of movies and discover something new
        </p>
        <div class="search-bar">
          <input
            class="search-input"
            v-model="searchQuery"
            @keyup.enter="searchMovies"
            type="text"
            placeholder="Search for movies..."
            :disabled="loading"
          />
          <button class="btn-search" @click="searchMovies" :disabled="loading">
            <span v-if="!loading">Search</span>
            <span v-else>Searching...</span>
          </button>
        </div>
      </div>
    </section>

    <section class="results-section">
      <div class="container">
        <div v-if="error" class="error-state">
          <h3>Oops! Something went wrong</h3>
          <p>{{ error }}</p>
          <button @click="retrySearch" class="btn-retry">Try again</button>
        </div>

        <div v-if="hasSearched && !loading && movies.length === 0" class="no-results">
          <h3>No results found</h3>
          <p>No movies found for "{{ lastSearchQuery }}"</p>
        </div>

        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <h3>Searching movies...</h3>
        </div>

        <template v-if="!loading && movies.length > 0">
          <h2 class="results-title">Search Results</h2>
          <div class="movies-grid">
            <div
              v-for="movie in movies"
              :key="movie.id"
              class="movie-card"
              @click="selectMovie(movie)"
            >
              <div class="movie-poster">
                <img
                  :src="getMoviePoster(movie.poster_path)"
                  :alt="movie.title"
                  @error="$event.target.src = '/images/placeholder-movie.jpg'"
                />
                <div class="card-overlay">
                  <span class="rating" v-if="movie.vote_average">⭐ {{ movie.vote_average.toFixed(1) }}</span>
                </div>
              </div>
              <div class="movie-info">
                <h4>{{ movie.title }}</h4>
                <p>{{ movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A' }}</p>
              </div>
            </div>
          </div>

          <div v-if="canLoadMore" class="load-more-container">
            <button class="btn-load-more" @click="loadMoreMovies" :disabled="loadingMore">
              {{ loadingMore ? 'Loading more...' : 'Load more' }}
            </button>
          </div>
        </template>
      </div>
    </section>

    <!-- Movie Details Modal -->
    <div v-if="selectedMovie" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <button class="modal-close" @click="closeModal">&times;</button>
        <div class="modal-body">
          <div class="modal-poster">
            <img
              :src="getMoviePoster(selectedMovie.poster_path)"
              :alt="selectedMovie.title"
              @error="$event.target.src = '/images/placeholder-movie.jpg'"
            />
          </div>
          <div class="modal-details">
            <h2>{{ selectedMovie.title }}</h2>
            <div class="movie-meta">
              <span class="year">
                {{ selectedMovie.release_date ? new Date(selectedMovie.release_date).getFullYear() : 'N/A' }}
              </span>
              <span class="rating" v-if="selectedMovie.vote_average">
                ⭐ {{ selectedMovie.vote_average.toFixed(1) }}
              </span>
            </div>
            <p class="overview">{{ selectedMovie.overview || 'No overview available.' }}</p>
            <div class="genres" v-if="selectedMovie.genre_ids">
              <span v-for="genreId in selectedMovie.genre_ids" :key="genreId" class="genre-tag">
                {{ genres[genreId] || 'Unknown' }}
              </span>
            </div>
            <button v-if="isAuthenticated" class="btn-review" @click="createReview">
              Write a Review
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/authStore';
import { tmdbAPI } from '@/utils/tmdb';

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
        const data = await tmdbAPI.searchMovies(this.searchQuery, 1);
        this.movies = data.results || [];
        this.totalPages = data.total_pages || 1;
      } catch (error) {
        console.error('Error searching movies:', error);
        this.error = error.message || 'Error searching movies. Please try again.';
      } finally {
        this.loading = false;
      }
    },

    async loadMoreMovies() {
      if (!this.canLoadMore || this.loadingMore) return;

      this.loadingMore = true;

      try {
        const data = await tmdbAPI.searchMovies(this.lastSearchQuery, this.currentPage + 1);
        this.movies.push(...(data.results || []));
        this.currentPage++;
      } catch (error) {
        console.error('Error loading more movies:', error);
        this.error = 'Error loading more movies.';
      } finally {
        this.loadingMore = false;
      }
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

    getMoviePoster(path) {
      return tmdbAPI.getImageUrl(path);
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

<style src="@/styles/search.scss" lang="scss"></style>
