/**
 * Canonical domain types for analytics and UI layers.
 * Implementations remain in services; this module is the stable import path for cross-cutting code.
 */

import type { Timestamp } from 'firebase/firestore';
import type { SenWarningFlag } from '../services/ai/aiPrompts/types';

/** First-class class/cohort for grouping students within a school (NoSQL-friendly). */
export interface Cohort {
  id: string;
  schoolId: string;
  name: string;
  gradeLevel: number;
  teacherId?: string;
}

/** Firestore `schools` collection — canonical org metadata for district rollups (source of truth for display names). */
export interface School {
  id: string;
  districtId: string;
  circuitId?: string;
  name: string;
  region?: string;
  academicYearLabel?: string;
  currentTerm?: string;
  updatedAt?: number;
}

export interface Student {
  id?: string;
  name: string;
  grade: string;
  /** Canonical class/cohort (preferred over inferring from grade or classLabel). */
  cohortId?: string;
  /** Denormalized from cohort at write time; preferred by AI over parsing {@link grade} free text. */
  numericGradeLevel?: number;
  /** Phase 3: stable IDs for B2G rollups */
  districtId?: string;
  circuitId?: string;
  schoolId?: string;
  schoolName?: string;
  /** Phase 4: guardian / WhatsApp */
  guardianPhone?: string;
  /** e.g. English, Twi, Ga, Ewe */
  guardianLanguage?: string;
  whatsappOptIn?: boolean;
  /** ms since epoch when guardian consent recorded */
  consentRecordedAt?: number;
  /** Lab / portal login code (teacher-provisioned) */
  portalAccessCode?: string;
  /** Optional: include de-identified rows in fine-tuning pilot export */
  trainingDataOptIn?: boolean;
  /** Explicit denial blocks AI training / fine-tune exports regardless of {@link trainingDataOptIn}. */
  dataProcessingConsent?: boolean;
  enrollmentStatus?: 'active' | 'inactive' | 'graduated';
  primaryLanguage?: string;
  officialSenStatus?: string;
  /** Client-writable ms epoch for offline sync / conflict resolution */
  updatedAt?: number;
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
  /** Optional raw score when persisted separately from `score`. */
  rawScore?: number;
  term?: string;
  academicYear?: string;
  /** Class / stream label for exports (e.g. Primary 6A). */
  classLabel?: string;
  /** Denormalized cohort for queries and rollups (mirrors student’s cohort at write time). */
  cohortId?: string;
  /** Denormalized school for school-scoped queries without student joins. */
  schoolId?: string;
  /** Actor who created the assessment (audit / rollups). */
  createdByUserId?: string;
  /** Client-writable ms epoch for offline sync / conflict resolution */
  updatedAt?: number;
  /** GES curriculum alignment from RAG-assisted diagnosis. */
  gesObjectiveId?: string;
  gesObjectiveTitle?: string;
  gesCurriculumExcerpt?: string;
  /** True when objectiveId was in the retrieved allowlist for this request. */
  gesVerified?: boolean;
  /** Cambridge standard shorthand when persisted (e.g. from diagnostic report). */
  alignedStandardCode?: string;
  /** Model mastery band when persisted (e.g. intervention_needed). */
  masteryLevel?: string;
  /** Phase 3: remedial playbook identity for A/B style analytics */
  playbookKey?: string;
  playbookTitle?: string;
  timestamp: Date | Timestamp | number;
  status: 'Pending' | 'In Progress' | 'Completed';
  /** Model / screening hint persisted for gradebook & longitudinal views (non-clinical). */
  senWarningFlag?: SenWarningFlag | null;
}
