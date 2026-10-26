'use client';

import React, { useState } from 'react';
import { useSquadStore } from '@/lib/store';
import { calculatePollPercentages } from '@/lib/algorithms';
import { PollItem, PersonaId } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import {
  PieChart,
  Plus,
  Clock,
  CheckCircle2,
  Users,
  Flame,
  HelpCircle,
  Trash2,
  Check,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Filter,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function GroupPolls() {
  const { polls, currentPersonaId, personas, votePoll, addPoll } = useSquadStore();

  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'expired' | 'mine' | 'this_or_that'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State for Create Poll
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [isMultiChoice, setIsMultiChoice] = useState(false);
  const [durationHours, setDurationHours] = useState('24');
  const [formError, setFormError] = useState<string | null>(null);

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
      accentColor: 'rose' as const,
      stats: { studyStreak: 0, choresCompleted: 0, debtBalance: 0 },
    };

  // Helper to check if poll is active
  const isPollActive = (expiresAt: string) => {
    return new Date(expiresAt).getTime() > Date.now();
  };

  // Helper for humanized remaining time
  const formatRemainingTime = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d left`;
    }
    if (hours > 0) return `${hours}h ${mins}m left`;
    return `${mins}m left`;
  };

  // Filtered polls
  const filteredPolls = polls.filter((poll) => {
    const active = isPollActive(poll.expiresAt);
    if (activeFilter === 'active') return active;
    if (activeFilter === 'expired') return !active;
    if (activeFilter === 'mine') return poll.createdById === currentPersonaId;
    if (activeFilter === 'this_or_that') return poll.options.length === 2;
    return true;
  });

  // Handle Option input change in modal
  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const addOptionField = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const removeOptionField = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  // Create Poll submission
  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      setFormError('Please enter a poll question or debate topic.');
      return;
    }

    const cleanedOptions = options.map((o) => o.trim()).filter(Boolean);
    if (cleanedOptions.length < 2) {
      setFormError('Please provide at least 2 distinct voting options.');
      return;
    }

    const hours = parseInt(durationHours, 10) || 24;
    const expiresDate = new Date(Date.now() + hours * 60 * 60 * 1000);

    addPoll({
      question: trimmedQuestion,
      createdById: currentPersonaId,
      expiresAt: expiresDate.toISOString(),
      isMultiChoice,
      options: cleanedOptions.map((text, idx) => ({
        id: `opt-${Date.now()}-${idx}`,
        text,
        voterIds: [],
      })),
    });

    confetti({
      particleCount: 60,
      spread: 55,
      origin: { y: 0.7 },
      colors: ['#F43F5E', '#EC4899', '#FB7185'],
    });

    // Reset and close
    setQuestion('');
    setOptions(['', '']);
    setIsMultiChoice(false);
    setDurationHours('24');
    setIsCreateModalOpen(false);
  };

  const applyPresetQuestion = (q: string, opts: string[]) => {
    setQuestion(q);
    setOptions(opts);
  };

  return (
    <div id="polls" className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-rose-500/10 via-pink-500/5 to-transparent p-5 rounded-2xl border border-rose-500/20 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-500/20 text-rose-500">
              <PieChart className="w-5 h-5" />
            </span>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Group Polls & &apos;This or That&apos;</h2>
            <Badge variant="fun" size="sm">Hamilton 100%</Badge>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground">
            Settle daily flat debates, dinner plans, and weekend getaways with real-time roomie voting.
          </p>
        </div>

        <Button
          variant="fun"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateModalOpen(true)}
          className="shrink-0"
        >
          Create Poll
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            activeFilter === 'all'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'bg-muted hover:bg-muted/80 text-muted-foreground'
          }`}
        >
          All Polls ({polls.length})
        </button>
        <button
          onClick={() => setActiveFilter('active')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            activeFilter === 'active'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'bg-muted hover:bg-muted/80 text-muted-foreground'
          }`}
        >
          Active ({polls.filter((p) => isPollActive(p.expiresAt)).length})
        </button>
        <button
          onClick={() => setActiveFilter('this_or_that')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            activeFilter === 'this_or_that'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'bg-muted hover:bg-muted/80 text-muted-foreground'
          }`}
        >
          ⚡ This or That ({polls.filter((p) => p.options.length === 2).length})
        </button>
        <button
          onClick={() => setActiveFilter('mine')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            activeFilter === 'mine'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'bg-muted hover:bg-muted/80 text-muted-foreground'
          }`}
        >
          Created by Me ({polls.filter((p) => p.createdById === currentPersonaId).length})
        </button>
        <button
          onClick={() => setActiveFilter('expired')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            activeFilter === 'expired'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'bg-muted hover:bg-muted/80 text-muted-foreground'
          }`}
        >
          Expired ({polls.filter((p) => !isPollActive(p.expiresAt)).length})
        </button>
      </div>

      {/* Polls Grid */}
      {filteredPolls.length === 0 ? (
        <Card className="text-center p-8 bg-card/50 border-dashed">
          <HelpCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-60" />
          <h3 className="font-semibold text-base mb-1">No polls match this filter</h3>
          <p className="text-xs text-muted-foreground mb-4">Start a new debate or switch your filter above.</p>
          <Button variant="fun" size="sm" onClick={() => setIsCreateModalOpen(true)}>
            Start a Poll
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredPolls.map((poll) => {
            const active = isPollActive(poll.expiresAt);
            const creator = personas[poll.createdById] || { name: poll.createdById, avatar: '' };
            const percentages = calculatePollPercentages(poll.options);
            const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.voterIds?.length || 0), 0);
            const isTwoOptions = poll.options.length === 2;

            // Unique voters who participated
            const uniqueVoters = Array.from(
              new Set(poll.options.flatMap((opt) => opt.voterIds || []))
            );

            return (
              <Card
                key={poll.id}
                className={`overflow-hidden transition-all duration-200 border ${
                  active ? 'border-rose-500/25 hover:border-rose-500/40 shadow-sm' : 'border-border/60 opacity-90'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={creator.name} size="sm" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium">{creator.name}</span>
                          {poll.createdById === currentPersonaId && (
                            <span className="text-[10px] text-rose-500 font-semibold bg-rose-500/10 px-1.5 py-0.5 rounded">You</span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(poll.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isTwoOptions && (
                        <Badge variant="outline" size="sm" className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-[10px]">
                          This or That
                        </Badge>
                      )}
                      <Badge
                        variant={active ? 'fun' : 'secondary'}
                        size="sm"
                        withDot
                        dotColor={active ? 'bg-rose-500' : 'bg-muted-foreground'}
                        className="text-[11px]"
                      >
                        {formatRemainingTime(poll.expiresAt)}
                      </Badge>
                    </div>
                  </div>

                  <CardTitle className="text-base font-semibold mt-2.5 leading-snug">
                    {poll.question}
                  </CardTitle>

                  <CardDescription className="flex items-center justify-between text-[11px]">
                    <span>
                      {poll.isMultiChoice ? 'Multiple choices allowed' : 'Single choice only'}
                    </span>
                    <span>
                      {totalVotes} {totalVotes === 1 ? 'total vote' : 'total votes'}
                    </span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-2.5 pt-0">
                  {/* Options List */}
                  {poll.options.map((option, idx) => {
                    const optionVotes = option.voterIds?.length || 0;
                    const percent = percentages[idx] || 0;
                    const hasVoted = option.voterIds?.includes(currentPersonaId);

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          votePoll(poll.id, option.id);
                        }}
                        className={`w-full text-left relative overflow-hidden rounded-xl border p-3 transition-all duration-200 select-none cursor-pointer group ${
                          hasVoted
                            ? 'border-rose-500 bg-rose-500/10 shadow-sm'
                            : 'border-border bg-card/60 hover:bg-muted/40 hover:border-border/80'
                        }`}
                      >
                        {/* Animated Percentage Fill Bar */}
                        <div
                          className={`absolute top-0 bottom-0 left-0 transition-all duration-500 pointer-events-none ${
                            hasVoted
                              ? 'bg-gradient-to-r from-rose-500/25 to-pink-500/20'
                              : 'bg-muted/70'
                          }`}
                          style={{ width: `${percent}%` }}
                        />

                        {/* Option Content Overlay */}
                        <div className="relative z-10 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                                hasVoted
                                  ? 'bg-rose-500 text-white border-rose-500'
                                  : 'border-muted-foreground/40 group-hover:border-rose-400'
                              }`}
                            >
                              {hasVoted ? (
                                <Check className="w-3 h-3 stroke-[3]" />
                              ) : (
                                <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground">
                                  {String.fromCharCode(65 + idx)}
                                </span>
                              )}
                            </span>

                            <span
                              className={`text-xs md:text-sm truncate font-medium ${
                                hasVoted ? 'text-foreground font-semibold' : 'text-foreground/90'
                              }`}
                            >
                              {option.text}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Voters Avatars */}
                            {option.voterIds && option.voterIds.length > 0 && (
                              <div className="flex -space-x-1.5 overflow-hidden">
                                {option.voterIds.slice(0, 3).map((voterId) => {
                                  const p = personas[voterId];
                                  return (
                                    <Avatar
                                      key={voterId}
                                      name={p?.name || voterId}
                                      size="xs"
                                      className="ring-1 ring-background"
                                    />
                                  );
                                })}
                                {option.voterIds.length > 3 && (
                                  <span className="w-5 h-5 rounded-full bg-muted text-[9px] flex items-center justify-center font-medium ring-1 ring-background">
                                    +{option.voterIds.length - 3}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Percentage Badge */}
                            <span
                              className={`text-xs font-bold tabular-nums px-2 py-0.5 rounded-md ${
                                hasVoted
                                  ? 'bg-rose-500 text-white'
                                  : 'bg-muted text-foreground'
                              }`}
                            >
                              {percent}%
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}

                  {/* Roommate Participation Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>
                        {uniqueVoters.length} of {Math.max(Object.keys(personas).length, 1)} roommates voted
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {Object.keys(personas).map((id) => {
                        const hasVotedAny = uniqueVoters.includes(id as PersonaId);
                        const p = personas[id as PersonaId];
                        if (!p) return null;
                        return (
                          <span
                            key={id}
                            title={`${p.name}: ${hasVotedAny ? 'Voted' : 'Not voted yet'}`}
                            className={`w-2 h-2 rounded-full ${
                              hasVotedAny ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                            }`}
                          />
                        );
                      })}
                      <span className="ml-1 text-[10px]">
                        ({Math.round((uniqueVoters.length / 4) * 100)}%)
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal: Create Poll */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create a New Squad Poll"
        description="Launch a fast vote for tonight's food, movie, or weekend outing."
        size="md"
      >
        <form onSubmit={handleCreatePoll} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-rose-500 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Quick Suggestions
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() =>
                  applyPresetQuestion('Dinner Plan tonight: Biryani or Pizza?', ['Dum Biryani from Meghana', 'Double Cheese Pizza'])
                }
                className="text-[11px] px-2.5 py-1 rounded-lg bg-muted hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
              >
                🍕 Biryani vs Pizza
              </button>
              <button
                type="button"
                onClick={() =>
                  applyPresetQuestion('Late Night Activity: Valorant 5-man or Netflix Movie?', ['Valorant Ranked Clutch', 'Interstellar Movie Night'])
                }
                className="text-[11px] px-2.5 py-1 rounded-lg bg-muted hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
              >
                🎮 Gaming vs Movie
              </button>
              <button
                type="button"
                onClick={() =>
                  applyPresetQuestion('Weekend Plan: Road trip to Nandi Hills or Sleep in?', ['Sunrise Road Trip', 'Sleep in & Order Pancakes'])
                }
                className="text-[11px] px-2.5 py-1 rounded-lg bg-muted hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
              >
                ⛰️ Weekend Outing
              </button>
            </div>
          </div>

          {/* Question Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Poll Question / Dilemma</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Which cafe are we working from tomorrow?"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              required
            />
          </div>

          {/* Options */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold">Options (2 to 6)</label>
              {options.length < 6 && (
                <button
                  type="button"
                  onClick={addOptionField}
                  className="text-xs text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Option
                </button>
              )}
            </div>

            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-6 text-center text-xs font-bold text-muted-foreground">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOptionField(idx)}
                      className="p-2 text-muted-foreground hover:text-rose-500 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Settings Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-xs font-semibold block mb-1">Voting Duration</label>
              <select
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="2">2 Hours (Fast Dinner Decision)</option>
                <option value="6">6 Hours (This Evening)</option>
                <option value="24">24 Hours (Full Day)</option>
                <option value="72">3 Days (Weekend Planning)</option>
              </select>
            </div>

            <div className="flex items-center gap-2.5 pt-5">
              <input
                type="checkbox"
                id="multiChoiceToggle"
                checked={isMultiChoice}
                onChange={(e) => setIsMultiChoice(e.target.checked)}
                className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500 cursor-pointer accent-rose-500"
              />
              <label htmlFor="multiChoiceToggle" className="text-xs font-medium cursor-pointer">
                Allow multiple choices
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="fun" size="md">
              Publish Poll
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
