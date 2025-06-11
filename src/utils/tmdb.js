import { tmdbClient } from './axios';

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

async function fetchFromTMDB(endpoint, params = {}) {
  try {
    console.log('Fetching from TMDB:', endpoint);

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

export const tmdbAPI = {
  async searchMovies(query, page = 1) {
    return await fetchFromTMDB('/search/movie', { query, page });
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
  }
}; 