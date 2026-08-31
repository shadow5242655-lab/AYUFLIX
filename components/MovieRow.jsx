'use client';

import { useRef, useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import MovieCard from './MovieCard';

export default function MovieRow({ title, fetchFn }) {
  const rowRef = useRef(null);
  const [movies, setMovies] = useState([]);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  useEffect(() => {
    fetchFn().then(setMovies);
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

  return (
    <div className="relative px-4 md:px-8 mb-8 group/row">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-3">{title}</h2>

      <div className="relative">
        {/* Left Chevron */}
        {showLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-8 z-20 w-10 bg-black/60 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-black/80"
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
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>

        {/* Right Chevron */}
        {showRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-8 z-20 w-10 bg-black/60 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-black/80"
          >
            <FaChevronRight className="text-red-600 text-xl" />
          </button>
        )}
      </div>
    </div>
  );
}
