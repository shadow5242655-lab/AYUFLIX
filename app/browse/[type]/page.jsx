'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getPopular, getTopRated, getPopularTv, getTopRatedTv } from '@/lib/tmdb';
import MovieCard from '@/components/MovieCard';
import { FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

export default function BrowsePage() {
  const { type } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const isTv = type === 'tv';

  useEffect(() => {
    setLoading(true);
    const fetchFn = isTv ? getPopularTv : getPopular;
    fetchFn().then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, [isTv]);

  return (
    <div className="min-h-screen bg-ayu-black px-4 md:px-8 pt-8">
      <Link href="/" className="inline-flex items-center gap-2 text-white hover:text-red-500 transition-colors mb-6">
        <FaArrowLeft /> Back
      </Link>

      <h1 className="text-3xl font-bold text-white mb-6">
        {isTv ? 'TV Shows' : 'Movies'}
      </h1>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-16">
          {items.map((item) => (
            <MovieCard key={item.id} movie={item} />
          ))}
        </div>
      )}
    </div>
  );
}
