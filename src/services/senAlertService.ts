import {
  addDoc,
  arrayUnion,
  collection,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Assessment } from './assessmentService';
import { getStudentHistory } from './assessmentService';
import { getStudent } from './studentService';
import { DEFAULT_ORGANIZATION_ID } from '../config/organizationDefaults';
import type { SenWarningFlag } from './ai/aiPrompts/types';

export const SEN_RULE_NUMERACY_PATTERN_V1 = 'numeracy-sen-pattern-consecutive-3';
/** Created when the longitudinal diagnostic model returns medium/high {@link SenWarningFlag}. */
export const SEN_RULE_AI_LONGITUDINAL_WARNING_V1 = 'sen-longitudinal-ai-warning-v1';
export const SEN_RULE_VERSION = '1.0';

/** Educational screening signal — not a clinical diagnosis. */
export interface SenAlert {
  id?: string;
  studentId: string;
  studentName?: string;
  organizationId?: string;
  circuitId?: string;
  schoolId?: string;
  status: 'open' | 'dismissed' | 'escalated' | 'snoozed';
  ruleId: string;
  ruleVersion: string;
  summary: string;
  triggeredByAssessmentIds: string[];
  createdAt: Timestamp | number;
  auditLog?: SenAuditEntry[];
}

export interface SenAuditEntry {
  at: number;
  action: string;
  note?: string;
  actorId?: string;
}

const COLLECTION = 'senAlerts';

function tsMs(t: Timestamp | number | undefined): number {
  if (typeof t === 'number') return t;
  if (t && typeof (t as Timestamp).toMillis === 'function') return (t as Timestamp).toMillis();
  return 0;
}

/** Dyscalculia / numeracy processing–relevant text signals (screening). */
const NUMERACY_SEN_PATTERN =
  /dyscalculia|number sense|magnitude|number line|working memory|visual-spatial|visual spatial|estimation|place value|subiti|processing speed|math anxiety/i;

export function numeracyAssessmentTriggersSenSignal(a: Assessment): boolean {
  if (a.type !== 'Numeracy') return false;
  const blob = [a.diagnosis, ...(a.gapTags ?? []), ...(a.masteryTags ?? [])].join(' ');
  if (!NUMERACY_SEN_PATTERN.test(blob)) return false;
  if (typeof a.score === 'number') return a.score < 52;
  return true;
}

export type EvaluateSenAlertsOptions = {
  /** From {@link DiagnosticReport.senWarningFlag} after AI longitudinal screening. */
  senWarningFlag?: SenWarningFlag | null;
  /** Firestore assessment doc id just saved (for audit trail). */
  latestAssessmentId?: string;
};

async function persistAiLongitudinalSenAlert(
  studentId: string,
  flag: SenWarningFlag,
  latestAssessmentId?: string
): Promise<void> {
  const existing = await getDocs(collection(db, COLLECTION));
  let hasOpen = false;
  existing.forEach((d) => {
    const data = d.data() as SenAlert;
    if (
      data.studentId === studentId &&
      data.status === 'open' &&
      data.ruleId === SEN_RULE_AI_LONGITUDINAL_WARNING_V1
    ) {
      hasOpen = true;
    }
  });
  if (hasOpen) return;

  const student = await getStudent(studentId);
  const orgId = student?.organizationId ?? DEFAULT_ORGANIZATION_ID;
  const summary = `Longitudinal AI screening (${flag.severity}): ${flag.category}. ${flag.reason}`;

  await addDoc(collection(db, COLLECTION), {
    studentId,
    studentName: student?.name ?? 'Learner',
    organizationId: orgId,
    circuitId: student?.circuitId ?? '',
    schoolId: student?.schoolId ?? '',
    status: 'open',
    ruleId: SEN_RULE_AI_LONGITUDINAL_WARNING_V1,
    ruleVersion: SEN_RULE_VERSION,
    summary,
    triggeredByAssessmentIds: latestAssessmentId ? [latestAssessmentId] : [],
    createdAt: Timestamp.now(),
    auditLog: [
      {
        at: Date.now(),
        action: 'created',
        note: 'Model senWarningFlag (medium/high) after assessment save.',
      },
    ],
  });
}

/**
 * After a new assessment is saved, evaluate longitudinal rules and create SEN screening alerts.
 * Idempotent: skips if an open alert already exists for the same rule + student.
 */
export async function evaluateAndPersistSenAlerts(
  studentId: string,
  options?: EvaluateSenAlertsOptions
): Promise<void> {
  try {
    const flag = options?.senWarningFlag;
    if (flag && (flag.severity === 'high' || flag.severity === 'medium')) {
      try {
        await persistAiLongitudinalSenAlert(studentId, flag, options?.latestAssessmentId);
      } catch (err) {
        console.error('persistAiLongitudinalSenAlert', err);
      }
    }

    const history = await getStudentHistory(studentId);
    const numeracy = history
      .filter((a) => a.type === 'Numeracy')
      .sort((a, b) => tsMs(a.timestamp as never) - tsMs(b.timestamp as never));
    const last3 = numeracy.slice(-3);
    if (last3.length < 3) return;
    if (!last3.every(numeracyAssessmentTriggersSenSignal)) return;

    const ids = last3.map((a) => a.id).filter(Boolean) as string[];
    if (ids.length < 3) return;

    const existing = await getDocs(collection(db, COLLECTION));
    let hasOpen = false;
    existing.forEach((d) => {
      const data = d.data() as SenAlert;
      if (
        data.studentId === studentId &&
        data.status === 'open' &&
        data.ruleId === SEN_RULE_NUMERACY_PATTERN_V1
      ) {
        hasOpen = true;
      }
    });
    if (hasOpen) return;

    const student = await getStudent(studentId);
    const orgId = student?.organizationId ?? DEFAULT_ORGANIZATION_ID;

    const summary =
      'Three consecutive numeracy assessments show overlapping educational risk patterns (e.g. number sense / processing). This is a screening signal for coordinator review—not a diagnosis.';

    await addDoc(collection(db, COLLECTION), {
      studentId,
      studentName: student?.name ?? 'Learner',
      organizationId: orgId,
      circuitId: student?.circuitId ?? '',
      schoolId: student?.schoolId ?? '',
      status: 'open',
      ruleId: SEN_RULE_NUMERACY_PATTERN_V1,
      ruleVersion: SEN_RULE_VERSION,
      summary,
      triggeredByAssessmentIds: ids,
      createdAt: Timestamp.now(),
      auditLog: [
        {
          at: Date.now(),
          action: 'created',
          note: 'Rule engine evaluated after assessment save.',
        },
      ],
    });
  } catch (e) {
    console.error('evaluateAndPersistSenAlerts', e);
  }
}

export async function listSenAlertsInJurisdiction(organizationId: string): Promise<SenAlert[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION));
    const list: SenAlert[] = [];
    snap.forEach((d) => {
      const data = d.data() as Record<string, unknown>;
      const rowOrg = data.organizationId as string | undefined;
      if (rowOrg !== organizationId) return;
      list.push({
        id: d.id,
        studentId: data.studentId as string,
        studentName: data.studentName as string | undefined,
        organizationId: data.organizationId as string | undefined,
        circuitId: (data.circuitId as string) || undefined,
        schoolId: (data.schoolId as string) || undefined,
        status: data.status as SenAlert['status'],
        ruleId: data.ruleId as string,
        ruleVersion: data.ruleVersion as string,
        summary: data.summary as string,
        triggeredByAssessmentIds: (data.triggeredByAssessmentIds as string[]) ?? [],
        createdAt: data.createdAt as Timestamp,
        auditLog: (data.auditLog as SenAuditEntry[]) ?? [],
      });
    });
    list.sort((a, b) => tsMs(b.createdAt) - tsMs(a.createdAt));
    return list;
  } catch (e) {
    console.error('listSenAlertsInJurisdiction', e);
    return [];
  }
}

export async function updateSenAlertStatus(
  alertId: string,
  status: SenAlert['status'],
  action: string,
  note?: string,
  actorId?: string
): Promise<void> {
  const ref = doc(db, COLLECTION, alertId);
  const entry: SenAuditEntry = {
    at: Date.now(),
    action,
    note,
    actorId,
  };
  await updateDoc(ref, {
    status,
    auditLog: arrayUnion(entry),
  });
}
