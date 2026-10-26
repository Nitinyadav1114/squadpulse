import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/shell/Header';
import { Navigation } from '@/components/shell/Navigation';
import { PingDrawer } from '@/components/shell/PingDrawer';

export const metadata: Metadata = {
  title: 'SquadPulse — Modern University Hostel & Flatmate Hub',
  description:
    'A fullstack web application for university flatmates covering Daily Life, Study & Growth, and Fun & Culture with multi-persona switching.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-indigo-500/20">
        <div className="flex min-h-screen w-full">
          {/* Desktop Sidebar & Mobile Bottom Navigation */}
          <Navigation />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Sticky Header with Persona Switcher & Theme Toggle */}
            <Header />

            {/* Page Body: includes pb-24 on mobile so bottom nav does not obscure content */}
            <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-12">
              {children}
            </main>
          </div>
        </div>

        {/* Global Hangout Pings Slide-Over Drawer */}
        <PingDrawer />
      </body>
    </html>
  );
}
