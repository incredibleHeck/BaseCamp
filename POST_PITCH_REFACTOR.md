# Post-Pitch Refactor Plan

> Execute this plan on Friday after winning the grant.

**Refactor implementation (code splits):** completed in-repo; **§5 manual smoke tests** still recommended before release.

---

## Executive Summary

Several files in the BaseCamp codebase have grown into "god files"—doing too much, with too many lines, making them harder to maintain, test, and extend. This document outlines a concrete refactoring plan.

---

## Refactoring Candidates

| File | Lines | Priority | Status |
|------|-------|----------|--------|
| `src/components/StudentProfile.tsx` | ~1,020 → slim orchestrator + modules | High | **Done** — see extractions below |
| `src/services/aiPrompts.ts` | ~530 → `src/services/aiPrompts/` | Medium | **Done** |
| `src/components/AnalysisResults.tsx` | ~500 → hook + card | Lower | **Done** — `useAnalysisFlow.ts` + `DiagnosticReportCard.tsx` |

---

## 1. StudentProfile.tsx (High Priority)

**Current state:** ~1,020 lines. Single component handling student selection, two view modes, longitudinal history, JHS readiness, SEN screening, PDF export, lesson plan printing, worksheet generation/printing, and a worksheet modal.

### Responsibility breakdown

| Responsibility | Lines (approx) |
|----------------|----------------|
| Data models & helpers | ~60 |
| State & effects | ~90 |
| PDF export (`handleExportPdf`) | ~75 |
| Lesson plan print (`handlePrintLessonPlan`) | ~30 |
| Worksheet print (`printWorksheetToWindow`) | ~55 |
| Regenerate lesson plan | ~25 |
| Generate practice sheet | ~30 |
| Analytical view (history, readiness, SEN, gaps) | ~350 |
| Action plan view (intervention cards) | ~180 |
| Worksheet modal | ~65 |

### Extractions

| New file | Purpose |
|----------|---------|
| `src/components/StudentProfileAnalyticalView.tsx` | Longitudinal history, JHS readiness, SEN screening, gaps & mastery |
| `src/components/StudentProfileActionPlanView.tsx` | Intervention cards and actions |
| `src/hooks/useStudentProfileData.ts` | Data fetching, derived values (`gapInterventions`, `recentGaps`, etc.) |
| `src/utils/pdfExport.ts` | PDF generation logic |
| `src/utils/printUtils.ts` | Lesson plan and worksheet print helpers |
| `src/components/WorksheetModal.tsx` | Worksheet preview/print modal |

### Post-pitch improvement: Offline KaTeX for all print/export surfaces

The worksheet print view now renders LaTeX fractions offline (no CDN) using bundled KaTeX/Markdown rendering. **Apply the same approach to:**

- **PDF export (`handleExportPdf`)**: If we ever include math expressions in exported PDFs, ensure LaTeX is rendered offline (either by pre-rendering to KaTeX HTML and converting, or by adding a KaTeX-aware PDF strategy).
- **Lesson plan print (`handlePrintLessonPlan`)**: If lesson plan content contains LaTeX, render it offline before printing (no network assumptions).

### Refactored StudentProfile.tsx

- Orchestrates: student selector, view toggle, data hook, export button
- Passes props to `StudentProfileAnalyticalView` and `StudentProfileActionPlanView`
- Renders `WorksheetModal` when `activeWorksheet` is set
- Target: ~200–250 lines

---

## 2. aiPrompts.ts (Medium Priority)

**Current state:** ~530 lines. Single service module with all AI-related functions. Cohesive but large; split by domain improves maintainability.

### Functions

- `analyzeWorksheet` (single image)
- `analyzeWorksheetMultiple` (multi-page)
- `analyzeManualEntry`
- `generateRemedialLessonPlan`
- `generatePracticeWorksheet`
- `analyzeLongitudinalSEN`
- Shared utilities: `cleanJsonResponse`, `normalizeTagArray`, `getDialectInstruction`

### New module structure

```
src/services/aiPrompts/
├── index.ts              # Re-exports for backward compatibility
├── utils.ts              # cleanJsonResponse, normalizeTagArray, getDialectInstruction
├── worksheetAnalysis.ts  # analyzeWorksheet, analyzeWorksheetMultiple, analyzeManualEntry
├── lessonPlan.ts         # generateRemedialLessonPlan
├── worksheetGeneration.ts # generatePracticeWorksheet
└── senAnalysis.ts        # analyzeLongitudinalSEN
```

### Migration

- Existing imports from `../services/aiPrompts` continue to work via `index.ts`
- No changes needed in consuming components

---

## 3. AnalysisResults.tsx (Lower Priority)

**Current state:** ~444 lines. Single flow: analysis → results → save. Reasonable cohesion, but could be split for clarity.

### Optional extractions

| New file | Purpose |
|----------|---------|
| `src/components/DiagnosticReportCard.tsx` | Report display UI |
| `src/hooks/useAnalysisFlow.ts` | Analysis orchestration and state |

### When to do this

- When adding new analysis flows or UI variants
- When tests become hard to write for this component

---

## 4. Execution Order

Recommended sequence for Friday:

1. **aiPrompts.ts** – Split into `aiPrompts/` module. No UI changes; verify imports work.
2. **PDF & print utils** – Extract `pdfExport.ts` and `printUtils.ts` from StudentProfile.
3. **WorksheetModal** – Extract modal component.
4. **useStudentProfileData** – Extract data hook and derived values.
5. **StudentProfileAnalyticalView** – Extract analytical view.
6. **StudentProfileActionPlanView** – Extract action plan view.
7. **Slim StudentProfile** – Wire everything together and remove duplicated logic.
8. **AnalysisResults** (optional) – Extract `DiagnosticReportCard` and `useAnalysisFlow` if time permits. ✅ Implemented: `src/hooks/useAnalysisFlow.ts`, `src/components/DiagnosticReportCard.tsx`, thin `AnalysisResults.tsx`.

---

## 5. Verification Steps

After each refactor:

- [ ] `npm run build` succeeds
- [ ] `npm run dev` runs without errors
- [ ] Student profile: select student, switch between Data View and Action Plan
- [ ] Student profile: export PDF, print lesson plan, generate/print worksheet
- [ ] Student profile: run SEN analysis (when history has 3+ assessments)
- [ ] Assessment flow: run AI diagnosis (image, multi-image, manual), save and view
- [ ] No console errors or regressions in the UI

---

## 6. When to Refactor

**Refactor when:**

- Adding features to StudentProfile or aiPrompts
- Tests are hard to write or maintain
- Multiple people work on the same file
- You're fixing bugs and navigation is slow

**Defer when:**

- Code is stable and rarely touched
- Close to a deadline
- Team is small and everyone knows the file

---

*Good luck with the pitch. See you Friday.*
