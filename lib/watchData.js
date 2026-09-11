// Safe localStorage helpers — every reader/writer of watch data goes through here,
// so corrupt JSON can never crash a page.

export const KEYS = {
  history: 'ayuflix-history',
  continue: 'ayuflix-continue',
  myList: 'ayuflix_mylist',
  ratings: 'ayuflix_ratings',
  episodes: 'ayuflix_episodes_watched',
  recentSearches: 'ayuflix_recent_searches',
};

export function readJSON(key, fallback = []) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable — ignore
  }
}

export function removeKey(key) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/** Every piece of local user data, for the stats/export features. */
export function exportAllData() {
  const data = {};
  Object.entries(KEYS).forEach(([name, key]) => {
    data[name] = readJSON(key, name === 'ratings' ? {} : []);
  });
  data.exportedAt = new Date().toISOString();
  return data;
}

/** Clears every piece of local user data. */
export function clearAllData() {
  Object.values(KEYS).forEach(removeKey);
}
