'use client';
import { useState } from 'react';

const SERVERS = [
  {
    id: 'server1',
    name: 'Server 1',
    getUrl: (id, type, season, episode) => {
      if (type === 'tv') {
        return `https://v1.vidsrc.wiki/embed/tv/${id}/${season}/${episode}/`;
      }
      return `https://v1.vidsrc.wiki/embed/movie/${id}/`;
    }
  },
  {
    id: 'server2',
    name: 'Server 2',
    getUrl: (id, type, season, episode) => {
      if (type === 'tv') {
        return `https://vidsrc.sbs/embed/tv/${id}/${season}/${episode}/`;
      }
      return `https://vidsrc.sbs/embed/movie/${id}/`;
    }
  },
  {
    id: 'server3',
    name: 'Server 3',
    getUrl: (id, type, season, episode) => {
      if (type === 'tv') {
        return `https://vidsrc.to/embed/tv/${id}/${season}/${episode}/`;
      }
      return `https://vidsrc.to/embed/movie/${id}/`;
    }
  },
];

export default function VideoPlayer({ mediaId, type = 'movie', season = 1, episode = 1 }) {
  const [activeServerId, setActiveServerId] = useState(SERVERS[0].id);

  const activeServer = SERVERS.find(s => s.id === activeServerId);
  const videoUrl = activeServer.getUrl(mediaId, type, season, episode);

  return (
    <div className="w-full">
      <h2 className="text-white text-lg sm:text-xl font-bold mb-2 flex items-center gap-2">
        <span className="w-2 h-2 bg-red-600 rounded-full"></span>
        Now Playing
      </h2>

      <div className="relative w-full bg-black rounded-xl overflow-hidden border-2 sm:border-4 border-red-600">
        <div className="relative pt-[56.25%]">
          <iframe
            src={videoUrl}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            allow="autoplay; encrypted-media; fullscreen"
          />
        </div>
      </div>

      <p className="text-gray-400 text-xs text-center mt-2">
        If video doesn't load, switch server below
      </p>

      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-3">
        <span className="text-gray-400 text-xs sm:text-sm mr-1">Server:</span>
        {SERVERS.map((server) => (
          <button
            key={server.id}
            onClick={() => setActiveServerId(server.id)}
            className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium transition-all ${
              activeServerId === server.id
                ? 'bg-red-600 text-white'
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
