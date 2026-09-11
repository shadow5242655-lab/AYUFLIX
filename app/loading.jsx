export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-500 text-sm mt-4 tracking-widest uppercase">AYUFLIX</p>
      </div>
    </div>
  );
}
