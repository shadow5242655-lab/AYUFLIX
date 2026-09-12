'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getByGenre, GENRES } from '@/lib/tmdb';
import MovieCard from '@/components/MovieCard';
import { FaArrowLeft } from 'react-icons/fa';

const SORTS = [
  { id: 'popularity.desc', label: 'Most Popular' },
  { id: 'vote_average.desc', label: 'Top Rated' },
  { id: 'primary_release_date.desc', label: 'Newest' },
  { id: 'revenue.desc', label: 'Box Office' },
];

const TYPE_GENRES = {
  movie: GENRES,
  tv: {
    10759: 'Action & Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    10762: 'Kids',
    9648: 'Mystery',
    10763: 'News',
    10764: 'Reality',
    10765: 'Sci-Fi & Fantasy',
    10766: 'Soap',
    10767: 'Talk',
    10768: 'War & Politics',
    37: 'Western',
  },
};

export default function GenrePage() {
  const { type } = useParams(); // 'movie' | 'tv'
  const [genreId, setGenreId] = useState(null);
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const genres = TYPE_GENRES[type] || TYPE_GENRES.movie;

  useEffect(() => {
    const first = Object.keys(genres)[0];
    setGenreId(Number(first));
  }, [type]); // eslint-disable-line react-hooks/exhaustive-deps

  const load = useCallback(
    async (reset = false) => {
      if (!genreId) return;
      setLoading(true);
      try {
        const data = await getByGenre(type, genreId, reset ? 1 : page, sortBy);
        const list = Array.isArray(data) ? data : data?.results || [];
        setItems((prev) => (reset ? list : [...prev, ...list]));
        setTotalPages(data?.total_pages || 1);
        if (reset) setPage(1);
      } catch {
        // keep old items
      }
      setLoading(false);
    },
    [type, genreId, page, sortBy]
  );

  useEffect(() => {
    if (genreId) load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genreId, sortBy, type]);

  const genreName = genres[genreId] || 'Genre';

  return (
    <div className="min-h-screen bg-black px-4 md:px-8 py-6">
      <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-red-500 text-sm mb-4 transition-colors">
        <FaArrowLeft size={13} /> Home
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          {genreName} <span className="text-gray-500 text-lg">{type === 'tv' ? 'TV Shows' : 'Movies'}</span>
        </h1>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-red-600"
        >
          {SORTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Genre chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(genres).map(([id, name]) => (
          <button
            key={id}
            onClick={() => setGenreId(Number(id))}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
              genreId === Number(id)
                ? 'bg-red-600 text-white border-red-600'
                : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-red-600/60 hover:text-white'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {items.map((m) => (
          <MovieCard key={`${type}-${m.id}`} movie={{ ...m, media_type: type }} />
        ))}
      </div>

      {loading && <p className="text-gray-500 text-sm text-center py-6">Loading…</p>}
      {!loading && items.length === 0 && (
        <p className="text-gray-500 text-sm text-center py-10">Nothing found in this genre.</p>
      )}

      {page < totalPages && items.length > 0 && (
        <div className="flex justify-center mt-8 mb-4">
          <button
            onClick={() => {
              setPage((p) => p + 1);
              load(false);
            }}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold px-8 py-2.5 rounded-lg text-sm transition-all"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
