'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getMovieDetails, getMovieCredits, getSimilarMovies, imageUrl } from '@/lib/tmdb';
import VideoPlayer from '@/components/VideoPlayer';
import MovieCard from '@/components/MovieCard';
import { FaPlay, FaPause, FaArrowLeft, FaPlus, FaCheck } from 'react-icons/fa';
import Link from 'next/link';

export default function MovieDetailPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [inMyList, setInMyList] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getMovieDetails(id),
      getMovieCredits(id),
      getSimilarMovies(id),
    ]).then(([movieData, creditsData, similarData]) => {
      setMovie(movieData);
      setCredits(creditsData);
      setSimilar(similarData);

      // Check if in My List
      const myList = JSON.parse(localStorage.getItem('ayuflix-mylist') || '[]');
      setInMyList(myList.some((item) => item.id === movieData.id));

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
    });
  }, [id]);

  const toggleMyList = () => {
    const myList = JSON.parse(localStorage.getItem('ayuflix-mylist') || '[]');
    if (inMyList) {
      const updated = myList.filter((item) => item.id !== movie.id);
      localStorage.setItem('ayuflix-mylist', JSON.stringify(updated));
      setInMyList(false);
    } else {
      const newItem = {
        id: movie.id,
        title: movie.title,
        posterPath: movie.poster_path,
        mediaType: 'movie',
        addedAt: new Date().toISOString(),
      };
      localStorage.setItem('ayuflix-mylist', JSON.stringify([newItem, ...myList]));
      setInMyList(true);
    }
  };

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const director = credits?.crew?.find((c) => c.job === 'Director');
  const cast = credits?.cast?.slice(0, 6) || [];

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
            {cast.length > 0 && (
              <div className="mb-6">
                <h3 className="text-white font-semibold mb-2">Cast</h3>
                <p className="text-gray-400 text-sm">{cast.map((c) => c.name).join(', ')}</p>
              </div>
            )}

            {/* Netflix-style action buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setPlaying(!playing)}
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
                onClick={toggleMyList}
                className={`flex items-center gap-2 px-6 py-3 rounded font-medium transition-all ${
                  inMyList 
                    ? 'bg-white/20 text-white border border-white/40' 
                    : 'bg-gray-700/80 text-white border border-gray-600 hover:bg-gray-600'
                }`}
              >
                {inMyList ? <FaCheck size={18} /> : <FaPlus size={18} />}
                {inMyList ? 'In My List' : 'My List'}
              </button>
            </div>
          </div>
        </div>

        {/* Video Player */}
        {playing && (
          <div className="mt-8">
            <VideoPlayer movieId={movie.id} />
          </div>
        )}

        {/* Similar Movies */}
        {similar.length > 0 && (
          <div className="mt-12 mb-16">
            <h2 className="text-xl font-bold text-white mb-4">More Like This</h2>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-4">
              {similar.map((m) => (
                <MovieCard key={m.id} movie={m} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
