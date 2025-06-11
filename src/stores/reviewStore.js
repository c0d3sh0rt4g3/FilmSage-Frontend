import { defineStore } from 'pinia';
import { useAuthStore } from './authStore';
import { apiClient } from '@/utils/axios';

export const useReviewStore = defineStore('review', {
  state: () => ({
    error: null,
    loading: false
  }),

  actions: {
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

    clearError() {
      this.error = null;
    }
  }
}); 