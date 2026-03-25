import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Loader2, Plus } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { getCohortsBySchool, setCohortTeacherId } from '../services/cohortService';
import { getTeachersBySchool, type SchoolTeacherSummary } from '../services/userService';
import type { Cohort } from '../types/domain';
import { selectTriggerClass } from '../utils/ui-helpers';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { CreateCohortDialog } from './CreateCohortDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

function canAccessCohortManager(role: string): boolean {
  return role === 'headteacher' || role === 'super_admin';
}

export function CohortManager() {
  const { user } = useAuth();
  const schoolId = user.schoolId?.trim() ?? '';

  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [teachers, setTeachers] = useState<SchoolTeacherSummary[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [savingAssignmentCohortId, setSavingAssignmentCohortId] = useState<string | null>(null);
  const [savedAssignmentCohortId, setSavedAssignmentCohortId] = useState<string | null>(null);
  const savedAssignmentClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const allowed = canAccessCohortManager(user.role);

  const refreshList = useCallback(async () => {
    if (!schoolId) {
      setCohorts([]);
      return;
    }
    setListLoading(true);
    try {
      const rows = await getCohortsBySchool(schoolId);
      setCohorts(rows);
    } finally {
      setListLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    if (!allowed || !schoolId) {
      setCohorts([]);
      return;
    }
    void refreshList();
  }, [allowed, schoolId, refreshList]);

  const refreshTeachers = useCallback(async () => {
    if (!schoolId) {
      setTeachers([]);
      return;
    }
    setTeachersLoading(true);
    try {
      const rows = await getTeachersBySchool(schoolId);
      setTeachers(rows);
    } finally {
      setTeachersLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    if (!allowed || !schoolId) {
      setTeachers([]);
      return;
    }
    void refreshTeachers();
  }, [allowed, schoolId, refreshTeachers]);

  useEffect(() => {
    return () => {
      if (savedAssignmentClearRef.current) {
        clearTimeout(savedAssignmentClearRef.current);
        savedAssignmentClearRef.current = null;
      }
    };
  }, []);

  const showSavedCue = useCallback((cohortId: string) => {
    if (savedAssignmentClearRef.current) {
      clearTimeout(savedAssignmentClearRef.current);
    }
    setSavedAssignmentCohortId(cohortId);
    savedAssignmentClearRef.current = setTimeout(() => {
      setSavedAssignmentCohortId(null);
      savedAssignmentClearRef.current = null;
    }, 2200);
  }, []);

  const handleAssignedTeacherChange = async (cohort: Cohort, nextTeacherId: string) => {
    const next = nextTeacherId.trim();
    const prev = cohort.teacherId?.trim() ?? '';
    if (next === prev) return;

    setSavingAssignmentCohortId(cohort.id);
    const ok = await setCohortTeacherId(cohort.id, next || null);
    setSavingAssignmentCohortId(null);

    if (ok) {
      setCohorts((rows) =>
        rows.map((row) =>
          row.id === cohort.id ? { ...row, teacherId: next || undefined } : row
        )
      );
      showSavedCue(cohort.id);
    } else {
      alert('Could not update teacher assignment. Check your connection and Firestore rules.');
    }
  };

  const teacherOptionsForCohort = useCallback(
    (cohort: Cohort): SchoolTeacherSummary[] => {
      const list = [...teachers];
      const tid = cohort.teacherId?.trim();
      if (tid && !list.some((t) => t.id === tid)) {
        list.push({ id: tid, name: `Teacher (${tid.slice(0, 8)}…)` });
      }
      return list;
    },
    [teachers]
  );

  if (!allowed) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Access restricted</CardTitle>
            <CardDescription>
              Only headteachers and super admins can create and manage school classes.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const scopeMissing = !schoolId;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-6">
      <CreateCohortDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        schoolId={schoolId}
        onCreated={() => {
          setCreateDialogOpen(false);
          void refreshList();
        }}
      />

      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            School classes
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Create cohorts for your school, then assign a teacher to each class.
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          disabled={scopeMissing}
          className="shrink-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add a class
        </Button>
      </header>

      {scopeMissing && (
        <p
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100"
        >
          Your profile does not include a <span className="font-mono">schoolId</span>. Add one to your user record in
          Firestore, then reload — class creation and the list below need a school scope.
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Classes at this school</CardTitle>
          <CardDescription>
            {listLoading ? 'Loading…' : `${cohorts.length} class${cohorts.length === 1 ? '' : 'es'}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {listLoading ? (
            <div
              className="h-32 animate-pulse rounded-lg border border-slate-200/80 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
              role="status"
              aria-label="Loading classes"
            />
          ) : cohorts.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {scopeMissing
                ? 'No school scope — add a school ID to see or create classes.'
                : 'No classes yet. Use the button above to add your first class.'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class name</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead className="min-w-[14rem]">Assigned teacher</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cohorts.map((c) => {
                  const rowTeachers = teacherOptionsForCohort(c);
                  const assigning = savingAssignmentCohortId === c.id;
                  const showSaved = savedAssignmentCohortId === c.id;
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.gradeLevel}</TableCell>
                      <TableCell>
                        <div className="flex min-w-0 items-center gap-2">
                          <select
                            className={`${selectTriggerClass} min-w-[11rem] max-w-[16rem] flex-1`}
                            aria-label={`Assigned teacher for ${c.name}`}
                            value={c.teacherId ?? ''}
                            disabled={teachersLoading || assigning}
                            onChange={(ev) => void handleAssignedTeacherChange(c, ev.target.value)}
                          >
                            <option value="">
                              {teachersLoading ? 'Loading teachers…' : 'Unassigned'}
                            </option>
                            {rowTeachers.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                          {assigning && (
                            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-slate-500" aria-hidden />
                          )}
                          {showSaved && !assigning && (
                            <span
                              className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                              role="status"
                            >
                              <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                              Saved
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
