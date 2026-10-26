'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/shell/Header';
import { Navigation } from '@/components/shell/Navigation';
import { PingDrawer } from '@/components/shell/PingDrawer';
import { useSquadStore } from '@/lib/store';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { authUser } = useSquadStore();

  // Standalone full-bleed pages without shell sidebar/header:
  // 1. Explicit /landing route
  // 2. Explicit /login route
  // 3. Root / when unauthenticated (showing full landing page experience)
  const isStandalonePage =
    pathname === '/landing' ||
    pathname === '/login' ||
    (pathname === '/' && !authUser);

  if (isStandalonePage) {
    return <div className="min-h-screen w-full bg-background">{children}</div>;
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop Sidebar & Mobile Bottom Navigation */}
      <Navigation />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Header with Persona Switcher, Auth User & Theme Toggle */}
        <Header />

        {/* Page Body */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-12">
          {children}
        </main>
      </div>

      {/* Global Hangout Pings Slide-Over Drawer */}
      <PingDrawer />
    </div>
  );
}
