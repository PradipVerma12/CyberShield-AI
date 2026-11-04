import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTimeAgo(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function getVerdictColor(verdict: string): string {
  switch (verdict?.toLowerCase()) {
    case 'safe':
    case 'clean':
    case 'strong':
      return 'text-emerald-400';
    case 'suspicious':
    case 'moderate':
    case 'spam':
      return 'text-amber-400';
    case 'malicious':
    case 'phishing':
    case 'weak':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
}

export function getVerdictBg(verdict: string): string {
  switch (verdict?.toLowerCase()) {
    case 'safe':
    case 'clean':
    case 'strong':
      return 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20';
    case 'suspicious':
    case 'moderate':
    case 'spam':
      return 'bg-amber-400/10 text-amber-400 border border-amber-400/20';
    case 'malicious':
    case 'phishing':
    case 'weak':
      return 'bg-red-400/10 text-red-400 border border-red-400/20';
    default:
      return 'bg-gray-400/10 text-gray-400 border border-gray-400/20';
  }
}

export function getModuleIcon(module: string): string {
  switch (module) {
    case 'url': return '🔗';
    case 'email': return '📧';
    case 'port': return '🔌';
    case 'password': return '🔐';
    case 'file-encryption': return '🔒';
    default: return '🛡️';
  }
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n) + '…' : str;
}
