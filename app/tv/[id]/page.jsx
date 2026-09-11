'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getTvDetails, getTvCredits, getSimilarTv, getTvRecommendations, imageUrl, fetchTrailer } from '@/lib/tmdb';
import { toggleMyListItem, isInMyList } from '@/lib/myList';
import { toast } from '@/lib/toast';
import VideoPlayer from '@/components/VideoPlayer';
import TrailerModal from '@/components/TrailerModal';
import SeasonSelector from '@/components/SeasonSelector';
import EpisodeList from '@/components/EpisodeList';
import MovieCard from '@/components/MovieCard';
import StarRating from '@/components/StarRating';
import CastList from '@/components/CastList';
import { FaPlay, FaPause, FaArrowLeft, FaPlus, FaCheck, FaFilm, FaShareAlt } from 'react-icons/fa';
import Link from 'next/link';
import { markEpisodeWatched, getNextUnwatchedEpisode, getSeasonWatchedCount } from '@/lib/episodeTracker';

export default function TvDetailPage() {
  const { id } = useParams();
  const [tvData, setTvData] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [credits, setCredits] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [inMyList, setInMyList] = useState(false);
  const [seasonProgress, setSeasonProgress] = useState({ watched: 0, total: 0 });
  const [trailerKey, setTrailerKey] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    if (!id) return;
    setNotFound(false);
    setTvData(null);
    Promise.all([
      getTvDetails(id),
      getTvCredits(id),
      getSimilarTv(id),
      getTvRecommendations(id),
    ]).then(([data, creditsData, similarData, recData]) => {
      if (!data?.id) {
        setNotFound(true);
        return;
      }
      setTvData(data);
      setCredits(creditsData);
      setSimilar(similarData);
      setRecommended(recData || []);
      document.title = `${data.name} (${data.first_air_date?.slice(0, 4) || ''}) — AYUFLIX`;

      // Check if in My List
      setInMyList(isInMyList(data.id));

      // Resume from Continue Watching if available
      try {
        const continueWatching = JSON.parse(localStorage.getItem('ayuflix-continue') || '[]');
        const saved = continueWatching.find((i) => i.id === data.id);
        if (saved?.season && saved.season !== season) setSeason(saved.season);
        if (saved?.episode && saved.episode !== episode) setEpisode(saved.episode);
      } catch {
        // Ignore corrupt storage
      }

      // Save to history
      const historyItem = {
        id: data.id,
        title: data.name,
        posterPath: data.poster_path,
        mediaType: 'tv',
        watchedAt: new Date().toISOString(),
      };

      const existingHistory = JSON.parse(localStorage.getItem('ayuflix-history') || '[]');
      const filteredHistory = existingHistory.filter((item) => item.id !== data.id);
      const updatedHistory = [historyItem, ...filteredHistory].slice(0, 50);
      localStorage.setItem('ayuflix-history', JSON.stringify(updatedHistory));
    }).catch(() => setNotFound(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Update season progress when season/episode changes
  useEffect(() => {
    if (!tvData || !id) return;
    const currentSeasonData = tvData.seasons?.find((s) => s.season_number === season);
    const epCount = currentSeasonData?.episode_count || 0;
    const watched = getSeasonWatchedCount(id, season, epCount);
    setSeasonProgress({ watched, total: epCount });
  }, [id, season, tvData]);

  const saveToContinueWatching = useCallback((s, e) => {
    if (!tvData) return;
    const currentSeasonData = tvData.seasons?.find((x) => x.season_number === s);
    const continueWatching = JSON.parse(localStorage.getItem('ayuflix-continue') || '[]');
    const item = {
      id: tvData.id,
      title: tvData.name,
      posterPath: tvData.poster_path,
      backdropPath: tvData.backdrop_path,
      mediaType: 'tv',
      season: s,
      episode: e,
      totalEpisodes: currentSeasonData?.episode_count || 0,
      lastWatched: new Date().toISOString(),
    };
    const filtered = continueWatching.filter((i) => i.id !== tvData.id);
    const updated = [item, ...filtered].slice(0, 20);
    localStorage.setItem('ayuflix-continue', JSON.stringify(updated));
  }, [tvData]);

  const handlePlay = () => {
    if (playing) {
      setPlaying(false);
      toast('Player paused — scroll down to resume', 'info');
      return;
    }
    saveToContinueWatching(season, episode);

    // Mark current episode as watched
    markEpisodeWatched(tvData.id, season, episode);
    setPlaying(true);

    // Refresh progress
    const currentSeasonData = tvData.seasons?.find((s) => s.season_number === season);
    const epCount = currentSeasonData?.episode_count || 0;
    const watched = getSeasonWatchedCount(tvData.id, season, epCount);
    setSeasonProgress({ watched, total: epCount });

    // Scroll player into view
    setTimeout(() => {
      document.getElementById('ayuflix-player')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleNextEpisode = useCallback(() => {
    if (!tvData) return;
    const totalSeasons = tvData.number_of_seasons || 1;
    const episodesPerSeason = {};
    tvData.seasons?.forEach((s) => {
      if (s.season_number > 0) {
        episodesPerSeason[s.season_number] = s.episode_count || 0;
      }
    });

    const next = getNextUnwatchedEpisode(tvData.id, season, episode, totalSeasons, episodesPerSeason);
    if (next) {
      // Mark the episode we're leaving as watched
      markEpisodeWatched(tvData.id, season, episode);
      setSeason(next.season);
      setEpisode(next.episode);
      saveToContinueWatching(next.season, next.episode);
      toast(`▶️ S${next.season}:E${next.episode} loaded`, 'success');
    } else {
      toast("🎉 You're all caught up on this show!", 'info');
    }
  }, [tvData, season, episode, saveToContinueWatching]);

  const handleWatchTrailer = async () => {
    if (!id) return;
    const key = await fetchTrailer(id, 'tv');
    if (key) {
      setTrailerKey(key);
      setShowTrailer(true);
    } else {
      toast('🚫 No trailer available for this title.', 'error');
    }
  };

  const toggleList = () => {
    const nowIn = toggleMyListItem({
      id: tvData.id,
      title: tvData.name,
      posterPath: tvData.poster_path,
      mediaType: 'tv',
    });
    setInMyList(nowIn);
    toast(nowIn ? '✅ Added to My List' : 'Removed from My List', 'success');
  };

  const handleShare = async () => {
    const shareData = {
      title: `${tvData.name} — AYUFLIX`,
      text: `Watch ${tvData.name} on AYUFLIX!`,
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
        <p className="text-red-500 text-xl font-bold">Show not found 😕</p>
        <p className="text-gray-500 text-sm">It may have been removed or the link is wrong.</p>
        <Link href="/" className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors">
          Back to home
        </Link>
      </div>
    );
  }

  if (!tvData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // cast rendering handled by CastList component
  const hasNextEpisode = getNextUnwatchedEpisode(
    tvData.id,
    season,
    episode,
    tvData.number_of_seasons || 1,
    (tvData.seasons || []).reduce((acc, s) => {
      if (s.season_number > 0) acc[s.season_number] = s.episode_count || 0;
      return acc;
    }, {})
  ) !== null;

  return (
    <div className="min-h-screen bg-black">
      {/* Backdrop */}
      <div className="relative h-[60vh] w-full">
        <img
          src={imageUrl(tvData.backdrop_path, 'original')}
          alt={tvData.name}
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
            src={imageUrl(tvData.poster_path, 'w500')}
            alt={tvData.name}
            className="w-48 md:w-64 rounded-lg shadow-lg flex-shrink-0"
          />

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{tvData.name}</h1>
            <p className="text-gray-400 text-sm mb-4">
              {tvData.first_air_date?.split('-')[0]} –{' '}
              {tvData.status} •{' '}
              {tvData.number_of_seasons} Season{tvData.number_of_seasons !== 1 ? 's' : ''} •{' '}
              {tvData.genres?.map((g) => g.name).join(', ')}
            </p>
            <p className="text-gray-300 mb-6 leading-relaxed">{tvData.overview}</p>

            {/* Cast — clickable, links to person pages */}
            <CastList cast={credits?.cast || []} limit={8} />

            {/* User Rating */}
            <div className="mb-6">
              <StarRating mediaId={tvData.id} title={tvData.name} />
            </div>

            {/* Season Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">Season {season} Progress</h3>
                <span className="text-sm text-gray-400">
                  {seasonProgress.watched}/{seasonProgress.total} episodes watched
                </span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-600 rounded-full transition-all duration-500"
                  style={{
                    width: seasonProgress.total > 0
                      ? `${(seasonProgress.watched / seasonProgress.total) * 100}%`
                      : '0%',
                  }}
                />
              </div>
            </div>

            {/* Netflix-style action buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
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
                    <FaPlay size={20} /> Play S{season}:E{episode}
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

            <SeasonSelector
              tvId={tvData.id}
              season={season}
              episode={episode}
              onSeasonChange={setSeason}
              onEpisodeChange={setEpisode}
            />
          </div>
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

        {/* Episode List */}
        {tvData.seasons?.length > 0 ? (
          <EpisodeList
            tvId={tvData.id}
            tvData={tvData}
            selectedSeason={season}
            currentEpisode={episode}
            onEpisodeSelect={(ep) => {
              setEpisode(ep);
              const currentSeasonData = tvData.seasons?.find((s) => s.season_number === season);
              const epCount = currentSeasonData?.episode_count || 0;
              const watched = getSeasonWatchedCount(tvData.id, season, epCount);
              setSeasonProgress({ watched, total: epCount });
              saveToContinueWatching(season, ep);
            }}
          />
        ) : (
          <p className="text-gray-400 text-sm">No episodes available for this show.</p>
        )}

        {/* Video Player - Always visible */}
        <div id="ayuflix-player" className="mt-4">
          <VideoPlayer
            mediaId={tvData.id}
            type="tv"
            season={season}
            episode={episode}
            hasNextEpisode={hasNextEpisode}
            onNextEpisode={handleNextEpisode}
          />
        </div>

        {/* Recommended for you (TMDB recommendations) */}
        {recommended.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-white mb-4">Recommended For You</h2>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-4">
              {recommended.slice(0, 20).map((m) => (
                <MovieCard key={m.id} movie={{ ...m, media_type: 'tv' }} />
              ))}
            </div>
          </div>
        )}

        {/* Similar Shows */}
        {similar.length > 0 && (
          <div className="mt-8 mb-16">
            <h2 className="text-xl font-bold text-white mb-4">More Like This</h2>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-4">
              {similar.map((m) => (
                <MovieCard key={m.id} movie={{ ...m, media_type: 'tv' }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
