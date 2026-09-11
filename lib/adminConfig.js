'use client';

import { BUILTIN_SERVERS, buildServerUrl } from '@/lib/videoServers';

export const ADMIN_PW_KEY = 'ayuflix_admin_pw';

export async function verifyAdminPassword(password) {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchAdminConfig() {
  const res = await fetch('/api/admin/config', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load config');
  return res.json();
}

export async function saveAdminConfig(password, config) {
  const res = await fetch('/api/admin/config', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': password,
    },
    body: JSON.stringify({ config }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to save');
  }
  return res.json();
}

/**
 * Loads the shared server list for the video player, merged with builtins.
 * Builtin entries from the config (same id) override the builtin definition,
 * so admins can rename or re-URL them, and enabled=false removes them.
 * Custom servers (isCustom) are appended.
 */
export async function loadPlayerServers() {
  const config = await fetchAdminConfig();
  const stored = Array.isArray(config.servers) ? config.servers : [];

  const byId = new Map();
  BUILTIN_SERVERS.forEach((s) => byId.set(s.id, { ...s, enabled: true, isBuiltin: true }));
  stored.forEach((s) => {
    if (!s || !s.id) return;
    const existing = byId.get(s.id);
    byId.set(s.id, {
      ...(existing || { movieUrl: '', tvUrl: '' }),
      ...s,
      isCustom: !existing,
    });
  });

  return Array.from(byId.values())
    .filter((s) => s.enabled !== false && (s.movieUrl || s.tvUrl))
    .map((s) => ({
      id: s.id,
      name: s.name,
      isCustom: Boolean(s.isCustom),
      getUrl: (mediaId, type, season, episode) => buildServerUrl(s, mediaId, type, season, episode),
    }));
}
