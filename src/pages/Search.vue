<template>
  <div class="movies-page">
    <section class="search-hero">
      <div class="search-content">
        <h1 class="search-title">
          Find Your Next 
          <span class="gradient-text">Favorite Movie</span>
        </h1>
        <p class="search-subtitle">
          Discover movies by title, actor, director, or genre with advanced filtering options
        </p>
        
        <form @submit.prevent="performSearch" class="search-bar">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search for movies, actors, directors..."
            class="search-input"
            :disabled="loading"
          />
          <button type="submit" :disabled="loading" class="btn-search">
            <template v-if="loading">
              <i class="fas fa-spinner fa-spin"></i>
            </template>
            <template v-else>
              <i class="fas fa-search"></i>
              Search
            </template>
          </button>
        </form>
      </div>
    </section>

    <!-- Advanced Filters -->
    <div class="filters-container">
      <AdvancedFilters
        v-model:filters="filters"
        @apply="applyFilters"
        :show-by-default="false"
        :genres="genres"
      />
    </div>

    <section class="results-section">
      <div class="container">
        <!-- Search Results Header -->
        <div v-if="hasSearched && !loading" class="results-header-info">
          <h2 class="results-title">
            {{ getResultsTitle() }}
          </h2>
          <div class="results-meta-info">
            <span class="results-count">
              {{ totalResults }} {{ totalResults === 1 ? 'movie' : 'movies' }} found
            </span>
            <div class="view-toggle">
              <button 
                :class="['view-btn', { active: viewMode === 'grid' }]"
                @click="viewMode = 'grid'"
              >
                Grid
              </button>
              <button 
                :class="['view-btn', { active: viewMode === 'list' }]"
                @click="viewMode = 'list'"
              >
                List
              </button>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-if="error" class="error-state">
          <h3>Oops! Something went wrong</h3>
          <p>{{ error }}</p>
          <button @click="retrySearch" class="btn-retry">Try again</button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <h3>Searching movies...</h3>
        </div>

        <!-- No Results -->
        <div v-if="hasSearched && !loading && movieResults.length === 0 && !error" class="no-results">
          <h3>No movies found</h3>
          <p>No movies found for "{{ lastSearchQuery }}"</p>
          <div class="no-results-suggestions">
            <h4>Try:</h4>
            <ul>
              <li>Checking your spelling</li>
              <li>Using different keywords</li>
              <li>Searching for an actor or director name</li>
              <li>Adjusting your filters</li>
            </ul>
          </div>
        </div>

        <!-- Movies Results -->
        <template v-if="!loading && movieResults.length > 0">
          <div :class="['movies-grid', { 'list-view': viewMode === 'list' }]">
            <div
              v-for="movie in movieResults"
              :key="`movie-${movie.id}`"
              :class="['movie-card', { 'list-card': viewMode === 'list' }]"
              @click="selectMovie(movie)"
            >
              <div class="movie-poster">
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
              <div class="movie-info">
                <h4>{{ movie.title }}</h4>
                <p class="movie-year">
                  {{ movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A' }}
                </p>
                <p v-if="viewMode === 'list' && movie.overview" class="movie-overview">
                  {{ truncateText(movie.overview, 150) }}
                </p>
                <div v-if="movie.genre_ids && movie.genre_ids.length > 0" class="genres">
                  <span 
                    v-for="genreId in movie.genre_ids.slice(0, 3)" 
                    :key="genreId"
                    class="genre-tag"
                  >
                    {{ getGenreName(genreId) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Load More Button -->
          <div v-if="canLoadMore" class="load-more-container">
            <button class="btn-load-more" @click="loadMoreResults" :disabled="loadingMore">
              {{ loadingMore ? 'Loading more...' : 'Load more' }}
            </button>
          </div>
        </template>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { tmdbAPI } from '@/utils/tmdb'
import AdvancedFilters from '@/components/AdvancedFilters.vue'

export default {
  name: 'AdvancedSearchPage',
  components: {
    AdvancedFilters
  },
  setup() {
    const router = useRouter()
    const searchQuery = ref('')
    const lastSearchQuery = ref('')
    const movieResults = ref([])
    const loading = ref(false)
    const loadingMore = ref(false)
    const error = ref(null)
    const hasSearched = ref(false)
    const currentPage = ref(1)
    const totalPages = ref(1)
    const totalResults = ref(0)
    const viewMode = ref('grid')
    const filters = reactive({
      genre: '',
      yearFrom: '',
      yearTo: '',
      minRating: 0,
      sortBy: 'popularity.desc',
      searchType: 'all'
    })
    const genres = ref({})

    const canLoadMore = computed(() => {
      return currentPage.value < totalPages.value && movieResults.value.length > 0
    })

    async function loadGenres() {
      try {
        const data = await tmdbAPI.getGenres()
        genres.value = {}
        if (data.genres) {
          data.genres.forEach(genre => {
            genres.value[genre.id] = genre.name
          })
        }
      } catch (error) {
        console.error('Error loading genres:', error)
      }
    }

    async function performSearch() {
      if (!searchQuery.value.trim()) return

      loading.value = true
      error.value = null
      hasSearched.value = true
      currentPage.value = 1
      lastSearchQuery.value = searchQuery.value
      movieResults.value = []

      // Update URL with search query
      router.replace({ query: { q: searchQuery.value } })

      try {
        await executeSearch()
      } catch (error) {
        console.error('Error performing search:', error)
        error.value = error.message || 'Error performing search. Please try again.'
      } finally {
        loading.value = false
      }
    }

    async function executeSearch() {
      const searchType = filters.searchType
      let data
      
      // Check if we should use discovery (filters are active and no specific search query for actors)
      if (hasActiveFilters() && (!lastSearchQuery.value.trim() || searchType === 'title')) {
        // Use discovery with filters
        data = await discoverMoviesWithFilters()
      } else if (searchType === 'person') {
        // Search movies by actor/director
        data = await tmdbAPI.searchMoviesByPerson(lastSearchQuery.value, currentPage.value)
        // Apply client-side filtering for person searches
        data = applyClientSideFilters(data)
      } else if (searchType === 'title') {
        // Search movies by title with filters
        if (hasActiveFilters()) {
          data = await discoverMoviesWithFilters()
        } else {
          data = await tmdbAPI.searchMovies(lastSearchQuery.value, currentPage.value)
        }
      } else {
        // Search all (movies + movies by person)
        data = await tmdbAPI.searchMoviesAndByPerson(lastSearchQuery.value, currentPage.value)
        // Apply client-side filtering for combined searches
        data = applyClientSideFilters(data)
      }

      movieResults.value = data.results || []
      totalResults.value = data.total_results || 0
      totalPages.value = data.total_pages || 1
    }

    async function searchMoviesWithFilters() {
      // If we have filters, use discover endpoint, otherwise use search
      if (hasActiveFilters()) {
        return await discoverMoviesWithFilters()
      } else {
        return await tmdbAPI.searchMovies(lastSearchQuery.value, currentPage.value)
      }
    }

    async function discoverMoviesWithFilters() {
      const params = {
        page: currentPage.value,
        sort_by: filters.sortBy
      }

      // Apply filters
      if (filters.genre) {
        params.with_genres = filters.genre
      }
      
      if (filters.yearFrom || filters.yearTo) {
        if (filters.yearFrom) {
          params['primary_release_date.gte'] = `${filters.yearFrom}-01-01`
        }
        if (filters.yearTo) {
          params['primary_release_date.lte'] = `${filters.yearTo}-12-31`
        }
      }

      if (filters.minRating > 0) {
        params['vote_average.gte'] = filters.minRating
      }

      // If we have a search query for title search, we need to combine discover with search
      if (lastSearchQuery.value.trim() && filters.searchType === 'title') {
        // First get search results, then filter them
        const searchData = await tmdbAPI.searchMovies(lastSearchQuery.value, currentPage.value)
        return applyClientSideFilters(searchData)
      }

      return await tmdbAPI.discoverMovies(params)
    }

    // Apply filters on the client side when TMDB API doesn't support the combination
    function applyClientSideFilters(data) {
      if (!data.results) return data

      let filteredResults = [...data.results]

      // Filter by genre
      if (filters.genre) {
        filteredResults = filteredResults.filter(movie => 
          movie.genre_ids && movie.genre_ids.includes(parseInt(filters.genre))
        )
      }

      // Filter by year range
      if (filters.yearFrom || filters.yearTo) {
        filteredResults = filteredResults.filter(movie => {
          if (!movie.release_date) return false
          const movieYear = new Date(movie.release_date).getFullYear()
          
          if (filters.yearFrom && movieYear < parseInt(filters.yearFrom)) {
            return false
          }
          if (filters.yearTo && movieYear > parseInt(filters.yearTo)) {
            return false
          }
          return true
        })
      }

      // Filter by minimum rating
      if (filters.minRating > 0) {
        filteredResults = filteredResults.filter(movie => 
          movie.vote_average && movie.vote_average >= filters.minRating
        )
      }

      // Sort results
      if (filters.sortBy && filters.sortBy !== 'popularity.desc') {
        filteredResults = sortMovies(filteredResults, filters.sortBy)
      }

      return {
        ...data,
        results: filteredResults,
        total_results: filteredResults.length
      }
    }

    // Sort movies based on the selected criteria
    function sortMovies(movies, sortBy) {
      return [...movies].sort((a, b) => {
        switch (sortBy) {
          case 'popularity.asc':
            return (a.popularity || 0) - (b.popularity || 0)
          case 'popularity.desc':
            return (b.popularity || 0) - (a.popularity || 0)
          case 'vote_average.asc':
            return (a.vote_average || 0) - (b.vote_average || 0)
          case 'vote_average.desc':
            return (b.vote_average || 0) - (a.vote_average || 0)
          case 'release_date.asc':
            return new Date(a.release_date || '1900-01-01') - new Date(b.release_date || '1900-01-01')
          case 'release_date.desc':
            return new Date(b.release_date || '1900-01-01') - new Date(a.release_date || '1900-01-01')
          case 'title.asc':
            return (a.title || '').localeCompare(b.title || '')
          case 'title.desc':
            return (b.title || '').localeCompare(a.title || '')
          default:
            return 0
        }
      })
    }

    async function loadMoreResults() {
      if (!canLoadMore.value || loadingMore.value) return

      loadingMore.value = true

      try {
        const nextPage = currentPage.value + 1
        let data

        // Use the same logic as executeSearch but for the next page
        if (hasActiveFilters() && (!lastSearchQuery.value.trim() || filters.searchType === 'title')) {
          // Update page for discover
          const originalPage = currentPage.value
          currentPage.value = nextPage
          data = await discoverMoviesWithFilters()
          currentPage.value = originalPage // Reset to avoid issues
        } else if (filters.searchType === 'person') {
          data = await tmdbAPI.searchMoviesByPerson(lastSearchQuery.value, nextPage)
          data = applyClientSideFilters(data)
        } else if (filters.searchType === 'title') {
          data = await loadMoreMovies(nextPage)
        } else {
          data = await tmdbAPI.searchMoviesAndByPerson(lastSearchQuery.value, nextPage)
          data = applyClientSideFilters(data)
        }

        if (data.results) {
          movieResults.value.push(...data.results)
        }

        currentPage.value = nextPage
      } catch (error) {
        console.error('Error loading more results:', error)
        error.value = 'Error loading more results.'
      } finally {
        loadingMore.value = false
      }
    }

    async function loadMoreMovies(page) {
      if (hasActiveFilters()) {
        const originalPage = currentPage.value
        currentPage.value = page
        const result = await discoverMoviesWithFilters()
        currentPage.value = originalPage
        return result
      } else {
        return await tmdbAPI.searchMovies(lastSearchQuery.value, page)
      }
    }

    function applyFilters(newFilters) {
      // ✅ Corrección: usar Object.assign en lugar de reasignación directa
      Object.assign(filters, newFilters)
      
      // If filters are applied, perform search even without query
      if (hasActiveFilters()) {
        hasSearched.value = true
        performFilteredSearch()
      } else if (hasSearched.value && lastSearchQuery.value) {
        // If we had a search and filters are cleared, re-search with original query
        performSearch()
      } else {
        // Clear results if no search and no filters
        movieResults.value = []
        hasSearched.value = false
        totalResults.value = 0
      }
    }

    async function performFilteredSearch() {
      loading.value = true
      error.value = null
      currentPage.value = 1
      movieResults.value = []

      try {
        let data
        
        if (!lastSearchQuery.value.trim() && hasActiveFilters()) {
          // Browse with filters only (no search query)
          data = await discoverMoviesWithFilters()
        } else {
          // Search with filters
          await executeSearch()
          return
        }

        movieResults.value = data.results || []
        totalResults.value = data.total_results || 0
        totalPages.value = data.total_pages || 1
      } catch (error) {
        console.error('Error performing filtered search:', error)
        error.value = error.message || 'Error applying filters. Please try again.'
      } finally {
        loading.value = false
      }
    }

    function selectMovie(movie) {
      router.push({
        name: 'movie-detail',
        params: { id: movie.id }
      })
    }

    function retrySearch() {
      if (lastSearchQuery.value) {
        searchQuery.value = lastSearchQuery.value
        performSearch()
      }
    }

    function hasActiveFilters() {
      return (
        filters.genre ||
        filters.yearFrom ||
        filters.yearTo ||
        filters.minRating > 0 ||
        filters.sortBy !== 'popularity.desc'
      )
    }

    function getResultsTitle() {
      // If we have active filters but no search query, show filter-based title
      if (hasActiveFilters() && !lastSearchQuery.value) {
        const filterLabels = []
        
        if (filters.genre) {
          filterLabels.push(`Genre: ${getGenreName(filters.genre)}`)
        }
        if (filters.yearFrom || filters.yearTo) {
          if (filters.yearFrom && filters.yearTo) {
            filterLabels.push(`Years: ${filters.yearFrom}-${filters.yearTo}`)
          } else if (filters.yearFrom) {
            filterLabels.push(`From: ${filters.yearFrom}`)
          } else {
            filterLabels.push(`Until: ${filters.yearTo}`)
          }
        }
        if (filters.minRating > 0) {
          filterLabels.push(`Rating: ${filters.minRating}+ ⭐`)
        }
        
        if (filterLabels.length > 0) {
          return `Movies filtered by: ${filterLabels.join(', ')}`
        }
        return 'Browse Movies'
      }
      
      // If we have a search query
      if (lastSearchQuery.value) {
        const searchTypeLabels = {
          all: 'All Movies',
          title: 'Movies by Title',
          person: 'Movies by Actor/Director'
        }
        
        const type = searchTypeLabels[filters.searchType] || 'Movies'
        let title = `${type}: "${lastSearchQuery.value}"`
        
        // Add filter info if filters are active
        if (hasActiveFilters()) {
          const filterCount = getActiveFilterCount()
          title += ` (${filterCount} filter${filterCount !== 1 ? 's' : ''} applied)`
        }
        
        return title
      }
      
      return 'Browse Movies'
    }

    function getActiveFilterCount() {
      let count = 0
      if (filters.genre) count++
      if (filters.yearFrom || filters.yearTo) count++
      if (filters.minRating > 0) count++
      if (filters.sortBy !== 'popularity.desc') count++
      return count
    }

    function getMoviePoster(path) {
      return tmdbAPI.getImageUrl(path)
    }

    function getGenreName(genreId) {
      return genres.value[genreId] || ''
    }

    function truncateText(text, length) {
      if (!text) return ''
      return text.length > length ? text.substring(0, length) + '...' : text
    }

    onMounted(async () => {
      await loadGenres()
      
      // Check for query parameters on page load
      const query = router.currentRoute.value.query.q
      if (query) {
        searchQuery.value = query
        await performSearch()
      }
    })

    return {
      searchQuery,
      lastSearchQuery,
      movieResults,
      loading,
      loadingMore,
      error,
      hasSearched,
      currentPage,
      totalPages,
      totalResults,
      viewMode,
      filters,
      genres,
      canLoadMore,
      performSearch,
      executeSearch,
      searchMoviesWithFilters,
      discoverMoviesWithFilters,
      applyClientSideFilters,
      sortMovies,
      loadMoreResults,
      loadMoreMovies,
      applyFilters,
      performFilteredSearch,
      selectMovie,
      retrySearch,
      hasActiveFilters,
      getResultsTitle,
      getActiveFilterCount,
      getMoviePoster,
      getGenreName,
      truncateText
    }
  }
}
</script>

<style src="@/styles/search.scss" lang="scss"></style>
<style lang="scss" scoped>
// Additional styles for new functionality while maintaining original design
.filters-container {
  padding: 0 2.5%;
  width: 95%;
  max-width: 1200px;
  margin: 0 auto;
}

.results-header-info {
  text-align: center;
  margin-bottom: 2rem;
  
  .results-title {
    margin-bottom: 1rem;
  }
}

.results-meta-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;

  .results-count {
    color: rgba(255, 255, 255, 0.8);
    font-size: 1rem;
  }

  .view-toggle {
    display: flex;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 25px;
    padding: 4px;
    backdrop-filter: blur(10px);

    .view-btn {
      padding: 8px 16px;
      border: none;
      background: transparent;
      border-radius: 20px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s ease;
      color: rgba(255, 255, 255, 0.7);
      font-weight: 500;

      &.active {
        background: linear-gradient(45deg, #ff6b6b, #feca57);
        color: white;
        box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
      }

      &:hover:not(.active) {
        color: white;
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }
}

// List view styles
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

      .movie-details {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 1rem;

        .release-date {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.95rem;
        }

        .overview {
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }

      .movie-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: auto;

        .rating {
          color: #feca57;
          font-weight: 600;
          font-size: 1.1rem;
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
    }

    .card-overlay {
      position: absolute;
      top: 15px;
      left: 15px;
    }
  }
}

// Load more button
.load-more-container {
  text-align: center;
  margin-top: 3rem;

  .btn-load-more {
    background: linear-gradient(45deg, #ff6b6b, #feca57);
    color: white;
    border: none;
    padding: 15px 40px;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1.1rem;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .loading-text {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      justify-content: center;

      .fa-spinner {
        animation: spin 1s linear infinite;
      }
    }
  }
}

// Error and retry button styling
.error-state {
  .btn-retry {
    background: linear-gradient(45deg, #ff6b6b, #feca57);
    color: white;
    border: none;
    padding: 12px 30px;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 1rem;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
    }
  }
}

// Responsive design improvements
@media (max-width: 768px) {
  .results-meta-info {
    flex-direction: column;
    gap: 1rem;
  }

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
      right: 15px;
      left: auto;
    }
  }
}
</style>
