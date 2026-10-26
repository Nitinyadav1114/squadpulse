'use client';

import React, { useState } from 'react';
import { useSquadStore } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { CodeBlock } from '@/components/study/DailyCoding';
import { DoubtItem, PersonaId } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import {
  HelpCircle,
  MessageSquare,
  ThumbsUp,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Send,
  Code,
  Tag,
  BookOpen,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const PRESET_SUBJECTS = [
  'All',
  'Data Structures',
  'Operating Systems',
  'Distributed Systems',
  'Web Dev',
  'Machine Learning',
  'Algorithms',
];

export function DoubtBoard() {
  const {
    doubts,
    personas,
    currentPersonaId,
    addDoubt,
    addDoubtAnswer,
    toggleDoubtUpvote,
    toggleAnswerUpvote,
    acceptDoubtAnswer,
  } = useSquadStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('All');
  const [expandedDoubtId, setExpandedDoubtId] = useState<string | null>(doubts[0]?.id || null);

  // Ask Doubt Modal State
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('CS304');
  const [newSubjectTag, setNewSubjectTag] = useState('Operating Systems');
  const [newUrgency, setNewUrgency] = useState<DoubtItem['urgency']>('Normal');
  const [newBody, setNewBody] = useState('');
  const [newCodeSnippet, setNewCodeSnippet] = useState('');
  const [newLanguage, setNewLanguage] = useState('C');

  // Answer Modal State
  const [replyingToDoubt, setReplyingToDoubt] = useState<DoubtItem | null>(null);
  const [answerBody, setAnswerBody] = useState('');
  const [answerCodeSnippet, setAnswerCodeSnippet] = useState('');
  const [answerLanguage, setAnswerLanguage] = useState('TypeScript');

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

  // Filter doubts by search, subject, urgency
  const filteredDoubts = doubts.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSubject =
      selectedSubject === 'All' ||
      d.tags.some((t) => t.toLowerCase().includes(selectedSubject.toLowerCase())) ||
      d.title.toLowerCase().includes(selectedSubject.toLowerCase());

    const matchesUrgency = selectedUrgency === 'All' || d.urgency === selectedUrgency;

    return matchesSearch && matchesSubject && matchesUrgency;
  });

  // Handle Ask Doubt Submit
  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) return;

    addDoubt({
      title: newTitle.trim(),
      courseCode: newCourseCode.trim() || 'CS_GEN',
      body: newBody.trim(),
      tags: [newSubjectTag, ...newTitle.split(' ').slice(0, 2).filter((w) => w.length > 3)],
      urgency: newUrgency,
      codeSnippet: newCodeSnippet.trim() ? newCodeSnippet.trim() : undefined,
      language: newCodeSnippet.trim() ? newLanguage : undefined,
      authorId: currentPersonaId,
    });

    // Reset form
    setNewTitle('');
    setNewBody('');
    setNewCodeSnippet('');
    setIsAskModalOpen(false);
  };

  // Handle Answer Submit
  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingToDoubt || !answerBody.trim()) return;

    addDoubtAnswer(
      replyingToDoubt.id,
      answerBody.trim(),
      answerCodeSnippet.trim() ? answerCodeSnippet.trim() : undefined,
      answerCodeSnippet.trim() ? answerLanguage : undefined
    );

    // Expand this doubt to see newly added answer
    setExpandedDoubtId(replyingToDoubt.id);
    setAnswerBody('');
    setAnswerCodeSnippet('');
    setReplyingToDoubt(null);
  };

  // Urgency styling helper
  const getUrgencyBadge = (urgency: DoubtItem['urgency']) => {
    switch (urgency) {
      case 'Urgent':
        return (
          <Badge variant="danger" size="sm" className="gap-1 font-semibold">
            <AlertTriangle className="w-3 h-3" />
            Urgent
          </Badge>
        );
      case 'Exam Soon':
        return (
          <Badge variant="warning" size="sm" className="gap-1 font-semibold">
            <Clock className="w-3 h-3" />
            Exam Soon
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" size="sm" className="gap-1">
            Normal
          </Badge>
        );
    }
  };

  return (
    <div id="doubts" className="space-y-6">
      {/* Module Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              <HelpCircle className="w-5 h-5" />
            </span>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Academic Doubt Board</h2>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Collaborative hostel Q&A with syntax code blocks, upvotes, and peer-reviewed solutions.
          </p>
        </div>

        {/* CTA: Ask a Doubt */}
        <Button
          variant="study"
          size="md"
          onClick={() => setIsAskModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="w-full sm:w-auto shadow-indigo-500/25"
        >
          Ask a Doubt
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search doubts by title, subject, course code, or concepts..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-card text-xs md:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Urgency Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Urgency:
            </span>
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="text-xs py-2 px-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Urgencies</option>
              <option value="Urgent">Urgent</option>
              <option value="Exam Soon">Exam Soon</option>
              <option value="Normal">Normal</option>
            </select>
          </div>
        </div>

        {/* Subject Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {PRESET_SUBJECTS.map((subject) => (
            <button
              key={subject}
              onClick={() => setSelectedSubject(subject)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedSubject === subject
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {subject}
            </button>
          ))}
        </div>
      </div>

      {/* Doubts List */}
      <div className="space-y-4">
        {filteredDoubts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card">
            <HelpCircle className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
            <h3 className="text-base font-semibold text-foreground">No questions found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              No academic doubts match your search. Have a tricky compiler bug or theory doubt? Ask
              the roommates!
            </p>
            <Button
              variant="study"
              size="sm"
              className="mt-4"
              onClick={() => setIsAskModalOpen(true)}
            >
              Ask a Doubt Now
            </Button>
          </div>
        ) : (
          filteredDoubts.map((doubt) => {
            const author = personas[doubt.authorId] || { name: 'Roommate', avatar: '' };
            const isAuthor = doubt.authorId === currentPersonaId;
            const hasUpvotedDoubt = doubt.upvotes.includes(currentPersonaId);
            const isExpanded = expandedDoubtId === doubt.id;

            return (
              <Card
                key={doubt.id}
                variant="study"
                className={`overflow-hidden transition-all ${
                  doubt.isResolved ? 'border-emerald-500/30' : 'border-indigo-500/20'
                }`}
              >
                {/* Doubt Card Header */}
                <CardHeader className="p-4 sm:p-5 pb-3 bg-muted/20">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      {/* Meta badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" size="sm" className="font-mono font-bold">
                          {doubt.courseCode}
                        </Badge>
                        {getUrgencyBadge(doubt.urgency)}
                        {doubt.isResolved ? (
                          <Badge variant="success" size="sm" className="gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Resolved
                          </Badge>
                        ) : (
                          <Badge variant="outline" size="sm">
                            Open
                          </Badge>
                        )}
                        <span className="text-[11px] text-muted-foreground">
                          Asked by {author.name} {isAuthor ? '(You)' : ''} &bull;{' '}
                          {formatRelativeTime(doubt.createdAt)}
                        </span>
                      </div>

                      {/* Question Title */}
                      <CardTitle className="text-base sm:text-lg font-bold text-foreground leading-snug">
                        {doubt.title}
                      </CardTitle>
                    </div>

                    {/* Upvote & Answers Counter */}
                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                      {/* Doubt Upvote Button */}
                      <button
                        onClick={() => toggleDoubtUpvote(doubt.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                          hasUpvotedDoubt
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-card text-foreground border-border hover:bg-muted'
                        }`}
                        title="Upvote this doubt"
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvotedDoubt ? 'fill-white' : ''}`} />
                        <span>{doubt.upvotes.length}</span>
                      </button>

                      {/* Answer count pill */}
                      <button
                        onClick={() => setExpandedDoubtId(isExpanded ? null : doubt.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{doubt.answers.length}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Tag chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2">
                    {doubt.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground"
                      >
                        <Tag className="w-2.5 h-2.5 opacity-60" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardHeader>

                {/* Question Body */}
                <CardContent className="p-4 sm:p-5 pt-3 space-y-4">
                  <div className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {doubt.body}
                  </div>

                  {/* Optional Code Snippet in Question */}
                  {doubt.codeSnippet && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                        <Code className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Code Reference ({doubt.language || 'Code'})</span>
                      </div>
                      <CodeBlock code={doubt.codeSnippet} language={doubt.language} maxLines={10} />
                    </div>
                  )}

                  {/* Question Bottom Action Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/60">
                    <button
                      onClick={() => setExpandedDoubtId(isExpanded ? null : doubt.id)}
                      className="text-xs text-indigo-500 hover:text-indigo-400 font-medium inline-flex items-center gap-1"
                    >
                      {isExpanded ? 'Hide discussion' : `View ${doubt.answers.length} answers & discussion`}
                    </button>

                    <Button
                      variant="study"
                      size="sm"
                      onClick={() => setReplyingToDoubt(doubt)}
                      leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                    >
                      Answer Doubt
                    </Button>
                  </div>

                  {/* Expanded Answers Section */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-border/80 space-y-4 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Roommate Answers ({doubt.answers.length})
                        </h4>
                        <span className="text-[11px] text-muted-foreground">
                          Replying as {activePersona.name}
                        </span>
                      </div>

                      {doubt.answers.length === 0 ? (
                        <div className="p-4 rounded-xl bg-muted/40 text-center border border-border/60">
                          <p className="text-xs text-muted-foreground">
                            No answers yet. Know the solution? Help your roommate out!
                          </p>
                          <Button
                            variant="study"
                            size="sm"
                            className="mt-2"
                            onClick={() => setReplyingToDoubt(doubt)}
                          >
                            Write First Answer
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {doubt.answers.map((answer) => {
                            const answerAuthor = personas[answer.authorId] || { name: 'Roommate', avatar: '' };
                            const isAnswerAuthor = answer.authorId === currentPersonaId;
                            const hasUpvotedAnswer = answer.upvotes.includes(currentPersonaId);

                            return (
                              <div
                                key={answer.id}
                                className={`p-4 rounded-xl border transition-all ${
                                  answer.isAccepted
                                    ? 'bg-emerald-500/5 border-emerald-500/40 shadow-sm'
                                    : 'bg-card border-border/70'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-2.5">
                                    <Avatar
                                      src={answerAuthor.avatar}
                                      name={answerAuthor.name}
                                      size="sm"
                                    />
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-semibold text-foreground">
                                          {answerAuthor.name}
                                        </span>
                                        {isAnswerAuthor && (
                                          <span className="text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1 rounded">
                                            You
                                          </span>
                                        )}
                                        <span className="text-[11px] text-muted-foreground">
                                          ({answerAuthor.role})
                                        </span>
                                      </div>
                                      <span className="text-[11px] text-muted-foreground">
                                        {formatRelativeTime(answer.createdAt)}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {answer.isAccepted && (
                                      <Badge variant="success" size="sm" className="gap-1 font-semibold">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Accepted Solution
                                      </Badge>
                                    )}

                                    {/* Author can mark as accepted */}
                                    {isAuthor && !answer.isAccepted && (
                                      <button
                                        onClick={() => acceptDoubtAnswer(doubt.id, answer.id)}
                                        className="text-[11px] font-medium text-emerald-500 hover:text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-lg hover:bg-emerald-500/10 transition-colors"
                                      >
                                        Accept Solution
                                      </button>
                                    )}

                                    {/* Answer Upvote Button */}
                                    <button
                                      onClick={() => toggleAnswerUpvote(doubt.id, answer.id)}
                                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
                                        hasUpvotedAnswer
                                          ? 'bg-indigo-600 text-white border-indigo-600'
                                          : 'bg-muted/60 text-muted-foreground border-border hover:text-foreground'
                                      }`}
                                    >
                                      <ThumbsUp className="w-3 h-3" />
                                      <span>{answer.upvotes.length}</span>
                                    </button>
                                  </div>
                                </div>

                                {/* Answer Text */}
                                <div className="mt-2.5 text-xs sm:text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                  {answer.body}
                                </div>

                                {/* Code Snippet if present */}
                                {answer.codeSnippet && (
                                  <div className="mt-3">
                                    <CodeBlock
                                      code={answer.codeSnippet}
                                      language={answer.language}
                                      maxLines={10}
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Ask a Doubt Modal */}
      <Modal
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-500" />
            <span>Post an Academic Doubt</span>
          </div>
        }
        description={`Posting as ${activePersona.name}. Tag the subject and paste code snippets to help roommates answer quickly.`}
        size="lg"
      >
        <form onSubmit={handleAskSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Question Title
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. How does Reader-Writer lock prevent writer starvation?"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Course Code
              </label>
              <input
                type="text"
                required
                value={newCourseCode}
                onChange={(e) => setNewCourseCode(e.target.value)}
                placeholder="e.g. CS304"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Subject Domain
              </label>
              <select
                value={newSubjectTag}
                onChange={(e) => setNewSubjectTag(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Operating Systems">Operating Systems</option>
                <option value="Data Structures">Data Structures</option>
                <option value="Distributed Systems">Distributed Systems</option>
                <option value="Web Dev">Web Dev</option>
                <option value="Machine Learning">Machine Learning</option>
                <option value="Algorithms">Algorithms</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Urgency
              </label>
              <select
                value={newUrgency}
                onChange={(e) => setNewUrgency(e.target.value as DoubtItem['urgency'])}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Normal">Normal</option>
                <option value="Exam Soon">Exam Soon</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Detailed Description & Problem Context
            </label>
            <textarea
              required
              rows={4}
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              placeholder="Explain where you got stuck, relevant lab context, or textbook section..."
              className="w-full rounded-xl border border-border bg-background p-3.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Code Snippet (Optional)
              </label>
              <select
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                className="text-[11px] py-1 px-2 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="C">C / C++</option>
                <option value="Python">Python</option>
                <option value="TypeScript">TypeScript / JS</option>
                <option value="Java">Java</option>
                <option value="Rust">Rust</option>
              </select>
            </div>
            <textarea
              rows={4}
              spellCheck={false}
              value={newCodeSnippet}
              onChange={(e) => setNewCodeSnippet(e.target.value)}
              placeholder="// Paste buggy code, semaphore snippet, or compiler trace here..."
              className="w-full rounded-xl border border-border bg-slate-950 text-slate-100 p-3.5 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <Button type="button" variant="secondary" onClick={() => setIsAskModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="study" leftIcon={<Send className="w-4 h-4" />}>
              Post Doubt
            </Button>
          </div>
        </form>
      </Modal>

      {/* Answer Modal */}
      {replyingToDoubt && (
        <Modal
          isOpen={true}
          onClose={() => setReplyingToDoubt(null)}
          title={
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-500" />
              <span>Answer: {replyingToDoubt.title}</span>
            </div>
          }
          description={`Answering as ${activePersona.name} (${activePersona.role}). Share your technical explanation and code solution.`}
          size="lg"
        >
          <form onSubmit={handleAnswerSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Your Explanation
              </label>
              <textarea
                required
                rows={5}
                value={answerBody}
                onChange={(e) => setAnswerBody(e.target.value)}
                placeholder="Walk through your reasoning, algorithmic step, or fix..."
                className="w-full rounded-xl border border-border bg-background p-3.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Code Snippet (Optional)
                </label>
                <select
                  value={answerLanguage}
                  onChange={(e) => setAnswerLanguage(e.target.value)}
                  className="text-[11px] py-1 px-2 rounded-lg border border-border bg-background text-foreground"
                >
                  <option value="TypeScript">TypeScript</option>
                  <option value="Python">Python</option>
                  <option value="C">C / C++</option>
                  <option value="Java">Java</option>
                  <option value="Rust">Rust</option>
                </select>
              </div>
              <textarea
                rows={5}
                spellCheck={false}
                value={answerCodeSnippet}
                onChange={(e) => setAnswerCodeSnippet(e.target.value)}
                placeholder="// Working code snippet, idiom, or fix..."
                className="w-full rounded-xl border border-border bg-slate-950 text-slate-100 p-3.5 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
              <Button type="button" variant="secondary" onClick={() => setReplyingToDoubt(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="study" leftIcon={<Send className="w-4 h-4" />}>
                Submit Answer
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
