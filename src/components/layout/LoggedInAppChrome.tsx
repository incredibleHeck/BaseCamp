import React, { useMemo } from 'react';
import { AnimatePresence, m } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart2,
  BarChart3,
  ClipboardList,
  FlaskConical,
  Home,
  LayoutGrid,
  Map,
  School,
  UserCircle,
  Users,
  UsersRound,
  Building,
  HeartHandshake,
  Zap,
} from 'lucide-react';
import { Header, type UserData } from './Header';
import { AssessmentSetup } from '../../features/assessments/AssessmentSetup';
import { AnalysisResults } from '../../features/assessments/AnalysisResults';
import { StudentProfile } from '../../features/students/StudentProfile';
import { ClassRoster } from '../../features/students/ClassRoster';
import { OrganizationDashboard } from '../../features/dashboards/OrganizationDashboard';
import { HeadmasterDashboard } from '../../features/dashboards/HeadmasterDashboard';
import { CohortManager } from '../../features/schools/CohortManager';
import { CampusGapAnalysisPanel } from '../../features/assessments/CampusGapAnalysisPanel';
import { SenDashboard } from '../../features/sen-coordinator/SenDashboard';
import { PlaybookLiftLeaderboard } from '../../features/dashboards/PlaybookLiftLeaderboard';
import { FineTunePilotPanel } from '../../features/ai-tools/FineTunePilotPanel';
import { StaffDirectory } from '../../features/schools/StaffDirectory';
import { SchoolDirectory } from '../../features/schools/SchoolDirectory';
import { enterpriseNavForRole } from '../../auth/enterpriseAccess';
import { PendingAnalyses } from '../../features/assessments/PendingAnalyses';
import { OfflineQueuedModal } from '../OfflineQueuedModal';
import { useAssessment } from '../../context/AssessmentContext';
import { AuthProvider } from '../../context/AuthContext';
import { usePremiumTier } from '../../context/PremiumTierContext';
import { rtdb } from '../../lib/firebase';
import { TeacherLiveClassroomPanel } from '../../features/liveClassroom/TeacherLiveClassroomPanel';
import type { QueuedAssessment } from '../../services/core/offlineQueueService';
import type { BatchSyncProgress } from '../../hooks/useSyncManager';
import { SidebarNavLink } from './SidebarNavLink';
import { premiumClassNames } from '../premium/premiumClassNames';
import { PremiumHeaderChrome } from '../premium/PremiumHeaderChrome';
import { PremiumWelcomeBanner } from '../premium/PremiumWelcomeBanner';

export type View =
  | 'class-roster'
  | 'new-assessment'
  | 'student-profile'
  | 'pending-analyses'
  | 'org-admin-overview'
  | 'school-overview'
  | 'manage-classes'
  | 'staff-directory'
  | 'school-directory'
  | 'org-admin-campus-gaps'
  | 'org-admin-playbooks'
  | 'sen-inbox'
  | 'fine-tune-pilot'
  | 'live-classroom';

const DASHBOARD_CONFIG: Record<
  UserData['role'],
  { title: string; welcome: string; premiumTitle?: string; premiumWelcome?: string }
> = {
  teacher: { title: 'Classroom Dashboard', welcome: 'Here is your class overview.' },
  headteacher: { title: 'Headmaster Dashboard', welcome: 'Here is your school-wide performance overview.' },
  org_admin: { 
    title: 'School network overview', 
    welcome: "Performance and enrollment across your organization's branches.",
    premiumTitle: 'School network',
    premiumWelcome: 'Administrative overview across campuses and branches.'
  },
  sen_coordinator: { 
    title: 'SEN Coordination', 
    welcome: 'Review screening signals in regional context.',
    premiumTitle: 'Special Needs Coordination',
    premiumWelcome: 'Review screening signals and support context.'
  },
  super_admin: { title: 'Enterprise / MoE View', welcome: 'Cross-cutting analytics and governance tools.' },
};

export type LoggedInAppChromeProps = {
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

export function LoggedInAppChrome({
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
  const { isPremiumTier, isReady: premiumReady } = usePremiumTier();
  const showPremiumShell = premiumReady && isPremiumTier;
  const showLiveClassroom = showPremiumShell && Boolean(rtdb);
  const navVariant = showPremiumShell ? 'premium' : 'default';

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
      case 'org-admin-overview':
        return <OrganizationDashboard onSchoolClick={handleSchoolClick} />;
      case 'school-overview':
        return (
          <HeadmasterDashboard 
            overrideSchoolId={selectedSchoolForOverviewId || undefined} 
            onBack={selectedSchoolForOverviewId ? () => {
              setSelectedSchoolForOverviewId(null);
              setCurrentView(user.role === 'org_admin' ? 'org-admin-overview' : 'school-directory');
            } : undefined}
          />
        );
      case 'manage-classes':
        return <CohortManager />;
      case 'org-admin-campus-gaps':
        return <CampusGapAnalysisPanel user={user} />;
      case 'org-admin-playbooks':
        return <PlaybookLiftLeaderboard user={user} />;
      case 'sen-inbox':
        return <SenDashboard user={user} onAlertClick={handleViewProfile} />;
      case 'staff-directory':
        return <StaffDirectory user={user} />;
      case 'school-directory':
        return <SchoolDirectory user={user} onSchoolClick={handleSchoolClick} />;
      case 'fine-tune-pilot':
        return <FineTunePilotPanel />;
      case 'live-classroom':
        return <TeacherLiveClassroomPanel />;
      default:
        return <div className="p-12 text-center text-zinc-400">View under construction.</div>;
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
    if (showLiveClassroom && (role === 'teacher' || role === 'headteacher')) {
      primary.push({
        view: 'live-classroom',
        label: 'Live classroom',
        shortLabel: 'Live',
        icon: Zap,
      });
    }
    if (role === 'org_admin') {
      primary.push({
        view: 'org-admin-overview',
        label: 'Network Overview',
        shortLabel: 'Network',
        icon: Map,
      });
    }
    if (role === 'sen_coordinator') {
      primary.push({
        view: 'sen-inbox',
        label: 'SEN inbox',
        shortLabel: 'SEN',
        icon: HeartHandshake,
      });
    }
    if (role === 'super_admin') {
      primary.push({
        view: 'school-directory',
        label: 'Branch directory',
        shortLabel: 'Branches',
        icon: Building,
      });
    }

    const secondary: NavDef[] = [];
    if (role === 'org_admin') {
      secondary.push({
        view: 'school-directory',
        label: 'Branch directory',
        shortLabel: 'Branches',
        icon: Building,
      });
    }
    if (enterpriseNav.showCampusGapAnalysis) {
      secondary.push({
        view: 'org-admin-campus-gaps',
        label: 'Campus Gap Analysis',
        shortLabel: 'Gaps',
        icon: BarChart2,
      });
    }
    if (enterpriseNav.showPlaybooks) {
      secondary.push({
        view: 'org-admin-playbooks',
        label: 'Playbook lift',
        shortLabel: 'Lift',
        icon: BarChart3,
      });
    }
    if (enterpriseNav.showSenInbox && role !== 'sen_coordinator') {
      secondary.push({
        view: 'sen-inbox',
        label: 'SEN inbox',
        shortLabel: 'SEN',
        icon: HeartHandshake,
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
  }, [user.role, enterpriseNav.showCampusGapAnalysis, enterpriseNav.showPlaybooks, enterpriseNav.showSenInbox, showLiveClassroom]);

  const mobileNavItems = useMemo(
    () => [...primarySidebarNav, ...secondarySidebarNav],
    [primarySidebarNav, secondarySidebarNav]
  );

  return (
    <AuthProvider user={user}>
      <div
        className={
          showPremiumShell
            ? premiumClassNames.pageRoot
            : 'flex min-h-screen flex-col bg-gray-50 font-sans text-gray-900'
        }
      >
        {showPremiumShell ? (
          <PremiumHeaderChrome
            onLogout={handleLogout}
            user={user}
            isOffline={isOffline}
            setIsOffline={setIsOffline}
            queueLength={queueLength}
            isSyncing={isSyncing}
          />
        ) : (
          <Header
            onLogout={handleLogout}
            user={user}
            isOffline={isOffline}
            setIsOffline={setIsOffline}
            queueLength={queueLength}
            isSyncing={isSyncing}
          />
        )}

        <div className="flex min-h-0 flex-1 flex-col pt-14 sm:pt-16 md:flex-row">
          <aside
            className={
              showPremiumShell
                ? premiumClassNames.aside
                : 'hidden w-64 shrink-0 flex-col border-r border-zinc-200/60 bg-zinc-50/50 backdrop-blur-sm md:flex'
            }
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
                  variant={navVariant}
                  onClick={() => setCurrentView(item.view)}
                />
              ))}
              {secondarySidebarNav.length > 0 && (
                <div
                  className={
                    showPremiumShell
                      ? premiumClassNames.asideDivider
                      : 'my-2 border-t border-zinc-200/60 pt-2'
                  }
                  role="presentation"
                />
              )}
              {secondarySidebarNav.map((item) => (
                <SidebarNavLink
                  key={item.view}
                  icon={item.icon}
                  label={item.label}
                  active={currentView === item.view}
                  layout="sidebar"
                  variant={navVariant}
                  onClick={() => setCurrentView(item.view)}
                />
              ))}
            </nav>
          </aside>

          <div
            className={
              showPremiumShell
                ? premiumClassNames.mainColumn
                : 'flex min-h-0 min-w-0 flex-1 flex-col bg-zinc-50/30'
            }
          >
            <main
              className={
                showPremiumShell
                  ? premiumClassNames.main
                  : 'mx-auto w-full max-w-7xl flex-1 overflow-y-auto px-4 pb-24 pt-4 sm:px-6 sm:pt-6 md:pb-12 lg:px-8'
              }
            >
              {syncToast && (
                <div
                  className={
                    showPremiumShell
                      ? premiumClassNames.syncToast
                      : 'mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-sm'
                  }
                >
                  {syncToast.message}
                </div>
              )}
              {showPremiumShell ? (
                <PremiumWelcomeBanner
                  title={DASHBOARD_CONFIG[user.role].premiumTitle || DASHBOARD_CONFIG[user.role].title}
                  welcome={DASHBOARD_CONFIG[user.role].premiumWelcome || DASHBOARD_CONFIG[user.role].welcome}
                  userName={user.name}
                />
              ) : (
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
                    {DASHBOARD_CONFIG[user.role].title}
                  </h2>
                  <p className="mt-0.5 text-sm text-zinc-500 sm:mt-1 sm:text-base">
                    Welcome back, {user.name}. {DASHBOARD_CONFIG[user.role].welcome}
                  </p>
                </div>
              )}

              <AnimatePresence mode="wait">
              <m.div
                key={currentView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </m.div>
              </AnimatePresence>
            </main>
          </div>

          <nav
            className={showPremiumShell ? premiumClassNames.mobileNavWrap : 'fixed bottom-4 left-1/2 z-40 -translate-x-1/2 md:hidden'}
            aria-label="Main navigation"
          >
            <div
              className={
                showPremiumShell
                  ? premiumClassNames.mobileNavPill
                  : 'flex gap-1 overflow-x-auto rounded-full px-2 py-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden glass shadow-soft'
              }
            >
              {mobileNavItems.map((item) => (
                <SidebarNavLink
                  key={item.view}
                  icon={item.icon}
                  label={item.shortLabel}
                  title={item.label}
                  active={currentView === item.view}
                  layout="mobile"
                  variant={navVariant}
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