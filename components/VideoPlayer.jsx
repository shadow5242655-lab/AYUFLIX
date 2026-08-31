'use client';

import { useState, useEffect } from 'react';
import { FaServer, FaSync, FaCheck } from 'react-icons/fa';

const SERVERS = [
  {
    id: 1,
    name: 'Server 1',
    movieUrl: 'https://v1.vidsrc.wiki/embed/movie/',
    tvUrl: 'https://v1.vidsrc.wiki/embed/tv/',
  },
  {
    id: 2,
    name: 'Server 2',
    movieUrl: 'https://vidsrc.sbs/embed/movie/',
    tvUrl: 'https://vidsrc.sbs/embed/tv/',
  },
  {
    id: 3,
    name: 'Server 3',
    movieUrl: 'https://vidsrc.to/embed/movie/',
    tvUrl: 'https://vidsrc.to/embed/tv/',
  },
];

export default function VideoPlayer({ movieId, tvId, season, episode }) {
  const [loading, setLoading] = useState(true);
  const [currentServer, setCurrentServer] = useState(SERVERS[0]);
  const [triedServers, setTriedServers] = useState([SERVERS[0].id]);
  const [error, setError] = useState(false);
  const [key, setKey] = useState(0);

  const getSrc = (server) => {
    if (tvId) {
      return `${server.tvUrl}${tvId}/${season}/${episode}/`;
    }
    return `${server.movieUrl}${movieId}/`;
  };

  const src = getSrc(currentServer);

  const handleServerChange = (server) => {
    setCurrentServer(server);
    setLoading(true);
    setError(false);
    if (!triedServers.includes(server.id)) {
      setTriedServers([...triedServers, server.id]);
    }
    setKey((prev) => prev + 1);
  };

  const handleRetry = () => {
    setLoading(true);
    setError(false);
    setKey((prev) => prev + 1);
  };

  const handleNextServer = () => {
    const untriedServers = SERVERS.filter((s) => !triedServers.includes(s.id));
    if (untriedServers.length > 0) {
      handleServerChange(untriedServers[0]);
    } else {
      // All servers tried, cycle back to first
      handleServerChange(SERVERS[0]);
      setTriedServers([SERVERS[0].id]);
    }
  };

  return (
    <div className="relative w-full border-4 border-red-600 rounded-xl overflow-hidden bg-black">
      {/* Server Selector */}
      <div className="flex items-center justify-between bg-gray-900 px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <FaServer className="text-red-600" />
          <span className="text-white text-sm font-medium">Servers:</span>
        </div>
        <div className="flex gap-2">
          {SERVERS.map((server) => (
            <button
              key={server.id}
              onClick={() => handleServerChange(server)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-all ${
                currentServer.id === server.id
                  ? 'bg-red-600 text-white'
                  : triedServers.includes(server.id)
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {server.name}
              {triedServers.includes(server.id) && currentServer.id !== server.id && (
                <FaCheck size={10} className="text-green-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Video Container */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-white text-sm">Loading from {currentServer.name}...</span>
            </div>
          </div>
        )}

        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <div className="flex flex-col items-center gap-4 text-center px-4">
              <div className="text-4xl">🎬</div>
              <h3 className="text-white text-lg font-bold">Video Not Available</h3>
              <p className="text-gray-400 text-sm max-w-md">
                This video is not available on {currentServer.name}. 
                {triedServers.length < SERVERS.length 
                  ? ' Try another server.'
                  : ' All servers tried.'}
              </p>
              <div className="flex gap-3 flex-wrap justify-center">
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded font-medium hover:bg-red-700 transition-colors"
                >
                  <FaSync size={14} />
                  Retry
                </button>
                {triedServers.length < SERVERS.length && (
                  <button
                    onClick={handleNextServer}
                    className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded font-medium hover:bg-gray-200 transition-colors"
                  >
                    <FaServer size={14} />
                    Try Next Server
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <iframe
            key={key}
            src={src}
            className="w-full h-[70vh]"
            allowFullScreen
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
            title="Video Player"
          />
        )}
      </div>
    </div>
  );
}
