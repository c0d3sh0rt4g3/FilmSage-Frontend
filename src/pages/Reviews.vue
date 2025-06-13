<template>
  <main class="reviews-page">
    <section class="reviews-hero">
      <div class="hero-content">
        <h1 class="hero-title">
          <span v-if="movieTitle">Reviews for</span>
          <span v-else-if="username">Reviews by </span>
          <span class="gradient-text">{{ movieTitle || username || 'All Reviews' }}</span>
        </h1>
        <p class="hero-subtitle" v-if="movieTitle">
          See what the community thinks about this movie
        </p>
        <p class="hero-subtitle" v-else-if="username">
          All reviews written by {{ username }}
        </p>
        <p class="hero-subtitle" v-else>
          Discover movie reviews from our community
        </p>
      </div>
    </section>

    <section class="reviews-content">
      <div class="container">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading reviews...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <h3>Oops! Something went wrong</h3>
          <p>{{ error }}</p>
          <button @click="loadReviews" class="btn-retry">Try again</button>
        </div>

        <!-- No Reviews -->
        <div v-else-if="!reviews.length && !loading" class="no-reviews">
          <h3>No reviews yet</h3>
          <p v-if="movieTitle">Be the first to write a review for this movie!</p>
          <p v-else>No reviews found in the system.</p>
          <router-link v-if="movieId" :to="`/review/create/${encodeMovieData()}`" class="btn-write-review">
            Write the First Review
          </router-link>
        </div>

        <!-- Reviews List -->
        <template v-else>
          <div class="reviews-header">
            <div class="reviews-count">
              <h2>{{ reviews.length }} Review{{ reviews.length !== 1 ? 's' : '' }}</h2>
            </div>
            <div class="sort-options">
              <select v-model="sortBy" @change="sortReviews">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
            </div>
          </div>

          <div class="reviews-list">
            <div 
              v-for="review in sortedReviews" 
              :key="review.id" 
              class="review-item"
            >
              <div class="review-header">
                <div class="user-info">
                  <img 
                    :src="review.user?.avatar || defaultAvatar" 
                    :alt="review.user?.username" 
                    @error="$event.target.src = defaultAvatar"
                    class="user-avatar"
                  />
                  <div class="user-details">
                    <h4 class="username">{{ review.user?.username || 'Anonymous User' }}</h4>
                    <span class="review-date">{{ formatDate(review.created_at) }}</span>
                  </div>
                </div>
                <div class="review-header-right">
                <div class="review-rating">
                  <span class="stars">{{ getStars(review.rating) }}</span>
                  <span class="rating-text">{{ review.rating }}/5</span>
                  </div>

                </div>
              </div>

              <div class="review-body">
                <div v-if="userId && review.movie_title" class="movie-info-header">
                  <h5 class="movie-title">
                    Review for: 
                    <span 
                      class="movie-title-link" 
                      @click="navigateToMovie(review.tmdb_id || review.movie_id)"
                    >
                      {{ review.movie_title }}
                    </span>
                  </h5>
                </div>
                <h5 v-if="review.title" class="review-title">{{ review.title }}</h5>
                <p class="review-content">{{ review.content }}</p>
              </div>
            </div>
          </div>

          <!-- Back Button -->
          <div v-if="movieId || userId" class="back-actions">
            <router-link v-if="movieId" :to="`/movie/${movieId}`" class="btn-back-movie">
              ← Back to Movie Details
            </router-link>
            <router-link v-if="userId" to="/profile" class="btn-back-movie">
              ← Back to Profile
            </router-link>
          </div>
        </template>
      </div>
    </section>
  </main>
</template>

<script>
import { reviewAPI } from '@/utils/api';
import { tmdbAPI } from '@/utils/tmdb';
import defaultAvatar from '@/assets/pfp.jpg';

export default {
  name: 'Reviews',
  data() {
    return {
      reviews: [],
      loading: true,
      error: null,
      sortBy: 'newest',
      defaultAvatar,
      movieTitle: null,
      movieId: null,
      userId: null,
      username: null
    }
  },
  computed: {
    sortedReviews() {
      const sorted = [...this.reviews];
      
      switch (this.sortBy) {
        case 'newest':
          return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        case 'oldest':
          return sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        case 'highest':
          return sorted.sort((a, b) => b.rating - a.rating);
        case 'lowest':
          return sorted.sort((a, b) => a.rating - b.rating);
        default:
          return sorted;
      }
    }
  },
  async created() {
    // Check if we have movie ID from route params
    if (this.$route.params.movieId) {
      this.movieId = this.$route.params.movieId;
    }
    
    // Check if we have user ID from route params
    if (this.$route.params.userId) {
      this.userId = this.$route.params.userId;
    }
    
    // Check if we have movie title from query params
    if (this.$route.query.title) {
      this.movieTitle = decodeURIComponent(this.$route.query.title);
    }
    
    // Check if we have username from query params
    if (this.$route.query.username) {
      this.username = decodeURIComponent(this.$route.query.username);
    }
    
    await this.loadReviews();
  },
  methods: {
    async loadReviews() {
      this.loading = true;
      this.error = null;
      
      try {
        let reviewsData;
        
        if (this.movieId) {
          // Load reviews for specific movie
          const [error, data] = await reviewAPI.getByContent(this.movieId, 'movie');
          if (error) {
            throw new Error(error.message || 'Failed to load reviews');
          }
          reviewsData = data;
        } else if (this.userId) {
          // Load reviews for specific user
          const [error, data] = await reviewAPI.getUserReviews(this.userId);
          if (error) {
            throw new Error(error.message || 'Failed to load user reviews');
          }
          reviewsData = data;
        } else {
          // Load all reviews (if we implement this endpoint)
          // For now, we'll show an empty state or redirect
          this.reviews = [];
          return;
        }
        
        // Transform reviews to include user information
        if (reviewsData?.reviews) {
          this.reviews = reviewsData.reviews.map(review => {
            let transformedReview = { ...review };
            
            // Preserve original user_id for permission checking
            if (review.user_id && typeof review.user_id === 'object') {
              // If user_id is an object (populated), extract the ID and keep it
              transformedReview.user_id = review.user_id._id || review.user_id.id;
              transformedReview.user = {
                username: review.user_id.username,
                avatar: review.user_id.avatar || this.defaultAvatar,
                id: review.user_id._id || review.user_id.id
              };
            } else if (review.user?.username) {
              // If user is separate object
              transformedReview.user = {
                username: review.user.username,
                avatar: review.user.avatar || this.defaultAvatar,
                id: review.user.id || review.user._id
              };
            } else {
              // For user reviews page, we know all reviews belong to the current user
              if (this.userId) {
                transformedReview.user_id = this.userId;
                transformedReview.user = {
                  username: this.username || 'You',
                  avatar: this.defaultAvatar,
                  id: this.userId
              };
            } else {
              transformedReview.user = {
                username: 'Anonymous User',
                avatar: this.defaultAvatar
              };
              }
            }
            
            // Ensure movie information is available for user reviews
            if (this.userId) {
              // Make sure we have movie ID for navigation
              transformedReview.tmdb_id = review.tmdb_id || review.movie_id;
              // We'll fetch the real movie title from TMDB API
              transformedReview.movie_title = 'Loading...'; // Placeholder
            }
            
            return transformedReview;
          });
          
          // Fetch real movie titles from TMDB for both user reviews and movie reviews
          if (this.reviews.length > 0) {
            if (this.userId) {
              // For user reviews, fetch titles for all movies
              await this.fetchMovieTitles();
            } else if (this.movieId) {
              // For movie reviews, fetch the title for this specific movie
              await this.fetchSingleMovieTitle();
            }
          }
        }
        
      } catch (error) {
        console.error('Error loading reviews:', error);
        this.error = error.message || 'Failed to load reviews';
      } finally {
        this.loading = false;
      }
    },
    
    async fetchMovieTitles() {
      // Get unique movie IDs that need titles
      const movieIds = [...new Set(
        this.reviews
          .filter(review => review.tmdb_id && review.movie_title === 'Loading...')
          .map(review => review.tmdb_id)
      )];
      
      // Fetch movie details in parallel
      const moviePromises = movieIds.map(async (movieId) => {
        try {
          const movieData = await tmdbAPI.getMovieDetails(movieId);
          return { id: movieId, title: movieData.title };
        } catch (error) {
          console.error(`Error fetching movie ${movieId}:`, error);
          return { id: movieId, title: 'Unknown Movie' };
        }
      });
      
      try {
        const movieDetails = await Promise.all(moviePromises);
        
        // Create a map of movie ID to title
        const movieTitles = {};
        movieDetails.forEach(movie => {
          movieTitles[movie.id] = movie.title;
        });
        
        // Update reviews with real movie titles
        this.reviews = this.reviews.map(review => {
          if (review.tmdb_id && movieTitles[review.tmdb_id]) {
            return {
              ...review,
              movie_title: movieTitles[review.tmdb_id]
            };
          }
          return review;
        });
      } catch (error) {
        console.error('Error fetching movie titles:', error);
        // Update any remaining "Loading..." to "Unknown Movie"
        this.reviews = this.reviews.map(review => {
          if (review.movie_title === 'Loading...') {
            return {
              ...review,
              movie_title: 'Unknown Movie'
            };
          }
          return review;
        });
             }
     },
     
     async fetchSingleMovieTitle() {
       // Fetch movie title for this specific movie
       try {
         const movieData = await tmdbAPI.getMovieDetails(this.movieId);
         this.movieTitle = movieData.title;
       } catch (error) {
         console.error(`Error fetching movie ${this.movieId}:`, error);
         this.movieTitle = 'Unknown Movie';
       }
     },
     
     sortReviews() {
      // Sorting is handled by computed property
    },
    
    async toggleLike(review) {
      try {
        if (review.user_liked) {
          const [error] = await reviewAPI.unlike(review.id);
          if (!error) {
            review.likes_count = (review.likes_count || 1) - 1;
            review.user_liked = false;
          }
        } else {
          const [error] = await reviewAPI.like(review.id);
          if (!error) {
            review.likes_count = (review.likes_count || 0) + 1;
            review.user_liked = true;
          }
        }
      } catch (error) {
        console.error('Error toggling like:', error);
      }
    },
    
    getStars(rating) {
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 !== 0;
      let stars = '⭐'.repeat(fullStars);
      if (hasHalfStar) {
        stars += '⭐';
      }
      return stars || '☆';
    },
    
    formatDate(date) {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    encodeMovieData() {
      if (!this.movieId) return '';
      
      const movieData = {
        id: this.movieId,
        title: this.movieTitle || 'Unknown Movie'
      };
      
      return encodeURIComponent(JSON.stringify(movieData));
    },
    
    navigateToMovie(movieId) {
      if (movieId) {
        this.$router.push(`/movie/${movieId}`);
      } else {
        console.error('Movie ID not available for navigation');
      }
    },


  }
}
</script>

<style src="@/styles/reviews.scss" lang="scss" scoped></style> 