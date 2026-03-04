import React from 'react';
import { Download, User } from 'lucide-react';

export function StudentProfile() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8 w-full">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 border-2 border-blue-200 shrink-0">
            <User size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Kwame Mensah</h2>
            <p className="text-gray-600 font-medium">Primary 6 - Transitioning to JHS 1</p>
          </div>
        </div>
        <button className="inline-flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors shadow-sm">
          <Download size={18} />
          Export Profile to JHS System
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Historical Timeline */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Longitudinal History</h3>
          <div className="relative border-l-2 border-gray-200 ml-3 space-y-8">
            
            {/* Node 3 (Newest) */}
            <div className="relative pl-6">
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-red-500 border-4 border-white shadow-sm"></div>
              <h4 className="font-semibold text-gray-900">Primary 6</h4>
              <p className="text-sm text-gray-600 mt-1">Recent AI Diagnosis: Critical Gap (Fractional Equivalence)</p>
            </div>

            {/* Node 2 */}
            <div className="relative pl-6">
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-yellow-500 border-4 border-white shadow-sm"></div>
              <h4 className="font-semibold text-gray-900">Primary 5</h4>
              <p className="text-sm text-gray-600 mt-1">Mid-Year Assessment: Approaching Target (Basic Arithmetic)</p>
            </div>

            {/* Node 1 (Oldest) */}
            <div className="relative pl-6">
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-orange-500 border-4 border-white shadow-sm"></div>
              <h4 className="font-semibold text-gray-900">Primary 4</h4>
              <p className="text-sm text-gray-600 mt-1">Baseline Numeracy: Needs Intervention (Fractions)</p>
            </div>

          </div>
        </div>

        {/* Visual Data Shell */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Skill Progression</h3>
          <div className="space-y-6">
            
            {/* Literacy Bar */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium text-gray-700">Literacy</span>
                <span className="text-sm font-bold text-emerald-600">75%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div className="bg-emerald-500 h-3 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>

            {/* Numeracy Bar */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium text-gray-700">Numeracy</span>
                <span className="text-sm font-bold text-orange-600">40%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div className="bg-orange-500 h-3 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
