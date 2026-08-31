import { NextResponse } from "next/server";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const BEARER_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0N2JlOGMwNTEyZjIzN2MyODI3ZTljZjU0ZDQxYWU5YSIsIm5iZiI6MTc4ODE4OTM5MC4zMTcsInN1YiI6IjZhOTU5YWNlZDUyNTYxZTRkZGZhYzVlMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.0UEOr2dEgEaR-aQQlmgjDo3wlooBIoGoxMnNBOqiCUY";

export async function GET(request, context) {
  const params = await context.params;
  const pathSegments = params.path;
  const tmdbPath = pathSegments.join("/");
  
  const { searchParams } = new URL(request.url);
  const tmdbUrl = new URL(`${TMDB_BASE_URL}/${tmdbPath}`);
  
  searchParams.forEach((value, key) => {
    tmdbUrl.searchParams.set(key, value);
  });

  try {
    const response = await fetch(tmdbUrl.toString(), {
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 3600 },
    });

    const data = await response.json();
    
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch from TMDB" },
      { status: 500 }
    );
  }
}
