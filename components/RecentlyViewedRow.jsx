'use client';

import { useState, useEffect } from 'react';
import MovieCard from './MovieCard';
import { FaHistory } from 'react-icons/fa';
import { readJSON } from '@/lib/watchData';

/**
 * "Jump Back In" — shows the titles from this viewer's history (most recent first),
 * excluding whatever is currently in Continue Watching (that row handles those).
 */
export default function RecentlyViewedRow() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const history = readJSON('ayuflix-history', []);
    const continueItems = readJSON('ayuflix-continue', []);
    const continueIds = new Set(continueItems.map((i) => i.id));
    setItems(
      history
        .filter((h) => h.id && !continueIds.has(h.id))
        .map((h) => ({
          id: h.id,
          title: h.title,
          name: h.title,
          poster_path: h.posterPath,
          media_type: h.mediaType || 'movie',
          vote_average: h.voteAverage || 0,
          release_date: h.releaseDate,
          first_air_date: h.releaseDate,
        }))
        .slice(0, 20)
    );
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="px-4 md:px-8 mb-8">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-3 flex items-center gap-2">
        <FaHistory className="text-red-600" size={18} /> Jump Back In
      </h2>
      <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-4">
        {items.map((m) => (
          <MovieCard key={`${m.media_type}-${m.id}`} movie={m} />
        ))}
      </div>
    </div>
  );
}
