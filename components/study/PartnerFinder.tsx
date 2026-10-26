'use client';

import React, { useState } from 'react';
import { useSquadStore } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { HackathonProject, HackathonSlot, PersonaId } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import confetti from 'canvas-confetti';
import {
  Users2,
  Sparkles,
  Trophy,
  Calendar,
  Plus,
  CheckCircle2,
  UserCheck,
  UserPlus,
  LogOut,
  Tag,
  Briefcase,
  Code2,
  ExternalLink,
  Flame,
  Award,
  Filter,
} from 'lucide-react';

const COMMON_SKILLS = [
  'All Skills',
  'Python',
  'React',
  'ML',
  'UI/UX',
  'Cloud',
  'Rust',
  'TypeScript',
  'FastAPI',
  'DevOps',
];

export function PartnerFinder() {
  const {
    hackathons,
    personas,
    currentPersonaId,
    joinHackathonSlot,
    leaveHackathonSlot,
  } = useSquadStore();

  const [selectedSkillFilter, setSelectedSkillFilter] = useState('All Skills');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Team Form State
  const [newTitle, setNewTitle] = useState('');
  const [newEventName, setNewEventName] = useState('');
  const [newEventDate, setNewEventDate] = useState('Dec 5 - 7, 2026');
  const [newPrizePool, setNewPrizePool] = useState('₹1,50,000');
  const [newDescription, setNewDescription] = useState('');
  const [newTags, setNewTags] = useState('Next.js, Tailwind, FastAPI, ML');
  const [leadRoleName, setLeadRoleName] = useState('Project Lead & Fullstack');
  const [slotRole1, setSlotRole1] = useState('Frontend Dev & UI/UX');
  const [slotRole2, setSlotRole2] = useState('ML & Data Engineer');
  const [slotRole3, setSlotRole3] = useState('');

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
      accentColor: 'indigo' as const,
      stats: { studyStreak: 0, choresCompleted: 0, debtBalance: 0 },
    };

  // Filter member profiles by skill
  const memberList = Object.values(personas).filter((member) => {
    if (selectedSkillFilter === 'All Skills') return true;
    return member.skills.some(
      (s) => s.toLowerCase() === selectedSkillFilter.toLowerCase()
    );
  });

  // Handle joining a slot
  const handleJoinSlot = (projectId: string, slotIndex: number, roleName: string) => {
    joinHackathonSlot(projectId, slotIndex);

    // Confetti celebration
    try {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#ec4899', '#10b981'],
      });
    } catch {
      // fallback
    }
  };

  // Handle leaving a slot
  const handleLeaveSlot = (projectId: string, slotIndex: number) => {
    leaveHackathonSlot(projectId, slotIndex);
  };

  // Handle creating a new hackathon team project
  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newEventName.trim()) return;

    const slots: HackathonSlot[] = [
      {
        role: leadRoleName.trim() || 'Team Lead',
        assignedPersonaId: currentPersonaId,
      },
    ];

    if (slotRole1.trim()) {
      slots.push({ role: slotRole1.trim(), assignedPersonaId: null });
    }
    if (slotRole2.trim()) {
      slots.push({ role: slotRole2.trim(), assignedPersonaId: null });
    }
    if (slotRole3.trim()) {
      slots.push({ role: slotRole3.trim(), assignedPersonaId: null });
    }

    const newProject: HackathonProject = {
      id: `hack-${Date.now()}`,
      title: newTitle.trim(),
      eventName: newEventName.trim(),
      eventDate: newEventDate.trim() || 'Upcoming',
      prizePool: newPrizePool.trim() || 'Trophy & Swag',
      description: newDescription.trim() || 'Collaborative hackathon build.',
      tags: newTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      teamLeadId: currentPersonaId,
      slots,
      status: 'Recruiting',
      createdAt: new Date().toISOString(),
    };

    useSquadStore.setState((state) => ({
      hackathons: [newProject, ...state.hackathons],
    }));

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // fallback
    }

    // Reset Form
    setNewTitle('');
    setNewEventName('');
    setNewDescription('');
    setIsCreateModalOpen(false);
  };

  return (
    <div id="partners" className="space-y-6">
      {/* Module Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              <Users2 className="w-5 h-5" />
            </span>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              Project & Hackathon Partner Finder
            </h2>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Build hackathon dream teams, showcase member tech skills, and claim open roster slots with
            one tap.
          </p>
        </div>

        {/* CTA: Create Team */}
        <Button
          variant="study"
          size="md"
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="w-full sm:w-auto shadow-indigo-500/25"
        >
          Create Team Roster
        </Button>
      </div>

      {/* Member Skill Profiles Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-base font-semibold text-foreground">
              Roommate Skill Profiles ({memberList.length})
            </h3>
          </div>

          {/* Skill Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {COMMON_SKILLS.map((skill) => (
              <button
                key={skill}
                onClick={() => setSelectedSkillFilter(skill)}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedSkillFilter === skill
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Member Profiles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {memberList.map((member) => {
            const isCurrentMe = member.id === currentPersonaId;

            return (
              <Card
                key={member.id}
                className={`transition-all hover:-translate-y-0.5 ${
                  isCurrentMe
                    ? 'border-indigo-500/50 bg-indigo-500/5 shadow-md shadow-indigo-500/5'
                    : 'border-border bg-card'
                }`}
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={member.avatar}
                      name={member.name}
                      size="md"
                      statusDot="online"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-foreground truncate">
                          {member.name}
                        </span>
                        {isCurrentMe && (
                          <span className="text-[10px] bg-indigo-500 text-white font-medium px-1.5 py-0.2 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground block truncate">
                        {member.role}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-1 space-y-3">
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {member.bio}
                  </p>

                  {/* Skills Badges */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Core Stack
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {member.skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground border border-border/80"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Status / Room badge */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
                    <span>{member.room}</span>
                    <Badge variant="study" size="sm">
                      {member.stats.studyStreak}d streak 🔥
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Hackathon Team Rosters Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-indigo-400" />
          <h3 className="text-base font-semibold text-foreground">
            Hackathon Rosters & Open Role Slots ({hackathons.length})
          </h3>
        </div>

        {/* Hackathon Projects Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {hackathons.map((project) => {
            const teamLead = personas[project.teamLeadId] || { name: 'Lead', avatar: '' };
            const openSlotsCount = project.slots.filter((s) => !s.assignedPersonaId).length;
            const isLead = project.teamLeadId === currentPersonaId;

            return (
              <Card
                key={project.id}
                variant="study"
                className="overflow-hidden border border-indigo-500/20 flex flex-col justify-between"
              >
                <div>
                  {/* Project Header */}
                  <CardHeader className="p-5 pb-3 bg-muted/20 border-b border-border/60">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="study" size="sm" className="font-semibold">
                            {project.eventName}
                          </Badge>
                          {openSlotsCount > 0 ? (
                            <Badge variant="warning" size="sm" className="gap-1 animate-pulse font-medium">
                              <UserPlus className="w-3 h-3" />
                              {openSlotsCount} {openSlotsCount === 1 ? 'Slot Open' : 'Slots Open'}
                            </Badge>
                          ) : (
                            <Badge variant="success" size="sm" className="gap-1 font-medium">
                              <UserCheck className="w-3 h-3" />
                              Roster Full
                            </Badge>
                          )}
                        </div>

                        <CardTitle className="text-base md:text-lg font-bold text-foreground mt-1">
                          {project.title}
                        </CardTitle>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                            {project.eventDate}
                          </span>
                          <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                            <Award className="w-3.5 h-3.5" />
                            Prize: {project.prizePool}
                          </span>
                        </div>
                      </div>

                      {/* Team Lead Avatar */}
                      <div className="flex items-center gap-2 bg-card px-2.5 py-1.5 rounded-xl border border-border/80 shrink-0">
                        <Avatar src={teamLead.avatar} name={teamLead.name} size="xs" />
                        <div className="text-left">
                          <span className="text-[11px] font-semibold block text-foreground leading-tight">
                            {teamLead.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground block">
                            Lead {isLead ? '(You)' : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                      {project.description}
                    </p>

                    {/* Tech Stack Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-3">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground border border-border/60"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardHeader>

                  {/* Team Roster Slots */}
                  <CardContent className="p-5 space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Team Roster & Positions ({project.slots.length} Members)
                    </span>

                    <div className="space-y-2">
                      {project.slots.map((slot, sIdx) => {
                        const assignedPersona = slot.assignedPersonaId
                          ? personas[slot.assignedPersonaId]
                          : null;
                        const isSlotAssignedToMe = slot.assignedPersonaId === currentPersonaId;

                        return (
                          <div
                            key={sIdx}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                              assignedPersona
                                ? isSlotAssignedToMe
                                  ? 'bg-indigo-500/10 border-indigo-500/40 shadow-sm'
                                  : 'bg-card border-border/60'
                                : 'bg-muted/40 border-dashed border-indigo-500/30 hover:border-indigo-500/60'
                            }`}
                          >
                            {/* Role Title and Assignee */}
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                              {assignedPersona ? (
                                <>
                                  <Avatar
                                    src={assignedPersona.avatar}
                                    name={assignedPersona.name}
                                    size="xs"
                                  />
                                  <div className="min-w-0">
                                    <span className="text-xs font-semibold text-foreground block truncate">
                                      {slot.role}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground block truncate">
                                      {assignedPersona.name} {isSlotAssignedToMe ? '(You)' : ''} &bull;{' '}
                                      {assignedPersona.role}
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="w-6 h-6 rounded-full border-2 border-dashed border-indigo-400/60 flex items-center justify-center shrink-0 text-indigo-400">
                                    <UserPlus className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="text-xs font-semibold text-foreground block truncate">
                                      {slot.role}
                                    </span>
                                    <span className="text-[11px] text-amber-500 font-medium block">
                                      Looking for teammate!
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>

                            {/* One-Tap Action Button: Claim Slot or Leave Slot */}
                            <div className="shrink-0">
                              {assignedPersona ? (
                                isSlotAssignedToMe && !isLead ? (
                                  <button
                                    onClick={() => handleLeaveSlot(project.id, sIdx)}
                                    className="inline-flex items-center gap-1 text-[11px] text-rose-500 hover:text-rose-400 border border-rose-500/30 px-2 py-1 rounded-lg hover:bg-rose-500/10 transition-colors"
                                  >
                                    <LogOut className="w-3 h-3" />
                                    <span>Leave</span>
                                  </button>
                                ) : (
                                  <Badge variant="secondary" size="sm" className="font-mono text-[10px]">
                                    Filled
                                  </Badge>
                                )
                              ) : (
                                <Button
                                  variant="study"
                                  size="sm"
                                  onClick={() => handleJoinSlot(project.id, sIdx, slot.role)}
                                  leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                                  className="text-xs py-1 h-7 shadow-sm"
                                >
                                  Join Slot
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </div>

                {/* Card Footer: Fast Join Summary */}
                <div className="px-5 py-3 bg-muted/30 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Created {formatRelativeTime(project.createdAt)}</span>
                  <span className="text-indigo-400 font-medium">
                    {openSlotsCount === 0 ? 'Full squad ready to hack! 🚀' : `${openSlotsCount} open spot`}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Create Team Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-indigo-500" />
            <span>Create Hackathon Team Roster</span>
          </div>
        }
        description={`Creating team with ${activePersona.name} as Team Lead. Define open role slots for roommates to join.`}
        size="lg"
      >
        <form onSubmit={handleCreateTeamSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Project Title
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. AI Health Assistant & Hospital Triage"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Hackathon / Event
              </label>
              <input
                type="text"
                required
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
                placeholder="e.g. HackMIT 2026"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Event Dates
              </label>
              <input
                type="text"
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
                placeholder="e.g. Nov 20 - 22, 2026"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Prize Pool
              </label>
              <input
                type="text"
                value={newPrizePool}
                onChange={(e) => setNewPrizePool(e.target.value)}
                placeholder="e.g. ₹2,00,000"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Project Description & Mission
            </label>
            <textarea
              rows={3}
              required
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="e.g. Building an automated triage assistant with Next.js edge runtime and speech-to-text. Looking for a Frontend Dev & UI/UX designer."
              className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Tech Stack Tags (Comma separated)
            </label>
            <input
              type="text"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              placeholder="Next.js 15, FastAPI, PyTorch, Tailwind"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Roster Slots Configuration */}
          <div className="space-y-3 pt-2 border-t border-border/80">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Team Roster Slots
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">
                  Your Lead Role (Assigned to {activePersona.name})
                </label>
                <input
                  type="text"
                  required
                  value={leadRoleName}
                  onChange={(e) => setLeadRoleName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">
                  Open Role Slot 1 (For Flatmates)
                </label>
                <input
                  type="text"
                  required
                  value={slotRole1}
                  onChange={(e) => setSlotRole1(e.target.value)}
                  placeholder="e.g. Frontend Dev & UI/UX"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">
                  Open Role Slot 2 (Optional)
                </label>
                <input
                  type="text"
                  value={slotRole2}
                  onChange={(e) => setSlotRole2(e.target.value)}
                  placeholder="e.g. Backend / API Engineer"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">
                  Open Role Slot 3 (Optional)
                </label>
                <input
                  type="text"
                  value={slotRole3}
                  onChange={(e) => setSlotRole3(e.target.value)}
                  placeholder="e.g. Pitch Deck & Presentation Lead"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="study" leftIcon={<Trophy className="w-4 h-4" />}>
              Publish Team Roster
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
