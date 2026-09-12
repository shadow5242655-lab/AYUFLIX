'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { FaSearch, FaDice, FaFireAlt } from 'react-icons/fa';

const PAGES = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/browse/movie', label: 'Browse Movies', icon: '🎬' },
  { href: '/browse/tv', label: 'Browse TV Shows', icon: '📺' },
  { href: '/my-list', label: 'My List', icon: '🔖' },
  { href: '/history', label: 'Watch History', icon: '🕓' },
  { href: '/my-stats', label: 'My Stats', icon: '📊' },
  { href: '/my-lists', label: 'My Custom Lists', icon: '🗂️' },
  { href: '/achievements', label: 'Achievements', icon: '🏆' },
  { href: '/calendar', label: 'TV Calendar', icon: '📅' },
  { href: '/movie-night', label: 'Movie Night Picker', icon: '🌙' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
  { href: '/about', label: 'About AYUFLIX', icon: 'ℹ️' },
  { href: '/admin', label: 'Admin Panel', icon: '🛠️' },
];

const QUICK_ACTIONS = [
  { id: 'random', label: 'Surprise me — random title', icon: <FaDice size={13} /> },
  { id: 'trending', label: 'See what is trending', icon: <FaFireAlt size={13} /> },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef(null);

  // Ctrl+K / Cmd+K opens, on any page. "/" is handled by the navbar search.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  // Close on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const filter = query.trim().toLowerCase();
  const pages = PAGES.filter((p) => p.label.toLowerCase().includes(filter));
  const actions = QUICK_ACTIONS.filter((a) => a.label.toLowerCase().includes(filter));
  const total = pages.length + actions.length;

  const runAction = useCallback(
    async (id) => {
      setOpen(false);
      if (id === 'random') {
        try {
          const res = await fetch('/api/random-movie');
          const data = await res.json();
          const rid = data?.movieId || data?.id;
          if (rid) router.push(data.type === 'tv' ? `/tv/${rid}` : `/movie/${rid}`);
        } catch {
          // ignore
        }
      } else if (id === 'trending') {
        router.push('/browse/movie');
      }
    },
    [router]
  );

  const activate = (index) => {
    if (index < pages.length) {
      router.push(pages[index].href);
      setOpen(false);
    } else {
      runAction(actions[index - pages.length]?.id);
    }
  };

  const onKeyNav = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => (c + 1) % Math.max(1, total));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => (c - 1 + total) % Math.max(1, total));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      activate(cursor);
    }
  };

  if (!open) return null;

  let flatIndex = -1;

  return (
    <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-[12vh] px-4" onClick={() => setOpen(false)}>
      <div
        className="w-full max-w-lg bg-gray-950 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
          <FaSearch className="text-red-500" size={15} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            onKeyDown={onKeyNav}
            placeholder="Jump to a page or run an action…"
            className="flex-1 bg-transparent text-white text-base focus:outline-none placeholder-gray-600"
          />
          <kbd className="text-[10px] text-gray-500 bg-gray-900 border border-gray-700 px-1.5 py-0.5 rounded">Esc</kbd>
        </div>

        <div className="max-h-[50vh] overflow-y-auto custom-scrollbar py-2">
          {pages.length > 0 && (
            <>
              <p className="text-gray-600 text-[10px] uppercase tracking-wider font-bold px-4 py-1">Pages</p>
              {pages.map((p) => {
                flatIndex++;
                const selected = cursor === flatIndex;
                return (
                  <button
                    key={p.href}
                    onMouseEnter={() => setCursor(flatIndex)}
                    onClick={() => activate(flatIndex)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      selected ? 'bg-red-600/20 text-white' : 'text-gray-300 hover:bg-gray-900'
                    }`}
                  >
                    <span>{p.icon}</span> {p.label}
                    {selected && <span className="ml-auto text-gray-600 text-xs">↵</span>}
                  </button>
                );
              })}
            </>
          )}

          {actions.length > 0 && (
            <>
              <p className="text-gray-600 text-[10px] uppercase tracking-wider font-bold px-4 py-1 mt-1">Actions</p>
              {actions.map((a) => {
                flatIndex++;
                const selected = cursor === flatIndex;
                return (
                  <button
                    key={a.id}
                    onMouseEnter={() => setCursor(flatIndex)}
                    onClick={() => activate(flatIndex)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      selected ? 'bg-red-600/20 text-white' : 'text-gray-300 hover:bg-gray-900'
                    }`}
                  >
                    <span className="text-red-500">{a.icon}</span> {a.label}
                  </button>
                );
              })}
            </>
          )}

          {total === 0 && <p className="text-gray-600 text-sm text-center py-8">Nothing matches &ldquo;{query}&rdquo;</p>}
        </div>

        <div className="border-t border-gray-800 px-4 py-2 flex items-center gap-3 text-[10px] text-gray-600">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span className="ml-auto">Ctrl+K to toggle</span>
        </div>
      </div>
    </div>
  );
}
