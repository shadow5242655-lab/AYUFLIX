'use client';

import { useState, useEffect, useCallback } from 'react';
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';

/**
 * Photo gallery with a lightbox.
 * @param {{ images: string[], title?: string }} props — images are full URLs
 */
export default function PhotoGallery({ images, title = '' }) {
  const [lightbox, setLightbox] = useState(-1);

  const shown = (images || []).filter(Boolean).slice(0, 12);

  const move = useCallback(
    (dir) => {
      setLightbox((i) => (i + dir + shown.length) % shown.length);
    },
    [shown.length]
  );

  useEffect(() => {
    if (lightbox < 0) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(-1);
      if (e.key === 'ArrowRight') move(1);
      if (e.key === 'ArrowLeft') move(-1);
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [lightbox, move]);

  if (shown.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold text-white mb-4">Photos</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {shown.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={() => setLightbox(i)}
            className="relative group overflow-hidden rounded-lg aspect-video bg-gray-900"
          >
            <img
              src={src}
              alt={`${title} photo ${i + 1}`}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox >= 0 && (
        <div className="fixed inset-0 z-[90] bg-black/95 flex items-center justify-center" onClick={() => setLightbox(-1)}>
          <button
            type="button"
            onClick={() => setLightbox(-1)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-900 border border-gray-700 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
            aria-label="Close"
          >
            <FaTimes />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              move(-1);
            }}
            className="absolute left-2 md:left-8 w-11 h-11 rounded-full bg-black/70 border border-gray-700 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
            aria-label="Previous photo"
          >
            <FaChevronLeft />
          </button>
          <img
            src={shown[lightbox]}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="max-w-[92vw] max-h-[85vh] object-contain rounded-lg animate-fade-in"
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              move(1);
            }}
            className="absolute right-2 md:right-8 w-11 h-11 rounded-full bg-black/70 border border-gray-700 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
            aria-label="Next photo"
          >
            <FaChevronRight />
          </button>
          <p className="absolute bottom-5 text-gray-400 text-sm">
            {lightbox + 1} / {shown.length}
          </p>
        </div>
      )}
    </div>
  );
}
