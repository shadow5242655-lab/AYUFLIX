'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getMovieDetails, getMovieCredits, getSimilarMovies, getMovieRecommendations, imageUrl, fetchTrailer } from '@/lib/tmdb';
import { toggleMyListItem, isInMyList } from '@/lib/myList';
import { toast } from '@/lib/toast';
import VideoPlayer from '@/components/VideoPlayer';
import TrailerModal from '@/components/TrailerModal';
import MovieCard from '@/components/MovieCard';
import StarRating from '@/components/StarRating';
import CastList from '@/components/CastList';
import { FaPlay, FaPause, FaArrowLeft, FaPlus, FaCheck, FaFilm, FaShareAlt } from 'react-icons/fa';
import Link from 'next/link';

export default function MovieDetailPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [credits, setCredits] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [inMyList, setInMyList] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    if (!id) return;
    setNotFound(false);
    setMovie(null);
    Promise.all([
      getMovieDetails(id),
      getMovieCredits(id),
      getSimilarMovies(id),
      getMovieRecommendations(id),
    ])
    .then(([movieData, creditsData, similarData, recData]) => {
      if (!movieData?.id) {
        setNotFound(true);
        return;
      }
      setMovie(movieData);
      setCredits(creditsData);
      setSimilar(similarData);
      setRecommended(recData || []);
      document.title = `${movieData.title} (${movieData.release_date?.slice(0, 4) || ''}) — AYUFLIX`;

      // Check if in My List
      setInMyList(isInMyList(movieData.id));

      // Save to history
      const historyItem = {
        id: movieData.id,
        title: movieData.title,
        posterPath: movieData.poster_path,
        mediaType: 'movie',
        watchedAt: new Date().toISOString(),
      };

      const existingHistory = JSON.parse(localStorage.getItem('ayuflix-history') || '[]');
      const filteredHistory = existingHistory.filter((item) => item.id !== movieData.id);
      const updatedHistory = [historyItem, ...filteredHistory].slice(0, 50);
      localStorage.setItem('ayuflix-history', JSON.stringify(updatedHistory));
    })
    .catch(() => setNotFound(true));
  }, [id]);

  const handlePlay = () => {
    if (playing) {
      setPlaying(false);
      toast('Player paused — scroll down to resume', 'info');
      return;
    }
    // Save to continue watching
    const continueWatching = JSON.parse(localStorage.getItem('ayuflix-continue') || '[]');
    const item = {
      id: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      backdropPath: movie.backdrop_path,
      mediaType: 'movie',
      lastWatched: new Date().toISOString(),
    };
    const filtered = continueWatching.filter((i) => i.id !== movie.id);
    const updated = [item, ...filtered].slice(0, 20);
    localStorage.setItem('ayuflix-continue', JSON.stringify(updated));
    setPlaying(true);
    // Scroll player into view
    setTimeout(() => {
      document.getElementById('ayuflix-player')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleWatchTrailer = async () => {
    if (!id) return;
    const key = await fetchTrailer(id, 'movie');
    if (key) {
      setTrailerKey(key);
      setShowTrailer(true);
    } else {
      toast('🚫 No trailer available for this title.', 'error');
    }
  };

  const toggleList = () => {
    const nowIn = toggleMyListItem({
      id: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      mediaType: 'movie',
    });
    setInMyList(nowIn);
    toast(nowIn ? '✅ Added to My List' : 'Removed from My List', 'success');
  };

  const handleShare = async () => {
    const shareData = {
      title: `${movie.title} — AYUFLIX`,
      text: `Watch ${movie.title} on AYUFLIX!`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast('🔗 Link copied to clipboard!', 'success');
      }
    } catch {
      // User cancelled share
    }
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-red-500 text-xl font-bold">Movie not found 😕</p>
        <p className="text-gray-500 text-sm">It may have been removed or the link is wrong.</p>
        <Link href="/" className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors">
          Back to home
        </Link>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const director = credits?.crew?.find((c) => c.job === 'Director');
  // cast rendering handled by CastList component

  return (
    <div className="min-h-screen bg-black">
      {/* Backdrop */}
      <div className="relative h-[60vh] w-full">
        <img
          src={imageUrl(movie.backdrop_path, 'original')}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <Link href="/" className="absolute top-20 left-4 md:left-8 text-white hover:text-red-500 transition-colors z-20">
          <FaArrowLeft size={24} />
        </Link>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-screen-xl mx-auto px-4 md:px-8 -mt-32">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <img
            src={imageUrl(movie.poster_path, 'w500')}
            alt={movie.title}
            className="w-48 md:w-64 rounded-lg shadow-lg flex-shrink-0"
          />

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{movie.title}</h1>
            <p className="text-gray-400 text-sm mb-4">
              {movie.release_date?.split('-')[0]} •{' '}
              {movie.runtime} min •{' '}
              {movie.genres?.map((g) => g.name).join(', ')}
            </p>
            <p className="text-gray-300 mb-6 leading-relaxed">{movie.overview}</p>

            {director && (
              <p className="text-sm text-gray-400 mb-4">
                <span className="text-white font-semibold">Director:</span> {director.name}
              </p>
            )}

            {/* Cast */}
            {/* Cast — clickable, links to person pages */}
            <CastList cast={credits?.cast || []} limit={8} />

            {/* User Rating */}
            <div className="mb-6">
              <StarRating mediaId={movie.id} title={movie.title} />
            </div>

            {/* Netflix-style action buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handlePlay}
                className="flex items-center gap-2 bg-white text-black font-bold px-8 py-3 rounded hover:bg-gray-200 transition-all text-lg"
              >
                {playing ? (
                  <>
                    <FaPause size={20} /> Pause
                  </>
                ) : (
                  <>
                    <FaPlay size={20} /> Play
                  </>
                )}
              </button>

              <button
                onClick={toggleList}
                className={`flex items-center gap-2 px-6 py-3 rounded font-medium transition-all ${
                  inMyList
                    ? 'bg-white/20 text-white border border-white/40'
                    : 'bg-gray-700/80 text-white border border-gray-600 hover:bg-gray-600'
                }`}
              >
                {inMyList ? <FaCheck size={18} /> : <FaPlus size={18} />}
                {inMyList ? 'In My List' : 'My List'}
              </button>

              <button
                onClick={handleWatchTrailer}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded transition-all"
              >
                <FaFilm size={18} /> Watch Trailer
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 bg-gray-700/80 hover:bg-gray-600 text-white border border-gray-600 px-6 py-3 rounded font-medium transition-all"
              >
                <FaShareAlt size={16} /> Share
              </button>
            </div>
          </div>
        </div>

        {/* Video Player - Always visible */}
        <div id="ayuflix-player" className="mt-8">
          <VideoPlayer mediaId={movie.id} type="movie" />
        </div>

        {/* Trailer Modal */}
        {showTrailer && trailerKey && (
          <TrailerModal
            trailerKey={trailerKey}
            onClose={() => {
              setShowTrailer(false);
              setTrailerKey(null);
            }}
          />
        )}

        {/* Recommended for you (TMDB recommendations) */}
        {recommended.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-white mb-4">Recommended For You</h2>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-4">
              {recommended.slice(0, 20).map((m) => (
                <MovieCard key={m.id} movie={{ ...m, media_type: 'movie' }} />
              ))}
            </div>
          </div>
        )}

        {/* Similar Movies */}
        {similar.length > 0 && (
          <div className="mt-8 mb-16">
            <h2 className="text-xl font-bold text-white mb-4">More Like This</h2>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-4">
              {similar.map((m) => (
                <MovieCard key={m.id} movie={{ ...m, media_type: 'movie' }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
