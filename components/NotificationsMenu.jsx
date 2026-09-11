'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaBell, FaTimes, FaFireAlt, FaBullhorn } from 'react-icons/fa';
import { imageUrl, getTrending, getTvTrending } from '@/lib/tmdb';
import { fetchAdminConfig } from '@/lib/adminConfig';

export default function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [announcement, setAnnouncement] = useState(null);
  const [seen, setSeen] = useState(true);
  const ref = useRef(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getTrending().catch(() => []), getTvTrending().catch(() => []), fetchAdminConfig().catch(() => null)])
      .then(([movies, tv, config]) => {
        if (cancelled) return;
        const mixed = [
          ...movies.slice(0, 3).map((m) => ({ ...m, media_type: 'movie' })),
          ...tv.slice(0, 3).map((t) => ({ ...t, media_type: 'tv' })),
        ];
        setItems(mixed);
        setAnnouncement(config?.announcement?.enabled ? config.announcement : null);
        setSeen(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => {
          setOpen((v) => !v);
          setSeen(true);
        }}
        className="text-white hover:text-red-500 transition-colors relative"
        aria-label="What's new"
        title="What's new"
      >
        <FaBell size={18} />
        {!seen && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full ring-2 ring-black animate-pulse" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 max-w-[90vw] bg-gray-950 border border-red-600/50 rounded-xl shadow-2xl shadow-red-900/30 overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <p className="text-white font-bold text-sm">What&apos;s New</p>
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white" aria-label="Close">
              <FaTimes size={12} />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {announcement?.text && (
              <div className="px-4 py-3 bg-red-600/15 border-b border-red-600/30 flex items-start gap-2">
                <FaBullhorn size={12} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-gray-200 text-xs">{announcement.text}</p>
              </div>
            )}

            <p className="text-gray-500 text-xs px-4 pt-3 pb-1 flex items-center gap-2">
              <FaFireAlt size={10} className="text-red-500" /> Trending right now
            </p>
            {items.map((item) => (
              <Link
                key={`${item.media_type}-${item.id}`}
                href={item.media_type === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-600/10 transition-colors"
              >
                {item.poster_path ? (
                  <img src={imageUrl(item.poster_path, 'w92')} alt="" className="w-8 h-12 object-cover rounded" />
                ) : (
                  <div className="w-8 h-12 bg-gray-800 rounded" />
                )}
                <div className="min-w-0">
                  <p className="text-white text-sm truncate">{item.title || item.name}</p>
                  <p className="text-gray-500 text-xs">
                    New {item.media_type === 'tv' ? 'series' : 'movie'}
                    {item.vote_average > 0 && ` • ⭐ ${item.vote_average.toFixed(1)}`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
