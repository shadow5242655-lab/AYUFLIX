'use client';

import { useState, useEffect, useRef } from 'react';
import { getCustomLists, toggleItemInList, createCustomList } from '@/lib/comments';
import { FaBookmark, FaCheck, FaPlus, FaTimes } from 'react-icons/fa';

/**
 * Button + dropdown to add the current title to any custom list.
 * @param {{ item: { id: number, title: string, posterPath?: string, mediaType: string } }} props
 */
export default function SaveToList({ item }) {
  const [lists, setLists] = useState([]);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const load = () => setLists(getCustomLists());
    load();
    window.addEventListener('ayuflix-custom-lists-changed', load);
    window.addEventListener('storage', load);
    return () => {
      window.removeEventListener('ayuflix-custom-lists-changed', load);
      window.removeEventListener('storage', load);
    };
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const membership = Object.fromEntries(lists.map((l) => [l.id, (l.items || []).some((i) => i.id === item.id)]));
  const inAny = Object.values(membership).some(Boolean);

  const handleCreate = () => {
    if (!newName.trim()) return;
    createCustomList(newName.trim(), '📁');
    setNewName('');
    setCreating(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 px-5 py-3 rounded font-medium transition-all border ${
          inAny
            ? 'bg-yellow-600/20 text-yellow-300 border-yellow-600/50 hover:bg-yellow-600/30'
            : 'bg-gray-700/80 text-white border-gray-600 hover:bg-gray-600'
        }`}
      >
        <FaBookmark size={15} />
        {inAny ? 'In a list' : 'Save to list'}
      </button>

      {open && (
        <div className="absolute top-12 left-0 w-64 bg-gray-950 border border-gray-700 rounded-xl shadow-xl overflow-hidden z-30 animate-fade-in">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Your lists</p>
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white" aria-label="Close">
              <FaTimes size={12} />
            </button>
          </div>

          {lists.length === 0 && !creating && (
            <p className="text-gray-600 text-xs px-3 py-3">No lists yet — create your first one!</p>
          )}

          <div className="max-h-48 overflow-y-auto custom-scrollbar">
            {lists.map((l) => {
              const inside = membership[l.id];
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => {
                    toggleItemInList(l.id, item);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-white hover:bg-red-600/15 transition-colors"
                >
                  <span className="truncate">
                    {l.emoji} {l.name}
                  </span>
                  {inside ? (
                    <span className="flex items-center gap-1 text-green-400 text-xs">
                      <FaCheck size={10} /> Added
                    </span>
                  ) : (
                    <FaPlus className="text-gray-600" size={11} />
                  )}
                </button>
              );
            })}
          </div>

          {creating ? (
            <div className="p-2 border-t border-gray-800 flex gap-1.5">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="List name…"
                className="flex-1 bg-gray-900 border border-gray-700 text-white text-xs px-2 py-1.5 rounded focus:outline-none focus:border-red-600"
              />
              <button
                onClick={handleCreate}
                className="bg-red-600 hover:bg-red-700 text-white text-xs px-2.5 rounded transition-colors"
              >
                Add
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-600/10 border-t border-gray-800 transition-colors"
            >
              <FaPlus size={11} /> New list
            </button>
          )}
        </div>
      )}
    </div>
  );
}
