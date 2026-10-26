'use client';

import React, { useState, useEffect } from 'react';
import { useSquadStore } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { ExamItem, ExamTopic, PersonaId } from '@/types';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Circle,
  Plus,
  BookOpen,
  Award,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  TrendingUp,
  Check,
} from 'lucide-react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function calculateTimeLeft(targetDateStr: string): TimeLeft {
  const difference = new Date(targetDateStr).getTime() - Date.now();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isPast: false,
  };
}

export function ExamCountdown() {
  const {
    exams,
    personas,
    currentPersonaId,
    toggleExamTopic,
  } = useSquadStore();

  const [expandedExamId, setExpandedExamId] = useState<string | null>(exams[0]?.id || null);
  const [now, setNow] = useState<number>(Date.now());

  // Add Topic Modal State
  const [selectedExamForTopic, setSelectedExamForTopic] = useState<ExamItem | null>(null);
  const [newTopicTitle, setNewTopicTitle] = useState('');

  // Add Exam Modal State
  const [isAddExamModalOpen, setIsAddExamModalOpen] = useState(false);
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newExamDate, setNewExamDate] = useState('2026-11-25T10:00');
  const [newRoomLocation, setNewRoomLocation] = useState('Hall B - Desk 12');
  const [initialTopicList, setInitialTopicList] = useState('');

  // Live timer tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activePersona = personas[currentPersonaId] || personas.aman;

  // Handler to toggle topic completion
  const handleToggle = (examId: string, topicId: string, currentCompleted: boolean) => {
    toggleExamTopic(examId, topicId);

    // If completing the last topic, trigger confetti
    if (!currentCompleted) {
      const exam = exams.find((e) => e.id === examId);
      if (exam) {
        const remainingUncompleted = exam.topics.filter(
          (t) => t.id !== topicId && !t.completedBy[currentPersonaId]
        );
        if (remainingUncompleted.length === 0) {
          try {
            confetti({
              particleCount: 75,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#6366f1', '#10b981', '#38bdf8'],
            });
          } catch {
            // fallback
          }
        }
      }
    }
  };

  // Add topic to an exam
  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamForTopic || !newTopicTitle.trim()) return;

    const newTopic: ExamTopic = {
      id: `top-${Date.now()}`,
      title: newTopicTitle.trim(),
      completedBy: {
        aman: false,
        rhea: false,
        dev: false,
        tanvi: false,
      },
    };

    useSquadStore.setState((state) => ({
      exams: state.exams.map((exam) =>
        exam.id === selectedExamForTopic.id
          ? { ...exam, topics: [...exam.topics, newTopic] }
          : exam
      ),
    }));

    setNewTopicTitle('');
    setSelectedExamForTopic(null);
  };

  // Add new exam
  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseCode.trim() || !newCourseTitle.trim()) return;

    const topicsParsed: ExamTopic[] = initialTopicList
      .split('\n')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t, idx) => ({
        id: `top-${Date.now()}-${idx}`,
        title: t,
        completedBy: {
          aman: false,
          rhea: false,
          dev: false,
          tanvi: false,
        },
      }));

    const newExam: ExamItem = {
      id: `exam-${Date.now()}`,
      courseCode: newCourseCode.trim(),
      courseTitle: newCourseTitle.trim(),
      examDate: new Date(newExamDate).toISOString(),
      roomLocation: newRoomLocation.trim() || 'Exam Hall',
      topics: topicsParsed.length > 0 ? topicsParsed : [
        {
          id: `top-${Date.now()}-1`,
          title: 'Module 1: Core Fundamentals & Theory',
          completedBy: { aman: false, rhea: false, dev: false, tanvi: false },
        },
        {
          id: `top-${Date.now()}-2`,
          title: 'Module 2: Advanced Topics & Practice Problems',
          completedBy: { aman: false, rhea: false, dev: false, tanvi: false },
        },
      ],
    };

    useSquadStore.setState((state) => ({
      exams: [...state.exams, newExam],
    }));

    setNewCourseCode('');
    setNewCourseTitle('');
    setInitialTopicList('');
    setIsAddExamModalOpen(false);
  };

  return (
    <div id="exams" className="space-y-6">
      {/* Module Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              <Calendar className="w-5 h-5" />
            </span>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              Exam Countdown & Revision Tracker
            </h2>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Real-time visual exam timers, syllabus module checklists, and live squad completion
            progress.
          </p>
        </div>

        {/* Action Button: Add Exam */}
        <Button
          variant="study"
          size="md"
          onClick={() => setIsAddExamModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="w-full sm:w-auto shadow-indigo-500/25"
        >
          Add Exam
        </Button>
      </div>

      {/* Exams Grid */}
      <div className="space-y-6">
        {exams.map((exam) => {
          const timeLeft = calculateTimeLeft(exam.examDate);
          const isUrgent = timeLeft.days < 7;
          const isExpanded = expandedExamId === exam.id;

          // Calculate Roommate Revision Progress
          const totalTopics = exam.topics.length;
          const memberProgress: Record<PersonaId, { completed: number; percentage: number }> = {
            aman: { completed: 0, percentage: 0 },
            rhea: { completed: 0, percentage: 0 },
            dev: { completed: 0, percentage: 0 },
            tanvi: { completed: 0, percentage: 0 },
          };

          let totalCompletedAcrossAll = 0;
          const totalSlotsAcrossAll = totalTopics * 4;

          (['aman', 'rhea', 'dev', 'tanvi'] as PersonaId[]).forEach((pId) => {
            const count = exam.topics.filter((t) => t.completedBy[pId]).length;
            const pct = totalTopics > 0 ? Math.round((count / totalTopics) * 100) : 0;
            memberProgress[pId] = { completed: count, percentage: pct };
            totalCompletedAcrossAll += count;
          });

          const groupCompletionPercentage =
            totalSlotsAcrossAll > 0
              ? Math.round((totalCompletedAcrossAll / totalSlotsAcrossAll) * 100)
              : 0;

          const myProgress = memberProgress[currentPersonaId] || { completed: 0, percentage: 0 };

          return (
            <Card
              key={exam.id}
              variant="study"
              className={`overflow-hidden transition-all border ${
                isUrgent ? 'border-amber-500/30 shadow-amber-500/5' : 'border-indigo-500/20'
              }`}
            >
              {/* Exam Header Banner */}
              <div className="p-5 bg-gradient-to-r from-card via-card to-indigo-950/20 border-b border-border/80">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  {/* Exam Title & Details */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="study" size="sm" className="font-mono font-bold text-xs">
                        {exam.courseCode}
                      </Badge>
                      {isUrgent ? (
                        <Badge variant="warning" size="sm" className="gap-1 animate-pulse">
                          <AlertCircle className="w-3 h-3" />
                          Final Sprint ({timeLeft.days}d left)
                        </Badge>
                      ) : (
                        <Badge variant="secondary" size="sm" className="gap-1">
                          <Clock className="w-3 h-3" />
                          Upcoming
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-lg md:text-xl font-bold text-foreground truncate">
                      {exam.courseTitle}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                        {exam.roomLocation}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        {new Date(exam.examDate).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Visual Live Countdown Timer */}
                  <div className="shrink-0 bg-background/80 rounded-2xl border border-border p-3.5 shadow-sm">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block text-center mb-1.5">
                      Countdown to Exam
                    </span>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {/* Days */}
                      <div className="px-2.5 py-1.5 rounded-xl bg-card border border-border min-w-[52px]">
                        <span className="text-xl font-extrabold font-mono text-indigo-400 block">
                          {String(timeLeft.days).padStart(2, '0')}
                        </span>
                        <span className="text-[10px] uppercase font-medium text-muted-foreground">
                          Days
                        </span>
                      </div>
                      {/* Hours */}
                      <div className="px-2.5 py-1.5 rounded-xl bg-card border border-border min-w-[52px]">
                        <span className="text-xl font-extrabold font-mono text-foreground block">
                          {String(timeLeft.hours).padStart(2, '0')}
                        </span>
                        <span className="text-[10px] uppercase font-medium text-muted-foreground">
                          Hours
                        </span>
                      </div>
                      {/* Minutes */}
                      <div className="px-2.5 py-1.5 rounded-xl bg-card border border-border min-w-[52px]">
                        <span className="text-xl font-extrabold font-mono text-foreground block">
                          {String(timeLeft.minutes).padStart(2, '0')}
                        </span>
                        <span className="text-[10px] uppercase font-medium text-muted-foreground">
                          Mins
                        </span>
                      </div>
                      {/* Seconds */}
                      <div className="px-2.5 py-1.5 rounded-xl bg-card border border-border min-w-[52px]">
                        <span className="text-xl font-extrabold font-mono text-cyan-400 block">
                          {String(timeLeft.seconds).padStart(2, '0')}
                        </span>
                        <span className="text-[10px] uppercase font-medium text-muted-foreground">
                          Secs
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar Section: Group + Persona breakdown */}
              <CardContent className="p-5 space-y-5">
                {/* Overall Squad Progress Bar */}
                <div className="space-y-2 rounded-xl bg-muted/40 p-4 border border-border/60">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-400" />
                      <span className="font-semibold text-foreground">
                        Squad Revision Progress
                      </span>
                      <span className="text-muted-foreground text-[11px]">
                        ({totalCompletedAcrossAll}/{totalSlotsAcrossAll} module completions)
                      </span>
                    </div>
                    <span className="font-mono font-bold text-indigo-400 text-sm">
                      {groupCompletionPercentage}%
                    </span>
                  </div>

                  {/* Main Progress Bar */}
                  <div className="w-full h-3 rounded-full bg-muted overflow-hidden border border-border/80">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-500"
                      style={{ width: `${groupCompletionPercentage}%` }}
                    />
                  </div>

                  {/* Roommate Individual Breakdown Bars */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {(['aman', 'rhea', 'dev', 'tanvi'] as PersonaId[]).map((pId) => {
                      const p = personas[pId];
                      const prog = memberProgress[pId];
                      const isMe = pId === currentPersonaId;

                      return (
                        <div
                          key={pId}
                          className={`p-2.5 rounded-xl border transition-all ${
                            isMe
                              ? 'bg-indigo-500/10 border-indigo-500/40'
                              : 'bg-card border-border/60'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <div className="flex items-center gap-1.5 truncate">
                              <Avatar src={p.avatar} name={p.name} size="xs" />
                              <span className="text-xs font-semibold truncate text-foreground">
                                {p.name} {isMe ? '(You)' : ''}
                              </span>
                            </div>
                            <span className="text-[11px] font-mono font-bold text-indigo-400">
                              {prog.percentage}%
                            </span>
                          </div>

                          {/* Mini Progress Bar */}
                          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isMe ? 'bg-indigo-500' : 'bg-slate-400 dark:bg-slate-500'
                              }`}
                              style={{ width: `${prog.percentage}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground mt-1 block">
                            {prog.completed}/{totalTopics} modules
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Syllabus Checklist Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-400" />
                      <h4 className="text-sm font-bold text-foreground">
                        Syllabus Modules Checklist ({totalTopics})
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedExamForTopic(exam)}
                        className="inline-flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-400 font-medium px-2 py-1 rounded hover:bg-muted transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Module</span>
                      </button>

                      <button
                        onClick={() => setExpandedExamId(isExpanded ? null : exam.id)}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-medium px-2 py-1 rounded hover:bg-muted transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            <span>Collapse</span>
                            <ChevronUp className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            <span>Expand</span>
                            <ChevronDown className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Checklist Accordion */}
                  {isExpanded && (
                    <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                      {exam.topics.length === 0 ? (
                        <div className="p-4 text-center rounded-xl bg-card border border-dashed border-border text-xs text-muted-foreground">
                          No syllabus modules defined yet. Add the first topic!
                        </div>
                      ) : (
                        exam.topics.map((topic, idx) => {
                          const isCompletedByMe = topic.completedBy[currentPersonaId] || false;
                          const completedCount = Object.values(topic.completedBy).filter(Boolean).length;

                          return (
                            <div
                              key={topic.id}
                              onClick={() => handleToggle(exam.id, topic.id, isCompletedByMe)}
                              className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all ${
                                isCompletedByMe
                                  ? 'bg-emerald-500/5 border-emerald-500/30'
                                  : 'bg-card border-border/80 hover:border-indigo-500/40 hover:bg-muted/40'
                              }`}
                            >
                              {/* Left: Checkbox + Topic Title */}
                              <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0 pr-3">
                                <div
                                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 transition-colors ${
                                    isCompletedByMe
                                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                                      : 'border-border bg-background'
                                  }`}
                                >
                                  {isCompletedByMe ? (
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  ) : null}
                                </div>

                                <div className="min-w-0">
                                  <span
                                    className={`text-xs sm:text-sm font-medium block leading-snug ${
                                      isCompletedByMe
                                        ? 'text-muted-foreground line-through'
                                        : 'text-foreground'
                                    }`}
                                  >
                                    {topic.title}
                                  </span>
                                </div>
                              </div>

                              {/* Right: Roommate Avatars who completed this */}
                              <div className="flex items-center gap-2 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50 shrink-0 self-end sm:self-auto">
                                <span className="text-[11px] text-muted-foreground mr-1">
                                  {completedCount}/4 ready:
                                </span>
                                <div className="flex items-center -space-x-1.5">
                                  {(['aman', 'rhea', 'dev', 'tanvi'] as PersonaId[]).map((pId) => {
                                    const p = personas[pId];
                                    const done = topic.completedBy[pId];
                                    return (
                                      <div
                                        key={pId}
                                        title={`${p.name}: ${done ? 'Completed' : 'Pending'}`}
                                        className={`transition-opacity ${done ? 'opacity-100 ring-2 ring-emerald-500/60 rounded-full' : 'opacity-25 grayscale'}`}
                                      >
                                        <Avatar src={p.avatar} name={p.name} size="xs" />
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Module Modal */}
      {selectedExamForTopic && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedExamForTopic(null)}
          title={
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-500" />
              <span>Add Module to {selectedExamForTopic.courseCode}</span>
            </div>
          }
          description="Add a syllabus topic to help the flat track shared revision progress."
        >
          <form onSubmit={handleAddTopic} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Module / Topic Title
              </label>
              <input
                type="text"
                required
                autoFocus
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                placeholder="e.g. Graph Algorithms (Dijkstra, Bellman-Ford, Floyd-Warshall)"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
              <Button type="button" variant="secondary" onClick={() => setSelectedExamForTopic(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="study">
                Add to Checklist
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Exam Modal */}
      <Modal
        isOpen={isAddExamModalOpen}
        onClose={() => setIsAddExamModalOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            <span>Add Upcoming Exam</span>
          </div>
        }
        description="Set up countdown timers and syllabus checklists for university finals or midterms."
        size="lg"
      >
        <form onSubmit={handleAddExam} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Course Code
              </label>
              <input
                type="text"
                required
                value={newCourseCode}
                onChange={(e) => setNewCourseCode(e.target.value)}
                placeholder="e.g. CS204"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Exam Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={newExamDate}
                onChange={(e) => setNewExamDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Course Title
            </label>
            <input
              type="text"
              required
              value={newCourseTitle}
              onChange={(e) => setNewCourseTitle(e.target.value)}
              placeholder="e.g. Design & Analysis of Algorithms"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Room / Hall Location
            </label>
            <input
              type="text"
              value={newRoomLocation}
              onChange={(e) => setNewRoomLocation(e.target.value)}
              placeholder="e.g. Hall C - Desk 42"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Initial Syllabus Modules (One per line)
            </label>
            <textarea
              rows={4}
              value={initialTopicList}
              onChange={(e) => setInitialTopicList(e.target.value)}
              placeholder="Divide and Conquer (Merge Sort, Quick Sort)&#10;Greedy Algorithms (Huffman Coding, MST)&#10;Dynamic Programming (Knapsack, LCS)&#10;NP-Completeness (Reduction)"
              className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <Button type="button" variant="secondary" onClick={() => setIsAddExamModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="study">
              Create Exam Tracker
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
