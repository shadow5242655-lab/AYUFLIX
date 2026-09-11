// Shared video server definitions used by both the admin panel and the player.
// URL templates support {id}, {season}, {episode} placeholders.

export const BUILTIN_SERVERS = [
  {
    id: 'vidlink',
    name: 'VidLink',
    movieUrl: 'https://vidlink.pro/movie/{id}',
    tvUrl: 'https://vidlink.pro/tv/{id}/{season}/{episode}',
  },
  {
    id: 'vidking',
    name: 'VidKing',
    movieUrl: 'https://www.vidking.net/embed/movie/{id}',
    tvUrl: 'https://www.vidking.net/embed/tv/{id}/{season}/{episode}',
  },
  {
    id: 'vidsrc_wiki',
    name: 'VidSrc',
    movieUrl: 'https://v1.vidsrc.wiki/embed/movie/{id}/',
    tvUrl: 'https://v1.vidsrc.wiki/embed/tv/{id}/{season}/{episode}/',
  },
  {
    id: '2embed',
    name: '2Embed',
    movieUrl: 'https://www.2embed.cc/embed/{id}',
    tvUrl: 'https://www.2embed.cc/embed/{id}?s={season}&e={episode}',
  },
];

/**
 * Builds a playable embed URL from a server definition.
 * Works with both plain objects (builtin + custom, from the shared config)
 * and the legacy function-style servers.
 */
export function buildServerUrl(server, mediaId, type = 'movie', season = 1, episode = 1) {
  const template = type === 'tv' ? server.tvUrl || server.movieUrl : server.movieUrl || server.tvUrl;
  if (!template) return '';
  return template
    .replaceAll('{id}', mediaId)
    .replaceAll('{season}', season)
    .replaceAll('{episode}', episode);
}
