<template>
  <main class="profile-page">
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
                  :disabled="!isEditing"
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
            <div class="stat-item clickable" @click="goToFavorites">
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
import { getFavoritesCount, syncFavoritesWithServer } from '@/utils/favorites';

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
  mounted() {
    // Ensure we check localStorage immediately on mount
    this.loadInitialDataFromStorage();
    
    // Initialize favorites count from localStorage immediately
    this.userStats.favorites = getFavoritesCount();
    
    // Listen for visibility changes to refresh favorites count
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  },
  beforeUnmount() {
    // Clean up event listener
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  },
  async created() {
    const authStore = useAuthStore();
    
    // Ensure authStore has checked localStorage
    authStore.checkLocalStorage();
    
    if (!authStore.isAuthenticated) {
      this.$router.push({
        path: '/login',
        query: { redirect: '/profile' }
      });
      return;
    }

    // First, try to load user data from localStorage (authStore)
    if (authStore.userData) {
      this.userData = {
        username: authStore.userData.username || '',
        email: authStore.userData.email || '',
        role: authStore.userData.role || '',
        id: authStore.userData._id || authStore.userData.id || ''
      };
      this.selectedGenres = authStore.userData.favorite_genres || [];
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

    // Initialize favorites count from localStorage immediately for instant display
    this.userStats.favorites = getFavoritesCount();

    await this.loadUserData();
  },
  watch: {
    // Watch for changes in authStore userData
    '$authStore.userData': {
      handler(newUserData) {
        if (newUserData && newUserData.favorite_genres) {
          // Convert to numbers to ensure consistency
          this.selectedGenres = newUserData.favorite_genres.map(id => typeof id === 'string' ? parseInt(id, 10) : id);
        }
      },
      immediate: true,
      deep: true
    }
  },
  computed: {
    $authStore() {
      return useAuthStore();
    }
  },
  methods: {
    loadInitialDataFromStorage() {
      // Load immediately from localStorage if available
      const authStore = useAuthStore();
      
      // Check localStorage directly
      const userDataLS = localStorage.getItem('userData');
      if (userDataLS) {
        try {
          const parsedUserData = JSON.parse(userDataLS);
          if (parsedUserData.favorite_genres) {
            // Convert to numbers to ensure consistency
            this.selectedGenres = parsedUserData.favorite_genres.map(id => typeof id === 'string' ? parseInt(id, 10) : id);
          }
        } catch (e) {
          console.error('Error parsing localStorage:', e);
        }
      }
      
      // Also check authStore as backup
      if (authStore.userData && authStore.userData.favorite_genres) {
        // Convert to numbers to ensure consistency
        this.selectedGenres = authStore.userData.favorite_genres.map(id => typeof id === 'string' ? parseInt(id, 10) : id);
      }
    },
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
        
        // Only update selectedGenres if we got new data from API or if we don't have any
        if (userData.user.favorite_genres && userData.user.favorite_genres.length > 0) {
          // Convert to numbers to ensure consistency
          this.selectedGenres = userData.user.favorite_genres.map(id => typeof id === 'string' ? parseInt(id, 10) : id);
        } else if (!this.selectedGenres || this.selectedGenres.length === 0) {
          // Convert to numbers to ensure consistency
          const apiGenres = userData.user.favorite_genres || [];
          this.selectedGenres = apiGenres.map(id => typeof id === 'string' ? parseInt(id, 10) : id);
        }
        
        this.originalUserData = { ...this.userData };

        // Sync with authStore to ensure localStorage is updated
        const authStore = useAuthStore();
        authStore.updateUserData(userData.user);

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
        
        // Load favorites count from localStorage and sync with server
        await this.loadFavoritesCount();
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

        const authStore = useAuthStore();
        const success = await authStore.updateProfile({
          favorite_genres: this.selectedGenres
        });

        if (!success) {
          const error = authStore.getErrors.profile || 'Failed to update profile';
          console.error('Profile update error:', error);
          this.error = error;
          return;
        }

        // Update local data from the updated store data
        // Convert to numbers to ensure consistency
        const updatedGenres = authStore.userData.favorite_genres || [];
        this.selectedGenres = updatedGenres.map(id => typeof id === 'string' ? parseInt(id, 10) : id);
        
        this.userData = { ...this.userData, ...authStore.userData };
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
      // Restore selectedGenres to the original state (from authStore/localStorage)
      this.loadInitialDataFromStorage();
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
        const [error, ratingsData] = await interactionAPI.getUserRatings();
        
        if (!error && ratingsData) {
          // Check different possible structures
          let ratings = null;
          if (ratingsData.ratings) {
            ratings = ratingsData.ratings;
          } else if (Array.isArray(ratingsData)) {
            ratings = ratingsData;
          } else if (ratingsData.data && ratingsData.data.ratings) {
            ratings = ratingsData.data.ratings;
          }
          
          if (ratings && Array.isArray(ratings) && ratings.length > 0) {
            // Calculate the average rating
            const totalRating = ratings.reduce((sum, rating) => {
              return sum + (rating.rating || rating.value || rating.score || 0);
            }, 0);
            const averageRating = totalRating / ratings.length;
            
            this.userStats.ratingsAverage = averageRating;
          } else {
            this.userStats.ratingsAverage = 0;
          }
        } else {
          this.userStats.ratingsAverage = 0;
        }
      } catch (error) {
        console.error('Error loading user ratings average:', error);
        this.userStats.ratingsAverage = 0;
      }
    },
    async loadFavoritesCount() {
      try {
        // Get initial count from localStorage
        const localCount = getFavoritesCount();
        this.userStats.favorites = localCount;
        
        // Try to sync with server favorites and update count
        const [favoritesError, favoritesData] = await interactionAPI.getFavorites();
        
        if (!favoritesError && favoritesData?.items && Array.isArray(favoritesData.items)) {
          // Server returned favorites successfully, sync with localStorage
          syncFavoritesWithServer(favoritesData.items);
          
          // Update count with server data
          this.userStats.favorites = favoritesData.items.length;
        } else {
          // Server failed or returned undefined, keep localStorage count
          console.log('Using localStorage favorites count:', localCount);
          // Keep the localStorage count that was already set
        }
      } catch (error) {
        console.error('Error loading favorites count:', error);
                 // Fall back to localStorage count
         this.userStats.favorites = getFavoritesCount();
       }
     },
     handleVisibilityChange() {
       // When user returns to the page, refresh favorites count from localStorage
       if (!document.hidden) {
         const currentCount = getFavoritesCount();
         if (currentCount !== this.userStats.favorites) {
           this.userStats.favorites = currentCount;
         }
       }
     },
     goToFavorites() {
       this.$router.push('/favorites');
     }
   }
 }
</script>

<style src="@/styles/profile.scss" lang="scss"></style> 