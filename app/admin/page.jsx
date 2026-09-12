'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FaLock, FaSignOutAlt, FaServer, FaFilm, FaChartBar, FaToggleOn, FaToggleOff,
  FaPlus, FaTrash, FaSave, FaBullhorn, FaTools, FaArrowUp, FaArrowDown, FaCheckCircle, FaEye,
  FaDownload, FaUpload, FaUndo,
} from 'react-icons/fa';
import { toast } from '@/lib/toast';
import {
  ADMIN_PW_KEY, verifyAdminPassword, fetchAdminConfig, saveAdminConfig, loadPlayerServers,
} from '@/lib/adminConfig';

const emptyServer = { id: '', name: '', movieUrl: '', tvUrl: '', enabled: true, isCustom: true };

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [config, setConfig] = useState(null);
  const [saving, setSaving] = useState(false);
  const [newServer, setNewServer] = useState(emptyServer);
  const [showAddServer, setShowAddServer] = useState(false);
  const [heroMovies, setHeroMovies] = useState(['', '', '', '', '']);
  const [liveServers, setLiveServers] = useState([]);

  // Restore session + load config
  useEffect(() => {
    (async () => {
      const savedPw = sessionStorage.getItem(ADMIN_PW_KEY) || '';
      if (savedPw) {
        const ok = await verifyAdminPassword(savedPw);
        if (ok) {
          setAuthed(true);
          setPassword(savedPw);
        } else {
          sessionStorage.removeItem(ADMIN_PW_KEY);
        }
      }
      try {
        const cfg = await fetchAdminConfig();
        setConfig(cfg);
        const hero = cfg.heroMovies || [];
        setHeroMovies([...hero, ...Array(Math.max(0, 5 - hero.length)).fill('')].slice(0, 5));
      } catch {
        toast('Failed to load site config', 'error');
      }
      setChecking(false);
    })();
  }, []);

  const refreshServers = useCallback(async () => {
    try {
      const servers = await loadPlayerServers();
      setLiveServers(servers.map((s) => s.name));
    } catch {
      setLiveServers([]);
    }
  }, []);

  useEffect(() => {
    if (authed) refreshServers();
  }, [authed, config, refreshServers]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password) return;
    const ok = await verifyAdminPassword(password);
    if (ok) {
      sessionStorage.setItem(ADMIN_PW_KEY, password);
      setAuthed(true);
      setErrorMsg('');
      toast('Welcome back, admin 👑', 'success');
    } else {
      setErrorMsg('Incorrect password');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_PW_KEY);
    setAuthed(false);
    setPassword('');
  };

  const save = async (nextConfig = config) => {
    setSaving(true);
    try {
      // Normalize hero movies before saving
      const withHero = {
        ...nextConfig,
        heroMovies: heroMovies.map((v) => v.trim()).filter(Boolean),
      };
      const res = await saveAdminConfig(password, withHero);
      setConfig(res.config);
      toast('✅ Saved — live for every visitor', 'success');
    } catch (err) {
      toast(err.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ---- server list helpers ----
  const patchServer = (id, patch) => {
    setConfig((c) => ({
      ...c,
      servers: (c.servers || []).map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  };

  const addServer = () => {
    const name = newServer.name.trim();
    const movieUrl = newServer.movieUrl.trim();
    if (!name || !movieUrl) {
      toast('Server name and movie URL template are required', 'error');
      return;
    }
    const server = {
      id: `custom_${Date.now()}`,
      name,
      movieUrl,
      tvUrl: newServer.tvUrl.trim() || movieUrl,
      enabled: true,
      isCustom: true,
    };
    setConfig((c) => ({ ...c, servers: [...(c.servers || []), server] }));
    setNewServer(emptyServer);
    setShowAddServer(false);
    toast('Server added — press Save Changes to publish', 'info');
  };

  const removeServer = (id) => {
    setConfig((c) => ({ ...c, servers: (c.servers || []).filter((s) => s.id !== id) }));
    toast('Server removed — press Save Changes to publish', 'info');
  };

  const moveServer = (index, dir) => {
    setConfig((c) => {
      const servers = [...(c.servers || [])];
      const j = index + dir;
      if (j < 0 || j >= servers.length) return c;
      [servers[index], servers[j]] = [servers[j], servers[index]];
      return { ...c, servers };
    });
  };

  // ---- announcement helpers ----
  const patchAnnouncement = (patch) => {
    setConfig((c) => ({ ...c, announcement: { ...c.announcement, ...patch } }));
  };

  // ---- config backup helpers ----
  const exportConfig = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ayuflix-config-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('📦 Config exported', 'success');
  };

  const importConfigFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const imported = JSON.parse(reader.result);
        if (!imported || typeof imported !== 'object') throw new Error('bad');
        setConfig(imported);
        const hero = imported.heroMovies || [];
        setHeroMovies([...hero, ...Array(Math.max(0, 5 - hero.length)).fill('')].slice(0, 5));
        toast('Config loaded — press Save Changes to publish', 'info');
      } catch {
        toast('Invalid config file', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const resetConfig = async () => {
    if (!confirm('Reset EVERYTHING back to defaults? Servers, hero, announcement and maintenance mode will be wiped for all visitors.')) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ action: 'reset' }),
      });
      if (!res.ok) throw new Error('Reset failed');
      const data = await res.json();
      setConfig(data.config);
      setHeroMovies(['', '', '', '', '']);
      toast('♻️ Config reset to defaults', 'success');
    } catch (err) {
      toast(err.message || 'Reset failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="w-full max-w-md bg-gray-900 border-2 border-red-600 rounded-xl p-8">
          <div className="text-center mb-6">
            <FaLock className="text-red-600 text-4xl mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-red-600">🔐 Admin Access</h1>
            <p className="text-gray-400 text-sm mt-2">
              Changes apply to every visitor, not just your browser.
            </p>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="w-full bg-gray-800 border border-red-600 text-white px-4 py-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
          {errorMsg && <p className="text-red-500 text-sm mb-4">{errorMsg}</p>}
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-all"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400">Could not load site config.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 md:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            🛠️ AYUFLIX Admin Panel
          </h1>
          <p className="text-gray-500 text-xs mt-1">
            Saved changes go live for <span className="text-red-400">every visitor</span> — stored on the server.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => save()}
            disabled={saving}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap"
          >
            <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        {/* Section: Video Servers */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaServer className="text-red-500" /> Video Servers
            </h2>
            <button
              onClick={() => setShowAddServer((v) => !v)}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            >
              <FaPlus size={12} /> Add Server
            </button>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Toggle, reorder, edit or remove the video players. The first enabled server is the default. URL templates
            support <code className="text-red-400">{'{id}'}</code>, <code className="text-red-400">{'{season}'}</code>,{' '}
            <code className="text-red-400">{'{episode}'}</code>.
          </p>

          {showAddServer && (
            <div className="bg-gray-800 rounded-lg p-4 mb-4 space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Server Name</label>
                  <input
                    type="text"
                    value={newServer.name}
                    onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                    placeholder="e.g. MyServer"
                    className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-red-600"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Movie URL Template</label>
                  <input
                    type="text"
                    value={newServer.movieUrl}
                    onChange={(e) => setNewServer({ ...newServer, movieUrl: e.target.value })}
                    placeholder="https://mysite.com/embed/movie/{id}"
                    className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">
                  TV URL Template (optional — uses movie URL if empty)
                </label>
                <input
                  type="text"
                  value={newServer.tvUrl}
                  onChange={(e) => setNewServer({ ...newServer, tvUrl: e.target.value })}
                  placeholder="https://mysite.com/embed/tv/{id}/{season}/{episode}"
                  className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-red-600"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={addServer} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
                  <FaPlus size={12} /> Add
                </button>
                <button onClick={() => setShowAddServer(false)} className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all">
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="grid gap-3">
            {(config.servers || []).map((server, index) => (
              <div
                key={server.id}
                className={`p-4 rounded-lg border transition-all ${
                  server.enabled ? 'bg-gray-800/50 border-green-600/40' : 'bg-gray-900 border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${server.enabled ? 'bg-green-500' : 'bg-gray-600'}`} />
                    <span className={`font-medium truncate ${server.enabled ? 'text-white' : 'text-gray-500'}`}>
                      {server.name}
                    </span>
                    {server.isCustom && (
                      <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded flex-shrink-0">Custom</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => moveServer(index, -1)} disabled={index === 0}
                      className="p-2 text-gray-400 hover:text-white disabled:opacity-30 transition-colors" title="Move up">
                      <FaArrowUp size={12} />
                    </button>
                    <button onClick={() => moveServer(index, 1)} disabled={index === (config.servers || []).length - 1}
                      className="p-2 text-gray-400 hover:text-white disabled:opacity-30 transition-colors" title="Move down">
                      <FaArrowDown size={12} />
                    </button>
                    <button
                      onClick={() => patchServer(server.id, { enabled: !server.enabled })}
                      className={`text-2xl transition-all ${server.enabled ? 'text-green-500' : 'text-gray-600'}`}
                      title={server.enabled ? 'Disable' : 'Enable'}
                    >
                      {server.enabled ? <FaToggleOn /> : <FaToggleOff />}
                    </button>
                    <button onClick={() => removeServer(server.id)}
                      className="p-2 text-red-500 hover:text-red-400 transition-colors" title="Remove server">
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-2 mt-3">
                  <input
                    type="text"
                    value={server.name}
                    onChange={(e) => patchServer(server.id, { name: e.target.value })}
                    className="bg-gray-900 border border-gray-700 text-white text-xs px-3 py-1.5 rounded focus:outline-none focus:border-red-600"
                    placeholder="Display name"
                  />
                  <input
                    type="text"
                    value={server.movieUrl}
                    onChange={(e) => patchServer(server.id, { movieUrl: e.target.value })}
                    className="bg-gray-900 border border-gray-700 text-white text-xs px-3 py-1.5 rounded focus:outline-none focus:border-red-600"
                    placeholder="Movie URL template"
                  />
                  <input
                    type="text"
                    value={server.tvUrl || ''}
                    onChange={(e) => patchServer(server.id, { tvUrl: e.target.value })}
                    className="bg-gray-900 border border-gray-700 text-white text-xs px-3 py-1.5 rounded focus:outline-none focus:border-red-600 md:col-span-2"
                    placeholder="TV URL template ({id}/{season}/{episode})"
                  />
                  <p className="md:col-span-2 text-gray-600 text-[10px] flex items-center gap-1">
                    <FaEye size={9} /> Placeholders: {'{id}'}, {'{season}'}, {'{episode}'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Live preview of what players will use */}
          <div className="mt-4 bg-gray-950 border border-gray-800 rounded-lg p-3">
            <p className="text-gray-500 text-xs flex items-center gap-2 flex-wrap">
              <FaCheckCircle className="text-green-500" size={11} /> Players currently show (in order):
              {liveServers.length > 0 ? (
                <span className="text-gray-300">{liveServers.join(' → ')}</span>
              ) : (
                <span className="text-yellow-500">loading…</span>
              )}
            </p>
          </div>
        </div>

        {/* Section: Hero Banner */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaFilm className="text-red-500" /> Hero Banner
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            Enter TMDB Movie IDs to override the trending carousel for everyone. Leave empty to keep trending.
          </p>
          <div className="grid gap-3">
            {heroMovies.map((id, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-gray-400 text-sm w-16 flex-shrink-0">Movie {index + 1}:</span>
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setHeroMovies((prev) => prev.map((v, i) => (i === index ? e.target.value : v)))}
                  placeholder="TMDB ID (e.g. 550)"
                  className="flex-1 bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-red-600"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Section: Announcement Banner */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaBullhorn className="text-red-500" /> Announcement Banner
          </h2>
          <p className="text-gray-400 text-sm mb-4">Shows a red banner above every page for all visitors.</p>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer w-fit">
              <button
                type="button"
                onClick={() => patchAnnouncement({ enabled: !config.announcement?.enabled })}
                className={`text-2xl transition-all ${config.announcement?.enabled ? 'text-green-500' : 'text-gray-600'}`}
              >
                {config.announcement?.enabled ? <FaToggleOn /> : <FaToggleOff />}
              </button>
              <span className="text-white text-sm">{config.announcement?.enabled ? 'Enabled' : 'Disabled'}</span>
            </label>
            <input
              type="text"
              value={config.announcement?.text || ''}
              onChange={(e) => patchAnnouncement({ text: e.target.value })}
              placeholder="Announcement text, e.g. New servers added! 🎉"
              className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-red-600"
            />
            <input
              type="text"
              value={config.announcement?.link || ''}
              onChange={(e) => patchAnnouncement({ link: e.target.value })}
              placeholder="Optional link (https://...)"
              className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-red-600"
            />
            <label className="block">
              <span className="text-gray-400 text-xs">Auto-hide after (optional):</span>
              <input
                type="datetime-local"
                value={config.announcement?.expiresAt ? String(config.announcement.expiresAt).slice(0, 16) : ''}
                onChange={(e) => patchAnnouncement({ expiresAt: e.target.value || '' })}
                className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-red-600 mt-1"
              />
            </label>
          </div>
        </div>

        {/* Section: Maintenance Mode */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaTools className="text-red-500" /> Maintenance Mode
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            When enabled, visitors see a &ldquo;under maintenance&rdquo; screen instead of the site.
          </p>
          <label className="flex items-center gap-3 cursor-pointer w-fit">
            <button
              type="button"
              onClick={() => setConfig((c) => ({ ...c, maintenanceMode: !c.maintenanceMode }))}
              className={`text-2xl transition-all ${config.maintenanceMode ? 'text-green-500' : 'text-gray-600'}`}
            >
              {config.maintenanceMode ? <FaToggleOn /> : <FaToggleOff />}
            </button>
            <span className="text-white text-sm">{config.maintenanceMode ? 'Enabled' : 'Disabled'}</span>
          </label>
        </div>

        {/* Section: Stats */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaChartBar className="text-red-500" /> Site Stats
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-red-600">{(config.heroMovies || []).length}</p>
              <p className="text-gray-400 text-sm">Hero Movies Set</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-red-600">
                {(config.servers || []).filter((s) => s.enabled).length}
              </p>
              <p className="text-gray-400 text-sm">Active Servers</p>
            </div>
          </div>
        </div>

        {/* Section: Config backup */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaDownload className="text-red-500" /> Config Backup
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            Download the whole site config as a file, restore it on another deployment, or reset everything to
            defaults.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportConfig}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-sm px-4 py-2 rounded-lg transition-all"
            >
              <FaDownload size={12} /> Export config
            </button>
            <button
              onClick={() => document.getElementById('admin-config-import')?.click()}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-sm px-4 py-2 rounded-lg transition-all"
            >
              <FaUpload size={12} /> Import config
            </button>
            <input
              id="admin-config-import"
              type="file"
              accept="application/json"
              onChange={importConfigFile}
              className="hidden"
            />
            <button
              onClick={resetConfig}
              className="flex items-center gap-2 bg-transparent border border-red-900 hover:bg-red-950 text-red-500 text-sm px-4 py-2 rounded-lg transition-all"
            >
              <FaUndo size={12} /> Reset to defaults
            </button>
          </div>
          {config.updatedAt && (
            <p className="text-gray-600 text-xs mt-3">Last saved: {new Date(config.updatedAt).toLocaleString()}</p>
          )}
        </div>
      </div>
    </div>
  );
}
