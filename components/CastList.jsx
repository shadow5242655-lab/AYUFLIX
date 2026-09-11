'use client';

import Link from 'next/link';
import { FaUser } from 'react-icons/fa';

export default function CastList({ cast = [], limit = 8 }) {
  const people = cast.slice(0, limit);
  if (people.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-white font-semibold mb-2">Cast</h3>
      <div className="flex flex-wrap gap-2">
        {people.map((c) => (
          <Link
            key={`${c.id}-${c.credit_id || 'c'}`}
            href={`/person/${c.id}`}
            className="flex items-center gap-2 bg-gray-800/70 hover:bg-red-600/20 border border-gray-700 hover:border-red-600/60 rounded-full pl-1 pr-3 py-1 transition-colors group"
          >
            {c.profile_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w92${c.profile_path}`}
                alt={c.name}
                className="w-6 h-6 rounded-full object-cover"
                loading="lazy"
              />
            ) : (
              <span className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
                <FaUser size={10} className="text-gray-400" />
              </span>
            )}
            <span className="text-gray-200 group-hover:text-white text-xs">{c.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
