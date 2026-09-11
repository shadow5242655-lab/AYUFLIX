'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { imageUrl, getTrending, getMoviesByIds } from '@/lib/tmdb';
import { fetchAdminConfig } from '@/lib/adminConfig';

export default function HeroCarousel() {
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Shared admin config overrides the hero for everyone
      let heroIds = [];
      try {
        const config = await fetchAdminConfig();
        heroIds = (config.heroMovies || []).filter(Boolean);
      } catch {
        // API unreachable — fall back to trending
      }
      if (cancelled) return;
      if (heroIds.length > 0) {
        const data = await getMoviesByIds(heroIds.slice(0, 5));
        if (!cancelled && data.length > 0) {
          setMovies(data);
          return;
        }
      }
      getTrending().then((data) => {
        if (!cancelled) setMovies(data.slice(0, 5));
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const advanceSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  }, [movies.length]);

  useEffect(() => {
    if (movies.length < 2 || isHovered) return;
    const timer = setInterval(advanceSlide, 8000);
    return () => clearInterval(timer);
  }, [movies.length, isHovered, advanceSlide]);

  if (movies.length === 0) {
    return (
      <div className="w-full h-[85vh] bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const movie = movies[currentIndex];
  const title = movie.title || movie.name;
  // Trending TV can appear in the hero — route Play/More Info correctly
  const isTv = movie.media_type === 'tv' || Boolean(movie.first_air_date) || (!movie.release_date && Boolean(movie.name));
  const detailHref = isTv ? `/tv/${movie.id}` : `/movie/${movie.id}`;

  return (
    <div
      className="relative w-full h-[85vh] overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Backdrop */}
      <img
        key={movie.id}
        src={imageUrl(movie.backdrop_path, 'original')}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover animate-fade-in"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute bottom-[15%] left-4 md:left-8 max-w-2xl z-10">
        <h1 className="text-white text-4xl md:text-6xl font-black mb-4 drop-shadow-lg">{title}</h1>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-green-500 font-bold flex items-center gap-1">
            <span className="text-xs">⭐</span> {movie.vote_average?.toFixed(1)} Rating
          </span>
          <span className="text-gray-300 text-sm">{movie.release_date?.split('-')[0]}</span>
        </div>
        <p className="text-gray-200 text-sm md:text-base line-clamp-3 mb-6 max-w-xl drop-shadow">
          {movie.overview}
        </p>
        <div className="flex items-center gap-4">
          <Link
            href={detailHref}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded transition-all hover:scale-105"
          >
            ▶ Play
          </Link>
          <Link
            href={detailHref}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold px-8 py-3 rounded transition-all"
          >
            More Info
          </Link>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {movies.map((m, i) => (
          <button
            key={m.id}
            onClick={() => setCurrentIndex(i)}
            className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-red-600 w-6' : 'bg-gray-600 hover:bg-gray-400'}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
