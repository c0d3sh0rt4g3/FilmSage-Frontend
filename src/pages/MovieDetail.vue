<template>
  <main class="movie-detail-page">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading movie details...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <h3>Oops! Something went wrong</h3>
      <p>{{ error }}</p>
      <button @click="loadMovieData" class="btn-retry">Try again</button>
    </div>

    <template v-else>
      <!-- Movie Hero Section -->
      <section class="movie-hero" :style="backdropStyle">
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <div class="movie-poster">
            <img :src="posterUrl" :alt="movie.title" @error="handleImageError" />
          </div>
          <div class="movie-info">
            <h1>{{ movie.title }}</h1>
            <div class="meta-info">
              <span class="year">{{ formatYear(movie.release_date) }}</span>
              <span class="rating">⭐ {{ formatRating(movie.vote_average) }}</span>
              <span class="runtime" v-if="movie.runtime">
                {{ formatRuntime(movie.runtime) }}
              </span>
            </div>
            <div class="genres">
              <span v-for="genre in movie.genres" :key="genre.id" class="genre-tag">
                {{ genre.name }}
              </span>
            </div>
            <p class="overview">{{ movie.overview }}</p>
            <div class="actions">
              <button @click="toggleFavorite" class="btn-favorite" :class="{ 'is-favorite': isInFavorites }" :title="isInFavorites ? 'Remove from Favorites' : 'Add to Favorites'" :disabled="isToggling">
                {{ isInFavorites ? 'Remove from Favorites' : 'Add to Favorites' }}
              </button>
              <button @click="openReviewModal" class="btn-review">
                Write a Review
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Details Section -->
      <section class="movie-details">
        <div class="container">
          <!-- Cast -->
          <div class="detail-card">
            <h2>Cast</h2>
            <div class="cast-grid">
              <div v-for="actor in movie.credits?.cast?.slice(0, 6)" :key="actor.id" class="cast-card">
                <img 
                  :src="getActorImage(actor.profile_path)" 
                  :alt="actor.name"
                  @error="$event.target.src = defaultAvatar"
                />
                <div class="cast-info">
                  <h4>{{ actor.name }}</h4>
                  <p>{{ actor.character }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Reviews -->
          <div class="detail-card">
            <h2>Reviews</h2>
            <div class="reviews-section">
              <div v-if="!reviews.length" class="no-reviews">
                <p>No reviews yet. Be the first to write one!</p>
              </div>
              <div v-else class="reviews-grid">
                <div v-for="review in reviews" :key="review.id" class="review-card">
                  <div class="review-header">
                    <img 
                      :src="review.user.avatar" 
                      :alt="review.user.username" 
                      @error="$event.target.src = defaultAvatar"
                    />
                    <div class="review-meta">
                      <h4>{{ review.user.username }}</h4>
                      <span class="review-date">{{ formatDate(review.created_at) }}</span>
                    </div>
                    <div class="review-rating">⭐ {{ review.rating }}/5</div>
                  </div>
                  <p class="review-content">{{ review.content }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Similar Movies -->
          <div class="detail-card">
            <h2>Similar Movies</h2>
            <div class="similar-movies">
              <div class="movies-grid">
                <div 
                  v-for="similar in movie.similar?.results?.slice(0, 6)" 
                  :key="similar.id" 
                  class="movie-card"
                  @click="navigateToMovie(similar.id)"
                >
                  <div class="movie-poster">
                    <img 
                      :src="getMoviePoster(similar)" 
                      :alt="similar.title"
                      @error="handleImageError"
                    />
                    <div class="card-overlay">
                      <span class="rating">{{ formatRating(similar.vote_average) }}</span>
                    </div>
                  </div>
                  <div class="movie-info">
                    <h4>{{ similar.title }}</h4>
                    <p>{{ formatYear(similar.release_date) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>
  </main>
</template>

<script>
import { useAuthStore } from '@/stores/authStore';
import { reviewAPI, interactionAPI, userAPI } from '@/utils/api';
import defaultAvatar from '@/assets/pfp.jpg';
import { 
  isMovieInFavorites, 
  addToFavoritesStorage, 
  removeFromFavoritesStorage,
  syncFavoritesWithServer 
} from '@/utils/favorites';

export default {
  name: 'MovieDetail',
  data() {
    return {
      movie: null,
      reviews: [],
      userReview: null,
      userRating: null,
      isInWatchlist: false,
      isInFavorites: false,
      isToggling: false,
      loading: true,
      error: null,
      showReviewModal: false,
      newReview: {
        content: '',
        rating: 0
      },
      defaultAvatar
    }
  },
  computed: {
    movieId() {
      return this.$route.params.id;
    },
    posterUrl() {
      return this.movie?.poster_path
        ? `https://image.tmdb.org/t/p/w500${this.movie.poster_path}`
        : '/images/placeholder-movie.jpg';
    },
    backdropStyle() {
      return this.movie?.backdrop_path
        ? {
            backgroundImage: `url(https://image.tmdb.org/t/p/original${this.movie.backdrop_path})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }
        : {};
    }
  },
  async created() {
    // Ensure authStore is initialized from localStorage
    const authStore = useAuthStore();
    authStore.checkLocalStorage();
    
    await this.loadMovieData();
    
    if (authStore.isAuthenticated) {
      await this.loadUserInteractions();
    }
  },
  watch: {
    '$route.params.id': {
      handler: async function(newId, oldId) {
        if (newId !== oldId) {
          this.loading = true;
          this.error = null;
          
          // Reset interaction states
          this.isInFavorites = false;
          this.isInWatchlist = false;
          this.userRating = null;
          
          await this.loadMovieData();
          
          const authStore = useAuthStore();
          authStore.checkLocalStorage();
          
          if (authStore.isAuthenticated) {
            await this.loadUserInteractions();
          }
        }
      },
      immediate: false
    }
  },
  methods: {
    initializeFavoritesFromStorage() {
      // Check localStorage immediately for instant UI update
      if (this.movie && this.movie.id) {
        const movieId = this.movie.id;
        const isInFavorites = isMovieInFavorites(movieId);
        this.isInFavorites = isInFavorites;
      }
    },
    
    async loadMovieData() {
      try {
        // Load movie details from TMDB
        const movieId = this.$route.params.id;

        if (!movieId) {
          throw new Error('Movie ID is required');
        }

        const { tmdbAPI } = await import('@/utils/tmdb');
        this.movie = await tmdbAPI.getMovieDetails(movieId);

        // Load reviews if movie data was loaded successfully
        if (this.movie) {
          const [reviewsError, reviewsData] = await reviewAPI.getByContent(movieId, 'movie');
          if (!reviewsError && reviewsData?.reviews) {
            // Transform the reviews data to ensure consistent user data structure
            this.reviews = reviewsData.reviews.map(review => ({
              ...review,
              user: {
                username: review.user?.username || review.username || 'Anonymous User',
                avatar: review.user?.avatar || review.avatar || this.defaultAvatar
              }
            }));
            // Find user's review using the correct id field
            const authStore = useAuthStore();
            this.userReview = this.reviews.find(review => review.user_id === authStore.userData?.id);
          }
          
          // Initialize favorites state from localStorage now that movie data is available
          this.initializeFavoritesFromStorage();
        }
      } catch (error) {
        console.error('Error loading movie data:', error);
        this.error = error.message || 'Failed to load movie data';
      } finally {
        this.loading = false;
      }
    },
    async loadUserInteractions() {
      try {
        const [userError, currentUser] = userAPI.getCurrentUser();
        if (userError) {
          console.error('Error getting current user:', userError);
          return;
        }

        // Ensure we have movie data before checking interactions
        if (!this.movie || !this.movie.id) {
          return;
        }

        const movieId = parseInt(this.movie.id, 10);

        // Load all interactions in parallel for better performance
        const [
          [watchlistError, watchlistData],
          [favoritesError, favoritesData],
          [ratingsError, ratingsData]
        ] = await Promise.all([
          interactionAPI.getWatchlist(),
          interactionAPI.getFavorites(),
          interactionAPI.getUserRatings()
        ]);

        // Check watchlist status
        if (watchlistError) {
          console.error('Error loading watchlist:', watchlistError);
          this.isInWatchlist = false;
        } else {
          // API call was successful, check if user has any watchlist items
          if (watchlistData?.watchlist && Array.isArray(watchlistData.watchlist)) {
            this.isInWatchlist = watchlistData.watchlist.some(item => {
              const watchlistId = parseInt(item.tmdb_id, 10);
              return watchlistId === movieId && item.content_type === 'movie';
            });
          } else {
            // User has no watchlist items or empty watchlist
            this.isInWatchlist = false;
          }
        }

        // Check favorites status and sync with localStorage
        if (favoritesError) {
          console.error('Error loading favorites:', favoritesError);
          // Keep localStorage state if server fails
          this.isInFavorites = isMovieInFavorites(movieId);
        } else {
          // API call was successful, sync server data with localStorage
          if (favoritesData?.favorites && Array.isArray(favoritesData.favorites)) {
            // Sync server favorites with localStorage
            syncFavoritesWithServer(favoritesData.favorites);
            
            // Update current movie's favorite status
            const serverHasFavorite = favoritesData.favorites.some(item => {
              const favoriteId = parseInt(item.tmdb_id, 10);
              const isMatch = favoriteId === movieId && item.content_type === 'movie';
              return isMatch;
            });
            
            this.isInFavorites = serverHasFavorite;
          } else {
            // Server didn't return favorites list properly
            console.error('Favorites data from server is not in the expected format:', favoritesData);
            // Fallback to localStorage state if server response is malformed
            this.isInFavorites = isMovieInFavorites(movieId);
          }
        }

        // Get user's rating if exists
        if (ratingsError) {
          console.error('Error loading ratings:', ratingsError);
          this.userRating = null;
        } else {
          // API call was successful, check if user has any ratings
          if (ratingsData?.ratings && Array.isArray(ratingsData.ratings)) {
            const userRating = ratingsData.ratings.find(rating => {
              const ratingId = parseInt(rating.tmdb_id, 10);
              return ratingId === movieId && rating.content_type === 'movie';
            });
            this.userRating = userRating ? userRating.rating : null;
          } else {
            // User has no ratings or empty ratings list
            this.userRating = null;
          }
        }
      } catch (error) {
        console.error('Error loading user interactions:', error);
        // Reset states on error to prevent false positives
        this.isInFavorites = false;
        this.isInWatchlist = false;
        this.userRating = null;
      }
    },
    async toggleWatchlist() {
      const movieId = this.$route.params.id;
      
      if (this.isInWatchlist) {
        const [error] = await interactionAPI.removeFromWatchlist(movieId);
        if (!error) {
          this.isInWatchlist = false;
        }
      } else {
        const [error] = await interactionAPI.addToWatchlist({
          tmdb_id: movieId,
          content_type: 'movie',
          title: this.movie.title,
          poster_path: this.movie.poster_path
        });
        if (!error) {
          this.isInWatchlist = true;
        }
      }
    },
    async toggleFavorite() {
      const movieId = this.$route.params.id;
      
      // Prevent rapid clicks
      if (this.isToggling) return;
      this.isToggling = true;
      
      try {
        if (this.isInFavorites) {
          // Update localStorage immediately for instant UI feedback
          removeFromFavoritesStorage(movieId);
          this.isInFavorites = false;
          
          // Sync with server
          const [error] = await interactionAPI.removeFromFavorites(movieId, 'movie');
          if (error) {
            console.error('Error removing from favorites on server:', error);
            // Revert localStorage change if server fails
            addToFavoritesStorage(movieId, {
              title: this.movie?.title,
              poster_path: this.movie?.poster_path
            });
            this.isInFavorites = true;
            alert('Error removing from favorites. Please try again.');
          }
        } else {
          // Update localStorage immediately for instant UI feedback
          addToFavoritesStorage(movieId, {
            title: this.movie?.title,
            poster_path: this.movie?.poster_path
          });
          this.isInFavorites = true;
          
          // Sync with server
          const payload = {
            tmdb_id: parseInt(movieId, 10),
            content_type: 'movie'
          };
          
          const [error] = await interactionAPI.addToFavorites(payload);
          if (error) {
            console.error('Error adding to favorites on server:', error);
            
            // Check if error is 409 (Conflict) - movie already in favorites
            if (error.status === 409 || error.message?.includes('409') || error.message?.includes('Conflict')) {
              console.log('🎯 Movie already in favorites on server, updating localStorage and UI');
              // Movie already exists on server, keep it in localStorage and update UI
              this.isInFavorites = true;
              alert('This movie is already in your favorites!');
            } else {
              // Other error, revert localStorage change
              removeFromFavoritesStorage(movieId);
              this.isInFavorites = false;
              alert('Error adding to favorites. Please try again.');
            }
          }
        }
        
      } catch (error) {
        console.error('Unexpected error in toggleFavorite:', error);
        // Revert to localStorage state on unexpected error
        this.isInFavorites = isMovieInFavorites(movieId);
        alert('An unexpected error occurred. Please try again.');
      } finally {
        this.isToggling = false;
      }
    },
    async submitReview() {
      if (!this.newReview.content || !this.newReview.rating) {
        return;
      }

      const [error, data] = await reviewAPI.create({
        content: this.newReview.content,
        rating: this.newReview.rating,
        tmdb_id: this.$route.params.id,
        content_type: 'movie',
        title: this.movie.title
      });

      if (!error) {
        this.reviews.unshift(data.review);
        this.userReview = data.review;
        this.showReviewModal = false;
        this.newReview = { content: '', rating: 0 };
      }
    },
    async likeReview(reviewId) {
      const review = this.reviews.find(r => r.id === reviewId);
      if (!review) return;

      if (review.user_liked) {
        const [error] = await reviewAPI.unlike(reviewId);
        if (!error) {
          review.likes_count--;
          review.user_liked = false;
        }
      } else {
        const [error] = await reviewAPI.like(reviewId);
        if (!error) {
          review.likes_count++;
          review.user_liked = true;
        }
      }
    },
    getMoviePoster(movie) {
      return movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : '/images/placeholder-movie.jpg';
    },
    getActorImage(path) {
      return path
        ? `https://image.tmdb.org/t/p/w185${path}`
        : defaultAvatar;
    },

    formatYear(date) {
      return date ? date.split('-')[0] : 'N/A';
    },
    formatRating(rating) {
      return rating ? rating.toFixed(1) : 'N/A';
    },
    formatRuntime(minutes) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    handleImageError(event) {
      event.target.src = '/images/placeholder-movie.jpg';
    },
    navigateToMovie(id) {
      this.$router.push(`/movie/${id}`);
    },
    openReviewModal() {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) {
        this.$router.push('/login');
        return;
      }

      this.$router.push({
        name: 'create-review',
        params: {
          movieData: btoa(JSON.stringify({
            id: this.movie.id,
            title: this.movie.title,
            poster_path: this.movie.poster_path,
            release_date: this.movie.release_date,
            vote_average: this.movie.vote_average
          }))
        }
      });
    },
    async handleReviewCreated() {
      await this.loadMovieData();
    }
  }
}
</script>

<style src="@/styles/movie-detail.scss" lang="scss"></style> 