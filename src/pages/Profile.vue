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
          <div class="info-grid">
            <div class="info-item">
              <label>Username</label>
              <input type="text" v-model="userData.username" :disabled="!isEditing" />
            </div>
            <div class="info-item">
              <label>Email</label>
              <input type="email" v-model="userData.email" :disabled="!isEditing" />
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
              <span class="stat-number">{{ userStats.ratings || 0 }}</span>
              <span class="stat-label">Movies Rated</span>
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
import { userAPI, interactionAPI } from '@/utils/api';

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
        ratings: 0,
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
        // Load profile data
        const [profileError, profileData] = await userAPI.getProfile();
        if (profileError) {
          console.error('Error loading user data:', profileError);
          if (profileError.message.includes('token')) {
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
          username: profileData.username,
          email: profileData.email,
          role: profileData.role
        };
        this.selectedGenres = profileData.favorite_genres || [];
        this.originalUserData = { ...this.userData };

        // Load activity data
        const [activityError, activityData] = await interactionAPI.getUserActivity(profileData.id);
        if (!activityError) {
          this.userStats = {
            reviews: activityData.reviews_count || 0,
            ratings: activityData.ratings_count || 0,
            favorites: activityData.favorites_count || 0,
            ...activityData
          };
        }
      } catch (error) {
        console.error('Error in loadUserData:', error);
        this.error = 'An unexpected error occurred while loading your profile.';
      }
    },
    startEditing() {
      this.isEditing = true;
      this.originalUserData = { ...this.userData };
    },
    async saveChanges() {
      this.isSaving = true;
      
      const success = await useAuthStore().updateProfile({
        ...this.userData,
        favorite_genres: this.selectedGenres
      });

      if (success) {
        this.isEditing = false;
      }

      this.isSaving = false;
    },
    cancelEditing() {
      this.userData = { ...this.originalUserData };
      this.isEditing = false;
    }
  }
}
</script>

<style src="@/styles/profile.scss" lang="scss"></style> 