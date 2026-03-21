import { useState, useEffect } from 'react';
import { getStudentHistory, type Assessment } from '../services/assessmentService';
import { getStudent, getStudents, type Student as StudentModel } from '../services/studentService';
import type { WorksheetResult } from '../services/aiPrompts';
import {
  calculateTrajectory,
  getReadinessDetails,
  timestampToMs,
  FALLBACK_HISTORICAL_DATA,
  type Readiness,
} from '../utils/studentProfileHelpers';

export interface GapInterventionEntry {
  assessment: Assessment;
  gaps: string[];
}

export function useStudentProfileData(initialStudentId?: string) {
  const [students, setStudents] = useState<StudentModel[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>(initialStudentId);
  const [history, setHistory] = useState<Assessment[]>([]);
  const [studentInfo, setStudentInfo] = useState<StudentModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [lastWorksheetByCard, setLastWorksheetByCard] = useState<
    Record<string, { gap: string; data: WorksheetResult }>
  >({});

  useEffect(() => {
    const load = async () => {
      setStudentsLoading(true);
      const list = await getStudents();
      setStudents(list);
      setStudentsLoading(false);
      if (list.length > 0 && !selectedStudentId) setSelectedStudentId(list[0].id);
    };
    load();
  }, []);

  useEffect(() => {
    if (initialStudentId) setSelectedStudentId(initialStudentId);
  }, [initialStudentId]);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedStudentId) {
        setStudentInfo(null);
        setHistory([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const [studentData, historyData] = await Promise.all([
          getStudent(selectedStudentId),
          getStudentHistory(selectedStudentId),
        ]);
        setStudentInfo(studentData);
        setHistory(historyData);
      } catch (error) {
        console.error('Failed to fetch student data', error);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [selectedStudentId]);

  useEffect(() => {
    const next: Record<string, { gap: string; data: WorksheetResult }> = {};
    history.forEach((a) => {
      if (!a.worksheet || !a.gapTags?.length) return;
      const key = `${a.gapTags.join('|')}-${a.type}`;
      next[key] = { gap: a.gapTags.join(', '), data: a.worksheet };
    });
    setLastWorksheetByCard(next);
  }, [history]);

  const hasRealData = history.length > 0;
  const realReadinessScore = Math.min(100, 50 + history.length * 5);
  const numeracyScores = FALLBACK_HISTORICAL_DATA.map((d) => d.numeracy);
  const numeracyTrajectory = calculateTrajectory(numeracyScores);
  const numeracyReadiness: Readiness = getReadinessDetails(
    numeracyScores[numeracyScores.length - 1],
    numeracyTrajectory
  );
  const literacyScores = FALLBACK_HISTORICAL_DATA.map((d) => d.literacy);
  const literacyTrajectory = calculateTrajectory(literacyScores);
  const literacyReadiness: Readiness = getReadinessDetails(
    literacyScores[literacyScores.length - 1],
    literacyTrajectory
  );
  const isHighRisk = numeracyReadiness.level === 'Low' || literacyReadiness.level === 'Low';
  const recentGaps = Array.from(new Set(history.flatMap((a) => a.gapTags || [])));
  const recentMastery = Array.from(new Set(history.flatMap((a) => a.masteryTags || [])));

  const gapInterventions: GapInterventionEntry[] = history
    .reduce<GapInterventionEntry[]>((acc, assessment) => {
      const tags = (assessment.gapTags || []).filter((t) => t && t.trim());
      if (!tags.length) return acc;
      const key = assessment.id || `${timestampToMs(assessment.timestamp)}-${assessment.type}`;
      const existing = acc.find(
        (entry) =>
          entry.assessment.id === assessment.id ||
          `${timestampToMs(entry.assessment.timestamp)}-${entry.assessment.type}` === key
      );
      if (existing) {
        const existingSet = new Set(existing.gaps.map((g) => g.toLowerCase()));
        tags.forEach((tag) => {
          if (!existingSet.has(tag.toLowerCase())) existing.gaps.push(tag);
        });
        return acc;
      }
      acc.push({ assessment, gaps: Array.from(new Set(tags)) });
      return acc;
    }, [])
    .sort((a, b) => timestampToMs(b.assessment.timestamp) - timestampToMs(a.assessment.timestamp));

  const predictiveReadinessSummary = `Predictive JHS Readiness — Numeracy: ${numeracyReadiness.level}, Literacy: ${literacyReadiness.level}`;

  return {
    students,
    selectedStudentId,
    setSelectedStudentId,
    studentInfo,
    setStudentInfo,
    history,
    setHistory,
    isLoading,
    studentsLoading,
    lastWorksheetByCard,
    setLastWorksheetByCard,
    hasRealData,
    realReadinessScore,
    fallbackHistoricalData: FALLBACK_HISTORICAL_DATA,
    numeracyScores,
    literacyScores,
    numeracyTrajectory,
    literacyTrajectory,
    numeracyReadiness,
    literacyReadiness,
    isHighRisk,
    recentGaps,
    recentMastery,
    gapInterventions,
    predictiveReadinessSummary,
  };
}
