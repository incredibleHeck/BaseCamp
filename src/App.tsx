import React, { useState, useEffect, useCallback } from 'react';
import { type UserData } from './components/layout/Header';
import { defaultViewForRole } from './auth/enterpriseAccess';
import { Login } from './components/Login';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import ErrorBoundary from './components/layout/ErrorBoundary';
import { removeFromQueue } from './services/core/offlineQueueService';
import { useSyncManager } from './hooks/useSyncManager';
import { useVoiceObservationSync } from './hooks/useVoiceObservationSync';
import { getStudents } from './services/studentService';
import { AssessmentProvider } from './context/AssessmentContext';
import { DEFAULT_DISTRICT_ID } from './config/organizationDefaults';
import { LoggedInAppChrome, type View } from './components/layout/LoggedInAppChrome';

const VALID_ROLES: UserData['role'][] = [
  'teacher',
  'headteacher',
  'district',
  'sen_coordinator',
  'circuit_supervisor',
  'super_admin',
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const loadingTimeout = setTimeout(() => setIsAuthLoading(false), 4000);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Check if we logged in via Access Code (which uses anonymous auth)
          const accessCodeUserId = localStorage.getItem('accessCodeUserId');
          const targetUserId = accessCodeUserId || user.uid;

          const userDocRef = doc(db, 'users', targetUserId);
          const userDocSnap = await getDoc(userDocRef);

          let role: UserData['role'] = 'teacher';
          let name = 'Teacher User';
          let location = 'Mando Basic School';
          let districtId: string | undefined;
          let circuitId: string | undefined;
          let schoolId: string | undefined;

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            const r = data.role as string;
            role = VALID_ROLES.includes(r as UserData['role']) ? (r as UserData['role']) : 'teacher';
            name = data.name || `${role.charAt(0).toUpperCase() + role.slice(1)} User`;
            location =
              data.location ||
              (role === 'district' || role === 'sen_coordinator' || role === 'super_admin'
                ? 'Greater Accra'
                : 'Mando Basic School');
            districtId = typeof data.districtId === 'string' ? data.districtId : undefined;
            circuitId = typeof data.circuitId === 'string' ? data.circuitId : undefined;
            schoolId = typeof data.schoolId === 'string' ? data.schoolId : undefined;
          } else {
            console.warn(`User document for ${targetUserId} not found. Defaulting to teacher role.`);
            const fallbackRole = localStorage.getItem('mockUserRole') as UserData['role'];
            if (fallbackRole && VALID_ROLES.includes(fallbackRole)) {
              role = fallbackRole;
              name = `${role.charAt(0).toUpperCase() + role.replace(/_/g, ' ')} User`;
              location =
                role === 'district' || role === 'sen_coordinator' || role === 'super_admin'
                  ? 'Greater Accra'
                  : 'Mando Basic School';
            }
          }

          if (role === 'headteacher' && !schoolId) schoolId = 'sch-mando';
          if (role === 'circuit_supervisor' && !circuitId) circuitId = 'circuit-north';
          if (
            (role === 'district' ||
              role === 'sen_coordinator' ||
              role === 'super_admin' ||
              role === 'circuit_supervisor') &&
            !districtId
          ) {
            districtId = DEFAULT_DISTRICT_ID;
          }

          const loadedUser: UserData = {
            id: targetUserId,
            role,
            name,
            location,
            districtId,
            circuitId,
            schoolId,
          };

          setCurrentUser(loadedUser);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
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

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading BaseCamp...</p>
      </div>
    );
  }

  if (!currentUser) return <Login />;

  return (
    <ErrorBoundary>
      <LoggedInApp user={currentUser} />
    </ErrorBoundary>
  );
}

type LoggedInAppProps = { user: UserData };

function LoggedInApp({ user }: LoggedInAppProps) {
  const [currentView, setCurrentView] = useState<View>(() => defaultViewForRole(user.role) as View);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedSchoolForOverviewId, setSelectedSchoolForOverviewId] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [showOfflineQueuedModal, setShowOfflineQueuedModal] = useState(false);
  const [syncToast, setSyncToast] = useState<{ message: string } | null>(null);
  const [hadQueuedWork, setHadQueuedWork] = useState(false);
  const [studentNameById, setStudentNameById] = useState<Record<string, string>>({});

  const {
    isOnline,
    isSyncing,
    queueLength,
    queuedItems,
    batchSyncProgress,
    refreshQueue,
    processQueue,
  } = useSyncManager(!isOffline);
  useVoiceObservationSync(!isOffline);

  useEffect(() => {
    let cancelled = false;

    const loadStudentNames = async () => {
      try {
        if (isOffline) return;

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

    void loadStudentNames();
    return () => {
      cancelled = true;
    };
  }, [user, isOffline]);

  useEffect(() => {
    if (!isOnline) return;

    if (hadQueuedWork && !isSyncing && queueLength === 0) {
      setHadQueuedWork(false);
      setSyncToast({ message: 'Queued analyses have been saved to student profiles.' });
      const t = setTimeout(() => setSyncToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [hadQueuedWork, isOnline, isSyncing, queueLength]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('mockUserRole');
      localStorage.removeItem('accessCodeUserId');
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const handleRemoveQueuedItem = useCallback(
    async (id: string) => {
      await removeFromQueue(id);
      await refreshQueue();
    },
    [refreshQueue]
  );

  const handleRetryQueuedNow = useCallback(async () => {
    await processQueue();
    await refreshQueue();
  }, [processQueue, refreshQueue]);

  return (
    <AssessmentProvider
      isOffline={isOffline}
      currentView={currentView}
      refreshQueue={refreshQueue}
      onOfflineQueued={() => {
        setShowOfflineQueuedModal(true);
        setHadQueuedWork(true);
      }}
      onOpenStudentProfile={() => setCurrentView('student-profile')}
    >
      <LoggedInAppChrome
        user={user}
        currentView={currentView}
        setCurrentView={setCurrentView}
        selectedStudentId={selectedStudentId}
        setSelectedStudentId={setSelectedStudentId}
        selectedSchoolForOverviewId={selectedSchoolForOverviewId}
        setSelectedSchoolForOverviewId={setSelectedSchoolForOverviewId}
        isOffline={isOffline}
        setIsOffline={setIsOffline}
        isOnline={isOnline}
        isSyncing={isSyncing}
        queueLength={queueLength}
        queuedItems={queuedItems}
        batchSyncProgress={batchSyncProgress}
        showOfflineQueuedModal={showOfflineQueuedModal}
        setShowOfflineQueuedModal={setShowOfflineQueuedModal}
        syncToast={syncToast}
        handleLogout={handleLogout}
        studentNameById={studentNameById}
        handleRemoveQueuedItem={handleRemoveQueuedItem}
        handleRetryQueuedNow={handleRetryQueuedNow}
      />
    </AssessmentProvider>
  );
}