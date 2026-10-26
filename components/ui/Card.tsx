'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'daily' | 'study' | 'fun' | 'interactive';
}

export function Card({ className, variant = 'default', children, ...props }: CardProps) {
  const variantStyles = {
    default: 'bg-card text-card-foreground border-border',
    daily: 'bg-card text-card-foreground border-emerald-500/20 hover:border-emerald-500/40 shadow-emerald-500/5',
    study: 'bg-card text-card-foreground border-indigo-500/20 hover:border-indigo-500/40 shadow-indigo-500/5',
    fun: 'bg-card text-card-foreground border-rose-500/20 hover:border-rose-500/40 shadow-rose-500/5',
    interactive: 'bg-card text-card-foreground border-border hover:border-border/80 hover:-translate-y-0.5 hover:shadow-md cursor-pointer transition-all duration-200',
  };

  return (
    <div
      className={cn(
        'rounded-xl border shadow-sm transition-all duration-200',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 pb-3 flex flex-col space-y-1.5', className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('font-semibold text-base leading-none tracking-tight', className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-xs text-muted-foreground leading-relaxed', className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 pt-0', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 pt-0 flex items-center', className)} {...props} />;
}
