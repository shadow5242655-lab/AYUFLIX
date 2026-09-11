'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaTools } from 'react-icons/fa';
import { fetchAdminConfig } from '@/lib/adminConfig';

const BYPASS_KEY = 'ayuflix_maint_bypass';

export function setMaintenanceBypass() {
  try {
    sessionStorage.setItem(BYPASS_KEY, '1');
  } catch {
    // ignore
  }
}

export default function MaintenanceGate({ children }) {
  const [maintenance, setMaintenance] = useState(false);
  const [siteName, setSiteName] = useState('AYUFLIX');

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetchAdminConfig()
        .then((config) => {
          if (cancelled) return;
          setMaintenance(Boolean(config.maintenanceMode));
          if (config.siteName) setSiteName(config.siteName);
        })
        .catch(() => {});
    };
    load();
    const interval = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  let bypass = false;
  if (typeof window !== 'undefined') {
    try {
      bypass = sessionStorage.getItem(BYPASS_KEY) === '1';
    } catch {
      bypass = false;
    }
  }

  if (!maintenance || bypass) return children;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <FaTools className="text-red-600 text-6xl mx-auto mb-6 animate-pulse" />
        <h1 className="text-red-600 text-3xl md:text-4xl font-black tracking-wider text-shadow-red mb-3">{siteName}</h1>
        <h2 className="text-white text-xl font-bold mb-2">We&apos;ll be right back</h2>
        <p className="text-gray-400 text-sm mb-8">
          {siteName} is undergoing maintenance. We&apos;re making things better — please check back in a little while.
        </p>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-red-500 text-xs transition-colors"
        >
          Admin login
        </Link>
      </div>
    </div>
  );
}
