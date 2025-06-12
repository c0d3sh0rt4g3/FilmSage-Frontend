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
      loading: false,
      loadingMore: false,
      error: null,
      hasSearched: false,
      currentPage: 1,
      totalPages: 1
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
      // Navigate directly to movie details page
      this.$router.push({
        name: 'movie-detail',
        params: { id: movie.id }
      });
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




  }
}
</script>

<style src="@/styles/search.scss" lang="scss"></style>
