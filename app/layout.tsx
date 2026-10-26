import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { AppShell } from '@/components/shell/AppShell';

export const metadata: Metadata = {
  title: 'SquadPulse — Modern University Hostel & Flatmate Hub',
  description:
    'The 100% free and open-source operating system for university flatmates covering Daily Life, Study & Growth, and Fun & Culture with Google OAuth and multi-persona switching.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-indigo-500/20">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
