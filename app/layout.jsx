import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'AYUFLIX - Watch Movies & TV Shows Online',
  description: 'Stream thousands of movies and TV shows on AYUFLIX',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-ayu-black min-h-screen">
        <Navbar />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
