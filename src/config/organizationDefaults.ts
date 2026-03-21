/**
 * Demo / pilot administrative identifiers (Phase 3).
 * Align with MoE/GES codes in production; these are stable strings for rollups & heatmaps.
 */
export const DEFAULT_DISTRICT_ID = 'ga-central-demo';
export const DEFAULT_DISTRICT_NAME = 'Greater Accra (demo)';

export const DEMO_SCHOOLS = [
  { id: 'sch-mando', name: 'Mando Basic School', circuitId: 'circuit-north' },
  { id: 'sch-ridge', name: 'Accra Ridge Primary', circuitId: 'circuit-east' },
  { id: 'sch-osu', name: 'Osu Presby School', circuitId: 'circuit-south' },
] as const;

export const DEMO_CIRCUITS = [
  { id: 'circuit-north', name: 'North Circuit', label: 'N' },
  { id: 'circuit-east', name: 'East Circuit', label: 'E' },
  { id: 'circuit-south', name: 'South Circuit', label: 'S' },
  { id: 'circuit-west', name: 'West Circuit', label: 'W' },
] as const;

export type DemoCircuitId = (typeof DEMO_CIRCUITS)[number]['id'];

/** Minimum learners in a geography bucket before we show numeric intensity (privacy). */
export const AGGREGATION_MIN_N = 5;

/** Default school when none set on a student record. */
export const DEFAULT_SCHOOL_ID = DEMO_SCHOOLS[0].id;
export const DEFAULT_SCHOOL_NAME = DEMO_SCHOOLS[0].name;
export const DEFAULT_CIRCUIT_ID = DEMO_SCHOOLS[0].circuitId;

export function schoolById(id: string | undefined): (typeof DEMO_SCHOOLS)[number] | undefined {
  if (!id) return undefined;
  return DEMO_SCHOOLS.find((s) => s.id === id);
}

export function circuitName(circuitId: string | undefined): string {
  if (!circuitId) return 'Unknown circuit';
  return DEMO_CIRCUITS.find((c) => c.id === circuitId)?.name ?? circuitId;
}
