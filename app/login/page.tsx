'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { GithubIcon } from '@/components/ui/GithubIcon';
import { Sparkles, ArrowRight, ShieldCheck, AlertCircle, Copy, Check, KeyRound } from 'lucide-react';
import Link from 'next/link';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authError = searchParams.get('error');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [copiedRedirect, setCopiedRedirect] = useState(false);

  const redirectUri = typeof window !== 'undefined'
    ? `${window.location.origin}/api/auth/callback/google`
    : 'https://squadpulse-phi.vercel.app/api/auth/callback/google';

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      await signIn('google', { callbackUrl: '/' });
    } catch (err) {
      console.error('Google sign-in error:', err);
      setIsGoogleLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRedirect(true);
    setTimeout(() => setCopiedRedirect(false), 2500);
  };

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
            <span className="font-extrabold text-xl tracking-tight text-foreground">
              SquadPulse
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Sign in to your group
          </h1>
          <p className="text-xs text-muted-foreground">
            Connect with your official Google account to access your flat chores, carpools, group wallet, and study wing.
          </p>
        </div>

        {/* Configuration Error / Setup Helper Notice */}
        {authError === 'Configuration' && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <KeyRound className="w-4 h-4 shrink-0" />
              <span>Google OAuth Setup Required</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Google OAuth needs <code className="px-1 py-0.5 rounded bg-muted text-foreground">GOOGLE_CLIENT_ID</code> and <code className="px-1 py-0.5 rounded bg-muted text-foreground">GOOGLE_CLIENT_SECRET</code> set in your Vercel project environment variables.
            </p>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                Authorized Redirect URI for Google Cloud Console:
              </span>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-background/80 border border-border text-[11px] font-mono text-foreground break-all">
                <span className="flex-1 truncate">{redirectUri}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(redirectUri)}
                  className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Copy Redirect URI"
                >
                  {copiedRedirect ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Google OAuth Login Button */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl shadow-md cursor-pointer font-bold text-sm"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
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
            <span>{isGoogleLoading ? 'Connecting to Google...' : 'Sign in with Google'}</span>
          </Button>
        </div>

        {/* Security badge and GitHub link */}
        <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>OAuth 2.0 Verified</span>
          </div>
          <a
            href="https://github.com/Nitinyadav1114/squadpulse"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>Open Source</span>
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
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
