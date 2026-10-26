'use client';

import React, { useState } from 'react';
import { useSquadStore } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { CodingSubmission, PersonaId } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import confetti from 'canvas-confetti';
import {
  Code2,
  Flame,
  Trophy,
  ExternalLink,
  CheckCircle2,
  Send,
  Copy,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Terminal,
  FileCode,
  Award,
  Clock,
  Layers,
} from 'lucide-react';

// Boilerplate templates for submission modal
const CODE_BOILERPLATES: Record<CodingSubmission['language'], string> = {
  TypeScript: `function longestPalindrome(s: string): string {
  // Write your TypeScript solution here
  if (!s || s.length <= 1) return s;
  
  let start = 0, maxLen = 1;
  // TODO: Expand around center or DP
  
  return s.substring(start, start + maxLen);
}`,
  Python: `class Solution:
    def longestPalindrome(self, s: str) -> str:
        # Write your Python solution here
        if not s or len(s) <= 1:
            return s
        
        # TODO: Expand around center
        return s[0]`,
  Java: `class Solution {
    public String longestPalindrome(String s) {
        if (s == null || s.length() < 1) return "";
        // Write your Java solution here
        return s.substring(0, 1);
    }
}`,
  'C++': `#include <string>
using namespace std;

class Solution {
public:
    string longestPalindrome(string s) {
        if (s.empty()) return "";
        // Write your C++ solution here
        return s.substr(0, 1);
    }
};`,
};

// Simple syntax token styling helper
export function CodeBlock({
  code,
  language,
  maxLines = 15,
}: {
  code: string;
  language?: string;
  maxLines?: number;
}) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const lines = code.trim().split('\n');
  const needsTruncation = lines.length > maxLines;
  const displayedLines = needsTruncation && !isExpanded ? lines.slice(0, maxLines) : lines;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  // Keyword highlighting logic
  const highlightLine = (line: string) => {
    // Escape HTML special characters
    const escaped = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Identify comment
    const commentMatch = escaped.match(/(\/\/.*|#.*)/);
    let mainPart = escaped;
    let commentPart = '';
    if (commentMatch && commentMatch.index !== undefined) {
      mainPart = escaped.slice(0, commentMatch.index);
      commentPart = `<span class="text-emerald-500/80 italic font-mono">${commentMatch[0]}</span>`;
    }

    // Highlight strings
    let formatted = mainPart.replace(
      /(["'`].*?["'`])/g,
      '<span class="text-amber-300 dark:text-amber-200 font-mono">$1</span>'
    );

    // Highlight keywords
    const keywords = [
      'function', 'return', 'def', 'class', 'import', 'from', 'const', 'let', 'var',
      'if', 'else', 'while', 'for', 'in', 'public', 'string', 'void', 'include',
      'using', 'namespace', 'boolean', 'int', 'new', 'this', 'async', 'await'
    ];
    const regex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
    formatted = formatted.replace(
      regex,
      '<span class="text-indigo-400 dark:text-indigo-300 font-semibold font-mono">$1</span>'
    );

    // Highlight numbers
    formatted = formatted.replace(
      /\b(\d+)\b/g,
      '<span class="text-cyan-400 dark:text-cyan-300 font-mono">$1</span>'
    );

    return formatted + commentPart;
  };

  return (
    <div className="relative rounded-xl overflow-hidden border border-border/80 bg-slate-950 text-slate-100 shadow-inner group">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-800 bg-slate-900/90 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-mono font-medium text-slate-300">{language || 'Code'}</span>
          <span className="text-[11px] text-slate-500">({lines.length} lines)</span>
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-mono">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content with Line Numbers */}
      <div className="p-3.5 font-mono text-xs overflow-x-auto leading-relaxed select-text">
        <table className="w-full border-collapse">
          <tbody>
            {displayedLines.map((line, idx) => (
              <tr key={idx} className="hover:bg-slate-900/50">
                <td className="w-8 pr-3 text-right text-slate-600 select-none text-[11px]">
                  {idx + 1}
                </td>
                <td
                  className="pl-2 whitespace-pre"
                  dangerouslySetInnerHTML={{ __html: highlightLine(line) || '&nbsp;' }}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Truncation / Expand Toggle */}
      {needsTruncation && (
        <div className="border-t border-slate-800/80 bg-slate-900/60 p-2 text-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium py-1 px-3 rounded hover:bg-slate-800 transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                Show all {lines.length} lines
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export function DailyCoding() {
  const {
    codingProblem,
    personas,
    currentPersonaId,
    submitCodingSolution,
  } = useSquadStore();

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<CodingSubmission['language']>('TypeScript');
  const [solutionCode, setSolutionCode] = useState(CODE_BOILERPLATES['TypeScript']);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [selectedSubmissionTab, setSelectedSubmissionTab] = useState<PersonaId | 'all'>('all');
  const [justSubmitted, setJustSubmitted] = useState(false);

  const activePersona = personas[currentPersonaId] || personas.aman;
  const hasUserSubmittedToday = codingProblem.submissions.some(
    (s) => s.personaId === currentPersonaId
  );

  // Difficulty badge variant
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'Hard':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
      default:
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30';
    }
  };

  // Switch boilerplate when changing language if untouched
  const handleLanguageChange = (lang: CodingSubmission['language']) => {
    setSelectedLanguage(lang);
    setSolutionCode(CODE_BOILERPLATES[lang]);
  };

  // Submit solution handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!solutionCode.trim()) return;

    submitCodingSolution(solutionCode.trim(), selectedLanguage);

    // Launch celebratory confetti
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'],
      });
    } catch {
      // Confetti fallback
    }

    setJustSubmitted(true);
    setTimeout(() => {
      setJustSubmitted(false);
      setIsSubmitModalOpen(false);
    }, 1200);
  };

  // Compute leaderboard based on streak flame & submissions
  const leaderboard = Object.values(personas).map((persona) => {
    const isSubmittedToday = codingProblem.submissions.some((s) => s.personaId === persona.id);
    const streak = persona.stats?.studyStreak || 0;
    // Points = streak * 100 + (submitted today ? 150 : 0)
    const points = streak * 100 + (isSubmittedToday ? 150 : 0);

    return {
      persona,
      streak,
      points,
      isSubmittedToday,
    };
  }).sort((a, b) => b.points - a.points || b.streak - a.streak);

  // Filter submissions by tab
  const filteredSubmissions = selectedSubmissionTab === 'all'
    ? codingProblem.submissions
    : codingProblem.submissions.filter((s) => s.personaId === selectedSubmissionTab);

  return (
    <div id="coding" className="space-y-6">
      {/* Module Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              <Code2 className="w-5 h-5" />
            </span>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Daily Coding Challenge</h2>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Solve together, review roommates’ algorithmic solutions, and keep the streak fire ablaze.
          </p>
        </div>

        {/* Action Button: Solve Challenge */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="study"
            size="md"
            onClick={() => setIsSubmitModalOpen(true)}
            leftIcon={<Code2 className="w-4 h-4" />}
            className="w-full sm:w-auto shadow-indigo-500/25"
          >
            {hasUserSubmittedToday ? 'Update Solution' : 'Submit Solution'}
          </Button>
        </div>
      </div>

      {/* Main Grid: Problem Card (Left) & Streak Leaderboard (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Problem of the Day Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card variant="study" className="overflow-hidden">
            <CardHeader className="bg-muted/40 border-b border-border/80 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" size="sm" className="font-mono text-[11px]">
                    {codingProblem.date}
                  </Badge>
                  <span
                    className={`inline-flex items-center font-medium rounded-full border text-xs px-2.5 py-0.5 ${getDifficultyColor(
                      codingProblem.difficulty
                    )}`}
                  >
                    {codingProblem.difficulty}
                  </span>
                </div>

                {hasUserSubmittedToday ? (
                  <Badge variant="success" size="sm" className="gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Solved by You Today (+150 pts)
                  </Badge>
                ) : (
                  <Badge variant="warning" size="sm" className="gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    Pending your solution
                  </Badge>
                )}
              </div>

              <CardTitle className="text-lg md:text-xl font-bold text-foreground mt-2">
                {codingProblem.title}
              </CardTitle>

              {/* Tag Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {codingProblem.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground border border-border"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-5">
              {/* Problem Description */}
              <div className="text-sm text-foreground/90 leading-relaxed">
                {codingProblem.description}
              </div>

              {/* Example Input / Output Box */}
              <div className="space-y-3 rounded-xl bg-muted/50 p-4 border border-border/60">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Example Input
                  </span>
                  <div className="p-2.5 rounded-lg bg-card border border-border font-mono text-xs text-foreground">
                    {codingProblem.exampleInput}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Example Output
                  </span>
                  <div className="p-2.5 rounded-lg bg-card border border-border font-mono text-xs text-indigo-400 font-semibold">
                    {codingProblem.exampleOutput}
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Constraints
                  </span>
                  <p className="text-xs font-mono text-muted-foreground">
                    {codingProblem.constraints}
                  </p>
                </div>
              </div>

              {/* Footer action bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60">
                {codingProblem.referenceUrl && (
                  <a
                    href={codingProblem.referenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-400 hover:underline font-medium"
                  >
                    <span>View original on LeetCode</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <Button
                  variant="study"
                  size="sm"
                  onClick={() => setIsSubmitModalOpen(true)}
                  leftIcon={<Code2 className="w-3.5 h-3.5" />}
                >
                  {hasUserSubmittedToday ? 'Resubmit Solution' : 'Submit My Code'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Group Submissions Showcase */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-500" />
                <h3 className="text-base font-semibold text-foreground">
                  Roommate Solutions Showcase ({codingProblem.submissions.length})
                </h3>
              </div>

              {/* Submissions Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setSelectedSubmissionTab('all')}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    selectedSubmissionTab === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All ({codingProblem.submissions.length})
                </button>
                {Object.values(personas).map((p) => {
                  const subCount = codingProblem.submissions.filter((s) => s.personaId === p.id).length;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedSubmissionTab(p.id)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors whitespace-nowrap ${
                        selectedSubmissionTab === p.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {p.name} {subCount > 0 ? `(${subCount})` : ''}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submission Cards */}
            {filteredSubmissions.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-border bg-card">
                <Code2 className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium text-foreground">No submissions found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Be the first in the flat to submit a working code solution!
                </p>
                <Button
                  variant="study"
                  size="sm"
                  className="mt-4"
                  onClick={() => setIsSubmitModalOpen(true)}
                >
                  Submit First Solution
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSubmissions.map((sub) => {
                  const author = personas[sub.personaId] || personas.aman;
                  const isCurrentUser = sub.personaId === currentPersonaId;

                  return (
                    <Card
                      key={sub.id}
                      className={`border transition-all ${
                        isCurrentUser ? 'border-indigo-500/40 shadow-sm bg-card' : 'border-border'
                      }`}
                    >
                      <CardHeader className="p-4 pb-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          {/* Author Info */}
                          <div className="flex items-center gap-2.5">
                            <Avatar
                              src={author.avatar}
                              name={author.name}
                              size="sm"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-xs text-foreground">
                                  {author.name}
                                </span>
                                {isCurrentUser && (
                                  <span className="text-[10px] font-medium bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.2 rounded">
                                    You
                                  </span>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  ({author.role})
                                </span>
                              </div>
                              <span className="text-[11px] text-muted-foreground">
                                Submitted {formatRelativeTime(sub.submittedAt)}
                              </span>
                            </div>
                          </div>

                          {/* Submission Badges */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                              {sub.language}
                            </span>
                            <Badge variant="success" size="sm" className="gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              {sub.status}
                            </Badge>
                          </div>
                        </div>

                        {sub.notes && (
                          <div className="mt-2.5 p-2 rounded-lg bg-muted/60 text-xs text-foreground/80 border border-border/50 italic">
                            💬 &ldquo;{sub.notes}&rdquo;
                          </div>
                        )}
                      </CardHeader>

                      <CardContent className="p-4 pt-0">
                        {/* Syntax Highlighted Code Viewer */}
                        <CodeBlock
                          code={sub.codeSnippet}
                          language={sub.language}
                          maxLines={14}
                        />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Streak Leaderboard & Roommate Flames */}
        <div className="space-y-6">
          {/* Streak Leaderboard Card */}
          <Card variant="study" className="sticky top-20">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <Flame className="w-5 h-5 fill-amber-500 animate-pulse" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-1.5">
                      Streak Leaderboard
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Ranked by streak days & points
                    </CardDescription>
                  </div>
                </div>

                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              {leaderboard.map((item, idx) => {
                const isCurrentActive = item.persona.id === currentPersonaId;
                const rankMedals = ['🥇', '🥈', '🥉', '4th'];

                return (
                  <div
                    key={item.persona.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isCurrentActive
                        ? 'bg-indigo-500/10 border-indigo-500/40 shadow-sm'
                        : 'bg-muted/40 border-border/60 hover:bg-muted/70'
                    }`}
                  >
                    {/* Rank & Persona Avatar */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-sm font-bold w-6 text-center shrink-0">
                        {rankMedals[idx] || `${idx + 1}`}
                      </span>

                      <Avatar
                        src={item.persona.avatar}
                        name={item.persona.name}
                        size="sm"
                      />

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-foreground truncate">
                            {item.persona.name}
                          </span>
                          {isCurrentActive && (
                            <span className="text-[10px] bg-indigo-500 text-white font-medium px-1.5 py-0.2 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-muted-foreground block truncate">
                          {item.persona.role}
                        </span>
                      </div>
                    </div>

                    {/* Streak Flame & Points */}
                    <div className="flex flex-col items-end shrink-0 pl-2">
                      <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                        <Flame className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{item.streak} days</span>
                      </div>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {item.points} pts
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Active Persona Fast Stats Callout */}
              <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-cyan-500/10 border border-indigo-500/20 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Your Coding Persona
                  </span>
                  <span className="text-indigo-400 font-mono">
                    {activePersona.stats.studyStreak} Days 🔥
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Switching personas in the top bar switches whose solutions and streak stats are updated.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submit Solution Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-indigo-500" />
            <span>Submit Solution: {codingProblem.title}</span>
          </div>
        }
        description={`Submitting as ${activePersona.name} (${activePersona.role}). Solved code will boost your streak and award 150 points.`}
        size="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Language Selector */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Programming Language
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['TypeScript', 'Python', 'Java', 'C++'] as const).map((lang) => (
                <button
                  type="button"
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all text-center ${
                    selectedLanguage === lang
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-muted/60 text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Code Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Solution Code ({selectedLanguage})
              </label>
              <span className="text-[11px] text-muted-foreground font-mono">
                {solutionCode.split('\n').length} lines
              </span>
            </div>
            <textarea
              value={solutionCode}
              onChange={(e) => setSolutionCode(e.target.value)}
              required
              rows={12}
              spellCheck={false}
              className="w-full rounded-xl border border-border bg-slate-950 text-slate-100 p-3.5 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
              placeholder="Paste or write your solution..."
            />
          </div>

          {/* Solution Approach / Complexity Notes */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Algorithm Approach & Complexity Notes (Optional)
            </label>
            <input
              type="text"
              value={submissionNotes}
              onChange={(e) => setSubmissionNotes(e.target.value)}
              placeholder="e.g. O(N^2) time, O(1) space expand around centers."
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsSubmitModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="study"
              size="md"
              disabled={justSubmitted}
              leftIcon={justSubmitted ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            >
              {justSubmitted ? 'Verified & Points Awarded! 🎉' : 'Verify & Submit'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
