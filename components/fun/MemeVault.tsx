'use client';

import React, { useState, useMemo } from 'react';
import { useSquadStore } from '@/lib/store';
import { MemeItem, MemeType, PersonaId } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import {
  Laugh,
  Plus,
  Search,
  Quote,
  Flame,
  BookOpen,
  Image as ImageIcon,
  Heart,
  Tag,
  Users,
  Sparkles,
  Filter,
  Check,
  Calendar,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function MemeVault() {
  const { memes, currentPersonaId, personas, addMeme, toggleMemeReaction } = useSquadStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [selectedCreditedMember, setSelectedCreditedMember] = useState<PersonaId | 'All'>('All');
  const [selectedType, setSelectedType] = useState<MemeType | 'All'>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<MemeType>('HostelChronicle');
  const [newContent, setNewContent] = useState('');
  const [newContext, setNewContext] = useState('');
  const [newCreditedPersona, setNewCreditedPersona] = useState<PersonaId>(() => Object.keys(personas)[0] || '');
  const [newTagsString, setNewTagsString] = useState('');

  // Extract all unique tags dynamically
  const allTags = useMemo(() => {
    const set = new Set<string>();
    memes.forEach((m) => {
      m.tags.forEach((t) => set.add(t));
    });
    // Add popular defaults if not present
    ['HostelLife', 'ExamSeason', 'MessFood', 'GamingNight'].forEach((t) => set.add(t));
    return ['All', ...Array.from(set)];
  }, [memes]);

  // Filtered Memes
  const filteredMemes = useMemo(() => {
    return memes.filter((meme) => {
      // Type Filter
      if (selectedType !== 'All' && meme.type !== selectedType) return false;

      // Tag Filter
      if (selectedTag !== 'All' && !meme.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase())) {
        return false;
      }

      // Credited Member Filter
      if (selectedCreditedMember !== 'All' && meme.creditedPersonaId !== selectedCreditedMember) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = meme.title.toLowerCase().includes(q);
        const matchesContent = meme.contentUrlOrText.toLowerCase().includes(q);
        const matchesContext = meme.context.toLowerCase().includes(q);
        const matchesTags = meme.tags.some((t) => t.toLowerCase().includes(q));
        const author = personas[meme.authorId]?.name.toLowerCase() || '';
        const credited = personas[meme.creditedPersonaId]?.name.toLowerCase() || '';
        return (
          matchesTitle ||
          matchesContent ||
          matchesContext ||
          matchesTags ||
          author.includes(q) ||
          credited.includes(q)
        );
      }

      return true;
    });
  }, [memes, selectedType, selectedTag, selectedCreditedMember, searchQuery, personas]);

  // Handle Add Meme
  const handleAddMeme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const tagsArray = newTagsString
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    addMeme({
      title: newTitle.trim(),
      type: newType,
      contentUrlOrText: newContent.trim(),
      context: newContext.trim() || 'Flat 402 Chronicles',
      authorId: currentPersonaId,
      creditedPersonaId: newCreditedPersona,
      tags: tagsArray.length > 0 ? tagsArray : ['HostelLife'],
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#F43F5E', '#EC4899', '#F59E0B'],
    });

    // Reset Form
    setNewTitle('');
    setNewContent('');
    setNewContext('');
    setNewTagsString('');
    setIsAddModalOpen(false);
  };

  const getTypeBadge = (type: MemeType) => {
    switch (type) {
      case 'LegendaryQuote':
        return (
          <Badge variant="outline" size="sm" className="bg-amber-500/10 text-amber-500 border-amber-500/30 gap-1 text-[10px]">
            <Quote className="w-3 h-3" />
            Legendary Quote
          </Badge>
        );
      case 'HostelChronicle':
        return (
          <Badge variant="fun" size="sm" className="gap-1 text-[10px]">
            <BookOpen className="w-3 h-3" />
            Hostel Chronicle
          </Badge>
        );
      case 'MemeImage':
        return (
          <Badge variant="outline" size="sm" className="bg-purple-500/10 text-purple-400 border-purple-500/30 gap-1 text-[10px]">
            <ImageIcon className="w-3 h-3" />
            Meme Image
          </Badge>
        );
    }
  };

  return (
    <div id="memes" className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-pink-500/10 via-rose-500/5 to-transparent p-5 rounded-2xl border border-pink-500/20 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-pink-500/20 text-pink-500">
              <Laugh className="w-5 h-5" />
            </span>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Meme & Inside-Joke Vault</h2>
            <Badge variant="fun" size="sm">Flat 402 Hall of Fame</Badge>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground">
            Searchable vault of legendary late-night moments, unhinged Swiggy quotes, and hostel folklore.
          </p>
        </div>

        <Button
          variant="fun"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
          className="shrink-0"
        >
          Add Meme / Quote
        </Button>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-3 bg-card/60 border border-border p-4 rounded-xl shadow-sm">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memes, inside jokes, quote text, or who said it..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filters Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
          {/* Type Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {(['All', 'HostelChronicle', 'LegendaryQuote', 'MemeImage'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  selectedType === type
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                }`}
              >
                {type === 'All'
                  ? 'All Formats'
                  : type === 'HostelChronicle'
                  ? '📖 Chronicles'
                  : type === 'LegendaryQuote'
                  ? '💬 Quotes'
                  : '🖼️ Memes'}
              </button>
            ))}
          </div>

          {/* Roommate Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Starring:</span>
            <select
              value={selectedCreditedMember}
              onChange={(e) => setSelectedCreditedMember(e.target.value as PersonaId | 'All')}
              className="text-xs px-2.5 py-1 rounded-lg border border-border bg-background"
            >
              <option value="All">All Roommates</option>
              {Object.values(personas).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tag Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 scrollbar-none">
          <span className="text-[11px] text-muted-foreground uppercase font-bold shrink-0 flex items-center gap-1 mr-1">
            <Tag className="w-3 h-3" />
            Tags:
          </span>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap ${
                selectedTag === tag
                  ? 'bg-rose-500/20 text-rose-500 border border-rose-500/40 font-bold'
                  : 'bg-muted/70 hover:bg-muted text-muted-foreground border border-transparent'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Memes Card Gallery */}
      {filteredMemes.length === 0 ? (
        <Card className="text-center p-8 border-dashed">
          <Laugh className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
          <h3 className="font-semibold text-base mb-1">No memes match your search</h3>
          <p className="text-xs text-muted-foreground mb-4">Try clearing your filters or add a new inside joke!</p>
          <Button variant="fun" size="sm" onClick={() => setIsAddModalOpen(true)}>
            Record an Inside Joke
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMemes.map((meme) => {
            const author = personas[meme.authorId] || { name: meme.authorId };
            const credited = personas[meme.creditedPersonaId] || { name: meme.creditedPersonaId };
            const hasReacted = meme.laughReactionIds.includes(currentPersonaId);
            const isImage =
              meme.type === 'MemeImage' ||
              meme.contentUrlOrText.startsWith('http://') ||
              meme.contentUrlOrText.startsWith('https://');

            return (
              <Card
                key={meme.id}
                className="flex flex-col justify-between border-rose-500/20 hover:border-rose-500/40 transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md"
              >
                <div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      {getTypeBadge(meme.type)}
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(meme.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <CardTitle className="text-base font-bold leading-snug pt-1 text-foreground">
                      {meme.title}
                    </CardTitle>

                    <CardDescription className="text-xs text-muted-foreground italic">
                      📍 {meme.context}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0">
                    {/* Content Display: Quote or Chronicle or Image */}
                    {isImage ? (
                      <div className="rounded-xl overflow-hidden border border-border/80 bg-muted/30 max-h-56 flex items-center justify-center">
                        <img
                          src={meme.contentUrlOrText}
                          alt={meme.title}
                          className="w-full h-auto object-cover max-h-56"
                          onError={(e) => {
                            // Fallback if image link fails
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    ) : meme.type === 'LegendaryQuote' ? (
                      <div className="relative p-3.5 rounded-xl bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-transparent border border-amber-500/20 font-serif italic text-sm text-foreground/90 leading-relaxed">
                        <Quote className="w-4 h-4 text-amber-500/40 absolute top-2 right-2" />
                        &ldquo;{meme.contentUrlOrText}&rdquo;
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 text-xs text-foreground/90 leading-relaxed">
                        {meme.contentUrlOrText}
                      </div>
                    )}

                    {/* Tag Pills */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {meme.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </div>

                {/* Card Footer: Credited member & Laugh Reaction Heart */}
                <div className="p-4 pt-2 border-t border-border/40 flex items-center justify-between text-xs bg-muted/15">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar name={credited.name} size="xs" />
                    <div className="truncate">
                      <span className="text-[10px] text-muted-foreground block leading-tight">Starring</span>
                      <span className="text-xs font-semibold text-foreground truncate block">
                        {credited.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Avatars of Roommates who laughed */}
                    {meme.laughReactionIds.length > 0 && (
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {meme.laughReactionIds.map((id) => (
                          <Avatar
                            key={id}
                            name={personas[id]?.name || id}
                            size="xs"
                            className="ring-1 ring-background"
                          />
                        ))}
                      </div>
                    )}

                    {/* Interactive Heart / Laugh Button */}
                    <button
                      type="button"
                      onClick={() => toggleMemeReaction(meme.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-95 ${
                        hasReacted
                          ? 'bg-rose-500 text-white shadow-sm'
                          : 'bg-muted hover:bg-rose-500/10 hover:text-rose-500 text-muted-foreground'
                      }`}
                      title={hasReacted ? 'You reacted to this' : 'React with laugh/heart'}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 transition-transform ${
                          hasReacted ? 'fill-white scale-110' : ''
                        }`}
                      />
                      <span className="tabular-nums font-bold">{meme.laughReactionIds.length}</span>
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal: Add Meme / Quote */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Meme, Inside Joke or Quote"
        description="Preserve iconic flat moments in the Squad Hall of Fame."
        size="md"
      >
        <form onSubmit={handleAddMeme} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Format Type</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setNewType('HostelChronicle')}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-colors ${
                  newType === 'HostelChronicle'
                    ? 'border-rose-500 bg-rose-500/10 text-rose-500'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted'
                }`}
              >
                📖 Chronicle
              </button>
              <button
                type="button"
                onClick={() => setNewType('LegendaryQuote')}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-colors ${
                  newType === 'LegendaryQuote'
                    ? 'border-rose-500 bg-rose-500/10 text-rose-500'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted'
                }`}
              >
                💬 Quote
              </button>
              <button
                type="button"
                onClick={() => setNewType('MemeImage')}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-colors ${
                  newType === 'MemeImage'
                    ? 'border-rose-500 bg-rose-500/10 text-rose-500'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted'
                }`}
              >
                🖼️ Image URL
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Title</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. When someone ordered ₹1200 of Biryani during finals"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold">
              {newType === 'MemeImage' ? 'Image URL' : newType === 'LegendaryQuote' ? 'Exact Quote' : 'Story / Description'}
            </label>
            {newType === 'MemeImage' ? (
              <input
                type="url"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
            ) : (
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={3}
                placeholder={
                  newType === 'LegendaryQuote'
                    ? '"Guys we will definitely study from 7 PM today..."'
                    : 'Explain what happened, why the flat couldn’t stop laughing...'
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                required
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold block mb-1">Context / Location</label>
              <input
                type="text"
                value={newContext}
                onChange={(e) => setNewContext(e.target.value)}
                placeholder="e.g. Room D at 3 AM"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1">Starring Roommate</label>
              <select
                value={newCreditedPersona}
                onChange={(e) => setNewCreditedPersona(e.target.value as PersonaId)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {Object.values(personas).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Tags (comma separated)</label>
            <input
              type="text"
              value={newTagsString}
              onChange={(e) => setNewTagsString(e.target.value)}
              placeholder="HostelLife, ExamSeason, Valorant, Swiggy"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="fun" size="md">
              Publish to Vault
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
