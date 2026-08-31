'use client';

import { useState, useEffect } from 'react';
import { getTvDetails } from '@/lib/tmdb';

export default function SeasonSelector({ tvId, onSeasonChange, onEpisodeChange }) {
  const [tvData, setTvData] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);

  useEffect(() => {
    if (!tvData) return;
    const epCount = tvData.seasons?.find((s) => s.season_number === selectedSeason)?.episode_count || 1;
    if (selectedEpisode > epCount) {
      setSelectedEpisode(1);
      onEpisodeChange(1);
    }
  }, [selectedSeason, tvData, selectedEpisode, onEpisodeChange]);

  useEffect(() => {
    if (!tvId) return;
    getTvDetails(tvId).then((data) => {
      setTvData(data);
      onSeasonChange(1);
      onEpisodeChange(1);
    });
  }, [tvId, onSeasonChange, onEpisodeChange]);

  if (!tvData) return null;

  const seasons = tvData.seasons?.filter((s) => s.season_number > 0) || [];
  const currentSeason = seasons.find((s) => s.season_number === selectedSeason);
  const episodeCount = currentSeason?.episode_count || 1;

  return (
    <div className="flex gap-4 mb-6">
      <div>
        <label className="block text-sm text-gray-400 mb-1">Season</label>
        <select
          value={selectedSeason}
          onChange={(e) => {
            const val = Number(e.target.value);
            setSelectedSeason(val);
            setSelectedEpisode(1);
            onSeasonChange(val);
            onEpisodeChange(1);
          }}
          className="bg-ayu-off-black border-2 border-red-600 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
        >
          {seasons.map((s) => (
            <option key={s.season_number} value={s.season_number}>
              Season {s.season_number}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Episode</label>
        <select
          value={selectedEpisode}
          onChange={(e) => {
            const val = Number(e.target.value);
            setSelectedEpisode(val);
            onEpisodeChange(val);
          }}
          className="bg-ayu-off-black border-2 border-red-600 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
        >
          {Array.from({ length: episodeCount }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              Episode {i + 1}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
