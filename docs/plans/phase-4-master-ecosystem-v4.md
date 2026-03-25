# Phase 4: The “Master” Ecosystem (V4.0 – The Complete Loop)

**Vision:** Move BaseCamp **beyond the teacher’s phone** into **homes** and **school computer labs**, closing the loop between diagnosis, family engagement, and student-facing practice—while building a **long-term proprietary AI asset** grounded in Ghanaian classroom data.

**North star:** Parents get **actionable, low‑cost** support in their language; students get **guided practice** at school; the platform becomes the **default ecosystem** for learning support in Ghana.

---

## Pillar 1: HeckTeck Connect (WhatsApp parent bot)

### Problem

Parents often lack visibility into weekly progress and practical ways to help at home—especially when information arrives only in English or through paper handouts.

### Product goal

- **Automatically** turn each student’s **weekly progress summary** into a short, parent-friendly message.
- **Translate** into the guardian’s **preferred language** (e.g. **Twi, Ga, Ewe**) with clear, simple wording.
- **Deliver via WhatsApp** (high reach, low friction on phones parents already use).
- Include **zero- or low-cost home activities**, e.g.  
  *“Ask Ama to help you count the plantains using fractions today.”*

### Technical building blocks

| Area | Direction |
| ---- | --------- |
| Messaging | WhatsApp Business API / Meta Cloud API (or approved BSP); template messages for compliance; opt-in/opt-out flows. |
| Identity | Verified guardian phone + student linkage; consent and data retention policy. |
| Localization | **Machine translation** + human-reviewed phrase bank for high-stakes terms; dialect-aware glossaries where Phase 2 ESL work already exists. |
| Content generation | Weekly digest from assessments + teacher notes; structured prompts; guardrails against medical claims. |
| Scheduling | Cron/Cloud Functions: weekly batch per class/student; retry and delivery receipts. |

### Risks / open questions

- **Meta** policy and template approval for education content.
- **Translation quality** for low-resource languages—pair MT with curated templates.
- **Cost** per message at scale vs SMS fallback.

### Success metrics (suggested)

- Guardian **open rate** and **reply rate** (where allowed).
- Reported parent understanding (short survey).
- Teacher time saved vs manual SMS.

---

## Pillar 2: The student portal (companion PWA)

### Problem

Remedial work often stays on paper. Schools with **computer labs** can offer **interactive practice**, but BaseCamp today is teacher-centric.

### Product goal

- A **Progressive Web App (PWA)** for **students** (school-managed devices or BYOD where policy allows).
- Students log in (or **class codes** + minimal PII per school policy).
- **AI generates interactive, gamified** versions of **remedial worksheets** aligned to their gaps.
- **Step-by-step tutoring** through problems—bringing **“A* extension activities”** (or equivalent enrichment) to life with hints, scaffolding, and adaptive difficulty.

### Technical building blocks

| Area | Direction |
| ---- | --------- |
| PWA | Service worker, offline shell, install prompt; lightweight for low-bandwidth. |
| Auth | School SSO later; MVP: teacher-provisioned student accounts or shared lab login. |
| Content generation | Same `DiagnosticReport` / gap tags → generate items; KaTeX/math where needed (already in stack). |
| Pedagogy | Mastery tracking, wrong-answer explanations, “next best question” from playbook library (ties to Phase 3). |
| Safety | Content filters; session timeouts; no unsupervised chat with open-ended internet unless approved. |

### Risks / open questions

- **COPPA / child data** and school consent; age-appropriate UX.
- Lab device management (shared tablets vs desktops).

### Success metrics (suggested)

- Time on task per student.
- Pre/post improvement on the same skill tags after portal sessions.
- Teacher adoption of “assign to portal” vs print-only.

---

## Pillar 3: Continuous local model fine-tuning

### Problem

Reliance on **large enterprise APIs** is costly at scale and limits customization. A **Ghana-specific** corpus is a strategic moat.

### Product goal

- Train or fine-tune a **smaller, specialized model** on **aggregated Ghanaian worksheet and assessment data** (with proper consent and governance).
- **Reduce** cost and latency for high-volume tasks (e.g. tagging, short explanations, item generation).
- Build a **proprietary asset**: domain-tuned behavior that generic competitors cannot replicate without similar data.

### Technical building blocks

| Area | Direction |
| ---- | --------- |
| Data pipeline | De-identified text/images; curriculum alignment; versioning; opt-out handling. |
| Training | Supervised fine-tuning, LoRA/QLoRA on open models; evaluation harness against held-out Ghanaian sets. |
| Serving | Dedicated inference endpoint (GPU or serverless); fallback to cloud APIs when needed. |
| Governance | Ethics review, bias audit, MoE/partner alignment on use of student-derived data. |

### Risks / open questions

- **Legal** basis for training on user content (terms of service, DPIA).
- **Data quality** and label noise; need for human validation loops.
- **Model drift** as curriculum changes.

### Success metrics (suggested)

- **$/1M tokens** or equivalent cost reduction on targeted tasks.
- **Accuracy** on Ghana-specific benchmarks vs general-purpose models.
- Partner story: “**Ghana-trained** layer” as IP.

---

## Cross-cutting themes (complete loop)

- **Unified identity**: student ↔ guardian ↔ teacher ↔ school ↔ district (with strict data minimization).
- **One loop**: diagnose → remediate → practice (portal) → report home (WhatsApp) → measure improvement.
- **Phase alignment**: Phases 2–3 feed **content** (RAG, playbooks) and **scale** (aggregates); Phase 4 completes **distribution** to families and learners.

---

## Suggested implementation order

1. **Foundations** – guardian phone + consent model; student account schema; WhatsApp sandbox + one template message.
2. **HeckTeck Connect MVP** – weekly digest in one additional language; measure delivery and quality.
3. **Student portal MVP** – one subject/skill path; gamified items from existing gap tags; teacher assigns from dashboard.
4. **Fine-tuning pilot** – small model on approved subset; A/B vs API for one task (e.g. gap tagging).

*(Order can change if WhatsApp approval or school IT policies are the gating factor.)*

---

## Related documents

- [Phase 2 – Pro Teacher Tools (V2.0)](phase-2-pro-teacher-tools-v2.md) – teacher workflow and curriculum RAG that feed parent/student copy.
- [Phase 3 – Premium Enterprise / NGO (V3.0)](phase-3-premium-enterprise-dashboard-v3.md) – scale, evidence on playbooks, and governance that support responsible use of student data for training.

---

## Implementation status (MVP shipped in repo)

| Step (plan order) | What shipped | Key files |
| ----------------- | ------------- | --------- |
| **1. Foundations** | `guardianPhone`, `guardianLanguage`, `whatsappOptIn`, `consentRecordedAt`, `portalAccessCode`, `trainingDataOptIn` on students; `updateStudent`; `whatsappOutbox` writes (no Meta API). | [`studentService.ts`](../../src/services/studentService.ts), [`whatsappConnectService.ts`](../../src/services/whatsappConnectService.ts) |
| **2. HeckTeck Connect MVP** | AI weekly digest (English) + translation to guardian language; copy + **demo queue** to Firestore. | [`aiPrompts/phase4Ecosystem.ts`](../../src/services/aiPrompts/phase4Ecosystem.ts), [`parentDigestService.ts`](../../src/services/parentDigestService.ts), [`Phase4FamilyConnectCard.tsx`](../../src/components/Phase4FamilyConnectCard.tsx) |
| **3. Student portal MVP** | **`#/portal`** entry (hash route); code lookup; MCQ practice from latest gaps; points; `portalSessions` log; **web manifest** for installable shell. | [`main.tsx`](../../src/main.tsx), [`StudentPortalApp.tsx`](../../src/components/StudentPortalApp.tsx), [`portalSessionService.ts`](../../src/services/portalSessionService.ts), [`public/manifest.webmanifest`](../../public/manifest.webmanifest) |
| **4. Fine-tuning pilot** | JSONL export of **opted-in** de-identified snippets; env-driven **A/B** system prompt for gap tags (still Gemini). | [`fineTunePilotService.ts`](../../src/services/fineTunePilotService.ts), [`FineTunePilotPanel.tsx`](../../src/components/FineTunePilotPanel.tsx), [`featureFlags.ts`](../../src/config/featureFlags.ts) |

**Follow-ups:** Meta WhatsApp Cloud API + templates; school SSO for portal; real service worker/offline cache; dedicated small model endpoint; legal DPIA for training corpus.
