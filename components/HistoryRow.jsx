'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { imageUrl } from '@/lib/tmdb';

export default function HistoryRow() {
  const [history, setHistory] = useState([]);
  const rowRef = useRef(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('ayuflix-history') || '[]');
    setHistory(stored);
  }, []);

  if (history.length === 0) return null;

  const scroll = (direction) => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.offsetWidth * 0.75;
      rowRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative group/row px-4 md:px-8 mb-8">
      <h2 className="text-white text-lg md:text-xl font-bold mb-3">History</h2>

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
          {history.map((item) => (
            <Link
              key={item.id}
              href={item.mediaType === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`}
              className="relative flex-shrink-0 w-[130px] md:w-[160px] group/card"
            >
              <img
                src={imageUrl(item.posterPath, 'w300')}
                alt={item.title}
                className="w-full h-[195px] md:h-[240px] object-cover rounded-md transition-transform duration-300 group-hover/card:scale-110 group-hover/card:z-10 group-hover/card:ring-4 group-hover/card:ring-red-600"
              />
              <p className="text-gray-300 text-xs mt-1 truncate">{item.title}</p>
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
