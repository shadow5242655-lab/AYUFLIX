'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaBars, FaTimes } from 'react-icons/fa';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/browse/tv', label: 'TV Shows' },
  { href: '/browse/movie', label: 'Movies' },
  { href: '/my-list', label: 'My List' },
  { href: '/history', label: 'History' },
  { href: '/my-stats', label: 'My Stats' },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden text-white hover:text-red-500 transition-colors"
        aria-label="Open menu"
      >
        <FaBars size={20} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-64 bg-gray-950 border-l-2 border-red-600 p-6 flex flex-col animate-slide-in">
            <div className="flex items-center justify-between mb-8">
              <span className="text-red-600 font-black tracking-wider">AYUFLIX</span>
              <button onClick={() => setOpen(false)} className="text-white hover:text-red-500" aria-label="Close menu">
                <FaTimes size={20} />
              </button>
            </div>
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-white text-lg py-3 border-b border-gray-800 hover:text-red-500 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
