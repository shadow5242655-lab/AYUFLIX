'use client';

import { useEffect, useState } from 'react';

const PREFS_KEY = 'ayuflix_prefs';

export const ACCENTS = [
  { id: 'red', name: 'Classic Red', value: '#E50914' },
  { id: 'crimson', name: 'Crimson', value: '#DC143C' },
  { id: 'orange', name: 'Ember', value: '#FF5722' },
  { id: 'gold', name: 'Gold', value: '#FFB300' },
  { id: 'emerald', name: 'Emerald', value: '#10B981' },
  { id: 'cyan', name: 'Ice', value: '#22D3EE' },
  { id: 'violet', name: 'Violet', value: '#8B5CF6' },
  { id: 'pink', name: 'Neon Pink', value: '#EC4899' },
];

export const AVATARS = ['🎬', '🍿', '🦁', '🔥', '🌟', '👾', '🚀', '🦊', '🐼', '👑'];

export const DEFAULT_PREFS = {
  accent: 'red',
  reduceMotion: false,
  avatar: '',
  autoplayNext: true,
  theaterDefault: false,
  defaultServer: '', // empty = auto (last used / first enabled)
};

export function getPrefs() {
  if (typeof window === 'undefined') return { ...DEFAULT_PREFS };
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return { ...DEFAULT_PREFS, ...(raw ? JSON.parse(raw) : {}) };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function savePrefs(patch) {
  const next = { ...getPrefs(), ...patch };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event('ayuflix-prefs-changed'));
  }
  return next;
}

export function getAccentValue() {
  const pref = ACCENTS.find((a) => a.id === getPrefs().accent);
  return pref ? pref.value : ACCENTS[0].value;
}

/** Applies accent + motion preferences to the document. Call once in the layout. */
export function applyPrefsToDocument(prefs) {
  if (typeof document === 'undefined') return;
  const p = prefs || getPrefs();
  const accent = ACCENTS.find((a) => a.id === p.accent) || ACCENTS[0];
  document.documentElement.style.setProperty('--accent', accent.value);
  document.documentElement.classList.toggle('reduce-motion', Boolean(p.reduceMotion));
}

export function resetPrefs() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(PREFS_KEY);
    window.dispatchEvent(new Event('ayuflix-prefs-changed'));
  }
}

/** React hook: live prefs (re-renders when prefs change in this tab or another). */
export function usePrefs() {
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  useEffect(() => {
    setPrefs(getPrefs());
    applyPrefsToDocument();
    const handler = () => {
      setPrefs(getPrefs());
      applyPrefsToDocument();
    };
    window.addEventListener('ayuflix-prefs-changed', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('ayuflix-prefs-changed', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);
  return prefs;
}
