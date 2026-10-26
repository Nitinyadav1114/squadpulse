'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LandingPage } from '@/components/landing/LandingPage';

export default function LandingPageRoute() {
  const router = useRouter();

  return (
    <LandingPage
      onEnterApp={() => {
        router.push('/');
      }}
    />
  );
}
