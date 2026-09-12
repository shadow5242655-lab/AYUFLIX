// Comment threads on titles + custom user lists ("My Lists" beyond the main one).
// Local-first: comments are stored per-browser (clearly labeled as such in the UI),
// custom lists too. Server-side shared storage can be wired later for both.

export const commentsKey = (mediaId) => `ayuflix_comments_${mediaId}`;

export function getComments(mediaId) {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(commentsKey(mediaId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addComment(mediaId, { text, name }) {
  if (typeof window === 'undefined') return [];
  const trimmed = String(text || '').trim().slice(0, 500);
  if (!trimmed) return getComments(mediaId);
  const comment = {
    id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    text: trimmed,
    name: (name || 'Guest').trim().slice(0, 24) || 'Guest',
    createdAt: new Date().toISOString(),
  };
  const next = [comment, ...getComments(mediaId)].slice(0, 100);
  localStorage.setItem(commentsKey(mediaId), JSON.stringify(next));
  return next;
}

export function deleteComment(mediaId, commentId) {
  if (typeof window === 'undefined') return [];
  const next = getComments(mediaId).filter((c) => c.id !== commentId);
  localStorage.setItem(commentsKey(mediaId), JSON.stringify(next));
  return next;
}

export function countTotalComments() {
  if (typeof window === 'undefined') return 0;
  let total = 0;
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('ayuflix_comments_'))
      .forEach((k) => {
        total += (getComments(k.replace('ayuflix_comments_', '')).length);
      });
  } catch {
    // ignore
  }
  return total;
}

// ---------------- custom lists ----------------

const LISTS_KEY = 'ayuflix_custom_lists';
// shape: [{ id, name, emoji, items: [{ id, title, posterPath, mediaType }] }]

export function getCustomLists() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LISTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCustomLists(lists) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
  window.dispatchEvent(new Event('ayuflix-custom-lists-changed'));
}

export function createCustomList(name, emoji = '📁') {
  const clean = String(name || '').trim().slice(0, 40);
  if (!clean) return getCustomLists();
  const list = { id: `l_${Date.now()}`, name: clean, emoji, items: [] };
  saveCustomLists([...getCustomLists(), list]);
  return getCustomLists();
}

export function deleteCustomList(listId) {
  saveCustomLists(getCustomLists().filter((l) => l.id !== listId));
  return getCustomLists();
}

export function renameCustomList(listId, name) {
  saveCustomLists(getCustomLists().map((l) => (l.id === listId ? { ...l, name: String(name).slice(0, 40) } : l)));
  return getCustomLists();
}

/** true if now in the list */
export function toggleItemInList(listId, item) {
  const lists = getCustomLists().map((l) => {
    if (l.id !== listId) return l;
    const exists = (l.items || []).some((i) => i.id === item.id);
    return {
      ...l,
      items: exists ? l.items.filter((i) => i.id !== item.id) : [...(l.items || []), item],
    };
  });
  saveCustomLists(lists);
  const target = getCustomLists().find((l) => l.id === listId);
  return Boolean(target?.items?.some((i) => i.id === item.id));
}

export function listenCustomLists(callback) {
  if (typeof window === 'undefined') return () => {};
  const handler = () => callback(getCustomLists());
  window.addEventListener('ayuflix-custom-lists-changed', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('ayuflix-custom-lists-changed', handler);
    window.removeEventListener('storage', handler);
  };
}
