export const metadata = {
  title: 'About — AYUFLIX',
  description: 'What AYUFLIX is, how it works, and the tech behind it.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black px-4 md:px-8 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-black text-red-600 text-shadow-red mb-2">AYUFLIX</h1>
        <p className="text-gray-400 mb-10">
          A free, Netflix-style streaming front-end. Movies and shows are surfaced from TMDB metadata and played
          through community embed servers — AYUFLIX itself hosts nothing.
        </p>

        <section className="mb-10">
          <h2 className="text-white font-bold text-lg mb-3">How it works</h2>
          <ul className="text-gray-400 text-sm space-y-2 list-disc pl-5">
            <li>Browse or search TMDB&apos;s catalog for movies and TV shows.</li>
            <li>Pick a server (VidLink, VidKing, VidSrc, 2Embed, or ones your admin added).</li>
            <li>If a server is down, the player auto-falls-back to the next one every 6 seconds.</li>
            <li>Your list, history, ratings and progress stay on <span className="text-white">your device</span> — no account needed.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-white font-bold text-lg mb-3">Feature highlights</h2>
          <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-400">
            {[
              'Auto-fallback video player with theater mode',
              'Continue Watching + Resume where you left off',
              'Top 10 row, trending, and genre rows',
              'Full-screen search with live suggestions',
              'Command palette (Ctrl+K)',
              'TV calendar of new episodes',
              'Movie Night random picker',
              'Achievements + daily watch streak',
              'Custom lists & per-title comments',
              'Personal stats dashboard + data export',
              'Admin panel: servers, hero, announcements',
              'PWA install, keyboard shortcuts, accents',
            ].map((f) => (
              <p key={f} className="bg-gray-950 border border-gray-900 rounded-lg px-3 py-2">
                ✅ {f}
              </p>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-white font-bold text-lg mb-3">Under the hood</h2>
          <p className="text-gray-400 text-sm">
            Next.js (App Router) + React, Tailwind CSS, react-icons, TMDB API via a server-side proxy
            (<code className="text-red-400">/api/tmdb/*</code>), and a server-backed admin config endpoint shared by
            every visitor.
          </p>
        </section>

        <p className="text-gray-600 text-xs">
          AYUFLIX does not host, upload, or distribute any video files. All playback happens on third-party servers.
          Metadata is provided by{' '}
          <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer" className="text-red-500 hover:underline">
            The Movie Database (TMDB)
          </a>
          . This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </div>
    </div>
  );
}
