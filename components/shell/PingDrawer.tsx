'use client';

import React, { useState } from 'react';
import { useSquadStore } from '@/lib/store';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn, formatRelativeTime } from '@/lib/utils';
import {
  X,
  Send,
  Coffee,
  Gamepad2,
  Dumbbell,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Clock,
  Radio,
} from 'lucide-react';

export function PingDrawer() {
  const {
    isPingDrawerOpen,
    setPingDrawerOpen,
    hangoutPings,
    sendPing,
    markPingAsRead,
    personas,
    currentPersonaId,
  } = useSquadStore();

  const [customPingText, setCustomPingText] = useState('');

  if (!isPingDrawerOpen) return null;

  const quickPresets = [
    { text: '☕ Canteen Chai & Samosa in 15 mins?', icon: Coffee },
    { text: '🎮 Valorant / BGMI 5-stack lobby tonight?', icon: Gamepad2 },
    { text: '💪 Heading to campus gym/sports ground!', icon: Dumbbell },
    { text: '📚 Library study session for midterms?', icon: BookOpen },
  ];

  const handleSendPreset = (text: string) => {
    sendPing('all', text);
  };

  const handleSendCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPingText.trim()) return;
    sendPing('all', customPingText.trim());
    setCustomPingText('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={() => setPingDrawerOpen(false)}
      />

      {/* Slide-over Drawer */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <aside className="w-screen max-w-md bg-card border-l border-border text-card-foreground shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h2 className="text-sm font-bold leading-tight">Hangout Pings & Alerts</h2>
                <p className="text-[11px] text-muted-foreground">
                  Instant roommate broadcasts & notifications
                </p>
              </div>
            </div>

            <button
              onClick={() => setPingDrawerOpen(false)}
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span className="sr-only">Close drawer</span>
            </button>
          </div>

          {/* Quick Broadcast Section */}
          <div className="p-4 bg-muted/40 border-b border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                Quick Ping Broadcast
              </span>
              <span className="text-[10px] text-muted-foreground">From: {personas[currentPersonaId]?.name}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {quickPresets.map((preset) => {
                const Icon = preset.icon;
                return (
                  <button
                    key={preset.text}
                    onClick={() => handleSendPreset(preset.text)}
                    className="p-2 text-left rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-muted/80 text-xs transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
                  >
                    <Icon className="w-4 h-4 text-primary shrink-0" />
                    <span className="truncate leading-tight">{preset.text.split('?')[0]}?</span>
                  </button>
                );
              })}
            </div>

            {/* Custom ping input */}
            <form onSubmit={handleSendCustom} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Custom broadcast ping..."
                value={customPingText}
                onChange={(e) => setCustomPingText(e.target.value)}
                className="flex-1 text-xs px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button type="submit" size="sm" variant="primary" disabled={!customPingText.trim()}>
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>

          {/* Pings Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Active Roommate Pings</span>
              <span>{hangoutPings.length} total</span>
            </div>

            {hangoutPings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground space-y-2">
                <Radio className="w-8 h-8 mx-auto opacity-30" />
                <p className="text-xs">No active hangout pings right now.</p>
                <p className="text-[11px]">Send a quick broadcast above!</p>
              </div>
            ) : (
              hangoutPings.map((ping) => {
                const sender = personas[ping.senderId] || {
                  name: ping.senderId,
                  avatar: '',
                  role: 'Roommate',
                };
                const isFromMe = ping.senderId === currentPersonaId;

                return (
                  <div
                    key={ping.id}
                    className={cn(
                      'p-3 rounded-xl border transition-all space-y-2',
                      ping.isRead
                        ? 'bg-card border-border opacity-75'
                        : 'bg-card border-rose-500/30 shadow-xs shadow-rose-500/5'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar name={sender.name} src={sender.avatar} size="xs" />
                        <div>
                          <span className="text-xs font-semibold text-foreground">
                            {isFromMe ? 'You' : sender.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground ml-1.5">
                            ({sender.role})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{formatRelativeTime(ping.createdAt)}</span>
                      </div>
                    </div>

                    <p className="text-xs text-foreground font-medium pl-8">{ping.presetText}</p>

                    <div className="flex items-center justify-between pt-1 pl-8">
                      {!ping.isRead ? (
                        <button
                          onClick={() => markPingAsRead(ping.id)}
                          className="text-[11px] text-primary hover:underline flex items-center gap-1 cursor-pointer font-medium"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Mark Read</span>
                        </button>
                      ) : (
                        <Badge variant="secondary" size="sm">
                          Seen
                        </Badge>
                      )}

                      {!isFromMe && (
                        <Button
                          size="sm"
                          variant="daily"
                          className="h-7 text-xs px-2.5"
                          onClick={() => {
                            sendPing(ping.senderId, `Count me in! 🙌`);
                            markPingAsRead(ping.id);
                          }}
                        >
                          I'm in!
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
