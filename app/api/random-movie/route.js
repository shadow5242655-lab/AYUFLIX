import { NextResponse } from 'next/server';

const BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0N2JlOGMwNTEyZjIzN2MyODI3ZTljZjU0ZDQxYWU5YSIsIm5iZiI6MTc4ODE4OTM5MC4zMTcsInN1YiI6IjZhOTU5YWNlZDUyNTYxZTRkZGZhYzVlMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.0UEOr2dEgEaR-aQQlmgjDo3wlooBIoGoxMnNBOqiCUY';

export async function GET() {
  try {
    // Random page between 1 and 500
    const randomPage = Math.floor(Math.random() * 500) + 1;

    const res = await fetch(
      `https://api.themoviedb.org/3/discover/movie?page=${randomPage}&sort_by=vote_average.desc&vote_count.gte=100`,
      {
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      throw new Error(`TMDB API error: ${res.status}`);
    }

    const data = await res.json();
    const movies = data.results || [];

    if (movies.length === 0) {
      return NextResponse.json({ error: 'No movies found' }, { status: 404 });
    }

    // Pick a random movie from the results
    const randomMovie = movies[Math.floor(Math.random() * movies.length)];

    return NextResponse.json({
      movieId: randomMovie.id,
      title: randomMovie.title,
      posterPath: randomMovie.poster_path,
      overview: randomMovie.overview,
    });
  } catch (error) {
    console.error('Random movie error:', error);
    return NextResponse.json({ error: 'Failed to fetch random movie' }, { status: 500 });
  }
}
