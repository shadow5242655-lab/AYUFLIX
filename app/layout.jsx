import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import MaintenanceGate from '@/components/MaintenanceGate';
import ShortcutsHelp from '@/components/ShortcutsHelp';
import RouteFade from '@/components/RouteFade';
import ScrollProgress from '@/components/ScrollProgress';
import CommandPalette from '@/components/CommandPalette';
import ToastHost from '@/lib/toast';

export const metadata = {
  title: 'AYUFLIX - Watch Movies & TV Shows Online',
  description: 'Stream thousands of movies and TV shows on AYUFLIX',
  manifest: '/manifest.json',
  icons: { icon: '/icon.svg' },
};

export const viewport = {
  themeColor: '#E50914',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-ayu-black min-h-screen flex flex-col">
        <MaintenanceGate>
          <AnnouncementBanner />
          <Navbar />
          <ScrollProgress />
          <main className="pt-16 flex-1">
            <RouteFade>{children}</RouteFade>
          </main>
          <Footer />
          <ScrollToTop />
          <ShortcutsHelp />
          <CommandPalette />
        </MaintenanceGate>
        <ToastHost />
      </body>
    </html>
  );
}
