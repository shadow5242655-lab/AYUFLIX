'use client';

import { useState, useEffect } from 'react';
import { isEpisodeWatched, markEpisodeWatched, unmarkEpisodeWatched } from '@/lib/episodeTracker';
import { getSeasonDetails } from '@/lib/tmdb';
import { FaCheck, FaPlay } from 'react-icons/fa';

const fallbackEpisodeImage = (stillPath) =>
  stillPath
    ? `https://image.tmdb.org/t/p/w300${stillPath}`
    : null;

export default function EpisodeList({ tvId, tvData, selectedSeason, onEpisodeSelect, currentEpisode }) {
  const [watchedMap, setWatchedMap] = useState({});
  const [seasonDetails, setSeasonDetails] = useState(null);

  const seasonData = tvData?.seasons?.find((s) => s.season_number === selectedSeason);
  const episodeCount = seasonData?.episode_count || 0;

  // Fetch season details for air dates, names and stills
  useEffect(() => {
    if (!tvId || selectedSeason < 1) {
      setSeasonDetails(null);
      return;
    }
    let cancelled = false;
    getSeasonDetails(tvId, selectedSeason)
      .then((data) => {
        if (!cancelled) setSeasonDetails(data);
      })
      .catch(() => {
        if (!cancelled) setSeasonDetails(null);
      });
    return () => {
      cancelled = true;
    };
  }, [tvId, selectedSeason]);

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

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Air date unknown';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return 'Air date unknown';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="mt-4">
      <h3 className="text-white font-semibold mb-3">Season {selectedSeason} Episodes</h3>
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {Array.from({ length: episodeCount }, (_, i) => {
          const ep = i + 1;
          const isWatched = watchedMap[ep] || false;
          const isPlaying = currentEpisode === ep;
          const epDetails = seasonDetails?.episodes?.[i];
          const airDate = epDetails?.air_date;
          const notYetAired = airDate ? new Date(airDate) > new Date() : false;
          const still = fallbackEpisodeImage(epDetails?.still_path);

          return (
            <div
              key={ep}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer group ${
                isPlaying
                  ? 'bg-red-600/20 border border-red-600/50'
                  : isWatched
                    ? 'bg-gray-900/60 border border-transparent hover:border-gray-700'
                    : 'bg-gray-800/40 border border-transparent hover:bg-gray-800/70 hover:border-gray-700'
              }`}
              onClick={() => onEpisodeSelect(ep)}
            >
              {/* Episode thumbnail */}
              {still ? (
                <img
                  src={still}
                  alt={`Episode ${ep}`}
                  className="w-24 h-14 object-cover rounded flex-shrink-0"
                  loading="lazy"
                />
              ) : (
                <div className="w-24 h-14 bg-gray-800 rounded flex items-center justify-center flex-shrink-0 text-gray-600 text-xs">
                  E{ep}
                </div>
              )}

              {/* Episode info */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isPlaying ? 'text-red-400' : 'text-white'}`}>
                  {ep}. {epDetails?.name || `Episode ${ep}`}
                </p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {formatDate(airDate)}
                  {epDetails?.vote_average > 0 && ` • ⭐ ${epDetails.vote_average.toFixed(1)}`}
                  {epDetails?.runtime ? ` • ${epDetails.runtime} min` : ''}
                </p>
              </div>

              {/* Status / actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {notYetAired && (
                  <span className="text-[10px] text-yellow-500 bg-yellow-500/10 border border-yellow-500/40 px-1.5 py-0.5 rounded">
                    Not aired
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWatched(ep);
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                    isWatched
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'border-gray-500 text-gray-500 hover:border-green-500 hover:text-green-500'
                  }`}
                  title={isWatched ? 'Mark as unwatched' : 'Mark as watched'}
                >
                  {isWatched ? <FaCheck size={11} /> : <span className="text-xs">✓</span>}
                </button>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    isPlaying ? 'bg-red-600 text-white' : 'bg-gray-700 text-white opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <FaPlay size={10} className="ml-0.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
