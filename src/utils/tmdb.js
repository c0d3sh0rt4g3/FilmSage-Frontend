const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

function getApiKey() {
  const apiKey = import.meta.env.VITE_MOVIEDB_API_KEY;
  if (!apiKey) {
    console.error('TMDB API key is not available:', {
      envKeys: Object.keys(import.meta.env),
      hasMovieDBKey: 'VITE_MOVIEDB_API_KEY' in import.meta.env
    });
    throw new Error('TMDB API key is not configured');
  }
  return apiKey;
}

async function fetchFromTMDB(endpoint, params = {}) {
  try {
    const apiKey = getApiKey();
    const queryParams = new URLSearchParams({
      api_key: apiKey,
      language: 'en-US',
      ...params
    });

    const url = `${TMDB_BASE_URL}${endpoint}?${queryParams}`;
    console.log('Fetching from TMDB:', url.replace(apiKey, 'API_KEY'));

    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `TMDB API Error: ${response.status}${errorData.status_message ? ` - ${errorData.status_message}` : ''}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('TMDB API Error:', error);
    throw error;
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

    return {
      id: data.id,
      imdbID: data.imdb_id,
      Title: data.title,
      Year: data.release_date ? data.release_date.split('-')[0] : 'N/A',
      Poster: data.poster_path ? `${TMDB_IMAGE_BASE_URL}${data.poster_path}` : '/images/placeholder-movie.jpg',
      imdbRating: data.vote_average ? data.vote_average.toFixed(1) : 'N/A',
      Genre: data.genres ? data.genres.map(g => g.name).join(', ') : 'N/A',
      Plot: data.overview || 'No description available',
      Director: data.credits?.crew?.find(c => c.job === 'Director')?.name || 'N/A',
      Actors: data.credits?.cast?.slice(0, 3).map(a => a.name).join(', ') || 'N/A',
      Runtime: data.runtime ? `${data.runtime} min` : 'N/A',
      Language: data.original_language?.toUpperCase() || 'N/A'
    };
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