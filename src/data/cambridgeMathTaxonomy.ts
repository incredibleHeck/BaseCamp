/**
 * Cambridge Primary Mathematics — Stages 1–6 (Grades 1–6) for keyword RAG and judge-facing codes.
 *
 * Per-grade math data lives in `./cambridgeMath/mathstageN.ts`. Add `mathstage7.ts`+ there, then import and spread below.
 * (English curriculum can follow the same pattern, e.g. `englishstageN.ts`.)
 */
import type { CurriculumObjective } from './curriculumTypes';
import { cambridgeMathStage1 } from './cambridgeMath/mathstage1';
import { cambridgeMathStage2 } from './cambridgeMath/mathstage2';
import { cambridgeMathStage3 } from './cambridgeMath/mathstage3';
import { cambridgeMathStage4 } from './cambridgeMath/mathstage4';
import { cambridgeMathStage5 } from './cambridgeMath/mathstage5';
import { cambridgeMathStage6 } from './cambridgeMath/mathstage6';

export const cambridgeMathTaxonomy: CurriculumObjective[] = [
  ...cambridgeMathStage1,
  ...cambridgeMathStage2,
  ...cambridgeMathStage3,
  ...cambridgeMathStage4,
  ...cambridgeMathStage5,
  ...cambridgeMathStage6,
];
