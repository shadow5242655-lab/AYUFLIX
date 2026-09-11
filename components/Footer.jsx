export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-gray-900 mt-16 pb-20">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <p className="text-red-600 text-xl font-black tracking-wider text-shadow-red mb-3">AYUFLIX</p>
          <p className="text-gray-500">Stream movies & TV shows free, in one place.</p>
        </div>
        <div>
          <p className="text-white font-semibold mb-3">Browse</p>
          <ul className="space-y-2 text-gray-500">
            <li><a href="/" className="hover:text-red-500 transition-colors">Home</a></li>
            <li><a href="/browse/tv" className="hover:text-red-500 transition-colors">TV Shows</a></li>
            <li><a href="/browse/movie" className="hover:text-red-500 transition-colors">Movies</a></li>
          </ul>
        </div>
        <div>
          <p className="text-white font-semibold mb-3">You</p>
          <ul className="space-y-2 text-gray-500">
            <li><a href="/my-list" className="hover:text-red-500 transition-colors">My List</a></li>
            <li><a href="/history" className="hover:text-red-500 transition-colors">Watch History</a></li>
            <li><a href="/my-stats" className="hover:text-red-500 transition-colors">My Stats</a></li>
            <li><a href="/admin" className="hover:text-red-500 transition-colors">Admin</a></li>
          </ul>
        </div>
        <div>
          <p className="text-white font-semibold mb-3">About</p>
          <p className="text-gray-500">
            AYUFLIX does not host any videos. All content is served by third-party providers. Metadata by{' '}
            <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer" className="hover:text-red-500 transition-colors">TMDB</a>.
          </p>
        </div>
      </div>
      <p className="text-center text-gray-600 text-xs mt-4">© {year} AYUFLIX. All rights reserved.</p>
    </footer>
  );
}
