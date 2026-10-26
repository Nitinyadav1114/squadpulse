'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useSquadStore } from '@/lib/store';
import { SignInModal } from '@/components/auth/SignInModal';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { GithubIcon } from '@/components/ui/GithubIcon';
import {
  Sparkles,
  Zap,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Wallet,
  Car,
  RotateCw,
  ShoppingBag,
  Code2,
  HelpCircle,
  Calendar,
  Flame,
  PieChart,
  Disc,
  Laugh,
  Layers,
  ChevronRight,
  Star,
  Check,
  ExternalLink,
  Lock,
} from 'lucide-react';

export function LandingPage({ onEnterApp }: { onEnterApp?: () => void }) {
  const router = useRouter();
  const { authUser, currentPersonaId, personas, setActivePersona, setAuthUser } = useSquadStore();
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [activeWingTab, setActiveWingTab] = useState<'daily' | 'study' | 'fun'>('daily');
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const activePersona = personas[currentPersonaId] || personas.aman;

  const handle1ClickDemo = async () => {
    try {
      setIsDemoLoading(true);
      setActivePersona('aman');
      setAuthUser({
        id: 'aman',
        name: 'Aman Sharma',
        email: 'aman@campus.squadpulse.org',
        image: personas.aman.avatar,
        provider: 'demo',
      });

      await signIn('demo-login', {
        personaId: 'aman',
        name: 'Aman Sharma',
        email: 'aman@campus.squadpulse.org',
        role: personas.aman.role,
        avatar: personas.aman.avatar,
        redirect: false,
      });

      setIsDemoLoading(false);
      if (onEnterApp) {
        onEnterApp();
      } else {
        router.push('/');
      }
    } catch (e) {
      console.error(e);
      setIsDemoLoading(false);
      if (onEnterApp) onEnterApp();
    }
  };

  const handleEnterDashboard = () => {
    if (onEnterApp) {
      onEnterApp();
    } else {
      router.push('/');
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground selection:bg-indigo-500/30">
      {/* ==================================================================== */}
      {/* Animated Glowing Orbs in Background */}
      {/* ==================================================================== */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 blur-[130px] pointer-events-none animate-float-slow -z-10" />
      <div className="absolute top-[20%] right-[-10%] w-[550px] h-[550px] rounded-full bg-gradient-to-bl from-indigo-500/25 to-purple-500/15 blur-[140px] pointer-events-none animate-float-reverse -z-10" />
      <div className="absolute bottom-[10%] left-[20%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-rose-500/15 to-amber-500/10 blur-[150px] pointer-events-none animate-pulse-glow -z-10" />

      {/* Subtle Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none -z-10" />

      {/* ==================================================================== */}
      {/* Top Navbar */}
      {/* ==================================================================== */}
      <nav className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
              SquadPulse
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hidden sm:inline-block">
              Free & Open Source
            </span>
          </div>
        </div>

        {/* Center Nav Links (Desktop) */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <a href="#wings" className="hover:text-foreground transition-colors">
            3 Core Wings
          </a>
          <a href="#features" className="hover:text-foreground transition-colors">
            13 Modules
          </a>
          <a href="#stats" className="hover:text-foreground transition-colors">
            Campus Impact
          </a>
          <a href="#tech" className="hover:text-foreground transition-colors">
            Tech Stack
          </a>
        </div>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <a
            href="https://github.com/Nitinyadav1114/squadpulse"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/80 bg-muted/30 hover:bg-muted text-xs font-medium text-foreground transition-all"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>GitHub</span>
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          </a>

          {authUser ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleEnterDashboard}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/25 hover:opacity-95 transition-all cursor-pointer"
              >
                <span>Enter Flat 402</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handle1ClickDemo}
                disabled={isDemoLoading}
                className="hidden xs:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/60 hover:bg-muted border border-border text-xs font-medium text-foreground transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>1-Click Demo</span>
              </button>
              <button
                type="button"
                onClick={() => setIsSignInModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-foreground text-background hover:bg-foreground/90 text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ==================================================================== */}
      {/* Hero Section */}
      {/* ==================================================================== */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Release Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-teal-500/10 border border-emerald-500/20 text-xs font-medium text-foreground mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-emerald-400">SquadPulse 2.0</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">Free & Open Source Flatmate OS</span>
        </div>

        {/* Big Catchy Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1] sm:leading-[1.1]">
          Turn Flatmate Chaos into{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
            Campus Harmony.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          The unified workspace for university roommates. Settle expenses with zero-cent UPI deep-links, track daily coding streak flames, monitor who's free, rotate chores fairly, and vote on Friday night plans.
        </p>

        {/* Logged in state callout OR Auth CTAs */}
        {authUser ? (
          <div className="mt-8 flex flex-col items-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-card border border-border shadow-sm">
              <Avatar name={authUser.name} src={authUser.image} size="sm" />
              <div className="text-left text-xs">
                <p className="font-semibold text-foreground">Welcome back, {authUser.name}!</p>
                <p className="text-muted-foreground text-[10px]">
                  Signed in via {authUser.provider === 'google' ? 'Google OAuth' : 'Guest Demo'} • Flat 402 Active
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleEnterDashboard}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Enter Flatmate Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/' })}
              className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-card hover:bg-muted/90 text-foreground border border-border/80 font-semibold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer hover:scale-[1.01]"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
              <span>Sign in with Google</span>
            </button>

            {/* Instant 1-Click Demo */}
            <button
              type="button"
              onClick={handle1ClickDemo}
              disabled={isDemoLoading}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all cursor-pointer hover:scale-[1.01] disabled:opacity-50"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>{isDemoLoading ? 'Launching Demo...' : 'Instant 1-Click Demo'}</span>
            </button>

            {/* GitHub Repo */}
            <a
              href="https://github.com/Nitinyadav1114/squadpulse"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-muted/40 hover:bg-muted border border-border text-muted-foreground hover:text-foreground text-sm font-medium transition-all"
            >
              <GithubIcon className="w-4 h-4" />
              <span>Fork on GitHub</span>
            </a>
          </div>
        )}

        {/* Trust Badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Open Source (MIT)</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-indigo-400" />
            <span>Zero Tracking & Ad-Free</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>100% Free Forever</span>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* Interactive Hero Live Mockup Showcase */}
        {/* ==================================================================== */}
        <div className="mt-14 relative max-w-4xl mx-auto rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-4 sm:p-6 shadow-2xl overflow-hidden text-left">
          {/* Mockup Header bar */}
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-semibold text-muted-foreground ml-2">
                Flat 402 • Live Active Squad Pulse
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>All 4 Roommates Connected</span>
            </div>
          </div>

          {/* Mockup 4-column live preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4">
            {/* Widget 1: Who's Free Radar */}
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-2 hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> Status Radar
                </span>
                <span className="text-[10px] text-muted-foreground">Now</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">Aman</span>
                  <Badge variant="success" size="sm">Free to Chill</Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">Rhea</span>
                  <Badge variant="study" size="sm">Library</Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">Dev</span>
                  <Badge variant="warning" size="sm">In Class</Badge>
                </div>
              </div>
            </div>

            {/* Widget 2: Pairwise Wallet */}
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-2 hover:border-indigo-500/40 transition-colors">
              <div className="flex items-center justify-between text-xs font-semibold text-indigo-400">
                <span className="flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5" /> Group Wallet
                </span>
                <span className="text-[10px] text-emerald-400">UPI Ready</span>
              </div>
              <div className="text-xs space-y-1">
                <p className="text-muted-foreground text-[11px]">Grocery Split Settlement:</p>
                <p className="font-semibold text-foreground">
                  Dev owes Aman <span className="text-rose-400">₹240</span>
                </p>
                <div className="pt-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 font-medium">
                    1-Tap QR Deep Link
                  </span>
                </div>
              </div>
            </div>

            {/* Widget 3: Chores Wheel */}
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-2 hover:border-amber-500/40 transition-colors">
              <div className="flex items-center justify-between text-xs font-semibold text-amber-400">
                <span className="flex items-center gap-1">
                  <RotateCw className="w-3.5 h-3.5" /> Chore Turn
                </span>
                <span className="text-[10px] text-amber-400">Due Today</span>
              </div>
              <div className="text-xs space-y-1">
                <p className="font-medium text-foreground">Water Can Refill</p>
                <p className="text-muted-foreground text-[11px]">
                  Assigned to <span className="text-foreground font-semibold">Dev</span>
                </p>
                <div className="pt-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-medium">
                    Auto-Cycles to Rhea
                  </span>
                </div>
              </div>
            </div>

            {/* Widget 4: Coding Flame */}
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-2 hover:border-rose-500/40 transition-colors">
              <div className="flex items-center justify-between text-xs font-semibold text-rose-400">
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-rose-400" /> Daily LeetCode
                </span>
                <span className="text-[10px] text-rose-400">Day 12</span>
              </div>
              <div className="text-xs space-y-1">
                <p className="font-medium text-foreground">Find Median from Data Stream</p>
                <p className="text-muted-foreground text-[11px]">
                  Flat Leaderboard: <span className="text-emerald-400 font-semibold">Aman (100 pts)</span>
                </p>
                <div className="pt-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 font-medium">
                    Streak Flame Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 3 Core Wings Interactive Section */}
      {/* ==================================================================== */}
      <section id="wings" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border/60">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
            Architected for Every Campus Dimension
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-foreground">
            Three Dedicated Wings. 13 Seamless Modules.
          </p>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground">
            No messy WhatsApp groups, forgotten debts, or chore drama. Everything your squad needs in one coherent dashboard.
          </p>

          {/* Interactive Wing Tabs */}
          <div className="mt-8 inline-flex p-1 rounded-2xl bg-muted/50 border border-border">
            <button
              onClick={() => setActiveWingTab('daily')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeWingTab === 'daily'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Daily Life</span>
            </button>
            <button
              onClick={() => setActiveWingTab('study')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeWingTab === 'study'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Study & Growth</span>
            </button>
            <button
              onClick={() => setActiveWingTab('fun')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeWingTab === 'fun'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Fun & Culture</span>
            </button>
          </div>
        </div>

        {/* Dynamic Tab Contents */}
        {activeWingTab === 'daily' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {/* Card 1: Status Radar */}
            <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.03] p-6 space-y-4 hover:border-emerald-500/40 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Who's Free Radar</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Live availability radar with instant preset hangout pings ("Chai break?", "Mess time?"). Never guess who is awake or free for lunch.
              </p>
              <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Real-time persona availability badges</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Slide-over notification drawer with unread badges</span>
                </li>
              </ul>
            </div>

            {/* Card 2: Group Wallet */}
            <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.03] p-6 space-y-4 hover:border-emerald-500/40 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Splitwise & UPI Deep Links</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Log shared flat bills, grocery splits, and hostel kitty funds with zero-cent conservation of money and 1-tap UPI payment deep links.
              </p>
              <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Greedy debt minimization matrix</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pre-filled UPI QR codes for GPay, PhonePe, Paytm</span>
                </li>
              </ul>
            </div>

            {/* Card 3: Chores Rotation */}
            <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.03] p-6 space-y-4 hover:border-emerald-500/40 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <RotateCw className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Chores Rotation & Rides</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Algorithmic turn-based chore rotation wheel, ride carpool board with seat allocation, and a lost-and-found equipment borrow hub.
              </p>
              <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Water can & cleaning round-robin turn cycling</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Campus carpools with departure countdowns</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeWingTab === 'study' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {/* Card 1: Daily LeetCode */}
            <div className="rounded-3xl border border-indigo-500/20 bg-indigo-500/[0.03] p-6 space-y-4 hover:border-indigo-500/40 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Daily Coding & Streaks</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Daily algorithmic coding problem, test runner, syntax-highlighted submission logs, and Phoenix flame streaks.
              </p>
              <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-400" />
                  <span>LeetCode / Codeforces daily problem picker</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Flatmate study streak leaderboards</span>
                </li>
              </ul>
            </div>

            {/* Card 2: Doubt Board */}
            <div className="rounded-3xl border border-indigo-500/20 bg-indigo-500/[0.03] p-6 space-y-4 hover:border-indigo-500/40 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Peer Doubt Board</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Post academic doubts, upvote crucial questions, and share markdown code snippets for exam prep and assignment help.
              </p>
              <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Anonymous or tagged student doubt posts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Community answers with resolved checkmarks</span>
                </li>
              </ul>
            </div>

            {/* Card 3: Exam Countdown & Hackathons */}
            <div className="rounded-3xl border border-indigo-500/20 bg-indigo-500/[0.03] p-6 space-y-4 hover:border-indigo-500/40 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Exam Countdown & Roster</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Live countdown clocks for end-sems, collaborative syllabus checklist tracker, and hackathon teammate recruitment.
              </p>
              <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Shared group syllabus coverage percentage</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Recruit frontend, backend, ML roles for hackathons</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeWingTab === 'fun' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {/* Card 1: Group Polls */}
            <div className="rounded-3xl border border-rose-500/20 bg-rose-500/[0.03] p-6 space-y-4 hover:border-rose-500/40 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
                <PieChart className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Squad Decision Polls</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Democratic voting powered by the Hamilton Largest Remainder rounding method so percentages always add up to exactly 100.0%.
              </p>
              <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-rose-400" />
                  <span>Guaranteed 100% integer Hamilton rounding</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-rose-400" />
                  <span>Single-choice or multi-vote flat decisions</span>
                </li>
              </ul>
            </div>

            {/* Card 2: Watch & Play Spinner */}
            <div className="rounded-3xl border border-rose-500/20 bg-rose-500/[0.03] p-6 space-y-4 hover:border-rose-500/40 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
                <Disc className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Watch & Play Wheel</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Shared backlog of movies, anime, and games. When nobody can agree what to watch on Friday night, spin the Wheel of Fortune!
              </p>
              <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-rose-400" />
                  <span>Random decision wheel with confetti celebration</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-rose-400" />
                  <span>IMDb ratings & streaming platform tags</span>
                </li>
              </ul>
            </div>

            {/* Card 3: 30-Day Habit Matrix */}
            <div className="rounded-3xl border border-rose-500/20 bg-rose-500/[0.03] p-6 space-y-4 hover:border-rose-500/40 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
                <Laugh className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Habit Matrix & Memes</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                GitHub-style 30-day commit heatmaps for gym, reading, and hydration with friendly roommate pokes, plus a shared meme vault.
              </p>
              <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-rose-400" />
                  <span>Poke flatmates who haven't completed habits today</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-rose-400" />
                  <span>Meme vault with tag search & laugh counters</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </section>

      {/* ==================================================================== */}
      {/* Campus Impact & Performance Numbers */}
      {/* ==================================================================== */}
      <section id="stats" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border/60">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-6 rounded-3xl bg-muted/30 border border-border/60 space-y-2">
            <p className="text-3xl sm:text-4xl font-extrabold text-foreground">13</p>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              Core Campus Modules
            </p>
          </div>
          <div className="p-6 rounded-3xl bg-muted/30 border border-border/60 space-y-2">
            <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400">100%</p>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              Free & Open Source
            </p>
          </div>
          <div className="p-6 rounded-3xl bg-muted/30 border border-border/60 space-y-2">
            <p className="text-3xl sm:text-4xl font-extrabold text-indigo-400">0 ms</p>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              Instant Client Reactive State
            </p>
          </div>
          <div className="p-6 rounded-3xl bg-muted/30 border border-border/60 space-y-2">
            <p className="text-3xl sm:text-4xl font-extrabold text-rose-400">₹0</p>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              Zero Server Bills (Vercel Ready)
            </p>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* Roommate Testimonials */}
      {/* ==================================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border/60">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
            Real Student Perspectives
          </h2>
          <p className="text-3xl font-extrabold text-foreground">
            Loved by Flatmates & Campus Squads
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-border/70 bg-card p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Avatar name="Aman Sharma" src={personas.aman.avatar} size="md" />
              <div>
                <p className="font-semibold text-sm text-foreground">Aman Sharma</p>
                <p className="text-[11px] text-muted-foreground">CSE 3rd Year • Tech Lead</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              "Tracking who paid for groceries was a nightmare with 4 roommates. SquadPulse minimized our pairwise debts down to a single UPI deep-link QR code. Zero confusion at month end."
            </p>
          </div>

          <div className="rounded-3xl border border-border/70 bg-card p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Avatar name="Rhea Sen" src={personas.rhea.avatar} size="md" />
              <div>
                <p className="font-semibold text-sm text-foreground">Rhea Sen</p>
                <p className="text-[11px] text-muted-foreground">Design Lead • Flatmate</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              "The chores wheel ended every single passive-aggressive text about taking out the trash and water refills. It automatically advances turns with full audit proof."
            </p>
          </div>

          <div className="rounded-3xl border border-border/70 bg-card p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Avatar name="Dev Malhotra" src={personas.dev.avatar} size="md" />
              <div>
                <p className="font-semibold text-sm text-foreground">Dev Malhotra</p>
                <p className="text-[11px] text-muted-foreground">Backend & Cloud • Flatmate</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              "The Daily Coding streak flames made our hostel flat so competitive in LeetCode. We've sustained a 12-day consecutive problem streak heading into campus placements!"
            </p>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* Open Source Tech Stack Callout */}
      {/* ==================================================================== */}
      <section id="tech" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border/60 text-center">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Built with Modern Free & Open Source Web Technologies
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 max-w-3xl mx-auto">
          {['Next.js 15 App Router', 'Auth.js / NextAuth v5', 'React 19', 'Tailwind CSS', 'Zustand 5', 'TypeScript 5', 'Lucide Icons', 'Canvas Confetti'].map((tech) => (
            <span
              key={tech}
              className="px-3.5 py-1.5 rounded-full bg-muted/40 border border-border text-xs font-medium text-foreground hover:border-primary/40 transition-colors"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* Bottom CTA Banner */}
      {/* ==================================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="rounded-3xl bg-gradient-to-tr from-indigo-950/40 via-card to-emerald-950/30 border border-border p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
            Ready to upgrade your squad?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-8">
            Deploy your own instance in minutes, sign in with Google OAuth, or take a spin right now with the live demo.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/' })}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-foreground text-background font-bold text-sm hover:opacity-95 transition-all cursor-pointer shadow-lg"
            >
              <span>Sign in with Google</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handle1ClickDemo}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-card border border-border hover:bg-muted text-foreground font-semibold text-sm transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Explore Live Demo</span>
            </button>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* Footer */}
      {/* ==================================================================== */}
      <footer className="border-t border-border/60 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-foreground">SquadPulse</span>
          <span>— The Free Open Source Campus Living System</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/Nitinyadav1114/squadpulse"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>GitHub Repository</span>
          </a>
          <span>•</span>
          <span>MIT License</span>
        </div>
      </footer>

      {/* Auth Modal */}
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
        onSuccess={handleEnterDashboard}
      />
    </div>
  );
}
