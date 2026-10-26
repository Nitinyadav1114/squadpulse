'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useSquadStore } from '@/lib/store';
import { PersonaId } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { SignInModal } from '@/components/auth/SignInModal';
import { cn } from '@/lib/utils';
import {
  Sun,
  Moon,
  Bell,
  ChevronDown,
  Sparkles,
  Check,
  RotateCcw,
  UserCheck,
  LogOut,
  Compass,
  Zap,
  LogIn,
} from 'lucide-react';

export function Header() {
  const router = useRouter();
  const {
    authUser,
    currentPersonaId,
    personas,
    setActivePersona,
    logoutUser,
    theme,
    toggleTheme,
    hangoutPings,
    togglePingDrawer,
    resetToSeedData,
  } = useSquadStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activePersona =
    personas[currentPersonaId] ||
    Object.values(personas)[0] || {
      id: 'me',
      name: authUser?.name || 'Resident',
      room: 'Flat 402',
      role: 'Resident',
      avatar: authUser?.image || '',
      tagline: '',
      bio: '',
      skills: [],
      upiId: '',
      phone: '',
      accentColor: 'indigo' as const,
      stats: { studyStreak: 0, choresCompleted: 0, debtBalance: 0 },
    };
  const unreadPingsCount = hangoutPings.filter((p) => !p.isRead).length;

  // Sync theme with HTML class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Click outside listener for persona dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleSignOut = async () => {
    setIsDropdownOpen(false);
    logoutUser();
    try {
      await signOut({ redirect: false });
    } catch (e) {
      console.error(e);
    }
    router.push('/landing');
  };

  const personaList = Object.values(personas);

  const accentBadgeVariant = {
    emerald: 'daily',
    indigo: 'study',
    rose: 'fun',
    amber: 'warning',
  }[activePersona.accentColor] as 'daily' | 'study' | 'fun' | 'warning';

  return (
    <>
      <header className="sticky top-0 z-30 h-16 w-full border-b border-border bg-background/85 backdrop-blur-md px-4 md:px-6 flex items-center justify-between transition-colors">
        {/* Left: Mobile Brand & Room Indicator */}
        <div className="flex items-center gap-3">
          {/* Visible only on mobile */}
          <Link href="/" className="md:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-emerald-400 flex items-center justify-center text-white shadow-sm shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-foreground">SquadPulse</span>
          </Link>

          {/* Desktop Room Meta */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 text-xs text-muted-foreground border border-border">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium text-foreground">Flat 402</span>
              <span>•</span>
              <span>4 Active Roommates</span>
            </div>

            <Link
              href="/landing"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-full hover:bg-muted transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              <span>Product Tour</span>
            </Link>
          </div>
        </div>

        {/* Right Controls: User Profile / Persona Switcher, Ping Bell, Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {authUser ? (
            /* Logged-In User & Persona Switcher Dropdown */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-card hover:bg-muted border border-border transition-all duration-150 cursor-pointer shadow-sm select-none"
                aria-label="User & Persona Menu"
              >
                <div className="relative">
                  <Avatar
                    name={authUser.name || activePersona.name}
                    src={authUser.image || activePersona.avatar}
                    size="sm"
                    statusDot="online"
                  />
                  {authUser.provider === 'google' && (
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-white dark:bg-card border border-border flex items-center justify-center shadow-xs">
                      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24">
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
                    </span>
                  )}
                </div>

                <div className="hidden sm:flex flex-col text-left max-w-[130px]">
                  <span className="text-xs font-semibold leading-tight text-foreground truncate">
                    {authUser.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground leading-tight truncate">
                    Flat 402
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
              </button>

              {/* Menu Dropdown Panel */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-border bg-card p-2.5 text-card-foreground shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* Authenticated User Header */}
                  <div className="px-3 py-2.5 bg-muted/40 rounded-xl border border-border mb-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        name={authUser.name}
                        src={authUser.image}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-foreground truncate">
                          {authUser.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {authUser.email}
                        </p>
                        <span className="inline-block mt-1 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                          {authUser.provider === 'google' ? 'Google OAuth' : 'Guest Demo'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Group Info Section */}
                  <div className="px-3 py-1.5 border-b border-border/80 mb-1 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Your Group
                      </span>
                      <p className="text-[10px] text-muted-foreground">
                        Flat 402 • {personaList.length} members
                      </p>
                    </div>
                    <UserCheck className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>

                  {/* Actions: Landing Page, Sign Out */}
                  <div className="mt-2 pt-2 border-t border-border space-y-1">
                    <Link
                      href="/landing"
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Compass className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Explore Landing Page Tour</span>
                    </Link>

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-xs text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Unauthenticated Header Actions */
            <div className="flex items-center gap-2">
              <Link
                href="/landing"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Tour</span>
              </Link>
              <button
                type="button"
                onClick={() => setIsSignInModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-sm hover:opacity-95 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            </div>
          )}

          {/* Live Hangout Ping Bell Trigger */}
          <button
            onClick={togglePingDrawer}
            className="relative p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Hangout Pings"
          >
            <Bell className="w-5 h-5" />
            {unreadPingsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
            )}
            {unreadPingsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
            )}
          </button>

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-300 cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400 rotate-0 hover:rotate-90 transition-transform duration-300" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-600 rotate-0 hover:-rotate-45 transition-transform duration-300" />
            )}
          </button>
        </div>
      </header>

      {/* Sign In Modal */}
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
      />
    </>
  );
}
