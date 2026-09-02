'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaChevronLeft, FaChevronRight, FaPlay } from 'react-icons/fa';
import { imageUrl } from '@/lib/tmdb';

export default function ContinueWatchingRow() {
  const [items, setItems] = useState([]);
  const rowRef = useRef(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('ayuflix-continue') || '[]');
    setItems(stored);
  }, []);

  if (items.length === 0) return null;

  const scroll = (direction) => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.offsetWidth * 0.75;
      rowRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const removeItem = (id) => {
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    localStorage.setItem('ayuflix-continue', JSON.stringify(updated));
  };

  const formatTime = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="relative group/row px-4 md:px-8 mb-8">
      <h2 className="text-white text-lg md:text-xl font-bold mb-3">Continue Watching</h2>

      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-20 w-10 flex items-center justify-center bg-black/60 text-red-600 opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-black/80"
        >
          <FaChevronLeft size={24} />
        </button>

        {/* Scrollable Row */}
        <div
          ref={rowRef}
          className="flex gap-2 overflow-x-auto scroll-smooth hide-scrollbar pb-2"
        >
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.mediaType === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`}
              className="relative flex-shrink-0 w-[130px] md:w-[160px] group/card"
            >
              {/* Poster with play overlay */}
              <div className="relative overflow-hidden rounded-md">
                <img
                  src={imageUrl(item.posterPath, 'w300')}
                  alt={item.title}
                  className="w-full h-[195px] md:h-[240px] object-cover transition-transform duration-300 group-hover/card:scale-110 group-hover/card:ring-4 group-hover/card:ring-red-600"
                />

                {/* Play icon overlay on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity bg-black/40">
                  <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                    <FaPlay size={16} className="text-white ml-0.5" />
                  </div>
                </div>

                {/* Red progress bar at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                  <div className="h-full bg-red-600" style={{ width: '45%' }} />
                </div>

                {/* Continue badge */}
                <div className="absolute top-1 left-1 bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded font-medium">
                  Continue
                </div>
              </div>

              <p className="text-gray-300 text-xs mt-1 truncate">{item.title}</p>
              <p className="text-gray-500 text-[10px]">{formatTime(item.lastWatched)}</p>
            </Link>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-20 w-10 flex items-center justify-center bg-black/60 text-red-600 opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-black/80"
        >
          <FaChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}
