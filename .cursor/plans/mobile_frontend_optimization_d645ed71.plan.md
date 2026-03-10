---
name: Mobile frontend optimization
overview: Make all key buttons and features visible and usable on mobile by removing or adjusting responsive hide rules, improving touch targets, and ensuring tables and navigation work on small screens.
todos: []
isProject: false
---

# Mobile Frontend Optimization Plan

## Current issues (from codebase review)

- **Header**: Network status and role/location are hidden on small screens (`hidden md:flex`, `hidden sm:flex`).
- **Class Roster**: "Add Student" is hidden on mobile (`hidden sm:flex`); action buttons show only icons on small screens (`hidden lg:inline`); table columns "Last Assessment" and "Active Gap" are hidden on mobile.
- **Student Profile**: "Export" button is hidden on mobile (`hidden sm:inline-flex`).
- **Teacher Directory**: Contact column hidden on small screens; table container may not scroll horizontally.
- **Touch targets**: Many buttons use `py-1.5` / `py-2`; primary actions should be at least ~44px for touch.
- **Offline banner**: Long text may not wrap well on very narrow screens.

## 1. Header – show on mobile

**File:** [src/components/Header.tsx](src/components/Header.tsx)

- **Network indicator** (line 87): Change `hidden md:flex` to always show. On mobile use a compact version: icon + status dot only (no "Online & Synced" text), or keep text and allow wrap. Use `flex` and optionally `text-xs` so it fits.
- **Role/location** (lines 100–107): Change `hidden sm:flex` to always show. On very small screens use a single line (e.g. role only) or smaller text so it doesn’t crowd the avatar/logout. For example: `flex` with `flex-col items-end` and on mobile (`max-sm:`) show only role or abbreviate location.

## 2. Class Roster – Add Student and actions

**File:** [src/components/ClassRoster.tsx](src/components/ClassRoster.tsx)

- **Add Student** (line 131–136): Remove `hidden sm:flex` so the button is visible on all screen sizes. Use `flex` and keep icon + "Add Student" (or on very small screens icon + "Add" via responsive text). Ensure the button is full-width on mobile or sits clearly next to the search (e.g. stack search and button on small screens with `flex-col sm:flex-row` already in parent).
- **Action buttons** (Assess / Profile, lines 184–198): Keep `opacity-100 sm:opacity-0 group-hover:opacity-100` so they’re always visible on mobile. Optionally show "Assess" and "Profile" text on mobile: change `hidden lg:inline` to `inline` (or use a breakpoint that shows text on xs/sm) so teachers see labels, not only icons.
- **Touch targets**: For the Add Student and row action buttons, add `min-h-[44px]` (or `py-2.5` / `py-3`) and adequate horizontal padding on small screens so they meet ~44px minimum touch target.
- **Table**: Keep "Last Assessment" and "Active Gap" hidden on smallest screens if needed for space, but ensure the wrapper has `overflow-x-auto` (already at line 140) so horizontal scroll works. Optionally add a mobile-friendly row layout (e.g. card per student on xs) only if the table still feels cramped; otherwise leave table as-is with horizontal scroll.

## 3. Student Profile – Export on mobile

**File:** [src/components/StudentProfile.tsx](src/components/StudentProfile.tsx)

- **Export button** (line 224): Change `hidden sm:inline-flex` to `inline-flex` so it shows on mobile. Use a compact label on small screens (e.g. "Export" or icon-only with `aria-label="Export"`) and ensure `min-h-[44px]` or equivalent for touch.

## 4. Teacher Directory – table on mobile

**File:** [src/components/TeacherDirectory.tsx](src/components/TeacherDirectory.tsx)

- Ensure the table wrapper allows horizontal scroll: add `overflow-x-auto` to the container that wraps the `<table>` (e.g. the existing `overflow-hidden` div at line 34), or use a dedicated scroll wrapper so on narrow screens the table scrolls instead of overflowing.
- Contact column can stay `hidden sm:table-cell` to save space; no change required unless you want it visible (e.g. in a detail view later).

## 5. Analysis Results – touch and layout

**File:** [src/components/AnalysisResults.tsx](src/components/AnalysisResults.tsx)

- **Guardian Communication / Save to Profile** (lines 285–307): Already `flex-col sm:flex-row`; ensure buttons are full-width on mobile and have adequate tap size: add `min-h-[44px]` and `w-full sm:w-auto` (or similar) so they stack and are easy to tap.
- **Print Activity / Regenerate**: Same idea – ensure `min-h-[44px]` or `py-2.5` for primary actions so they’re comfortable on touch devices.

## 6. App layout and nav

**File:** [src/App.tsx](src/App.tsx)

- **Nav tabs** (lines 191–206): Container already has `overflow-x-auto`; ensure tabs don’t shrink too much on mobile. Add `min-w-0` to the nav flex child if needed and use `whitespace-nowrap` on tab labels (already on NavTab) so scrolling works. Optionally reduce padding on tabs for small screens (e.g. `px-2 sm:px-4`) so more tabs fit.
- **Main content**: New Assessment uses `grid grid-cols-1 lg:grid-cols-3`; on mobile the two panels stack. Ensure spacing (`gap-6`, `pb-12`) gives enough scroll room; no structural change required.

## 7. Global touch and safe area

- **Shared approach**: Add a small utility or convention for primary actions: use `min-h-[44px] min-w-[44px]` (or `py-3` where appropriate) for buttons that are primary on mobile (Add Student, Run AI Diagnosis, Save, Guardian Communication, Export, Print, Regenerate). Apply in the components above.
- **Viewport**: [index.html](index.html) already has `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`. Optionally add `viewport-fit=cover` and padding for safe areas (e.g. `env(safe-area-inset-bottom)`) on fixed headers/footers if you target notched devices; can be a follow-up.

## 8. Offline banner

**File:** [src/components/Header.tsx](src/components/Header.tsx)

- Shorten or make responsive: e.g. on mobile show "Offline. Will sync when back online." and keep longer text for larger screens, or use `text-xs` and allow two lines on narrow viewports so the banner doesn’t overflow.

## Implementation order


| Step | Task                                                                         | File(s)              |
| ---- | ---------------------------------------------------------------------------- | -------------------- |
| 1    | Header: show network + role on mobile; compact/adaptive text                 | Header.tsx           |
| 2    | Class Roster: show Add Student on mobile; improve action button labels/touch | ClassRoster.tsx      |
| 3    | Student Profile: show Export on mobile; touch target                         | StudentProfile.tsx   |
| 4    | Teacher Directory: overflow-x-auto for table                                 | TeacherDirectory.tsx |
| 5    | Analysis Results: full-width stacked buttons + touch targets                 | AnalysisResults.tsx  |
| 6    | App: nav tab padding/scrolling if needed                                     | App.tsx              |
| 7    | Offline banner: shorter or responsive text                                   | Header.tsx           |


## Out of scope (optional later)

- Card-based roster layout for very small screens (e.g. replace table with cards on xs).
- Contact column visible on mobile in Teacher Directory.
- Dedicated "mobile menu" for nav (current horizontal scroll is acceptable for 3–4 tabs).

## Summary

- Remove or relax `hidden sm:` / `hidden md:` for key controls (Add Student, Export, network, role).
- Ensure primary buttons have ~44px touch targets and, where needed, full-width on mobile.
- Keep tables scrollable horizontally where content is wide; keep critical columns visible or summarized on mobile.
- Shorten or adapt offline banner for narrow screens.

