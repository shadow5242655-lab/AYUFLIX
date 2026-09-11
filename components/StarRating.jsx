'use client';

import { useState } from 'react';
import { FaStar } from 'react-icons/fa';

const RATINGS_KEY = 'ayuflix_ratings';

function loadRatings() {
  try {
    return JSON.parse(localStorage.getItem(RATINGS_KEY) || '{}');
  } catch {
    return {};
  }
}

export function getUserRating(id) {
  return loadRatings()[String(id)] || null;
}

export default function StarRating({ mediaId, title }) {
  const [rating, setRating] = useState(() => getUserRating(mediaId));
  const [hover, setHover] = useState(0);

  const rate = (value) => {
    const ratings = loadRatings();
    if (ratings[String(mediaId)] === value) {
      delete ratings[String(mediaId)];
      setRating(null);
    } else {
      ratings[String(mediaId)] = value;
      setRating(value);
    }
    localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
  };

  return (
    <div className="flex items-center gap-2" title={title ? `Rate "${title}"` : 'Rate this title'}>
      <span className="text-gray-400 text-sm">Your rating:</span>
      <div className="flex gap-0.5" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((v) => {
          const active = (hover || rating || 0) >= v;
          return (
            <button
              key={v}
              onClick={() => rate(v)}
              onMouseEnter={() => setHover(v)}
              className="transition-transform hover:scale-125"
              aria-label={`Rate ${v} star${v > 1 ? 's' : ''}`}
            >
              <FaStar size={18} className={active ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-200'} />
            </button>
          );
        })}
      </div>
      {rating && <span className="text-yellow-400 text-sm font-medium">{rating}/5</span>}
    </div>
  );
}
