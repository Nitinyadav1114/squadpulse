'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'secondary'
    | 'outline'
    | 'daily'
    | 'study'
    | 'fun'
    | 'success'
    | 'warning'
    | 'danger';
  size?: 'sm' | 'md';
  withDot?: boolean;
  dotColor?: string;
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  withDot = false,
  dotColor,
  children,
  ...props
}: BadgeProps) {
  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  const variantStyles = {
    default: 'bg-primary/10 text-primary border-primary/20',
    secondary: 'bg-muted text-muted-foreground border-border',
    outline: 'border-border text-foreground bg-transparent',
    daily: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    study: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
    fun: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    danger: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
  };

  const defaultDotColor = {
    default: 'bg-primary',
    secondary: 'bg-muted-foreground',
    outline: 'bg-foreground',
    daily: 'bg-emerald-500',
    study: 'bg-indigo-500',
    fun: 'bg-rose-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border transition-colors',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {withDot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0',
            dotColor || defaultDotColor[variant]
          )}
        />
      )}
      {children}
    </span>
  );
}
