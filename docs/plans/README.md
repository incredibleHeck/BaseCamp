# BaseCamp planning documents

Human-readable copies of product and implementation plans. The Cursor-generated originals (with YAML frontmatter) live under [`.cursor/plans/`](../../.cursor/plans/).

**Implementation progress:** see [../IMPLEMENTATION_TRACKER.md](../IMPLEMENTATION_TRACKER.md).

| Document | Description |
| -------- | ------------- |
| [Offline diagnosis queue](offline-diagnosis-queue.md) | Queue AI diagnoses when offline; modal; sync manager; multi-page and manual entry. |
| [Pending analyses](pending-analyses.md) | Fix queue count staleness; `Pending Analyses` tab; remove / run now. |
| [Offline queue service](offline-queue-service.md) | IndexedDB queue via `idb-keyval` (initial design; schema later extended). |
| [Mobile frontend optimization](mobile-frontend-optimization.md) | Touch targets, responsive visibility, tables on small screens. |
| [Demo prototype readiness](demo-prototype-readiness.md) | Pre-demo audit: Teacher Directory, manual entry, roster stability, env docs. |
| [Phase 2 – Pro Teacher Tools (V2.0)](phase-2-pro-teacher-tools-v2.md) | Voice observations, GES curriculum RAG, automated gradebook export. |
| [Phase 3 – Premium Enterprise / NGO (V3.0)](phase-3-premium-enterprise-dashboard-v3.md) | Geo heatmaps, longitudinal SEN alerts, A/B remedial playbooks at scale. |
| [Phase 4 – Master Ecosystem (V4.0)](phase-4-master-ecosystem-v4.md) | WhatsApp parent bot, student PWA, local model fine-tuning. |

## Related code (quick links)

- Queue persistence: [`src/services/offlineQueueService.ts`](../../src/services/offlineQueueService.ts)
- Sync / process queue: [`src/hooks/useSyncManager.ts`](../../src/hooks/useSyncManager.ts)
- App wiring: [`src/App.tsx`](../../src/App.tsx)
- Pending UI: [`src/components/PendingAnalyses.tsx`](../../src/components/PendingAnalyses.tsx)
