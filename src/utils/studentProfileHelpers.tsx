import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export type ReadinessLevel = 'High' | 'Medium' | 'Low';

export interface Readiness {
  level: ReadinessLevel;
  color: string;
  icon: React.ReactNode;
}

export const calculateTrajectory = (scores: number[]) => {
  if (!scores || scores.length < 2) return 0;
  return (scores[scores.length - 1] - scores[0]) / (scores.length - 1);
};

export const getReadinessDetails = (finalScore: number, trajectory: number): Readiness => {
  if (finalScore >= 70 && trajectory >= -5) {
    return {
      level: 'High',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    };
  }
  if (finalScore < 50 || trajectory < -10) {
    return {
      level: 'Low',
      color: 'text-red-700 bg-red-50 border-red-200',
      icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
    };
  }
  return {
    level: 'Medium',
    color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
  };
};

/** Normalize Firestore timestamp to milliseconds for Date display */
export function timestampToMs(ts: Date | { toMillis?: () => number; seconds?: number } | number): number {
  if (typeof ts === 'number') return ts;
  if (ts && typeof (ts as { toMillis: () => number }).toMillis === 'function')
    return (ts as { toMillis: () => number }).toMillis();
  if (ts && typeof (ts as { seconds: number }).seconds === 'number') return (ts as { seconds: number }).seconds * 1000;
  return 0;
}

export function formatAssessmentDateTime(ts: Date | { toMillis?: () => number; seconds?: number } | number): string {
  const ms = timestampToMs(ts);
  return new Date(ms).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export interface FallbackHistoricalRecord {
  grade: string;
  literacy: number;
  numeracy: number;
  notes: string;
}

export const FALLBACK_HISTORICAL_DATA: FallbackHistoricalRecord[] = [
  { grade: 'Primary 4', literacy: 60, numeracy: 50, notes: 'Baseline: Needs Intervention' },
  { grade: 'Primary 5', literacy: 70, numeracy: 45, notes: 'Mid-Year: Approaching Target' },
  { grade: 'Primary 6', literacy: 75, numeracy: 40, notes: 'Recent Assessment: Target Not Met' },
];
