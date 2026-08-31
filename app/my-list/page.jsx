'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

export default function MyListPage() {
  const [list, setList] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('ayuflix_my_list') || '[]');
      setList(stored);
    } catch {
      setList([]);
    }
  }, []);

  return (
    <div className="min-h-screen bg-ayu-black px-4 md:px-8 pt-8">
      <Link href="/" className="inline-flex items-center gap-2 text-white hover:text-red-500 transition-colors mb-6">
        <FaArrowLeft /> Back
      </Link>

      <h1 className="text-3xl font-bold text-white mb-6">My List</h1>

      {list.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg mb-4">Your list is empty.</p>
          <p className="text-gray-500">Browse movies and TV shows to add them to your list.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-16">
          {list.map((item) => {
            const href = item.media_type === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`;
            return (
              <Link key={item.id} href={href} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-md transition-all duration-300 group-hover:scale-110 group-hover:ring-4 group-hover:ring-red-600">
                  {item.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                      alt={item.title || item.name}
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-800 flex items-center justify-center text-gray-500">
                      No Image
                    </div>
                  )}
                </div>
                <h3 className="text-white text-sm mt-2 truncate group-hover:text-red-400 transition-colors">
                  {item.title || item.name}
                </h3>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
