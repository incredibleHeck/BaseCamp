import React, { useState, useEffect } from 'react';
import { Header, UserData } from './components/Header';
import { AssessmentSetup, AssessmentData } from './components/AssessmentSetup';
import { AnalysisResults, AnalysisStatus, DiagnosticReport } from './components/AnalysisResults';
import { StudentProfile } from './components/StudentProfile';
import { ClassRoster } from './components/ClassRoster';
import { DistrictOverview } from './components/DistrictOverview';
import { SchoolOverview } from './components/SchoolOverview';
import { Login } from './components/Login';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import ErrorBoundary from './components/ErrorBoundary';

// 1. Scalable Types
type View = 'roster' | 'new-assessment' | 'student-profile' | 'district-overview' | 'school-overview' | 'teacher-directory';

const DASHBOARD_CONFIG = {
  teacher: { title: 'Classroom Dashboard', welcome: 'Here is your class overview.' },
  headteacher: { title: 'School Leadership Dashboard', welcome: 'Here is your school performance overview.' },
  district: { title: 'District Analytics Dashboard', welcome: 'Here is the district-wide performance overview.' },
};

export default function App() {
  // 2. State Management
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [currentView, setCurrentView] = useState<View>('roster');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Assessment flow states
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>('empty');
  const [lastAssessmentData, setLastAssessmentData] = useState<AssessmentData | null>(null);

  // 3. Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch the user's role from Firestore
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          let role: UserData['role'] = 'teacher'; // Fallback
          let name = 'Teacher User';
          let location = 'Mando Basic School';

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            role = data.role as UserData['role'] || 'teacher';
            name = data.name || `${role.charAt(0).toUpperCase() + role.slice(1)} User`;
            location = data.location || (role === 'district' ? 'Greater Accra' : 'Mando Basic School');
          } else {
            console.warn(`User document for ${user.uid} not found. Defaulting to teacher role.`);
            // Optionally, we could still check localStorage for the mock fallback during development
            const fallbackRole = localStorage.getItem('mockUserRole') as UserData['role'];
            if (fallbackRole) {
               role = fallbackRole;
               name = `${role.charAt(0).toUpperCase() + role.slice(1)} User`;
               location = role === 'district' ? 'Greater Accra' : 'Mando Basic School';
            }
          }
          
          const loadedUser: UserData = {
            id: user.uid,
            role,
            name,
            location
          };
          
          setCurrentUser(loadedUser);
          setCurrentView(role === 'teacher' ? 'roster' : role === 'headteacher' ? 'school-overview' : 'district-overview');
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 4. Handlers
  const handleLogout = async () => {
    try {
      localStorage.removeItem('mockUserRole'); // Clean up fallback just in case
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleStartAssessment = (studentId: string) => {
    setSelectedStudentId(studentId);
    setAnalysisStatus('empty');
    setLastAssessmentData(null);
    setCurrentView('new-assessment');
  };

  const handleDiagnose = (data: AssessmentData) => {
    setLastAssessmentData(data);
    setAnalysisStatus('analyzing');
  };

  const handleViewProfile = (studentId: string) => {
    setSelectedStudentId(studentId);
    setCurrentView('student-profile');
  };

  // 5. Expert View Rendering
  const renderContent = () => {
    switch (currentView) {
      case 'roster':
        return <ClassRoster onNewAssessment={handleStartAssessment} onViewProfile={handleViewProfile} />;
      case 'new-assessment':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            <div className="lg:col-span-1">
              <AssessmentSetup 
                initialStudentId={selectedStudentId || undefined} 
                onDiagnose={handleDiagnose}
                isProcessing={analysisStatus === 'analyzing'}
              />
            </div>
            <div className="lg:col-span-2">
              <AnalysisResults 
                status={analysisStatus} 
                onSaveProfile={() => setCurrentView('student-profile')}
                isOffline={isOffline}
                studentId={lastAssessmentData?.studentId}
                assessmentType={lastAssessmentData?.assessmentType}
                imageBase64={lastAssessmentData?.imageBase64}
                dialectContext={lastAssessmentData?.dialect}
                onAnalysisComplete={() => setAnalysisStatus('results')}
              />
            </div>
          </div>
        );
      case 'student-profile':
        return <StudentProfile studentId={selectedStudentId || undefined} />;
      case 'district-overview':
        return <DistrictOverview />;
      case 'school-overview':
        return <SchoolOverview />;
      default:
        return <div className="p-12 text-center text-gray-400">View under construction.</div>;
    }
  };

  if (isAuthLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading BaseCamp...</p></div>;
  }

  if (!currentUser) return <Login />;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Header 
          onLogout={handleLogout} 
          user={currentUser} 
          isOffline={isOffline} 
          setIsOffline={setIsOffline} 
        />

        <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="mb-6 animate-in slide-in-from-left duration-500">
            <h2 className="text-2xl font-bold text-gray-900">
              {DASHBOARD_CONFIG[currentUser.role].title}
            </h2>
            <p className="text-gray-600 mt-1">
              Welcome back, {currentUser.name}. {DASHBOARD_CONFIG[currentUser.role].welcome}
            </p>
          </div>

          {/* 5. Expert Navigation: Automated based on Role */}
          <div className="border-b border-gray-200 mb-8 overflow-x-auto">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <NavTab 
                label="Overview" 
                active={currentView === 'roster' || currentView === 'school-overview' || currentView === 'district-overview'} 
                onClick={() => setCurrentView(currentUser.role === 'teacher' ? 'roster' : currentUser.role === 'headteacher' ? 'school-overview' : 'district-overview')} 
              />
              {currentUser.role === 'teacher' && (
                <>
                  <NavTab label="New Assessment" active={currentView === 'new-assessment'} onClick={() => setCurrentView('new-assessment')} />
                  <NavTab label="Student Profiles" active={currentView === 'student-profile'} onClick={() => setCurrentView('student-profile')} />
                </>
              )}
              {currentUser.role === 'headteacher' && (
                <NavTab label="Teacher Directory" active={currentView === 'teacher-directory'} onClick={() => setCurrentView('teacher-directory')} />
              )}
            </nav>
          </div>

          {renderContent()}
        </main>
      </div>
    </ErrorBoundary>
  );}

// Reusable Navigation Component
function NavTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
        active ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {label}
    </button>
  );
}
