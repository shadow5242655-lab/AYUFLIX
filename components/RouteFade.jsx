'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function RouteFade({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, [pathname]);

  return (
    <div key={pathname} className="animate-fade-in">
      {children}
    </div>
  );
}
