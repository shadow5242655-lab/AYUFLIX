import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="text-center">
        <p className="text-red-600 text-7xl md:text-8xl font-black text-shadow-red mb-4">404</p>
        <h1 className="text-white text-xl md:text-2xl font-bold mb-2">Lost your way?</h1>
        <p className="text-gray-400 text-sm mb-8 max-w-sm">
          Sorry, we can&apos;t find that page. You&apos;ll find plenty to explore on the home page.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded transition-all"
        >
          AYUFLIX Home
        </Link>
      </div>
    </div>
  );
}
