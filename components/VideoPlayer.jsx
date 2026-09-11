'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { FaSpinner, FaRedo } from 'react-icons/fa';
import { BUILTIN_SERVERS, buildServerUrl } from '@/lib/videoServers';
import { loadPlayerServers } from '@/lib/adminConfig';

// How long to wait for a server to respond before auto-switching to the next one
const SERVER_TIMEOUT_MS = 6000;
const LAST_SERVER_KEY = 'ayuflix_last_server';

// Fallback used before the shared config loads (or if the API is unreachable)
const FALLBACK_SERVERS = BUILTIN_SERVERS.map((s) => ({
  id: s.id,
  name: s.name,
  getUrl: (mediaId, type, season, episode) => buildServerUrl(s, mediaId, type, season, episode),
}));

function readLastServer() {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(LAST_SERVER_KEY) || '';
  } catch {
    return '';
  }
}

export default function VideoPlayer({ mediaId, type = 'movie', season = 1, episode = 1, onNextEpisode, hasNextEpisode }) {
  const [servers, setServers] = useState(FALLBACK_SERVERS);
  const [serverIndex, setServerIndex] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'failed'
  const [skipped, setSkipped] = useState([]); // names of servers that timed out
  const [nonce, setNonce] = useState(0); // bumped on manual retry to re-arm the timer
  const [startedVia, setStartedVia] = useState('auto');

  const serversRef = useRef(servers);
  serversRef.current = servers;
  const timeoutRef = useRef(null);

  // Load servers from the shared admin config and poll for changes,
  // so admin edits go live for every visitor without a reload.
  useEffect(() => {
    let cancelled = false;
    const load = () => {
      loadPlayerServers()
        .then((list) => {
          if (cancelled || list.length === 0) return;
          setServers(list);
        })
        .catch(() => {
          // keep fallback servers
        });
    };
    load();
    const interval = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Signature of every server's URL for this media — changes only when the
  // admin edits URLs or media changes, so the 30s poll doesn't restart playback.
  const urlSignature = useMemo(
    () => servers.map((s) => `${s.id}:${s.getUrl(mediaId, type, season, episode)}`).join('|'),
    [servers, mediaId, type, season, episode]
  );

  const activeIndex = Math.min(serverIndex, servers.length - 1);
  const activeServer = servers[activeIndex];
  const attempt = activeIndex + 1;

  // If the active server was removed/disabled by an admin, restart from the first
  useEffect(() => {
    if (serverIndex > 0 && !servers[serverIndex]) {
      setServerIndex(0);
    }
  }, [servers, serverIndex]);

  // Remember last server: start playback there if it's still enabled
  useEffect(() => {
    const last = readLastServer();
    if (!last) return;
    const idx = servers.findIndex((s) => s.id === last);
    if (idx > 0) {
      setServerIndex(idx);
      setStartedVia('memory');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSignature]);

  // Generate the video URL and arm the 6-second auto-fallback timer.
  // If the server doesn't respond in time, we automatically try the next one.
  useEffect(() => {
    const list = serversRef.current;
    if (list.length === 0) return;
    const idx = Math.min(serverIndex, list.length - 1);
    const server = list[idx];
    if (!server) return;

    setVideoUrl(server.getUrl(mediaId, type, season, episode));
    setStatus('loading');

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      // Server didn't respond within the timeout — mark it skipped and fall back
      setSkipped((prev) => (prev.includes(server.name) ? prev : [...prev, server.name]));
      if (idx < list.length - 1) {
        setServerIndex(idx + 1); // triggers this effect again for the next server
      } else {
        setStatus('failed'); // every server timed out
      }
    }, SERVER_TIMEOUT_MS);

    return () => clearTimeout(timeoutRef.current);
  }, [serverIndex, mediaId, type, season, episode, urlSignature, nonce]);

  // Clear any pending timer on unmount
  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  // The iframe fired onLoad — the server responded, stop the timer
  const handleIframeLoad = () => {
    clearTimeout(timeoutRef.current);
    setStatus('ready');
    // Persist so the next playback starts on this server
    try {
      localStorage.setItem(LAST_SERVER_KEY, activeServer?.id || '');
    } catch {
      // ignore
    }
  };

  const handleRetry = () => {
    setSkipped([]);
    setServerIndex(0);
    setNonce((n) => n + 1);
    setStartedVia('manual');
  };

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
          <span className="w-2 h-2 bg-red-600 rounded-full" />
          Now Playing
        </h2>
        {type === 'tv' && hasNextEpisode && onNextEpisode && (
          <button
            type="button"
            onClick={onNextEpisode}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
          >
            Next Episode
          </button>
        )}
      </div>

      <div className="relative w-full bg-black rounded-xl overflow-hidden border-2 sm:border-4 border-red-600">
        <div className="relative pt-[56.25%]">
          {videoUrl ? (
            <iframe
              key={`${mediaId}-${type}-${season}-${episode}-${activeServer?.id}-${nonce}`}
              src={videoUrl}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              allow="autoplay; encrypted-media; fullscreen"
              onLoad={handleIframeLoad}
            />
          ) : null}

          {status === 'loading' && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
              <div className="text-center px-4">
                <FaSpinner className="text-red-600 text-3xl animate-spin mx-auto mb-3" />
                <p className="text-white text-sm sm:text-base font-semibold">
                  Loading from {activeServer?.name || 'server'}...
                </p>
                <p className="text-gray-500 text-xs mt-1.5">
                  Server {attempt} of {servers.length} — switching automatically if it doesn&apos;t respond
                </p>
                {startedVia === 'memory' && (
                  <p className="text-gray-600 text-[10px] mt-1">Starting on your last-used server</p>
                )}
                {skipped.length > 0 && (
                  <p className="text-yellow-500/80 text-xs mt-2">Skipped: {skipped.join(', ')}</p>
                )}
              </div>
            </div>
          )}

          {status === 'failed' && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
              <div className="text-center px-4">
                <p className="text-red-500 text-lg font-bold mb-1">😢 No server responded</p>
                <p className="text-gray-400 text-xs sm:text-sm mb-4">
                  All {servers.length} servers timed out. Check your connection and try again.
                </p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all"
                >
                  <FaRedo className="text-xs" />
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="text-gray-400 text-xs text-center mt-2">
        If video doesn&apos;t load, switch server below — or wait, we auto-fallback every 6 seconds
      </p>

      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-3">
        <span className="text-gray-400 text-xs sm:text-sm mr-1">Server:</span>
        {servers.map((server, index) => {
          const isSkipped = skipped.includes(server.name);
          const isActive = activeIndex === index;
          return (
            <button
              key={server.id}
              type="button"
              onClick={() => setServerIndex(index)}
              className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-red-600 text-white'
                  : isSkipped
                    ? 'bg-gray-900 text-gray-600 line-through opacity-60 hover:opacity-100'
                    : server.isCustom
                      ? 'bg-purple-800 text-purple-200 hover:bg-purple-700'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
              title={isSkipped ? `${server.name} timed out earlier` : server.name}
            >
              {/* Status dot: green ready / yellow trying / red skipped */}
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isActive && status === 'ready'
                    ? 'bg-green-400'
                    : isActive && status === 'loading'
                      ? 'bg-yellow-400 animate-pulse'
                      : isSkipped
                        ? 'bg-red-900'
                        : 'bg-gray-600'
                }`}
              />
              {server.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
