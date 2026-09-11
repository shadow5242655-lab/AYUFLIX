'use client';

import { useEffect, useState } from 'react';
import { FaCheckCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const TOAST_EVENT = 'ayuflix-toast';

/**
 * Fires a toast notification.
 * @param {string} message
 * @param {'success'|'info'|'error'} [type]
 */
export function toast(message, type = 'info') {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { message, type, id: Date.now() + Math.random() } }));
}

const ICONS = {
  success: <FaCheckCircle className="text-green-500 shrink-0" size={18} />,
  info: <FaInfoCircle className="text-red-500 shrink-0" size={18} />,
  error: <FaExclamationTriangle className="text-yellow-500 shrink-0" size={18} />,
};

export default function ToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      const t = e.detail;
      setToasts((prev) => [...prev.slice(-3), t]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, 3500);
    };
    window.addEventListener(TOAST_EVENT, handler);
    return () => window.removeEventListener(TOAST_EVENT, handler);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center gap-3 bg-gray-900/95 border border-red-600/60 text-white text-sm px-4 py-3 rounded-lg shadow-lg shadow-red-900/30 animate-toast-in max-w-xs"
        >
          {ICONS[t.type] || ICONS.info}
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <FaTimes size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
