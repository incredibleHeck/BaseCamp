import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Download, Loader2, MoreVertical, UserCircle } from 'lucide-react';
import { getStudentsBySchool, updateStudentCohortPlacement, type Student } from '../../services/studentService';
import { getCohortsForCampus } from '../../services/cohortService';
import { getTeachersBySchool } from '../../services/userService';
import { getSchoolById } from '../../services/schoolService';
import type { Cohort } from '../../types/domain';
import type { UserData } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Input } from '../../components/ui/input';
import { selectTriggerClass } from '../../utils/ui-helpers';
import { PageHero } from '../../components/page-shell/PageHero';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { downloadCampusRosterCSV } from '../../utils/csvExport';

function isUnassignedStudent(s: Student, cohortById: Map<string, Cohort>): boolean {
  const cid = typeof s.cohortId === 'string' ? s.cohortId.trim() : '';
  const ct = typeof s.cohortTeacherId === 'string' ? s.cohortTeacherId.trim() : '';
  if (!cid) return true;
  if (!ct) return true;
  if (!cohortById.has(cid)) return true;
  return false;
}

function primaryTeacherLabel(
  s: Student,
  cohortById: Map<string, Cohort>,
  teacherNameById: Map<string, string>
): string {
  const cid = typeof s.cohortId === 'string' ? s.cohortId.trim() : '';
  const cohort = cid ? cohortById.get(cid) : undefined;
  const fromList = cohort?.assignedTeacherIds?.find((id) => typeof id === 'string' && id.trim());
  const tid = (fromList ?? '').trim() || (typeof s.cohortTeacherId === 'string' ? s.cohortTeacherId.trim() : '');
  if (!tid) return '—';
  return teacherNameById.get(tid) ?? tid;
}

export type CampusStudentRegistryProps = {
  user: UserData;
  onViewProfile: (studentId: string) => void;
};

export function CampusStudentRegistry({ user, onViewProfile }: CampusStudentRegistryProps) {
  const schoolId = user.schoolId?.trim() ?? '';
  const [students, setStudents] = useState<Student[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [teachers, setTeachers] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [campusSchoolLabel, setCampusSchoolLabel] = useState('');
  const [exportingCsv, setExportingCsv] = useState(false);
  const [menuOpenForId, setMenuOpenForId] = useState<string | null>(null);
  const menuWrapRef = useRef<HTMLDivElement | null>(null);

  const [assignStudent, setAssignStudent] = useState<Student | null>(null);
  const [assignCohortId, setAssignCohortId] = useState('');

  const load = useCallback(async () => {
    if (!schoolId) {
      setStudents([]);
      setCohorts([]);
      setTeachers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [stu, coh, tch] = await Promise.all([
        getStudentsBySchool(schoolId),
        getCohortsForCampus(schoolId),
        getTeachersBySchool(schoolId),
      ]);
      setStudents(stu);
      setCohorts(coh);
      setTeachers(tch.map((t) => ({ id: t.id, name: t.name })));
    } catch (e) {
      console.error(e);
      setError('Could not load campus registry.');
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    if (!schoolId) {
      setCampusSchoolLabel('');
      return;
    }
    let cancelled = false;
    void getSchoolById(schoolId).then((doc) => {
      if (!cancelled) setCampusSchoolLabel(doc?.name?.trim() || schoolId);
    });
    return () => {
      cancelled = true;
    };
  }, [schoolId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!menuOpenForId) return;
    const onDoc = (e: MouseEvent) => {
      const el = menuWrapRef.current;
      if (el && !el.contains(e.target as Node)) setMenuOpenForId(null);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menuOpenForId]);

  const cohortById = useMemo(() => new Map(cohorts.map((c) => [c.id, c] as const)), [cohorts]);
  const teacherNameById = useMemo(() => new Map(teachers.map((t) => [t.id, t.name])), [teachers]);

  const handleExportCsv = useCallback(() => {
    if (!schoolId) return;
    setExportingCsv(true);
    try {
      const label = campusSchoolLabel || schoolId || 'School';
      downloadCampusRosterCSV(students, cohorts, label, teacherNameById);
    } finally {
      setExportingCsv(false);
    }
  }, [schoolId, campusSchoolLabel, students, cohorts, teacherNameById]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => (s.name ?? '').toLowerCase().includes(q));
  }, [students, search]);

  const unassignedCount = useMemo(
    () => students.filter((s) => isUnassignedStudent(s, cohortById)).length,
    [students, cohortById]
  );

  const openAssignModal = (s: Student) => {
    setMenuOpenForId(null);
    setAssignStudent(s);
    const cid = typeof s.cohortId === 'string' ? s.cohortId.trim() : '';
    setAssignCohortId(cid && cohortById.has(cid) ? cid : '');
  };

  const handleAssignSave = async () => {
    if (!assignStudent?.id) return;
    const sid = assignStudent.id;
    if (!assignCohortId.trim()) {
      setSavingId(sid);
      try {
        await updateStudentCohortPlacement(sid, null);
        setAssignStudent(null);
        await load();
      } catch {
        alert('Could not clear class assignment.');
      } finally {
        setSavingId(null);
      }
      return;
    }
    const cohort = cohortById.get(assignCohortId.trim());
    if (!cohort) return;
    setSavingId(sid);
    try {
      await updateStudentCohortPlacement(sid, cohort);
      setAssignStudent(null);
      await load();
    } catch {
      alert('Could not assign class. Check Firestore rules and connectivity.');
    } finally {
      setSavingId(null);
    }
  };

  useEffect(() => {
    if (assignStudent) {
      const cid = typeof assignStudent.cohortId === 'string' ? assignStudent.cohortId.trim() : '';
      setAssignCohortId(cid && cohortById.has(cid) ? cid : '');
    } else {
      setAssignCohortId('');
    }
  }, [assignStudent, cohortById]);

  if (!schoolId) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
        Assign a campus <span className="font-mono">schoolId</span> to your profile to use the Student Registry.
      </p>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <PageHero
        title="Campus Student Registry"
        description={
          <>
            All enrollments on your campus. Students missing class or primary teacher linkage are labeled{' '}
            <span className="font-medium">Unassigned</span> ({unassignedCount}).
          </>
        }
      />

      {error && (
        <p className="text-sm text-red-700 dark:text-red-300" role="alert">
          {error}
        </p>
      )}

      <Dialog isOpen={assignStudent != null} onClose={() => !savingId && setAssignStudent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign to class</DialogTitle>
            <p className="text-sm text-zinc-500">
              {assignStudent ? (
                <>
                  Choose a cohort for <span className="font-medium text-zinc-800">{assignStudent.name}</span>.
                </>
              ) : null}
            </p>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <label htmlFor="assignCohort" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Cohort / class
            </label>
            <select
              id="assignCohort"
              className={selectTriggerClass + ' w-full'}
              value={assignCohortId}
              disabled={Boolean(savingId)}
              onChange={(e) => setAssignCohortId(e.target.value)}
            >
              <option value="">Clear assignment (unassigned)</option>
              {cohorts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (Grade {c.gradeLevel})
                </option>
              ))}
            </select>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setAssignStudent(null)} disabled={Boolean(savingId)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleAssignSave()} disabled={Boolean(savingId)}>
              {savingId ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle>{students.length} learners</CardTitle>
            <CardDescription>Search by name; use the row menu to assign a class or open a profile.</CardDescription>
          </div>
          <div className="flex w-full flex-col gap-2 sm:max-w-xl sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading || exportingCsv || !schoolId}
              aria-busy={exportingCsv}
              onClick={() => void handleExportCsv()}
              className="shrink-0"
            >
              {exportingCsv ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Download className="mr-2 h-4 w-4 shrink-0" aria-hidden />
              )}
              Export Roster (CSV)
            </Button>
            <Input
              placeholder="Search name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Filter by student name"
              className="w-full min-w-0 sm:max-w-[12rem]"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-14">
              <Loader2 className="h-10 w-10 animate-spin text-zinc-400" aria-hidden />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Cohort / class</TableHead>
                  <TableHead>Primary teacher</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[3.5rem] text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-zinc-500">
                      No students match your filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((s) => {
                    const id = s.id ?? '';
                    const unassigned = isUnassignedStudent(s, cohortById);
                    const cid = typeof s.cohortId === 'string' ? s.cohortId.trim() : '';
                    const cohort = cid ? cohortById.get(cid) : undefined;
                    const classLabel =
                      cid && cohort ? cohort.name : cid ? '(Unknown cohort)' : '—';
                    const primary = primaryTeacherLabel(s, cohortById, teacherNameById);
                    const busy = savingId === id;
                    const menuOpen = menuOpenForId === id;

                    return (
                      <TableRow key={id || s.name}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell className="text-zinc-600">{s.grade ?? '—'}</TableCell>
                        <TableCell className="max-w-[11rem] truncate text-zinc-700" title={classLabel}>
                          {classLabel}
                        </TableCell>
                        <TableCell className="max-w-[10rem] truncate text-zinc-700" title={primary}>
                          {primary}
                        </TableCell>
                        <TableCell>
                          {unassigned ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-950 dark:bg-amber-950/70 dark:text-amber-100">
                              Unassigned
                            </span>
                          ) : (
                            <span className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200">
                              OK
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div
                            className="relative inline-flex justify-end"
                            ref={menuOpen ? menuWrapRef : undefined}
                          >
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              aria-label={`Actions for ${s.name}`}
                              aria-expanded={menuOpen}
                              disabled={busy || !id}
                              onClick={() => setMenuOpenForId(menuOpen ? null : id)}
                            >
                              {busy ? (
                                <Loader2 className="h-4 w-4 animate-spin text-zinc-400" aria-hidden />
                              ) : (
                                <MoreVertical className="h-4 w-4 shrink-0" aria-hidden />
                              )}
                            </Button>
                            {menuOpen && (
                              <div
                                role="menu"
                                className="absolute right-0 top-full z-50 mt-1 min-w-[12rem] rounded-lg border border-zinc-200 bg-white py-1 text-left text-sm shadow-lg dark:border-zinc-700 dark:bg-zinc-950"
                              >
                                <button
                                  type="button"
                                  role="menuitem"
                                  className="flex w-full px-3 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900"
                                  onClick={() => openAssignModal(s)}
                                >
                                  Assign to class
                                </button>
                                <button
                                  type="button"
                                  role="menuitem"
                                  className="flex w-full px-3 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900"
                                  onClick={() => {
                                    setMenuOpenForId(null);
                                    onViewProfile(id);
                                  }}
                                >
                                  <UserCircle className="mr-2 inline h-4 w-4 opacity-70" aria-hidden />
                                  View profile
                                </button>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
