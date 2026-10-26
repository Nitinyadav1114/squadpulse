'use client';

import React, { useEffect } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { useSquadStore } from '@/lib/store';

function SessionSync() {
  const { data: session, status } = useSession();
  const { authUser, setAuthUser } = useSquadStore();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const user = session.user as any;
      setAuthUser({
        id: user.id || user.email || 'authenticated-user',
        name: user.name || 'Roommate',
        email: user.email || 'user@campus.edu',
        image: user.image || '',
        provider: user.provider || (user.email?.includes('@gmail.com') ? 'google' : 'demo'),
      });
    } else if (status === 'unauthenticated' && authUser?.provider === 'google') {
      // Clear store if google session expired/logged out
      setAuthUser(null);
    }
  }, [session, status, setAuthUser, authUser?.provider]);

  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionSync />
      {children}
    </SessionProvider>
  );
}
