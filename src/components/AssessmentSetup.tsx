import React, { useState } from 'react';
import { FileUploadZone } from './FileUploadZone';
import { Camera, Edit3 } from 'lucide-react';

export function AssessmentSetup() {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [assessmentType, setAssessmentType] = useState('');
  const [inputMode, setInputMode] = useState<'upload' | 'manual'>('upload');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">New Assessment</h3>
      
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor="student" className="block text-sm font-medium text-gray-700 mb-1">
            Select Student
          </label>
          <select
            id="student"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
          >
            <option value="" disabled>Select a student...</option>
            <option value="kwame">Kwame Mensah (Primary 6)</option>
            <option value="ama">Ama Osei (Primary 6)</option>
            <option value="kojo">Kojo Appiah (Primary 5)</option>
          </select>
        </div>

        <div>
          <label htmlFor="assessmentType" className="block text-sm font-medium text-gray-700 mb-1">
            Assessment Type
          </label>
          <select
            id="assessmentType"
            value={assessmentType}
            onChange={(e) => setAssessmentType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
          >
            <option value="" disabled>Select assessment type...</option>
            <option value="numeracy">Numeracy (Fractions & Decimals)</option>
            <option value="literacy">Literacy (Reading Comprehension)</option>
          </select>
        </div>

        {/* Input Mode Toggle */}
        <div className="pt-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assessment Input Mode
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => setInputMode('upload')}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-md transition-all ${
                inputMode === 'upload'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Camera size={16} />
              Photo Upload
            </button>
            <button
              type="button"
              onClick={() => setInputMode('manual')}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-md transition-all ${
                inputMode === 'manual'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Edit3 size={16} />
              Manual Entry
            </button>
          </div>
        </div>

        {/* Conditional Rendering based on Input Mode */}
        {inputMode === 'upload' ? (
          <FileUploadZone />
        ) : (
          <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Rubric Selection</h4>
              <div className="space-y-2">
                <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input type="checkbox" className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <span className="text-sm text-gray-700">Struggles with carrying over numbers</span>
                </label>
                <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input type="checkbox" className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <span className="text-sm text-gray-700">Confuses numerators and denominators</span>
                </label>
                <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input type="checkbox" className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <span className="text-sm text-gray-700">Difficulty sounding out multi-syllable words</span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="observations" className="block text-sm font-medium text-gray-700 mb-1">
                Teacher Observations (Optional)
              </label>
              <textarea
                id="observations"
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none bg-white"
                placeholder="Add any specific notes about the student's performance..."
              ></textarea>
            </div>

            <button 
              type="button"
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Diagnose Learning Gaps
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
