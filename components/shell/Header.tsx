'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSquadStore } from '@/lib/store';
import { PersonaId } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
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
} from 'lucide-react';

export function Header() {
  const {
    currentPersonaId,
    personas,
    setActivePersona,
    theme,
    toggleTheme,
    hangoutPings,
    togglePingDrawer,
    resetToSeedData,
  } = useSquadStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activePersona = personas[currentPersonaId] || personas.aman;
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

  const personaList = Object.values(personas);

  const accentBadgeVariant = {
    emerald: 'daily',
    indigo: 'study',
    rose: 'fun',
    amber: 'warning',
  }[activePersona.accentColor] as 'daily' | 'study' | 'fun' | 'warning';

  return (
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
        </div>
      </div>

      {/* Right Controls: Persona Switcher, Ping Bell, Theme Toggle */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* 4-Persona Switcher Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-card hover:bg-muted border border-border transition-all duration-150 cursor-pointer shadow-sm select-none"
            aria-label="Switch Persona"
          >
            <Avatar
              name={activePersona.name}
              src={activePersona.avatar}
              size="sm"
              statusDot="online"
            />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold leading-tight text-foreground">
                {activePersona.name}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight">
                {activePersona.role}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
          </button>

          {/* Persona Selection Dropdown Panel */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-border bg-card p-2 text-card-foreground shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-border mb-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Active Roommate Perspective
                  </span>
                  <UserCheck className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Select a roommate to experience relative debts, chores & status.
                </p>
              </div>

              <div className="space-y-1">
                {personaList.map((p) => {
                  const isSelected = p.id === currentPersonaId;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActivePersona(p.id);
                        setIsDropdownOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer',
                        isSelected
                          ? 'bg-primary/10 border border-primary/20 text-foreground font-medium'
                          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar name={p.name} src={p.avatar} size="sm" />
                        <div>
                          <div className="text-xs font-semibold leading-tight text-foreground">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {p.role} • {p.room.split('-')[1]?.trim() || p.room}
                          </div>
                        </div>
                      </div>

                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                          <Check className="w-3 h-3" />
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">Switch</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 pt-2 border-t border-border flex items-center justify-between px-2">
                <button
                  onClick={() => {
                    resetToSeedData();
                    setIsDropdownOpen(false);
                  }}
                  className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Demo Data</span>
                </button>
                <Badge variant={accentBadgeVariant} size="sm">
                  {activePersona.accentColor.toUpperCase()}
                </Badge>
              </div>
            </div>
          )}
        </div>

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
  );
}
