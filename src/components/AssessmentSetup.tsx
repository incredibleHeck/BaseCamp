import React, { useState } from 'react';
import { FileUploadZone } from './FileUploadZone';

export function AssessmentSetup() {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [assessmentType, setAssessmentType] = useState('');

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

        <FileUploadZone />
      </form>
    </div>
  );
}
