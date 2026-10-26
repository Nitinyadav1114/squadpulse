'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSquadStore } from '@/lib/store';
import { DailyCoding } from '@/components/study/DailyCoding';
import { DoubtBoard } from '@/components/study/DoubtBoard';
import { ExamCountdown } from '@/components/study/ExamCountdown';
import { PartnerFinder } from '@/components/study/PartnerFinder';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import {
  BookOpen,
  Code2,
  HelpCircle,
  Calendar,
  Users2,
  Flame,
  Award,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  Trophy,
} from 'lucide-react';

type StudyTab = 'all' | 'coding' | 'doubts' | 'exams' | 'partners';

export default function StudyWingPage() {
  const {
    currentPersonaId,
    personas,
    codingProblem,
    doubts,
    exams,
    hackathons,
  } = useSquadStore();

  const [activeTab, setActiveTab] = useState<StudyTab>('all');

  const activePersona =
    personas[currentPersonaId] ||
    Object.values(personas)[0] || {
      id: 'me',
      name: 'Resident',
      room: 'Flat 402',
      role: 'Resident',
      avatar: '',
      tagline: '',
      bio: '',
      skills: [],
      upiId: '',
      phone: '',
      accentColor: 'emerald' as const,
      stats: { studyStreak: 0, choresCompleted: 0, debtBalance: 0 },
    };

  // Overview calculations
  const unresolvedDoubtsCount = doubts.filter((d) => !d.isResolved).length;
  const hasUserSolvedToday = codingProblem.submissions.some(
    (s) => s.personaId === currentPersonaId
  );

  // Find next upcoming exam
  const sortedExams = [...exams].sort(
    (a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
  );
  const nextExam = sortedExams[0];
  const daysUntilNextExam = nextExam
    ? Math.max(
        0,
        Math.ceil(
          (new Date(nextExam.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  // Open hackathon slots count
  const totalOpenHackathonSlots = hackathons.reduce(
    (acc, h) => acc + h.slots.filter((s) => !s.assignedPersonaId).length,
    0
  );

  // Total squad streak sum
  const squadTotalStreak = Object.values(personas).reduce(
    (acc, p) => acc + (p.stats?.studyStreak || 0),
    0
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Wing Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-indigo-500/20 bg-gradient-to-br from-indigo-950/60 via-background to-violet-950/40 p-6 md:p-8 shadow-xl shadow-indigo-500/5">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                <BookOpen className="w-3.5 h-3.5" />
                Study &amp; Growth Wing
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                Squad Combined Streak: {squadTotalStreak} Days
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              Peer Learning &amp; Academic Hub
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Ace your university courses together. Solve the daily coding challenge, collaborate on
              complex syllabus doubts, track countdowns with group progress bars, and assemble hackathon
              teams.
            </p>

            {/* Persona Callout */}
            <div className="inline-flex items-center gap-2 pt-1 text-xs text-foreground/90">
              <Avatar src={activePersona.avatar} name={activePersona.name} size="xs" />
              <span>
                Active: <strong>{activePersona.name}</strong> ({activePersona.role}) &bull;{' '}
                <span className="text-amber-500 font-semibold">
                  {activePersona.stats.studyStreak}d Personal Streak 🔥
                </span>
              </span>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 gap-2.5 shrink-0">
            {/* Daily Coding Card */}
            <div className="p-3 rounded-2xl bg-card/80 border border-border/80 backdrop-blur-sm text-left shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Code2 className="w-3 h-3 text-indigo-400" /> Daily Problem
              </span>
              <span className="text-sm font-bold text-foreground block mt-1 truncate max-w-[130px]">
                {codingProblem.title}
              </span>
              <span
                className={`text-[10px] font-semibold mt-0.5 inline-block ${
                  hasUserSolvedToday ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {hasUserSolvedToday ? '✓ Solved today' : '• Pending solve'}
              </span>
            </div>

            {/* Unresolved Doubts */}
            <div className="p-3 rounded-2xl bg-card/80 border border-border/80 backdrop-blur-sm text-left shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-cyan-400" /> Open Doubts
              </span>
              <span className="text-lg font-bold text-foreground block mt-0.5 font-mono">
                {unresolvedDoubtsCount}
              </span>
              <span className="text-[10px] text-muted-foreground">Peer solutions needed</span>
            </div>

            {/* Next Exam */}
            <div className="p-3 rounded-2xl bg-card/80 border border-border/80 backdrop-blur-sm text-left shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3 text-indigo-400" /> Next Exam
              </span>
              <span className="text-sm font-bold text-foreground block mt-1 truncate max-w-[130px]">
                {nextExam ? nextExam.courseCode : 'None'}
              </span>
              <span className="text-[10px] text-indigo-400 font-semibold font-mono">
                {daysUntilNextExam} days left
              </span>
            </div>

            {/* Open Hackathon Slots */}
            <div className="p-3 rounded-2xl bg-card/80 border border-border/80 backdrop-blur-sm text-left shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Users2 className="w-3 h-3 text-purple-400" /> Open Slots
              </span>
              <span className="text-lg font-bold text-foreground block mt-0.5 font-mono">
                {totalOpenHackathonSlots}
              </span>
              <span className="text-[10px] text-purple-400 font-semibold">Hackathon rosters</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation / Filter Bar */}
      <div className="sticky top-16 z-20 bg-background/95 backdrop-blur-md py-2 -mx-4 px-4 border-b border-border">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            All 4 Modules
          </button>

          <a
            href="#coding"
            onClick={() => setActiveTab('coding')}
            className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap inline-flex items-center gap-1.5 transition-all ${
              activeTab === 'coding'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Daily Coding
          </a>

          <a
            href="#doubts"
            onClick={() => setActiveTab('doubts')}
            className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap inline-flex items-center gap-1.5 transition-all ${
              activeTab === 'doubts'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Doubt Board ({doubts.length})
          </a>

          <a
            href="#exams"
            onClick={() => setActiveTab('exams')}
            className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap inline-flex items-center gap-1.5 transition-all ${
              activeTab === 'exams'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Exam Countdown ({exams.length})
          </a>

          <a
            href="#partners"
            onClick={() => setActiveTab('partners')}
            className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap inline-flex items-center gap-1.5 transition-all ${
              activeTab === 'partners'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Users2 className="w-3.5 h-3.5" />
            Partner Finder ({hackathons.length})
          </a>
        </div>
      </div>

      {/* Module Sections */}
      <div className="space-y-12">
        {/* Module 1: Daily Coding Challenge */}
        {(activeTab === 'all' || activeTab === 'coding') && (
          <section id="coding" className="scroll-mt-32">
            <DailyCoding />
          </section>
        )}

        {/* Module 2: Doubt Board */}
        {(activeTab === 'all' || activeTab === 'doubts') && (
          <section id="doubts" className="scroll-mt-32">
            <DoubtBoard />
          </section>
        )}

        {/* Module 3: Exam Countdown */}
        {(activeTab === 'all' || activeTab === 'exams') && (
          <section id="exams" className="scroll-mt-32">
            <ExamCountdown />
          </section>
        )}

        {/* Module 4: Project & Hackathon Partner Finder */}
        {(activeTab === 'all' || activeTab === 'partners') && (
          <section id="partners" className="scroll-mt-32">
            <PartnerFinder />
          </section>
        )}
      </div>
    </div>
  );
}
