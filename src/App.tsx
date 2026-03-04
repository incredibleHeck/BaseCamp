/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { AssessmentSetup } from './components/AssessmentSetup';
import { AnalysisResults } from './components/AnalysisResults';
import { StudentProfile } from './components/StudentProfile';
import { ClassRoster } from './components/ClassRoster';

type View = 'roster' | 'new-assessment' | 'student-profile';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('roster');

  const renderView = () => {
    switch (currentView) {
      case 'roster':
        return <ClassRoster />;
      case 'new-assessment':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Left Column: Assessment Setup */}
            <div className="lg:col-span-1">
              <AssessmentSetup />
            </div>

            {/* Middle & Right Columns: Analysis Results */}
            <div className="lg:col-span-2">
              <AnalysisResults />
            </div>
          </div>
        );
      case 'student-profile':
        return <StudentProfile />;
      default:
        return <ClassRoster />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Header />
      
      {/* Main Content Area - padded top to account for fixed header */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">Welcome back, Teacher. Here is your class overview.</p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            <button
              onClick={() => setCurrentView('roster')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                currentView === 'roster'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Class Overview
            </button>
            <button
              onClick={() => setCurrentView('new-assessment')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                currentView === 'new-assessment'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Run New Assessment
            </button>
            <button
              onClick={() => setCurrentView('student-profile')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                currentView === 'student-profile'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Student Profiles
            </button>
          </nav>
        </div>

        {/* Dynamic Content View */}
        {renderView()}
      </main>
    </div>
  );
}
