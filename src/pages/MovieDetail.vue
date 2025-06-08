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
              <button @click="toggleFavorite" class="btn-favorite" :class="{ 'is-favorite': isInFavorites }">
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
                  @error="handleImageError"
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
                    <img :src="getUserAvatar(review.user.avatar)" :alt="review.user.username" />
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
      loading: true,
      error: null,
      showReviewModal: false,
      newReview: {
        content: '',
        rating: 0
      }
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
    await this.loadMovieData();
    if (useAuthStore().isAuthenticated) {
      await this.loadUserInteractions();
    }
  },
  methods: {
    async loadMovieData() {
      try {
        // Load movie details from TMDB
        const movieId = this.$route.params.id;
        const apiKey = import.meta.env.VITE_MOVIEDB_API_KEY;
        const tmdbBaseUrl = 'https://api.themoviedb.org/3';

        if (!movieId) {
          throw new Error('Movie ID is required');
        }

        // Check if API key is available
        if (!apiKey) {
          console.error('TMDB API key is not available:', {
            envKeys: Object.keys(import.meta.env),
            hasMovieDBKey: 'VITE_MOVIEDB_API_KEY' in import.meta.env
          });
          throw new Error('TMDB API key is not configured. Please check your environment variables.');
        }

        const url = `${tmdbBaseUrl}/movie/${movieId}?api_key=${apiKey}&append_to_response=credits,similar`;
        const response = await fetch(url);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `Failed to load movie data: ${response.status}${errorData.status_message ? ` - ${errorData.status_message}` : ''}`
          );
        }
        
        const data = await response.json();
        this.movie = data;

        // Load reviews if movie data was loaded successfully
        if (this.movie) {
          const [reviewsError, reviewsData] = await reviewAPI.getByContent(movieId, 'movie');
          if (!reviewsError && reviewsData?.reviews) {
            this.reviews = reviewsData.reviews;
            // Find user's review using the correct id field
            const authStore = useAuthStore();
            this.userReview = this.reviews.find(review => review.user_id === authStore.userData?.id);
          }

          // Load user interactions if authenticated
          if (useAuthStore().isAuthenticated) {
            await this.loadUserInteractions();
          }
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

        // Check watchlist status
        const [watchlistError, watchlistData] = await interactionAPI.getWatchlist();
        if (!watchlistError && watchlistData?.items) {
          this.isInWatchlist = watchlistData.items.some(item => 
            item.tmdb_id === this.movie.id && item.content_type === 'movie'
          );
        }

        // Check favorites status
        const [favoritesError, favoritesData] = await interactionAPI.getFavorites();
        if (!favoritesError && favoritesData?.items) {
          this.isInFavorites = favoritesData.items.some(item => 
            item.tmdb_id === this.movie.id && item.content_type === 'movie'
          );
        }

        // Get user's rating if exists
        const [ratingsError, ratingsData] = await interactionAPI.getUserRatings();
        if (!ratingsError && ratingsData?.ratings) {
          const userRating = ratingsData.ratings.find(rating => 
            rating.tmdb_id === this.movie.id && rating.content_type === 'movie'
          );
          this.userRating = userRating ? userRating.rating : null;
        }
      } catch (error) {
        console.error('Error loading user interactions:', error);
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
      
      if (this.isInFavorites) {
        const [error] = await interactionAPI.removeFromFavorites(movieId, 'movie');
        if (!error) {
          this.isInFavorites = false;
        }
      } else {
        const [error] = await interactionAPI.addToFavorites({
          tmdb_id: movieId,
          content_type: 'movie',
          title: this.movie.title,
          poster_path: this.movie.poster_path
        });
        if (!error) {
          this.isInFavorites = true;
        }
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
        : '/images/placeholder-avatar.jpg';
    },
    getUserAvatar(avatar) {
      return avatar || '/images/placeholder-avatar.jpg';
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