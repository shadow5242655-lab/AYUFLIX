'use client';

import HeroCarousel from '@/components/HeroCarousel';
import MovieRow from '@/components/MovieRow';
import Top10Row from '@/components/Top10Row';
import ContinueWatchingRow from '@/components/ContinueWatchingRow';
import { getTrending, getTopRated, getMoviesByGenre, getNowPlaying, getTvTrending, getTopRatedTv } from '@/lib/tmdb';
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
  const trendingTv = useCallback(() => getTvTrending(), []);
  const topTv = useCallback(() => getTopRatedTv(), []);

  return (
    <div className="bg-ayu-black min-h-screen">
      <HeroCarousel />

      <div className="relative z-10 -mt-16">
        <ContinueWatchingRow />
        <Top10Row title="Top 10 Movies This Week" fetchFn={trending} />
        <MovieRow title="Trending Movies" fetchFn={trending} />
        <MovieRow title="Trending TV Shows" fetchFn={trendingTv} />
        <MovieRow title="Top Rated Movies" fetchFn={topRated} />
        <MovieRow title="Top Rated TV Shows" fetchFn={topTv} />
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
