// Utility functions for managing favorites in localStorage

const FAVORITES_KEY = 'filmsage_favorites';

/**
 * Get all favorites from localStorage
 * @returns {Array} Array of favorite movie objects
 */
export function getFavoritesFromStorage() {
  try {
    const favorites = localStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Error reading favorites from localStorage:', error);
    return [];
  }
}

/**
 * Save favorites to localStorage
 * @param {Array} favorites - Array of favorite movie objects
 */
export function saveFavoritesToStorage(favorites) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Error saving favorites to localStorage:', error);
  }
}

/**
 * Check if a movie is in favorites
 * @param {number|string} movieId - TMDB movie ID
 * @returns {boolean} True if movie is in favorites
 */
export function isMovieInFavorites(movieId) {
  const favorites = getFavoritesFromStorage();
  const id = parseInt(movieId, 10);
  return favorites.some(favorite => parseInt(favorite.tmdb_id, 10) === id);
}

/**
 * Add a movie to favorites in localStorage
 * @param {number|string} movieId - TMDB movie ID
 * @param {Object} movieData - Optional movie data for better UX
 */
export function addToFavoritesStorage(movieId, movieData = {}) {
  const favorites = getFavoritesFromStorage();
  const id = parseInt(movieId, 10);
  
  // Check if already exists
  if (!favorites.some(favorite => parseInt(favorite.tmdb_id, 10) === id)) {
    const favoriteItem = {
      tmdb_id: id,
      content_type: 'movie',
      added_at: new Date().toISOString(),
      ...movieData
    };
    
    favorites.push(favoriteItem);
    saveFavoritesToStorage(favorites);
  }
}

/**
 * Remove a movie from favorites in localStorage
 * @param {number|string} movieId - TMDB movie ID
 */
export function removeFromFavoritesStorage(movieId) {
  const favorites = getFavoritesFromStorage();
  const id = parseInt(movieId, 10);
  
  const updatedFavorites = favorites.filter(
    favorite => parseInt(favorite.tmdb_id, 10) !== id
  );
  
  saveFavoritesToStorage(updatedFavorites);
}

/**
 * Sync localStorage favorites with server favorites
 * @param {Array} serverFavorites - Favorites from server API
 */
export function syncFavoritesWithServer(serverFavorites) {
  if (Array.isArray(serverFavorites)) {
    const localFavorites = serverFavorites.map(item => ({
      tmdb_id: parseInt(item.tmdb_id, 10),
      content_type: item.content_type || 'movie',
      added_at: item.created_at || item.added_at || new Date().toISOString(),
      title: item.title,
      poster_path: item.poster_path
    }));
    
    saveFavoritesToStorage(localFavorites);
  }
}

/**
 * Clear all favorites from localStorage
 */
export function clearFavoritesStorage() {
  try {
    localStorage.removeItem(FAVORITES_KEY);
  } catch (error) {
    console.error('Error clearing favorites from localStorage:', error);
  }
}

/**
 * Get favorites count from localStorage
 * @returns {number} Number of favorites
 */
export function getFavoritesCount() {
  const favorites = getFavoritesFromStorage();
  return favorites.length;
} 