const STORAGE_KEY = 'ayuflix_episodes_watched';

function getWatchedSet() {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveWatchedSet(set) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

export function markEpisodeWatched(tvId, seasonNum, episodeNum) {
  const set = getWatchedSet();
  set.add(`${tvId}-${seasonNum}-${episodeNum}`);
  saveWatchedSet(set);
  // Dispatch storage event for cross-tab sync
  window.dispatchEvent(new Event('storage'));
}

export function unmarkEpisodeWatched(tvId, seasonNum, episodeNum) {
  const set = getWatchedSet();
  set.delete(`${tvId}-${seasonNum}-${episodeNum}`);
  saveWatchedSet(set);
  window.dispatchEvent(new Event('storage'));
}

export function isEpisodeWatched(tvId, seasonNum, episodeNum) {
  const set = getWatchedSet();
  return set.has(`${tvId}-${seasonNum}-${episodeNum}`);
}

export function getWatchedEpisodesForShow(tvId) {
  const set = getWatchedSet();
  const prefix = `${tvId}-`;
  return [...set].filter((key) => key.startsWith(prefix));
}

export function getSeasonWatchedCount(tvId, seasonNum, totalEpisodes) {
  let count = 0;
  for (let ep = 1; ep <= totalEpisodes; ep++) {
    if (isEpisodeWatched(tvId, seasonNum, ep)) count++;
  }
  return count;
}

export function getNextUnwatchedEpisode(tvId, currentSeason, currentEpisode, totalSeasons, episodesPerSeason) {
  // First check remaining episodes in current season
  const currentSeasonEpisodes = episodesPerSeason[currentSeason] || 0;
  for (let ep = currentEpisode + 1; ep <= currentSeasonEpisodes; ep++) {
    if (!isEpisodeWatched(tvId, currentSeason, ep)) {
      return { season: currentSeason, episode: ep };
    }
  }
  // Then check next seasons
  for (let s = currentSeason + 1; s <= totalSeasons; s++) {
    const epCount = episodesPerSeason[s] || 0;
    for (let ep = 1; ep <= epCount; ep++) {
      if (!isEpisodeWatched(tvId, s, ep)) {
        return { season: s, episode: ep };
      }
    }
  }
  return null; // All watched
}

export function getTotalWatchedCount(tvId, tvData) {
  if (!tvData?.seasons) return { watched: 0, total: 0 };
  let watched = 0;
  let total = 0;
  tvData.seasons.forEach((s) => {
    if (s.season_number > 0) {
      const epCount = s.episode_count || 0;
      total += epCount;
      for (let ep = 1; ep <= epCount; ep++) {
        if (isEpisodeWatched(tvId, s.season_number, ep)) watched++;
      }
    }
  });
  return { watched, total };
}
