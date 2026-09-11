'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaDice } from 'react-icons/fa';

const SHORTCUTS = [
  { keys: '/', desc: 'Open search' },
  { keys: 'm', desc: 'Surprise me — random movie or show' },
  { keys: 'n', desc: 'Next episode (on a TV page)' },
  { keys: 'b', desc: 'Previous episode (on a TV page)' },
  { keys: 'Esc', desc: 'Close any overlay' },
  { keys: '?', desc: 'Show this help' },
];

export default function ShortcutsHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
      if (typing) return;

      if (e.key === '?') {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key.toLowerCase() === 'm') {
        // Don't hijack if an overlay is likely open (search handles its own keys)
        fetch('/api/random-movie?type=random')
          .then((r) => r.json())
          .then((d) => {
            if (d.movieId) window.location.href = `/${d.type === 'tv' ? 'tv' : 'movie'}/${d.movieId}`;
          })
          .catch(() => {});
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] bg-black/90 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      <div
        className="bg-gray-950 border border-red-600/50 rounded-xl p-6 w-full max-w-md animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <FaDice className="text-red-500" /> Keyboard Shortcuts
          </h2>
          <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white" aria-label="Close">
            <FaTimes />
          </button>
        </div>
        <div className="space-y-3">
          {SHORTCUTS.map((s) => (
            <div key={s.keys} className="flex items-center justify-between gap-4">
              <span className="text-gray-300 text-sm">{s.desc}</span>
              <kbd className="bg-gray-800 border border-gray-700 text-white text-xs font-mono px-2.5 py-1 rounded whitespace-nowrap">
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
        <p className="text-gray-600 text-xs mt-5">Tip: shortcuts are ignored while typing in a field.</p>
      </div>
    </div>
  );
}
