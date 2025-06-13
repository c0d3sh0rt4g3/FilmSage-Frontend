<template>
  <div class="advanced-filters">
    <div class="filters-header">
      <h3>Advanced Filters</h3>
      <button @click="toggleFilters" class="toggle-btn">
        {{ showFilters ? 'Hide Filters' : 'Show Filters' }}
      </button>
    </div>

    <div v-if="showFilters" class="filters-content">
      <div class="filters-grid">
        <!-- Genre Filter -->
        <div class="filter-group">
          <label class="filter-label">Genre</label>
          <select v-model="localFilters.genre" @change="onFilterChange" class="filter-select">
            <option value="">All Genres</option>
            <option v-for="genre in genres" :key="genre.id" :value="genre.id">
              {{ genre.name }}
            </option>
          </select>
        </div>

        <!-- Year Filter -->
        <div class="filter-group">
          <label class="filter-label">Release Year</label>
          <div class="year-inputs">
            <input
              v-model="localFilters.yearFrom"
              @input="onFilterChange"
              type="number"
              :min="1900"
              :max="currentYear"
              placeholder="From"
              class="filter-input year-input"
            />
            <input
              v-model="localFilters.yearTo"
              @input="onFilterChange"
              type="number"
              :min="1900"
              :max="currentYear"
              placeholder="To"
              class="filter-input year-input"
            />
          </div>
        </div>

        <!-- Rating Filter -->
        <div class="filter-group">
          <label class="filter-label">Minimum Rating</label>
          <div class="rating-container">
            <input
              v-model.number="localFilters.minRating"
              @input="onFilterChange"
              type="range"
              min="0"
              max="10"
              step="0.5"
              class="rating-slider"
            />
            <span class="rating-value">{{ localFilters.minRating }}+ ⭐</span>
          </div>
        </div>

        <!-- Sort By -->
        <div class="filter-group">
          <label class="filter-label">Sort By</label>
          <select v-model="localFilters.sortBy" @change="onFilterChange" class="filter-select">
            <option value="popularity.desc">Most Popular</option>
            <option value="popularity.asc">Least Popular</option>
            <option value="vote_average.desc">Highest Rated</option>
            <option value="vote_average.asc">Lowest Rated</option>
            <option value="release_date.desc">Newest First</option>
            <option value="release_date.asc">Oldest First</option>
            <option value="title.asc">A-Z</option>
            <option value="title.desc">Z-A</option>
          </select>
        </div>

        <!-- Search Type Filter -->
        <div class="filter-group">
          <label class="filter-label">Search Type</label>
          <div class="search-type-tabs">
            <button
              v-for="type in searchTypes"
              :key="type.value"
              :class="['search-type-tab', { active: localFilters.searchType === type.value }]"
              @click="selectSearchType(type.value)"
            >
              {{ type.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="filter-actions">
        <button @click="clearFilters" class="btn-clear">
          Clear All Filters
        </button>
        <button @click="applyFilters" class="btn-apply">
          Apply Filters
        </button>
      </div>

      <!-- Active Filters Display -->
      <div v-if="hasActiveFilters" class="active-filters">
        <div class="active-filters-title">Active Filters:</div>
        <div class="filter-tags">
          <span v-if="localFilters.genre" class="filter-tag">
            Genre: {{ getGenreName(localFilters.genre) }}
            <button @click="removeFilter('genre')" class="remove-filter-btn">&times;</button>
          </span>
          <span v-if="localFilters.yearFrom || localFilters.yearTo" class="filter-tag">
            Year: {{ formatYearRange() }}
            <button @click="removeFilter('year')" class="remove-filter-btn">&times;</button>
          </span>
          <span v-if="localFilters.minRating > 0" class="filter-tag">
            Rating: {{ localFilters.minRating }}+ ⭐
            <button @click="removeFilter('minRating')" class="remove-filter-btn">&times;</button>
          </span>
          <span v-if="localFilters.sortBy !== 'popularity.desc'" class="filter-tag">
            Sort: {{ getSortLabel(localFilters.sortBy) }}
            <button @click="removeFilter('sortBy')" class="remove-filter-btn">&times;</button>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { tmdbAPI } from '@/utils/tmdb';

export default {
  name: 'AdvancedFilters',
  props: {
    filters: {
      type: Object,
      default: () => ({
        genre: '',
        yearFrom: '',
        yearTo: '',
        minRating: 0,
        sortBy: 'popularity.desc',
        searchType: 'all'
      })
    },
    showByDefault: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:filters', 'apply'],
  data() {
    return {
      showFilters: this.showByDefault,
      localFilters: { ...this.filters },
      genres: [],
      currentYear: new Date().getFullYear(),
      searchTypes: [
        { value: 'all', label: 'All Movies' },
        { value: 'title', label: 'By Title' },
        { value: 'person', label: 'By Actor/Director' }
      ]
    }
  },
  computed: {
    hasActiveFilters() {
      return (
        this.localFilters.genre ||
        this.localFilters.yearFrom ||
        this.localFilters.yearTo ||
        this.localFilters.minRating > 0 ||
        this.localFilters.sortBy !== 'popularity.desc'
      );
    }
  },
  async created() {
    await this.loadGenres();
  },
  watch: {
    filters: {
      deep: true,
      handler(newFilters) {
        this.localFilters = { ...newFilters };
      }
    }
  },
  methods: {
    async loadGenres() {
      try {
        const data = await tmdbAPI.getGenres();
        this.genres = data.genres || [];
      } catch (error) {
        console.error('Error loading genres:', error);
        this.genres = [];
      }
    },

    toggleFilters() {
      this.showFilters = !this.showFilters;
    },

    onFilterChange() {
      this.$emit('update:filters', { ...this.localFilters });
    },

    selectSearchType(type) {
      this.localFilters.searchType = type;
      this.onFilterChange();
    },

    applyFilters() {
      this.$emit('apply', { ...this.localFilters });
    },

    clearFilters() {
      this.localFilters = {
        genre: '',
        yearFrom: '',
        yearTo: '',
        minRating: 0,
        sortBy: 'popularity.desc',
        searchType: 'all'
      };
      this.onFilterChange();
      this.applyFilters();
    },

    removeFilter(filterName) {
      switch (filterName) {
        case 'genre':
          this.localFilters.genre = '';
          break;
        case 'year':
          this.localFilters.yearFrom = '';
          this.localFilters.yearTo = '';
          break;
        case 'minRating':
          this.localFilters.minRating = 0;
          break;
        case 'sortBy':
          this.localFilters.sortBy = 'popularity.desc';
          break;
      }
      this.onFilterChange();
      this.applyFilters();
    },

    getGenreName(genreId) {
      const genre = this.genres.find(g => g.id == genreId);
      return genre ? genre.name : '';
    },

    formatYearRange() {
      if (this.localFilters.yearFrom && this.localFilters.yearTo) {
        return `${this.localFilters.yearFrom}-${this.localFilters.yearTo}`;
      } else if (this.localFilters.yearFrom) {
        return `From ${this.localFilters.yearFrom}`;
      } else if (this.localFilters.yearTo) {
        return `Until ${this.localFilters.yearTo}`;
      }
      return '';
    },

    getSortLabel(sortBy) {
      const sortLabels = {
        'popularity.desc': 'Most Popular',
        'popularity.asc': 'Least Popular',
        'vote_average.desc': 'Highest Rated',
        'vote_average.asc': 'Lowest Rated',
        'release_date.desc': 'Newest First',
        'release_date.asc': 'Oldest First',
        'title.asc': 'A-Z',
        'title.desc': 'Z-A'
      };
      return sortLabels[sortBy] || sortBy;
    }
  }
}
</script>

<style src="@/styles/advanced-filters.scss" lang="scss" scoped></style>
 