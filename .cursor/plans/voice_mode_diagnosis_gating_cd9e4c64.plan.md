---
name: Voice mode diagnosis gating
overview: Gate voice recording on student + assessment type, track successful local queue + sync in AssessmentSetup, then show an enabled primary CTA after save that moves teachers into Photo Upload so Run AI Diagnosis works as a real submit.
todos:
  - id: gate-record
    content: Use isFormValid for voice recorder + update empty-state copy
    status: completed
  - id: voice-saved-state
    content: Add voiceClipSaved, set in onQueued, reset on student/type/mode
    status: completed
  - id: footer-cta
    content: Conditional disabled vs enabled Run AI; enabled switches to upload + helper
    status: completed
isProject: false
---

