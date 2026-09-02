'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { imageUrl, getTrending, getMoviesByIds } from '@/lib/tmdb';

export default function HeroCarousel() {
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Check for admin hero movies first
    try {
      const savedHero = localStorage.getItem('ayuflix_admin_hero_movies');
      if (savedHero) {
        const ids = JSON.parse(savedHero);
        if (ids.length > 0) {
          getMoviesByIds(ids).then((data) => {
            if (data.length > 0) {
              setMovies(data.slice(0, 5));
            } else {
              // Fallback to trending
              getTrending().then((trending) => setMovies(trending.slice(0, 5)));
            }
          });
          return;
        }
      }
    } catch {
      // Ignore errors
    }

    // Default: use trending
    getTrending().then((data) => setMovies(data.slice(0, 5)));
  }, []);

  const advanceSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  }, [movies.length]);

  useEffect(() => {
    if (isHovered || movies.length === 0) return;
    const timer = setInterval(advanceSlide, 5000);
    return () => clearInterval(timer);
  }, [isHovered, movies.length, advanceSlide]);

  if (movies.length === 0) return <div className="h-[80vh] bg-ayu-black" />;

  const movie = movies[currentIndex];

  return (
    <div
      className="relative h-[80vh] w-full overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Image */}
      {movies.map((m, i) => (
        <div
          key={m.id}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === currentIndex ? 1 : 0 }}
        >
          <img
            src={imageUrl(m.backdrop_path, 'original')}
            alt={m.title}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-24 left-4 md:left-16 max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
          {movie.title}
        </h1>
        <p className="text-gray-300 text-sm md:text-base mb-6 line-clamp-2">
          {movie.overview}
        </p>
        <div className="flex gap-3">
          <Link
            href={`/movie/${movie.id}`}
            className="flex items-center gap-2 bg-white text-red-600 font-bold px-6 py-2.5 rounded hover:bg-gray-200 transition-colors shadow-red-glow-sm"
          >
            ▶ Play
          </Link>
          <Link
            href={`/movie/${movie.id}`}
            className="flex items-center gap-2 bg-transparent border-2 border-red-600 text-white font-bold px-6 py-2.5 rounded hover:bg-red-600/20 transition-colors"
          >
            ℹ️ More Info
          </Link>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {movies.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-3 h-1 rounded-full transition-all ${
              i === currentIndex ? 'bg-red-600 w-8' : 'bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
