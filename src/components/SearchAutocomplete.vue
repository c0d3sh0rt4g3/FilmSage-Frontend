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
  },

  beforeUnmount() {
    // Cleanup debounce timeout to prevent memory leaks
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = null;
    }
  }
}
</script>

<style src="@/styles/search-autocomplete.scss" lang="scss" scoped></style> 