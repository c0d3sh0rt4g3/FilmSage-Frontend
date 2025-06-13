/**
 * Review store using Pinia
 * Manages review creation and related operations
 */
import { defineStore } from 'pinia';
import { useAuthStore } from './authStore';
import { apiClient } from '@/utils/axios';

export const useReviewStore = defineStore('review', {
  state: () => ({
    error: null,
    loading: false
  }),

  actions: {
    /**
     * Create a new movie review
     * @param {object} reviewData - Review data
     * @param {number} reviewData.movieId - TMDB movie ID
     * @param {string} reviewData.title - Movie title
     * @param {string} reviewData.content - Review content
     * @param {number} reviewData.rating - Rating (1-10)
     * @returns {Promise<Array>} Review creation result
     */
    async createReview(reviewData) {
      this.loading = true;
      this.error = null;

      try {
        const authStore = useAuthStore();
        if (!authStore.isAuthenticated || !authStore.userData?.id) {
          throw new Error('User not authenticated');
        }

        const payload = {
          user_id: authStore.userData.id,
          tmdb_id: reviewData.movieId,
          content_type: 'movie',
          title: reviewData.title,
          content: reviewData.content,
          rating: reviewData.rating,
          is_critic: false,
          is_spoiler: false
        };

        const response = await apiClient.post('/reviews', payload);
        
        this.error = null;
        return [null, response.data];
      } catch (error) {
        // Handle specific HTTP status codes
        if (error.response) {
          const status = error.response.status;
          const serverMessage = error.response.data?.message || error.response.data?.error;
          
          switch (status) {
            case 409:
              this.error = 'You have already written a review for this movie. You can only submit one review per movie.';
              break;
            case 401:
              this.error = 'You must be logged in to write a review.';
              break;
            case 403:
              this.error = 'You do not have permission to write reviews.';
              break;
            case 400:
              this.error = serverMessage || 'Invalid review data. Please check your input.';
              break;
            case 500:
              this.error = 'Server error. Please try again later.';
              break;
            default:
              this.error = serverMessage || `Error ${status}: ${error.message}`;
          }
        } else {
        this.error = error.message || 'Error connecting to the server';
        }
        
        return [error, null];
      } finally {
        this.loading = false;
      }
    },

    /**
     * Clear any existing error messages
     */
    clearError() {
      this.error = null;
    }
  }
}); 