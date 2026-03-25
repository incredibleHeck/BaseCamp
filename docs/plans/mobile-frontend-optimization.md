# Mobile frontend optimization

**Goal:** Make key buttons and features visible and usable on mobile: adjust responsive `hidden` rules, improve touch targets (~44px), and keep tables/nav usable on small screens.

## Current issues (from codebase review)

- **Header**: Network and role/location hidden on small screens.
- **Class Roster**: “Add Student” hidden on mobile; row actions icon-only; some columns hidden.
- **Student Profile**: Export hidden on mobile.
- **Staff Directory**: Table may need horizontal scroll.
- **Touch targets**: Many buttons too small for touch.
- **Offline banner**: Long copy may overflow on narrow screens.

## 1. Header

**File:** `src/components/Header.tsx`

- Show network indicator on mobile (compact: icon + dot if needed).
- Show role/location with smaller or abbreviated text on narrow viewports.

## 2. Class Roster

**File:** `src/components/ClassRoster.tsx`

- Show “Add Student” on all breakpoints.
- Keep row actions visible on mobile; optional text labels for Assess/Profile.
- `min-h-[44px]` on primary actions; ensure `overflow-x-auto` on table.

## 3. Student Profile

**File:** `src/components/StudentProfile.tsx`

- Show Export on mobile; compact label or icon + `aria-label`.

## 4. Staff Directory

**File:** `src/components/StaffDirectory.tsx`

- Wrap table in `overflow-x-auto` so narrow screens scroll horizontally.

## 5. Analysis Results

**File:** `src/components/AnalysisResults.tsx`

- Full-width stacked buttons on mobile; `min-h-[44px]` on primary actions.

## 6. App layout

**File:** `src/App.tsx`

- Nav: `overflow-x-auto`, `whitespace-nowrap` on tabs; optional tighter padding on small screens.

## 7. Global

- Convention: `min-h-[44px]` for primary actions on mobile.
- Viewport: ensure `width=device-width` in `index.html`; optional safe-area follow-up.

## 8. Offline banner

- Shorter copy on mobile vs desktop.

## Implementation order

| Step | Task | File(s) |
| ---- | ---- | ------- |
| 1 | Header: network + role on mobile | Header.tsx |
| 2 | Roster: Add Student + actions | ClassRoster.tsx |
| 3 | Student Profile: Export + touch | StudentProfile.tsx |
| 4 | Staff Directory: horizontal scroll | StaffDirectory.tsx |
| 5 | Analysis Results: touch targets | AnalysisResults.tsx |
| 6 | App nav tweaks | App.tsx |
| 7 | Offline banner | Header.tsx |

## Out of scope (optional later)

- Card-based roster on xs.
- Contact column always visible on mobile.
- Dedicated hamburger nav (horizontal tab scroll is OK for few tabs).

## Source

Derived from `.cursor/plans/mobile_frontend_optimization_*.plan.md`.
