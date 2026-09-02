const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

const fetchFromApi = async (path, params = {}) => {
  const searchParams = new URLSearchParams(params);
  const url = `/api/tmdb${path}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.results || data;
};

export const imageUrl = (path, size = 'w500') => `${TMDB_IMAGE_BASE}/${size}${path}`;

export const getTrending = () => fetchFromApi('/trending/movie/week');

export const getTopRated = () => fetchFromApi('/movie/top_rated');

export const getNowPlaying = () => fetchFromApi('/movie/now_playing');

export const getPopular = () => fetchFromApi('/movie/popular');

export const getMoviesByGenre = (genreId) =>
  fetchFromApi('/discover/movie', { with_genres: genreId });

export const getTvTrending = () => fetchFromApi('/trending/tv/week');

export const getTopRatedTv = () => fetchFromApi('/tv/top_rated');

export const getPopularTv = () => fetchFromApi('/tv/popular');

export const getTvByGenre = (genreId) =>
  fetchFromApi('/discover/tv', { with_genres: genreId });

export const getMovieDetails = (id) => fetchFromApi(`/movie/${id}`);

export const getMoviesByIds = async (ids) => {
  const movies = await Promise.all(
    ids.map((id) => getMovieDetails(id).catch(() => null))
  );
  return movies.filter(Boolean);
};

export const getTvDetails = (id) => fetchFromApi(`/tv/${id}`);

export const getMovieCredits = (id) => fetchFromApi(`/movie/${id}/credits`);

export const getTvCredits = (id) => fetchFromApi(`/tv/${id}/credits`);

export const getSimilarMovies = (id) => fetchFromApi(`/movie/${id}/similar`);

export const getSimilarTv = (id) => fetchFromApi(`/tv/${id}/similar`);

export const searchMulti = (query) => fetchFromApi('/search/multi', { query });

export const fetchTrailer = async (mediaId, type = 'movie') => {
  try {
    const results = await fetchFromApi(`/${type}/${mediaId}/videos`);
    // Find first YouTube trailer
    const trailer = results.find(
      (v) => v.type === 'Trailer' && v.site === 'YouTube'
    );
    // If no trailer, try to find any YouTube video
    const video = trailer || results.find((v) => v.site === 'YouTube');
    return video?.key || null;
  } catch (error) {
    console.error('Error fetching trailer:', error);
    return null;
  }
};

export const fetchGenres = () => fetchFromApi('/genre/movie/list');

export const fetchMoviesWithFilters = (params = {}) => {
  return fetchFromApi('/discover/movie', params);
};

export const fetchImdbId = async (tmdbId, type = 'movie') => {
  try {
    const data = await fetchFromApi(`/${type}/${tmdbId}`);
    return data.imdb_id || null;
  } catch (error) {
    console.error('Error fetching IMDB ID:', error);
    return null;
  }
};

export const GENRES = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};
