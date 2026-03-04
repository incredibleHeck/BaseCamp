import React from 'react';
import { Users, GraduationCap, AlertOctagon } from 'lucide-react';

export function SchoolOverview() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 w-full">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900">School Analytics: Mando Basic School</h2>
        <p className="text-gray-600 mt-1 text-sm">Real-time insights for school leadership.</p>
      </div>

      {/* Top Row: Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600 mb-1">Total P6 Students</p>
            <h3 className="text-3xl font-bold text-gray-900">145</h3>
            <p className="text-xs text-blue-500 mt-1">Transition Year Cohort</p>
          </div>
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
            <Users size={24} />
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-600 mb-1">School JHS Readiness</p>
            <h3 className="text-3xl font-bold text-gray-900">72%</h3>
            <p className="text-xs text-emerald-500 mt-1">Above District Average</p>
          </div>
          <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
            <GraduationCap size={24} />
          </div>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-xl p-5 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-red-600 mb-1">At-Risk Students</p>
            <h3 className="text-3xl font-bold text-gray-900">28</h3>
            <p className="text-xs text-red-500 mt-1">Requiring Immediate Intervention</p>
          </div>
          <div className="bg-red-100 p-2 rounded-lg text-red-600">
            <AlertOctagon size={24} />
          </div>
        </div>
      </div>

      {/* Middle Section: Class Performance Breakdown */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Class Performance Breakdown</h3>
        <div className="grid grid-cols-1 gap-6">
          
          {/* Class 6A */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h4 className="font-semibold text-gray-900">Primary 6A</h4>
                <p className="text-xs text-gray-500">Teacher Mensah</p>
              </div>
              <span className="text-lg font-bold text-emerald-600">78% Readiness</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div className="bg-emerald-500 h-3 rounded-full" style={{ width: '78%' }}></div>
            </div>
          </div>

          {/* Class 6B */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h4 className="font-semibold text-gray-900">Primary 6B</h4>
                <p className="text-xs text-gray-500">Teacher Osei</p>
              </div>
              <span className="text-lg font-bold text-yellow-600">65% Readiness</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div className="bg-yellow-500 h-3 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>

          {/* Class 6C */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h4 className="font-semibold text-gray-900">Primary 6C</h4>
                <p className="text-xs text-gray-500">Teacher Appiah</p>
              </div>
              <span className="text-lg font-bold text-red-600">52% Readiness</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div className="bg-red-500 h-3 rounded-full" style={{ width: '52%' }}></div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Section: Recent Critical Alerts */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Critical Learning Gaps</h3>
        <div className="overflow-hidden border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Identified Gap
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Kofi Boateng
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  P6C
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  Fraction Addition (Unlike Denominators)
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Critical
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Esi Mensah
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  P6B
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  Reading Fluency (Multi-syllable)
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Monitor
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Yaw Asante
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  P6C
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  Basic Division (Remainders)
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Critical
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
