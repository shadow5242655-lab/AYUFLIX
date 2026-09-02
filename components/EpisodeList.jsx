'use client';

import { useState, useEffect } from 'react';
import { isEpisodeWatched, markEpisodeWatched, unmarkEpisodeWatched } from '@/lib/episodeTracker';
import { FaCheck, FaPlay } from 'react-icons/fa';

export default function EpisodeList({ tvId, tvData, selectedSeason, onEpisodeSelect, currentEpisode }) {
  const [watchedMap, setWatchedMap] = useState({});

  const seasonData = tvData?.seasons?.find((s) => s.season_number === selectedSeason);
  const episodeCount = seasonData?.episode_count || 0;

  // Load watched state for this season
  useEffect(() => {
    const map = {};
    for (let ep = 1; ep <= episodeCount; ep++) {
      map[ep] = isEpisodeWatched(tvId, selectedSeason, ep);
    }
    setWatchedMap(map);
  }, [tvId, selectedSeason, episodeCount]);

  // Listen for storage changes (cross-tab)
  useEffect(() => {
    const handler = () => {
      const map = {};
      for (let ep = 1; ep <= episodeCount; ep++) {
        map[ep] = isEpisodeWatched(tvId, selectedSeason, ep);
      }
      setWatchedMap(map);
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [tvId, selectedSeason, episodeCount]);

  const toggleWatched = (ep) => {
    if (watchedMap[ep]) {
      unmarkEpisodeWatched(tvId, selectedSeason, ep);
    } else {
      markEpisodeWatched(tvId, selectedSeason, ep);
    }
    setWatchedMap((prev) => ({ ...prev, [ep]: !prev[ep] }));
  };

  if (episodeCount === 0) return null;

  return (
    <div className="mt-4">
      <h3 className="text-white font-semibold mb-3">Season {selectedSeason} Episodes</h3>
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {Array.from({ length: episodeCount }, (_, i) => {
          const ep = i + 1;
          const isWatched = watchedMap[ep] || false;
          const isPlaying = currentEpisode === ep;

          return (
            <div
              key={ep}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer group ${
                isPlaying
                  ? 'bg-red-600/20 border border-red-600/50'
                  : isWatched
                  ? 'bg-gray-900/50 border border-gray-800'
                  : 'bg-gray-900 border border-gray-800 hover:border-gray-700'
              }`}
              onClick={() => onEpisodeSelect(ep)}
            >
              {/* Episode number / Play button */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  isPlaying
                    ? 'bg-red-600 text-white'
                    : isWatched
                    ? 'bg-green-600/20 text-green-500'
                    : 'bg-gray-800 text-gray-400 group-hover:bg-red-600 group-hover:text-white'
                }`}
              >
                {isPlaying ? (
                  <FaPlay size={12} className="ml-0.5" />
                ) : isWatched ? (
                  <FaCheck size={14} />
                ) : (
                  <span className="text-sm font-medium">{ep}</span>
                )}
              </div>

              {/* Episode info */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isPlaying ? 'text-red-400' : 'text-white'}`}>
                  Episode {ep}
                </p>
                {isWatched && (
                  <p className="text-xs text-green-500">Watched</p>
                )}
              </div>

              {/* Watched toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWatched(ep);
                }}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  isWatched
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {isWatched ? '✓ Watched' : 'Mark Watched'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
