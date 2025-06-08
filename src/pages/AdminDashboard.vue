<template>
  <main class="admin-dashboard">
    <section class="dashboard-hero">
      <div class="hero-content">
        <h1 class="hero-title">
          Admin <span class="gradient-text">Dashboard</span>
        </h1>
        <p class="hero-subtitle">
          Manage users and monitor system performance
        </p>
      </div>
    </section>

    <section class="dashboard-content">
      <div class="container">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <h3>Oops! Something went wrong</h3>
          <p>{{ error }}</p>
          <button @click="loadDashboardData" class="btn-retry">Try again</button>
        </div>

        <template v-else>
          <!-- Stats Overview -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon users">👥</div>
              <div class="stat-info">
                <h3>Total Users</h3>
                <p class="stat-number">{{ stats.totalUsers }}</p>
                <span class="stat-change" :class="{ positive: stats.userGrowth > 0 }">
                  {{ formatGrowth(stats.userGrowth) }}% this month
                </span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon reviews">✍️</div>
              <div class="stat-info">
                <h3>Total Reviews</h3>
                <p class="stat-number">{{ stats.totalReviews }}</p>
                <span class="stat-change" :class="{ positive: stats.reviewGrowth > 0 }">
                  {{ formatGrowth(stats.reviewGrowth) }}% this month
                </span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon ratings">⭐</div>
              <div class="stat-info">
                <h3>Average Rating</h3>
                <p class="stat-number">{{ formatRating(stats.averageRating) }}</p>
                <span class="stat-label">across all reviews</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon active">🎯</div>
              <div class="stat-info">
                <h3>Active Users</h3>
                <p class="stat-number">{{ stats.activeUsers }}</p>
                <span class="stat-label">in the last 7 days</span>
              </div>
            </div>
          </div>

          <!-- User Management -->
          <div class="section-card">
            <div class="card-header">
              <h2>User Management</h2>
              <div class="header-actions">
                <div class="search-box">
                  <input 
                    type="text" 
                    v-model="searchQuery" 
                    placeholder="Search users..."
                    @input="searchUsers"
                  />
                </div>
                <button class="btn-export" @click="exportUserData">
                  Export Data
                </button>
              </div>
            </div>

            <div class="table-container">
              <table class="users-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Joined</th>
                    <th>Reviews</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in filteredUsers" :key="user.id">
                    <td>{{ user.username }}</td>
                    <td>{{ user.email }}</td>
                    <td>{{ formatDate(user.created_at) }}</td>
                    <td>{{ user.reviews_count }}</td>
                    <td>
                      <span class="status-badge" :class="{ active: user.is_active }">
                        {{ user.is_active ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td>
                      <div class="action-buttons">
                        <button 
                          class="btn-action"
                          :class="{ 'warning': user.is_active }"
                          @click="toggleUserStatus(user.id, user.is_active)"
                        >
                          {{ user.is_active ? 'Deactivate' : 'Activate' }}
                        </button>
                        <button 
                          class="btn-action danger"
                          @click="deleteUser(user.id)"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="pagination">
              <button 
                :disabled="currentPage === 1"
                @click="changePage(currentPage - 1)"
                class="btn-page"
              >
                Previous
              </button>
              <span class="page-info">
                Page {{ currentPage }} of {{ totalPages }}
              </span>
              <button 
                :disabled="currentPage === totalPages"
                @click="changePage(currentPage + 1)"
                class="btn-page"
              >
                Next
              </button>
            </div>
          </div>

          <!-- System Performance -->
          <div class="section-card">
            <h2>System Performance</h2>
            <div class="performance-grid">
              <div class="performance-card">
                <h3>Recommendation Accuracy</h3>
                <div class="chart-container">
                  <div class="accuracy-meter">
                    <div 
                      class="accuracy-fill"
                      :style="{ width: `${stats.recommendationAccuracy}%` }"
                    ></div>
                    <span class="accuracy-label">
                      {{ stats.recommendationAccuracy }}%
                    </span>
                  </div>
                </div>
              </div>

              <div class="performance-card">
                <h3>API Response Time</h3>
                <div class="chart-container">
                  <div class="response-meter">
                    <div 
                      class="response-bar"
                      :class="getResponseTimeClass(stats.apiResponseTime)"
                    >
                      {{ stats.apiResponseTime }}ms
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </section>
  </main>
</template>

<script>
import { useAuthStore } from '@/stores/authStore';
import { adminAPI } from '@/utils/api';

export default {
  name: 'AdminDashboard',
  data() {
    return {
      users: [],
      loading: true,
      error: null,
      searchQuery: '',
      selectedUser: null,
      showUserModal: false,
      roleOptions: ['user', 'admin', 'moderator'],
      stats: {
        totalUsers: 0,
        userGrowth: 0,
        totalReviews: 0,
        reviewGrowth: 0,
        averageRating: 0,
        activeUsers: 0,
        recommendationAccuracy: 0,
        apiResponseTime: 0
      },
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: 10
    }
  },
  async created() {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated || authStore.userData?.role !== 'admin') {
      this.$router.push('/');
      return;
    }
    await this.loadUsers();
  },
  methods: {
    async loadUsers() {
      this.loading = true;
      const [error, data] = await adminAPI.getAllUsers();
      
      if (error) {
        console.error('Error loading users:', error);
        this.error = error.message;
      } else {
        this.users = data.users;
        this.totalPages = Math.ceil(data.total / this.itemsPerPage);
      }
      
      this.loading = false;
    },
    async deleteUser(userId) {
      if (!confirm('Are you sure you want to delete this user?')) {
        return;
      }

      const [error] = await adminAPI.deleteUser(userId);
      if (!error) {
        this.users = this.users.filter(user => user.id !== userId);
      }
    },
    async changeUserRole(userId, newRole) {
      const [error] = await adminAPI.changeUserRole(userId, newRole);
      if (!error) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
          user.role = newRole;
        }
      }
    },
    async toggleUserStatus(userId, isActive) {
      const [error] = await (isActive ? 
        adminAPI.deactivateUser(userId) : 
        adminAPI.activateUser(userId)
      );

      if (!error) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
          user.is_active = !isActive;
        }
      }
    },
    selectUser(user) {
      this.selectedUser = { ...user };
      this.showUserModal = true;
    },
    closeUserModal() {
      this.selectedUser = null;
      this.showUserModal = false;
    },
    exportUserData() {
      const csvContent = this.users.map(user => {
        return [
          user.id,
          user.username,
          user.email,
          user.role,
          user.is_active ? 'Active' : 'Inactive',
          user.created_at
        ].join(',');
      });

      csvContent.unshift(['ID', 'Username', 'Email', 'Role', 'Status', 'Created At']);
      
      const blob = new Blob([csvContent.join('\n')], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'users.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    formatGrowth(value) {
      return value.toFixed(1);
    },
    formatRating(rating) {
      return rating.toFixed(1);
    },
    getResponseTimeClass(time) {
      if (time < 100) return 'excellent';
      if (time < 300) return 'good';
      if (time < 500) return 'fair';
      return 'poor';
    },
    async searchUsers() {
      if (!this.searchQuery.trim()) {
        await this.loadUsers();
        return;
      }

      const search = this.searchQuery.toLowerCase();
      this.users = this.users.filter(user => 
        user.username.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      );
    },
    async changePage(page) {
      this.currentPage = page;
      await this.loadUsers();
    }
  },
  computed: {
    filteredUsers() {
      if (!this.searchQuery) return this.users;
      
      const query = this.searchQuery.toLowerCase();
      return this.users.filter(user => 
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }
  }
}
</script>

<style src="@/styles/admin-dashboard.scss" lang="scss"></style> 