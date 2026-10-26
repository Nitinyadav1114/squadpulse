'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSquadStore } from '@/lib/store';
import { PersonaId } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { GithubIcon } from '@/components/ui/GithubIcon';
import { Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SignInModal({ isOpen, onClose, onSuccess }: SignInModalProps) {
  const { personas, setActivePersona, setAuthUser } = useSquadStore();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');
  const [showCustomGuest, setShowCustomGuest] = useState(false);

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
      
      // Update local store immediately for instant UI responsiveness
      setActivePersona(personaId);
      setAuthUser({
        id: persona.id,
        name: persona.name,
        email: `${persona.id}@campus.squadpulse.org`,
        image: persona.avatar,
        provider: 'demo',
      });

      // Sync with NextAuth session
      await signIn('demo-login', {
        personaId: persona.id,
        name: persona.name,
        email: `${persona.id}@campus.squadpulse.org`,
        role: persona.role,
        avatar: persona.avatar,
        redirect: false,
      });

      setLoadingProvider(null);
      if (onSuccess) onSuccess();
      onClose();
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
      role: 'Guest Roommate • Visiting Flat 402',
      redirect: false,
    });

    setLoadingProvider(null);
    if (onSuccess) onSuccess();
    onClose();
  };

  const personaList = Object.values(personas);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Welcome to SquadPulse" size="md">
      <div className="space-y-5">
        {/* Header Pitch */}
        <div className="text-center space-y-1.5 -mt-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>100% Free & Open Source</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Sign In to Flat 402 Workspace
          </h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Experience real-time daily radar, split bills, chores rotation, and coding streaks with your roommates.
          </p>
        </div>

        {/* Primary Action: Google OAuth */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loadingProvider !== null}
            className="w-full relative flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-card hover:bg-muted/80 text-foreground border border-border/80 font-medium text-sm transition-all shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50"
          >
            {/* Google SVG Logo */}
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
              {loadingProvider === 'google' ? 'Connecting to Google...' : 'Continue with Google'}
            </span>
          </button>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Zero cookies tracking • NextAuth OAuth standard</span>
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-border w-full" />
          <span className="bg-card px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
            Or 1-Click Instant Demo Access
          </span>
          <div className="border-t border-border w-full" />
        </div>

        {/* 1-Click Roommate Persona Sign In */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">
            Jump in immediately as an active hostel roommate:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {personaList.map((p) => {
              const isLoading = loadingProvider === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleDemoSignIn(p.id)}
                  disabled={loadingProvider !== null}
                  className="flex items-center gap-2.5 p-2 rounded-xl border border-border/80 bg-muted/30 hover:bg-muted text-left transition-all cursor-pointer group hover:border-primary/40 disabled:opacity-50"
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
        </div>

        {/* Custom Guest Name Option */}
        <div className="pt-2 border-t border-border/60">
          {!showCustomGuest ? (
            <button
              type="button"
              onClick={() => setShowCustomGuest(true)}
              className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>+ Or enter with your custom guest name</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          ) : (
            <form onSubmit={handleCustomGuestSignIn} className="space-y-2 pt-1">
              <label className="text-xs font-medium text-foreground block">
                Enter your name:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Rahul Verma"
                  className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  autoFocus
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={loadingProvider !== null}
                >
                  Enter
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Open Source Footer */}
        <div className="text-center pt-2">
          <a
            href="https://github.com/Nitinyadav1114/squadpulse"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>Open Source on GitHub (MIT License)</span>
          </a>
        </div>
      </div>
    </Modal>
  );
}
