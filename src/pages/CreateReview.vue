<template>
  <main class="create-review-page">
    <div class="review-container">
      <div class="movie-info">
        <div class="movie-poster">
          <img :src="getMoviePoster" :alt="movieData.title" />
        </div>
        <div class="movie-details">
          <h1>{{ movieData.title }}</h1>
          <p class="release-year">{{ formatYear(movieData.release_date) }}</p>
          <div class="movie-rating">
            <span>⭐ {{ formatRating(movieData.vote_average) }}</span>
          </div>
        </div>
      </div>

      <div class="review-form-container">
        <h2>Write Your Review</h2>
        
        <form @submit.prevent="submitReview" class="review-form">
          <div class="form-group">
            <label for="rating">Your Rating (1-10)</label>
            <select v-model="review.rating" id="rating" required>
              <option value="" disabled>Select a rating</option>
              <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
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
      error: null
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
          this.error = error.message;
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

      if (!this.review.rating || this.review.rating < 1 || this.review.rating > 10) {
        this.error = 'Please provide a rating between 1 and 10';
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
    }
  }
}
</script>

<style src="@/styles/create-review.scss" lang="scss" scoped></style> 