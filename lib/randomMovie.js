'use client';

import { useRouter } from 'next/navigation';
import { toast } from '@/lib/toast';

// Picks a random popular movie OR TV show via the API and navigates to it.
export function useRandomPick() {
  const router = useRouter();

  const randomPick = async () => {
    try {
      const res = await fetch('/api/random-movie?type=random');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      if (data.movieId) {
        router.push(`/${data.type === 'tv' ? 'tv' : 'movie'}/${data.movieId}`);
        toast(`🎲 ${data.title}`, 'info');
      }
    } catch (error) {
      console.error('Random pick error:', error);
      // Fallback: pick a random popular ID
      const fallbackIds = [550, 680, 27205, 13, 68721, 120, 299534, 238, 278, 424, 389, 155, 240, 429, 122, 968051, 1396, 66732];
      const randomId = fallbackIds[Math.floor(Math.random() * fallbackIds.length)];
      const isTv = [1396, 66732].includes(randomId);
      router.push(`/${isTv ? 'tv' : 'movie'}/${randomId}`);
    }
  };

  return randomPick;
}

// Backwards-compatible alias used by the Navbar
export function useRandomMovie() {
  return useRandomPick();
}
