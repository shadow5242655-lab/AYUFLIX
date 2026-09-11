'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { imageUrl } from '@/lib/tmdb';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

const TMDB_TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0N2JlOGMwNTEyZjIzN2MyODI3ZTljZjU0ZDQxYWU5YSIsIm5iZiI6MTc4ODE4OTM5MC4zMTcsInN1YiI6IjZhOTU5YWNlZDUyNTYxZTRkZGZhYzVlMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.0UEOr2dEgEaR-aQQlmgjDo3wlooBIoGoxMnNBOqiCUY';

const SORTS = [
  { value: 'popularity.desc', label: '🔥 Most Popular' },
  { value: 'vote_average.desc', label: '⭐ Top Rated' },
  { value: 'primary_release_date.desc', label: '🆕 Newest' },
  { value: 'revenue.desc', label: '💰 Biggest Hits' },
];

const GENRE_CHIPS = [
  { id: '', name: 'All' },
  { id: 28, name: 'Action' },
  { id: 35, name: 'Comedy' },
  { id: 27, name: 'Horror' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 16, name: 'Animation' },
  { id: 53, name: 'Thriller' },
  { id: 80, name: 'Crime' },
  { id: 18, name: 'Drama' },
  { id: 12, name: 'Adventure' },
  { id: 99, name: 'Documentary' },
];

export default function BrowsePage() {
  const { type } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isTv = type === 'tv';

  const [genre, setGenre] = useState(searchParams.get('genre') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'popularity.desc');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Reset state when switching between /browse/movie and /browse/tv
  useEffect(() => {
    setGenre(searchParams.get('genre') || '');
    setSort(searchParams.get('sort') || 'popularity.desc');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTv]);

  const fetchPage = useCallback(
    (pageNum, append) => {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const sortBy = isTv && sort === 'revenue.desc' ? 'popularity.desc' : sort;
      // TV uses first_air_date instead of primary_release_date
      const finalSort = isTv && sortBy === 'primary_release_date.desc' ? 'first_air_date.desc' : sortBy;

      const params = new URLSearchParams({
        page: String(pageNum),
        sort_by: finalSort,
        include_adult: 'false',
        'vote_count.gte': sortBy === 'vote_average.desc' ? '300' : '50',
      });
      if (genre) params.set('with_genres', genre);

      fetch(`https://api.themoviedb.org/3/discover/${isTv ? 'tv' : 'movie'}?${params}`, {
        headers: { Authorization: `Bearer ${TMDB_TOKEN}` },
      })
        .then((r) => r.json())
        .then((data) => {
          setItems((prev) => (append ? [...prev, ...(data.results || [])] : data.results || []));
          setTotalPages(Math.min(data.total_pages || 1, 500));
          setPage(pageNum);
        })
        .catch(() => {
          if (!append) setItems([]);
        })
        .finally(() => {
          setLoading(false);
          setLoadingMore(false);
        });
    },
    [isTv, sort, genre]
  );

  useEffect(() => {
    fetchPage(1, false);
  }, [fetchPage]);

  const updateUrl = (g, s) => {
    const params = new URLSearchParams();
    if (g) params.set('genre', g);
    if (s && s !== 'popularity.desc') params.set('sort', s);
    const qs = params.toString();
    router.replace(qs ? `/browse/${type}?${qs}` : `/browse/${type}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-ayu-black px-4 md:px-8 pt-8">
      <Link href="/" className="inline-flex items-center gap-2 text-white hover:text-red-500 transition-colors mb-6">
        <FaArrowLeft /> Back
      </Link>

      <h1 className="text-3xl font-bold text-white mb-6">{isTv ? 'TV Shows' : 'Movies'}</h1>

      {/* Sort selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {SORTS.map((s) => {
          const disabled = isTv && s.value === 'revenue.desc';
          const active = sort === s.value;
          return (
            <button
              key={s.value}
              disabled={disabled}
              onClick={() => {
                setSort(s.value);
                updateUrl(genre, s.value);
              }}
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                active ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Genre chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {GENRE_CHIPS.map((g) => (
          <button
            key={g.id || 'all'}
            onClick={() => {
              setGenre(String(g.id));
              updateUrl(String(g.id), sort);
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              genre === String(g.id)
                ? 'bg-red-600 text-white'
                : 'bg-gray-900 border border-gray-800 text-gray-400 hover:border-red-600/50 hover:text-white'
            }`}
          >
            {g.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-8">
            {items.map((item, i) => (
              <Link key={`${item.id}-${i}`} href={`/${isTv ? 'tv' : 'movie'}/${item.id}`} className="group relative flex-shrink-0">
                <div className="relative overflow-hidden rounded-md transition-all duration-300 group-hover:scale-110 group-hover:z-30 group-hover:ring-4 group-hover:ring-red-600">
                  {item.poster_path ? (
                    <img
                      src={imageUrl(item.poster_path, 'w500')}
                      alt={item.title || item.name}
                      className="w-full h-64 object-cover"
                      loading={i < 12 ? 'eager' : 'lazy'}
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-800 flex items-center justify-center text-gray-500">No Image</div>
                  )}
                  <div className="absolute top-2 right-2 bg-black/80 text-yellow-400 text-xs font-bold px-2 py-0.5 rounded">
                    ⭐ {item.vote_average?.toFixed(1)}
                  </div>
                </div>
                <h3 className="text-white text-sm mt-2 truncate group-hover:text-red-400 transition-colors">
                  {item.title || item.name}
                </h3>
              </Link>
            ))}
          </div>

          {page < totalPages && (
            <div className="flex justify-center pb-16">
              <button
                onClick={() => fetchPage(page + 1, true)}
                disabled={loadingMore}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-medium px-8 py-3 rounded-lg transition-all flex items-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
