import { collection, addDoc, doc, updateDoc, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { SenWarningFlag } from './aiPrompts/types';

const SEN_WARNING_SEVERITIES = new Set(['low', 'medium', 'high']);

function parseSenWarningFlagFromDoc(raw: unknown): SenWarningFlag | undefined {
  if (raw == null || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;
  const sev = o.severity;
  const category = o.category;
  const reason = o.reason;
  if (typeof sev !== 'string' || !SEN_WARNING_SEVERITIES.has(sev)) return undefined;
  if (typeof category !== 'string' || typeof reason !== 'string') return undefined;
  return { severity: sev as SenWarningFlag['severity'], category, reason };
}

/** Firestore rejects `undefined` anywhere in a document. */
function omitUndefinedFields<T extends Record<string, unknown>>(data: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) out[key] = value;
  }
  return out;
}

export interface Assessment {
  id?: string;
  studentId: string;
  type: 'Literacy' | 'Numeracy';
  diagnosis: string;
  masteredConcepts?: string;
  gapTags?: string[];
  masteryTags?: string[];
  remedialPlan?: string;
  lessonPlan?: { title: string; instructions: string[] };
  /** A* / gifted extension (markdown); optional. */
  extensionActivity?: string;
  /** Generated practice worksheet; overwritten when regenerated. */
  worksheet?: { title: string; questions: string[] };
  /** 0–100 mastery score from AI diagnostic (Phase 2 gradebook). */
  score?: number;
  term?: string;
  academicYear?: string;
  /** Class / stream label for exports (e.g. Primary 6A). */
  classLabel?: string;
  /** GES curriculum alignment from RAG-assisted diagnosis. */
  gesObjectiveId?: string;
  gesObjectiveTitle?: string;
  gesCurriculumExcerpt?: string;
  /** True when objectiveId was in the retrieved allowlist for this request. */
  gesVerified?: boolean;
  /** Phase 3: remedial playbook identity for A/B style analytics */
  playbookKey?: string;
  playbookTitle?: string;
  timestamp: Date | Timestamp | number;
  status: 'Pending' | 'In Progress' | 'Completed';
  /** Model / screening hint persisted for gradebook & longitudinal views (non-clinical). */
  senWarningFlag?: SenWarningFlag | null;
}

/**
 * Saves a new assessment to the Firestore "assessments" collection.
 * @param data The assessment data to save.
 * @returns The generated document ID, or null if an error occurred.
 */
export const saveAssessment = async (data: Assessment): Promise<string | null> => {
  try {
    const docRef = await addDoc(
      collection(db, 'assessments'),
      omitUndefinedFields(data as unknown as Record<string, unknown>) as Assessment
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
    await updateDoc(ref, patch);
  } catch (error) {
    console.error('Error updating assessment document: ', error);
    throw error;
  }
};

/**
 * Retrieves the assessment history for a specific student, ordered by timestamp descending.
 * @param studentId The ID of the student.
 * @returns An array of Assessment objects.
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
    
    querySnapshot.forEach((doc) => {
      // Extract data and include the document ID
      const data = doc.data();
      history.push({ 
        id: doc.id,
        studentId: data.studentId,
        type: data.type,
        diagnosis: data.diagnosis,
        masteredConcepts: data.masteredConcepts,
        gapTags: data.gapTags ?? [],
        masteryTags: data.masteryTags ?? [],
        remedialPlan: data.remedialPlan || '',
        lessonPlan: data.lessonPlan || { title: '', instructions: [] },
        extensionActivity: typeof data.extensionActivity === 'string' ? data.extensionActivity : undefined,
        worksheet: data.worksheet ?? undefined,
        score: typeof data.score === 'number' ? data.score : undefined,
        term: typeof data.term === 'string' ? data.term : undefined,
        academicYear: typeof data.academicYear === 'string' ? data.academicYear : undefined,
        classLabel: typeof data.classLabel === 'string' ? data.classLabel : undefined,
        gesObjectiveId: typeof data.gesObjectiveId === 'string' ? data.gesObjectiveId : undefined,
        gesObjectiveTitle: typeof data.gesObjectiveTitle === 'string' ? data.gesObjectiveTitle : undefined,
        gesCurriculumExcerpt: typeof data.gesCurriculumExcerpt === 'string' ? data.gesCurriculumExcerpt : undefined,
        gesVerified: typeof data.gesVerified === 'boolean' ? data.gesVerified : undefined,
        playbookKey: typeof data.playbookKey === 'string' ? data.playbookKey : undefined,
        playbookTitle: typeof data.playbookTitle === 'string' ? data.playbookTitle : undefined,
        timestamp: data.timestamp,
        status: data.status,
        senWarningFlag: parseSenWarningFlagFromDoc(data.senWarningFlag),
      });
    });
    
    return history;
  } catch (error) {
    console.error('Error fetching student assessment history: ', error);
    return [];
  }
};

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
