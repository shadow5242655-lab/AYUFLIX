'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePrefs, ACCENTS, AVATARS, savePrefs, resetPrefs, applyPrefsToDocument } from '@/lib/userPrefs';
import { exportAllData, clearAllData } from '@/lib/watchData';
import { toast } from '@/lib/toast';
import { loadPlayerServers } from '@/lib/adminConfig';
import { FaArrowLeft, FaDownload, FaUpload, FaTrash, FaCog } from 'react-icons/fa';

export default function SettingsPage() {
  const prefs = usePrefs();
  const [servers, setServers] = useState([]);
  const [confirmClear, setConfirmClear] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    loadPlayerServers()
      .then(setServers)
      .catch(() => setServers([]));
  }, []);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(exportAllData(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ayuflix-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('📦 Data exported', 'success');
  };

  const importData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const pairs = {
          history: 'ayuflix-history',
          continue: 'ayuflix-continue',
          myList: 'ayuflix-mylist',
          ratings: 'ayuflix_ratings',
          episodes: 'ayuflix_episodes_watched',
        };
        let count = 0;
        Object.entries(pairs).forEach(([name, key]) => {
          if (data[name] !== undefined) {
            localStorage.setItem(key, JSON.stringify(data[name]));
            count++;
          }
        });
        toast(`✅ Imported ${count} data sets — reload pages to see them`, 'success');
      } catch {
        toast('Invalid data file', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 4000);
      return;
    }
    clearAllData();
    resetPrefs();
    applyPrefsToDocument();
    setConfirmClear(false);
    toast('🧹 All local data cleared', 'success');
  };

  return (
    <div className="min-h-screen bg-black px-4 md:px-8 py-6">
      <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-red-500 text-sm mb-6 transition-colors">
        <FaArrowLeft size={13} /> Home
      </Link>

      <h1 className="text-3xl font-black text-white flex items-center gap-3 mb-2">
        <FaCog className="text-red-600" /> Settings
      </h1>
      <p className="text-gray-500 text-sm mb-8">Personalization is saved on this device only.</p>

      <div className="max-w-2xl space-y-6 pb-16">
        {/* Accent color */}
        <section className="bg-gray-950 border border-gray-800 rounded-xl p-5">
          <h2 className="text-white font-bold mb-1">🎨 Accent color</h2>
          <p className="text-gray-500 text-xs mb-4">Used for highlights across the site.</p>
          <div className="flex flex-wrap gap-3">
            {ACCENTS.map((a) => (
              <button
                key={a.id}
                onClick={() => savePrefs({ accent: a.id })}
                title={a.name}
                className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${
                  prefs.accent === a.id ? 'border-white scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: a.value }}
              />
            ))}
          </div>
        </section>

        {/* Avatar */}
        <section className="bg-gray-950 border border-gray-800 rounded-xl p-5">
          <h2 className="text-white font-bold mb-1">👤 Avatar</h2>
          <p className="text-gray-500 text-xs mb-4">Shown in your profile menu and comments.</p>
          <div className="flex flex-wrap gap-2">
            {AVATARS.map((av) => (
              <button
                key={av}
                onClick={() => savePrefs({ avatar: prefs.avatar === av ? '' : av })}
                className={`w-11 h-11 rounded-xl text-xl transition-all hover:scale-110 ${
                  prefs.avatar === av ? 'bg-red-600/30 border-2 border-red-600' : 'bg-gray-900 border border-gray-800'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </section>

        {/* Playback & motion */}
        <section className="bg-gray-950 border border-gray-800 rounded-xl p-5 space-y-4">
          <h2 className="text-white font-bold">🎬 Playback & motion</h2>

          <label className="flex items-center justify-between gap-4">
            <span className="text-gray-300 text-sm">
              Reduce motion
              <span className="block text-gray-600 text-xs">Disables animations & transitions app-wide</span>
            </span>
            <button
              type="button"
              onClick={() => savePrefs({ reduceMotion: !prefs.reduceMotion })}
              className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${prefs.reduceMotion ? 'bg-red-600' : 'bg-gray-700'}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${prefs.reduceMotion ? 'left-6' : 'left-0.5'}`}
              />
            </button>
          </label>

          <label className="flex items-center justify-between gap-4">
            <span className="text-gray-300 text-sm">
              Autoplay next episode
              <span className="block text-gray-600 text-xs">Highlight the Next Episode button when an episode ends</span>
            </span>
            <button
              type="button"
              onClick={() => savePrefs({ autoplayNext: !prefs.autoplayNext })}
              className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${prefs.autoplayNext ? 'bg-red-600' : 'bg-gray-700'}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${prefs.autoplayNext ? 'left-6' : 'left-0.5'}`}
              />
            </button>
          </label>

          <label className="flex items-center justify-between gap-4">
            <span className="text-gray-300 text-sm">
              Open player in theater mode
              <span className="block text-gray-600 text-xs">Dims the rest of the page automatically</span>
            </span>
            <button
              type="button"
              onClick={() => savePrefs({ theaterDefault: !prefs.theaterDefault })}
              className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${prefs.theaterDefault ? 'bg-red-600' : 'bg-gray-700'}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${prefs.theaterDefault ? 'left-6' : 'left-0.5'}`}
              />
            </button>
          </label>

          {servers.length > 0 && (
            <label className="flex items-center justify-between gap-4">
              <span className="text-gray-300 text-sm">
                Preferred server
                <span className="block text-gray-600 text-xs">Used when you haven&apos;t watched anything yet</span>
              </span>
              <select
                value={prefs.defaultServer}
                onChange={(e) => savePrefs({ defaultServer: e.target.value })}
                className="bg-gray-900 border border-gray-700 text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-red-600"
              >
                <option value="">Auto (last used)</option>
                {servers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </section>

        {/* Data */}
        <section className="bg-gray-950 border border-gray-800 rounded-xl p-5 space-y-4">
          <h2 className="text-white font-bold">📦 My data</h2>
          <p className="text-gray-500 text-xs">
            Your list, history, ratings and progress live only in this browser. Export a backup or move it to another
            device.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportData}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-sm px-4 py-2 rounded-lg transition-all"
            >
              <FaDownload size={12} /> Export
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-sm px-4 py-2 rounded-lg transition-all"
            >
              <FaUpload size={12} /> Import
            </button>
            <input ref={fileRef} type="file" accept="application/json" onChange={importData} className="hidden" />
            <button
              onClick={handleClear}
              className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg border transition-all ${
                confirmClear
                  ? 'bg-red-600 border-red-600 text-white animate-pulse-soft'
                  : 'bg-transparent border-red-900 text-red-500 hover:bg-red-950'
              }`}
            >
              <FaTrash size={12} /> {confirmClear ? 'Really clear everything?' : 'Clear all my data'}
            </button>
          </div>
        </section>

        {/* Shortcuts */}
        <section className="bg-gray-950 border border-gray-800 rounded-xl p-5">
          <h2 className="text-white font-bold mb-3">⌨️ Keyboard shortcuts</h2>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
            {[
              ['/', 'Search'],
              ['Ctrl+K', 'Command palette'],
              ['?', 'Shortcut help'],
              ['m', 'Random title'],
              ['1-9', 'Player servers'],
              ['T', 'Theater mode'],
              ['F', 'Fullscreen'],
            ].map(([k, label]) => (
              <p key={k} className="flex items-center gap-2">
                <kbd className="bg-gray-900 border border-gray-700 px-2 py-0.5 rounded text-xs text-white">{k}</kbd> {label}
              </p>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
