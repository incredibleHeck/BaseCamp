import React, { useState, useEffect } from 'react';
import {
  Search,
  UserPlus,
  Users,
  FileText,
  FileSpreadsheet,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Loader2,
  Filter,
} from 'lucide-react';
import { getStudents, Student } from '../../services/studentService';
import { getAssessmentSummaryByStudent } from '../../services/assessmentService';
import { exportClassGradebookCsv } from '../../services/gradebookExport';
import { getCohortsBySchool, getCohortsByTeacher } from '../../services/cohortService';
import type { Cohort } from '../../types/domain';
import { useAuth } from '../../context/AuthContext';
import { AddStudentForm } from './AddStudentForm';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Skeleton } from '../../components/ui/skeleton';

function formatLastAssessment(lastDateMs: number): string {
  const now = Date.now();
  const diffDays = Math.floor((now - lastDateMs) / (24 * 60 * 60 * 1000));
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
}

function diagnosisToShortGap(diagnosis: string | null): string | null {
  if (!diagnosis || diagnosis.length < 3) return null;
  const maxLen = 40;
  return diagnosis.length <= maxLen ? diagnosis : diagnosis.slice(0, maxLen).trim() + '…';
}

function calculateReadinessScoreFromAssessmentCount(count: number): number {
  // Keep this consistent with StudentProfile's demo formula:
  // starts at 50, +5 per completed assessment, capped at 100.
  return Math.min(100, 50 + count * 5);
}

export interface StudentListItem {
  id: string;
  name: string;
  readinessScore: number;
  lastAssessmentDate: string;
  criticalGap: string | null;
  cohortId?: string;
}

interface ClassRosterProps {
  className?: string;
  onViewProfile: (studentId: string) => void;
  onNewAssessment: (studentId: string) => void;
}

export function ClassRoster({ 
  className = "Primary 6A",
  onViewProfile,
  onNewAssessment
}: ClassRosterProps) {
  const { user } = useAuth();
  const schoolId = user.schoolId?.trim() ?? '';
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportGradebook = async () => {
    setIsExporting(true);
    try {
      const ok = await exportClassGradebookCsv(className);
      if (!ok) {
        alert('Could not export gradebook. Check your connection and try again.');
      }
    } catch (e) {
      console.error(e);
      alert('Could not export gradebook. Check your connection and try again.');
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const fetchStudentsAndCohorts = async () => {
      setIsLoading(true);
      
      // Fetch cohorts if headteacher or teacher
      if (user.role === 'headteacher' && schoolId) {
        const fetchedCohorts = await getCohortsBySchool(schoolId);
        setCohorts(fetchedCohorts);
      } else if (user.role === 'teacher') {
        const fetchedCohorts = await getCohortsByTeacher(user.id);
        setCohorts(fetchedCohorts);
        if (fetchedCohorts.length > 0 && selectedCohortId === 'all') {
          setSelectedCohortId(fetchedCohorts[0].id);
        }
      }

      const [fetchedStudents, summaryMap] = await Promise.all([
        getStudents(),
        getAssessmentSummaryByStudent(),
      ]);
      const studentListItems = fetchedStudents.map((s) => {
        const id = s.id!;
        const summary = summaryMap.get(id);
        if (summary) {
          const readinessScore = calculateReadinessScoreFromAssessmentCount(summary.count);
          return {
            id,
            name: s.name,
            readinessScore,
            lastAssessmentDate: formatLastAssessment(summary.lastDate),
            criticalGap: diagnosisToShortGap(summary.lastDiagnosis),
            cohortId: s.cohortId,
          };
        }
        return {
          id,
          name: s.name,
          readinessScore: 50,
          lastAssessmentDate: 'No assessment yet',
          criticalGap: null as string | null,
          cohortId: s.cohortId,
        };
      });
      setStudents(studentListItems);
      setIsLoading(false);
    };
    fetchStudentsAndCohorts();
  }, [user.role, schoolId]);

  const handleStudentAdded = (newStudent: Student) => {
    const newStudentItem: StudentListItem = {
      id: newStudent.id!,
      name: newStudent.name,
      readinessScore: 50,
      lastAssessmentDate: 'No assessment yet',
      criticalGap: null,
      cohortId: newStudent.cohortId,
    };
    setStudents((prev) => [newStudentItem, ...prev]);
    setIsAddStudentOpen(false);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCohort = selectedCohortId === 'all' || student.cohortId === selectedCohortId;
    return matchesSearch && matchesCohort;
  });

  const getStatusDisplay = (score: number) => {
    if (score >= 70) return { icon: <CheckCircle2 size={16} />, color: 'text-emerald-600 bg-emerald-50 border-emerald-200', text: 'On Track' };
    if (score >= 50) return { icon: <TrendingUp size={16} />, color: 'text-yellow-600 bg-yellow-50 border-yellow-200', text: 'Monitor' };
    return { icon: <AlertTriangle size={16} />, color: 'text-red-600 bg-red-50 border-red-200', text: 'At Risk' };
  };

  return (
    <>
      <AddStudentForm
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        onStudentAdded={handleStudentAdded}
        preselectedCohortId={selectedCohortId !== 'all' ? selectedCohortId : undefined}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full animate-in fade-in duration-500">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{className} Roster</h2>
            <p className="text-sm text-gray-500 mt-1">{students.length} Students Enrolled</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            {(user.role === 'headteacher' && cohorts.length > 0) || (user.role === 'teacher' && cohorts.length > 1) ? (
              <div className="relative w-full sm:w-48 shrink-0">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden />
                <select
                  value={selectedCohortId}
                  onChange={(e) => setSelectedCohortId(e.target.value)}
                  className="h-10 w-full appearance-none rounded-xl border border-zinc-200/80 bg-white pl-9 pr-8 text-sm text-zinc-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                  aria-label="Filter by class"
                >
                  {user.role === 'headteacher' && <option value="all">All Classes</option>}
                  {cohorts.map(cohort => (
                    <option key={cohort.id} value={cohort.id}>{cohort.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <ChevronRight className="h-4 w-4 rotate-90 text-zinc-400" aria-hidden />
                </div>
              </div>
            ) : null}
            
            <div className="relative w-full sm:w-64 min-w-0">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <Input
                type="search"
                placeholder="Find student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-50 pl-9 focus:bg-white dark:bg-slate-900/50 dark:focus:bg-slate-950"
                autoComplete="off"
                enterKeyHint="search"
              />
            </div>
            {user.role === 'teacher' && (
              <Button
                type="button"
                variant="default"
                className="w-full shrink-0 sm:w-auto"
                onClick={() => setIsAddStudentOpen(true)}
              >
                <UserPlus size={16} aria-hidden />
                Add Student
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              className="w-full shrink-0 sm:w-auto"
              onClick={() => void handleExportGradebook()}
              disabled={isExporting}
              aria-busy={isExporting}
            >
              {isExporting ? (
                <Loader2 size={16} className="shrink-0 animate-spin" aria-hidden />
              ) : (
                <FileSpreadsheet size={16} className="shrink-0" aria-hidden />
              )}
              Export Gradebook (.csv)
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6">
              <Skeleton className="mb-6 h-8 w-48" />
              <Skeleton className="mb-2 h-16 w-full" />
              <Skeleton className="mb-2 h-16 w-full" />
              <Skeleton className="mb-2 h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                <Users className="h-8 w-8" strokeWidth={1.5} aria-hidden />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">No students yet</h3>
              <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                {user.role === 'teacher'
                  ? 'Build your class roster to track readiness, run assessments, and open learner profiles from one place.'
                  : 'No students have been added to this class by the assigned teacher yet.'}
              </p>
              {user.role === 'teacher' && (
                <Button
                  type="button"
                  variant="default"
                  className="mt-6"
                  onClick={() => setIsAddStudentOpen(true)}
                >
                  <UserPlus size={16} aria-hidden />
                  Add your first student
                </Button>
              )}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-semibold">Student Name</th>
                  <th className="p-4 font-semibold">JHS Readiness</th>
                  <th className="p-4 font-semibold hidden md:table-cell">Last Assessment</th>
                  <th className="p-4 font-semibold hidden sm:table-cell">Active Gap</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => {
                    const status = getStatusDisplay(student.readinessScore);
                    return (
                      <tr key={student.id} className="group transition-colors hover:bg-gray-50">
                        <td className="p-4">
                          <div className="font-medium text-gray-900">{student.name}</div>
                          <div className="mt-1 text-xs text-gray-500 md:hidden">Updated {student.lastAssessmentDate}</div>
                          {student.criticalGap ? (
                            <div
                              className="mt-1 line-clamp-2 text-xs font-medium text-red-600 sm:hidden"
                              title={student.criticalGap}
                            >
                              Gap: {student.criticalGap}
                            </div>
                          ) : (
                            <div className="mt-1 text-xs italic text-gray-400 sm:hidden">No gap flagged</div>
                          )}
                        </td>
                        <td className="p-4">
                          <div
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${status.color}`}
                          >
                            {status.icon}
                            {status.text} ({student.readinessScore}%)
                          </div>
                        </td>
                        <td className="hidden p-4 text-sm text-gray-600 md:table-cell">
                          {student.lastAssessmentDate}
                        </td>
                        <td className="hidden p-4 sm:table-cell">
                          {student.criticalGap ? (
                            <span className="text-sm font-medium text-red-600">{student.criticalGap}</span>
                          ) : (
                            <span className="text-sm italic text-gray-400">None identified</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                            {user.role === 'teacher' && (
                              <Button
                                type="button"
                                variant="default"
                                size="default"
                                className="text-xs sm:h-9 sm:min-h-9 sm:px-3 sm:text-xs"
                                onClick={() => onNewAssessment(student.id)}
                                title="New Assessment"
                              >
                                <FileText size={14} aria-hidden />
                                Assess
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="outline"
                              size="default"
                              className="text-xs sm:h-9 sm:min-h-9 sm:px-3 sm:text-xs"
                              onClick={() => onViewProfile(student.id)}
                              title="View Profile"
                            >
                              Profile
                              <ChevronRight size={14} aria-hidden />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="p-10">
                      <div className="mx-auto flex max-w-md flex-col items-center text-center">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          No students match{' '}
                          <span className="font-medium text-slate-700 dark:text-slate-300">&ldquo;{searchTerm}&rdquo;</span>
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          className="mt-4"
                          onClick={() => setSearchTerm('')}
                        >
                          Clear search
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
