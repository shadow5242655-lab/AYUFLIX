'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { imageUrl } from '@/lib/tmdb';
import { FaTrash, FaClock, FaFilm, FaTv } from 'react-icons/fa';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('ayuflix-history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const removeFromHistory = (id) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    localStorage.setItem('ayuflix-history', JSON.stringify(updated));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('ayuflix-history');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20 pb-16">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <FaClock className="text-red-600 text-2xl" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">Watch History</h1>
          </div>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="flex items-center gap-2 text-red-600 hover:text-red-500 transition-colors text-sm"
            >
              <FaTrash size={14} />
              Clear All
            </button>
          )}
        </div>

        {/* Empty State */}
        {history.length === 0 ? (
          <div className="text-center py-20">
            <FaClock className="text-gray-600 text-6xl mx-auto mb-4" />
            <h2 className="text-xl text-gray-400 mb-2">No watch history yet</h2>
            <p className="text-gray-500 mb-6">Start watching movies and TV shows to build your history</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded font-medium hover:bg-red-700 transition-colors"
            >
              <FaFilm size={16} />
              Browse Content
            </Link>
          </div>
        ) : (
          /* History Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {history.map((item) => (
              <div key={item.id} className="relative group">
                <Link href={item.mediaType === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`}>
                  <div className="relative overflow-hidden rounded-lg aspect-[2/3]">
                    <img
                      src={imageUrl(item.posterPath, 'w500')}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm font-medium">View Details</span>
                    </div>
                  </div>
                </Link>
                
                {/* Remove Button */}
                <button
                  onClick={() => removeFromHistory(item.id)}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <FaTrash size={12} className="text-white" />
                </button>

                {/* Info */}
                <div className="mt-2">
                  <Link href={item.mediaType === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`}>
                    <h3 className="text-white text-sm font-medium truncate hover:text-red-500 transition-colors">
                      {item.title}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    {item.mediaType === 'tv' ? (
                      <FaTv className="text-gray-500 text-xs" />
                    ) : (
                      <FaFilm className="text-gray-500 text-xs" />
                    )}
                    <span className="text-gray-500 text-xs">{formatTime(item.watchedAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
