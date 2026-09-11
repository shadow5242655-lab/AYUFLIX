'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FaSearch, FaTimes, FaClock, FaTv, FaFilm, FaFireAlt } from 'react-icons/fa';
import { searchMulti, imageUrl, getTrending } from '@/lib/tmdb';

const RECENT_KEY = 'ayuflix_recent_searches';
const readRecent = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveRecent = (q) => {
  const updated = [q, ...readRecent().filter((r) => r !== q)].slice(0, 6);
  localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  return updated;
};

export default function SearchSuggestions({ onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState([]);
  const inputRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    setRecent(readRecent());
    inputRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Load trending titles to show when the query is empty
  useEffect(() => {
    let cancelled = false;
    getTrending()
      .then((data) => {
        if (!cancelled) setTrending((data || []).slice(0, 8));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced live search
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      searchMulti(q)
        .then((data) => setResults((data || []).filter((r) => r.media_type === 'movie' || r.media_type === 'tv').slice(0, 10)))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setRecent(saveRecent(q));
    window.location.href = `/search?q=${encodeURIComponent(q)}`;
  };

  const goTo = useCallback(
    (item) => {
      saveRecent(item.title || item.name);
      onClose();
    },
    [onClose]
  );

  const pickRecent = (q) => {
    setQuery(q);
    inputRef.current?.focus();
  };

  const clearRecent = () => {
    localStorage.removeItem(RECENT_KEY);
    setRecent([]);
  };

  const year = (d) => (d ? d.slice(0, 4) : '');
  const showTrending = query.trim().length < 2;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm overflow-y-auto custom-scrollbar"
      role="dialog"
      aria-modal="true"
      aria-label="Search AYUFLIX"
    >
      {/* Top bar with close */}
      <div className="sticky top-0 bg-black/90 border-b border-red-600/40">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <form onSubmit={submitSearch} className="flex items-center gap-3 bg-gray-900/90 border-2 border-red-600/60 focus-within:border-red-500 rounded-xl px-4 py-3 transition-colors">
            <FaSearch className="text-red-500 flex-shrink-0" size={18} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies & TV shows..."
              className="flex-1 bg-transparent text-white text-base sm:text-lg focus:outline-none placeholder-gray-500"
              autoComplete="off"
            />
            {loading && <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-red-600 text-gray-300 hover:text-white transition-colors flex-shrink-0"
            >
              <FaTimes size={14} />
            </button>
          </form>
          <p className="text-gray-600 text-xs text-center mt-2">
            Press <kbd className="bg-gray-800 px-1.5 py-0.5 rounded text-gray-400">Enter</kbd> for full results ·{' '}
            <kbd className="bg-gray-800 px-1.5 py-0.5 rounded text-gray-400">Esc</kbd> to close
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 pb-20">
        {showTrending ? (
          <>
            {/* Recent searches */}
            {recent.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-400 text-sm font-semibold flex items-center gap-2">
                    <FaClock size={12} className="text-red-500" /> Recent searches
                  </p>
                  <button onClick={clearRecent} className="text-gray-600 hover:text-red-400 text-xs transition-colors">
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recent.map((q) => (
                    <button
                      key={q}
                      onClick={() => pickRecent(q)}
                      className="bg-gray-900 border border-gray-800 hover:border-red-600 text-gray-300 hover:text-white text-sm px-4 py-2 rounded-full transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending */}
            {trending.length > 0 && (
              <div>
                <p className="text-gray-400 text-sm font-semibold flex items-center gap-2 mb-3">
                  <FaFireAlt size={12} className="text-red-500" /> Trending this week
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {trending.map((r) => (
                    <a
                      key={r.id}
                      href={r.media_type === 'tv' ? `/tv/${r.id}` : `/movie/${r.id}`}
                      onClick={() => goTo(r)}
                      className="flex items-center gap-3 bg-gray-900/80 hover:bg-red-600/15 border border-gray-800 hover:border-red-600/60 rounded-lg p-2 transition-colors"
                    >
                      {r.poster_path ? (
                        <img src={imageUrl(r.poster_path, 'w92')} alt="" className="w-10 h-14 object-cover rounded flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-14 bg-gray-800 rounded flex items-center justify-center flex-shrink-0">
                          {r.media_type === 'tv' ? <FaTv className="text-gray-600" size={14} /> : <FaFilm className="text-gray-600" size={14} />}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-white text-sm truncate">{r.title || r.name}</p>
                        <p className="text-gray-500 text-xs">
                          {r.media_type === 'tv' ? 'TV' : 'Movie'}
                          {year(r.release_date || r.first_air_date) && ` • ${year(r.release_date || r.first_air_date)}`}
                          {r.vote_average > 0 && ` • ⭐ ${r.vote_average.toFixed(1)}`}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : results.length > 0 ? (
          <div className="space-y-1">
            {results.map((r) => (
              <a
                key={`${r.media_type}-${r.id}`}
                href={r.media_type === 'tv' ? `/tv/${r.id}` : `/movie/${r.id}`}
                onClick={() => goTo(r)}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-red-600/10 rounded-lg transition-colors"
              >
                {r.poster_path ? (
                  <img src={imageUrl(r.poster_path, 'w92')} alt="" className="w-10 h-14 object-cover rounded flex-shrink-0" />
                ) : (
                  <div className="w-10 h-14 bg-gray-800 rounded flex items-center justify-center flex-shrink-0">
                    {r.media_type === 'tv' ? <FaTv className="text-gray-600" size={14} /> : <FaFilm className="text-gray-600" size={14} />}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm sm:text-base truncate">{r.title || r.name}</p>
                  <p className="text-gray-500 text-xs">
                    {r.media_type === 'tv' ? 'TV Series' : 'Movie'}
                    {year(r.release_date || r.first_air_date) && ` • ${year(r.release_date || r.first_air_date)}`}
                    {r.vote_average > 0 && ` • ⭐ ${r.vote_average.toFixed(1)}`}
                  </p>
                </div>
                <FaSearch className="text-gray-700 text-xs" />
              </a>
            ))}
            <button
              onClick={submitSearch}
              className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-3 rounded-lg transition-colors"
            >
              See all results for &quot;{query.trim()}&quot;
            </button>
          </div>
        ) : query.trim().length >= 2 ? (
          <div className="text-center py-16">
            <FaSearch className="text-gray-700 text-4xl mx-auto mb-4" />
            <p className="text-gray-400">No matches for &quot;{query.trim()}&quot;</p>
            <p className="text-gray-600 text-sm mt-1">Check the spelling or try a different title</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
