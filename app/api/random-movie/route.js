import { NextResponse } from 'next/server';

const BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0N2JlOGMwNTEyZjIzN2MyODI3ZTljZjU0ZDQxYWU5YSIsIm5iZiI6MTc4ODE4OTM5MC4zMTcsInN1YiI6IjZhOTU5YWNlZDUyNTYxZTRkZGZhYzVlMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.0UEOr2dEgEaR-aQQlmgjDo3wlooBIoGoxMnNBOqiCUY';

// ?type=random → movie or TV; ?type=movie → movies only; ?type=tv → TV only
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'movie';

  const paths = type === 'random' ? ['movie', 'tv'] : [type === 'tv' ? 'tv' : 'movie'];
  const mediaType = paths[Math.floor(Math.random() * paths.length)];

  try {
    const randomPage = Math.floor(Math.random() * 100) + 1;
    const res = await fetch(
      `https://api.themoviedb.org/3/discover/${mediaType}?page=${randomPage}&sort_by=popularity.desc&vote_count.gte=100`,
      {
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 0 },
      }
    );

    if (!res.ok) {
      throw new Error(`TMDB API error: ${res.status}`);
    }

    const data = await res.json();
    const items = data.results || [];

    if (items.length === 0) {
      return NextResponse.json({ error: 'No titles found' }, { status: 404 });
    }

    const pick = items[Math.floor(Math.random() * items.length)];

    return NextResponse.json({
      movieId: pick.id,
      type: mediaType,
      title: pick.title || pick.name,
      posterPath: pick.poster_path,
      overview: pick.overview,
    });
  } catch (error) {
    console.error('Random pick error:', error);
    return NextResponse.json({ error: 'Failed to fetch random pick' }, { status: 500 });
  }
}
