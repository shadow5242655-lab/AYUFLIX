'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { evaluateAchievements, getStreak } from '@/lib/achievement';
import { readJSON } from '@/lib/watchData';
import { FaArrowLeft, FaLock, FaFire } from 'react-icons/fa';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState([]);
  const [streak, setStreak] = useState({ current: 0, best: 0, watchedToday: false });
  const [counts, setCounts] = useState({ history: 0, list: 0, episodes: 0, ratings: 0 });

  useEffect(() => {
    setAchievements(evaluateAchievements());
    setStreak(getStreak());
    setCounts({
      history: readJSON('ayuflix-history', []).length,
      list: readJSON('ayuflix-mylist', []).length,
      episodes: readJSON('ayuflix_episodes_watched', []).length,
      ratings: Object.keys(readJSON('ayuflix_ratings', {})).length,
    });
  }, []);

  const unlocked = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="min-h-screen bg-black px-4 md:px-8 py-6">
      <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-red-500 text-sm mb-6 transition-colors">
        <FaArrowLeft size={13} /> Home
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">🏆 Achievements</h1>
          <p className="text-gray-500 text-sm">
            {unlocked} of {achievements.length} unlocked
          </p>
        </div>

        {/* Streak card */}
        <div className="bg-gradient-to-br from-red-600/20 to-transparent border border-red-600/40 rounded-2xl px-5 py-4">
          <p className="text-gray-400 text-xs uppercase font-bold tracking-wider flex items-center gap-1.5">
            <FaFire className="text-orange-500" /> Watch streak
          </p>
          <p className="text-3xl font-black text-white mt-1">
            {streak.current} day{streak.current !== 1 ? 's' : ''}
            {streak.watchedToday && <span className="text-green-400 text-sm ml-2">✓ today</span>}
          </p>
          <p className="text-gray-600 text-xs mt-0.5">Best: {streak.best} days</p>
        </div>
      </div>

      {/* Progress counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {[
          { label: 'Titles watched', value: counts.history, icon: '🎬' },
          { label: 'Episodes seen', value: counts.episodes, icon: '📺' },
          { label: 'In My List', value: counts.list, icon: '🔖' },
          { label: 'Titles rated', value: counts.ratings, icon: '⭐' },
        ].map((s) => (
          <div key={s.label} className="bg-gray-950 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className="text-2xl font-black text-red-500">{s.value}</p>
            <p className="text-gray-500 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pb-16">
        {achievements.map((a) => (
          <div
            key={a.id}
            className={`rounded-2xl border p-4 text-center transition-all ${
              a.unlocked
                ? 'bg-gradient-to-b from-red-600/15 to-transparent border-red-600/50 shadow-red-glow'
                : 'bg-gray-950 border-gray-800/60 opacity-60'
            }`}
          >
            <div className="text-4xl mb-2" style={!a.unlocked ? { filter: 'grayscale(1)', opacity: 0.5 } : {}}>
              {a.unlocked ? a.icon : <FaLock className="text-gray-600 inline" size={26} />}
            </div>
            <p className={`text-sm font-bold ${a.unlocked ? 'text-white' : 'text-gray-500'}`}>{a.name}</p>
            <p className="text-gray-500 text-xs mt-1">{a.desc}</p>
            {a.unlocked && a.unlockedAt && (
              <p className="text-red-500/80 text-[10px] mt-2">
                Unlocked {new Date(a.unlockedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
