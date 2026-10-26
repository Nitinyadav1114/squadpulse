'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  statusDot?: 'online' | 'offline' | 'busy' | 'away' | string;
  badgeContent?: React.ReactNode;
}

export function Avatar({
  src,
  name,
  size = 'md',
  statusDot,
  badgeContent,
  className,
  ...props
}: AvatarProps) {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const dotSize = {
    xs: 'w-1.5 h-1.5 bottom-0 right-0',
    sm: 'w-2 h-2 bottom-0 right-0 ring-1',
    md: 'w-2.5 h-2.5 bottom-0 right-0 ring-2',
    lg: 'w-3 h-3 bottom-0.5 right-0.5 ring-2',
    xl: 'w-4 h-4 bottom-1 right-1 ring-2',
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online':
        return 'bg-emerald-500';
      case 'busy':
        return 'bg-rose-500';
      case 'away':
        return 'bg-amber-500';
      case 'offline':
        return 'bg-slate-400';
      default:
        return status ? `bg-[${status}]` : 'bg-emerald-500';
    }
  };

  const getInitials = (str: string) => {
    if (!str) return '??';
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Generate deterministic pastel background from name
  const getBackgroundColor = (str: string) => {
    const colors = [
      'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      'bg-rose-500/20 text-rose-400 border-rose-500/30',
      'bg-amber-500/20 text-amber-400 border-amber-500/30',
      'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      'bg-purple-500/20 text-purple-400 border-purple-500/30',
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center rounded-full font-medium select-none overflow-visible',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <div className={cn('w-full h-full rounded-full overflow-hidden flex items-center justify-center border', getBackgroundColor(name))}>
        {src && !hasError ? (
          <img
            src={src}
            alt={name}
            onError={() => setHasError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>

      {statusDot && (
        <span
          className={cn(
            'absolute rounded-full ring-background shrink-0',
            dotSize[size],
            getStatusColor(statusDot)
          )}
        />
      )}

      {badgeContent && (
        <div className="absolute -top-1 -right-1 flex items-center justify-center">
          {badgeContent}
        </div>
      )}
    </div>
  );
}
