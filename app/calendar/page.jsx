'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getOnTheAirTv, getSeasonDetails, imageUrl } from '@/lib/tmdb';
import { FaCalendarAlt, FaArrowLeft } from 'react-icons/fa';

export default function TvCalendarPage() {
  const [days, setDays] = useState([]); // [{ dateKey, label, episodes: [{show, ep}] }]
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const shows = await getOnTheAirTv();
        const top = (shows || []).slice(0, 8);

        // For each show, fetch its latest aired season's episodes (with air dates)
        const perShow = await Promise.all(
          top.map(async (show) => {
            try {
              const seasonNum = show.last_episode_to_air?.season_number;
              if (!seasonNum) return [];
              const details = await getSeasonDetails(show.id, seasonNum);
              return (details?.episodes || [])
                .filter((e) => e.air_date)
                .map((e) => ({ show, ep: e }));
            } catch {
              return [];
            }
          })
        );
        if (cancelled) return;

        // Group by day for the next 7 days
        const byDay = {};
        const order = [];
        for (let i = 0; i < 7; i++) {
          const key = new Date(Date.now() + i * 86400000).toISOString().slice(0, 10);
          byDay[key] = [];
          order.push(key);
        }
        perShow.flat().forEach(({ show, ep }) => {
          const key = ep.air_date?.slice(0, 10);
          if (key && byDay[key]) byDay[key].push({ show, ep });
        });

        setDays(
          order.map((dateKey, i) => {
            const d = new Date(dateKey + 'T00:00:00');
            return {
              dateKey,
              label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }),
              episodes: byDay[dateKey],
            };
          })
        );
      } catch {
        setDays([]);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-black px-4 md:px-8 py-6">
      <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-red-500 text-sm mb-6 transition-colors">
        <FaArrowLeft size={13} /> Home
      </Link>

      <h1 className="text-3xl font-black text-white flex items-center gap-3 mb-2">
        <FaCalendarAlt className="text-red-600" /> TV Calendar
      </h1>
      <p className="text-gray-500 text-sm mb-8">New episodes airing over the next 7 days.</p>

      {loading ? (
        <div className="grid gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 bg-gray-950 border border-gray-900 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-8 pb-16">
          {days.map((day) => (
            <div key={day.dateKey}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-lg font-bold text-white">{day.label}</h2>
                <span className="text-gray-600 text-xs">{day.dateKey}</span>
                <div className="flex-1 h-px bg-gray-900" />
                <span className="text-gray-600 text-xs">{day.episodes.length} new</span>
              </div>
              {day.episodes.length === 0 ? (
                <p className="text-gray-700 text-sm">No episodes airing.</p>
              ) : (
                <div className="grid gap-2">
                  {day.episodes.map(({ show, ep }) => (
                    <Link
                      key={`${show.id}-${ep.id}`}
                      href={`/tv/${show.id}`}
                      className="flex items-center gap-3 bg-gray-950 border border-gray-900 hover:border-red-600/50 rounded-xl p-2.5 transition-colors group"
                    >
                      <img
                        src={ep.still_path ? imageUrl(ep.still_path, 'w300') : imageUrl(show.poster_path, 'w300')}
                        alt=""
                        className="w-24 h-14 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-white text-sm font-medium truncate group-hover:text-red-400 transition-colors">{show.name}</p>
                        <p className="text-gray-500 text-xs truncate">
                          S{ep.season_number}:E{ep.episode_number} — {ep.name}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
