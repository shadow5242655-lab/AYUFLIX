'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { imageUrl, GENRES } from '@/lib/tmdb';
import FilterBar from '@/components/FilterBar';
import Link from 'next/link';
import { FaArrowLeft, FaTimes } from 'react-icons/fa';

const TMDB_TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0N2JlOGMwNTEyZjIzN2MyODI3ZTljZjU0ZDQxYWU5YSIsIm5iZiI6MTc4ODE4OTM5MC4zMTcsInN1YiI6IjZhOTU5YWNlZDUyNTYxZTRkZGZhYzVlMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.0UEOr2dEgEaR-aQQlmgjDo3wlooBIoGoxMnNBOqiCUY';

async function fetchTmdbPage(path, params) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`https://api.themoviedb.org/3${path}?${qs}`, {
    headers: { Authorization: `Bearer ${TMDB_TOKEN}` },
  });
  if (!res.ok) throw new Error('TMDB error');
  return res.json();
}

export default function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const genreFilter = searchParams.get('genre') || '';
  const yearFilter = searchParams.get('year') || '';
  const ratingFilter = searchParams.get('rating') || '';

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const hasFilters = Boolean(genreFilter || yearFilter || ratingFilter);

  // Reset + fetch page 1 whenever query/filters change
  useEffect(() => {
    const filters = genreFilter || yearFilter || ratingFilter;

    if (!query && !filters) {
      setResults([]);
      setTotalPages(1);
      setPage(1);
      return;
    }

    setLoading(true);
    setPage(1);

    if (filters) {
      const params = { page: 1, sort_by: 'popularity.desc' };
      if (genreFilter) params.with_genres = genreFilter;
      if (yearFilter) params.primary_release_year = yearFilter;
      if (ratingFilter) params['vote_average.gte'] = ratingFilter;
      if (query) params.with_text = query;

      fetchTmdbPage('/discover/movie', params)
        .then((data) => {
          setResults(data.results || []);
          setTotalPages(Math.min(data.total_pages || 1, 500));
          setLoading(false);
        })
        .catch(() => {
          setResults([]);
          setLoading(false);
        });
    } else {
      fetchTmdbPage('/search/multi', { query, page: 1, include_adult: false })
        .then((data) => {
          setResults((data.results || []).filter((r) => r.media_type === 'movie' || r.media_type === 'tv'));
          setTotalPages(Math.min(data.total_pages || 1, 500));
          setLoading(false);
        })
        .catch(() => {
          setResults([]);
          setLoading(false);
        });
    }
  }, [query, genreFilter, yearFilter, ratingFilter]);

  const loadMore = useCallback(() => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    const next = page + 1;

    if (hasFilters) {
      const params = { page: next, sort_by: 'popularity.desc' };
      if (genreFilter) params.with_genres = genreFilter;
      if (yearFilter) params.primary_release_year = yearFilter;
      if (ratingFilter) params['vote_average.gte'] = ratingFilter;
      if (query) params.with_text = query;

      fetchTmdbPage('/discover/movie', params)
        .then((data) => {
          setResults((prev) => [...prev, ...(data.results || [])]);
          setPage(next);
        })
        .catch(() => {})
        .finally(() => setLoadingMore(false));
    } else {
      fetchTmdbPage('/search/multi', { query, page: next, include_adult: false })
        .then((data) => {
          setResults((prev) => [
            ...prev,
            ...(data.results || []).filter((r) => r.media_type === 'movie' || r.media_type === 'tv'),
          ]);
          setPage(next);
        })
        .catch(() => {})
        .finally(() => setLoadingMore(false));
    }
  }, [loadingMore, page, totalPages, hasFilters, genreFilter, yearFilter, ratingFilter, query]);

  const updateFilters = (filters) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (filters.genre) params.set('genre', filters.genre);
    if (filters.year) params.set('year', filters.year);
    if (filters.rating) params.set('rating', filters.rating);
    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    } else {
      router.push('/search');
    }
  };

  const removeFilter = (filterType) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (filterType !== 'genre' && genreFilter) params.set('genre', genreFilter);
    if (filterType !== 'year' && yearFilter) params.set('year', yearFilter);
    if (filterType !== 'rating' && ratingFilter) params.set('rating', ratingFilter);
    router.push(`/search?${params.toString()}`);
  };

  const activeFilters = [];
  if (genreFilter) activeFilters.push({ type: 'genre', label: GENRES[genreFilter] || 'Genre' });
  if (yearFilter) activeFilters.push({ type: 'year', label: yearFilter });
  if (ratingFilter) activeFilters.push({ type: 'rating', label: `${ratingFilter}+` });

  return (
    <div className="min-h-screen bg-ayu-black px-4 md:px-8 pt-8">
      <Link href="/" className="inline-flex items-center gap-2 text-white hover:text-red-500 transition-colors mb-6">
        <FaArrowLeft /> Back
      </Link>

      <h1 className="text-3xl font-bold text-white mb-2">
        {query ? `Search Results for "${query}"` : 'Browse Movies'}
      </h1>
      <p className="text-gray-400 mb-6">{results.length} results loaded</p>

      {/* Filter Bar */}
      <FilterBar
        onApply={updateFilters}
        onClear={clearFilters}
        initialFilters={{
          genre: genreFilter,
          year: yearFilter,
          rating: ratingFilter,
        }}
      />

      {/* Active Filter Badges */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {activeFilters.map((filter) => (
            <span
              key={filter.type}
              className="bg-red-600 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5"
            >
              {filter.label}
              <button
                onClick={() => removeFilter(filter.type)}
                className="hover:bg-red-700 rounded-full p-0.5 transition-colors"
              >
                <FaTimes size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-20">
          {query || activeFilters.length > 0 ? (
            <p className="text-red-400 text-lg">❌ No movies found matching your filters. Try adjusting your criteria.</p>
          ) : (
            <p className="text-gray-400 text-lg">Search for movies or apply filters to browse.</p>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-8">
            {results.map((item, i) => {
              const href = item.media_type === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`;
              return (
                <Link key={`${item.media_type}-${item.id}-${i}`} href={href} className="group relative flex-shrink-0 cursor-pointer">
                  <div className="relative overflow-hidden rounded-md transition-all duration-300 group-hover:scale-110 group-hover:z-30 group-hover:ring-4 group-hover:ring-red-600">
                    {item.poster_path ? (
                      <img
                        src={imageUrl(item.poster_path, 'w500')}
                        alt={item.title || item.name}
                        className="w-full h-64 object-cover"
                        loading={i < 12 ? 'eager' : 'lazy'}
                      />
                    ) : (
                      <div className="w-full h-64 bg-gray-800 flex items-center justify-center text-gray-500">
                        No Image
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                      {item.media_type === 'tv' ? 'TV' : 'Movie'}
                    </div>
                    {item.vote_average > 0 && (
                      <div className="absolute top-2 right-2 bg-black/80 text-yellow-400 text-xs font-bold px-2 py-0.5 rounded">
                        ⭐ {item.vote_average.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <h3 className="text-white text-sm mt-2 truncate group-hover:text-red-400 transition-colors">
                    {item.title || item.name}
                  </h3>
                </Link>
              );
            })}
          </div>

          {/* Load more */}
          {page < totalPages && (
            <div className="flex justify-center pb-16">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-medium px-8 py-3 rounded-lg transition-all flex items-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </>
                ) : (
                  `Load More (page ${page + 1} of ${totalPages})`
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
