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

<style lang="scss" scoped>
.create-review-page {
  padding: 2rem;
  min-height: 100vh;
  background: #121212;
}

.review-container {
  max-width: 800px;
  margin: 0 auto;
  background: #1a1a1a;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.movie-info {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .movie-poster {
    flex-shrink: 0;
    width: 200px;
    height: 300px;
    overflow: hidden;
    border-radius: 12px;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .movie-details {
    flex-grow: 1;

    h1 {
      font-size: 2rem;
      color: #fff;
      margin-bottom: 0.5rem;
    }

    .release-year {
      color: #888;
      margin-bottom: 1rem;
    }

    .movie-rating {
      display: inline-block;
      padding: 0.5rem 1rem;
      background: rgba(255, 107, 107, 0.1);
      border-radius: 8px;
      color: #ff6b6b;
    }
  }
}

.review-form-container {
  h2 {
    color: #fff;
    margin-bottom: 1.5rem;
  }
}

.review-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    color: #fff;
    font-weight: 500;
  }

  input, select, textarea {
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
    font-size: 1rem;

    &:focus {
      outline: none;
      border-color: #ff6b6b;
    }
  }

  textarea {
    resize: vertical;
    min-height: 150px;
  }
}

.error-message {
  color: #ff6b6b;
  padding: 1rem;
  border-radius: 8px;
  background: rgba(255, 107, 107, 0.1);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-submit, .btn-cancel {
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
}

.btn-submit {
  background: linear-gradient(135deg, #ff6b6b, #feca57);
  color: #fff;
  border: none;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.btn-cancel {
  background: transparent;
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.1);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}

@media (max-width: 768px) {
  .movie-info {
    flex-direction: column;
    align-items: center;
    text-align: center;

    .movie-poster {
      width: 180px;
      height: 270px;
    }
  }

  .form-actions {
    flex-direction: column;
  }
}
</style> 