import { defineStore } from 'pinia';
import { useAuthStore } from './authStore';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

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
        if (!authStore.userData?._id) {
          throw new Error('User not authenticated');
        }

        const payload = {
          user_id: authStore.userData._id,
          tmdb_id: reviewData.movieId,
          content_type: 'movie',
          title: reviewData.title,
          content: reviewData.content,
          rating: reviewData.rating,
          is_critic: false,
          is_spoiler: false
        };

        const response = await fetch(`${BACKEND_URL}/reviews`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
          this.error = null;
          return [null, data];
        } else {
          this.error = data.message || 'Error creating review';
          return [new Error(this.error), null];
        }
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