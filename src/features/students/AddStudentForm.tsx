import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { addStudent, Student } from '../../services/studentService';
import { getCohortsForTeacher } from '../../services/cohortService';
import { useAuth } from '../../context/AuthContext';
import type { Cohort } from '../../types/domain';
import {
  STUDENT_PRIMARY_LANGUAGE_OPTIONS,
  STUDENT_SEN_STATUS_OPTIONS,
} from '../../constants/studentLanguages';
import { selectTriggerClass } from '../../utils/ui-helpers';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';

interface AddStudentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentAdded: (newStudent: Student) => void;
  preselectedCohortId?: string;
}

export function AddStudentForm({ isOpen, onClose, onStudentAdded, preselectedCohortId }: AddStudentFormProps) {
  const { user } = useAuth();
  const schoolId = user.schoolId;

  const [name, setName] = useState('');
  const [selectedCohortId, setSelectedCohortId] = useState(preselectedCohortId || '');
  const [primaryLanguage, setPrimaryLanguage] = useState('');
  const [officialSenStatus, setOfficialSenStatus] = useState('');
  const [dataProcessingConsent, setDataProcessingConsent] = useState(true);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [cohortsLoading, setCohortsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setSelectedCohortId(preselectedCohortId || '');
      setPrimaryLanguage('');
      setOfficialSenStatus('');
      setDataProcessingConsent(true);
      setCohorts([]);
      setCohortsLoading(false);
      setIsSaving(false);
      return;
    }

    // Update selected cohort if preselected changes while open (edge case)
    if (preselectedCohortId) {
      setSelectedCohortId(preselectedCohortId);
    }

    if (user.role !== 'teacher') {
      setCohorts([]);
      setCohortsLoading(false);
      return;
    }

    const tid = user.id?.trim();
    if (!tid) {
      setCohorts([]);
      setCohortsLoading(false);
      return;
    }

    let cancelled = false;
    setCohortsLoading(true);
    getCohortsForTeacher(tid)
      .then((list) => {
        if (!cancelled) {
          setCohorts(list);
          setCohortsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setCohortsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, user.id, user.role, preselectedCohortId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cohort = cohorts.find((c) => c.id === selectedCohortId);
    const sid = schoolId?.trim();
    if (!name.trim() || !cohort || !primaryLanguage) {
      alert('Please fill out all required fields (name, class, primary language).');
      return;
    }
    if (!sid) {
      alert(
        'Your account is missing a school assignment (schoolId). Ask your administrator to link your profile to your campus before adding students.'
      );
      return;
    }

    setIsSaving(true);
    const newStudent: Omit<Student, 'id'> = {
      name: name.trim(),
      grade: cohort.name,
      cohortId: cohort.id,
      schoolId: sid,
      numericGradeLevel: cohort.gradeLevel,
      primaryLanguage,
      ...(officialSenStatus ? { officialSenStatus } : {}),
      dataProcessingConsent,
    };
    const newId = await addStudent(newStudent);

    setIsSaving(false);
    if (newId) {
      onStudentAdded({ id: newId, ...newStudent });
    } else {
      alert('Failed to add student. Please try again.');
    }
  };

  const cohortSelectDisabled = cohortsLoading || !user.id?.trim() || cohorts.length === 0;

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="studentName" className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Full Name
            </label>
            <Input
              id="studentName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Adjoa Mensah"
              required
              autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="studentCohort" className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Class (cohort)
            </label>
            <select
              id="studentCohort"
              className={selectTriggerClass}
              value={selectedCohortId}
              onChange={(e) => setSelectedCohortId(e.target.value)}
              disabled={cohortSelectDisabled || !!preselectedCohortId}
              required
              aria-busy={cohortsLoading}
            >
              <option value="" disabled>
                Select a Class...
              </option>
              {cohorts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {!user.id?.trim() && (
              <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                You must be signed in to load your assigned classes.
              </p>
            )}
            {user.id?.trim() && !cohortsLoading && cohorts.length === 0 && (
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                You have not been assigned any classes. Please contact your Headteacher.
              </p>
            )}
          </div>
          <div>
            <label htmlFor="primaryLanguage" className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Primary language
            </label>
            <select
              id="primaryLanguage"
              className={selectTriggerClass}
              value={primaryLanguage}
              onChange={(e) => setPrimaryLanguage(e.target.value)}
              required
            >
              <option value="" disabled>
                Select language...
              </option>
              {STUDENT_PRIMARY_LANGUAGE_OPTIONS.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="officialSenStatus" className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              SEN status <span className="font-normal text-slate-500 dark:text-slate-400">(optional)</span>
            </label>
            <select
              id="officialSenStatus"
              className={selectTriggerClass}
              value={officialSenStatus}
              onChange={(e) => setOfficialSenStatus(e.target.value)}
            >
              {STUDENT_SEN_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value || 'none'} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50/80 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/40">
            <input
              id="dataProcessingConsent"
              type="checkbox"
              checked={dataProcessingConsent}
              onChange={(e) => setDataProcessingConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-slate-600 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus:ring-indigo-400"
            />
            <div className="min-w-0">
              <label htmlFor="dataProcessingConsent" className="cursor-pointer text-sm font-medium text-gray-700 dark:text-slate-300">
                Data Processing Consent
              </label>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Allow data to be used for anonymized AI analytics.
              </p>
            </div>
          </div>
          <DialogFooter className="mt-2 sm:mt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" variant="default" disabled={isSaving} className="min-w-[7.5rem]">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : 'Save Student'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
