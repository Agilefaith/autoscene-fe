import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCredits(credits: number): string {
  const minutes = (credits * 30) / 60
  if (minutes < 1) return `${credits * 30}s`
  if (minutes < 60) return `${minutes} min`
  return `${(minutes / 60).toFixed(1)}h`
}

