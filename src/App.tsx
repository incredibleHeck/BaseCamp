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
import { DistrictOverview } from './components/DistrictOverview';
import { SchoolOverview } from './components/SchoolOverview';
import { Login } from './components/Login';

type View = 'roster' | 'new-assessment' | 'student-profile' | 'district-overview' | 'school-overview' | 'teacher-directory';
type Role = 'teacher' | 'headteacher' | 'district' | null;

export default function App() {
  const [userRole, setUserRole] = useState<Role>(null);
  const [currentView, setCurrentView] = useState<View>('roster');

  const handleLogin = (role: 'teacher' | 'headteacher' | 'district') => {
    setUserRole(role);
    if (role === 'teacher') {
      setCurrentView('roster');
    } else if (role === 'headteacher') {
      setCurrentView('school-overview');
    } else {
      setCurrentView('district-overview');
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setCurrentView('roster'); // Reset view on logout
  };

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
      case 'district-overview':
        return <DistrictOverview />;
      case 'school-overview':
        return <SchoolOverview />;
      case 'teacher-directory':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Teacher Directory</h3>
            <p className="text-gray-500">Teacher directory functionality coming soon.</p>
          </div>
        );
      default:
        return <ClassRoster />;
    }
  };

  if (!userRole) {
    return <Login onLogin={handleLogin} />;
  }

  const getDashboardTitle = () => {
    switch (userRole) {
      case 'teacher': return 'Classroom Dashboard';
      case 'headteacher': return 'School Leadership Dashboard';
      case 'district': return 'District Analytics Dashboard';
      default: return 'Dashboard';
    }
  };

  const getWelcomeMessage = () => {
    switch (userRole) {
      case 'teacher': return 'Welcome back, Teacher. Here is your class overview.';
      case 'headteacher': return 'Welcome back, Headmaster. Here is your school performance overview.';
      case 'district': return 'Welcome back, Director. Here is the district-wide performance overview.';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Header onLogout={handleLogout} userRole={userRole} />
      
      {/* Main Content Area - padded top to account for fixed header */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {getDashboardTitle()}
          </h2>
          <p className="text-gray-600 mt-1">
            {getWelcomeMessage()}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {userRole === 'teacher' && (
              <>
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
              </>
            )}

            {userRole === 'headteacher' && (
              <>
                <button
                  onClick={() => setCurrentView('school-overview')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    currentView === 'school-overview'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  School Overview
                </button>
                <button
                  onClick={() => setCurrentView('teacher-directory')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    currentView === 'teacher-directory'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Teacher Directory
                </button>
              </>
            )}

            {userRole === 'district' && (
              <button
                onClick={() => setCurrentView('district-overview')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  currentView === 'district-overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                District Analytics
              </button>
            )}
          </nav>
        </div>

        {/* Dynamic Content View */}
        {renderView()}
      </main>
    </div>
  );
}
