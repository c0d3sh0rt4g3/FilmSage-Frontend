<template>
  <main class="recommendations-page">
    <section class="recommendations-hero">
      <div class="hero-content">
        <h1 class="hero-title">
          Your <span class="gradient-text">Recommendations</span>
        </h1>
        <p class="hero-subtitle">
          Personalized movie suggestions based on your preferences and ratings
        </p>
      </div>
    </section>

    <section class="recommendations-content">
      <div class="container">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Finding the perfect movies for you...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <h3>Oops! Something went wrong</h3>
          <p>{{ error }}</p>
          <button @click="loadRecommendations" class="btn-retry">Try again</button>
        </div>

        <!-- No Recommendations -->
        <div v-else-if="!hasRecommendations" class="no-recommendations">
          <h3>Let's Get Started!</h3>
          <p>Rate some movies or select your favorite genres to get personalized recommendations.</p>
          <div class="action-buttons">
            <router-link to="/search" class="btn-action">
              Find Movies to Rate
            </router-link>
            <router-link to="/profile" class="btn-action secondary">
              Update Preferences
            </router-link>
          </div>
        </div>

        <!-- Recommendations Grid -->
        <template v-else>
          <!-- For You Section -->
          <div class="recommendations-section">
            <h2>Recommended for You</h2>
            <p class="section-description">Based on your ratings and preferences</p>
            <div class="movies-grid">
              <div 
                v-for="movie in personalizedRecommendations" 
                :key="movie.id"
                class="movie-card"
                @click="navigateToMovie(movie.id)"
              >
                <div class="movie-poster">
                  <img 
                    :src="getMoviePoster(movie)" 
                    :alt="movie.title"
                    @error="handleImageError"
                  />
                  <div class="card-overlay">
                    <span class="match-score">{{ formatMatchScore(movie.score) }}% Match</span>
                  </div>
                </div>
                <div class="movie-info">
                  <h3>{{ movie.title }}</h3>
                  <div class="meta-info">
                    <span class="year">{{ formatYear(movie.release_date) }}</span>
                    <span class="rating">⭐ {{ formatRating(movie.vote_average) }}</span>
                  </div>
                  <div class="genres">
                    <span 
                      v-for="genreId in movie.genre_ids.slice(0, 2)" 
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

          <!-- Trending Section -->
          <div class="recommendations-section">
            <h2>Trending Now</h2>
            <p class="section-description">Popular movies you might enjoy</p>
            <div class="movies-grid">
              <div 
                v-for="movie in trendingMovies" 
                :key="movie.id"
                class="movie-card"
                @click="navigateToMovie(movie.id)"
              >
                <div class="movie-poster">
                  <img 
                    :src="getMoviePoster(movie)" 
                    :alt="movie.title"
                    @error="handleImageError"
                  />
                  <div class="card-overlay">
                    <span class="trending-score">🔥 Trending</span>
                  </div>
                </div>
                <div class="movie-info">
                  <h3>{{ movie.title }}</h3>
                  <div class="meta-info">
                    <span class="year">{{ formatYear(movie.release_date) }}</span>
                    <span class="rating">⭐ {{ formatRating(movie.vote_average) }}</span>
                  </div>
                  <div class="genres">
                    <span 
                      v-for="genreId in movie.genre_ids.slice(0, 2)" 
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
        </template>
      </div>
    </section>
  </main>
</template>

<script>
import { useAuthStore } from '@/stores/authStore';
import { apiRequest } from '@/utils/api';

export default {
  name: 'RecommendationsPage',
  data() {
    return {
      personalizedRecommendations: [],
      trendingMovies: [],
      loading: true,
      error: null,
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
        53: 'Thriller',
        10752: 'War',
        37: 'Western'
      }
    }
  },
  computed: {
    hasRecommendations() {
      return this.personalizedRecommendations.length > 0 || this.trendingMovies.length > 0;
    }
  },
  async created() {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated) {
      this.$router.push('/login');
      return;
    }
    await this.loadRecommendations();
  },
  methods: {
    async loadRecommendations() {
      this.loading = true;
      this.error = null;

      try {
        // Load personalized recommendations
        const [recError, recData] = await apiRequest('/recommendations/personalized');
        if (!recError && recData?.recommendations) {
          // Transform the recommendations data to match the expected format
          this.personalizedRecommendations = recData.recommendations.map(rec => ({
            ...rec,
            poster_path: rec.poster_path || rec.poster,
            title: rec.title || rec.name,
            vote_average: rec.vote_average || rec.rating,
            release_date: rec.release_date || rec.year,
            genre_ids: rec.genre_ids || []
          }));
        }

        // Load trending movies from TMDB
        const { tmdbAPI } = await import('@/utils/tmdb');
        const trendingData = await tmdbAPI.getTrendingMovies();
        if (trendingData?.results) {
          this.trendingMovies = trendingData.results;
        }

      } catch (error) {
        console.error('Error loading recommendations:', error);
        this.error = 'Error loading recommendations. Please try again.';
      } finally {
        this.loading = false;
      }
    },
    getMoviePoster(movie) {
      return movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : '/images/placeholder-movie.jpg';
    },
    formatMatchScore(score) {
      return Math.round(score * 100);
    },
    formatYear(date) {
      return date ? date.split('-')[0] : 'N/A';
    },
    formatRating(rating) {
      return rating ? rating.toFixed(1) : 'N/A';
    },
    getGenreName(genreId) {
      return this.genres[genreId] || 'Unknown';
    },
    handleImageError(event) {
      event.target.src = '/images/placeholder-movie.jpg';
    },
    navigateToMovie(id) {
      this.$router.push(`/movie/${id}`);
    }
  }
}
</script>

<style src="@/styles/recommendations.scss" lang="scss"></style> 