'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSquadStore } from '@/lib/store';
import { WatchPlayItem, MediaType, MediaPlatform, MediaStatus } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import {
  Disc,
  Play,
  Plus,
  Tv,
  Gamepad2,
  Film,
  Sparkles,
  Trophy,
  RotateCw,
  ExternalLink,
  Users,
  CheckCircle,
  Clock,
  Heart,
  Layers,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const WHEEL_COLORS = [
  '#F43F5E', // Rose 500
  '#8B5CF6', // Violet 500
  '#EC4899', // Pink 500
  '#06B6D4', // Cyan 500
  '#F59E0B', // Amber 500
  '#10B981', // Emerald 500
  '#6366F1', // Indigo 500
  '#D946EF', // Fuchsia 500
];

export function WatchPlayWheel() {
  const {
    watchPlayList,
    currentPersonaId,
    personas,
    addWatchPlayItem,
    toggleWatchPlayInterest,
    updateWatchPlayStatus,
  } = useSquadStore();

  const [activeTab, setActiveTab] = useState<'wheel' | 'backlog'>('wheel');
  const [filterType, setFilterType] = useState<MediaType | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<MediaStatus | 'All'>('All');

  // Selected items to include in wheel (defaults to all Backlog & Active items)
  const defaultEligibleItems = watchPlayList.filter((item) => item.status !== 'Completed');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>(
    defaultEligibleItems.map((item) => item.id)
  );

  // Wheel State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [winningItem, setWinningItem] = useState<WatchPlayItem | null>(null);
  const [tickerActive, setTickerActive] = useState(false);
  const [winnerModalOpen, setWinnerModalOpen] = useState(false);

  // Add Item Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<MediaType>('Movie');
  const [newPlatform, setNewPlatform] = useState<MediaPlatform>('Netflix');
  const [newGenreOrDuration, setNewGenreOrDuration] = useState('');

  // Keep selected IDs updated when backlog changes
  useEffect(() => {
    if (selectedItemIds.length === 0 && defaultEligibleItems.length > 0) {
      setSelectedItemIds(defaultEligibleItems.map((i) => i.id));
    }
  }, [watchPlayList]);

  // Items currently on the wheel
  const wheelItems = watchPlayList.filter((item) => selectedItemIds.includes(item.id));

  // Toggle item inclusion on wheel
  const toggleItemSelection = (id: string) => {
    if (isSpinning) return;
    if (selectedItemIds.includes(id)) {
      if (selectedItemIds.length > 2) {
        setSelectedItemIds(selectedItemIds.filter((itemId) => itemId !== id));
      }
    } else {
      setSelectedItemIds([...selectedItemIds, id]);
    }
  };

  // Draw the Canvas Wheel
  const drawWheel = useCallback(
    (angle: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(centerX, centerY) - 16;

      const items = wheelItems.length >= 2 ? wheelItems : defaultEligibleItems;
      const totalSlices = items.length;

      if (totalSlices === 0) {
        // Draw empty wheel placeholder
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#27272a';
        ctx.fill();
        ctx.strokeStyle = '#3f3f46';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = '#a1a1aa';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Add backlog items to spin', centerX, centerY);
        return;
      }

      const sliceAngle = (2 * Math.PI) / totalSlices;

      // Draw outer shadow glow ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 4, 0, 2 * Math.PI);
      ctx.strokeStyle = '#F43F5E33';
      ctx.lineWidth = 8;
      ctx.stroke();
      ctx.restore();

      // Draw Slices
      items.forEach((item, index) => {
        const start = angle + index * sliceAngle;
        const end = start + sliceAngle;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, start, end);
        ctx.closePath();

        // Fill wedge
        const color = WHEEL_COLORS[index % WHEEL_COLORS.length];
        ctx.fillStyle = color;
        ctx.fill();

        // Subtle slice border
        ctx.strokeStyle = '#18181b';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Text label rotated
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(start + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.font = totalSlices > 8 ? 'bold 11px sans-serif' : 'bold 12px sans-serif';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 4;

        // Truncate long titles
        const maxLen = totalSlices > 8 ? 12 : 16;
        const label = item.title.length > maxLen ? item.title.substring(0, maxLen) + '…' : item.title;
        ctx.fillText(label, radius - 20, 0);

        ctx.restore();
        ctx.restore();
      });

      // Outer rim
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = '#ffffff25';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Center Hub
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, 28, 0, 2 * Math.PI);
      ctx.fillStyle = '#18181b';
      ctx.fill();
      ctx.strokeStyle = '#F43F5E';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Center Star / Dot
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
      ctx.fillStyle = '#F43F5E';
      ctx.fill();
      ctx.restore();
    },
    [wheelItems, defaultEligibleItems]
  );

  // Redraw whenever angle or wheel items change
  useEffect(() => {
    drawWheel(currentAngle);
  }, [currentAngle, drawWheel]);

  // Spin with Physics-Based Rotational Deceleration
  const handleSpin = () => {
    if (isSpinning) return;
    const items = wheelItems.length >= 2 ? wheelItems : defaultEligibleItems;
    if (items.length < 2) return;

    setIsSpinning(true);
    setWinningItem(null);

    // Initial velocity between 0.35 and 0.55 radians per frame
    let velocity = 0.38 + Math.random() * 0.18;
    // Friction factor (closer to 1 = longer spin)
    const friction = 0.985 + Math.random() * 0.005;
    let angle = currentAngle;
    const totalSlices = items.length;
    const sliceAngle = (2 * Math.PI) / totalSlices;
    let lastSliceIndex = -1;

    const animate = () => {
      angle += velocity;
      velocity *= friction;

      // Track tick indicator wobble when crossing wedge boundaries
      // The top pointer needle is at 12 o'clock (-PI / 2)
      const normalizedAngle = ((-Math.PI / 2 - angle) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      const currentSliceIdx = Math.floor(normalizedAngle / sliceAngle);
      if (currentSliceIdx !== lastSliceIndex) {
        lastSliceIndex = currentSliceIdx;
        setTickerActive(true);
        setTimeout(() => setTickerActive(false), 60);
      }

      setCurrentAngle(angle);

      if (velocity > 0.002) {
        requestAnimationFrame(animate);
      } else {
        // Stop spinning & determine winner!
        setIsSpinning(false);
        const winningIdx = currentSliceIdx % items.length;
        const winner = items[winningIdx];
        setWinningItem(winner);
        setWinnerModalOpen(true);

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F43F5E', '#8B5CF6', '#F59E0B', '#10B981', '#EC4899'],
        });
      }
    };

    requestAnimationFrame(animate);
  };

  // Add Item to Backlog
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addWatchPlayItem({
      title: newTitle.trim(),
      type: newType,
      platform: newPlatform,
      genreOrDuration: newGenreOrDuration.trim() || 'General',
      addedById: currentPersonaId,
      status: 'Backlog',
    });

    setNewTitle('');
    setNewGenreOrDuration('');
    setIsAddModalOpen(false);

    confetti({
      particleCount: 45,
      spread: 45,
      origin: { y: 0.7 },
      colors: ['#F43F5E', '#A855F7'],
    });
  };

  // Platform Badge Helper
  const getPlatformBadge = (platform: MediaPlatform) => {
    switch (platform) {
      case 'Netflix':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white">Netflix</span>;
      case 'Prime':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500 text-white">Prime</span>;
      case 'Steam':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-blue-300 border border-blue-500/30">Steam</span>;
      case 'PS5':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-900 text-white">PS5</span>;
      case 'Discord':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white">Discord</span>;
      case 'YouTube':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white">YouTube</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-600 text-white">Board Game</span>;
    }
  };

  // Type Icon Helper
  const getTypeIcon = (type: MediaType) => {
    switch (type) {
      case 'Movie':
      case 'Anime':
        return <Film className="w-3.5 h-3.5 text-rose-400" />;
      case 'TV Series':
        return <Tv className="w-3.5 h-3.5 text-purple-400" />;
      case 'Multiplayer Game':
      case 'Board Game':
        return <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Film className="w-3.5 h-3.5 text-rose-400" />;
    }
  };

  // Filter Backlog
  const filteredBacklog = watchPlayList.filter((item) => {
    if (filterType !== 'All' && item.type !== filterType) return false;
    if (filterStatus !== 'All' && item.status !== filterStatus) return false;
    return true;
  });

  return (
    <div id="wheel" className="space-y-6">
      {/* Section Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-fuchsia-500/10 via-rose-500/5 to-transparent p-5 rounded-2xl border border-fuchsia-500/20 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-fuchsia-500/20 text-fuchsia-500">
              <Disc className="w-5 h-5" />
            </span>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Watch & Play Together</h2>
            <Badge variant="fun" size="sm">Decision Wheel</Badge>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground">
            Group watchlist of movies, series, and multiplayer games. Can&apos;t agree? Spin the wheel to pick!
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Item
          </Button>
          <Button
            variant="fun"
            size="md"
            leftIcon={<Play className="w-4 h-4" />}
            onClick={handleSpin}
            disabled={isSpinning || wheelItems.length < 2}
          >
            {isSpinning ? 'Spinning...' : 'Spin Wheel'}
          </Button>
        </div>
      </div>

      {/* Main Container: 2-column on desktop (Wheel on left, Backlog on right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Spin the Wheel (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-rose-500/20 overflow-hidden relative shadow-md">
            <CardHeader className="pb-2 text-center">
              <CardTitle className="text-base font-bold flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-500" />
                Hostel Fate Wheel
              </CardTitle>
              <CardDescription className="text-xs">
                {wheelItems.length} options loaded on the wheel. Spin to decide tonight&apos;s watch!
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col items-center justify-center pt-2 pb-6">
              {/* Wheel Container with Pointer */}
              <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] flex items-center justify-center select-none">
                {/* Top Pointer Ticker */}
                <div
                  className={`absolute -top-1 left-1/2 -translate-x-1/2 z-20 transition-transform duration-75 origin-top ${
                    tickerActive ? '-rotate-12 scale-110' : 'rotate-0'
                  }`}
                >
                  <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[22px] border-t-rose-500 drop-shadow-md" />
                </div>

                {/* HTML5 Canvas Wheel */}
                <canvas
                  ref={canvasRef}
                  className="w-full h-full cursor-pointer transition-shadow rounded-full"
                  onClick={handleSpin}
                />
              </div>

              {/* Spin Control Button */}
              <div className="mt-5 w-full flex flex-col items-center gap-2">
                <Button
                  variant="fun"
                  size="lg"
                  className="w-full max-w-xs shadow-lg shadow-rose-500/25 text-sm font-bold"
                  onClick={handleSpin}
                  disabled={isSpinning || wheelItems.length < 2}
                  leftIcon={<RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />}
                >
                  {isSpinning ? 'Wheel is Decelerating...' : 'SPIN THE WHEEL!'}
                </Button>

                {wheelItems.length < 2 && (
                  <p className="text-[11px] text-amber-500 font-medium">
                    Select at least 2 backlog items below to spin.
                  </p>
                )}
              </div>

              {/* Latest Winner Spotlight */}
              {winningItem && (
                <div className="mt-4 w-full p-3.5 bg-gradient-to-r from-rose-500/15 via-fuchsia-500/15 to-rose-500/15 border border-rose-500/30 rounded-xl text-center space-y-1 animate-in zoom-in-95">
                  <div className="flex items-center justify-center gap-1.5 text-rose-500 text-xs font-bold uppercase tracking-wider">
                    <Trophy className="w-4 h-4" />
                    Latest Winner Selected!
                  </div>
                  <p className="font-extrabold text-base text-foreground">{winningItem.title}</p>
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-0.5">
                    {getPlatformBadge(winningItem.platform)}
                    <span>•</span>
                    <span>{winningItem.genreOrDuration}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Wheel Checklist: select what's on the wheel */}
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Options on Wheel ({wheelItems.length})
                </CardTitle>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedItemIds(
                      selectedItemIds.length === defaultEligibleItems.length
                        ? defaultEligibleItems.slice(0, 2).map((i) => i.id)
                        : defaultEligibleItems.map((i) => i.id)
                    )
                  }
                  className="text-[11px] text-rose-500 hover:text-rose-600 font-medium"
                >
                  {selectedItemIds.length === defaultEligibleItems.length ? 'Pick Few' : 'Select All'}
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin">
              {defaultEligibleItems.map((item, idx) => {
                const isSelected = selectedItemIds.includes(item.id);
                const color = WHEEL_COLORS[idx % WHEEL_COLORS.length];
                return (
                  <label
                    key={item.id}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer border transition-colors ${
                      isSelected ? 'bg-muted/60 border-border' : 'opacity-60 border-transparent hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="truncate font-medium">{item.title}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={isSpinning || (isSelected && selectedItemIds.length <= 2)}
                      onChange={() => toggleItemSelection(item.id)}
                      className="rounded accent-rose-500 cursor-pointer"
                    />
                  </label>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Shared Backlog & Activity (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Layers className="w-4 h-4 text-rose-500" />
                    Squad Watch & Play Backlog
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {watchPlayList.length} shared titles queued up by roommates.
                  </CardDescription>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as MediaType | 'All')}
                    className="text-xs px-2.5 py-1 rounded-lg border border-border bg-background"
                  >
                    <option value="All">All Formats</option>
                    <option value="Movie">Movies</option>
                    <option value="TV Series">TV Series</option>
                    <option value="Anime">Anime</option>
                    <option value="Multiplayer Game">Games</option>
                    <option value="Board Game">Board Games</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as MediaStatus | 'All')}
                    className="text-xs px-2.5 py-1 rounded-lg border border-border bg-background"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Backlog">Want to Watch</option>
                    <option value="Currently Active">Currently Active</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-0">
              {filteredBacklog.length === 0 ? (
                <div className="text-center p-6 border border-dashed rounded-xl">
                  <Film className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-muted-foreground">No media matches this filter.</p>
                </div>
              ) : (
                filteredBacklog.map((item) => {
                  const addedBy = personas[item.addedById] || { name: item.addedById };
                  const isInterested = item.interestedPersonaIds.includes(currentPersonaId);

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-border bg-card/60 hover:bg-muted/30 transition-all space-y-2.5"
                    >
                      {/* Top Row: Title, Platform, Type */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-foreground">{item.title}</span>
                            {getPlatformBadge(item.platform)}
                            <Badge variant="outline" size="sm" className="text-[10px] gap-1">
                              {getTypeIcon(item.type)}
                              {item.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{item.genreOrDuration}</p>
                        </div>

                        {/* Status Dropdown */}
                        <select
                          value={item.status}
                          onChange={(e) => updateWatchPlayStatus(item.id, e.target.value as MediaStatus)}
                          className={`text-xs px-2 py-1 rounded-lg font-medium border transition-colors ${
                            item.status === 'Currently Active'
                              ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 font-semibold'
                              : item.status === 'Completed'
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                              : 'bg-muted text-muted-foreground border-border'
                          }`}
                        >
                          <option value="Backlog">Want to Watch</option>
                          <option value="Currently Active">Currently Active 🔥</option>
                          <option value="Completed">Completed ✓</option>
                        </select>
                      </div>

                      {/* Bottom Row: Roommates interested & "+1 I'm in!" button */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-muted-foreground">Added by {addedBy.name} •</span>
                          <div className="flex items-center gap-1">
                            <div className="flex -space-x-1.5 overflow-hidden">
                              {item.interestedPersonaIds.map((pId) => {
                                const p = personas[pId];
                                return (
                                  <Avatar
                                    key={pId}
                                    name={p?.name || pId}
                                    size="xs"
                                    className="ring-1 ring-background"
                                  />
                                );
                              })}
                            </div>
                            <span className="text-[10px] text-muted-foreground ml-1">
                              {item.interestedPersonaIds.length} down to watch
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleWatchPlayInterest(item.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                            isInterested
                              ? 'bg-rose-500 text-white shadow-sm'
                              : 'bg-muted hover:bg-rose-500/10 hover:text-rose-500 text-muted-foreground'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isInterested ? 'fill-current' : ''}`} />
                          <span>{isInterested ? "I'm in!" : '+1 Watch'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal: Add to Backlog */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add to Watch & Play Backlog"
        description="Recommend a movie, anime, or game for the flat."
        size="md"
      >
        <form onSubmit={handleAddItem} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Title</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Severance, Dune: Part Two, Left 4 Dead 2"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold block mb-1">Format Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as MediaType)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="Movie">Movie</option>
                <option value="TV Series">TV Series</option>
                <option value="Anime">Anime</option>
                <option value="Multiplayer Game">Multiplayer Game</option>
                <option value="Board Game">Board Game</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1">Streaming Platform</label>
              <select
                value={newPlatform}
                onChange={(e) => setNewPlatform(e.target.value as MediaPlatform)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="Netflix">Netflix</option>
                <option value="Prime">Amazon Prime</option>
                <option value="Steam">Steam</option>
                <option value="PS5">PlayStation 5</option>
                <option value="Discord">Discord / PC LAN</option>
                <option value="YouTube">YouTube</option>
                <option value="Board Game">Board Game</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Genre / Duration / Player Count</label>
            <input
              type="text"
              value={newGenreOrDuration}
              onChange={(e) => setNewGenreOrDuration(e.target.value)}
              placeholder="e.g. Sci-Fi Thriller / 9 Episodes / 4-Player Co-op"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
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
              Add to Backlog
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Wheel Winner Celebration */}
      <Modal
        isOpen={winnerModalOpen && winningItem !== null}
        onClose={() => setWinnerModalOpen(false)}
        title="🎉 The Wheel Has Spoken!"
        size="sm"
      >
        {winningItem && (
          <div className="space-y-4 text-center py-2">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
              <Trophy className="w-8 h-8 animate-bounce" />
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Tonight&apos;s Chosen Pick</p>
              <h3 className="text-xl font-black text-foreground">{winningItem.title}</h3>
              <div className="flex items-center justify-center gap-2 pt-1">
                {getPlatformBadge(winningItem.platform)}
                <Badge variant="outline" size="sm">
                  {winningItem.type}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground pt-1">{winningItem.genreOrDuration}</p>
            </div>

            <div className="p-3 bg-muted/50 rounded-xl text-xs text-muted-foreground">
              Get the popcorn ready and alert the roommates!
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="fun"
                size="md"
                onClick={() => {
                  updateWatchPlayStatus(winningItem.id, 'Currently Active');
                  setWinnerModalOpen(false);
                }}
              >
                Mark as Currently Streaming 🔥
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setWinnerModalOpen(false)}
              >
                Keep in Backlog
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
