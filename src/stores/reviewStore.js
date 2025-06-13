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
        this.error = error.message || 'Error connecting to the server';
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