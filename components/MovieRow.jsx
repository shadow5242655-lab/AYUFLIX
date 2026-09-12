'use client';

import { useRef, useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import MovieCard from './MovieCard';

function CardSkeleton() {
  return (
    <div className="flex-shrink-0 w-44 animate-pulse">
      <div className="w-full h-64 bg-gray-900 rounded-md" />
      <div className="h-3 bg-gray-900 rounded mt-2 w-3/4" />
    </div>
  );
}

export default function MovieRow({ title, fetchFn, icon }) {
  const rowRef = useRef(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetchFn()
      .then((data) => {
        if (cancelled) return;
        setMovies(data || []);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchFn]);

  const scroll = (direction) => {
    const container = rowRef.current;
    if (!container) return;
    const scrollAmount = container.offsetWidth * 0.8;
    container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  const handleScroll = () => {
    const container = rowRef.current;
    if (!container) return;
    setShowLeft(container.scrollLeft > 10);
    setShowRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 10);
  };

  if (!loading && (error || movies.length === 0)) {
    if (error) {
      return (
        <div className="px-4 md:px-8 mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-3">{title}</h2>
          <p className="text-gray-600 text-sm">Couldn&apos;t load this row — check your connection.</p>
        </div>
      );
    }
    return null; // empty rows just don't render
  }

  return (
    <div className="relative px-4 md:px-8 mb-8 group/row">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-3 flex items-center gap-2">
        {icon}
        {title}
      </h2>

      <div className="relative">
        {/* Left Chevron — always visible on mobile */}
        {showLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-8 z-20 w-10 bg-black/60 flex items-center justify-center opacity-60 md:opacity-0 md:group-hover/row:opacity-100 transition-opacity hover:bg-black/80"
            aria-label={`Scroll ${title} left`}
          >
            <FaChevronLeft className="text-red-600 text-xl" />
          </button>
        )}

        {/* Movie Strip */}
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex gap-2.5 overflow-x-auto hide-scrollbar scroll-smooth pb-4"
        >
          {loading
            ? Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)
            : movies.map((movie) => <MovieCard key={`${movie.id}-${movie.media_type || 'm'}`} movie={movie} />)}
        </div>

        {/* Right Chevron — always visible on mobile */}
        {showRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-8 z-20 w-10 bg-black/60 flex items-center justify-center opacity-60 md:opacity-0 md:group-hover/row:opacity-100 transition-opacity hover:bg-black/80"
            aria-label={`Scroll ${title} right`}
          >
            <FaChevronRight className="text-red-600 text-xl" />
          </button>
        )}
      </div>
    </div>
  );
}
