'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { FaSpinner, FaRedo, FaExpand, FaCompress, FaTv, FaCopy } from 'react-icons/fa';
import { BUILTIN_SERVERS, buildServerUrl } from '@/lib/videoServers';
import { loadPlayerServers } from '@/lib/adminConfig';
import { getPrefs } from '@/lib/userPrefs';
import { toast } from '@/lib/toast';

// How long to wait for a server to respond before auto-switching to the next one
const SERVER_TIMEOUT_MS = 6000;
const LAST_SERVER_KEY = 'ayuflix_last_server';
const THEATER_KEY = 'ayuflix_theater_mode';

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
  const [theater, setTheater] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const serversRef = useRef(servers);
  serversRef.current = servers;
  const timeoutRef = useRef(null);
  const wrapperRef = useRef(null);
  const containerRef = useRef(null);

  // Restore theater mode preference
  useEffect(() => {
    try {
      if (localStorage.getItem(THEATER_KEY) === '1' || getPrefs().theaterDefault) setTheater(true);
    } catch {
      // ignore
    }
  }, []);

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
      } else if (retryCount < 1) {
        // One silent full retry before giving up
        setRetryCount((c) => c + 1);
        setSkipped([]);
        setServerIndex(0);
        setNonce((n) => n + 1);
      } else {
        setStatus('failed'); // every server timed out (retried once)
      }
    }, SERVER_TIMEOUT_MS);

    return () => clearTimeout(timeoutRef.current);
  }, [serverIndex, mediaId, type, season, episode, urlSignature, nonce, retryCount]);

  // Clear any pending timer on unmount
  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  // Theater mode persistence + body styling
  useEffect(() => {
    try {
      localStorage.setItem(THEATER_KEY, theater ? '1' : '0');
    } catch {
      // ignore
    }
    if (theater) {
      document.body.classList.add('theater-mode');
      return () => document.body.classList.remove('theater-mode');
    }
  }, [theater]);

  // Fullscreen change listener
  useEffect(() => {
    const handler = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Keyboard shortcuts: 1-9 pick a server, T theater, F fullscreen
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (!containerRef.current) return;
      // Only respond when the player is roughly in view
      const rect = containerRef.current.getBoundingClientRect();
      const visible = rect.bottom > 0 && rect.top < window.innerHeight;
      if (!visible) return;

      if (/^[1-9]$/.test(e.key)) {
        const idx = Number(e.key) - 1;
        if (serversRef.current[idx]) {
          setServerIndex(idx);
          setSkipped([]);
          toast(`Switched to ${serversRef.current[idx].name}`, 'info');
        }
      } else if (e.key.toLowerCase() === 't') {
        setTheater((v) => !v);
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleFullscreen = () => {
    const el = wrapperRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      el.requestFullscreen?.().catch(() => toast('Fullscreen not available', 'error'));
    }
  };

  // The iframe fired onLoad — the server responded, stop the timer
  const handleIframeLoad = () => {
    clearTimeout(timeoutRef.current);
    setStatus('ready');
    setRetryCount(0);
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
    setRetryCount(0);
    setNonce((n) => n + 1);
    setStartedVia('manual');
  };

  const copyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(videoUrl);
      toast('🔗 Embed link copied!', 'success');
    } catch {
      toast('Could not copy link', 'error');
    }
  };

  if (servers.length === 0) {
    return (
      <div className="w-full bg-gray-900 rounded-xl border-2 border-gray-700 p-8 text-center">
        <p className="text-yellow-500 text-lg">⚠️ All servers are currently disabled. Please check back later.</p>
      </div>
    );
  }

  return (
    <div className={theater ? 'fixed inset-0 z-[70] bg-black flex flex-col' : 'w-full'}>
      {/* Theater top bar */}
      {theater && (
        <div className="flex items-center justify-between px-4 py-3 bg-black border-b border-gray-800">
          <p className="text-white font-bold flex items-center gap-2">
            <span className="w-2 h-2 bg-red-600 rounded-full" /> Theater Mode
          </p>
          <button
            type="button"
            onClick={() => setTheater(false)}
            className="text-gray-400 hover:text-white text-sm bg-gray-900 border border-gray-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            ✕ Exit theater (T)
          </button>
        </div>
      )}

      <div className={theater ? 'flex-1 flex flex-col items-center justify-center px-2' : 'w-full'}>
        <div ref={containerRef} className={theater ? 'w-full max-w-6xl' : 'w-full'}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-white text-lg sm:text-xl font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-red-600 rounded-full" />
              Now Playing
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTheater((v) => !v)}
                className="flex items-center gap-1.5 text-gray-400 hover:text-white bg-gray-900/80 border border-gray-700 px-2.5 py-1.5 rounded-lg text-xs transition-all"
                title="Theater mode (T)"
              >
                <FaTv size={12} /> {theater ? 'Exit' : 'Theater'}
              </button>
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
          </div>

          <div ref={wrapperRef} className="relative w-full bg-black rounded-xl overflow-hidden border-2 sm:border-4 border-red-600 shadow-red-glow">
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
                      All {servers.length} servers timed out (we even retried once). Check your connection and try again.
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
                  onClick={() => {
                    setServerIndex(index);
                    setSkipped([]);
                  }}
                  className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-red-600 text-white'
                      : isSkipped
                        ? 'bg-gray-900 text-gray-600 line-through opacity-60 hover:opacity-100'
                        : server.isCustom
                          ? 'bg-purple-800 text-purple-200 hover:bg-purple-700'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                  title={`${server.name} — press ${index + 1}`}
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
            <button
              type="button"
              onClick={copyEmbed}
              className="px-3 py-1 rounded-full text-[10px] sm:text-xs bg-gray-900 border border-gray-700 text-gray-400 hover:text-white hover:border-red-600 transition-all flex items-center gap-1.5"
              title="Copy this video's embed link"
            >
              <FaCopy size={10} /> Copy link
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="px-3 py-1 rounded-full text-[10px] sm:text-xs bg-gray-900 border border-gray-700 text-gray-400 hover:text-white hover:border-red-600 transition-all flex items-center gap-1.5"
              title="Fullscreen (F) — or double-click the video"
            >
              {fullscreen ? <FaCompress size={10} /> : <FaExpand size={10} />} {fullscreen ? 'Exit' : 'Fullscreen'}
            </button>
          </div>

          <p className="text-gray-600 text-[10px] text-center mt-2 hidden sm:block">
            Shortcuts: <kbd className="bg-gray-900 px-1 rounded">1-9</kbd> servers ·{' '}
            <kbd className="bg-gray-900 px-1 rounded">T</kbd> theater ·{' '}
            <kbd className="bg-gray-900 px-1 rounded">F</kbd> fullscreen
          </p>
        </div>
      </div>
    </div>
  );
}
