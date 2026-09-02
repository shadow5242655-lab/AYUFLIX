'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaSearch, FaBell, FaUser, FaHome, FaHistory, FaDice } from 'react-icons/fa';
import { useRandomMovie } from '@/lib/randomMovie';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const router = useRouter();
  const fetchRandomMovie = useRandomMovie();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery('');
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black border-b-2 border-red-600' : 'bg-transparent'
      }`}
    >
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="text-red-600 text-2xl font-black tracking-wider text-shadow-red">
          AYUFLIX
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-6 ml-8">
          <Link href="/" className="text-white hover:text-red-500 hover:underline decoration-red-600 transition-colors text-sm font-medium">
            Home
          </Link>
          <Link href="/browse/tv" className="text-white hover:text-red-500 hover:underline decoration-red-600 transition-colors text-sm font-medium">
            TV Shows
          </Link>
          <Link href="/browse/movie" className="text-white hover:text-red-500 hover:underline decoration-red-600 transition-colors text-sm font-medium">
            Movies
          </Link>
          <Link href="/my-list" className="text-white hover:text-red-500 hover:underline decoration-red-600 transition-colors text-sm font-medium">
            My List
          </Link>
          <button
            onClick={fetchRandomMovie}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all hover:scale-105"
          >
            🎲 Surprise Me
          </button>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Mobile Surprise Me */}
          <button
            onClick={fetchRandomMovie}
            className="md:hidden bg-red-600 hover:bg-red-700 text-white px-2 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
          >
            🎲
          </button>
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search titles..."
                autoFocus
                className="bg-black/80 border border-red-600 text-white px-3 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-600 w-48"
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="ml-2 text-white hover:text-red-500">
                ✕
              </button>
            </form>
          ) : (
            <button onClick={() => setSearchOpen(true)} className="text-white hover:text-red-500 transition-colors">
              <FaSearch size={18} />
            </button>
          )}
          <button className="text-white hover:text-red-500 transition-colors relative">
            <FaBell size={18} />
          </button>
          
          {/* Profile Dropdown */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-8 h-8 rounded-sm bg-red-600 ring-2 ring-red-600 flex items-center justify-center cursor-pointer hover:ring-red-500 transition-all"
            >
              <FaUser size={14} className="text-white" />
            </button>
            
            {profileOpen && (
              <div className="absolute right-0 top-12 w-48 bg-black/95 border border-red-600 rounded-lg shadow-lg overflow-hidden">
                <Link
                  href="/"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-white hover:bg-red-600/20 transition-colors"
                >
                  <FaHome size={16} className="text-red-500" />
                  <span>Home</span>
                </Link>
                <Link
                  href="/history"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-white hover:bg-red-600/20 transition-colors border-t border-gray-800"
                >
                  <FaHistory size={16} className="text-red-500" />
                  <span>History</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
