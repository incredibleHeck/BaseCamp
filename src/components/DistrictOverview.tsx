import React from 'react';
import { Users, TrendingUp, AlertTriangle } from 'lucide-react';

export function DistrictOverview() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 w-full">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900">District Analytics: Primary to JHS Transition</h2>
        <p className="text-gray-600 mt-1 text-sm">Real-time insights across all monitored schools.</p>
      </div>

      {/* Top Row: Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600 mb-1">Total P6 Students Tracked</p>
            <h3 className="text-3xl font-bold text-gray-900">1,245</h3>
          </div>
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
            <Users size={24} />
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-600 mb-1">JHS Readiness Score</p>
            <h3 className="text-3xl font-bold text-gray-900">68%</h3>
          </div>
          <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-xl p-5 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-red-600 mb-1">Critical Interventions Needed</p>
            <h3 className="text-3xl font-bold text-gray-900">312</h3>
            <p className="text-xs text-red-500 mt-1">Students At Risk</p>
          </div>
          <div className="bg-red-100 p-2 rounded-lg text-red-600">
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* Middle Section: Major Learning Gaps */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Major Learning Gaps Identified</h3>
        <div className="space-y-5">
          
          {/* Gap 1 */}
          <div>
            <div className="flex justify-between items-end mb-1">
              <span className="text-sm font-medium text-gray-700">Fractional Equivalence (Numeracy)</span>
              <span className="text-sm font-bold text-red-600">45% of Students</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>

          {/* Gap 2 */}
          <div>
            <div className="flex justify-between items-end mb-1">
              <span className="text-sm font-medium text-gray-700">Reading Comprehension (Literacy)</span>
              <span className="text-sm font-bold text-yellow-600">30% of Students</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '30%' }}></div>
            </div>
          </div>

          {/* Gap 3 */}
          <div>
            <div className="flex justify-between items-end mb-1">
              <span className="text-sm font-medium text-gray-700">Basic Multiplication (Numeracy)</span>
              <span className="text-sm font-bold text-emerald-600">15% of Students</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '15%' }}></div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Section: School Breakdown */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">School Performance Breakdown</h3>
        <div className="overflow-hidden border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  School Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Students Tracked
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  JHS Readiness
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Mando Basic School
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  450
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600">
                  82%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    High Performing
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Accra Ridge Primary
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  320
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-yellow-600">
                  65%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Average
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Osu Presby School
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  475
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                  48%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Needs Support
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
