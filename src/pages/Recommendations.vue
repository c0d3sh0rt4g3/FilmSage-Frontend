<template>
  <main class="recommendations-page">
    <section class="recommendations-hero">
      <div class="hero-content">
        <h1 class="hero-title">
          AI <span class="gradient-text">Recommendations</span>
        </h1>
        <p class="hero-subtitle">
          Personalized movie suggestions powered by artificial intelligence, based on your reviews
        </p>
      </div>
    </section>

    <section class="recommendations-content">
      <div class="container">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p v-if="loadingStep === 'reviews'">Analyzing your reviews...</p>
          <p v-else-if="loadingStep === 'ai'">AI is generating your perfect recommendations...</p>
          <p v-else>Finding the perfect movies for you...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <h3>Oops! Something went wrong</h3>
          <p>{{ error }}</p>
          <button @click="generateRecommendations" class="btn-retry">Try again</button>
        </div>

        <!-- No Reviews -->
        <div v-else-if="!hasReviews && !loading" class="no-reviews">
          <h3>We need your reviews first!</h3>
          <p>To generate personalized AI recommendations, we need to analyze your movie reviews. Write some reviews to get started!</p>
          <div class="action-buttons">
            <router-link to="/search" class="btn-action">
              Find Movies to Review
            </router-link>
            <router-link to="/profile" class="btn-action secondary">
              View Your Profile
            </router-link>
          </div>
        </div>

        <!-- AI Recommendations -->
        <template v-else-if="aiRecommendations.length > 0">
          <div class="recommendations-section">
            <div class="section-header">
              <h2>AI Recommendations</h2>
              <p class="section-description">
                Based on analysis of {{ analyzedReviewsCount }} of your reviews
              </p>
              <button @click="generateRecommendations" class="btn-refresh" :disabled="loading">
                Generate New Recommendations
              </button>
            </div>
            
            <div class="ai-recommendations-grid">
              <div 
                v-for="(recommendation, index) in aiRecommendations" 
                :key="index"
                class="ai-recommendation-card"
              >
                <div class="recommendation-header">
                  <h3 class="movie-title">{{ recommendation.title }}</h3>
                  <span class="movie-year">({{ recommendation.year }})</span>
                </div>
                
                <div class="justification">
                  <h4>Why we recommend this:</h4>
                  <p>{{ recommendation.justification }}</p>
                </div>
                
                <div class="card-actions">
                  <button 
                    @click="viewMovieDetails(recommendation.tmdb_id)"
                    class="btn-view-details"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Show some trending movies too -->
          <div v-if="trendingMovies.length > 0" class="recommendations-section">
            <h2>🔥 Also Trending</h2>
            <p class="section-description">Popular movies you might also enjoy</p>
            <div class="movies-grid">
              <div 
                v-for="movie in trendingMovies.slice(0,6)" 
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
import { reviewAPI, recommendationAPI } from '@/utils/api';

export default {
  name: 'RecommendationsPage',
  data() {
    return {
      aiRecommendations: [],
      trendingMovies: [],
      userReviews: [],
      loading: true,
      loadingStep: 'reviews', // 'reviews', 'ai', 'trending'
      error: null,
      analyzedReviewsCount: 0
    }
  },
  computed: {
    hasReviews() {
      return this.userReviews.length > 0;
    }
  },
  async created() {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated) {
      this.$router.push('/login');
      return;
    }
    await this.loadUserData();
  },
  methods: {
    async loadUserData() {
      this.loading = true;
      this.loadingStep = 'reviews';
      this.error = null;

      try {
        // First, load user reviews
        const authStore = useAuthStore();
        const userId = authStore.userData?.id;
        
        if (userId) {
          const [reviewError, reviewData] = await reviewAPI.getUserReviews(userId);
          if (!reviewError && reviewData?.reviews) {
            this.userReviews = reviewData.reviews;
            
            // If we have reviews, generate AI recommendations
            if (this.userReviews.length > 0) {
              await this.generateRecommendations();
            }
          }
        }

        // Always load trending movies in the background
        this.loadingStep = 'trending';
        await this.loadTrendingMovies();

      } catch (error) {
        console.error('Error loading user data:', error);
        this.error = 'Error loading your data. Please try again.';
      } finally {
        this.loading = false;
      }
    },

    async generateRecommendations() {
      if (!this.hasReviews) {
        this.error = 'No reviews found. Please write some reviews first!';
        return;
      }

      this.loading = true;
      this.loadingStep = 'ai';
      this.error = null;

      try {
        const authStore = useAuthStore();
        const userId = authStore.userData?.id;

        // Transform reviews to the format expected by the AI endpoint
        const formattedReviews = this.userReviews.map(review => ({
          title: review.title,
          content: review.content,
          rating: review.rating,
          contentType: review.contentType || 'movie'
        }));

        this.analyzedReviewsCount = formattedReviews.length;

        // Log the request data being sent to the API
        console.log('Sending to AI API:', {
          reviewsCount: formattedReviews.length,
          userId: userId,
          reviews: formattedReviews
        });

        const [error, data] = await recommendationAPI.getAIRecommendations(formattedReviews, userId);

        // Log the API response for debugging
        console.log('AI Recommendations API Response:', data);
        console.log('API Error (if any):', error);

        if (error) {
          console.error('Error details:', error);
          this.error = error.message || 'Error generating AI recommendations. Please try again.';
          return;
        }

        if (data?.recommendations) {
          console.log('Successfully received recommendations:', data.recommendations.length);
          console.log('Recommendations data:', data.recommendations);
          this.aiRecommendations = data.recommendations;
        } else {
          console.warn('No recommendations in response data:', data);
          this.error = 'No recommendations were generated. Please try again.';
        }

      } catch (error) {
        console.error('Error generating AI recommendations:', error);
        this.error = 'Error generating recommendations. Please try again.';
      } finally {
        this.loading = false;
      }
    },

    async loadTrendingMovies() {
      try {
        const { tmdbAPI } = await import('@/utils/tmdb');
        const trendingData = await tmdbAPI.getTrendingMovies();
        if (trendingData?.results) {
          this.trendingMovies = trendingData.results;
        }
      } catch (error) {
        console.error('Error loading trending movies:', error);
        // Don't show error for trending movies, it's not critical
      }
    },

    viewMovieDetails(tmdbId) {
      // Navigate directly to movie details page using tmdb_id
      if (tmdbId) {
        console.log('Navigating to movie details for TMDB ID:', tmdbId);
        this.navigateToMovie(tmdbId);
      } else {
        console.error('No TMDB ID provided for movie details navigation');
        this.error = 'Unable to view movie details. TMDB ID missing.';
      }
    },

    getMoviePoster(movie) {
      return movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : '/images/placeholder-movie.jpg';
    },

    formatYear(date) {
      return date ? date.split('-')[0] : 'N/A';
    },

    formatRating(rating) {
      return rating ? rating.toFixed(1) : 'N/A';
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