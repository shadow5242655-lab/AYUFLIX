'use client';

import { useState } from 'react';
import Link from 'next/link';
import { fetchMoviesWithFilters, getByGenre, imageUrl } from '@/lib/tmdb';
import { GENRES } from '@/lib/tmdb';
import { toggleMyListItem } from '@/lib/myList';
import { toast } from '@/lib/toast';
import { FaDice, FaArrowLeft, FaPlus, FaCheck, FaPlay } from 'react-icons/fa';
import MovieCard from '@/components/MovieCard';

const DECADES = [
  { label: 'Any decade', value: '' },
  { label: '2020s', value: '2020-01-01|2029-12-31' },
  { label: '2010s', value: '2010-01-01|2019-12-31' },
  { label: '2000s', value: '2000-01-01|2009-12-31' },
  { label: '90s', value: '1990-01-01|1999-12-31' },
  { label: '80s', value: '1980-01-01|1989-12-31' },
  { label: '70s or older', value: '1900-01-01|1979-12-31' },
];

const LENGTHS = [
  { label: 'Any length', value: '' },
  { label: 'Under 90 min', value: '0|89' },
  { label: '90–120 min', value: '90|120' },
  { label: 'Over 2 hours', value: '121|400' },
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default function MovieNightPage() {
  const [mediaType, setMediaType] = useState('movie');
  const [genre, setGenre] = useState('');
  const [decade, setDecade] = useState('');
  const [length, setLength] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [result, setResult] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inList, setInList] = useState(false);

  const roll = async () => {
    setLoading(true);
    setResult(null);
    setInList(false);
    try {
      const params = {
        page: Math.floor(Math.random() * 5) + 1,
        'vote_count.gte': 100,
        include_adult: 'false',
      };
      if (genre) params.with_genres = genre;
      if (minRating) params['vote_average.gte'] = minRating;
      if (decade) {
        const [from, to] = decade.split('|');
        if (mediaType === 'movie') {
          params['primary_release_date.gte'] = from;
          params['primary_release_date.lte'] = to;
        } else {
          params['first_air_date.gte'] = from;
          params['first_air_date.lte'] = to;
        }
      }
      if (length && mediaType === 'movie') {
        const [min, max] = length.split('|');
        params['with_runtime.lte'] = max;
        params['with_runtime.gte'] = min;
      }

      const data = mediaType === 'movie' ? await fetchMoviesWithFilters(params) : await getByGenre('tv', genre || 18, params.page);
      const list = (Array.isArray(data) ? data : data?.results || []).filter(
        (m) => m.poster_path && (m.vote_count || 0) >= 100
      );
      if (list.length === 0) {
        toast('No matches for those filters — try loosening them', 'error');
        setLoading(false);
        return;
      }
      setCandidates(list.slice(0, 6));
      setResult(pick(list));
    } catch {
      toast('Could not fetch a pick — try again', 'error');
    }
    setLoading(false);
  };

  const reroll = () => {
    if (candidates.length > 0) {
      const next = pick(candidates);
      setResult(next);
      setInList(false);
    } else {
      roll();
    }
  };

  const current = mediaType === 'movie' ? GENRES : null;

  return (
    <div className="min-h-screen bg-black px-4 md:px-8 py-6">
      <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-red-500 text-sm mb-6 transition-colors">
        <FaArrowLeft size={13} /> Home
      </Link>

      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-white flex items-center justify-center gap-3">
          <FaDice className="text-red-600" /> Movie Night Picker
        </h1>
        <p className="text-gray-500 text-sm mt-2">Can&apos;t decide? Set your mood and let fate choose.</p>
      </div>

      <div className="max-w-3xl mx-auto bg-gray-950 border border-gray-800 rounded-2xl p-5 md:p-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-500 text-xs uppercase font-bold tracking-wider mb-1.5">Watch</label>
            <div className="flex gap-2">
              {['movie', 'tv'].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setMediaType(t);
                    setResult(null);
                  }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                    mediaType === t ? 'bg-red-600 text-white border-red-600' : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
                  }`}
                >
                  {t === 'movie' ? '🎬 Movie' : '📺 TV Show'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-gray-500 text-xs uppercase font-bold tracking-wider mb-1.5">Genre</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 text-white text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-red-600"
            >
              <option value="">Any genre</option>
              {mediaType === 'movie'
                ? Object.entries(GENRES).map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))
                : [10759, 16, 35, 80, 99, 18, 9648, 10765].map((id) => (
                    <option key={id} value={id}>
                      {{ 10759: 'Action & Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime', 99: 'Documentary', 18: 'Drama', 9648: 'Mystery', 10765: 'Sci-Fi & Fantasy' }[id]}
                    </option>
                  ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-500 text-xs uppercase font-bold tracking-wider mb-1.5">Era</label>
            <select
              value={decade}
              onChange={(e) => setDecade(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 text-white text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-red-600"
            >
              {DECADES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-500 text-xs uppercase font-bold tracking-wider mb-1.5">Runtime</label>
            <select
              value={length}
              onChange={(e) => setLength(e.target.value)}
              disabled={mediaType === 'tv'}
              className="w-full bg-gray-900 border border-gray-800 text-white text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-red-600 disabled:opacity-40"
            >
              {LENGTHS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-gray-500 text-xs uppercase font-bold tracking-wider mb-1.5">
            Minimum rating: {minRating > 0 ? `${minRating}+` : 'any'}
          </label>
          <input
            type="range"
            min="0"
            max="9"
            step="1"
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="w-full accent-red-600"
          />
        </div>

        <button
          onClick={roll}
          disabled={loading}
          className="w-full mt-5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-lg transition-all flex items-center justify-center gap-3"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <FaDice size={20} /> {result ? 'Roll Again' : 'Spin the Wheel'}
            </>
          )}
        </button>

        {result && (
          <div className="mt-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row gap-5 bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <img
                src={imageUrl(result.poster_path, 'w342')}
                alt={result.title || result.name}
                className="w-40 rounded-xl mx-auto sm:mx-0 shadow-red-glow"
              />
              <div className="flex-1 text-center sm:text-left">
                <p className="text-red-500 text-xs font-bold uppercase tracking-widest mb-1">Tonight you&apos;re watching</p>
                <h2 className="text-2xl font-bold text-white">{result.title || result.name}</h2>
                <p className="text-gray-500 text-sm mt-1">
                  {result.release_date?.slice(0, 4) || result.first_air_date?.slice(0, 4)} • ⭐ {result.vote_average?.toFixed(1)}
                  {result.runtime ? ` • ${result.runtime} min` : ''}
                </p>
                <p className="text-gray-400 text-sm mt-3 line-clamp-4">{result.overview}</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
                  <Link
                    href={mediaType === 'movie' ? `/movie/${result.id}` : `/tv/${result.id}`}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-all"
                  >
                    <FaPlay size={12} /> Watch it
                  </Link>
                  <button
                    onClick={() => {
                      const nowIn = toggleMyListItem({
                        id: result.id,
                        title: result.title || result.name,
                        posterPath: result.poster_path,
                        mediaType,
                      });
                      setInList(nowIn);
                      toast(nowIn ? '✅ Added to My List' : 'Removed from My List', 'success');
                    }}
                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-all"
                  >
                    {inList ? <FaCheck size={12} className="text-green-400" /> : <FaPlus size={12} />}
                    {inList ? 'Saved' : 'My List'}
                  </button>
                  <button
                    onClick={reroll}
                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-all"
                  >
                    <FaDice size={12} /> Re-roll
                  </button>
                </div>
              </div>
            </div>

            {candidates.length > 1 && (
              <div className="mt-5">
                <p className="text-gray-600 text-xs uppercase font-bold tracking-wider mb-2">Also in the hat tonight</p>
                <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                  {candidates
                    .filter((c) => c.id !== result.id)
                    .slice(0, 5)
                    .map((c) => (
                      <div key={c.id} className="flex-shrink-0 w-32 opacity-80">
                        <MovieCard movie={{ ...c, media_type: mediaType }} />
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
