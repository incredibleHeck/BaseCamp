import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface ExecutiveSummaryWindow {
  assessmentCount: number;
  averageScore: number;
  assessmentsWithSenFlag: number;
  topLearningGap: string | null;
}

export interface ExecutiveSummaryCohort {
  cohortId: string;
  assessmentCount: number;
  averageScore: number;
  assessmentsWithSenFlag: number;
  topLearningGap: string | null;
}

export interface ExecutiveSummaryDoc {
  summaryKind: string;
  schemaVersion: number;
  schoolId: string;
  districtId?: string;
  windowStartMs: number;
  windowEndMs: number;
  generatedAt: unknown;
  window: ExecutiveSummaryWindow;
  byCohort: ExecutiveSummaryCohort[];
  deltas: null;
}

export function useExecutiveSummary(schoolId: string | undefined) {
  const [summary, setSummary] = useState<ExecutiveSummaryDoc | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!schoolId?.trim()) {
      setSummary(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const unsub = onSnapshot(
      doc(db, 'aggregations', schoolId),
      (snap) => {
        if (snap.exists()) {
          setSummary(snap.data() as ExecutiveSummaryDoc);
        } else {
          setSummary(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return unsub;
  }, [schoolId]);

  return { summary, loading, error };
}
