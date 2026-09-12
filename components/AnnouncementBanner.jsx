'use client';

import { useState, useEffect } from 'react';
import { FaBullhorn, FaTimes } from 'react-icons/fa';
import { fetchAdminConfig } from '@/lib/adminConfig';

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetchAdminConfig()
        .then((config) => {
          if (!cancelled) setAnnouncement(config.announcement || null);
        })
        .catch(() => {});
    };
    load();
    // Poll so admin changes appear without a reload
    const interval = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (!announcement?.enabled || !announcement.text || dismissed) return null;

  // Optional expiry set in the admin panel (datetime-local)
  if (announcement.expiresAt && new Date(announcement.expiresAt) < new Date()) return null;

  const inner = (
    <>
      <FaBullhorn size={12} className="shrink-0" />
      <span className="flex-1 text-center">{announcement.text}</span>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 hover:text-white/80"
        aria-label="Dismiss announcement"
      >
        <FaTimes size={12} />
      </button>
    </>
  );

  return (
    <div className="bg-red-600 text-white text-xs sm:text-sm font-medium px-4 py-2 flex items-center gap-3">
      {announcement.link ? (
        <a href={announcement.link} target="_blank" rel="noreferrer" className="flex items-center gap-3 flex-1 hover:underline">
          {inner}
        </a>
      ) : (
        inner
      )}
    </div>
  );
}
