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

export default {
  name: 'CreateReview',
  props: {
    movieData: {
      type: String,
      required: true
    }
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
      this.loading = true;
      this.error = null;
      
      const reviewStore = useReviewStore();
      const [error, data] = await reviewStore.createReview(this.review);

      if (error) {
        this.error = error.message;
        this.loading = false;
      } else {
        // Redirect to home or reviews list
        this.$router.push('/');
      }
    },
    formatRating(rating) {
      return rating ? rating.toFixed(1) : 'N/A';
    },
    formatYear(date) {
      return date ? date.split('-')[0] : 'N/A';
    },
    goBack() {
      this.$router.back();
    }
  }
}
</script>

<style src="@/styles/create-review.scss" lang="scss" scoped></style> 