'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { searchMulti, fetchMoviesWithFilters, imageUrl, GENRES } from '@/lib/tmdb';
import FilterBar from '@/components/FilterBar';
import Link from 'next/link';
import { FaArrowLeft, FaTimes } from 'react-icons/fa';

export default function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const genreFilter = searchParams.get('genre') || '';
  const yearFilter = searchParams.get('year') || '';
  const ratingFilter = searchParams.get('rating') || '';

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hasFilters = genreFilter || yearFilter || ratingFilter;

    if (!query && !hasFilters) {
      setResults([]);
      return;
    }

    setLoading(true);

    if (hasFilters) {
      // Use discover endpoint with filters
      const params = {};
      if (genreFilter) params.with_genres = genreFilter;
      if (yearFilter) params.primary_release_year = yearFilter;
      if (ratingFilter) params['vote_average.gte'] = ratingFilter;
      if (query) params.with_text = query;
      params.sort_by = 'popularity.desc';

      fetchMoviesWithFilters(params)
        .then((data) => {
          setResults(data || []);
          setLoading(false);
        })
        .catch(() => {
          setResults([]);
          setLoading(false);
        });
    } else {
      // Use search endpoint
      searchMulti(query)
        .then((data) => {
          setResults(data.filter((r) => r.media_type === 'movie' || r.media_type === 'tv'));
          setLoading(false);
        })
        .catch(() => {
          setResults([]);
          setLoading(false);
        });
    }
  }, [query, genreFilter, yearFilter, ratingFilter]);

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
      <p className="text-gray-400 mb-6">{results.length} results found</p>

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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-16">
          {results.map((item) => {
            const href = item.media_type === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`;
            return (
              <Link key={item.id} href={href} className="group relative flex-shrink-0 cursor-pointer">
                <div className="relative overflow-hidden rounded-md transition-all duration-300 group-hover:scale-110 group-hover:z-30 group-hover:ring-4 group-hover:ring-red-600">
                  {item.poster_path ? (
                    <img
                      src={imageUrl(item.poster_path, 'w500')}
                      alt={item.title || item.name}
                      className="w-full h-64 object-cover"
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
      )}
    </div>
  );
}
