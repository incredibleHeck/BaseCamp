import React, { useEffect, useMemo, useState } from 'react';

import { Loader2 } from 'lucide-react';

import { createCohort, updateCohort } from '../../services/cohortService';

import { getTeachersBySchool } from '../../services/userService';

import type { Cohort } from '../../types/domain';

import { useAuth } from '../../context/AuthContext';

import { Button } from '../../components/ui/button';

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';

import { Input } from '../../components/ui/input';

import { selectTriggerClass } from '../../utils/ui-helpers';



const GRADE_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);



interface CreateCohortDialogProps {

  isOpen: boolean;

  onClose: () => void;

  schoolId: string;

  /** When set, dialog edits this cohort instead of creating. */

  editingCohort?: Cohort | null;

  /** Called with new Firestore document id after successful create. */

  onCreated: (cohortId: string) => void;

  /** Called after a successful edit save. */

  onUpdated?: () => void;

}



export function CreateCohortDialog({

  isOpen,

  onClose,

  schoolId,

  editingCohort,

  onCreated,

  onUpdated,

}: CreateCohortDialogProps) {

  const { user } = useAuth();

  const [name, setName] = useState('');

  const [gradeLevel, setGradeLevel] = useState(1);

  const [assignedTeacherIds, setAssignedTeacherIds] = useState<string[]>([]);

  const [teachers, setTeachers] = useState<Array<{ id: string; name: string }>>([]);

  const [teachersLoading, setTeachersLoading] = useState(false);

  const [saving, setSaving] = useState(false);



  const allowed = user.role === 'headteacher' || user.role === 'super_admin';



  const isEdit = Boolean(editingCohort?.id);



  useEffect(() => {

    if (!isOpen) {

      setSaving(false);

      setTeachers([]);

      setTeachersLoading(false);

    }

  }, [isOpen]);



  useEffect(() => {

    if (!isOpen) return;



    if (editingCohort?.id) {

      setName(editingCohort.name?.trim() || '');

      const gl =

        typeof editingCohort.gradeLevel === 'number' && Number.isFinite(editingCohort.gradeLevel)

          ? editingCohort.gradeLevel

          : 1;

      setGradeLevel(gl >= 1 && gl <= 12 ? Math.round(gl) : 1);

      setAssignedTeacherIds(

        [...new Set((editingCohort.assignedTeacherIds ?? []).map((x) => (typeof x === 'string' ? x.trim() : '')).filter(Boolean))]

      );

    } else {

      setName('');

      setGradeLevel(1);

      setAssignedTeacherIds([]);

    }

  }, [isOpen, editingCohort]);



  useEffect(() => {

    if (!isOpen || !schoolId.trim()) {

      return;

    }

    let cancelled = false;

    setTeachersLoading(true);

    void getTeachersBySchool(schoolId.trim()).then((rows) => {

      if (!cancelled) {

        setTeachers(rows.map((t) => ({ id: t.id, name: t.name })));

        setTeachersLoading(false);

      }

    });

    return () => {

      cancelled = true;

    };

  }, [isOpen, schoolId]);



  /** School teachers plus synthetic rows for assigned UIDs not in the roster (edit / edge cases). */

  const checkboxTeacherRows = useMemo(() => {

    const rows = teachers.map((t) => ({ id: t.id, name: t.name }));

    const seen = new Set(rows.map((r) => r.id));

    for (const uid of assignedTeacherIds) {

      if (!seen.has(uid)) {

        seen.add(uid);

        rows.push({ id: uid, name: `Teacher (${uid.slice(0, 8)}…)` });

      }

    }

    rows.sort((a, b) =>

      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })

    );

    return rows;

  }, [teachers, assignedTeacherIds]);



  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!allowed) return;



    const trimmed = name.trim();

    if (!trimmed || !schoolId.trim()) {

      alert('Enter a class name.');

      return;

    }

    const sid = schoolId.trim();

    setSaving(true);



    if (editingCohort?.id) {

      console.log('Saving Cohort with Teacher UIDs:', assignedTeacherIds);

      const ok = await updateCohort(editingCohort.id, {

        name: trimmed,

        gradeLevel,

        assignedTeacherIds,

      });

      setSaving(false);

      if (ok) {

        onUpdated?.();

        onClose();

      } else {

        alert('Could not update class. Check console / Firestore rules.');

      }

      return;

    }



    console.log('Saving Cohort with Teacher UIDs:', assignedTeacherIds);

    const id = await createCohort({

      schoolId: sid,

      name: trimmed,

      gradeLevel,

      ...(assignedTeacherIds.length ? { assignedTeacherIds } : {}),

    });

    setSaving(false);

    if (id) {

      onCreated(id);

    } else {

      alert('Could not create class. Check console / Firestore rules.');

    }

  };



  if (!allowed) return null;



  return (

    <Dialog isOpen={isOpen} onClose={onClose}>

      <DialogContent className="sm:max-w-md">

        <DialogHeader>

          <DialogTitle>{isEdit ? 'Edit class (cohort)' : 'Create class (cohort)'}</DialogTitle>

        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>

            <label htmlFor="cohortName" className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">

              Class name

            </label>

            <Input

              id="cohortName"

              value={name}

              onChange={(e) => setName(e.target.value)}

              placeholder="e.g., Primary 6A"

              required

              autoComplete="off"

            />

          </div>

          <div>

            <label htmlFor="cohortGrade" className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">

              Grade level (1–12)

            </label>

            <select

              id="cohortGrade"

              className={selectTriggerClass}

              value={gradeLevel}

              onChange={(e) => setGradeLevel(Number(e.target.value))}

            >

              {GRADE_OPTIONS.map((g) => (

                <option key={g} value={g}>

                  {g}

                </option>

              ))}

            </select>

          </div>

          <fieldset className="space-y-2">

            <legend className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">

              Assigned teachers (optional)

            </legend>

            {teachersLoading ? (

              <p className="text-sm text-slate-500 dark:text-slate-400">Loading teachers…</p>

            ) : checkboxTeacherRows.length === 0 ? (

              <p className="text-sm text-slate-500 dark:text-slate-400">

                No teachers listed — you can assign co-teachers later from Manage Classes.

              </p>

            ) : (

              <div className="max-h-44 space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950/40">

                {checkboxTeacherRows.map((t) => (

                  <label key={t.id} className="flex cursor-pointer items-start gap-2 py-1 text-sm">

                    <input

                      type="checkbox"

                      className="mt-0.5 h-4 w-4 rounded border-slate-300"

                      checked={assignedTeacherIds.includes(t.id)}

                      disabled={!schoolId.trim()}

                      onChange={(e) => {

                        const teacherUid = t.id;

                        setAssignedTeacherIds((prev) => {

                          if (e.target.checked) return [...new Set([...prev, teacherUid])];

                          return prev.filter((id) => id !== teacherUid);

                        });

                      }}

                    />

                    <span>{t.name}</span>

                  </label>

                ))}

              </div>

            )}

          </fieldset>

          <DialogFooter className="gap-2 sm:gap-0">

            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>

              Cancel

            </Button>

            <Button type="submit" disabled={saving || !schoolId.trim()} className="min-w-[7rem]">

              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : isEdit ? 'Save' : 'Create'}

            </Button>

          </DialogFooter>

        </form>

      </DialogContent>

    </Dialog>

  );

}


