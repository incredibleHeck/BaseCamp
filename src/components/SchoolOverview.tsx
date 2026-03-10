import React from 'react';
import { Users, GraduationCap, AlertOctagon } from 'lucide-react';

// 1. Data Models
export interface ClassData {
  id: string;
  name: string;
  teacher: string;
  readinessScore: number;
}

export interface CriticalAlert {
  id: string;
  studentName: string;
  className: string;
  identifiedGap: string;
  status: 'Critical' | 'Monitor';
}

interface SchoolOverviewProps {
  schoolName?: string;
  totalStudents?: number;
  schoolReadiness?: number;
  atRiskCount?: number;
  classes?: ClassData[];
  recentAlerts?: CriticalAlert[];
}

export function SchoolOverview({
  schoolName = "Mando Basic School",
  totalStudents = 145,
  schoolReadiness = 72,
  atRiskCount = 28,
  classes = [
    { id: 'c1', name: 'Primary 6A', teacher: 'Teacher Mensah', readinessScore: 78 },
    { id: 'c2', name: 'Primary 6B', teacher: 'Teacher Osei', readinessScore: 65 },
    { id: 'c3', name: 'Primary 6C', teacher: 'Teacher Appiah', readinessScore: 52 },
  ],
  recentAlerts = [
    { id: 'a1', studentName: 'Kofi Boateng', className: 'P6C', identifiedGap: 'Fraction Addition (Unlike Denominators)', status: 'Critical' },
    { id: 'a2', studentName: 'Esi Mensah', className: 'P6B', identifiedGap: 'Reading Fluency (Multi-syllable)', status: 'Monitor' },
    { id: 'a3', studentName: 'Yaw Asante', className: 'P6C', identifiedGap: 'Basic Division (Remainders)', status: 'Critical' },
  ]
}: SchoolOverviewProps) {

  // Reusable helper for class progress bars
  const getReadinessTheme = (score: number) => {
    if (score >= 70) return { bar: 'bg-emerald-500', text: 'text-emerald-600' };
    if (score >= 60) return { bar: 'bg-yellow-500', text: 'text-yellow-600' };
    return { bar: 'bg-red-500', text: 'text-red-600' };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 w-full animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900">School Analytics: {schoolName}</h2>
        <p className="text-gray-600 mt-1 text-sm">Real-time insights for school leadership.</p>
      </div>

      {/* Top Row: Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600 mb-1">Total P6 Students</p>
            <h3 className="text-3xl font-bold text-gray-900">{totalStudents}</h3>
            <p className="text-xs text-blue-500 mt-1">Transition Year Cohort</p>
          </div>
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Users size={24} /></div>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-600 mb-1">School JHS Readiness</p>
            <h3 className="text-3xl font-bold text-gray-900">{schoolReadiness}%</h3>
            <p className="text-xs text-emerald-500 mt-1">Above District Average</p>
          </div>
          <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><GraduationCap size={24} /></div>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-xl p-5 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-red-600 mb-1">At-Risk Students</p>
            <h3 className="text-3xl font-bold text-gray-900">{atRiskCount}</h3>
            <p className="text-xs text-red-500 mt-1">Requiring Immediate Intervention</p>
          </div>
          <div className="bg-red-100 p-2 rounded-lg text-red-600"><AlertOctagon size={24} /></div>
        </div>
      </div>

      {/* Middle Section: Class Performance Breakdown */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Class Performance Breakdown</h3>
        <div className="grid grid-cols-1 gap-6">
          {classes.map((cls) => {
            const theme = getReadinessTheme(cls.readinessScore);
            return (
              <div key={cls.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-gray-300 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{cls.name}</h4>
                    <p className="text-xs text-gray-500">{cls.teacher}</p>
                  </div>
                  <span className={`text-lg font-bold ${theme.text}`}>{cls.readinessScore}% Readiness</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className={`${theme.bar} h-3 rounded-full transition-all duration-1000 ease-out`} style={{ width: `${cls.readinessScore}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Section: Recent Critical Alerts */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Critical Learning Gaps</h3>
        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Student', 'Class', 'Identified Gap', 'Status'].map((heading) => (
                  <th key={heading} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{alert.studentName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{alert.className}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{alert.identifiedGap}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      alert.status === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {alert.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}