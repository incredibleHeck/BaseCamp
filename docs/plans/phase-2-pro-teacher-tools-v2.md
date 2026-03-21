# Phase 2: “Pro” Teacher Tools (V2.0 – Workflow Automation)

**Vision:** Make BaseCamp so useful in real classrooms that teachers open it every day—not only for one-off diagnostics.

**North star:** Reduce friction on phones, align outputs with **official GES expectations**, and turn assessment data into **actionable workflow** (lesson alignment + reporting).

---

## Pillar 1: Voice-to-text observational diagnostics

### Problem

Typing detailed observations on a phone is slow. Teachers already think in short spoken notes during class.

### Product goal

- Add an **offline-first audio recorder**: teacher holds a button (or tap-to-record) and dictates a note, e.g.  
  *“Kwame struggled to sound out the ‘ch’ in ‘church’ today during reading hour.”*
- When the device **syncs**, the pipeline:
  1. **Transcribes** audio to text (Gemini or a dedicated speech API—see technical notes).
  2. **Analyzes** the transcript for **ESL** and **dyslexia / phonetic** risk patterns (structured output, not free-form only).
  3. Attaches the note to the **right student** and surfaces it in the **longitudinal profile** (and optional parent comms draft).

### UX principles

- **One-handed safe**: large record/stop, clear timer, haptic or visual feedback.
- **Privacy-conscious**: explicit “recording” state; local storage until sync; retention policy surfaced in UI.
- **Offline queue**: mirror the existing offline assessment queue pattern—store audio blob + metadata in IndexedDB (or chunked), process when online.

### Technical building blocks

| Area | Direction |
| ---- | --------- |
| Capture | `MediaRecorder` API; WebM/Opus or AAC where supported; fallback messaging for unsupported browsers. |
| Storage | IndexedDB blobs + queue rows (`studentId`, `createdAt`, `duration`, `syncStatus`, `localUri`). |
| Sync | Reuse patterns from `useSyncManager` / `offlineQueueService`: upload → transcribe → analyze → persist Firestore. |
| AI | **Transcription**: Gemini multimodal audio input *or* dedicated STT if quality/latency requires it. **Analysis**: structured JSON (phoneme targets, ESL vs dyslexia flags, recommended next steps). |
| Compliance | Consent copy for recording in classroom; school/district policy hooks later. |

### Risks / open questions

- iOS Safari quirks for `MediaRecorder` and background tab behavior.
- Storage quotas for long recordings on shared school devices.
- Model choice: single vendor vs best-of-breed STT + Gemini analysis.

### Success metrics (suggested)

- Median time from “thought” to “saved observation” vs typing.
- % of observations submitted from mobile vs desktop.
- Teacher-reported usefulness (short in-app survey).

---

## Pillar 2: Curriculum vector database (RAG)

### Problem

Generated lesson plans feel generic unless they are **explicitly anchored** to the official **Ghana Education Service (GES)** syllabus.

### Product goal

- **Ingest** the GES curriculum (numeracy, literacy, relevant strands) into a **searchable knowledge base**.
- When BaseCamp generates or regenerates a lesson plan, it must:
  - **Retrieve** the closest syllabus excerpts (RAG).
  - **Cite** at least one **GES Curriculum Objective ID** in the output, e.g.  
    *“Aligns with GES Numeracy 6.2.1”* (exact format to match GES documentation).
  - Keep citations **inspectable** (teacher can expand “why this objective”).

### Technical building blocks

| Area | Direction |
| ---- | --------- |
| Source of truth | Versioned GES documents (PDF/HTML) + parsing pipeline; store raw text + metadata per objective ID. |
| Chunking | Chunk by objective / sub-objective where possible; overlap for context; store `objectiveId`, `grade`, `subject`, `strand`. |
| Embeddings | Embedding model + vector store (Firebase extension, Vertex AI Vector Search, Pinecone, pgvector, etc.—TBD by infra). |
| Retrieval | Hybrid search (keyword on objective ID + semantic) to reduce hallucinated IDs. |
| Generation | Prompt requires: “Only cite objective IDs present in retrieved context”; validate IDs against allowlist before showing UI. |

### Guardrails

- **No uncited objectives**: if retrieval confidence is low, show “suggested alignment” vs “verified alignment” or ask teacher to pick from a shortlist.
- **Version pinning**: curriculum updates → re-embed + show “syllabus version” in UI.

### Success metrics (suggested)

- % of lesson plans with **valid** GES IDs vs human audit sample.
- Time to adapt a plan when syllabus updates (ops metric).

---

## Pillar 3: Automated gradebook export

### Problem

Teachers need **scores and class rollups** for **end-of-term GES reporting**, not only narrative diagnoses.

### Product goal

- From existing assessments (and future voice/worksheet flows), **extract or derive** a **numeric score out of 100** per assessment where applicable.
- **Roll up** per class/student/term:
  - Raw score, component breakdown (if you add categories later), dates, subject.
- **One-click export** to **Excel/CSV** formatted to match **GES end-of-term reporting** expectations (exact column order and headers to be confirmed against the latest GES template).

### Technical building blocks

| Area | Direction |
| ---- | --------- |
| Data model | Ensure each assessment stores `score` (0–100), `subject`, `classId`/`grade`, `term`, `academicYear`, `assessmentType`. |
| Aggregation | Query or Cloud Function to build class matrices; handle missing data and “not assessed”. |
| Export | Client-side CSV/XLSX (`SheetJS` or similar) or server-generated file; include BOM for Excel UTF-8 if needed. |
| Validation | Mapping doc: “BaseCamp column → GES template column”; snapshot tests on sample exports. |

### Dependencies

- **Authoritative GES template** (Excel) or written spec—needed before claiming “exactly how GES requires.”
- Optional: headteacher **approval workflow** before export is official.

### Success metrics (suggested)

- Time to complete term export vs manual retyping.
- Error rate on import into school systems (if applicable).

---

## Cross-cutting themes (all pillars)

- **Offline-first** where teachers actually work (voice, queue, sync).
- **Auditability**: citations (RAG), provenance on scores, consent on audio.
- **Role-based views**: teacher vs headteacher (class vs school aggregates for gradebook).

---

## Suggested implementation order

1. **Data foundations** – assessment schema for `score`, term metadata; curriculum ingestion spec + pilot corpus for one grade/subject.
2. **Gradebook export (narrow MVP)** – CSV that matches one confirmed GES template column set; expand to full Excel styling.
3. **RAG MVP** – retrieve + cite for **lesson plan only**; tighten validation on objective IDs.
4. **Voice observations MVP** – record offline → transcribe + analyze on sync; attach to student profile.

*(Order can shift if GES template or syllabus source access is the critical path.)*

---

## Related documents

- [Offline diagnosis queue](offline-diagnosis-queue.md) / [Pending analyses](pending-analyses.md) – patterns to reuse for offline queues and teacher-facing lists.

---

## Implementation status (MVP shipped in repo)

| Pillar | What shipped | Key files |
| ------ | ------------- | --------- |
| **Gradebook export** | Assessments store `score`, `term`, `academicYear`, `classLabel`, GES fields; one-click **CSV** (Excel-friendly BOM) from class roster. | [`src/services/gradebookExport.ts`](../../src/services/gradebookExport.ts), [`src/services/assessmentService.ts`](../../src/services/assessmentService.ts), [`ClassRoster.tsx`](../../src/components/ClassRoster.tsx) |
| **GES RAG (pilot)** | Static pilot objectives + **keyword retrieval** (no vector DB yet); model must cite allowlisted IDs; **Verified** badge when ID was in retrieved set. | [`src/data/gesCurriculumPilot.ts`](../../src/data/gesCurriculumPilot.ts), [`src/services/gesRagService.ts`](../../src/services/gesRagService.ts), [`src/services/aiPrompts.ts`](../../src/services/aiPrompts.ts), [`AnalysisResults.tsx`](../../src/components/AnalysisResults.tsx) |
| **Voice observations** | **MediaRecorder** → IndexedDB queue → on sync **Gemini** transcribes + ESL/phonetic/SEN-hint JSON → Firestore **`voiceObservations`**. UI on **Student Profile**. | [`voiceObservationQueueService.ts`](../../src/services/voiceObservationQueueService.ts), [`observationService.ts`](../../src/services/observationService.ts), [`useVoiceObservationSync.ts`](../../src/hooks/useVoiceObservationSync.ts), [`VoiceObservationRecorder.tsx`](../../src/components/VoiceObservationRecorder.tsx) |

**Defaults:** Academic year / term via [`src/config/academicContext.ts`](../../src/config/academicContext.ts) (override with `localStorage` keys `basecamp_academic_year`, `basecamp_term`).

**Follow-ups (not in MVP):** full syllabus ingest + embeddings; official GES Excel template columns; WhatsApp parent bot; dedicated STT provider if Gemini audio quality varies by device.
