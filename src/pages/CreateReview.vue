<template>
  <main class="create-review-page">
    <div class="review-container">
      <div class="movie-info">
        <div class="movie-poster">
          <img :src="getMoviePoster" :alt="decodedMovieData?.title" />
        </div>
        <div class="movie-details">
          <h1>{{ decodedMovieData?.title || 'Loading...' }}</h1>
          <p class="release-year">{{ formatYear(decodedMovieData?.release_date) }}</p>
          <div class="movie-rating">
            <span>⭐ {{ formatRating(decodedMovieData?.vote_average) }}</span>
          </div>
          <p class="movie-overview">{{ decodedMovieData?.overview || 'No overview available.' }}</p>
        </div>
      </div>

      <div class="review-form-container">
        <h2>Write Your Review</h2>
        
        <form @submit.prevent="submitReview" class="review-form">
          <div class="form-group">
            <label for="rating">Your Rating (1-5)</label>
            <select v-model="review.rating" id="rating" required>
              <option value="" disabled>Select a rating</option>
              <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
            </select>
          </div>

          <div class="form-group">
            <label for="title">Review Title</label>
            <input
              type="text"
              id="title"
              v-model="review.title"
              required
              placeholder="Give your review a title"
            />
          </div>

          <div class="form-group">
            <label for="content">Your Review</label>
            <textarea
              id="content"
              v-model="review.content"
              required
              rows="8"
              placeholder="Share your thoughts about the movie..."
            ></textarea>
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
            <div v-if="isConflictError" class="error-actions">
              <button type="button" class="btn-view-existing" @click="goToMovieDetail">
                View Your Existing Review
              </button>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="goBack">
              Cancel
            </button>
            <button type="submit" class="btn-submit" :disabled="loading">
              {{ loading ? 'Submitting...' : 'Submit Review' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<script>
import { useReviewStore } from '@/stores/reviewStore';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

export default {
  name: 'CreateReview',
  props: {
    movieData: {
      type: String,
      required: true
    }
  },
  setup() {
    const router = useRouter();
    return { router };
  },
  data() {
    return {
      review: {
        title: '',
        content: '',
        rating: '',
        movieId: null
      },
      decodedMovieData: null,
      loading: false,
      error: null,
      isConflictError: false
    }
  },
  computed: {
    getMoviePoster() {
      const baseUrl = 'https://image.tmdb.org/t/p/w500';
      return this.decodedMovieData?.poster_path
        ? `${baseUrl}${this.decodedMovieData.poster_path}`
        : '/images/placeholder-movie.jpg';
    }
  },
  created() {
    // Check authentication first
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated) {
      this.router.push({
        path: '/login',
        query: { redirect: this.$route.fullPath }
      });
      return;
    }

    try {
      // Decode the base64 movie data from the URL
      const decodedString = atob(this.movieData);
      this.decodedMovieData = JSON.parse(decodedString);
      this.review.movieId = this.decodedMovieData.id;
    } catch (error) {
      console.error('Error parsing movie data:', error);
      this.error = 'Invalid movie data';
      this.goBack();
    }
  },
  methods: {
    async submitReview() {
      if (!this.validateForm()) {
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        const reviewStore = useReviewStore();
        const [error, data] = await reviewStore.createReview(this.review);

        if (error) {
          // Check if it's a 409 conflict (user already has a review)
          if (error.response && error.response.status === 409) {
            this.error = 'You have already written a review for this movie. You can only submit one review per movie.';
            this.isConflictError = true;
          } else {
            this.error = error.message || 'Failed to submit review. Please try again.';
            this.isConflictError = false;
          }
          return;
        }

        // Navigate back to movie detail page
        await this.router.push({
          name: 'movie-detail',
          params: { id: this.review.movieId }
        });
      } catch (error) {
        console.error('Error submitting review:', error);
        this.error = 'Failed to submit review. Please try again.';
      } finally {
        this.loading = false;
      }
    },
    validateForm() {
      let isValid = true;
      this.error = null;

      if (!this.review.content?.trim()) {
        this.error = 'Please write your review';
        isValid = false;
      }

      if (!this.review.rating || this.review.rating < 1 || this.review.rating > 5) {
        this.error = 'Please provide a rating between 1 and 5';
        isValid = false;
      }

      return isValid;
    },
    formatRating(rating) {
      return rating ? rating.toFixed(1) : 'N/A';
    },
    formatYear(date) {
      return date ? date.split('-')[0] : 'N/A';
    },
    goBack() {
      this.router.back();
    },
    goToMovieDetail() {
      this.router.push({
        name: 'movie-detail',
        params: { id: this.review.movieId }
      });
    }
  }
}
</script>

<style src="@/styles/create-review.scss" lang="scss" scoped></style> 