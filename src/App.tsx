import React, { useState, useEffect, useCallback } from 'react';
import { Header, UserData } from './components/Header';
import { AssessmentSetup, AssessmentData } from './components/AssessmentSetup';
import { AnalysisResults, AnalysisStatus } from './components/AnalysisResults';
import { StudentProfile } from './components/StudentProfile';
import { ClassRoster } from './components/ClassRoster';
import { DistrictOverview } from './components/DistrictOverview';
import { SchoolOverview } from './components/SchoolOverview';
import { TeacherDirectory } from './components/TeacherDirectory';
import { PendingAnalyses } from './components/PendingAnalyses';
import { Login } from './components/Login';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import ErrorBoundary from './components/ErrorBoundary';
import { OfflineQueuedModal } from './components/OfflineQueuedModal';
import { addToQueue, removeFromQueue } from './services/offlineQueueService';
import { useSyncManager } from './hooks/useSyncManager';
import { getStudents } from './services/studentService';

// 1. Scalable Types
type View = 'roster' | 'new-assessment' | 'student-profile' | 'pending-analyses' | 'district-overview' | 'school-overview' | 'teacher-directory';

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
  const [showOfflineQueuedModal, setShowOfflineQueuedModal] = useState(false);
  const [syncToast, setSyncToast] = useState<{ message: string } | null>(null);
  const [hadQueuedWork, setHadQueuedWork] = useState(false);
  const [studentNameById, setStudentNameById] = useState<Record<string, string>>({});

  const { isOnline, isSyncing, queueLength, queuedItems, refreshQueue, processQueue } = useSyncManager();

  // Assessment flow states
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>('empty');
  const [lastAssessmentData, setLastAssessmentData] = useState<AssessmentData | null>(null);

  // 3. Listen to Auth State (with timeout so we never hang on loading)
  useEffect(() => {
    const loadingTimeout = setTimeout(() => setIsAuthLoading(false), 4000);

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

    return () => {
      clearTimeout(loadingTimeout);
      unsubscribe();
    };
  }, []);

  // When leaving the assessment view, clear 'analyzing' so we don't show the loader when returning
  useEffect(() => {
    if (currentView !== 'new-assessment') {
      setAnalysisStatus((s) => (s === 'analyzing' ? 'results' : s));
    }
  }, [currentView]);

  // Cache student names for Pending Analyses display (best-effort; falls back to id when offline)
  useEffect(() => {
    let cancelled = false;

    const loadStudentNames = async () => {
      try {
        if (!currentUser) return;
        if (typeof navigator !== 'undefined' && !navigator.onLine) return;

        const students = await getStudents();
        if (cancelled) return;
        const map: Record<string, string> = {};
        for (const s of students) {
          if (s.id && s.name) map[s.id] = s.name;
        }
        setStudentNameById(map);
      } catch (error) {
        console.error('Failed to load student names', error);
      }
    };

    loadStudentNames();
    return () => {
      cancelled = true;
    };
  }, [currentUser, isOnline]);

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

  const handleDiagnose = async (data: AssessmentData) => {
    setLastAssessmentData(data);

    const offlineNow = isOffline || (typeof navigator !== 'undefined' && !navigator.onLine);
    if (offlineNow) {
      try {
        const assessmentType =
          data.assessmentType === 'literacy' ? 'literacy' : 'numeracy';

        if (data.inputMode === 'manual') {
          await addToQueue({
            studentId: data.studentId,
            assessmentType,
            inputMode: 'manual',
            manualRubric: data.manualRubric ?? [],
            observations: data.observations ?? '',
            dialectContext: data.dialect ?? undefined,
          });
        } else {
          const imageBase64s = (data.imageBase64s ?? []).filter(Boolean);
          if (imageBase64s.length > 0) {
            await addToQueue({
              studentId: data.studentId,
              assessmentType,
              inputMode: 'upload',
              imageBase64s,
              dialectContext: data.dialect ?? undefined,
            });
          } else {
            // No images; keep UX consistent with existing validation
            alert('Please upload at least one image before running diagnosis.');
            return;
          }
        }

        await refreshQueue();
        setAnalysisStatus('empty');
        setShowOfflineQueuedModal(true);
        setHadQueuedWork(true);
      } catch (error) {
        console.error('Failed to queue offline diagnosis', error);
        alert('Could not queue this diagnosis offline. Please try again.');
      }
      return;
    }

    setAnalysisStatus('analyzing');
  };

  const handleAnalysisError = useCallback(() => {
    // If AI analysis fails (network/Gemini issues, etc.), return to the initial state
    // so the teacher is not stuck on an infinite spinner and can retry.
    setAnalysisStatus('empty');
  }, []);

  const handleViewProfile = (studentId: string) => {
    setSelectedStudentId(studentId);
    setCurrentView('student-profile');
  };

  const handleAnalysisComplete = useCallback(() => {
    setAnalysisStatus('results');
  }, []);

  const handleRemoveQueuedItem = useCallback(async (id: string) => {
    await removeFromQueue(id);
    await refreshQueue();
  }, [refreshQueue]);

  const handleRetryQueuedNow = useCallback(async () => {
    await processQueue();
    await refreshQueue();
  }, [processQueue, refreshQueue]);

  // When we come back online and finish syncing, show a small completion toast
  useEffect(() => {
    if (!isOnline) return;

    if (hadQueuedWork && !isSyncing && queueLength === 0) {
      setHadQueuedWork(false);
      setSyncToast({ message: 'Queued analyses have been saved to student profiles.' });
      const t = setTimeout(() => setSyncToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [hadQueuedWork, isOnline, isSyncing, queueLength]);

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
                imageBase64s={lastAssessmentData?.imageBase64s ?? undefined}
                dialectContext={lastAssessmentData?.dialect}
                manualRubric={lastAssessmentData?.manualRubric ?? undefined}
                observations={lastAssessmentData?.observations ?? undefined}
                onAnalysisComplete={handleAnalysisComplete}
                onAnalysisError={handleAnalysisError}
              />
            </div>
          </div>
        );
      case 'student-profile':
        return <StudentProfile studentId={selectedStudentId || undefined} />;
      case 'pending-analyses':
        return (
          <PendingAnalyses
            items={queuedItems}
            isOnline={isOnline}
            isSyncing={isSyncing}
            studentNameById={studentNameById}
            onRemove={handleRemoveQueuedItem}
            onRetryNow={handleRetryQueuedNow}
            onStartNewAssessment={() => setCurrentView('new-assessment')}
          />
        );
      case 'district-overview':
        return <DistrictOverview />;
      case 'school-overview':
        return <SchoolOverview />;
      case 'teacher-directory':
        return <TeacherDirectory />;
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
          queueLength={queueLength}
          isSyncing={isSyncing}
        />

        <main className="pt-20 sm:pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {syncToast && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium rounded-lg px-4 py-3">
              {syncToast.message}
            </div>
          )}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {DASHBOARD_CONFIG[currentUser.role].title}
            </h2>
            <p className="text-gray-600 mt-0.5 sm:mt-1 text-sm sm:text-base">
              Welcome back, {currentUser.name}. {DASHBOARD_CONFIG[currentUser.role].welcome}
            </p>
          </div>

          {/* Navigation tabs */}
          <div className="border-b border-gray-200 mb-6 sm:mb-8 overflow-x-auto min-w-0 -mx-4 sm:mx-0 px-4 sm:px-0">
            <nav className="-mb-px flex space-x-6 sm:space-x-8 min-w-max" aria-label="Tabs">
              <NavTab 
                label="Overview" 
                active={currentView === 'roster' || currentView === 'school-overview' || currentView === 'district-overview'} 
                onClick={() => setCurrentView(currentUser.role === 'teacher' ? 'roster' : currentUser.role === 'headteacher' ? 'school-overview' : 'district-overview')} 
              />
              {currentUser.role === 'teacher' && (
                <>
                  <NavTab label="New Assessment" active={currentView === 'new-assessment'} onClick={() => setCurrentView('new-assessment')} />
                  <NavTab label="Pending Analyses" active={currentView === 'pending-analyses'} onClick={() => setCurrentView('pending-analyses')} />
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

        <OfflineQueuedModal
          open={showOfflineQueuedModal}
          queueLength={queueLength}
          onClose={() => setShowOfflineQueuedModal(false)}
        />
      </div>
    </ErrorBoundary>
  );}

// Reusable Navigation Component
function NavTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap py-3 sm:py-4 px-1 min-h-[44px] sm:min-h-0 flex items-center border-b-2 font-medium text-sm transition-colors ${
        active ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {label}
    </button>
  );
}
