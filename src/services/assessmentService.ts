import { collection, addDoc, doc, updateDoc, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { SenWarningFlag } from './aiPrompts/types';
import type { Assessment } from '../types/domain';

export type { Assessment };

const SEN_WARNING_SEVERITIES = new Set(['low', 'medium', 'high']);
const SEN_WARNING_CATEGORIES = new Set<string>([
  'Dyscalculia',
  'Dyslexia',
  'Dysgraphia',
  'Visual-Spatial',
  'Auditory-Processing',
  'Other',
]);

function parseSenWarningFlagFromDoc(raw: unknown): SenWarningFlag | undefined {
  if (raw == null || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;
  const sev = o.severity;
  const category = o.category;
  const reason = o.reason;
  if (typeof sev !== 'string' || !SEN_WARNING_SEVERITIES.has(sev)) return undefined;
  if (typeof category !== 'string' || !SEN_WARNING_CATEGORIES.has(category)) return undefined;
  if (typeof reason !== 'string') return undefined;
  return {
    severity: sev as SenWarningFlag['severity'],
    category: category as SenWarningFlag['category'],
    reason,
  };
}

/** Firestore rejects `undefined` anywhere in a document. */
function omitUndefinedFields<T extends Record<string, unknown>>(data: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) out[key] = value;
  }
  return out;
}

function lessonPlanFromFirestore(raw: unknown): NonNullable<Assessment['lessonPlan']> {
  if (raw == null || typeof raw !== 'object') return { title: '', instructions: [] };
  const o = raw as Record<string, unknown>;
  const title = typeof o.title === 'string' ? o.title : '';
  const instructions = Array.isArray(o.instructions)
    ? o.instructions.filter((x): x is string => typeof x === 'string')
    : [];
  return { title, instructions };
}

function worksheetFromFirestore(raw: unknown): Assessment['worksheet'] {
  if (raw == null || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;
  if (typeof o.title !== 'string' || !Array.isArray(o.questions)) return undefined;
  const questions = o.questions.filter((x): x is string => typeof x === 'string');
  return { title: o.title, questions };
}

/** Optional epoch ms from number or Firestore Timestamp-style values. */
function optionalEpochMs(raw: unknown): number | undefined {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (raw != null && typeof raw === 'object' && typeof (raw as Timestamp).toMillis === 'function') {
    return (raw as Timestamp).toMillis();
  }
  if (
    typeof raw === 'object' &&
    raw !== null &&
    'seconds' in raw &&
    typeof (raw as { seconds: unknown }).seconds === 'number'
  ) {
    return (raw as { seconds: number }).seconds * 1000;
  }
  return undefined;
}

/**
 * Saves a new assessment to the Firestore "assessments" collection.
 * @param data The assessment data to save.
 * @returns The generated document ID, or null if an error occurred.
 */
export const saveAssessment = async (data: Assessment): Promise<string | null> => {
  try {
    const record = {
      ...(data as unknown as Record<string, unknown>),
      updatedAt: Date.now(),
    };
    const docRef = await addDoc(
      collection(db, 'assessments'),
      omitUndefinedFields(record) as unknown as Assessment
    );
    return docRef.id;
  } catch (error) {
    console.error('Error adding assessment document: ', error);
    return null;
  }
};

/**
 * Updates an existing assessment document (e.g. lesson plan after regenerate).
 * @param assessmentId Firestore document ID.
 * @param updates Partial assessment fields to merge.
 */
export const updateAssessment = async (
  assessmentId: string,
  updates: Partial<
    Pick<
      Assessment,
      | 'lessonPlan'
      | 'extensionActivity'
      | 'remedialPlan'
      | 'status'
      | 'worksheet'
      | 'score'
      | 'gesObjectiveId'
      | 'gesObjectiveTitle'
      | 'gesCurriculumExcerpt'
      | 'gesVerified'
    >
  >
): Promise<void> => {
  try {
    const ref = doc(db, 'assessments', assessmentId);
    const patch = omitUndefinedFields(updates as unknown as Record<string, unknown>);
    if (Object.keys(patch).length === 0) return;
    patch.updatedAt = Date.now();
    await updateDoc(ref, patch);
  } catch (error) {
    console.error('Error updating assessment document: ', error);
    throw error;
  }
};

function assessmentFromFirestoreDoc(docId: string, data: Record<string, unknown>): Assessment {
  return {
    id: docId,
    studentId: data.studentId as string,
    type: data.type as Assessment['type'],
    diagnosis: data.diagnosis as string,
    masteredConcepts: data.masteredConcepts as string | undefined,
    gapTags: (data.gapTags as string[]) ?? [],
    masteryTags: (data.masteryTags as string[]) ?? [],
    remedialPlan: (data.remedialPlan as string) || '',
    lessonPlan: lessonPlanFromFirestore(data.lessonPlan),
    extensionActivity: typeof data.extensionActivity === 'string' ? data.extensionActivity : undefined,
    worksheet: worksheetFromFirestore(data.worksheet),
    score: typeof data.score === 'number' ? data.score : undefined,
    rawScore: typeof data.rawScore === 'number' ? data.rawScore : undefined,
    term: typeof data.term === 'string' ? data.term : undefined,
    academicYear: typeof data.academicYear === 'string' ? data.academicYear : undefined,
    classLabel: typeof data.classLabel === 'string' ? data.classLabel : undefined,
    cohortId: typeof data.cohortId === 'string' ? data.cohortId : undefined,
    schoolId: typeof data.schoolId === 'string' && data.schoolId.trim() ? data.schoolId.trim() : undefined,
    createdByUserId:
      typeof data.createdByUserId === 'string' && data.createdByUserId.trim()
        ? data.createdByUserId.trim()
        : undefined,
    updatedAt: optionalEpochMs(data.updatedAt),
    gesObjectiveId: typeof data.gesObjectiveId === 'string' ? data.gesObjectiveId : undefined,
    gesObjectiveTitle: typeof data.gesObjectiveTitle === 'string' ? data.gesObjectiveTitle : undefined,
    gesCurriculumExcerpt: typeof data.gesCurriculumExcerpt === 'string' ? data.gesCurriculumExcerpt : undefined,
    gesVerified: typeof data.gesVerified === 'boolean' ? data.gesVerified : undefined,
    alignedStandardCode:
      typeof data.alignedStandardCode === 'string' && data.alignedStandardCode.trim()
        ? data.alignedStandardCode.trim()
        : undefined,
    masteryLevel: typeof data.masteryLevel === 'string' ? data.masteryLevel : undefined,
    playbookKey: typeof data.playbookKey === 'string' ? data.playbookKey : undefined,
    playbookTitle: typeof data.playbookTitle === 'string' ? data.playbookTitle : undefined,
    timestamp: data.timestamp as Assessment['timestamp'],
    status: data.status as Assessment['status'],
    senWarningFlag: parseSenWarningFlagFromDoc(data.senWarningFlag),
  };
}

/**
 * Retrieves the assessment history for a specific student, ordered by timestamp descending.
 * @param studentId The ID of the student.
 * @returns Assessment rows (may include denormalized `cohortId` when stored on documents).
 */
export const getStudentHistory = async (studentId: string): Promise<Assessment[]> => {
  try {
    const q = query(
      collection(db, 'assessments'),
      where('studentId', '==', studentId),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const history: Assessment[] = [];

    querySnapshot.forEach((docSnap) => {
      history.push(assessmentFromFirestoreDoc(docSnap.id, docSnap.data() as Record<string, unknown>));
    });

    return history;
  } catch (error) {
    console.error('Error fetching student assessment history: ', error);
    return [];
  }
};

/** Full collection read for exports and cross-student analytics (use sparingly). */
export async function fetchAllAssessments(): Promise<Assessment[]> {
  try {
    const snap = await getDocs(collection(db, 'assessments'));
    const list: Assessment[] = [];
    snap.forEach((d) => list.push(assessmentFromFirestoreDoc(d.id, d.data() as Record<string, unknown>)));
    return list;
  } catch (e) {
    console.error('fetchAllAssessments', e);
    return [];
  }
}

export interface AssessmentSummaryEntry {
  lastDate: number;
  count: number;
  lastDiagnosis: string | null;
}

/**
 * Fetches all assessments and groups by studentId for roster/summary views.
 * Returns a Map of studentId -> { lastDate (ms), count, lastDiagnosis }.
 */
export const getAssessmentSummaryByStudent = async (): Promise<Map<string, AssessmentSummaryEntry>> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'assessments'));
    const map = new Map<string, AssessmentSummaryEntry>();

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const studentId = data.studentId as string;
      const rawTs = data.timestamp;
      const tsMs = typeof rawTs === 'number' ? rawTs : (rawTs && typeof (rawTs as { toMillis?: () => number }).toMillis === 'function')
        ? (rawTs as { toMillis: () => number }).toMillis()
        : typeof rawTs === 'object' && rawTs !== null && 'seconds' in rawTs
          ? (rawTs as { seconds: number }).seconds * 1000
          : 0;
      const diagnosis = (data.diagnosis as string) ?? null;
      const existing = map.get(studentId);
      const count = (existing?.count ?? 0) + 1;
      if (!existing || tsMs > existing.lastDate) {
        map.set(studentId, { lastDate: tsMs, count, lastDiagnosis: diagnosis });
      } else {
        map.set(studentId, { lastDate: existing.lastDate, count, lastDiagnosis: existing.lastDiagnosis });
      }
    });

    return map;
  } catch (error) {
    console.error('Error fetching assessment summary: ', error);
    return new Map();
  }
};
