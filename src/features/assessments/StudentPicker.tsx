import React from 'react';
import type { Student } from '../../services/studentService';
import type { Cohort } from '../../types/domain';
import { selectTriggerClass } from '../../utils/ui-helpers';
import { ASSESSMENT_TRANSLANGUAGING_LANGUAGES } from '../../constants/studentLanguages';

const ASSESSMENT_DIALECT_OPTIONS = ASSESSMENT_TRANSLANGUAGING_LANGUAGES;

interface StudentPickerProps {
  inputMode: 'upload' | 'manual' | 'voice';
  uploadScope: 'single' | 'batch';
  students: Student[];
  selectedStudent: string;
  onStudentSelect: (id: string) => void;
  cohorts: Cohort[];
  cohortsLoading: boolean;
  selectedCohortId: string;
  onCohortSelect: (id: string) => void;
  schoolId?: string;
  isLocalDialect: boolean;
  onIsLocalDialectChange: (checked: boolean) => void;
  selectedDialect: string;
  onDialectSelect: (dialect: string) => void;
}

export function StudentPicker({
  inputMode,
  uploadScope,
  students,
  selectedStudent,
  onStudentSelect,
  cohorts,
  cohortsLoading,
  selectedCohortId,
  onCohortSelect,
  schoolId,
  isLocalDialect,
  onIsLocalDialectChange,
  selectedDialect,
  onDialectSelect,
}: StudentPickerProps) {
  return (
    <div>
      {!(inputMode === 'upload' && uploadScope === 'batch') && (
        <>
          <label htmlFor="student" className="block text-sm font-medium text-gray-700 mb-1">
            Select Student
          </label>
          <select
            id="student"
            required
            value={selectedStudent}
            onChange={(e) => onStudentSelect(e.target.value)}
            className={selectTriggerClass}
          >
            <option value="" disabled>
              Select a student...
            </option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} ({student.grade})
              </option>
            ))}
          </select>
        </>
      )}

      <div className="mt-3">
        <label htmlFor="cohort" className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
          Class (cohort)
        </label>
        <select
          id="cohort"
          required
          value={selectedCohortId}
          onChange={(e) => onCohortSelect(e.target.value)}
          disabled={!schoolId || cohortsLoading}
          className={selectTriggerClass}
        >
          <option value="" disabled>
            Select a Class...
          </option>
          {cohorts.map((cohort) => (
            <option key={cohort.id} value={cohort.id}>
              {cohort.name}
            </option>
          ))}
        </select>
        {!schoolId && (
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-300/90">
            Your account is not linked to a school. Cohorts load from your school profile.
          </p>
        )}
        {schoolId && !cohortsLoading && cohorts.length === 0 && (
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            No cohorts found for this school. Add documents to the Firestore <span className="font-mono">cohorts</span>{' '}
            collection (with <span className="font-mono">schoolId</span>) to enable class selection.
          </p>
        )}
      </div>

      <div className="mt-3">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              checked={isLocalDialect}
              onChange={(e) => onIsLocalDialectChange(e.target.checked)}
              className="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500 mt-1"
            />
          </div>
          <div className="text-sm">
            <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
              Student primarily speaks a local dialect at home
            </span>
            <p className="text-xs text-amber-500/80 italic mt-0.5">
              Provides context to the AI to distinguish between cognitive literacy gaps and ESL translation errors.
            </p>
          </div>
        </label>

        {isLocalDialect && (
          <div className="mt-2 ml-7 animate-in fade-in slide-in-from-top-2">
            <select
              value={selectedDialect}
              onChange={(e) => onDialectSelect(e.target.value)}
              required={isLocalDialect}
              className={selectTriggerClass}
            >
              <option value="" disabled>
                Specify dialect...
              </option>
              {ASSESSMENT_DIALECT_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}