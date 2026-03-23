/**
 * Cambridge Primary English / Literacy — Stages 1–9 (Grades 1–9) for keyword RAG and judge-facing codes.
 *
 * Per-stage data lives in `./cambridgeEnglish/englishstageN.ts`. Add more stages, then import and spread below.
 */
import type { CurriculumObjective } from './curriculumTypes';
import { cambridgeEnglishStage1 } from './cambridgeEnglish/englishstage1';
import { cambridgeEnglishStage2 } from './cambridgeEnglish/englishstage2';
import { cambridgeEnglishStage3 } from './cambridgeEnglish/englishstage3';
import { cambridgeEnglishStage4 } from './cambridgeEnglish/englishstage4';
import { cambridgeEnglishStage5 } from './cambridgeEnglish/englishstage5';
import { cambridgeEnglishStage6 } from './cambridgeEnglish/englishstage6';

export const cambridgeEnglishTaxonomy: CurriculumObjective[] = [
  ...cambridgeEnglishStage1,
  ...cambridgeEnglishStage2,
  ...cambridgeEnglishStage3,
  ...cambridgeEnglishStage4,
  ...cambridgeEnglishStage5,
  ...cambridgeEnglishStage6,
];
