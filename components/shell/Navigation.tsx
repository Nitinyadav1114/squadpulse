'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSquadStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Zap,
  BookOpen,
  Sparkles,
  Bell,
  ChevronLeft,
  ChevronRight,
  Radio,
  Car,
  RotateCw,
  ShoppingBag,
  Wallet,
  Code2,
  HelpCircle,
  Calendar,
  Users2,
  PieChart,
  Disc,
  Flame,
  Laugh,
} from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();
  const {
    isSidebarCollapsed,
    toggleSidebar,
    togglePingDrawer,
    hangoutPings,
    chores,
    currentPersonaId,
  } = useSquadStore();

  const unreadPingsCount = hangoutPings.filter((p) => !p.isRead).length;
  const myChoresCount = chores.filter((c) => c.currentAssigneeId === currentPersonaId).length;

  const mainNavItems = [
    {
      name: 'Hub',
      href: '/',
      icon: LayoutDashboard,
      activePattern: /^\/$/,
      accent: 'indigo',
    },
    {
      name: 'Daily',
      href: '/daily',
      icon: Zap,
      activePattern: /^\/daily/,
      accent: 'emerald',
      badge: myChoresCount > 0 ? `${myChoresCount} due` : undefined,
    },
    {
      name: 'Study',
      href: '/study',
      icon: BookOpen,
      activePattern: /^\/study/,
      accent: 'indigo',
    },
    {
      name: 'Fun',
      href: '/fun',
      icon: Sparkles,
      activePattern: /^\/fun/,
      accent: 'rose',
    },
  ];

  const subSections = [
    {
      title: 'Daily Life',
      accentColor: 'text-emerald-500',
      items: [
        { name: 'Status Radar', href: '/daily#radar', icon: Radio },
        { name: 'Ride Carpool', href: '/daily#carpool', icon: Car },
        { name: 'Chores Wheel', href: '/daily#chores', icon: RotateCw },
        { name: 'Borrow Board', href: '/daily#borrow', icon: ShoppingBag },
        { name: 'Group Wallet', href: '/daily#wallet', icon: Wallet },
      ],
    },
    {
      title: 'Study & Growth',
      accentColor: 'text-indigo-500',
      items: [
        { name: 'Daily Coding', href: '/study#coding', icon: Code2 },
        { name: 'Doubt Board', href: '/study#doubts', icon: HelpCircle },
        { name: 'Exam Countdown', href: '/study#exams', icon: Calendar },
        { name: 'Partner Finder', href: '/study#partners', icon: Users2 },
      ],
    },
    {
      title: 'Fun & Culture',
      accentColor: 'text-rose-500',
      items: [
        { name: 'Group Polls', href: '/fun#polls', icon: PieChart },
        { name: 'Spin the Wheel', href: '/fun#wheel', icon: Disc },
        { name: '30-Day Habits', href: '/fun#habits', icon: Flame },
        { name: 'Meme Vault', href: '/fun#memes', icon: Laugh },
      ],
    },
    {
      title: 'Explore',
      accentColor: 'text-amber-500',
      items: [
        { name: 'Product Tour', href: '/landing', icon: Sparkles },
      ],
    },
  ];

  return (
    <>
      {/* ------------------------------------------------------------- */}
      {/* DESKTOP COLLAPSIBLE SIDEBAR (>= 768px)                        */}
      {/* ------------------------------------------------------------- */}
      <aside
        className={cn(
          'hidden md:flex flex-col sticky top-0 h-screen z-30 bg-card border-r border-border transition-all duration-300 select-none shrink-0',
          isSidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Brand / Logo Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <Link
            href="/"
            className={cn(
              'flex items-center gap-3 overflow-hidden transition-all',
              isSidebarCollapsed && 'justify-center w-full'
            )}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
                  SquadPulse
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                  Flat 402 Hub
                </span>
              </div>
            )}
          </Link>

          {!isSidebarCollapsed && (
            <button
              onClick={toggleSidebar}
              title="Collapse Sidebar"
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapsed expand trigger button */}
        {isSidebarCollapsed && (
          <div className="pt-2 flex justify-center">
            <button
              onClick={toggleSidebar}
              title="Expand Sidebar"
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Nav Links List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Top Wings */}
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const isActive = item.activePattern.test(pathname);
              const Icon = item.icon;

              const activeBg = {
                indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold',
                emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold',
                rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold',
              }[item.accent];

              return (
                <div key={item.name} className="relative group">
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150',
                      isActive
                        ? activeBg
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      isSidebarCollapsed && 'justify-center px-0'
                    )}
                  >
                    <Icon className={cn('w-5 h-5 shrink-0', isActive ? 'scale-110' : '')} />
                    {!isSidebarCollapsed && (
                      <span className="truncate flex-1">{item.name}</span>
                    )}
                    {!isSidebarCollapsed && item.badge && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-500 px-1.5 py-0.5 rounded-full font-bold">
                        {item.badge}
                      </span>
                    )}
                  </Link>

                  {/* Tooltip on collapse */}
                  {isSidebarCollapsed && (
                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md border border-border whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
                      {item.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Detailed Section Trees (When Expanded) */}
          {!isSidebarCollapsed && (
            <div className="space-y-5 pt-2 border-t border-border">
              {subSections.map((sec) => (
                <div key={sec.title} className="space-y-1">
                  <div className={cn('text-[11px] font-bold uppercase tracking-wider px-3 mb-1', sec.accentColor)}>
                    {sec.title}
                  </div>
                  {sec.items.map((sub) => {
                    const SubIcon = sub.icon;
                    return (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <SubIcon className="w-3.5 h-3.5 shrink-0 opacity-70" />
                        <span className="truncate">{sub.name}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Footer: Hangout Pings Drawer Shortcut */}
        <div className="p-3 border-t border-border">
          <button
            onClick={togglePingDrawer}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/50 hover:bg-muted text-sm text-foreground transition-all duration-150 cursor-pointer',
              isSidebarCollapsed && 'justify-center px-0'
            )}
          >
            <div className="relative shrink-0">
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadPingsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse ring-2 ring-card" />
              )}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 flex items-center justify-between text-left">
                <span className="text-xs font-medium">Hangout Pings</span>
                {unreadPingsCount > 0 && (
                  <span className="text-[10px] bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded-full">
                    {unreadPingsCount}
                  </span>
                )}
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE BOTTOM NAVIGATION (< 768px)                            */}
      {/* ------------------------------------------------------------- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border px-2 pb-[env(safe-area-inset-bottom,10px)] pt-2 select-none shadow-lg">
        <div className="flex items-center justify-around h-12 max-w-lg mx-auto">
          {mainNavItems.map((item) => {
            const isActive = item.activePattern.test(pathname);
            const Icon = item.icon;

            const activeColor = {
              indigo: 'text-indigo-600 dark:text-indigo-400',
              emerald: 'text-emerald-600 dark:text-emerald-400',
              rose: 'text-rose-600 dark:text-rose-400',
            }[item.accent];

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 py-1 transition-all duration-150 active:scale-90',
                  isActive ? activeColor : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <div className="relative">
                  <Icon className={cn('w-5 h-5 transition-transform', isActive && 'scale-115')} />
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-card" />
                  )}
                </div>
                <span className={cn('text-[10px] font-medium mt-0.5', isActive && 'font-bold')}>
                  {item.name}
                </span>
              </Link>
            );
          })}

          {/* 5th Mobile Tab: Hangout Pings Trigger */}
          <button
            onClick={togglePingDrawer}
            className="flex flex-col items-center justify-center flex-1 py-1 text-muted-foreground hover:text-foreground active:scale-90 transition-all cursor-pointer"
          >
            <div className="relative">
              <Bell className="w-5 h-5" />
              {unreadPingsCount > 0 && (
                <span className="absolute -top-1 -right-1.5 px-1 py-0.2 bg-rose-500 text-white text-[9px] font-extrabold rounded-full">
                  {unreadPingsCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium mt-0.5">Pings</span>
          </button>
        </div>
      </nav>
    </>
  );
}
