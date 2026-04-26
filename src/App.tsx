import React, { useState, useEffect, useCallback } from 'react';
import { type UserData } from './components/layout/Header';
import { defaultViewForRole } from './auth/enterpriseAccess';
import { Login } from './components/Login';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import ErrorBoundary from './components/layout/ErrorBoundary';
import { removeFromQueue } from './services/core/offlineQueueService';
import { useSyncManager } from './hooks/useSyncManager';
import { useVoiceObservationSync } from './hooks/useVoiceObservationSync';
import { getStudents } from './services/studentService';
import { AssessmentProvider } from './context/AssessmentContext';
import { DEFAULT_ORGANIZATION_ID, DEMO_SEED_PRIMARY_SCHOOL_ID } from './config/organizationDefaults';
import { effectiveOrganizationId } from './utils/organizationScope';
import { isDemoHostedBuild } from './config/demoMode';
import { LoggedInAppChrome, type View } from './components/layout/LoggedInAppChrome';
import { PremiumTierProvider } from './context/PremiumTierContext';
import { LiveClassroomSessionProvider } from './context/LiveClassroomSessionContext';
import { Toaster } from 'sonner';

const demoSeedEnabled = isDemoHostedBuild;

/** Diagnostics demo: Auth user may exist without Firestore `users/{uid}`; bootstrap matches demo rules + seeder emails. */
const DEMO_SUPER_ADMIN_BOOTSTRAP_EMAILS = new Set(['superadmin@basecamp.com', 'super_admin@basecamp.com']);

const VALID_ROLES: UserData['role'][] = [
  'teacher',
  'headteacher',
  'org_admin',
  'sen_coordinator',
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
          const userDocRef = doc(db, 'users', user.uid);
          let userDocSnap = await getDoc(userDocRef);
          if (user.isAnonymous && !userDocSnap.exists()) {
            for (let attempt = 0; attempt < 15 && !userDocSnap.exists(); attempt++) {
              await new Promise((r) => setTimeout(r, 120));
              userDocSnap = await getDoc(userDocRef);
            }
          }

          if (!userDocSnap.exists() && demoSeedEnabled && !user.isAnonymous) {
            const em = user.email?.trim().toLowerCase() ?? '';
            if (em && DEMO_SUPER_ADMIN_BOOTSTRAP_EMAILS.has(em)) {
              try {
                await setDoc(
                  userDocRef,
                  {
                    role: 'super_admin',
                    name: 'Super Admin',
                    email: user.email ?? '',
                    organizationId: DEFAULT_ORGANIZATION_ID,
                    districtId: DEFAULT_ORGANIZATION_ID,
                  },
                  { merge: true }
                );
                userDocSnap = await getDoc(userDocRef);
              } catch (bootstrapErr) {
                console.error('Failed to bootstrap super admin Firestore profile:', bootstrapErr);
              }
            }
          }

          if (!userDocSnap.exists()) {
            localStorage.setItem(
              'authProfileError',
              user.isAnonymous
                ? 'Could not load your profile. Try logging in again.'
                : 'Your account has no profile in BaseCamp. Contact your administrator.'
            );
            await signOut(auth);
            setCurrentUser(null);
            setIsAuthLoading(false);
            return;
          }

          const data = userDocSnap.data() as Record<string, unknown>;
          const rawRole = data.role as string;
          const r =
            rawRole === 'district' || rawRole === 'school_admin' ? 'org_admin' : rawRole;
          const role = VALID_ROLES.includes(r as UserData['role']) ? (r as UserData['role']) : 'teacher';
          let name = (typeof data.name === 'string' && data.name) || `${role.charAt(0).toUpperCase() + role.slice(1)} User`;
          let location =
            (typeof data.location === 'string' && data.location) ||
            (role === 'org_admin' || role === 'sen_coordinator' || role === 'super_admin'
              ? 'Greater Accra'
              : 'Mando Basic School');
          let organizationId = effectiveOrganizationId(data as { organizationId?: string; districtId?: string });
          let circuitId = typeof data.circuitId === 'string' ? data.circuitId : undefined;
          let schoolId = typeof data.schoolId === 'string' ? data.schoolId : undefined;

          if (demoSeedEnabled) {
            if (role === 'headteacher' && !schoolId) schoolId = DEMO_SEED_PRIMARY_SCHOOL_ID;
            if (
              (role === 'org_admin' ||
                role === 'sen_coordinator' ||
                role === 'super_admin') &&
              !organizationId
            ) {
              organizationId = DEFAULT_ORGANIZATION_ID;
            }
          }

          let stableId = user.uid;
          if (demoSeedEnabled) {
            const lp = data.linkedProfileId;
            if (typeof lp === 'string' && lp.trim().length > 0) {
              stableId = lp.trim();
            }
          }

          const loadedUser: UserData = {
            id: stableId,
            role,
            name,
            location,
            organizationId,
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

  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      {isAuthLoading ? (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-500">Loading BaseCamp...</p>
        </div>
      ) : !currentUser ? (
        <Login />
      ) : (
        <ErrorBoundary>
          <LoggedInApp user={currentUser} />
        </ErrorBoundary>
      )}
    </>
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
    <PremiumTierProvider user={user}>
      <LiveClassroomSessionProvider>
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
      </LiveClassroomSessionProvider>
    </PremiumTierProvider>
  );
}
