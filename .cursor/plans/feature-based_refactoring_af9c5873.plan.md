---
name: Feature-Based Refactoring
overview: Refactor the flat `src/components` and `src/services` directories into a feature-based architecture to improve maintainability and scalability.
todos:
  - id: create-feature-dirs
    content: Create feature directories (dashboards, students, assessments, schools, ai-tools)
    status: completed
  - id: move-dashboards
    content: Move dashboard components and update imports
    status: completed
  - id: move-students
    content: Move student components and update imports
    status: completed
  - id: move-assessments
    content: Move assessment components and update imports
    status: completed
  - id: move-schools
    content: Move school components and update imports
    status: completed
  - id: move-ai-tools
    content: Move AI tool components and update imports
    status: completed
  - id: organize-layout
    content: Organize shared layout components and update imports
    status: completed
  - id: organize-services
    content: Organize services into analytics, ai, and core subdirectories and update imports
    status: completed
  - id: verify-build
    content: Run build/typecheck to verify all imports are correct
    status: completed
isProject: false
---

# Feature-Based Refactoring Plan

This plan will restructure the codebase from a flat component/service structure into a feature-based architecture.

## 1. Create Feature Directories

Create the following directories under `src/features/`:

- `dashboards/`
- `students/`
- `assessments/`
- `schools/`
- `ai-tools/`

## 2. Move Components to Features

Move components from `src/components/` to their respective feature directories:

- **dashboards**: `OrganizationDashboard.tsx`, `NetworkBranchKPIs.tsx`, `HeadmasterDashboard.tsx`, `PlaybookLiftLeaderboard.tsx`
- **students**: `StudentProfile.tsx`, `AddStudentForm.tsx`, `StudentRecordCard.tsx`, `ClassRoster.tsx`, `StudentPortalApp.tsx`
- **assessments**: `AssessmentSetup.tsx`, `DiagnosticReportCard.tsx`, `CampusGapAnalysisPanel.tsx`, `WorksheetModal.tsx`, `PendingAnalyses.tsx`
- **schools**: `SchoolDirectory.tsx`, `StaffDirectory.tsx`, `TeacherDirectory.tsx`, `CohortManager.tsx`, `CreateCohortDialog.tsx`
- **ai-tools**: `FineTunePilotPanel.tsx`, `VoiceObservationRecorder.tsx`, `ExtensionActivityMarkdown.tsx`

## 3. Organize Shared Components

- Create `src/components/layout/` and move `Header.tsx`, `ErrorBoundary.tsx` into it.
- Keep primitive UI components in `src/components/ui/`.

## 4. Organize Services

Create subdirectories in `src/services/` and move related services:

- **analytics/**: `organizationAnalyticsService.ts`, `schoolAnalyticsService.ts`, `playbookAnalyticsService.ts`
- **ai/**: Move `aiPrompts/` directory here, along with `fineTunePilotService.ts`, `curriculumRagService.ts`
- **core/**: `offlineQueueService.ts`, `portalSessionService.ts`, `whatsappConnectService.ts`

## 5. Update Imports

Systematically update all import paths across the application to reflect the new directory structure. Ensure the application builds and runs without errors.