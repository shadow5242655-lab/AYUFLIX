// Achievements + daily watch streak. All data is local to the viewer.

const ACH_KEY = 'ayuflix_achievements';
const STREAK_KEY = 'ayuflix_streak';

export const ACHIEVEMENTS = [
  { id: 'first_play', name: 'Lights, Camera, Action!', desc: 'Play your first title', icon: '🎬' },
  { id: 'couch_potato', name: 'Couch Potato', desc: 'Watch 5 different titles', icon: '🛋️' },
  { id: 'binge_master', name: 'Binge Master', desc: 'Mark 20 episodes as watched', icon: '📺' },
  { id: 'collector', name: 'The Collector', desc: 'Save 10 titles to My List', icon: '📚' },
  { id: 'critic', name: 'Critic', desc: 'Rate 5 titles', icon: '⭐' },
  { id: 'commentator', name: 'Commentator', desc: 'Leave your first comment', icon: '💬' },
  { id: 'explorer', name: 'Explorer', desc: 'Watch titles from 5 different genres', icon: '🧭' },
  { id: 'night_owl', name: 'Night Owl', desc: 'Watch something between midnight and 5 AM', icon: '🦉' },
  { id: 'streak_3', name: 'On a Roll', desc: '3-day watch streak', icon: '🔥' },
  { id: 'streak_7', name: 'Unstoppable', desc: '7-day watch streak', icon: '🏆' },
];

function readJSON(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// ---------- streak ----------

/** Record a watch today; updates current/best streak. Call whenever playback starts. */
export function markWatchActivity() {
  if (typeof window === 'undefined') return;
  const today = new Date().toISOString().slice(0, 10);
  const data = readJSON(STREAK_KEY, { lastDay: '', current: 0, best: 0 });
  if (data.lastDay === today) return;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  data.current = data.lastDay === yesterday ? (data.current || 0) + 1 : 1;
  data.lastDay = today;
  data.best = Math.max(data.best || 0, data.current);
  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
}

export function getStreak() {
  const data = readJSON(STREAK_KEY, { lastDay: '', current: 0, best: 0 });
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const current = data.lastDay === today || data.lastDay === yesterday ? data.current || 0 : 0;
  return { current, best: data.best || 0, watchedToday: data.lastDay === today };
}

// ---------- achievements ----------

function getUnlocked() {
  return readJSON(ACH_KEY, {});
}

function unlock(id) {
  const unlocked = getUnlocked();
  if (unlocked[id]) return false;
  unlocked[id] = new Date().toISOString();
  localStorage.setItem(ACH_KEY, JSON.stringify(unlocked));
  const def = ACHIEVEMENTS.find((a) => a.id === id);
  if (def && typeof window !== 'undefined') {
    // lazy import avoided — fire the toast event directly
    window.dispatchEvent(
      new CustomEvent('ayuflix-toast', {
        detail: { message: `${def.icon} Achievement unlocked: ${def.name}!`, type: 'success', id: Date.now() },
      })
    );
  }
  return true;
}

function readLS(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Evaluates every achievement against current local data.
 * Returns the list of definitions with { unlocked, unlockedAt }.
 */
export function evaluateAchievements() {
  if (typeof window === 'undefined') return ACHIEVEMENTS.map((a) => ({ ...a, unlocked: false }));

  const history = readLS('ayuflix-history', []);
  const myList = readLS('ayuflix-mylist', []);
  const ratings = readLS('ayuflix_ratings', {});
  const episodes = readLS('ayuflix_episodes_watched', []);
  const commentsAny = Object.keys(localStorage)
    .filter((k) => k.startsWith('ayuflix_comments_'))
    .some((k) => (readLS(k, []) || []).length > 0);

  const hour = new Date().getHours();
  const isNight = hour >= 0 && hour < 5;

  if (history.length >= 1) unlock('first_play');
  if (history.length >= 5) unlock('couch_potato');
  if ((episodes || []).length >= 20) unlock('binge_master');
  if (myList.length >= 10) unlock('collector');
  if (Object.keys(ratings || {}).length >= 5) unlock('critic');
  if (commentsAny) unlock('commentator');
  if (isNight && history.length > 0) unlock('night_owl');

  const streak = getStreak();
  if (streak.current >= 3) unlock('streak_3');
  if (streak.current >= 7) unlock('streak_7');

  // Explorer: distinct genres seen in history (genreIds saved on watch when available)
  const genres = new Set();
  (history || []).forEach((h) => (h.genreIds || []).forEach((g) => genres.add(g)));
  if (genres.size >= 5) unlock('explorer');

  const unlocked = getUnlocked();
  return ACHIEVEMENTS.map((a) => ({ ...a, unlocked: Boolean(unlocked[a.id]), unlockedAt: unlocked[a.id] }));
}
