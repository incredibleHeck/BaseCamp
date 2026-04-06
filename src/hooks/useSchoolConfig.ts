import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { School } from '../types/domain';

/** Completed reads keyed by schoolId — avoids repeated Firestore getDoc for the same school. */
const schoolCache = new Map<string, School | null>();

/** In-flight fetches so concurrent subscribers share one read. */
const inFlight = new Map<string, Promise<School | null>>();

function loadSchool(schoolId: string): Promise<School | null> {
  if (schoolCache.has(schoolId)) {
    return Promise.resolve(schoolCache.get(schoolId)!);
  }

  let pending = inFlight.get(schoolId);
  if (!pending) {
    pending = (async () => {
      const ref = doc(db, 'schools', schoolId);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        schoolCache.set(schoolId, null);
        return null;
      }
      const data = snap.data();
      const school = {
        id: snap.id,
        ...(data as Omit<School, 'id'>),
      } as School;
      schoolCache.set(schoolId, school);
      return school;
    })().finally(() => {
      inFlight.delete(schoolId);
    });
    inFlight.set(schoolId, pending);
  }

  return pending;
}

type FetchState =
  | { schoolId: string; school: School | null; loading: false; error: null }
  | { schoolId: string; school: null; loading: true; error: null }
  | { schoolId: string; school: null; loading: false; error: Error };

export type UseSchoolConfigResult = {
  school: School | null;
  loading: boolean;
  error: Error | null;
};

/**
 * Loads the `schools/{schoolId}` document for multi-tenant config (e.g. `curriculumType`).
 * Results are cached per school id across the module; concurrent mounts share one in-flight read.
 */
export function useSchoolConfig(schoolId?: string): UseSchoolConfigResult {
  const [state, setState] = useState<FetchState | null>(null);

  useEffect(() => {
    const id = schoolId?.trim();
    if (!id) {
      setState(null);
      return;
    }

    let cancelled = false;

    if (schoolCache.has(id)) {
      setState({
        schoolId: id,
        school: schoolCache.get(id)!,
        loading: false,
        error: null,
      });
      return;
    }

    setState({ schoolId: id, school: null, loading: true, error: null });

    loadSchool(id)
      .then((school) => {
        if (!cancelled) {
          setState({ schoolId: id, school, loading: false, error: null });
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setState({
            schoolId: id,
            school: null,
            loading: false,
            error: e instanceof Error ? e : new Error(String(e)),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [schoolId]);

  const id = schoolId?.trim();
  if (!id) {
    return { school: null, loading: false, error: null };
  }

  if (!state || state.schoolId !== id) {
    return { school: null, loading: true, error: null };
  }

  if (state.loading) {
    return { school: null, loading: true, error: null };
  }

  if (state.error) {
    return { school: null, loading: false, error: state.error };
  }

  return { school: state.school, loading: false, error: null };
}
