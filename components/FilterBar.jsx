'use client';

import { useState, useEffect } from 'react';
import { fetchGenres } from '@/lib/tmdb';
import { FaFilter, FaTimes } from 'react-icons/fa';

export default function FilterBar({ onApply, onClear, initialFilters = {} }) {
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(initialFilters.genre || '');
  const [selectedYear, setSelectedYear] = useState(initialFilters.year || '');
  const [selectedRating, setSelectedRating] = useState(initialFilters.rating || '');

  useEffect(() => {
    fetchGenres().then((data) => {
      if (data?.genres) {
        setGenres(data.genres);
      }
    }).catch(() => {
      console.error('Failed to load genres');
    });
  }, []);

  // Generate years from 1900 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i);

  const handleApply = () => {
    onApply({
      genre: selectedGenre,
      year: selectedYear,
      rating: selectedRating,
    });
  };

  const handleClear = () => {
    setSelectedGenre('');
    setSelectedYear('');
    setSelectedRating('');
    onClear();
  };

  const hasFilters = selectedGenre || selectedYear || selectedRating;

  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <FaFilter className="text-red-500" />
        <h3 className="text-white font-semibold">Filters</h3>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Genre Dropdown */}
        <div className="flex-1">
          <label className="block text-gray-400 text-xs mb-1">Genre</label>
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="w-full bg-gray-800 border border-red-600 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
          >
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>

        {/* Year Dropdown */}
        <div className="flex-1">
          <label className="block text-gray-400 text-xs mb-1">Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full bg-gray-800 border border-red-600 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
          >
            <option value="">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Rating Dropdown */}
        <div className="flex-1">
          <label className="block text-gray-400 text-xs mb-1">Rating</label>
          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            className="w-full bg-gray-800 border border-red-600 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
          >
            <option value="">Any Rating</option>
            <option value="7">7+</option>
            <option value="8">8+</option>
            <option value="9">9+</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 sm:items-end">
          <button
            onClick={handleApply}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
          >
            <FaFilter size={14} /> Apply
          </button>
          {hasFilters && (
            <button
              onClick={handleClear}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            >
              <FaTimes size={14} /> Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
