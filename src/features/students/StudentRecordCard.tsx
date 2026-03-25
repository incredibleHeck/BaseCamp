import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getCohortsBySchool } from '../../services/cohortService';
import { updateStudent, type Student } from '../../services/studentService';
import { useAuth } from '../../context/AuthContext';
import type { Cohort } from '../../types/domain';
import {
  STUDENT_PRIMARY_LANGUAGE_OPTIONS,
  STUDENT_SEN_STATUS_OPTIONS,
} from '../../constants/studentLanguages';
import { selectTriggerClass } from '../../utils/ui-helpers';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

interface StudentRecordCardProps {
  studentId: string;
  student: Student;
  canEdit: boolean;
  onUpdated: () => Promise<void>;
}

export function StudentRecordCard({ studentId, student, canEdit, onUpdated }: StudentRecordCardProps) {
  const { user } = useAuth();
  const schoolId = user.schoolId?.trim() ?? '';

  const [name, setName] = useState(student.name);
  const [selectedCohortId, setSelectedCohortId] = useState(student.cohortId ?? '');
  const [primaryLanguage, setPrimaryLanguage] = useState(student.primaryLanguage ?? '');
  const [officialSenStatus, setOfficialSenStatus] = useState(student.officialSenStatus ?? '');
  const [dataProcessingConsent, setDataProcessingConsent] = useState(student.dataProcessingConsent ?? false);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [cohortsLoading, setCohortsLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(student.name);
    setSelectedCohortId(student.cohortId ?? '');
    setPrimaryLanguage(student.primaryLanguage ?? '');
    setOfficialSenStatus(student.officialSenStatus ?? '');
    setDataProcessingConsent(student.dataProcessingConsent ?? false);
  }, [
    student.id,
    student.name,
    student.cohortId,
    student.primaryLanguage,
    student.officialSenStatus,
    student.dataProcessingConsent,
  ]);

  const loadCohorts = () => {
    if (!schoolId) {
      setCohorts([]);
      return;
    }
    setCohortsLoading(true);
    void getCohortsBySchool(schoolId).then((list) => {
      setCohorts(list);
      setCohortsLoading(false);
    });
  };

  useEffect(() => {
    loadCohorts();
  }, [schoolId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    const cohort = cohorts.find((c) => c.id === selectedCohortId);
    if (!name.trim() || !cohort || !primaryLanguage) {
      alert('Name, class, and primary language are required.');
      return;
    }
    setSaving(true);
    try {
      await updateStudent(studentId, {
        name: name.trim(),
        grade: cohort.name,
        cohortId: cohort.id,
        numericGradeLevel: cohort.gradeLevel,
        primaryLanguage,
        ...(officialSenStatus ? { officialSenStatus } : { officialSenStatus: '' }),
        dataProcessingConsent,
      });
      await onUpdated();
    } finally {
      setSaving(false);
    }
  };

  const cohortSelectDisabled = !canEdit || cohortsLoading || !schoolId || cohorts.length === 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/30">
      <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">Learner record</h3>
      <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
        Class placement, language, and SEN flags used for assessments and AI context.
      </p>

      <form onSubmit={handleSave} className="mt-4 space-y-4">
        <div>
          <label htmlFor="recordName" className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
            Full name
          </label>
          <Input
            id="recordName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!canEdit}
            required
          />
        </div>

        <div>
          <label htmlFor="recordCohort" className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
            Class (cohort)
          </label>
          <select
            id="recordCohort"
            className={selectTriggerClass}
            value={selectedCohortId}
            onChange={(e) => setSelectedCohortId(e.target.value)}
            disabled={cohortSelectDisabled}
            required
          >
            <option value="" disabled>
              Select a class…
            </option>
            {cohorts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {!schoolId && (
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">No school on your account; classes cannot load.</p>
          )}
          {schoolId && !cohortsLoading && cohorts.length === 0 && (
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              No classes are assigned to this school yet.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="recordPrimaryLang" className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
            Primary language
          </label>
          <select
            id="recordPrimaryLang"
            className={selectTriggerClass}
            value={primaryLanguage}
            onChange={(e) => setPrimaryLanguage(e.target.value)}
            disabled={!canEdit}
            required
          >
            <option value="" disabled>
              Select…
            </option>
            {STUDENT_PRIMARY_LANGUAGE_OPTIONS.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="recordSen" className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
            SEN status <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <select
            id="recordSen"
            className={selectTriggerClass}
            value={officialSenStatus}
            onChange={(e) => setOfficialSenStatus(e.target.value)}
            disabled={!canEdit}
          >
            {STUDENT_SEN_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value || 'none'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-start gap-3 rounded-md border border-slate-200 bg-white/80 px-3 py-3 dark:border-slate-800 dark:bg-slate-950/40">
          <input
            id="recordDataConsent"
            type="checkbox"
            checked={dataProcessingConsent}
            onChange={(e) => setDataProcessingConsent(e.target.checked)}
            disabled={!canEdit}
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600"
          />
          <label htmlFor="recordDataConsent" className="cursor-pointer text-sm text-gray-700 dark:text-slate-300">
            Data processing consent (anonymized AI analytics)
          </label>
        </div>

        <Button type="submit" disabled={!canEdit || saving || cohortSelectDisabled} className="min-w-[8rem]">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : 'Save record'}
        </Button>
      </form>
    </div>
  );
}
