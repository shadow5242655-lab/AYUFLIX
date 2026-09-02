export const VIDEO_SERVERS = [
  { 
    id: 'vidlink', 
    name: 'VidLink', 
    getUrl: (id, type, season, episode) => {
      if (type === 'tv') {
        return `https://vidlink.pro/tv/${id}/${season}/${episode}`;
      }
      return `https://vidlink.pro/movie/${id}`;
    }
  },
  { 
    id: '2embed', 
    name: '2Embed', 
    getUrl: (id, type, season, episode) => {
      if (type === 'tv') {
        return `https://2embed.cc/embed/tmdb/tv?id=${id}&s=${season}&e=${episode}`;
      }
      return `https://2embed.cc/embed/tmdb/movie?id=${id}`;
    }
  },
  { 
    id: 'multiembed', 
    name: 'MultiEmbed', 
    getUrl: (id, type, season, episode) => {
      if (type === 'tv') {
        return `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`;
      }
      return `https://multiembed.mov/?video_id=${id}&tmdb=1`;
    }
  },
  { 
    id: 'vidking', 
    name: 'VidKing', 
    getUrl: (id, type, season, episode) => {
      if (type === 'tv') {
        return `https://www.vidking.net/embed/tv/${id}/${season}/${episode}`;
      }
      return `https://www.vidking.net/embed/movie/${id}`;
    }
  },
];

export const getServerUrl = (server, type, id, season, episode) => {
  return server.getUrl(id, type, season || 1, episode || 1);
};
