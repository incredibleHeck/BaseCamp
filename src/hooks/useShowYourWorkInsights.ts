import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export type ShowYourWorkInsightRow = {
  id: string;
  studentId: string;
  status: 'completed' | 'failed';
  createdAt: Date | null;
  model: string | null;
  storagePath: string | null;
  error: string | null;
  insights: {
    teacherSummary?: string;
    speechCadence?: string;
    vocabularyHighlights?: string[];
    problemSolvingSteps?: string[];
    limitations?: string;
  } | null;
};

function toDate(ts: unknown): Date | null {
  if (ts && typeof ts === 'object' && 'toDate' in ts && typeof (ts as Timestamp).toDate === 'function') {
    try {
      return (ts as Timestamp).toDate();
    } catch {
      return null;
    }
  }
  return null;
}

export function useShowYourWorkInsights(studentId: string | null | undefined) {
  const [rows, setRows] = useState<ShowYourWorkInsightRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = studentId?.trim();
    if (!id) {
      setRows([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(
      collection(db, 'showYourWorkInsights'),
      where('studentId', '==', id),
      orderBy('createdAt', 'desc'),
      limit(10),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const next: ShowYourWorkInsightRow[] = [];
        for (const doc of snap.docs) {
          const d = doc.data() as Record<string, unknown>;
          const insightsRaw = d.insights;
          const insights =
            insightsRaw && typeof insightsRaw === 'object'
              ? (insightsRaw as ShowYourWorkInsightRow['insights'])
              : null;
          next.push({
            id: doc.id,
            studentId: typeof d.studentId === 'string' ? d.studentId : id,
            status: d.status === 'failed' ? 'failed' : 'completed',
            createdAt: toDate(d.createdAt),
            model: typeof d.model === 'string' ? d.model : null,
            storagePath: typeof d.storagePath === 'string' ? d.storagePath : null,
            error: typeof d.error === 'string' ? d.error : null,
            insights,
          });
        }
        setRows(next);
        setLoading(false);
      },
      (e) => {
        setError(e.message || 'Failed to load insights');
        setRows([]);
        setLoading(false);
      },
    );

    return () => unsub();
  }, [studentId]);

  return { rows, loading, error };
}
