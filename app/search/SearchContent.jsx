'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchMulti, imageUrl } from '@/lib/tmdb';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

export default function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    searchMulti(query).then((data) => {
      setResults(data.filter((r) => r.media_type === 'movie' || r.media_type === 'tv'));
      setLoading(false);
    });
  }, [query]);

  return (
    <div className="min-h-screen bg-ayu-black px-4 md:px-8 pt-8">
      <Link href="/" className="inline-flex items-center gap-2 text-white hover:text-red-500 transition-colors mb-6">
        <FaArrowLeft /> Back
      </Link>

      <h1 className="text-3xl font-bold text-white mb-2">
        Search Results for &quot;{query}&quot;
      </h1>
      <p className="text-gray-400 mb-6">{results.length} results found</p>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No results found. Try a different search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-16">
          {results.map((item) => {
            const href = item.media_type === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`;
            return (
              <Link key={item.id} href={href} className="group relative flex-shrink-0 cursor-pointer">
                <div className="relative overflow-hidden rounded-md transition-all duration-300 group-hover:scale-110 group-hover:z-30 group-hover:ring-4 group-hover:ring-red-600">
                  {item.poster_path ? (
                    <img
                      src={imageUrl(item.poster_path, 'w500')}
                      alt={item.title || item.name}
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-800 flex items-center justify-center text-gray-500">
                      No Image
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                    {item.media_type === 'tv' ? 'TV' : 'Movie'}
                  </div>
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
