'use client';

import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (id: string) => void;
  variant: 'default' | 'daily' | 'study' | 'fun';
}

const TabsContext = createContext<TabsContextType | null>(null);

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  variant?: 'default' | 'daily' | 'study' | 'fun';
}

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  variant = 'default',
  children,
  className,
  ...props
}: TabsProps) {
  const [internalTab, setInternalTab] = useState(defaultValue);
  const activeTab = value !== undefined ? value : internalTab;

  const setActiveTab = (tab: string) => {
    if (value === undefined) setInternalTab(tab);
    onValueChange?.(tab);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, variant }}>
      <div className={cn('w-full space-y-4', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'inline-flex h-10 items-center justify-start rounded-xl bg-muted p-1 text-muted-foreground w-full sm:w-auto overflow-x-auto',
        className
      )}
      {...props}
    />
  );
}

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function TabsTrigger({ value, className, children, ...props }: TabsTriggerProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');

  const isActive = context.activeTab === value;

  const activeStyles = {
    default: 'bg-card text-foreground shadow-sm font-semibold',
    daily: 'bg-emerald-600 text-white shadow-sm font-semibold shadow-emerald-500/20',
    study: 'bg-indigo-600 text-white shadow-sm font-semibold shadow-indigo-500/20',
    fun: 'bg-rose-600 text-white shadow-sm font-semibold shadow-rose-500/20',
  };

  return (
    <button
      type="button"
      onClick={() => context.setActiveTab(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 select-none cursor-pointer',
        isActive ? activeStyles[context.variant] : 'hover:text-foreground text-muted-foreground',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabsContent({ value, className, children, ...props }: TabsContentProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');

  if (context.activeTab !== value) return null;

  return (
    <div
      className={cn('focus-visible:outline-none animate-in fade-in-50 duration-200', className)}
      {...props}
    >
      {children}
    </div>
  );
}
