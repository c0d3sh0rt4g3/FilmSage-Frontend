<template>
  <div class="search-autocomplete" ref="autocompleteContainer">
    <div class="search-input-container">
      <input
        ref="searchInput"
        v-model="localQuery"
        @input="handleInput"
        @keydown="handleKeydown"
        @focus="showSuggestions = true"
        @blur="handleBlur"
        :placeholder="placeholder"
        :disabled="disabled"
        class="search-input"
        autocomplete="off"
      />
      <div class="search-input-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
      </div>
    </div>

    <div 
      v-if="showSuggestions && (suggestions.length > 0 || loading || error)"
      class="suggestions-dropdown"
    >
      <!-- Loading state -->
      <div v-if="loading" class="suggestion-item loading">
        <div class="suggestion-spinner"></div>
        <span>Searching...</span>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="suggestion-item error">
        <span>{{ error }}</span>
      </div>

      <!-- No results -->
      <div v-else-if="suggestions.length === 0 && localQuery.length > 1" class="suggestion-item no-results">
        <span>No results found for "{{ localQuery }}"</span>
      </div>

      <!-- Suggestions -->
      <div
        v-for="(suggestion, index) in suggestions"
        :key="`${suggestion.type}-${suggestion.id}`"
        :class="['suggestion-item', { active: index === selectedIndex }]"
        @mousedown.prevent="selectSuggestion(suggestion)"
        @mouseenter="selectedIndex = index"
      >
        <div class="suggestion-poster">
          <img
            :src="getSuggestionImage(suggestion)"
            :alt="suggestion.title"
            @error="handleImageError"
          />
        </div>
        <div class="suggestion-content">
          <div class="suggestion-title">{{ suggestion.title }}</div>
          <div class="suggestion-meta">
            <span class="suggestion-type">{{ getSuggestionTypeLabel(suggestion.type) }}</span>
            <span v-if="suggestion.year" class="suggestion-year">{{ suggestion.year }}</span>
            <span v-if="suggestion.subtitle" class="suggestion-subtitle">{{ suggestion.subtitle }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { tmdbAPI } from '@/utils/tmdb';

export default {
  name: 'SearchAutocomplete',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: 'Search movies, actors, directors...'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    debounceMs: {
      type: Number,
      default: 300
    }
  },
  emits: ['update:modelValue', 'select', 'search'],
  data() {
    return {
      localQuery: this.modelValue,
      suggestions: [],
      showSuggestions: false,
      loading: false,
      error: null,
      selectedIndex: -1,
      debounceTimeout: null
    }
  },
  watch: {
    modelValue(newValue) {
      this.localQuery = newValue;
    },
    localQuery(newValue) {
      this.$emit('update:modelValue', newValue);
    }
  },
  methods: {
    handleInput() {
      this.selectedIndex = -1;
      
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }

      if (this.localQuery.length < 2) {
        this.suggestions = [];
        this.showSuggestions = false;
        return;
      }

      this.debounceTimeout = setTimeout(() => {
        this.fetchSuggestions();
      }, this.debounceMs);
    },

    async fetchSuggestions() {
      if (this.localQuery.length < 2) return;

      this.loading = true;
      this.error = null;

      try {
        const suggestions = await tmdbAPI.getSearchSuggestions(this.localQuery, 6);
        this.suggestions = suggestions;
        this.showSuggestions = true;
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        this.error = 'Error loading suggestions';
        this.suggestions = [];
      } finally {
        this.loading = false;
      }
    },

    handleKeydown(event) {
      if (!this.showSuggestions || this.suggestions.length === 0) {
        if (event.key === 'Enter') {
          this.handleSearch();
        }
        return;
      }

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          this.selectedIndex = Math.min(this.selectedIndex + 1, this.suggestions.length - 1);
          break;
        case 'ArrowUp':
          event.preventDefault();
          this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
          break;
        case 'Enter':
          event.preventDefault();
          if (this.selectedIndex >= 0 && this.selectedIndex < this.suggestions.length) {
            this.selectSuggestion(this.suggestions[this.selectedIndex]);
          } else {
            this.handleSearch();
          }
          break;
        case 'Escape':
          this.showSuggestions = false;
          this.selectedIndex = -1;
          this.$refs.searchInput.blur();
          break;
      }
    },

    handleBlur() {
      // Delay hiding to allow for click events on suggestions
      setTimeout(() => {
        this.showSuggestions = false;
        this.selectedIndex = -1;
      }, 150);
    },

    selectSuggestion(suggestion) {
      this.localQuery = suggestion.title;
      this.showSuggestions = false;
      this.selectedIndex = -1;
      this.$emit('select', suggestion);
    },

    handleSearch() {
      this.showSuggestions = false;
      this.selectedIndex = -1;
      this.$emit('search', this.localQuery);
    },

    getSuggestionImage(suggestion) {
      if (suggestion.type === 'person') {
        return tmdbAPI.getProfileImageUrl(suggestion.poster);
      }
      return tmdbAPI.getImageUrl(suggestion.poster);
    },

    getSuggestionTypeLabel(type) {
      const labels = {
        movie: 'Movie',
        person: 'Person',
        tv: 'TV Show'
      };
      return labels[type] || 'Unknown';
    },

    handleImageError(event) {
      event.target.src = '/images/placeholder-movie.jpg';
    },

    focus() {
      this.$refs.searchInput.focus();
    },

    clear() {
      this.localQuery = '';
      this.suggestions = [];
      this.showSuggestions = false;
      this.selectedIndex = -1;
    }
  }
}
</script>

<style lang="scss" scoped>
.search-autocomplete {
  position: relative;
  width: 100%;
}

.search-input-container {
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 1.2rem 45px 1.2rem 1.5rem;
  border-radius: 25px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1.1rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #fbbf24;
    background: rgba(255, 255, 255, 0.2);
  }

  &:disabled {
    background: rgba(255, 255, 255, 0.05);
    cursor: not-allowed;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
}

.search-input-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  pointer-events: none;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 400px;
  overflow-y: auto;
  margin-top: 4px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }

  &:hover,
  &.active {
    background-color: #f8fafc;
  }

  &.loading,
  &.error,
  &.no-results {
    justify-content: center;
    color: #6b7280;
    cursor: default;

    &:hover {
      background-color: transparent;
    }
  }

  &.error {
    color: #ef4444;
  }
}

.suggestion-poster {
  width: 40px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  margin-right: 12px;
  flex-shrink: 0;
  background: #f3f4f6;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.suggestion-content {
  flex: 1;
  min-width: 0;
}

.suggestion-title {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.suggestion-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
}

.suggestion-type {
  background: #e5e7eb;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.suggestion-year,
.suggestion-subtitle {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.suggestion-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// Dark mode support
@media (prefers-color-scheme: dark) {
  .search-input {
    background: #1f2937;
    border-color: #374151;
    color: #f9fafb;

    &:focus {
      border-color: #6366f1;
    }

    &::placeholder {
      color: #9ca3af;
    }
  }

  .suggestions-dropdown {
    background: #1f2937;
    border-color: #374151;
  }

  .suggestion-item {
    border-color: #374151;

    &:hover,
    &.active {
      background-color: #374151;
    }
  }

  .suggestion-title {
    color: #f9fafb;
  }

  .suggestion-meta {
    color: #9ca3af;
  }

  .suggestion-type {
    background: #374151;
    color: #f9fafb;
  }
}
</style> 