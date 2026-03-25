import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  ClipboardList,
  FlaskConical,
  Home,
  Inbox,
  LayoutGrid,
  Map,
  MapPin,
  School,
  UserCircle,
  Users,
  UsersRound,
  Building,
} from 'lucide-react';
import { Header, type UserData } from './components/layout/Header';
import { AssessmentSetup } from './features/assessments/AssessmentSetup';
import { AnalysisResults } from './features/assessments/AnalysisResults';
import { StudentProfile } from './features/students/StudentProfile';
import { ClassRoster } from './features/students/ClassRoster';
import { DistrictDashboard } from './features/dashboards/DistrictDashboard';
import { HeadmasterDashboard } from './features/dashboards/HeadmasterDashboard';
import { CohortManager } from './features/schools/CohortManager';
import { CircuitHeatmapPanel } from './features/assessments/CircuitHeatmapPanel';
import { SenAlertsInbox } from './components/SenAlertsInbox';
import { PlaybookLiftLeaderboard } from './features/dashboards/PlaybookLiftLeaderboard';
import { FineTunePilotPanel } from './features/ai-tools/FineTunePilotPanel';
import { TeacherDirectory } from './features/schools/TeacherDirectory';
import { StaffDirectory } from './features/schools/StaffDirectory';
import { SchoolDirectory } from './features/schools/SchoolDirectory';
import { enterpriseNavForRole, defaultViewForRole } from './auth/enterpriseAccess';
import { PendingAnalyses } from './features/assessments/PendingAnalyses';
import { Login } from './components/Login';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import ErrorBoundary from './components/layout/ErrorBoundary';
import { OfflineQueuedModal } from './components/OfflineQueuedModal';
import { removeFromQueue, type QueuedAssessment } from './services/core/offlineQueueService';
import { useSyncManager } from './hooks/useSyncManager';
import { useVoiceObservationSync } from './hooks/useVoiceObservationSync';
import { getStudents } from './services/studentService';
import { AssessmentProvider, useAssessment } from './context/AssessmentContext';
import { AuthProvider } from './context/AuthContext';
import { DEFAULT_DISTRICT_ID } from './config/organizationDefaults';
import type { BatchSyncProgress } from './hooks/useSyncManager';

type View =
  | 'class-roster'
  | 'new-assessment'
  | 'student-profile'
  | 'pending-analyses'
  | 'district-overview'
  | 'school-overview'
  | 'manage-classes'
  | 'staff-directory'
  | 'school-directory'
  | 'district-heatmap'
  | 'district-playbooks'
  | 'sen-inbox'
  | 'fine-tune-pilot';

const DASHBOARD_CONFIG: Record<
  UserData['role'],
  { title: string; welcome: string }
> = {
  teacher: { title: 'Classroom Dashboard', welcome: 'Here is your class overview.' },
  headteacher: { title: 'School Leadership Dashboard', welcome: 'Here is your school performance overview.' },
  district: { title: 'District Analytics Dashboard', welcome: 'Here is the district-wide performance overview.' },
  sen_coordinator: { title: 'SEN Coordination', welcome: 'Review screening signals and district context.' },
  circuit_supervisor: { title: 'Circuit Supervision', welcome: 'Target support using geographic risk bands.' },
  super_admin: { title: 'Enterprise / MoE View', welcome: 'Cross-cutting analytics and governance tools.' },
};

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

type LoggedInAppChromeProps = {
  user: UserData;
  currentView: View;
  setCurrentView: React.Dispatch<React.SetStateAction<View>>;
  selectedStudentId: string | null;
  setSelectedStudentId: React.Dispatch<React.SetStateAction<string | null>>;
  selectedSchoolForOverviewId: string | null;
  setSelectedSchoolForOverviewId: React.Dispatch<React.SetStateAction<string | null>>;
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  isOnline: boolean;
  isSyncing: boolean;
  queueLength: number;
  queuedItems: QueuedAssessment[];
  batchSyncProgress: BatchSyncProgress | null;
  showOfflineQueuedModal: boolean;
  setShowOfflineQueuedModal: (open: boolean) => void;
  syncToast: { message: string } | null;
  handleLogout: () => Promise<void>;
  studentNameById: Record<string, string>;
  handleRemoveQueuedItem: (id: string) => Promise<void>;
  handleRetryQueuedNow: () => Promise<void>;
};

function LoggedInAppChrome({
  user,
  currentView,
  setCurrentView,
  selectedStudentId,
  setSelectedStudentId,
  selectedSchoolForOverviewId,
  setSelectedSchoolForOverviewId,
  isOffline,
  setIsOffline,
  isOnline,
  isSyncing,
  queueLength,
  queuedItems,
  batchSyncProgress,
  showOfflineQueuedModal,
  setShowOfflineQueuedModal,
  syncToast,
  handleLogout,
  studentNameById,
  handleRemoveQueuedItem,
  handleRetryQueuedNow,
}: LoggedInAppChromeProps) {
  const { resetAssessment } = useAssessment();

  const handleStartAssessment = (studentId: string) => {
    setSelectedStudentId(studentId);
    resetAssessment();
    setCurrentView('new-assessment');
  };

  const handleViewProfile = (studentId: string) => {
    setSelectedStudentId(studentId);
    setCurrentView('student-profile');
  };

  const handleSchoolClick = (schoolId: string) => {
    setSelectedSchoolForOverviewId(schoolId);
    setCurrentView('school-overview');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'class-roster':
        return <ClassRoster onNewAssessment={handleStartAssessment} onViewProfile={handleViewProfile} />;
      case 'new-assessment':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            <div className="lg:col-span-1">
              <AssessmentSetup initialStudentId={selectedStudentId || undefined} />
            </div>
            <div className="lg:col-span-2">
              <AnalysisResults />
            </div>
          </div>
        );
      case 'student-profile':
        return <StudentProfile studentId={selectedStudentId || undefined} userRole={user.role} />;
      case 'pending-analyses':
        return (
          <PendingAnalyses
            items={queuedItems}
            isOnline={isOnline}
            isSyncing={isSyncing}
            batchSyncProgress={batchSyncProgress}
            studentNameById={studentNameById}
            onRemove={handleRemoveQueuedItem}
            onRetryNow={handleRetryQueuedNow}
            onStartNewAssessment={() => setCurrentView('new-assessment')}
          />
        );
      case 'district-overview':
        return <DistrictDashboard onSchoolClick={handleSchoolClick} />;
      case 'school-overview':
        return (
          <HeadmasterDashboard 
            overrideSchoolId={selectedSchoolForOverviewId || undefined} 
            onBack={selectedSchoolForOverviewId ? () => {
              setSelectedSchoolForOverviewId(null);
              setCurrentView('district-overview');
            } : undefined}
          />
        );
      case 'manage-classes':
        return <CohortManager />;
      case 'district-heatmap':
        return <CircuitHeatmapPanel user={user} />;
      case 'district-playbooks':
        return <PlaybookLiftLeaderboard user={user} />;
      case 'sen-inbox':
        return <SenAlertsInbox user={user} />;
      case 'staff-directory':
        return <StaffDirectory user={user} />;
      case 'school-directory':
        return <SchoolDirectory user={user} onSchoolClick={handleSchoolClick} />;
      case 'fine-tune-pilot':
        return <FineTunePilotPanel />;
      default:
        return <div className="p-12 text-center text-gray-400">View under construction.</div>;
    }
  };

  const enterpriseNav = enterpriseNavForRole(user.role);

  type NavDef = { view: View; label: string; shortLabel: string; icon: LucideIcon };

  const { primarySidebarNav, secondarySidebarNav } = useMemo(() => {
    const role = user.role;
    const primary: NavDef[] = [];

    if (role === 'teacher') {
      primary.push({
        view: 'new-assessment',
        label: 'New Assessment',
        shortLabel: 'New',
        icon: Home,
      });
    }
    if (role === 'teacher' || role === 'headteacher') {
      primary.push({
        view: 'class-roster',
        label: 'Class Roster',
        shortLabel: 'Roster',
        icon: Users,
      });
    }
    if (role === 'headteacher') {
      primary.push({
        view: 'school-overview',
        label: 'Headmaster View',
        shortLabel: 'School',
        icon: School,
      });
    }
    if (role === 'district' || role === 'sen_coordinator' || role === 'circuit_supervisor' || role === 'super_admin') {
      primary.push({
        view: 'district-overview',
        label: 'District View',
        shortLabel: 'District',
        icon: Map,
      });
    }

    const secondary: NavDef[] = [];
    if (role === 'district' || role === 'super_admin') {
      secondary.push({
        view: 'school-directory',
        label: 'School Directory',
        shortLabel: 'Schools',
        icon: Building,
      });
    }
    if (enterpriseNav.showHeatmap) {
      secondary.push({
        view: 'district-heatmap',
        label: 'Risk map',
        shortLabel: 'Risk',
        icon: MapPin,
      });
    }
    if (enterpriseNav.showPlaybooks) {
      secondary.push({
        view: 'district-playbooks',
        label: 'Playbook lift',
        shortLabel: 'Lift',
        icon: BarChart3,
      });
    }
    if (enterpriseNav.showSenInbox) {
      secondary.push({
        view: 'sen-inbox',
        label: 'SEN inbox',
        shortLabel: 'SEN',
        icon: Inbox,
      });
    }
    if (role === 'teacher') {
      secondary.push(
        {
          view: 'student-profile',
          label: 'Student Profiles',
          shortLabel: 'Profiles',
          icon: UserCircle,
        },
        {
          view: 'pending-analyses',
          label: 'Pending Analyses',
          shortLabel: 'Pending',
          icon: ClipboardList,
        }
      );
    }
    if (role === 'headteacher') {
      secondary.push(
        {
          view: 'manage-classes',
          label: 'Manage Classes',
          shortLabel: 'Classes',
          icon: LayoutGrid,
        },
        {
          view: 'staff-directory',
          label: 'Staff Directory',
          shortLabel: 'Staff',
          icon: UsersRound,
        }
      );
    }
    if (role === 'super_admin') {
      secondary.push({
        view: 'fine-tune-pilot',
        label: 'Pilot export',
        shortLabel: 'Pilot',
        icon: FlaskConical,
      });
    }

    return { primarySidebarNav: primary, secondarySidebarNav: secondary };
  }, [user.role, enterpriseNav.showHeatmap, enterpriseNav.showPlaybooks, enterpriseNav.showSenInbox]);

  const mobileNavItems = useMemo(
    () => [...primarySidebarNav, ...secondarySidebarNav],
    [primarySidebarNav, secondarySidebarNav]
  );

  return (
    <AuthProvider user={user}>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
        <Header
          onLogout={handleLogout}
          user={user}
          isOffline={isOffline}
          setIsOffline={setIsOffline}
          queueLength={queueLength}
          isSyncing={isSyncing}
        />

      <div className="flex flex-1 min-h-0 flex-col pt-14 sm:pt-16 md:flex-row">
        <aside
          className="hidden md:flex w-64 shrink-0 flex-col border-r border-zinc-200/60 bg-zinc-50/50 backdrop-blur-sm"
          aria-label="Main navigation"
        >
          <nav className="flex flex-col gap-1 overflow-y-auto px-3 py-4">
            {primarySidebarNav.map((item) => (
              <SidebarNavLink
                key={item.view}
                icon={item.icon}
                label={item.label}
                active={currentView === item.view}
                layout="sidebar"
                onClick={() => setCurrentView(item.view)}
              />
            ))}
            {secondarySidebarNav.length > 0 && (
              <div className="my-2 border-t border-zinc-200/60 pt-2" role="presentation" />
            )}
            {secondarySidebarNav.map((item) => (
              <SidebarNavLink
                key={item.view}
                icon={item.icon}
                label={item.label}
                active={currentView === item.view}
                layout="sidebar"
                onClick={() => setCurrentView(item.view)}
              />
            ))}
          </nav>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-zinc-50/30">
          <main className="mx-auto w-full max-w-7xl flex-1 overflow-y-auto px-4 pb-24 pt-4 sm:px-6 sm:pt-6 md:pb-12 lg:px-8">
            {syncToast && (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-sm">
                {syncToast.message}
              </div>
            )}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
                {DASHBOARD_CONFIG[user.role].title}
              </h2>
              <p className="mt-0.5 text-sm text-zinc-500 sm:mt-1 sm:text-base">
                Welcome back, {user.name}. {DASHBOARD_CONFIG[user.role].welcome}
              </p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        <nav
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 md:hidden"
          aria-label="Main navigation"
        >
          <div className="flex gap-1 overflow-x-auto px-2 py-2 glass rounded-full shadow-soft [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {mobileNavItems.map((item) => (
              <SidebarNavLink
                key={item.view}
                icon={item.icon}
                label={item.shortLabel}
                title={item.label}
                active={currentView === item.view}
                layout="mobile"
                onClick={() => setCurrentView(item.view)}
              />
            ))}
          </div>
        </nav>
      </div>

      <OfflineQueuedModal
        open={showOfflineQueuedModal}
        queueLength={queueLength}
        onClose={() => setShowOfflineQueuedModal(false)}
      />
    </div>
    </AuthProvider>
  );
}

function SidebarNavLink({
  icon: Icon,
  label,
  title: titleAttr,
  active,
  layout,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  /** Full label for mobile tooltips (optional). */
  title?: string;
  active: boolean;
  layout: 'sidebar' | 'mobile';
  onClick: () => void;
}) {
  const state = active
    ? 'bg-indigo-50/80 text-indigo-700 shadow-sm ring-1 ring-indigo-100'
    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900';

  if (layout === 'sidebar') {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 ${state}`}
      >
        <Icon className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
        <span className="truncate">{label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={titleAttr ?? label}
      className={`flex min-w-[4.25rem] shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-2 text-center text-[11px] font-medium leading-tight transition-all duration-200 ${state}`}
    >
      <Icon className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
      <span className="max-w-[4.5rem] break-words">{label}</span>
    </button>
  );
}

