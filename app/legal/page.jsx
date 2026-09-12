export const metadata = {
  title: 'Terms & Privacy — AYUFLIX',
};

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-black px-4 md:px-8 py-10">
      <div className="max-w-3xl mx-auto text-gray-400 text-sm leading-relaxed space-y-8">
        <h1 className="text-3xl font-black text-white">Terms &amp; Privacy</h1>

        <section>
          <h2 className="text-white font-bold text-lg mb-2">What AYUFLIX is</h2>
          <p>
            AYUFLIX is a discovery interface for movies and TV shows. It does not host, store, upload, or distribute
            any video content. All playback is provided by third-party embed servers that are not affiliated with
            AYUFLIX. Availability and legality of content on those servers is outside our control.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-2">Your data stays with you</h2>
          <p>
            There are no accounts. Everything personal — My List, watch history, ratings, episode progress, comments,
            custom lists, and preferences — is stored <span className="text-white">only in your browser</span>{' '}
            (localStorage) on your own device. Clearing your browser data or pressing &ldquo;Clear all my data&rdquo; in
            Settings removes it permanently. Nothing is uploaded to us.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-2">Site configuration</h2>
          <p>
            Non-personal site settings (enabled servers, hero banner, announcements, maintenance mode) are stored on
            the AYUFLIX server and apply to all visitors equally. They contain no personal information.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-2">Third-party services</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Metadata and images: The Movie Database (TMDB).</li>
            <li>Video playback: community embed providers (VidLink, VidKing, VidSrc, 2Embed, and any admin-added servers).</li>
            <li>These services may set their own cookies or log your IP when you load them.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-2">Acceptable use</h2>
          <p>
            Use AYUFLIX at your own discretion and in accordance with the laws of your country. AYUFLIX is a
            portfolio/demo project provided &ldquo;as is&rdquo;, without warranty of any kind.
          </p>
        </section>

        <p className="text-gray-600 text-xs">Last updated: September 2026</p>
      </div>
    </div>
  );
}
