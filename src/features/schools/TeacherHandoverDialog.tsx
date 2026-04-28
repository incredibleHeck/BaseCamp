import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { selectTriggerClass } from '../../utils/ui-helpers';
import { getCohortsForTeacher, reassignTeacherCohorts } from '../../services/cohortService';
import { deleteTeacher, type SchoolTeacherSummary } from '../../services/userService';

export type TeacherHandoverDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  teacher: SchoolTeacherSummary | null;
  /** Campus scope (must match cohorts and staff list). */
  schoolId: string;
  /** Other teachers at the same school (typically excludes `teacher`). */
  otherTeachers: SchoolTeacherSummary[];
  onRemoved: () => void;
};

/**
 * Headteacher offboarding: requires choosing a successor when the teacher has class assignments,
 * runs client-side cohort reassignment, then removes the teacher account via Cloud Function.
 */
export function TeacherHandoverDialog({
  isOpen,
  onClose,
  teacher,
  schoolId,
  otherTeachers,
  onRemoved,
}: TeacherHandoverDialogProps) {
  const [cohortLoading, setCohortLoading] = useState(false);
  const [cohortCount, setCohortCount] = useState<number | null>(null);
  const [successorUid, setSuccessorUid] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !teacher?.id) {
      setCohortCount(null);
      setCohortLoading(false);
      setSuccessorUid('');
      setError(null);
      return;
    }

    let cancelled = false;
    setCohortLoading(true);
    setCohortCount(null);
    setSuccessorUid('');
    void getCohortsForTeacher(teacher.id)
      .then((rows) => {
        if (!cancelled) setCohortCount(rows.length);
      })
      .finally(() => {
        if (!cancelled) setCohortLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, teacher?.id]);

  const handleSubmit = async () => {
    if (!teacher?.id) return;
    const tid = teacher.id.trim();
    if (!tid) return;

    const sid = schoolId.trim();
    if (!sid) {
      setError('Missing school scope.');
      return;
    }

    setError(null);

    if (cohortCount !== null && cohortCount > 0) {
      const succ = successorUid.trim();
      if (!succ) {
        setError('Choose a teacher to take over these classes.');
        return;
      }
      setSubmitting(true);
      try {
        const ok = await reassignTeacherCohorts(tid, succ, sid);
        if (!ok) {
          setError('Could not reassign classes. Check your connection and permissions.');
          setSubmitting(false);
          return;
        }
        await deleteTeacher(tid);
        onRemoved();
        onClose();
      } catch (e) {
        console.error(e);
        setError('Removal failed after reassignment. Refresh and try again if needed.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (cohortCount === null && cohortLoading) {
      return;
    }

    setSubmitting(true);
    try {
      await deleteTeacher(tid);
      onRemoved();
      onClose();
    } catch (e) {
      console.error(e);
      setError('Could not remove teacher.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !teacher) return null;

  const name = teacher.name?.trim() || 'This teacher';
  const needsSuccessor = cohortCount !== null && cohortCount > 0;
  const blocked = cohortLoading || cohortCount === null;
  /** Handover path requires another teacher and a selected successor. */
  const successorIncomplete =
    needsSuccessor && (otherTeachers.length === 0 || !successorUid.trim());

  return (
    <Dialog isOpen={isOpen} onClose={() => !submitting && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Remove teacher</DialogTitle>
          <div className="space-y-2 text-sm text-zinc-500">
            {cohortLoading && (
              <p className="flex items-center gap-2 text-zinc-600">
                <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                Checking class assignments…
              </p>
            )}
            {!cohortLoading && needsSuccessor && (
              <p className="text-zinc-700 dark:text-zinc-300">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{name}</span> is assigned to active
                classes. Who should take over their classes?
              </p>
            )}
            {!cohortLoading && !needsSuccessor && cohortCount !== null && (
              <p>
                Remove <span className="font-semibold text-zinc-900">{name}</span> from your school? Their
                authentication account will be deleted.
              </p>
            )}
          </div>
        </DialogHeader>

        {needsSuccessor && (
          <div className="space-y-1.5 pb-1">
            <label htmlFor="handoverSuccessor" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Assign classes to
            </label>
            <select
              id="handoverSuccessor"
              className={selectTriggerClass + ' w-full'}
              aria-label="Successor teacher"
              disabled={submitting}
              value={successorUid}
              onChange={(e) => setSuccessorUid(e.target.value)}
            >
              <option value="">Select a teacher…</option>
              {otherTeachers.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
            {otherTeachers.length === 0 && (
              <p className="text-xs text-amber-800 dark:text-amber-200/90">
                No other teachers found for this school — add another teacher first, or unassign classes in Manage
                Classes.
              </p>
            )}
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 font-medium dark:text-red-400" role="alert">
            {error}
          </p>
        )}
        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={submitting || blocked || successorIncomplete}
            onClick={() => void handleSubmit()}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                Working…
              </>
            ) : (
              'Remove teacher'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
