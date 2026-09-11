'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import MovieCard from './MovieCard';

export default function Top10Row({ title = 'Top 10 This Week', fetchFn }) {
  const [items, setItems] = useState([]);
  const rowRef = useRef(null);

  useEffect(() => {
    fetchFn?.().then(setItems).catch(() => setItems([]));
  }, [fetchFn]);

  if (items.length === 0) return null;

  const scroll = (direction) => {
    const container = rowRef.current;
    if (!container) return;
    const amount = container.offsetWidth * 0.8;
    container.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const top = items.slice(0, 10);

  return (
    <div className="relative group/row px-4 md:px-8 mb-10">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white text-lg md:text-xl font-bold">{title}</h2>
        <div className="hidden md:flex gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
          <button onClick={() => scroll('left')} className="w-8 h-8 rounded-full bg-gray-800 hover:bg-red-600 text-white flex items-center justify-center transition-all" aria-label="Scroll left">
            <FaChevronLeft size={12} />
          </button>
          <button onClick={() => scroll('right')} className="w-8 h-8 rounded-full bg-gray-800 hover:bg-red-600 text-white flex items-center justify-center transition-all" aria-label="Scroll right">
            <FaChevronRight size={12} />
          </button>
        </div>
      </div>

      <div ref={rowRef} className="flex gap-3 md:gap-5 overflow-x-auto scroll-smooth hide-scrollbar pb-2">
        {top.map((item, i) => (
          <div key={item.id} className="relative flex-shrink-0 flex items-end">
            {/* Giant rank number */}
            <span
              className="text-gray-800 font-black leading-none select-none -mr-6 md:-mr-8 hidden sm:block"
              style={{
                fontSize: '7rem',
                WebkitTextStroke: '2px #dc2626',
                color: i < 3 ? 'rgba(220, 38, 38, 0.25)' : 'transparent',
              }}
            >
              {i + 1}
            </span>
            <div className="relative z-10 w-[130px] md:w-[150px]">
              <span className="absolute -top-2 -left-1 z-20 bg-red-600 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center sm:hidden">
                {i + 1}
              </span>
              <MovieCard movie={item} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
