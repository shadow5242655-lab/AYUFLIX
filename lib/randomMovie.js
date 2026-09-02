import { useRouter } from 'next/navigation';

export function useRandomMovie() {
  const router = useRouter();

  const fetchRandomMovie = async () => {
    try {
      const res = await fetch('/api/random-movie');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      if (data.movieId) {
        router.push(`/movie/${data.movieId}`);
      }
    } catch (error) {
      console.error('Random movie error:', error);
      // Fallback: pick a random popular movie ID
      const fallbackIds = [550, 680, 27205, 13, 68721, 120, 299534, 238, 278, 424, 389, 155, 240, 429, 122, 968051];
      const randomId = fallbackIds[Math.floor(Math.random() * fallbackIds.length)];
      router.push(`/movie/${randomId}`);
    }
  };

  return fetchRandomMovie;
}

// Standalone version for use without the hook (e.g., in event handlers)
export async function fetchAndNavigate(router) {
  try {
    const res = await fetch('/api/random-movie');
    if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();
    if (data.movieId) {
      router.push(`/movie/${data.movieId}`);
    }
  } catch (error) {
    console.error('Random movie error:', error);
    const fallbackIds = [550, 680, 27205, 13, 68721, 120, 299534, 238, 278, 424, 389, 155, 240, 429, 122, 968051];
    const randomId = fallbackIds[Math.floor(Math.random() * fallbackIds.length)];
    router.push(`/movie/${randomId}`);
  }
}
