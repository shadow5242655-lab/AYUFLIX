'use client';

import HeroCarousel from '@/components/HeroCarousel';
import MovieRow from '@/components/MovieRow';
import Top10Row from '@/components/Top10Row';
import ContinueWatchingRow from '@/components/ContinueWatchingRow';
import RecentlyViewedRow from '@/components/RecentlyViewedRow';
import { FaFireAlt, FaRocket, FaBroadcastTower, FaStar, FaClock, FaTv, FaTheaterMasks, FaHeart, FaGhost, FaLaughSquint, FaVideo, FaHistory } from 'react-icons/fa';
import { getTrending, getTopRated, getMoviesByGenre, getNowPlaying, getTvTrending, getTopRatedTv, getUpcomingMovies, getOnTheAirTv, getAiringTodayTv } from '@/lib/tmdb';
import { useCallback } from 'react';

export default function Home() {
  const trending = useCallback(() => getTrending(), []);
  const topRated = useCallback(() => getTopRated(), []);
  const nowPlaying = useCallback(() => getNowPlaying(), []);
  const upcoming = useCallback(() => getUpcomingMovies(), []);
  const onTheAir = useCallback(() => getOnTheAirTv(), []);
  const airingToday = useCallback(() => getAiringTodayTv(), []);
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
        <RecentlyViewedRow />
        <Top10Row title="Top 10 Movies This Week" fetchFn={trending} />
        <MovieRow title="🔥 Trending Now" fetchFn={trending} icon={<FaFireAlt className="text-red-600" size={18} />} />
        <MovieRow title="Trending TV Shows" fetchFn={trendingTv} icon={<FaTv className="text-red-600" size={18} />} />
        <MovieRow title="In Theaters" fetchFn={nowPlaying} icon={<FaTheaterMasks className="text-red-600" size={18} />} />
        <MovieRow title="Coming Soon" fetchFn={upcoming} icon={<FaRocket className="text-red-600" size={18} />} />
        <MovieRow title="On the Air" fetchFn={onTheAir} icon={<FaBroadcastTower className="text-red-600" size={18} />} />
        <MovieRow title="Airing Today" fetchFn={airingToday} icon={<FaClock className="text-red-600" size={18} />} />
        <MovieRow title="Top Rated Movies" fetchFn={topRated} icon={<FaStar className="text-red-600" size={18} />} />
        <MovieRow title="Top Rated TV Shows" fetchFn={topTv} icon={<FaStar className="text-red-600" size={18} />} />
        <MovieRow title="Action" fetchFn={action} icon={<FaVideo className="text-red-600" size={18} />} />
        <MovieRow title="Comedy" fetchFn={comedy} icon={<FaLaughSquint className="text-red-600" size={18} />} />
        <MovieRow title="Horror" fetchFn={horror} icon={<FaGhost className="text-red-600" size={18} />} />
        <MovieRow title="Romance" fetchFn={romance} icon={<FaHeart className="text-red-600" size={18} />} />
        <MovieRow title="Documentaries" fetchFn={documentary} icon={<FaVideo className="text-red-600" size={18} />} />
      </div>
    </div>
  );
}
