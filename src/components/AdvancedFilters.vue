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
          </span>
          <span v-if="localFilters.yearFrom || localFilters.yearTo" class="filter-tag">
            Year: {{ formatYearRange() }}
          </span>
          <span v-if="localFilters.minRating > 0" class="filter-tag">
            Rating: {{ localFilters.minRating }}+ ⭐
          </span>
          <span v-if="localFilters.sortBy !== 'popularity.desc'" class="filter-tag">
            Sort: {{ getSortLabel(localFilters.sortBy) }}
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

<style lang="scss" scoped>
.advanced-filters {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  h3 {
    color: white;
    font-weight: 600;
    margin: 0;
    font-size: 1.3rem;
  }

  .toggle-btn {
    background: linear-gradient(45deg, #ff6b6b, #feca57);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    cursor: pointer;
    font-weight: 500;
    font-size: 0.9rem;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
    }
  }
}

.filters-content {
  .filters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .filter-group {
    .filter-label {
      display: block;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
      margin-bottom: 8px;
      font-size: 0.95rem;
    }

    .filter-select,
    .filter-input {
      width: 100%;
      padding: 12px 16px;
      border-radius: 12px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      background: rgba(255, 255, 255, 0.1);
      color: white;
      font-size: 0.95rem;
      backdrop-filter: blur(5px);
      transition: all 0.3s ease;

      &:focus {
        outline: none;
        border-color: #ff6b6b;
        background: rgba(255, 255, 255, 0.15);
      }

      &::placeholder {
        color: rgba(255, 255, 255, 0.6);
      }

      option {
        background: #2d1b69;
        color: white;
      }
    }

    .year-inputs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .rating-container {
      .rating-value {
        color: #feca57;
        font-weight: 600;
        font-size: 1.1rem;
        margin-bottom: 8px;
        text-align: center;
        display: block;
      }

      .rating-slider {
        width: 100%;
        height: 6px;
        border-radius: 3px;
        background: rgba(255, 255, 255, 0.2);
        outline: none;
        -webkit-appearance: none;

        &::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #ff6b6b, #feca57);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
        }

        &::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #ff6b6b, #feca57);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
        }
      }
    }

    .search-type-tabs {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;

      .search-type-tab {
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.8);
        border: 2px solid rgba(255, 255, 255, 0.2);
        padding: 8px 16px;
        border-radius: 15px;
        cursor: pointer;
        font-size: 0.85rem;
        font-weight: 500;
        transition: all 0.3s ease;
        flex: 1;
        text-align: center;

        &:hover {
          background: rgba(255, 255, 255, 0.15);
          color: white;
        }

        &.active {
          background: linear-gradient(45deg, #ff6b6b, #feca57);
          color: white;
          border-color: transparent;
          box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
        }
      }
    }
  }
}

.filter-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;

  .btn-apply {
    background: linear-gradient(45deg, #ff6b6b, #feca57);
    color: white;
    border: none;
    padding: 12px 30px;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 120px;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
  }

  .btn-clear {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    padding: 12px 30px;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 120px;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.5);
      transform: translateY(-2px);
    }
  }
}

.active-filters {
  .active-filters-title {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
    margin-bottom: 8px;
    font-weight: 500;
  }

  .filter-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .filter-tag {
      background: rgba(255, 107, 107, 0.2);
      color: white;
      padding: 6px 12px;
      border-radius: 15px;
      font-size: 0.85rem;
      font-weight: 500;
      border: 1px solid rgba(255, 107, 107, 0.3);
    }
  }
}

// Responsive Design
@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }

  .filter-actions {
    flex-direction: column;
    align-items: stretch;

    .btn-clear,
    .btn-apply {
      min-width: auto;
    }
  }

  .search-type-tabs {
    .search-type-tab {
      font-size: 0.8rem;
      padding: 6px 12px;
    }
  }
}
</style> 