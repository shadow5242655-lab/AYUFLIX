'use client';
import { useState, useEffect, useCallback } from 'react';
import { FaForward, FaSpinner } from 'react-icons/fa';
import { fetchImdbId } from '@/lib/tmdb';

// Only working servers
const HARDCODED_SERVERS = [
  {
    id: 'vidlink',
    name: 'VidLink',
    getUrl: (id, type, season, episode) => {
      if (type === 'tv') return `https://vidlink.pro/tv/${id}/${season}/${episode}`;
      return `https://vidlink.pro/movie/${id}`;
    }
  },
  {
    id: 'vidsrc_wiki',
    name: 'VidSrc',
    getUrl: (id, type, season, episode) => {
      if (type === 'tv') return `https://v1.vidsrc.wiki/embed/tv/${id}/${season}/${episode}/`;
      return `https://v1.vidsrc.wiki/embed/movie/${id}/`;
    }
  },
  {
    id: '2embed',
    name: '2Embed',
    getUrl: (id, type, season, episode) => {
      if (type === 'tv') return `https://www.2embed.cc/embed/${id}?s=${season}&e=${episode}`;
      return `https://www.2embed.cc/embed/${id}`;
    }
  },
  {
    id: 'multiembed',
    name: 'MultiEmbed',
    getUrl: (id, type, season, episode) => {
      if (type === 'tv') return `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`;
      return `https://multiembed.mov/?video_id=${id}&tmdb=1`;
    }
  },
];

// Convert custom server storage format to player format
function buildCustomServers(customServers) {
  return customServers.map((cs) => ({
    id: cs.id,
    name: cs.name,
    isCustom: true,
    getUrl: (mediaId, type, season, episode) => {
      let url = type === 'tv' ? cs.tvUrl : cs.movieUrl;
      if (!url) url = cs.movieUrl;
      return url
        .replace('{id}', mediaId)
        .replace('{season}', season)
        .replace('{episode}', episode);
    }
  }));
}

// Function to get filtered servers based on admin settings
function getFilteredServers() {
  try {
    const savedCustom = localStorage.getItem('ayuflix_custom_servers');
    const customServers = savedCustom ? buildCustomServers(JSON.parse(savedCustom)) : [];

    const mergedMap = new Map();
    HARDCODED_SERVERS.forEach((s) => mergedMap.set(s.id, s));
    customServers.forEach((s) => mergedMap.set(s.id, s));
    const allServers = Array.from(mergedMap.values());

    const savedStatus = localStorage.getItem('ayuflix_admin_server_status');
    if (savedStatus) {
      const status = JSON.parse(savedStatus);
      const enabledServers = allServers.filter((s) => status[s.id]?.enabled !== false);
      if (enabledServers.length > 0) {
        return enabledServers;
      }
    }
    return allServers;
  } catch {
    return HARDCODED_SERVERS;
  }
}

export default function VideoPlayer({ mediaId, type = 'movie', season = 1, episode = 1, onNextEpisode, hasNextEpisode }) {
  const [activeServerId, setActiveServerId] = useState(HARDCODED_SERVERS[0].id);
  const [servers, setServers] = useState(HARDCODED_SERVERS);
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Load servers on mount and listen for storage changes
  useEffect(() => {
    const updateServers = () => {
      const filteredServers = getFilteredServers();
      setServers(filteredServers);
      
      // If current active server is disabled, switch to first enabled server
      const currentServerExists = filteredServers.some((s) => s.id === activeServerId);
      if (!currentServerExists && filteredServers.length > 0) {
        setActiveServerId(filteredServers[0].id);
      }
    };

    updateServers();

    // Listen for storage changes (when admin panel updates server status)
    window.addEventListener('storage', updateServers);
    
    return () => window.removeEventListener('storage', updateServers);
  }, [activeServerId]);

  // Generate video URL when server or media changes
  useEffect(() => {
    const server = servers.find((s) => s.id === activeServerId) || servers[0];
    if (!server) return;
    const url = server.getUrl(mediaId, type, season, episode);
    setVideoUrl(url);
  }, [activeServerId, servers, mediaId, type, season, episode]);

  // All servers disabled
  if (servers.length === 0) {
    return (
      <div className="w-full bg-gray-900 rounded-xl border-2 border-gray-700 p-8 text-center">
        <p className="text-yellow-500 text-lg">⚠️ All servers are currently disabled. Please check back later.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-white text-lg sm:text-xl font-bold flex items-center gap-2">
          <span className="w-2 h-2 bg-red-600 rounded-full"></span>
          Now Playing
        </h2>
        {type === 'tv' && hasNextEpisode && onNextEpisode && (
          <button
            onClick={onNextEpisode}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
          >
            <FaForward size={14} />
            Next Episode
          </button>
        )}
      </div>

      <div className="relative w-full bg-black rounded-xl overflow-hidden border-2 sm:border-4 border-red-600">
        <div className="relative pt-[56.25%]">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <div className="text-center">
                <FaSpinner className="text-red-600 text-3xl animate-spin mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Loading...</p>
              </div>
            </div>
          ) : (
            <iframe
              key={`${mediaId}-${season}-${episode}-${activeServerId}`}
              src={videoUrl}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              allow="autoplay; encrypted-media; fullscreen"
            />
          )}
        </div>
      </div>

      <p className="text-gray-400 text-xs text-center mt-2">
        If video doesn&apos;t load, switch server below
      </p>

      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-3">
        <span className="text-gray-400 text-xs sm:text-sm mr-1">Server:</span>
        {servers.map((server) => (
          <button
            key={server.id}
            onClick={() => setActiveServerId(server.id)}
            className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium transition-all ${
              activeServerId === server.id
                ? 'bg-red-600 text-white'
                : server.isCustom
                  ? 'bg-purple-800 text-purple-200 hover:bg-purple-700'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {server.name}
          </button>
        ))}
      </div>
    </div>
  );
}
