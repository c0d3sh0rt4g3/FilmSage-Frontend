<template>
  <div class="favorites-page">
    <section class="favorites-hero">
      <div class="favorites-content">
        <h1 class="favorites-title">
          Your 
          <span class="gradient-text">Favorite Movies</span>
        </h1>
        <p class="favorites-subtitle">
          All the movies you've marked as favorites in one place
        </p>
      </div>
    </section>

    <section class="results-section">
      <div class="container">
        <!-- Favorites Header -->
        <div v-if="!loading" class="results-header-info">
          <h2 class="results-title">
            My Favorites
          </h2>
          <div class="results-meta-info">
            <span class="results-count">
              {{ favorites.length }} {{ favorites.length === 1 ? 'movie' : 'movies' }} in favorites
            </span>
          </div>
        </div>

        <!-- Error State -->
        <div v-if="error" class="error-state">
          <h3>Oops! Something went wrong</h3>
          <p>{{ error }}</p>
          <button @click="loadFavorites" class="btn-retry">Try again</button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <h3>Loading your favorites...</h3>
        </div>

        <!-- No Favorites -->
        <div v-if="!loading && favorites.length === 0 && !error" class="no-results">
          <h3>No favorites yet</h3>
          <p>You haven't added any movies to your favorites yet.</p>
          <div class="no-results-suggestions">
            <h4>Start exploring:</h4>
            <ul>
              <li>Search for movies you love</li>
              <li>Browse recommendations</li>
              <li>Add movies to your favorites with the heart button</li>
            </ul>
          </div>
          <router-link to="/search" class="btn-search-movies">
            Start Searching
          </router-link>
        </div>

        <!-- Favorites Results -->
        <template v-if="!loading && favorites.length > 0">
          <div class="movies-grid list-view">
            <div
              v-for="movie in favorites"
              :key="`movie-${movie.id}`"
              class="movie-card list-card"
            >
              <div class="movie-poster" @click="selectMovie(movie)">
                <img
                  :src="getMoviePoster(movie.poster_path)"
                  :alt="movie.title"
                  @error="$event.target.src = '/images/placeholder-movie.jpg'"
                />
                <div class="card-overlay">
                  <span class="rating" v-if="movie.vote_average">
                    ⭐ {{ movie.vote_average.toFixed(1) }}
                  </span>
                </div>
              </div>
              <div class="movie-info" @click="selectMovie(movie)">
                <h4>{{ movie.title }}</h4>
                <p class="movie-year">
                  {{ movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A' }}
                </p>
                <p v-if="movie.overview" class="movie-overview">
                  {{ truncateText(movie.overview, 150) }}
                </p>
                <div v-if="movie.genres && movie.genres.length > 0" class="genres">
                  <span 
                    v-for="genre in movie.genres.slice(0, 3)" 
                    :key="genre.id"
                    class="genre-tag"
                  >
                    {{ genre.name }}
                  </span>
                </div>
              </div>
              <button 
                class="remove-favorite-btn" 
                @click="removeFromFavorites(movie)"
                :disabled="removingFavorite === movie.id"
                title="Remove from favorites"
              >
                ×
              </button>
            </div>
          </div>
        </template>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { interactionAPI } from '@/utils/api'
import { tmdbAPI } from '@/utils/tmdb'
import { removeFromFavoritesStorage } from '@/utils/favorites'

export default {
  name: 'FavoritesPage',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const favorites = ref([])
    const loading = ref(true)
    const error = ref(null)
    const removingFavorite = ref(null)

    async function loadFavorites() {
      loading.value = true
      error.value = null

      try {
        // Check if user is authenticated
        if (!authStore.isAuthenticated) {
          router.push('/login')
          return
        }

        // Get favorites from API
        const [favoritesError, favoritesData] = await interactionAPI.getFavorites()
        
        if (favoritesError) {
          throw new Error(favoritesError.message || 'Failed to load favorites')
        }

        if (favoritesData?.favorites && Array.isArray(favoritesData.favorites)) {
          // Get detailed movie information for each favorite
          const moviePromises = favoritesData.favorites
            .filter(fav => fav.content_type === 'movie')
            .map(async (fav) => {
              try {
                const movieDetails = await tmdbAPI.getMovieDetails(fav.tmdb_id)
                return movieDetails
              } catch (error) {
                console.error(`Error loading movie ${fav.tmdb_id}:`, error)
                return null
              }
            })

          const movieResults = await Promise.all(moviePromises)
          favorites.value = movieResults.filter(movie => movie !== null)
        } else {
          favorites.value = []
        }
      } catch (err) {
        console.error('Error loading favorites:', err)
        error.value = err.message || 'Failed to load favorites'
      } finally {
        loading.value = false
      }
    }

    async function removeFromFavorites(movie) {
      if (removingFavorite.value === movie.id) return
      
      removingFavorite.value = movie.id
      
      try {
        // Remove from server
        const [error] = await interactionAPI.removeFromFavorites(movie.id, 'movie')
        
        if (error) {
          console.error('Error removing from favorites:', error)
          return
        }
        
        // Remove from localStorage
        removeFromFavoritesStorage(movie.id)
        
        // Remove from local favorites list
        favorites.value = favorites.value.filter(fav => fav.id !== movie.id)
        
      } catch (err) {
        console.error('Unexpected error removing from favorites:', err)
      } finally {
        removingFavorite.value = null
      }
    }

    function selectMovie(movie) {
      router.push({
        name: 'movie-detail',
        params: { id: movie.id }
      })
    }

    function getMoviePoster(path) {
      return tmdbAPI.getImageUrl(path)
    }

    function truncateText(text, length) {
      if (!text) return ''
      return text.length > length ? text.substring(0, length) + '...' : text
    }

    onMounted(() => {
      // Ensure auth store is initialized
      authStore.checkLocalStorage()
      loadFavorites()
    })

    return {
      favorites,
      loading,
      error,
      removingFavorite,
      loadFavorites,
      removeFromFavorites,
      selectMovie,
      getMoviePoster,
      truncateText
    }
  }
}
</script>

<style src="@/styles/search.scss" lang="scss"></style>
<style lang="scss" scoped>
// Reuse the same styles as Search.vue but with favorites-specific modifications
.favorites-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: 100vw;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

.favorites-hero {
  padding: 80px 0 60px;
  background: rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  width: 100%;
  backdrop-filter: blur(20px);
}

.favorites-content {
  width: 95%;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  padding: 0 2.5%;
}

.favorites-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.5rem;
}

.gradient-text {
  background: linear-gradient(45deg, #ff6b6b, #feca57);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.favorites-subtitle {
  font-size: clamp(1.1rem, 2.5vw, 1.4rem);
  line-height: 1.6;
  margin-bottom: 3rem;
  opacity: 0.9;
}

.results-section {
  padding: 4rem 0 8rem;
  width: 100%;
}

.container {
  width: 95%;
  max-width: none;
  margin: 0 auto;
  padding: 0 2.5%;
}

.results-header-info {
  text-align: center;
  margin-bottom: 2rem;
  
  .results-title {
    margin-bottom: 1rem;
    font-size: clamp(1.8rem, 3vw, 2.5rem);
    font-weight: 700;
  }
}

  .results-meta-info {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 2rem;

    .results-count {
      color: rgba(255, 255, 255, 0.8);
      font-size: 1rem;
    }
  }

// List view styles (same as Search.vue)
.movies-grid.list-view {
  grid-template-columns: 1fr;
  gap: 1.5rem;

  .movie-card.list-card {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    padding: 0;
    height: auto;

    .movie-poster {
      width: 200px;
      height: 280px;
      flex-shrink: 0;
      border-radius: 15px 0 0 15px;

      img {
        border-radius: 15px 0 0 15px;
      }
    }

    .movie-info {
      flex: 1;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border-radius: 0 15px 15px 0;

      h4 {
        font-size: 1.4rem;
        margin-bottom: 1rem;
        -webkit-line-clamp: 2;
      }

      .movie-overview {
        color: rgba(255, 255, 255, 0.8);
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        margin-bottom: 1rem;
      }

      .genres {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;

        .genre-tag {
          background: rgba(255, 107, 107, 0.2);
          color: white;
          padding: 4px 8px;
          border-radius: 10px;
          font-size: 0.8rem;
          border: 1px solid rgba(255, 107, 107, 0.3);
        }
      }
    }

    .card-overlay {
      position: absolute;
      width: 105px;
      top: 15px;
      left: 0;
      border-radius: 0 15px 15px 0;
    }

    .remove-favorite-btn {
      position: absolute;
      top: 15px;
      right: 15px;
      width: 35px;
      height: 35px;
      border-radius: 50%;
      border: none;
      background: rgba(255, 107, 107, 0.9);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      transition: all 0.3s ease;
      z-index: 3;
      backdrop-filter: blur(10px);

      &:hover:not(:disabled) {
        background: rgba(255, 107, 107, 1);
        transform: scale(1.1);
        box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }

      // Style for the × symbol
      font-size: 18px;
      font-weight: bold;
      line-height: 1;
    }
  }
}

// Grid view styles
.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.movie-card {
  position: relative;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  }
}

.movie-poster {
  position: relative;
  width: 100%;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: all 0.3s ease;
  }
}

.card-overlay {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.8);
  padding: 8px 12px;
  border-radius: 20px;
  z-index: 2;
}

.rating {
  color: #feca57;
  font-weight: 600;
  font-size: 0.9rem;
}

.movie-info {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);

  h4 {
    margin: 0 0 8px 0;
    font-size: 1.1rem;
    font-weight: 600;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.8;
  }
}

// Loading, Error, and State Styles
.loading-state, .error-state, .no-results {
  text-align: center;
  padding: 4rem 2rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top: 4px solid #ff6b6b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.btn-retry, .btn-search-movies {
  padding: 1rem 2rem;
  border-radius: 25px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(45deg, #ff6b6b, #feca57);
  color: white;
  margin-top: 1rem;
  text-decoration: none;
  display: inline-block;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
  }
}

.no-results-suggestions {
  margin: 2rem 0;
  
  h4 {
    margin-bottom: 1rem;
    color: rgba(255, 255, 255, 0.9);
  }
  
  ul {
    list-style: none;
    padding: 0;
    
    li {
      margin: 0.5rem 0;
      color: rgba(255, 255, 255, 0.8);
      
      &:before {
        content: "•";
        color: #ff6b6b;
        font-weight: bold;
        display: inline-block;
        width: 1em;
        margin-left: -1em;
      }
    }
  }
}

// Responsive design
@media (max-width: 768px) {
  .movies-grid.list-view .movie-card.list-card {
    flex-direction: column;

    .movie-poster {
      width: 100%;
      height: 300px;
      border-radius: 15px 15px 0 0;

      img {
        border-radius: 15px 15px 0 0;
      }
    }

    .movie-info {
      border-radius: 0 0 15px 15px;
    }

    .card-overlay {
      top: 15px;
      right: 60px;
      left: auto;
      border-radius: 15px;
    }

    .remove-favorite-btn {
      top: 15px;
      right: 15px;
    }
  }
}
</style> 