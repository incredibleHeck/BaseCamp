# Phase 3: “Premium” Enterprise / NGO Dashboard (V3.0 – B2G Scale)

**Vision:** Scale BaseCamp from classroom workflow to **district, national, and partner** visibility—so NGOs and the Ministry of Education (MoE) can allocate resources, prove impact, and intervene early.

**Positioning:** This tier is where **B2G (business-to-government)** and **large NGO** contracts typically land: aggregated analytics, compliance-friendly reporting, and operational tooling for directors and coordinators—not individual lesson planning alone.

**Implementation (current repo):** Multi-branch / “network” scope is modeled with **`organizationId`** in Firestore and JWT claims (`AuthContext` maps legacy `districtId` claims to `organizationId`). Network rollups use [`organizationAnalyticsService.ts`](../../src/services/analytics/organizationAnalyticsService.ts) (`getNetworkMetrics`).

### Campus Gap Analysis (MVP in-app, B2B / multi-campus)

The **shipped** network analytics view is **Campus Gap Analysis** (not a geographic map): per-**branch** (`schoolId`) gap rollups via [`buildBranchGapRollups`](../../src/services/analytics/organizationAnalyticsService.ts), minimum-*n* suppression (`AGGREGATION_MIN_N`), Recharts comparison + data table, and CSV ([`branchGapRowsToCsv`](../../src/services/analytics/organizationAnalyticsService.ts)). UI: [`CampusGapAnalysisPanel.tsx`](../../src/features/assessments/CampusGapAnalysisPanel.tsx). App shell view key **`org-admin-campus-gaps`**; enterprise nav flag **`showCampusGapAnalysis`** in [`enterpriseAccess.ts`](../../src/auth/enterpriseAccess.ts). The old schematic circuit SVG and `demoCircuitMap` assets were **removed** in favor of branch-level analytics. **Pillar 1** below remains the long-term **B2G** geospatial roadmap (boundaries, MapLibre/Mapbox, etc.).

---

## Pillar 1: Geospatial risk heatmaps

### Problem

District directors and partners need to see **where** learning gaps cluster—not only district-wide averages. “Fraction subtraction is weak” is more actionable when tied to **circuits, schools, or catchment areas**.

### Product goal

- A **district-level dashboard** that plots **learning gap intensity** on a **map of the district** (or administrative boundaries you have permission to use).
- Example insight: if **~80% of students** in a **specific circuit** are failing a skill such as **“Fraction Subtraction,”** that area is highlighted (e.g. **red** severity band).
- Enables partners (e.g. UNICEF) to **target deployments**: specialized math coaches, materials, or training **in the exact geography** that needs it.

### Technical building blocks

| Area | Direction |
| ---- | --------- |
| Geo data | School/circuit polygons or centroid points; stable IDs aligned to MoE/GES administrative codes where available. |
| Metrics | Roll up anonymized or permissioned student/school stats by geography: skill tags, mastery rates, trend windows. |
| Map stack | MapLibre/Leaflet + vector tiles, or Mapbox (licensing); choropleth by circuit + drill-down to school list. |
| Privacy | **Aggregation thresholds** (suppress small *n*); role-based access (district vs school); data processing agreements for B2G. |
| Data pipeline | ETL from Firestore/BigQuery: nightly or streaming aggregates; cache for fast map loads. |

### Risks / open questions

- Accurate **boundary data** and permission to display it.
- **Small *n* suppression** to avoid identifying vulnerable schools/students on the map.
- Partner expectation: **export** of map snapshots + underlying tables for grant reporting.

### Success metrics (suggested)

- Time from “we need to deploy coaches” to **geographically targeted** list of circuits/schools.
- Partner satisfaction with **exportable** district heatmap reports.

---

## Pillar 2: Longitudinal SEN tracking & alerts

### Problem

Special Educational Needs (SEN) risk is often caught late. BaseCamp already produces rich signals; Phase 3 **automates escalation** when patterns persist.

### Product goal

- Automate **deep pattern analysis** across time: e.g. if **three consecutive assessments** for a learner show **dyscalculia-relevant traits** (or your validated rubric), the system **raises an alert**.
- Route the alert to the district’s **SEN Coordinator** (and optionally the headteacher) for **early intervention**—referral workflow, not a medical diagnosis.
- Maintain an **audit trail**: what triggered the alert, which assessments, human review status.

### Technical building blocks

| Area | Direction |
| ---- | --------- |
| Rules engine | Configurable thresholds (consecutive count, confidence scores, skill tags); versioned rule packs per jurisdiction. |
| Longitudinal store | Per-student timeline of assessments + extracted features (gap tags, scores, optional SEN risk scores from model). |
| Notifications | In-app + email/SMS/WhatsApp (via provider); escalation SLAs; read receipts for coordinators. |
| Governance | **Human-in-the-loop** confirmation; legal disclaimers; opt-in from schools/parents where required. |

### Guardrails

- Frame outputs as **screening / educational signals**, not clinical labels.
- Allow coordinators to **dismiss, snooze, or escalate** with reasons.

### Success metrics (suggested)

- Median time from pattern detection to coordinator acknowledgment.
- Reduction in preventable learning drift (proxy: follow-up assessment improvement).

---

## Pillar 3: A/B testing remedial playbooks

### Problem

Many remedial activities are proposed; few are measured **at scale** across teachers and regions.

### Product goal

- Track **which remedial playbooks** (e.g. “Bottle Cap Fractions” vs “Paper Strip Fractions”) are assigned and what happens on **follow-up assessments**.
- If one playbook consistently yields **better score gains** or **gap closure** on the same skill, the system **learns** and **suggests** the higher-performing option to **other teachers nationally** (with context: grade, subject, gap tag).

### Technical building blocks

| Area | Direction |
| ---- | --------- |
| Experimentation | Randomized or “bandit” assignment where ethical; at minimum **observational** comparison with propensity controls. |
| Attribution | Link playbook ID → intervention events → subsequent assessment outcomes (same skill tags). |
| Analytics | Cohort dashboards; confidence intervals; minimum sample sizes before recommending at scale. |
| AI layer | Re-rank suggested playbooks using **empirical lift** + teacher context; always show **why** (effect size, *n*). |

### Ethics / trust

- Avoid **harmful generalization** across contexts (language, resources, urban/rural).
- Transparent **“evidence strength”** so MoE/NGOs trust recommendations.

### Success metrics (suggested)

- Lift in follow-up scores for recommended vs baseline playbooks.
- Adoption rate of suggested playbooks when offered.

---

## Cross-cutting themes (enterprise tier)

- **Role model**: Super-admin (MoE), district director, circuit supervisor, school head, SEN coordinator, teacher—with strict RBAC.
- **Data contracts**: APIs or scheduled exports for NGO/MoE BI tools; optional **de-identified** research datasets.
- **SLAs & audit**: Who saw what alert, when exports ran, map refresh cadence.

---

## Suggested implementation order

1. **Foundations** – consistent identifiers (school, circuit, **organization** / network id), assessment history API, RBAC for org-level roles (`org_admin`, coordinators, super admin).
2. **SEN alert MVP** – rule engine + coordinator inbox + audit log (highest direct impact on safeguarding narrative).
3. **Campus / district analytics MVP** – In-repo: **branch-level** gap analysis + suppression + export; B2G **choropleth** remains a follow-on (see Pillar 1).
4. **Playbook analytics MVP** – log playbook usage + outcomes; simple leaderboard; then ML/ranking.

*(Order may change if geo boundary licensing or partner contract requires maps first.)*

---

## Related documents

- [Phase 2 – Pro Teacher Tools (V2.0)](phase-2-pro-teacher-tools-v2.md) – teacher-scale workflow that feeds the data needed for organization-level aggregates and playbook outcomes.

---

## Implementation status (MVP shipped in repo)

Aligned with **suggested implementation order** in this doc: foundations → SEN → **campus gap analysis (branch rollups in-app)** → playbook lift (client-side / Firestore demo; B2G geo map not in production yet).

| Track | What shipped | Key files |
| ----- | ------------- | --------- |
| **Foundations** | Student org fields + defaults; `users` docs use **`organizationId`** (legacy `districtId` still merged on read); optional `circuitId`, `schoolId`; network dashboard rollups from Firestore; RBAC-driven tabs. | [`organizationDefaults.ts`](../../src/config/organizationDefaults.ts), [`organizationAnalyticsService.ts`](../../src/services/analytics/organizationAnalyticsService.ts), [`schoolAnalyticsService.ts`](../../src/services/schoolAnalyticsService.ts), [`enterpriseAccess.ts`](../../src/auth/enterpriseAccess.ts), [`App.tsx`](../../src/App.tsx) |
| **SEN alerts** | Rule pack v1: 3 consecutive numeracy assessments matching text + low score → `senAlerts` document; dismiss / snooze / escalate + audit log entries. | [`senAlertService.ts`](../../src/services/senAlertService.ts), [`SenAlertsInbox.tsx`](../../src/features/sen-coordinator/SenAlertsInbox.tsx) |
| **Campus Gap Analysis** | **Branch** (`schoolId`) rollups; **minimum-n suppression**; skill filter; Recharts + table; **CSV** export. | [`CampusGapAnalysisPanel.tsx`](../../src/features/assessments/CampusGapAnalysisPanel.tsx), [`organizationAnalyticsService.ts`](../../src/services/analytics/organizationAnalyticsService.ts) (`buildBranchGapRollups`, `branchGapRowsToCsv`) |
| **Playbook analytics** | `playbookKey` from remedial activity title on save; **mean score delta** on next same-subject assessment; evidence strength by *n*. | [`playbookKey.ts`](../../src/utils/playbookKey.ts), [`playbookAnalyticsService.ts`](../../src/services/playbookAnalyticsService.ts), [`PlaybookLiftLeaderboard.tsx`](../../src/features/dashboards/PlaybookLiftLeaderboard.tsx) |

**Demo login:** Extra tiles for SEN Coordinator, Circuit Supervisor, MoE/Super Admin (`*@basecamp.com` — create users + `users/{uid}.role` in Firebase). Optional **seed** path in [`Login.tsx`](../../src/components/Login.tsx) wipes `senAlerts` and seeds org-tagged students + one SEN workflow row.

**Follow-ups (not MVP):** Real boundary GeoJSON / MapLibre; server-side aggregates & RBAC in **Firestore rules**; email/SMS; randomized trials; propensity / bandit ranking.
