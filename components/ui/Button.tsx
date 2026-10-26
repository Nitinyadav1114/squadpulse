'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'daily' | 'study' | 'fun';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

    const sizeStyles = {
      sm: 'text-xs px-2.5 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2 gap-2',
      lg: 'text-base px-5 py-2.5 gap-2.5',
      icon: 'h-9 w-9 p-0 justify-center',
    };

    const variantStyles = {
      primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm',
      secondary: 'bg-muted hover:bg-muted/80 text-foreground',
      outline: 'border border-border bg-transparent hover:bg-muted text-foreground',
      ghost: 'bg-transparent hover:bg-muted text-foreground',
      danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm',
      daily: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20',
      study: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20',
      fun: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-500/20',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!isLoading && leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
