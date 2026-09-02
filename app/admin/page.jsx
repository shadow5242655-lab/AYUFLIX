'use client';

import { useState, useEffect } from 'react';
import { FaLock, FaSignOutAlt, FaServer, FaFilm, FaChartBar, FaToggleOn, FaToggleOff, FaPlus, FaTrash } from 'react-icons/fa';

const ADMIN_PASSWORD = 'AYUFLIX2026';

// All hardcoded servers
const HARDCODED_SERVERS = {
  server1: { id: 'server1', name: 'Server 1 (VidSrc)', enabled: true },
  server2: { id: 'server2', name: 'Server 2 (VidSrc SBS)', enabled: true },
  server3: { id: 'server3', name: 'Server 3 (VidSrc To)', enabled: true },
  vidsrc_cc: { id: 'vidsrc_cc', name: 'VidSrc.cc', enabled: true },
  vidbinge: { id: 'vidbinge', name: 'VidBinge', enabled: true },
  embed_su: { id: 'embed_su', name: 'EmbedSU', enabled: true },
  flixembed: { id: 'flixembed', name: 'FlixEmbed', enabled: true },
};

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState(HARDCODED_SERVERS);
  const [heroMovies, setHeroMovies] = useState(['', '', '', '', '']);
  const [stats, setStats] = useState({ continueWatching: 0, ratings: 0 });

  // Custom server state
  const [customServers, setCustomServers] = useState([]);
  const [newServer, setNewServer] = useState({ name: '', movieUrl: '', tvUrl: '' });

  useEffect(() => {
    const loggedIn = localStorage.getItem('ayuflix_admin_logged_in') === 'true';
    setIsLoggedIn(loggedIn);

    if (loggedIn) {
      // Load server status
      const savedServers = localStorage.getItem('ayuflix_admin_server_status');
      if (savedServers) {
        const parsed = JSON.parse(savedServers);
        // Merge with hardcoded defaults
        setServerStatus({ ...HARDCODED_SERVERS, ...parsed });
      }

      // Load custom servers
      const savedCustom = localStorage.getItem('ayuflix_custom_servers');
      if (savedCustom) {
        setCustomServers(JSON.parse(savedCustom));
      }

      // Load hero movies
      const savedHero = localStorage.getItem('ayuflix_admin_hero_movies');
      if (savedHero) {
        const ids = JSON.parse(savedHero);
        setHeroMovies([...ids, ...Array(5 - ids.length).fill('')]);
      }

      // Load stats
      const continueWatching = JSON.parse(localStorage.getItem('ayuflix-continue') || '[]');
      const ratings = JSON.parse(localStorage.getItem('ayuflix_ratings') || '{}');
      setStats({
        continueWatching: continueWatching.length,
        ratings: Object.keys(ratings).length,
      });
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('ayuflix_admin_logged_in', 'true');
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('❌ Incorrect password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ayuflix_admin_logged_in');
    setIsLoggedIn(false);
    setPassword('');
  };

  const toggleServer = (serverId) => {
    const updated = {
      ...serverStatus,
      [serverId]: {
        ...serverStatus[serverId],
        enabled: !serverStatus[serverId]?.enabled,
      },
    };
    setServerStatus(updated);
    localStorage.setItem('ayuflix_admin_server_status', JSON.stringify(updated));
  };

  // Custom Server Management
  const addCustomServer = () => {
    if (!newServer.name.trim() || !newServer.movieUrl.trim()) {
      alert('⚠️ Server name and Movie URL are required.');
      return;
    }

    const id = `custom_${Date.now()}`;
    const server = {
      id,
      name: newServer.name.trim(),
      movieUrl: newServer.movieUrl.trim(),
      tvUrl: newServer.tvUrl.trim() || newServer.movieUrl.trim(),
    };

    const updated = [...customServers, server];
    setCustomServers(updated);
    localStorage.setItem('ayuflix_custom_servers', JSON.stringify(updated));

    // Also add to server status (enabled by default)
    const updatedStatus = {
      ...serverStatus,
      [id]: { id, name: server.name, enabled: true },
    };
    setServerStatus(updatedStatus);
    localStorage.setItem('ayuflix_admin_server_status', JSON.stringify(updatedStatus));

    setNewServer({ name: '', movieUrl: '', tvUrl: '' });
    alert('✅ Custom server added!');
  };

  const deleteCustomServer = (serverId) => {
    const updated = customServers.filter((s) => s.id !== serverId);
    setCustomServers(updated);
    localStorage.setItem('ayuflix_custom_servers', JSON.stringify(updated));

    // Remove from server status
    const updatedStatus = { ...serverStatus };
    delete updatedStatus[serverId];
    setServerStatus(updatedStatus);
    localStorage.setItem('ayuflix_admin_server_status', JSON.stringify(updatedStatus));
  };

  const saveHeroMovies = () => {
    const validIds = heroMovies.filter((id) => id.trim() !== '');
    localStorage.setItem('ayuflix_admin_hero_movies', JSON.stringify(validIds));
    alert('✅ Hero movies saved!');
  };

  const updateHeroMovie = (index, value) => {
    const updated = [...heroMovies];
    updated[index] = value;
    setHeroMovies(updated);
  };

  // Login Form
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-gray-900 border-2 border-red-600 rounded-xl p-8">
          <div className="text-center mb-6">
            <FaLock className="text-red-600 text-4xl mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-red-600">🔐 Admin Access</h1>
            <p className="text-gray-400 text-sm mt-2">Enter admin password to continue</p>
          </div>

          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full bg-gray-800 border border-red-600 text-white px-4 py-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-red-600"
            />

            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-all"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-black px-4 md:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          🛠️ AYUFLIX Admin Panel
        </h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Section 1: Server Management */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaServer className="text-red-500" /> Server Management
          </h2>
          <p className="text-gray-400 text-sm mb-4">Toggle servers ON/OFF. Disabled servers won&apos;t appear in the video player.</p>
          
          <div className="grid gap-3">
            {Object.entries(serverStatus).map(([id, server]) => (
              <div
                key={id}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                  server.enabled
                    ? 'bg-gray-800/50 border-green-600/50'
                    : 'bg-gray-900 border-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${server.enabled ? 'bg-green-500' : 'bg-gray-600'}`} />
                  <span className={`font-medium ${server.enabled ? 'text-white' : 'text-gray-500'}`}>
                    {server.name}
                  </span>
                  {id.startsWith('custom_') && (
                    <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded">Custom</span>
                  )}
                </div>
                <button
                  onClick={() => toggleServer(id)}
                  className={`text-2xl transition-all ${server.enabled ? 'text-green-500' : 'text-gray-600'}`}
                >
                  {server.enabled ? <FaToggleOn /> : <FaToggleOff />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Custom Server Manager */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaPlus className="text-red-500" /> Custom Servers (Add your own)
          </h2>
          <p className="text-gray-400 text-sm mb-4">Add custom video servers using URL templates. Use {'{id}'}, {'{season}'}, {'{episode}'} as placeholders.</p>

          {/* Add Form */}
          <div className="bg-gray-800 rounded-lg p-4 mb-4 space-y-3">
            <div>
              <label className="block text-gray-400 text-xs mb-1">Server Name</label>
              <input
                type="text"
                value={newServer.name}
                onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                placeholder="e.g., MyNewServer"
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
            <div>
              <label className="block text-gray-400 text-xs mb-1">TV URL Template (optional, uses Movie URL if empty)</label>
              <input
                type="text"
                value={newServer.tvUrl}
                onChange={(e) => setNewServer({ ...newServer, tvUrl: e.target.value })}
                placeholder="https://mysite.com/embed/tv/{id}/{season}/{episode}"
                className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-red-600"
              />
            </div>
            <button
              onClick={addCustomServer}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            >
              <FaPlus size={14} /> Add Server
            </button>
          </div>

          {/* Custom Servers List */}
          {customServers.length > 0 ? (
            <div className="space-y-2">
              {customServers.map((server) => (
                <div
                  key={server.id}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{server.name}</p>
                    <p className="text-gray-500 text-xs truncate">{server.movieUrl}</p>
                  </div>
                  <button
                    onClick={() => deleteCustomServer(server.id)}
                    className="ml-4 text-red-500 hover:text-red-400 p-2 transition-colors"
                  >
                    <FaTrash size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">No custom servers added yet.</p>
          )}
        </div>

        {/* Section 3: Hero Banner Management */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaFilm className="text-red-500" /> Hero Banner Management
          </h2>
          <p className="text-gray-400 text-sm mb-4">Enter TMDB Movie IDs to override the default trending movies in the hero carousel.</p>
          
          <div className="grid gap-3 mb-4">
            {heroMovies.map((id, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-gray-400 text-sm w-20">Movie {index + 1}:</span>
                <input
                  type="text"
                  value={id}
                  onChange={(e) => updateHeroMovie(index, e.target.value)}
                  placeholder="Enter TMDB ID (e.g., 550)"
                  className="flex-1 bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-red-600"
                />
              </div>
            ))}
          </div>

          <button
            onClick={saveHeroMovies}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all"
          >
            Save Hero Movies
          </button>
        </div>

        {/* Section 4: Site Stats */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaChartBar className="text-red-500" /> Site Stats
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-red-600">{stats.continueWatching}</p>
              <p className="text-gray-400 text-sm">Continue Watching</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-red-600">{stats.ratings}</p>
              <p className="text-gray-400 text-sm">User Ratings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
