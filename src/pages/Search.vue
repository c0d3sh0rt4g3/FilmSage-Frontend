<template>
  <div class="search-page">
    <div class="search-container">
      <div class="search-box">
        <input
          v-model="searchQuery"
          @keyup.enter="searchMovies"
          type="text"
          placeholder="Search for movies..."
          :disabled="loading"
        />
        <button @click="searchMovies" :disabled="loading">
          <span v-if="!loading">Search</span>
          <span v-else>Searching...</span>
        </button>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
        <button @click="retrySearch" class="retry-button">Retry</button>
      </div>

      <div v-if="hasSearched && !loading && movies.length === 0" class="no-results">
        No movies found for "{{ lastSearchQuery }}"
      </div>

      <div v-if="loading" class="loading">
        Loading...
      </div>

      <div v-else class="movies-grid">
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
          </div>
          <div class="movie-info">
            <h3>{{ movie.title }}</h3>
            <p>{{ movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A' }}</p>
            <div class="movie-rating" v-if="movie.vote_average">
              ⭐ {{ movie.vote_average.toFixed(1) }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="canLoadMore && !loading" class="load-more">
        <button @click="loadMoreMovies" :disabled="loadingMore">
          {{ loadingMore ? 'Loading more...' : 'Load more' }}
        </button>
      </div>
    </div>

    <!-- Movie Details Modal -->
    <div v-if="selectedMovie" class="modal" @click.self="closeModal">
      <div class="modal-content">
        <button class="close-button" @click="closeModal">&times;</button>
        <div class="modal-grid">
          <div class="modal-poster">
            <img
              :src="getMoviePoster(selectedMovie.poster_path)"
              :alt="selectedMovie.title"
              @error="$event.target.src = '/images/placeholder-movie.jpg'"
            />
          </div>
          <div class="modal-details">
            <h2>{{ selectedMovie.title }}</h2>
            <p class="release-date">
              {{ selectedMovie.release_date ? new Date(selectedMovie.release_date).getFullYear() : 'N/A' }}
            </p>
            <div class="rating" v-if="selectedMovie.vote_average">
              ⭐ {{ selectedMovie.vote_average.toFixed(1) }}
            </div>
            <p class="overview">{{ selectedMovie.overview || 'No overview available.' }}</p>
            <div class="genres" v-if="selectedMovie.genre_ids">
              <span v-for="genreId in selectedMovie.genre_ids" :key="genreId" class="genre-tag">
                {{ genres[genreId] || 'Unknown' }}
              </span>
            </div>
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

<style scoped>
.search-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.search-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.search-box {
  display: flex;
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.search-box input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.search-box button {
  padding: 0.75rem 1.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.search-box button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
}

.movie-card {
  cursor: pointer;
  transition: transform 0.2s;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.movie-card:hover {
  transform: translateY(-5px);
}

.movie-poster {
  position: relative;
  padding-top: 150%;
}

.movie-poster img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.movie-info {
  padding: 1rem;
}

.movie-info h3 {
  margin: 0;
  font-size: 1rem;
  line-height: 1.4;
  margin-bottom: 0.5rem;
}

.movie-info p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.movie-rating {
  margin-top: 0.5rem;
  color: #f5c518;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
}

.modal-poster {
  position: relative;
  padding-top: 150%;
}

.modal-poster img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.modal-details h2 {
  margin: 0;
  margin-bottom: 0.5rem;
}

.release-date {
  color: #666;
  margin-bottom: 1rem;
}

.rating {
  color: #f5c518;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.overview {
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.genres {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.genre-tag {
  background: #f0f0f0;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.9rem;
}

.error-message {
  text-align: center;
  color: #dc3545;
  padding: 1rem;
  background: #f8d7da;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.retry-button {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.no-results {
  text-align: center;
  color: #666;
  font-style: italic;
}

.loading {
  text-align: center;
  color: #666;
}

.load-more {
  text-align: center;
  margin-top: 2rem;
}

.load-more button {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.load-more button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .modal-grid {
    grid-template-columns: 1fr;
  }

  .modal-poster {
    padding-top: 0;
    height: 300px;
  }
}
</style>
