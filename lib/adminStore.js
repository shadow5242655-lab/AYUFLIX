// Server-side admin config store.
// - Persists to .data/admin-config.json when the filesystem is writable (dev / node hosting).
// - Falls back to an in-process copy otherwise (serverless).
// - If ADMIN_STORE_URL is set (e.g. a JSONBlob URL), the config is synced to that remote
//   store so changes are shared across all server instances.

import fs from 'fs/promises';
import path from 'path';

export const DEFAULT_CONFIG = {
  siteName: 'AYUFLIX',
  servers: [],
  // servers: [{ id, name, movieUrl, tvUrl, enabled, isCustom }]
  heroMovies: [], // TMDB ids as strings
  announcement: { enabled: false, text: '', link: '' },
  maintenanceMode: false,
  updatedAt: null,
};

// Admin password: env var ADMIN_PASSWORD, falling back to the original default
// so the panel keeps working without configuration.
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AYUFLIX2026';

export function verifyPassword(password) {
  return typeof password === 'string' && password === ADMIN_PASSWORD;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'admin-config.json');

// In-process cache (also the fallback store on read-only filesystems)
let memoryConfig = null;

async function readRemote() {
  const url = process.env.ADMIN_STORE_URL;
  if (!url) return null;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function writeRemote(config) {
  const url = process.env.ADMIN_STORE_URL;
  if (!url) return false;
  try {
    await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return true;
  } catch {
    return false;
  }
}

function mergeWithDefaults(raw) {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_CONFIG };
  return {
    ...DEFAULT_CONFIG,
    ...raw,
    servers: Array.isArray(raw.servers) ? raw.servers : [],
    heroMovies: Array.isArray(raw.heroMovies) ? raw.heroMovies : [],
    announcement: {
      enabled: Boolean(raw.announcement?.enabled),
      text: raw.announcement?.text || '',
      link: raw.announcement?.link || '',
    },
  };
}

export async function readConfig() {
  // Remote store first (shared across instances)
  const remote = await readRemote();
  if (remote) {
    memoryConfig = mergeWithDefaults(remote);
    return memoryConfig;
  }
  // Then the local file
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    memoryConfig = mergeWithDefaults(JSON.parse(raw));
    return memoryConfig;
  } catch {
    // Finally the in-process copy
    return memoryConfig ? mergeWithDefaults(memoryConfig) : { ...DEFAULT_CONFIG };
  }
}

export async function writeConfig(config) {
  const merged = mergeWithDefaults({ ...config, updatedAt: new Date().toISOString() });
  memoryConfig = merged;
  await writeRemote(merged);
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(merged, null, 2), 'utf8');
  } catch {
    // Read-only filesystem (serverless): memory + remote are the only stores
  }
  return merged;
}

export async function updateConfig(patch) {
  const current = await readConfig();
  return writeConfig({ ...current, ...patch });
}
