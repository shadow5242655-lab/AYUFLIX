'use client';

import Link from 'next/link';
import { imageUrl } from '@/lib/tmdb';
import { FaPlay } from 'react-icons/fa';

export default function MovieCard({ movie }) {
  return (
    <Link href={`/movie/${movie.id}`} className="group relative flex-shrink-0 w-44 cursor-pointer z-0">
      <div className="relative overflow-hidden rounded-md transition-all duration-300 group-hover:scale-110 group-hover:z-30 group-hover:ring-4 group-hover:ring-red-600 group-hover:shadow-red-glow">
        <img
          src={imageUrl(movie.poster_path, 'w500')}
          alt={movie.title || movie.name}
          className="w-full h-64 object-cover"
        />

        {/* Rating Badge */}
        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">
          ⭐ {movie.vote_average?.toFixed(1)}
        </div>

        {/* Play Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-red-glow">
            <FaPlay size={16} className="text-white ml-0.5" />
          </div>
        </div>
      </div>

      <h3 className="text-white text-sm mt-2 truncate group-hover:text-red-400 transition-colors">
        {movie.title || movie.name}
      </h3>
    </Link>
  );
}
