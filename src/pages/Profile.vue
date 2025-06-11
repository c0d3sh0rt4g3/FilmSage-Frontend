<template>
  <main class="profile-page">
    <section class="profile-hero">
      <div class="profile-content">
        <h1 class="profile-title">
          Your <span class="gradient-text">Profile</span>
        </h1>
      </div>
    </section>

    <section class="profile-sections">
      <div class="container">
        <!-- User Info Section -->
        <div class="profile-card">
          <h2>Personal Information</h2>
          <div v-if="error" class="error-message" style="color: red; margin-bottom: 1rem; padding: 0.5rem; background: #ffe6e6; border: 1px solid #ff0000; border-radius: 4px;">
            {{ error }}
          </div>
          <div class="info-grid">
            <div class="info-item">
              <label>Username</label>
              <input type="text" v-model="userData.username" disabled />
            </div>
            <div class="info-item actions">
              <button v-if="!isEditing" @click="startEditing" class="btn-edit">
                Edit Profile
              </button>
              <template v-else>
                <button @click="saveChanges" class="btn-save" :disabled="isSaving">
                  {{ isSaving ? 'Saving...' : 'Save Changes' }}
                </button>
                <button @click="cancelEditing" class="btn-cancel">
                  Cancel
                </button>
              </template>
            </div>
          </div>
        </div>

        <!-- Preferences Section -->
        <div class="profile-card">
          <h2>Movie Preferences</h2>
          <div class="preferences-section">
            <h3>Favorite Genres</h3>
            <div class="genres-grid">
              <label 
                v-for="genre in availableGenres" 
                :key="genre.id" 
                class="genre-checkbox"
                :class="{ 'selected': selectedGenres.includes(genre.id) }"
              >
                <input 
                  type="checkbox" 
                  :value="genre.id" 
                  v-model="selectedGenres"
                />
                <span>{{ genre.name }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Activity Section -->
        <div class="profile-card">
          <h2>Your Activity</h2>
          <div class="activity-stats">
            <div class="stat-item">
              <span class="stat-number">{{ userStats.reviews || 0 }}</span>
              <span class="stat-label">Reviews Written</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ userStats.ratingsAverage ? userStats.ratingsAverage.toFixed(1) : 'N/A' }}</span>
              <span class="stat-label">Average Rating</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ userStats.favorites || 0 }}</span>
              <span class="stat-label">Favorites</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script>
import { useAuthStore } from '@/stores/authStore';
import { userAPI, interactionAPI, reviewAPI } from '@/utils/api';

export default {
  name: 'ProfilePage',
  data() {
    return {
      userData: {
        username: '',
        email: '',
        role: '',
      },
      originalUserData: null,
      isEditing: false,
      isSaving: false,
      selectedGenres: [],
      availableGenres: [
        { id: 28, name: 'Action' },
        { id: 12, name: 'Adventure' },
        { id: 16, name: 'Animation' },
        { id: 35, name: 'Comedy' },
        { id: 80, name: 'Crime' },
        { id: 99, name: 'Documentary' },
        { id: 18, name: 'Drama' },
        { id: 10751, name: 'Family' },
        { id: 14, name: 'Fantasy' },
        { id: 36, name: 'History' },
        { id: 27, name: 'Horror' },
        { id: 10402, name: 'Music' },
        { id: 9648, name: 'Mystery' },
        { id: 10749, name: 'Romance' },
        { id: 878, name: 'Science Fiction' },
        { id: 53, name: 'Thriller' },
        { id: 10752, name: 'War' },
        { id: 37, name: 'Western' }
      ],
      userStats: {
        reviews: 0,
        ratingsAverage: 0,
        favorites: 0
      },
      error: null
    }
  },
  async created() {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated) {
      this.$router.push({
        path: '/login',
        query: { redirect: '/profile' }
      });
      return;
    }

    const [userError, currentUser] = userAPI.getCurrentUser();
    if (userError) {
      console.error('Authentication error:', userError);
      authStore.logout();
      this.$router.push({
        path: '/login',
        query: { redirect: '/profile' }
      });
      return;
    }

    await this.loadUserData();
  },
  methods: {
    async loadUserData() {
      try {
        // Load user data
        const [userError, userData] = await userAPI.getProfile();
        if (userError) {
          console.error('Error loading user data:', userError);
          
          if (userError.message?.includes('token')) {
            const authStore = useAuthStore();
            authStore.logout();
            this.$router.push({
              path: '/login',
              query: { redirect: '/profile' }
            });
          }
          return;
        }
        
        this.userData = {
          username: userData.user.username,
          email: userData.user.email,
          role: userData.user.role,
          id: userData.user._id // Ensure we store the user ID
        };
        this.selectedGenres = userData.user.favorite_genres || [];
        this.originalUserData = { ...this.userData };

        // Load activity data
        const [activityError, activityData] = await interactionAPI.getUserActivity(this.userData.id);
        if (!activityError && activityData) {
          this.userStats = {
            reviews: activityData.reviews_count || 0,
            ratingsAverage: 0, // Will be calculated from actual ratings
            favorites: activityData.favorites_count || 0,
            watchlist: activityData.watchlist_count || 0,
            followers: activityData.followers_count || 0,
            following: activityData.following_count || 0
          };
        }

        // Load user reviews count using the specific endpoint
        await this.loadUserReviewsCount();
        
        // Load user ratings average
        await this.loadUserRatingsAverage();
      } catch (error) {
        console.error('Error in loadUserData:', error);
        this.error = 'An unexpected error occurred while loading your profile.';
      }
    },
    startEditing() {
      this.isEditing = true;
      this.error = null;
      this.originalUserData = { ...this.userData };
    },
    async saveChanges() {
      this.isSaving = true;
      this.error = null;
      
      try {
        // Debug logging
        const token = localStorage.getItem('token');
        console.log('Token exists:', !!token);
        console.log('User ID:', this.userData.id);
        console.log('Update data:', {
          favorite_genres: this.selectedGenres
        });

        const [error, data] = await userAPI.updateProfile({
          favorite_genres: this.selectedGenres
        });

        if (error) {
          console.error('Profile update error:', error);
          this.error = error.message || 'Failed to update profile';
          return;
        }

        // Update local data
        this.selectedGenres = data.user.favorite_genres || [];
        this.originalUserData = { ...this.userData };
        this.isEditing = false;
      } catch (error) {
        console.error('Error saving profile:', error);
        this.error = 'An unexpected error occurred while saving your profile.';
      } finally {
        this.isSaving = false;
      }
    },
    cancelEditing() {
      this.userData = { ...this.originalUserData };
      this.isEditing = false;
    },
    async loadUserReviewsCount() {
      try {
        const [error, reviewsData] = await reviewAPI.getUserReviews(this.userData.id);
        if (!error && reviewsData && reviewsData.reviews) {
          // Update the reviews count with the actual number from the endpoint
          this.userStats.reviews = reviewsData.reviews.length;
        }
      } catch (error) {
        console.error('Error loading user reviews count:', error);
        // Keep the existing count from activity data if the reviews endpoint fails
      }
    },
    async loadUserRatingsAverage() {
      try {
        console.log('Loading user ratings average from reviews...');
        console.log('User ID:', this.userData.id);
        console.log('Full userData:', this.userData);
        
        const [error, ratingsData] = await interactionAPI.getUserRatings();
        
        console.log('Ratings API response - Error:', error);
        console.log('Ratings API response - Data:', ratingsData);
        
        if (!error && ratingsData) {
          console.log('Raw ratings data structure:', Object.keys(ratingsData));
          
          // Check different possible structures
          let ratings = null;
          if (ratingsData.ratings) {
            ratings = ratingsData.ratings;
          } else if (Array.isArray(ratingsData)) {
            ratings = ratingsData;
          } else if (ratingsData.data && ratingsData.data.ratings) {
            ratings = ratingsData.data.ratings;
          }
          
          console.log('Extracted ratings:', ratings);
          console.log('Ratings length:', ratings ? ratings.length : 0);
          
          if (ratings && Array.isArray(ratings) && ratings.length > 0) {
            console.log('Sample rating object:', ratings[0]);
            
            // Calculate the average rating
            const totalRating = ratings.reduce((sum, rating) => {
              console.log('Processing rating:', rating);
              return sum + (rating.rating || rating.value || rating.score || 0);
            }, 0);
            const averageRating = totalRating / ratings.length;
            
            console.log('Total rating:', totalRating);
            console.log('Average rating calculated:', averageRating);
            
            this.userStats.ratingsAverage = averageRating;
          } else {
            console.log('No ratings found or empty array');
            this.userStats.ratingsAverage = 0;
          }
        } else {
          console.log('Error or no data received');
          this.userStats.ratingsAverage = 0;
        }
        
        console.log('Final ratingsAverage value:', this.userStats.ratingsAverage);
      } catch (error) {
        console.error('Error loading user ratings average:', error);
        this.userStats.ratingsAverage = 0;
      }
    }
  }
}
</script>

<style src="@/styles/profile.scss" lang="scss"></style> 