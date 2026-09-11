export const MY_LIST_KEY = 'ayuflix-mylist';

export function getMyList() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MY_LIST_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveMyList(list) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MY_LIST_KEY, JSON.stringify(list));
  // Notify same-tab listeners
  window.dispatchEvent(new Event('ayuflix-mylist-changed'));
}

export function isInMyList(id) {
  return getMyList().some((item) => item.id === id);
}

/**
 * Adds or removes an item from My List.
 * @param {{ id: number, title: string, posterPath?: string, mediaType: 'movie'|'tv' }} item
 * @returns {boolean} true if the item is now in the list
 */
export function toggleMyListItem(item) {
  const list = getMyList();
  const exists = list.some((i) => i.id === item.id);
  if (exists) {
    saveMyList(list.filter((i) => i.id !== item.id));
    return false;
  }
  const entry = {
    id: item.id,
    title: item.title,
    posterPath: item.posterPath,
    mediaType: item.mediaType,
    addedAt: new Date().toISOString(),
  };
  saveMyList([entry, ...list].slice(0, 200));
  return true;
}

export function removeFromMyList(id) {
  saveMyList(getMyList().filter((i) => i.id !== id));
}

export function listenToMyList(callback) {
  if (typeof window === 'undefined') return () => {};
  const handler = () => callback(getMyList());
  window.addEventListener('ayuflix-mylist-changed', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('ayuflix-mylist-changed', handler);
    window.removeEventListener('storage', handler);
  };
}
