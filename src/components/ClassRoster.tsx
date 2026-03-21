import React, { useState, useEffect } from 'react';
import { Search, UserPlus, FileText, ChevronRight, AlertTriangle, CheckCircle2, TrendingUp, Loader2, Download } from 'lucide-react';
import { getStudents, Student } from '../services/studentService';
import { getAssessmentSummaryByStudent } from '../services/assessmentService';
import { buildGradebookRows, gradebookRowsToCsv, downloadGradebookCsv } from '../services/gradebookExport';
import { AddStudentForm } from './AddStudentForm';

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
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isExportingGradebook, setIsExportingGradebook] = useState(false);

  const handleExportGradebook = async () => {
    setIsExportingGradebook(true);
    try {
      const rows = await buildGradebookRows(className);
      const csv = gradebookRowsToCsv(rows);
      const safeName = className.replace(/[^\w\-]+/g, '_').slice(0, 40);
      downloadGradebookCsv(`basecamp-gradebook-${safeName}-${new Date().toISOString().slice(0, 10)}.csv`, csv);
    } catch (e) {
      console.error(e);
      alert('Could not export gradebook. Check your connection and try again.');
    } finally {
      setIsExportingGradebook(false);
    }
  };

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
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
          };
        }
        return {
          id,
          name: s.name,
          readinessScore: 50,
          lastAssessmentDate: 'No assessment yet',
          criticalGap: null as string | null,
        };
      });
      setStudents(studentListItems);
      setIsLoading(false);
    };
    fetchStudents();
  }, []);

  const handleStudentAdded = (newStudent: Student) => {
    const newStudentItem: StudentListItem = {
      id: newStudent.id!,
      name: newStudent.name,
      readinessScore: 50,
      lastAssessmentDate: 'No assessment yet',
      criticalGap: null,
    };
    setStudents((prev) => [newStudentItem, ...prev]);
    setIsAddStudentOpen(false);
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusDisplay = (score: number) => {
    if (score >= 70) return { icon: <CheckCircle2 size={16} />, color: 'text-emerald-600 bg-emerald-50 border-emerald-200', text: 'On Track' };
    if (score >= 50) return { icon: <TrendingUp size={16} />, color: 'text-yellow-600 bg-yellow-50 border-yellow-200', text: 'Monitor' };
    return { icon: <AlertTriangle size={16} />, color: 'text-red-600 bg-red-50 border-red-200', text: 'At Risk' };
  };

  return (
    <>
      {isAddStudentOpen && (
        <div onClick={() => setIsAddStudentOpen(false)}>
          <AddStudentForm 
            onStudentAdded={handleStudentAdded}
            onCancel={() => setIsAddStudentOpen(false)}
          />
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full animate-in fade-in duration-500">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{className} Roster</h2>
            <p className="text-sm text-gray-500 mt-1">{students.length} Students Enrolled</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64 min-w-0">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Find student..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none w-full transition-all bg-gray-50 focus:bg-white"
              />
            </div>
            <button 
              onClick={() => setIsAddStudentOpen(true)}
              className="flex items-center justify-center gap-2 bg-amber-500 text-white px-4 py-2.5 sm:py-2 min-h-[44px] rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors border border-amber-600 shrink-0 w-full sm:w-auto"
            >
              <UserPlus size={16} />
              Add Student
            </button>
            <button
              type="button"
              onClick={handleExportGradebook}
              disabled={isExportingGradebook}
              className="flex items-center justify-center gap-2 bg-white text-gray-800 border border-gray-300 px-4 py-2.5 sm:py-2 min-h-[44px] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shrink-0 w-full sm:w-auto disabled:opacity-50"
            >
              {isExportingGradebook ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              Export gradebook (CSV)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
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
                      <tr key={student.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="p-4">
                          <div className="font-medium text-gray-900">{student.name}</div>
                          <div className="text-xs text-gray-500 md:hidden mt-1">Updated {student.lastAssessmentDate}</div>
                          {student.criticalGap ? (
                            <div className="text-xs text-red-600 font-medium sm:hidden mt-1 line-clamp-2" title={student.criticalGap}>
                              Gap: {student.criticalGap}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-400 italic sm:hidden mt-1">No gap flagged</div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                            {status.icon}
                            {status.text} ({student.readinessScore}%)
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-600 hidden md:table-cell">
                          {student.lastAssessmentDate}
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                          {student.criticalGap ? (
                            <span className="text-sm text-red-600 font-medium">{student.criticalGap}</span>
                          ) : (
                            <span className="text-sm text-gray-400 italic">None identified</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => onNewAssessment(student.id)}
                              className="flex items-center gap-1 px-3 py-2.5 sm:py-1.5 min-h-[44px] sm:min-h-0 bg-amber-500 text-white text-xs font-medium rounded hover:bg-amber-600 transition-colors shadow-sm"
                              title="New Assessment"
                            >
                              <FileText size={14} />
                              <span className="inline">Assess</span>
                            </button>
                            <button 
                              onClick={() => onViewProfile(student.id)}
                              className="flex items-center gap-1 px-3 py-2.5 sm:py-1.5 min-h-[44px] sm:min-h-0 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 transition-colors shadow-sm"
                              title="View Profile"
                            >
                              <span className="inline">Profile</span>
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      No students found matching "{searchTerm}"
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