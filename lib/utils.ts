import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatRelativeTime(dateInput: string | Date): string {
  try {
    const date = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return String(dateInput);
  }
}

export function formatDate(dateInput: string | Date, formatStr: string = "MMM d, yyyy"): string {
  try {
    const date = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
    return format(date, formatStr);
  } catch {
    return String(dateInput);
  }
}
