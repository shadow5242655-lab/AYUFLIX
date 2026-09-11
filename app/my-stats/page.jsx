'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaClock, FaStar, FaListUl, FaFilm, FaTv, FaDownload, FaTrash, FaChartPie } from 'react-icons/fa';
import { readJSON, exportAllData, clearAllData, KEYS } from '@/lib/watchData';
import { toast } from '@/lib/toast';

export default function MyStatsPage() {
  const [stats, setStats] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const history = readJSON(KEYS.history);
    const myList = readJSON(KEYS.myList);
    const ratings = readJSON(KEYS.ratings, {});
    const episodes = readJSON(KEYS.episodes);
    const continueWatching = readJSON(KEYS.continue);

    // Rough watch-time estimate: movies ~110 min, episodes ~45 min
    const tvPages = history.filter((h) => h.mediaType === 'tv').length;
    const moviePages = history.filter((h) => h.mediaType === 'movie').length;
    const watchedEpisodes = episodes.length;
    const totalMinutes = moviePages * 110 + watchedEpisodes * 45 + tvPages * 15;
    const hours = Math.floor(totalMinutes / 60);

    // Episode keys look like "{tvId}-{season}-{episode}"
    const shows = new Set(episodes.map((k) => String(k).split('-')[0]));

    setStats({
      historyCount: history.length,
      listCount: myList.length,
      ratingsCount: Object.keys(ratings).length,
      episodesWatched: watchedEpisodes,
      showsCount: shows.size,
      continueCount: continueWatching.length,
      hours,
      minutes: totalMinutes % 60,
      avgRating:
        Object.keys(ratings).length > 0
          ? (Object.values(ratings).reduce((a, b) => a + b, 0) / Object.keys(ratings).length).toFixed(1)
          : '—',
    });
  }, []);

  if (!mounted || !stats) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(exportAllData(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ayuflix-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('📦 Your data has been exported', 'success');
  };

  const handleClear = () => {
    if (!window.confirm('Delete ALL your AYUFLIX data (history, list, ratings, progress)? This cannot be undone.')) return;
    clearAllData();
    setStats({
      historyCount: 0, listCount: 0, ratingsCount: 0, episodesWatched: 0,
      showsCount: 0, continueCount: 0, hours: 0, minutes: 0, avgRating: '—',
    });
    toast('🗑️ All local data cleared', 'info');
  };

  const cards = [
    { icon: FaClock, label: 'Estimated Watch Time', value: `${stats.hours}h ${stats.minutes}m`, color: 'text-red-500' },
    { icon: FaTv, label: 'Episodes Watched', value: stats.episodesWatched, color: 'text-green-500' },
    { icon: FaFilm, label: 'Titles in History', value: stats.historyCount, color: 'text-blue-400' },
    { icon: FaStar, label: 'Titles Rated', value: stats.ratingsCount, color: 'text-yellow-400' },
    { icon: FaStar, label: 'Your Avg Rating', value: `${stats.avgRating}${stats.avgRating !== '—' ? '/5' : ''}`, color: 'text-yellow-400' },
    { icon: FaListUl, label: 'My List', value: stats.listCount, color: 'text-purple-400' },
    { icon: FaTv, label: 'Shows Tracked', value: stats.showsCount, color: 'text-green-400' },
    { icon: FaClock, label: 'Continue Watching', value: stats.continueCount, color: 'text-orange-400' },
  ];

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-screen-lg mx-auto px-4 md:px-8">
        <div className="flex items-center gap-3 mb-2">
          <FaChartPie className="text-red-600 text-2xl" />
          <h1 className="text-2xl md:text-3xl font-bold text-white">My Stats</h1>
        </div>
        <p className="text-gray-500 text-sm mb-8">Your personal viewing dashboard — stored only in your browser.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {cards.map((c) => (
            <div key={c.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center hover:border-red-600/50 transition-colors">
              <c.icon className={`${c.color} text-xl mx-auto mb-2`} />
              <p className="text-white text-2xl font-bold">{c.value}</p>
              <p className="text-gray-500 text-xs mt-1">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Data management */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-bold mb-2">Your Data</h2>
          <p className="text-gray-500 text-sm mb-4">
            Export everything (history, list, ratings, progress) as JSON, or wipe it all.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
            >
              <FaDownload size={14} /> Export My Data
            </button>
            <button
              onClick={handleClear}
              className="flex items-center gap-2 bg-gray-800 hover:bg-red-900/60 border border-gray-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
            >
              <FaTrash size={14} /> Clear All Data
            </button>
            <Link
              href="/history"
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
            >
              <FaClock size={14} /> Watch History
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
