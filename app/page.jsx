'use client';

import HeroCarousel from '@/components/HeroCarousel';
import MovieRow from '@/components/MovieRow';
import HistoryRow from '@/components/HistoryRow';
import ContinueWatchingRow from '@/components/ContinueWatchingRow';
import { getTrending, getTopRated, getMoviesByGenre, getNowPlaying } from '@/lib/tmdb';
import { useCallback } from 'react';

export default function Home() {
  const trending = useCallback(() => getTrending(), []);
  const topRated = useCallback(() => getTopRated(), []);
  const nowPlaying = useCallback(() => getNowPlaying(), []);
  const action = useCallback(() => getMoviesByGenre(28), []);
  const comedy = useCallback(() => getMoviesByGenre(35), []);
  const horror = useCallback(() => getMoviesByGenre(27), []);
  const romance = useCallback(() => getMoviesByGenre(10749), []);
  const documentary = useCallback(() => getMoviesByGenre(99), []);

  return (
    <div className="bg-ayu-black min-h-screen">
      <HeroCarousel />

      <div className="relative z-10 -mt-16">
        <MovieRow title="Trending Now" fetchFn={trending} />
        <MovieRow title="Top Rated" fetchFn={topRated} />
        <ContinueWatchingRow />
        <HistoryRow />
        <MovieRow title="Now Playing" fetchFn={nowPlaying} />
        <MovieRow title="Action" fetchFn={action} />
        <MovieRow title="Comedy" fetchFn={comedy} />
        <MovieRow title="Horror" fetchFn={horror} />
        <MovieRow title="Romance" fetchFn={romance} />
        <MovieRow title="Documentaries" fetchFn={documentary} />
      </div>
    </div>
  );
}
