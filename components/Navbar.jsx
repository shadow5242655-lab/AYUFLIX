'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaSearch, FaUser, FaHome, FaHistory, FaListUl, FaChartBar, FaTrophy, FaCog } from 'react-icons/fa';
import { useRandomMovie } from '@/lib/randomMovie';
import { usePrefs } from '@/lib/userPrefs';
import MobileMenu from './MobileMenu';
import SearchSuggestions from './SearchSuggestions';
import NotificationsMenu from './NotificationsMenu';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const router = useRouter();
  const fetchRandomMovie = useRandomMovie();
  const prefs = usePrefs();

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

  // Press "/" anywhere to open search
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

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
          <Link href="/achievements" className="text-white hover:text-red-500 hover:underline decoration-red-600 transition-colors text-sm font-medium">
            🏆
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

          {/* Search — opens the full-screen search interface */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 bg-gray-900/90 hover:bg-gray-800 border border-gray-700 hover:border-red-600 text-gray-300 hover:text-white rounded-full pl-3 pr-4 py-2 transition-all"
            aria-label="Search"
            title="Search (press /)"
          >
            <FaSearch size={14} className="text-red-500" />
            <span className="hidden sm:inline text-sm">Search</span>
          </button>
          {searchOpen && <SearchSuggestions onClose={() => setSearchOpen(false)} />}

          {/* What's-new notifications */}
          <NotificationsMenu />

          {/* Profile Dropdown */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-8 h-8 rounded-sm bg-red-600 ring-2 ring-red-600 flex items-center justify-center cursor-pointer hover:ring-red-500 transition-all overflow-hidden"
              title={prefs.avatar ? 'Your profile' : 'Profile'}
            >
              {prefs.avatar ? (
                <span className="text-lg leading-none">{prefs.avatar}</span>
              ) : (
                <FaUser size={14} className="text-white" />
              )
              }
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
                  href="/my-list"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-white hover:bg-red-600/20 transition-colors border-t border-gray-800"
                >
                  <FaListUl size={16} className="text-red-500" />
                  <span>My List</span>
                </Link>
                <Link
                  href="/history"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-white hover:bg-red-600/20 transition-colors border-t border-gray-800"
                >
                  <FaHistory size={16} className="text-red-500" />
                  <span>History</span>
                </Link>
                <Link
                  href="/my-stats"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-white hover:bg-red-600/20 transition-colors border-t border-gray-800"
                >
                  <FaChartBar size={16} className="text-red-500" />
                  <span>My Stats</span>
                </Link>
                <Link
                  href="/achievements"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-white hover:bg-red-600/20 transition-colors border-t border-gray-800"
                >
                  <FaTrophy size={16} className="text-red-500" />
                  <span>Achievements</span>
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-white hover:bg-red-600/20 transition-colors border-t border-gray-800"
                >
                  <FaCog size={16} className="text-red-500" />
                  <span>Settings</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <MobileMenu />
        </div>
      </div>
    </nav>
  );
}
