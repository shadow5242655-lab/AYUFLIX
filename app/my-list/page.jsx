'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { imageUrl } from '@/lib/tmdb';
import { getMyList, removeFromMyList, listenToMyList } from '@/lib/myList';
import { toast } from '@/lib/toast';
import { FaArrowLeft, FaTrash, FaTv, FaFilm } from 'react-icons/fa';

export default function MyListPage() {
  const [list, setList] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setList(getMyList());
    return listenToMyList(setList);
  }, []);

  const remove = (item) => {
    removeFromMyList(item.id);
    toast(`Removed "${item.title}" from My List`, 'info');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-ayu-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ayu-black px-4 md:px-8 pt-8">
      <Link href="/" className="inline-flex items-center gap-2 text-white hover:text-red-500 transition-colors mb-6">
        <FaArrowLeft /> Back
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-3xl font-bold text-white">My List</h1>
        {list.length > 0 && (
          <span className="text-xs text-red-400 bg-red-600/10 border border-red-600/40 px-2 py-1 rounded-full">
            {list.length} title{list.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {list.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg mb-4">Your list is empty.</p>
          <p className="text-gray-500">Browse movies and TV shows to add them to your list.</p>
          <Link
            href="/"
            className="inline-block mt-6 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded transition-all"
          >
            Browse Titles
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-16">
          {list.map((item) => {
            const isTv = item.mediaType === 'tv' || item.media_type === 'tv';
            const href = isTv ? `/tv/${item.id}` : `/movie/${item.id}`;
            const poster = item.posterPath || item.poster_path;
            return (
              <div key={item.id} className="group relative">
                <Link href={href} className="block cursor-pointer">
                  <div className="relative overflow-hidden rounded-md transition-all duration-300 group-hover:scale-105 group-hover:ring-4 group-hover:ring-red-600">
                    {poster ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${poster}`}
                        alt={item.title}
                        className="w-full h-64 object-cover"
                      />
                    ) : (
                      <div className="w-full h-64 bg-gray-800 flex items-center justify-center text-gray-500">
                        No Image
                      </div>
                    )}
                    <span className="absolute top-2 left-2 bg-black/70 text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-600/60 flex items-center gap-1">
                      {isTv ? <FaTv size={9} /> : <FaFilm size={9} />}
                      {isTv ? 'TV' : 'Movie'}
                    </span>
                  </div>
                  <h3 className="text-white text-sm mt-2 truncate group-hover:text-red-400 transition-colors">
                    {item.title}
                  </h3>
                </Link>
                <button
                  onClick={() => remove(item)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 border border-gray-600 text-gray-400 hover:text-white hover:border-red-600 hover:bg-red-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  title="Remove from My List"
                >
                  <FaTrash size={11} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
