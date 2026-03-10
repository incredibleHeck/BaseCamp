import React from 'react';
import { Users, TrendingUp, AlertTriangle } from 'lucide-react';

// 1. Define strict TypeScript interfaces for our data models
export interface LearningGap {
  id: string;
  topic: string;
  subject: string;
  percentage: number;
  severity: 'critical' | 'warning' | 'monitor';
}

export interface SchoolPerformance {
  id: string;
  name: string;
  studentsTracked: number;
  readinessScore: number;
  status: 'High Performing' | 'Average' | 'Needs Support';
}

interface DistrictOverviewProps {
  districtName?: string;
  totalStudents?: number;
  avgReadiness?: number;
  atRiskCount?: number;
  learningGaps?: LearningGap[];
  schools?: SchoolPerformance[];
}

// 2. Helper function for dynamic severity colors
const getProgressBarColor = (severity: LearningGap['severity']) => {
  switch (severity) {
    case 'critical': return 'bg-red-500 text-red-600';
    case 'warning': return 'bg-yellow-500 text-yellow-600';
    case 'monitor': return 'bg-emerald-500 text-emerald-600';
    default: return 'bg-blue-500 text-blue-600';
  }
};

const getStatusBadge = (status: SchoolPerformance['status']) => {
  switch (status) {
    case 'High Performing': return 'bg-green-100 text-green-800';
    case 'Average': return 'bg-yellow-100 text-yellow-800';
    case 'Needs Support': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export function DistrictOverview({
  districtName = "Greater Accra Region",
  totalStudents = 1245,
  avgReadiness = 68,
  atRiskCount = 312,
  // 3. Provide fallback data so it works immediately
  learningGaps = [
    { id: '1', topic: 'Fractional Equivalence', subject: 'Numeracy', percentage: 45, severity: 'critical' },
    { id: '2', topic: 'Reading Comprehension', subject: 'Literacy', percentage: 30, severity: 'warning' },
    { id: '3', topic: 'Basic Multiplication', subject: 'Numeracy', percentage: 15, severity: 'monitor' },
  ],
  schools = [
    { id: 's1', name: 'Mando Basic School', studentsTracked: 450, readinessScore: 82, status: 'High Performing' },
    { id: 's2', name: 'Accra Ridge Primary', studentsTracked: 320, readinessScore: 65, status: 'Average' },
    { id: 's3', name: 'Osu Presby School', studentsTracked: 475, readinessScore: 48, status: 'Needs Support' },
  ]
}: DistrictOverviewProps) {
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 w-full animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900">District Analytics: {districtName}</h2>
        <p className="text-gray-600 mt-1 text-sm">Real-time transition insights across all monitored schools.</p>
      </div>

      {/* Top Row: Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total P6 Students Tracked" value={totalStudents.toLocaleString()} icon={<Users size={24} />} colorTheme="blue" />
        <StatCard title="Average JHS Readiness" value={`${avgReadiness}%`} icon={<TrendingUp size={24} />} colorTheme="emerald" />
        <StatCard title="Critical Interventions Needed" value={atRiskCount.toLocaleString()} subtitle="Students At Risk" icon={<AlertTriangle size={24} />} colorTheme="red" />
      </div>

      {/* Middle Section: Major Learning Gaps mapped dynamically */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Major Learning Gaps Identified</h3>
        <div className="space-y-5">
          {learningGaps.map((gap) => {
            const colors = getProgressBarColor(gap.severity);
            const textColor = colors.split(' ')[1]; // Extract text color class
            const bgColor = colors.split(' ')[0]; // Extract bg color class

            return (
              <div key={gap.id}>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-sm font-medium text-gray-700">{gap.topic} ({gap.subject})</span>
                  <span className={`text-sm font-bold ${textColor}`}>{gap.percentage}% of Students</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden" role="progressbar" aria-valuenow={gap.percentage} aria-valuemin={0} aria-valuemax={100}>
                  <div className={`${bgColor} h-2.5 rounded-full transition-all duration-1000 ease-out`} style={{ width: `${gap.percentage}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Section: School Breakdown mapped dynamically */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">School Performance Breakdown</h3>
        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['School Name', 'Students Tracked', 'JHS Readiness', 'Status'].map((heading) => (
                  <th key={heading} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {schools.map((school) => (
                <tr key={school.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{school.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{school.studentsTracked}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${school.readinessScore >= 70 ? 'text-emerald-600' : school.readinessScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {school.readinessScore}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(school.status)}`}>
                      {school.status}
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

// 4. Extracted small, reusable UI component to clean up the main render function
function StatCard({ title, value, subtitle, icon, colorTheme }: { title: string, value: string | number, subtitle?: string, icon: React.ReactNode, colorTheme: 'blue' | 'emerald' | 'red' }) {
  const themes = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', iconBg: 'bg-blue-100' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600', iconBg: 'bg-emerald-100' },
    red: { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-600', iconBg: 'bg-red-100' },
  };
  const theme = themes[colorTheme];

  return (
    <div className={`${theme.bg} border ${theme.border} rounded-xl p-5 flex items-start justify-between hover:shadow-md transition-shadow`}>
      <div>
        <p className={`text-sm font-medium ${theme.text} mb-1`}>{title}</p>
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        {subtitle && <p className={`text-xs ${theme.text} opacity-80 mt-1`}>{subtitle}</p>}
      </div>
      <div className={`${theme.iconBg} p-2 rounded-lg ${theme.text}`}>
        {icon}
      </div>
    </div>
  );
}