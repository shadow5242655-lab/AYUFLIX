export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://ayuflix.vercel.app';
  const routes = ['', '/browse/movie', '/browse/tv', '/genre/movie', '/genre/tv', '/calendar', '/movie-night', '/about', '/legal'];
  return routes.map((r) => ({
    url: `${base}${r}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: r === '' ? 1 : 0.7,
  }));
}
