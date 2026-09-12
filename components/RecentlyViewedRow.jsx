'use client';

import { useState, useEffect } from 'react';
import MovieCard from './MovieCard';
import { FaHistory, FaTimes } from 'react-icons/fa';
import { readJSON, writeJSON } from '@/lib/watchData';
import { toast } from '@/lib/toast';

const HISTORY_KEY = 'ayuflix-history';

/**
 * "Jump Back In" — shows the titles from this viewer's history (most recent first),
 * excluding whatever is currently in Continue Watching (that row handles those).
 * Each card has a remove (✕) button to drop the title from history.
 */
export default function RecentlyViewedRow() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = () => {
    const history = readJSON(HISTORY_KEY, []);
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
  };

  const removeFromHistory = (item) => {
    const history = readJSON(HISTORY_KEY, []);
    writeJSON(
      HISTORY_KEY,
      history.filter((h) => h.id !== item.id)
    );
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    toast(`Removed "${item.title}" from history`, 'info');
  };

  if (items.length === 0) return null;

  return (
    <div className="px-4 md:px-8 mb-8">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-3 flex items-center gap-2">
        <FaHistory className="text-red-600" size={18} /> Jump Back In
      </h2>
      <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-4">
        {items.map((m) => (
          <div key={`${m.media_type}-${m.id}`} className="relative flex-shrink-0 group/remove">
            <MovieCard movie={m} />
            {/* Remove from history */}
            <button
              type="button"
              onClick={() => removeFromHistory(m)}
              className="absolute -top-1.5 -right-1.5 z-40 w-6 h-6 rounded-full bg-gray-900 border border-gray-600 text-gray-400 hover:bg-red-600 hover:border-red-600 hover:text-white flex items-center justify-center md:opacity-0 md:group-hover/remove:opacity-100 transition-all shadow-lg"
              title={`Remove "${m.title}" from history`}
              aria-label={`Remove ${m.title} from history`}
            >
              <FaTimes size={10} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
