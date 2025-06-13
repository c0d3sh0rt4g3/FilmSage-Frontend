/**
 * TMDB (The Movie Database) API utility functions
 * Provides interface for movie search, details, and discovery
 */
import { tmdbClient } from './axios';

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

/**
 * Generic function to fetch data from TMDB API
 * @param {string} endpoint - API endpoint to call
 * @param {object} params - Query parameters
 * @returns {Promise<object>} API response data
 */
async function fetchFromTMDB(endpoint, params = {}) {
  try {
    const response = await tmdbClient.get(endpoint, {
      params: params
    });

    return response.data;
  } catch (error) {
    console.error('TMDB API Error:', error);
    
    // Extract error message from axios error
    let errorMessage = error.message;
    if (error.response?.data?.status_message) {
      errorMessage = `TMDB API Error: ${error.response.status} - ${error.response.data.status_message}`;
    } else if (error.response?.status) {
      errorMessage = `TMDB API Error: ${error.response.status}`;
    }
    
    throw new Error(errorMessage);
  }
}

/**
 * TMDB API functions for movie and person searches
 */
export const tmdbAPI = {
  /**
   * Search for movies by title
   * @param {string} query - Search query
   * @param {number} page - Page number (default: 1)
   * @returns {Promise<object>} Search results
   */
  async searchMovies(query, page = 1) {
    return await fetchFromTMDB('/search/movie', { query, page });
  },

  /**
   * Search for people (actors, directors, etc.)
   * @param {string} query - Search query
   * @param {number} page - Page number (default: 1)
   * @returns {Promise<object>} Search results
   */
  async searchPerson(query, page = 1) {
    return await fetchFromTMDB('/search/person', { query, page });
  },

  /**
   * Multi-search across movies, TV shows, and people
   * @param {string} query - Search query
   * @param {number} page - Page number (default: 1)
   * @returns {Promise<object>} Search results
   */
  async searchMulti(query, page = 1) {
    return await fetchFromTMDB('/search/multi', { query, page });
  },

  // Search movies by person name (actor/director)
  async searchMoviesByPerson(personName, page = 1) {
    try {
      // First, search for the person
      const personData = await this.searchPerson(personName, 1);
      
      if (!personData.results || personData.results.length === 0) {
        return { results: [], total_results: 0, total_pages: 0 };
      }

      // Get the first (most relevant) person
      const person = personData.results[0];
      
      // Get movies where this person appears
      return await this.getMoviesByPerson(person.id, page);
    } catch (error) {
      console.error('Error searching movies by person:', error);
      return { results: [], total_results: 0, total_pages: 0 };
    }
  },

  // Enhanced multi-search that includes movies by person
  async searchMoviesAndByPerson(query, page = 1) {
    try {
      const [movieResults, personMovieResults] = await Promise.all([
        this.searchMovies(query, page),
        this.searchMoviesByPerson(query, page)
      ]);

      // Combine and deduplicate results
      const allMovies = [...(movieResults.results || [])];
      const personMovies = personMovieResults.results || [];

      // Add person movies that aren't already in the results
      personMovies.forEach(movie => {
        if (!allMovies.find(m => m.id === movie.id)) {
          allMovies.push(movie);
        }
      });

      return {
        results: allMovies,
        total_results: (movieResults.total_results || 0) + (personMovieResults.total_results || 0),
        total_pages: Math.max(movieResults.total_pages || 1, personMovieResults.total_pages || 1)
      };
    } catch (error) {
      console.error('Error in combined search:', error);
      return await this.searchMovies(query, page); // Fallback to simple movie search
    }
  },

  async discoverMovies(filters = {}) {
    const params = {
      page: filters.page || 1,
      sort_by: filters.sortBy || 'popularity.desc',
      ...filters
    };
    
    // Remove undefined values
    Object.keys(params).forEach(key => 
      params[key] === undefined && delete params[key]
    );
    
    return await fetchFromTMDB('/discover/movie', params);
  },

  async getMoviesByGenre(genreId, page = 1) {
    return await fetchFromTMDB('/discover/movie', {
      with_genres: genreId,
      page,
      sort_by: 'popularity.desc'
    });
  },

  async getMoviesByPerson(personId, page = 1) {
    return await fetchFromTMDB('/discover/movie', {
      with_cast: personId,
      page,
      sort_by: 'popularity.desc'
    });
  },

  async getMoviesByDirector(directorId, page = 1) {
    return await fetchFromTMDB('/discover/movie', {
      with_crew: directorId,
      page,
      sort_by: 'popularity.desc'
    });
  },

  async getGenres() {
    return await fetchFromTMDB('/genre/movie/list');
  },

  async getPersonDetails(personId) {
    return await fetchFromTMDB(`/person/${personId}`, {
      append_to_response: 'movie_credits'
    });
  },

  // Autocomplete suggestions
  async getSearchSuggestions(query, limit = 5) {
    if (!query || query.length < 2) return [];
    
    try {
      const [movieResults, personResults] = await Promise.all([
        this.searchMovies(query, 1),
        this.searchPerson(query, 1)
      ]);

      const suggestions = [];
      
      // Add movie suggestions
      if (movieResults.results) {
        movieResults.results.slice(0, limit).forEach(movie => {
          suggestions.push({
            id: movie.id,
            title: movie.title,
            type: 'movie',
            year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
            poster: movie.poster_path
          });
        });
      }

      // Add person suggestions (actors/directors) but mark them for movie search
      if (personResults.results) {
        personResults.results.slice(0, Math.max(1, limit - suggestions.length)).forEach(person => {
          suggestions.push({
            id: person.id,
            title: person.name,
            type: 'person',
            subtitle: `Movies with ${person.name}`,
            poster: person.profile_path
          });
        });
      }

      return suggestions.slice(0, limit);
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  },

  async getMovieDetails(movieId) {
    const data = await fetchFromTMDB(`/movie/${movieId}`, {
      append_to_response: 'credits,similar'
    });

    // Return the complete TMDB data structure for compatibility with MovieDetail.vue
    return data;
  },

  async getTrendingMovies() {
    return await fetchFromTMDB('/trending/movie/week');
  },

  async getPopularMovies(page = 1) {
    return await fetchFromTMDB('/movie/popular', { page });
  },

  getImageUrl(path) {
    return path ? `${TMDB_IMAGE_BASE_URL}${path}` : '/images/placeholder-movie.jpg';
  },

  getProfileImageUrl(path) {
    return path ? `${TMDB_IMAGE_BASE_URL}${path}` : '/images/placeholder-person.jpg';
  }
}; 