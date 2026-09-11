'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getPersonDetails, getPersonCredits, imageUrl } from '@/lib/tmdb';
import MovieCard from '@/components/MovieCard';
import { FaArrowLeft } from 'react-icons/fa';

export default function PersonPage() {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [credits, setCredits] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setPerson(null);
    setError(false);
    Promise.all([getPersonDetails(id), getPersonCredits(id)])
      .then(([details, creditsData]) => {
        setPerson(details);
        // Most relevant credits first, movies+TV mixed, dedup by id
        const known = (creditsData.cast || [])
          .filter((c) => c.media_type !== 'person' && c.poster_path)
          .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        const seen = new Set();
        setCredits(known.filter((c) => (seen.has(`${c.media_type}-${c.id}`) ? false : seen.add(`${c.media_type}-${c.id}`))));
      })
      .catch(() => setError(true));
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-red-500 text-xl font-bold">Person not found</p>
        <Link href="/" className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors">
          Back to home
        </Link>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const birthday = person.birthday
    ? new Date(person.birthday).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : null;
  const age = person.birthday && !person.deathday
    ? Math.floor((Date.now() - new Date(person.birthday)) / (365.25 * 24 * 3600 * 1000))
    : null;

  return (
    <div className="min-h-screen bg-black pb-16">
      {/* Header */}
      <div className="relative bg-gradient-to-b from-red-950/60 via-gray-950 to-black pt-20 pb-10">
        <div className="max-w-screen-xl mx-auto px-4 md:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-white hover:text-red-500 transition-colors mb-6">
            <FaArrowLeft /> Back
          </Link>
          <div className="flex flex-col sm:flex-row gap-6">
            {person.profile_path ? (
              <img
                src={imageUrl(person.profile_path, 'w342')}
                alt={person.name}
                className="w-40 md:w-52 rounded-xl shadow-lg shadow-red-900/30 flex-shrink-0"
              />
            ) : (
              <div className="w-40 md:w-52 h-60 md:h-78 bg-gray-900 rounded-xl flex items-center justify-center text-gray-600 flex-shrink-0">
                No photo
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{person.name}</h1>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400 mb-4">
                {person.known_for_department && <span>🎭 {person.known_for_department}</span>}
                {birthday && <span>🎂 {birthday}{age ? ` (${age} yrs)` : ''}</span>}
                {person.place_of_birth && <span>📍 {person.place_of_birth}</span>}
              </div>
              {person.biography && (
                <p className="text-gray-300 text-sm leading-relaxed line-clamp-6 max-w-2xl">{person.biography}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Known for */}
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 mt-8">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
          Known For <span className="text-gray-500 text-base font-normal">({credits.length} titles)</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {credits.slice(0, 24).map((c) => (
            <div key={`${c.media_type}-${c.id}`}>
              <MovieCard movie={{ ...c, title: c.title || c.name }} />
              {c.character && (
                <p className="text-gray-500 text-xs mt-1 truncate">as {c.character}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
