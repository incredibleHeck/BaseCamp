/**
 * Simplified schematic region map for heatmap MVP (not official boundaries).
 * viewBox coordinates are arbitrary; choropleth fills circuits by risk band.
 */
export const CIRCUIT_MAP_VIEWBOX = '0 0 400 280';

export interface CircuitMapRegion {
  circuitId: string;
  name: string;
  /** SVG path in CIRCUIT_MAP_VIEWBOX space */
  path: string;
  labelX: number;
  labelY: number;
}

export const DEMO_CIRCUIT_REGIONS: CircuitMapRegion[] = [
  {
    circuitId: 'circuit-north',
    name: 'North Circuit',
    path: 'M 0 0 L 400 0 L 400 120 L 200 120 L 0 80 Z',
    labelX: 120,
    labelY: 48,
  },
  {
    circuitId: 'circuit-east',
    name: 'East Circuit',
    path: 'M 400 0 L 400 280 L 240 280 L 200 120 L 400 120 Z',
    labelX: 320,
    labelY: 140,
  },
  {
    circuitId: 'circuit-south',
    name: 'South Circuit',
    path: 'M 0 80 L 200 120 L 240 280 L 0 280 Z',
    labelX: 100,
    labelY: 200,
  },
  {
    circuitId: 'circuit-west',
    name: 'West Circuit',
    path: 'M 0 80 L 0 280 L 240 280 L 200 120 Z',
    labelX: 60,
    labelY: 140,
  },
];

export type RiskBand = 'low' | 'moderate' | 'high' | 'suppressed';

export function bandFillClass(band: RiskBand): string {
  switch (band) {
    case 'low':
      return 'fill-emerald-200 stroke-emerald-600';
    case 'moderate':
      return 'fill-amber-200 stroke-amber-600';
    case 'high':
      return 'fill-red-300 stroke-red-700';
    case 'suppressed':
    default:
      return 'fill-gray-200 stroke-gray-500';
  }
}
