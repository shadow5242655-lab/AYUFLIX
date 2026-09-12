'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCustomLists, createCustomList, deleteCustomList, renameCustomList, listenCustomLists } from '@/lib/comments';
import { imageUrl } from '@/lib/tmdb';
import { toast } from '@/lib/toast';
import { FaPlus, FaTrash, FaArrowLeft, FaPen } from 'react-icons/fa';

const EMOJIS = ['📁', '🎬', '👻', '❤️', '😂', '🚀', '🧠', '🍿', '🥷', '🐲'];

export default function MyListsPage() {
  const [lists, setLists] = useState([]);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('📁');
  const [renaming, setRenaming] = useState(null); // list id
  const [renameValue, setRenameValue] = useState('');

  useEffect(() => {
    setLists(getCustomLists());
    const unsub = listenCustomLists(setLists);
    return () => {
      unsub();
    };
  }, []);

  const create = () => {
    if (!newName.trim()) {
      toast('Give your list a name first', 'error');
      return;
    }
    createCustomList(newName.trim(), newEmoji);
    setNewName('');
    toast('✅ List created', 'success');
  };

  return (
    <div className="min-h-screen bg-black px-4 md:px-8 py-6">
      <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-red-500 text-sm mb-6 transition-colors">
        <FaArrowLeft size={13} /> Home
      </Link>

      <h1 className="text-3xl font-black text-white mb-2">🗂️ My Lists</h1>
      <p className="text-gray-500 text-sm mb-8">
        Create your own collections — &ldquo;Comfort comedies&rdquo;, &ldquo;Watch with dad&rdquo;, whatever you like. Use the{' '}
        <span className="text-yellow-500">Save to list</span> button on any title to add items.
      </p>

      {/* Create new */}
      <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 mb-8">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setNewEmoji(e)}
                className={`w-9 h-9 rounded-lg text-lg transition-all ${
                  newEmoji === e ? 'bg-red-600/30 border border-red-600' : 'bg-gray-900 border border-transparent hover:border-gray-700'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && create()}
            placeholder="New list name…"
            maxLength={40}
            className="flex-1 min-w-40 bg-gray-900 border border-gray-800 text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-red-600"
          />
          <button
            onClick={create}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all"
          >
            <FaPlus size={12} /> Create
          </button>
        </div>
      </div>

      {/* Lists */}
      {lists.length === 0 ? (
        <p className="text-gray-600 text-sm py-10 text-center">No lists yet — create your first one above. 👆</p>
      ) : (
        <div className="space-y-6 pb-16">
          {lists.map((list) => (
            <div key={list.id} className="bg-gray-950 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between gap-2 mb-3">
                {renaming === list.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          renameCustomList(list.id, renameValue);
                          setRenaming(null);
                        }
                        if (e.key === 'Escape') setRenaming(null);
                      }}
                      className="flex-1 bg-gray-900 border border-red-600 text-white text-sm px-3 py-1.5 rounded-lg focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        renameCustomList(list.id, renameValue);
                        setRenaming(null);
                      }}
                      className="text-green-400 text-sm px-2"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <h2 className="text-lg font-bold text-white">
                    {list.emoji} {list.name} <span className="text-gray-600 text-sm font-normal">({list.items?.length || 0})</span>
                  </h2>
                )}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setRenaming(list.id);
                      setRenameValue(list.name);
                    }}
                    className="p-2 text-gray-500 hover:text-white transition-colors"
                    title="Rename list"
                  >
                    <FaPen size={12} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${list.name}"?`)) {
                        deleteCustomList(list.id);
                        toast('List deleted', 'info');
                      }
                    }}
                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                    title="Delete list"
                  >
                    <FaTrash size={13} />
                  </button>
                </div>
              </div>

              {(list.items || []).length === 0 ? (
                <p className="text-gray-700 text-sm">Empty — open any title and press &ldquo;Save to list&rdquo;.</p>
              ) : (
                <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                  {list.items.map((item) => (
                    <Link
                      key={item.id}
                      href={item.mediaType === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`}
                      className="flex-shrink-0 w-28 group"
                    >
                      {item.posterPath ? (
                        <img
                          src={imageUrl(item.posterPath, 'w185')}
                          alt={item.title}
                          className="w-28 object-cover rounded-lg group-hover:ring-2 group-hover:ring-red-600 transition-all"
                          style={{ height: '10.5rem' }}
                        />
                      ) : (
                        <div className="w-28 bg-gray-900 rounded-lg flex items-center justify-center text-gray-600 text-xs" style={{ height: '10.5rem' }}>
                          {item.title}
                        </div>
                      )}
                      <p className="text-gray-400 text-xs mt-1 truncate group-hover:text-red-400">{item.title}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
