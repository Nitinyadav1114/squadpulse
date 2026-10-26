'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useSquadStore } from '@/lib/store';
import { PersonaId } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { GithubIcon } from '@/components/ui/GithubIcon';
import { Sparkles, ArrowRight, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authError = searchParams.get('error');
  const { personas, setActivePersona, setAuthUser } = useSquadStore();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      setLoadingProvider('google');
      await signIn('google', { callbackUrl: '/' });
    } catch (err) {
      console.error('Google sign-in error:', err);
      setLoadingProvider(null);
    }
  };

  const handleDemoSignIn = async (personaId: PersonaId) => {
    try {
      setLoadingProvider(personaId);
      const persona = personas[personaId];

      setActivePersona(personaId);
      setAuthUser({
        id: persona.id,
        name: persona.name,
        email: `${persona.id}@campus.squadpulse.org`,
        image: persona.avatar,
        provider: 'demo',
      });

      await signIn('demo-login', {
        personaId: persona.id,
        name: persona.name,
        email: `${persona.id}@campus.squadpulse.org`,
        role: persona.role,
        avatar: persona.avatar,
        redirect: false,
      });

      router.push('/');
    } catch (err) {
      console.error('Demo sign-in error:', err);
      setLoadingProvider(null);
    }
  };

  const handleCustomGuestSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customName.trim() || 'Guest Roommate';
    setLoadingProvider('custom-guest');

    setActivePersona('aman');
    setAuthUser({
      id: 'custom-guest',
      name: trimmed,
      email: `${trimmed.toLowerCase().replace(/\s+/g, '.')}@campus.squadpulse.org`,
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      provider: 'guest',
    });

    await signIn('demo-login', {
      personaId: 'custom-guest',
      name: trimmed,
      email: `${trimmed.toLowerCase().replace(/\s+/g, '.')}@campus.squadpulse.org`,
      role: 'Guest Roommate • Flat 402',
      redirect: false,
    });

    router.push('/');
  };

  const personaList = Object.values(personas);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-10 px-4">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-400 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-foreground">
              SquadPulse
            </span>
          </Link>
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            Free & Open Source Campus OS
          </div>
          <h1 className="text-2xl font-bold text-foreground">Welcome to Flat 402</h1>
          <p className="text-xs text-muted-foreground">
            Sign in with Google or select a persona for zero-config 1-click access.
          </p>
        </div>

        {/* Auth Error / Setup Notice Banner */}
        {authError && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-200">
                {authError === 'Configuration'
                  ? 'Google OAuth Credentials Notice'
                  : `Authentication Notice (${authError})`}
              </p>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                {authError === 'Configuration'
                  ? 'Google OAuth credentials (GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET) need to be configured in your environment or Vercel dashboard. In the meantime, you can explore the app immediately with 1-click using any roommate persona below!'
                  : 'Could not complete third-party OAuth exchange. You can jump straight in using the 1-click roommate personas below.'}
              </p>
            </div>
          </div>
        )}

        {/* Google OAuth Button */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loadingProvider !== null}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl bg-muted/60 hover:bg-muted text-foreground border border-border font-medium text-sm transition-all shadow-sm hover:shadow cursor-pointer disabled:opacity-50"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>
              {loadingProvider === 'google' ? 'Redirecting to Google...' : 'Continue with Google'}
            </span>
          </button>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>OAuth 2.0 compliant • No password required</span>
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-border w-full" />
          <span className="bg-card px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
            Instant 1-Click Demo Personas
          </span>
          <div className="border-t border-border w-full" />
        </div>

        {/* Roommate Personas Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {personaList.map((p) => {
            const isLoading = loadingProvider === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleDemoSignIn(p.id)}
                disabled={loadingProvider !== null}
                className="flex items-center gap-2.5 p-2.5 rounded-2xl border border-border bg-muted/20 hover:bg-muted/80 text-left transition-all cursor-pointer group hover:border-primary/40 disabled:opacity-50"
              >
                <Avatar name={p.name} src={p.avatar} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {p.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {p.role.split('•')[0]}
                  </div>
                </div>
                <Zap className="w-3.5 h-3.5 text-muted-foreground group-hover:text-amber-400 shrink-0 transition-colors" />
              </button>
            );
          })}
        </div>

        {/* Custom Guest Name */}
        <form onSubmit={handleCustomGuestSignIn} className="space-y-2 pt-2 border-t border-border">
          <span className="text-xs font-medium text-foreground block">
            Or type your custom guest name:
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Priyanshu / Roommate"
              className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <Button type="submit" size="sm" disabled={loadingProvider !== null}>
              Enter Flat
            </Button>
          </div>
        </form>

        {/* Links */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
          <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
            <span>← Back to Landing Page</span>
          </Link>
          <a
            href="https://github.com/Nitinyadav1114/squadpulse"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 animate-spin text-primary" />
            <span>Loading authentication...</span>
          </div>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
