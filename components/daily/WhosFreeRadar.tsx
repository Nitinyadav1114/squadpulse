'use client';

import React, { useState } from 'react';
import { useSquadStore } from '@/lib/store';
import { PersonaId, StatusBadge } from '@/types';
import { formatRelativeTime, cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import {
  Radio,
  Send,
  Clock,
  Sparkles,
  Bell,
  Coffee,
  Gamepad2,
  BookOpen,
  Dumbbell,
  Smile,
  Moon,
  Code2,
  MapPin,
  CheckCircle2,
  Users,
} from 'lucide-react';

const PRESET_BADGES: { badge: StatusBadge; label: string; icon: React.ElementType; color: string }[] = [
  { badge: 'Free to Chill', label: 'Free to Chill', icon: Smile, color: 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10' },
  { badge: 'Canteen / Mess', label: 'Canteen / Mess', icon: Coffee, color: 'text-amber-500 border-amber-500/30 bg-amber-500/10' },
  { badge: 'In Class', label: 'In Class', icon: BookOpen, color: 'text-blue-500 border-blue-500/30 bg-blue-500/10' },
  { badge: 'Library / Studying', label: 'Library / Studying', icon: BookOpen, color: 'text-indigo-500 border-indigo-500/30 bg-indigo-500/10' },
  { badge: 'Gym / Sports', label: 'Gym / Sports', icon: Dumbbell, color: 'text-orange-500 border-orange-500/30 bg-orange-500/10' },
  { badge: 'Coding', label: 'Coding', icon: Code2, color: 'text-purple-500 border-purple-500/30 bg-purple-500/10' },
  { badge: 'Sleeping', label: 'Sleeping', icon: Moon, color: 'text-slate-400 border-slate-500/30 bg-slate-500/10' },
  { badge: 'Away / Offline', label: 'Away / Offline', icon: MapPin, color: 'text-rose-500 border-rose-500/30 bg-rose-500/10' },
];

const EXPIRY_OPTIONS = [
  { label: '15 mins', minutes: 15 },
  { label: '30 mins', minutes: 30 },
  { label: '1 hour', minutes: 60 },
  { label: '2 hours', minutes: 120 },
  { label: '4 hours', minutes: 240 },
];

const QUICK_PING_PRESETS = [
  '☕ Chai / Coffee break at Nescafe in 10 mins?',
  '🍕 Ordering pizza / biryani, who is in to split?',
  '🎮 Valorant / FIFA 5-stack lobby tonight?',
  '📚 Study sprint in Library 2nd floor silent zone?',
  '🚶 Quick campus walk / fresh air break?',
  '🍲 Lunch at the Canteen right now?',
];

export function WhosFreeRadar() {
  const {
    personas,
    statuses,
    currentPersonaId,
    hangoutPings,
    updateStatus,
    sendPing,
    markPingAsRead,
  } = useSquadStore();

  const currentPersona = personas[currentPersonaId];
  const currentStatus = statuses[currentPersonaId];

  // Status edit state
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<StatusBadge>(
    currentStatus?.badge || 'Free to Chill'
  );
  const [customMessage, setCustomMessage] = useState(currentStatus?.customMessage || '');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [statusUpdatedFeedback, setStatusUpdatedFeedback] = useState(false);

  // Ping modal state
  const [isPingModalOpen, setIsPingModalOpen] = useState(false);
  const [pingRecipient, setPingRecipient] = useState<PersonaId | 'all'>('all');
  const [pingMessage, setPingMessage] = useState('');
  const [pingSentSuccess, setPingSentSuccess] = useState(false);

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    updateStatus(selectedBadge, customMessage, durationMinutes);
    setIsEditingStatus(false);
    setStatusUpdatedFeedback(true);
    setTimeout(() => setStatusUpdatedFeedback(false), 3000);
  };

  const handleSendPing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pingMessage.trim()) return;
    sendPing(pingRecipient, pingMessage.trim());
    setPingSentSuccess(true);
    setTimeout(() => {
      setPingSentSuccess(false);
      setIsPingModalOpen(false);
      setPingMessage('');
    }, 1200);
  };

  const openPingModalTo = (target: PersonaId | 'all', defaultText?: string) => {
    setPingRecipient(target);
    if (defaultText) setPingMessage(defaultText);
    setIsPingModalOpen(true);
  };

  const allPersonaIds: PersonaId[] = ['aman', 'rhea', 'dev', 'tanvi'];

  // Radar position coordinates (normalized around 200x200 center)
  const radarCoords: Record<PersonaId, { top: string; left: string; angle: string }> = {
    aman: { top: '22%', left: '26%', angle: '-45deg' },
    rhea: { top: '22%', left: '74%', angle: '45deg' },
    dev: { top: '74%', left: '26%', angle: '-135deg' },
    tanvi: { top: '74%', left: '74%', angle: '135deg' },
  };

  const getStatusBadgeStyle = (badge: StatusBadge) => {
    const found = PRESET_BADGES.find((b) => b.badge === badge);
    return found || PRESET_BADGES[0];
  };

  const isStatusExpired = (expiresAtStr?: string) => {
    if (!expiresAtStr) return false;
    return new Date(expiresAtStr).getTime() < Date.now();
  };

  const freeCount = allPersonaIds.filter((id) => {
    const s = statuses[id];
    return s && !isStatusExpired(s.expiresAt) && (s.badge === 'Free to Chill' || s.badge === 'Canteen / Mess');
  }).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Ping Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-emerald-950/40 via-card to-card border border-emerald-500/20 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Who&apos;s Free Right Now
            </h2>
            <Badge variant="daily" size="sm">
              {freeCount} of 4 Available
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Live flatmate status radar & instant hangout pings. Know who is down to chill or study.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditingStatus(true)}
            className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Set My Status
          </Button>

          <Button
            variant="daily"
            size="sm"
            onClick={() => openPingModalTo('all')}
            className="shadow-emerald-500/20"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            Quick Hangout Ping
          </Button>
        </div>
      </div>

      {statusUpdatedFeedback && (
        <div className="flex items-center gap-2 p-3 bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs sm:text-sm animate-in fade-in slide-in-from-top-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Your status has been updated across the flat radar!</span>
        </div>
      )}

      {/* Main Grid: Radar Screen + 4 Roommate Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Radar Graphic View (lg: col 5) */}
        <div className="lg:col-span-5 bg-card border border-border rounded-2xl p-5 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="w-full flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              Flat 402 Radar Sweep
            </span>
            <Badge variant="outline" size="sm" className="text-[10px]">
              Range: Flat 402 + Campus
            </Badge>
          </div>

          {/* Circular Radar Container */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-emerald-500/30 bg-emerald-950/20 flex items-center justify-center overflow-hidden my-2">
            {/* Concentric distance rings */}
            <div className="absolute inset-4 rounded-full border border-dashed border-emerald-500/25" />
            <div className="absolute inset-14 rounded-full border border-emerald-500/20" />
            <div className="absolute inset-24 rounded-full border border-dashed border-emerald-500/15" />

            {/* Radar crosshairs */}
            <div className="absolute w-full h-[1px] bg-emerald-500/20" />
            <div className="absolute h-full w-[1px] bg-emerald-500/20" />

            {/* Animated sweeping line */}
            <div className="absolute inset-0 origin-center animate-[spin_6s_linear_infinite] pointer-events-none">
              <div className="w-1/2 h-1/2 bg-gradient-to-br from-emerald-500/30 to-transparent [clip-path:polygon(100%_100%,_0_100%,_100%_0)]" />
            </div>

            {/* Center Anchor: Flat 402 */}
            <div className="relative z-10 w-9 h-9 rounded-full bg-card border border-emerald-500/60 shadow-lg flex items-center justify-center text-[10px] font-bold text-emerald-400">
              402
            </div>

            {/* Roommate Radar Blips */}
            {allPersonaIds.map((id) => {
              const persona = personas[id];
              const st = statuses[id];
              const isFree = st?.badge === 'Free to Chill' || st?.badge === 'Canteen / Mess';
              const coords = radarCoords[id];
              const isCurrent = id === currentPersonaId;

              return (
                <div
                  key={id}
                  style={{ top: coords.top, left: coords.left }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer"
                  onClick={() => openPingModalTo(id)}
                  title={`Ping ${persona.name}`}
                >
                  <div className="relative flex flex-col items-center">
                    {/* Pulsing ring for free members */}
                    {isFree && (
                      <span className="absolute -inset-1 rounded-full bg-emerald-400/40 animate-ping" />
                    )}
                    <Avatar
                      name={persona.name}
                      src={persona.avatar}
                      size="sm"
                      className={cn(
                        'ring-2 transition-transform group-hover:scale-110',
                        isCurrent
                          ? 'ring-emerald-500'
                          : isFree
                          ? 'ring-emerald-400'
                          : 'ring-border'
                      )}
                    />
                    <span className="mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-card/90 border border-border shadow-xs text-foreground whitespace-nowrap">
                      {persona.name.split(' ')[0]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="w-full flex items-center justify-center gap-4 mt-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Free to Chill
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" /> Studying / Busy
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Canteen
            </span>
          </div>
        </div>

        {/* 4 Roommates Detail Cards (lg: col 7) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-500" /> Roommates Live Status
            </h3>
            <span className="text-xs text-muted-foreground">
              Click &apos;Ping&apos; to invite any flatmate
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allPersonaIds.map((id) => {
              const persona = personas[id];
              const st = statuses[id];
              const isCurrent = id === currentPersonaId;
              const badgeConfig = getStatusBadgeStyle(st?.badge || 'Free to Chill');
              const IconComponent = badgeConfig.icon;
              const expired = isStatusExpired(st?.expiresAt);

              return (
                <Card
                  key={id}
                  variant={isCurrent ? 'daily' : 'default'}
                  className={cn(
                    'relative overflow-hidden transition-all',
                    isCurrent && 'ring-1 ring-emerald-500/40 bg-emerald-950/10'
                  )}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          name={persona.name}
                          src={persona.avatar}
                          size="md"
                          statusDot={expired ? 'away' : st?.badge === 'Free to Chill' ? 'online' : 'away'}
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-sm text-foreground">
                              {persona.name}
                            </span>
                            {isCurrent && (
                              <Badge variant="daily" size="sm" className="text-[9px] py-0 px-1.5">
                                You
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground block">
                            {persona.room} • {persona.role}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isCurrent ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditingStatus(true)}
                            className="h-7 text-xs px-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                          >
                            Edit
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openPingModalTo(id)}
                            className="h-7 text-xs px-2.5 gap-1 hover:border-emerald-500/50 hover:text-emerald-500"
                          >
                            <Send className="w-3 h-3" />
                            Ping
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Status Badge & Message */}
                    <div className="space-y-1.5 bg-muted/40 rounded-xl p-2.5 border border-border/50">
                      <div className="flex items-center justify-between gap-1 text-xs">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border',
                            badgeConfig.color
                          )}
                        >
                          <IconComponent className="w-3 h-3" />
                          {st?.badge || 'Free to Chill'}
                        </span>

                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {st?.updatedAt ? formatRelativeTime(st.updatedAt) : 'Just now'}
                        </span>
                      </div>

                      {st?.customMessage ? (
                        <p className="text-xs text-foreground/90 line-clamp-2 italic leading-relaxed pt-0.5">
                          &ldquo;{st.customMessage}&rdquo;
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">No custom note set.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hangout Ping Activity Stream */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-500" />
              Recent Hangout Pings & Alerts
            </CardTitle>
            <CardDescription>
              Broadcasted invitations for chai, meals, gaming, and study sessions
            </CardDescription>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => openPingModalTo('all')}
            className="text-xs gap-1.5"
          >
            <Send className="w-3.5 h-3.5 text-emerald-500" />
            Send New Ping
          </Button>
        </CardHeader>

        <CardContent>
          {hangoutPings.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-xs">
              No recent pings. Send one to call the squad!
            </div>
          ) : (
            <div className="space-y-2.5">
              {hangoutPings.slice(0, 5).map((ping) => {
                const sender = personas[ping.senderId];
                const recipientName =
                  ping.recipientId === 'all'
                    ? 'Everyone in Flat'
                    : personas[ping.recipientId]?.name || 'Direct';
                const isSentByMe = ping.senderId === currentPersonaId;

                return (
                  <div
                    key={ping.id}
                    onClick={() => markPingAsRead(ping.id)}
                    className={cn(
                      'flex items-start justify-between gap-3 p-3 rounded-xl border transition-colors',
                      !ping.isRead && !isSentByMe
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-card border-border hover:bg-muted/40'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar name={sender?.name || 'User'} src={sender?.avatar} size="sm" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-xs text-foreground">
                            {sender?.name || 'Roommate'}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            to <span className="font-medium text-foreground">{recipientName}</span>
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            • {formatRelativeTime(ping.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-foreground font-medium">{ping.presetText}</p>
                      </div>
                    </div>

                    {!ping.isRead && !isSentByMe && (
                      <Badge variant="daily" size="sm" className="text-[9px] shrink-0">
                        New
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal: Update My Status */}
      <Modal
        isOpen={isEditingStatus}
        onClose={() => setIsEditingStatus(false)}
        title="Update Your Flatmate Status"
        description={`Set what you're up to so ${currentPersona.name.split(' ')[0]}'s roommates know your availability.`}
        size="md"
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Choose Activity Badge</label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_BADGES.map((b) => {
                const Icon = b.icon;
                const isSelected = selectedBadge === b.badge;
                return (
                  <button
                    type="button"
                    key={b.badge}
                    onClick={() => setSelectedBadge(b.badge)}
                    className={cn(
                      'flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium text-left transition-all',
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold ring-1 ring-emerald-500'
                        : 'border-border bg-card hover:bg-muted/60 text-muted-foreground'
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{b.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Custom Status Note</label>
            <input
              type="text"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="e.g. Grabbing chai at Nescafe, down for 15m break..."
              maxLength={120}
              className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <span className="text-[10px] text-muted-foreground block text-right">
              {customMessage.length}/120 characters
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Auto-Expire In</label>
            <div className="flex flex-wrap gap-2">
              {EXPIRY_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.minutes}
                  onClick={() => setDurationMinutes(opt.minutes)}
                  className={cn(
                    'text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors',
                    durationMinutes === opt.minutes
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'border-border bg-card hover:bg-muted text-muted-foreground'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditingStatus(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="daily" size="sm">
              Update Status
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Quick Hangout Ping */}
      <Modal
        isOpen={isPingModalOpen}
        onClose={() => setIsPingModalOpen(false)}
        title="Broadcast Hangout Ping"
        description="Send an instant nudge to one or all flatmates."
        size="md"
      >
        <form onSubmit={handleSendPing} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Recipient</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                type="button"
                onClick={() => setPingRecipient('all')}
                className={cn(
                  'flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-medium transition-colors',
                  pingRecipient === 'all'
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'border-border bg-card hover:bg-muted text-muted-foreground'
                )}
              >
                <Users className="w-3.5 h-3.5" /> All (Flat)
              </button>
              {allPersonaIds.map((id) => (
                <button
                  type="button"
                  key={id}
                  onClick={() => setPingRecipient(id)}
                  className={cn(
                    'flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-medium transition-colors',
                    pingRecipient === id
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'border-border bg-card hover:bg-muted text-muted-foreground'
                  )}
                >
                  <Avatar name={personas[id].name} src={personas[id].avatar} size="xs" />
                  <span className="truncate">{personas[id].name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Quick Presets</label>
            <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
              {QUICK_PING_PRESETS.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setPingMessage(preset)}
                  className={cn(
                    'text-left text-xs p-2 rounded-lg border transition-colors',
                    pingMessage === preset
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium'
                      : 'border-border bg-card hover:bg-muted text-foreground'
                  )}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Custom Message / Edit</label>
            <input
              type="text"
              value={pingMessage}
              onChange={(e) => setPingMessage(e.target.value)}
              placeholder="Type your ping invite or select a preset above..."
              className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {pingSentSuccess && (
            <div className="flex items-center gap-2 p-2.5 bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-medium animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Ping broadcasted successfully!</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPingModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="daily"
              size="sm"
              disabled={!pingMessage.trim() || pingSentSuccess}
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Broadcast Ping
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
