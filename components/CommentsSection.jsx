'use client';

import { useState, useEffect } from 'react';
import { getComments, addComment, deleteComment } from '@/lib/comments';
import { getPrefs } from '@/lib/userPrefs';
import { FaComment, FaTrash, FaUserCircle } from 'react-icons/fa';

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function CommentsSection({ mediaId, title }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const [nameLocked, setNameLocked] = useState(false);

  useEffect(() => {
    setComments(getComments(mediaId));
    const saved = localStorage.getItem('ayuflix_comment_name');
    if (saved) {
      setName(saved);
      setNameLocked(true);
    }
  }, [mediaId]);

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const next = addComment(mediaId, { text, name });
    if (name.trim()) {
      localStorage.setItem('ayuflix_comment_name', name.trim());
      setNameLocked(true);
    }
    setComments(next);
    setText('');
  };

  const remove = (id) => setComments(deleteComment(mediaId, id));

  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <FaComment className="text-red-600" size={16} /> Comments{' '}
        <span className="text-gray-500 text-sm font-normal">({comments.length})</span>
      </h2>

      <form onSubmit={submit} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <FaUserCircle className="text-gray-600" />
          {nameLocked ? (
            <span className="text-gray-400 text-sm">
              {name}{' '}
              <button
                type="button"
                onClick={() => {
                  setNameLocked(false);
                  setName('');
                }}
                className="text-red-500 text-xs hover:underline"
              >
                (change)
              </button>
            </span>
          ) : (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name (optional)"
              maxLength={24}
              className="bg-gray-800 border border-gray-700 text-white text-sm px-3 py-1.5 rounded-lg focus:outline-none focus:border-red-600 w-40"
            />
          )}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`What did you think of ${title || 'this title'}? (no spoilers please!)`}
          rows={2}
          maxLength={500}
          className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-red-600 resize-none"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-gray-600 text-xs">{text.length}/500</span>
          <button
            type="submit"
            disabled={!text.trim()}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all"
          >
            Post
          </button>
        </div>
      </form>

      {comments.length === 0 ? (
        <p className="text-gray-600 text-sm">No comments yet — be the first!</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-3 bg-gray-900/40 border border-gray-800/60 rounded-lg p-3">
              <div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-600/40 flex items-center justify-center text-red-400 text-sm font-bold flex-shrink-0">
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">
                  {c.name} <span className="text-gray-600 text-xs font-normal ml-1">{timeAgo(c.createdAt)}</span>
                </p>
                <p className="text-gray-300 text-sm mt-0.5 break-words whitespace-pre-wrap">{c.text}</p>
              </div>
              <button
                onClick={() => remove(c.id)}
                className="text-gray-600 hover:text-red-500 transition-colors p-1 flex-shrink-0"
                title="Delete comment"
                aria-label="Delete comment"
              >
                <FaTrash size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
