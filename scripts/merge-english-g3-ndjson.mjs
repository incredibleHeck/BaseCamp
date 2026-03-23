/**
 * Merge eng-g3-frags/*.ndjson → ../src/data/cambridgeEnglish/englishstage3.ts
 * Run: node scripts/merge-english-g3-ndjson.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fragDir = path.join(__dirname, '../src/data/cambridgeEnglish/eng-g3-frags');
const outPath = path.join(__dirname, '../src/data/cambridgeEnglish/englishstage3.ts');

const files = fs
  .readdirSync(fragDir)
  .filter((f) => f.endsWith('.ndjson'))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

const all = [];
for (const f of files) {
  const text = fs.readFileSync(path.join(fragDir, f), 'utf8');
  for (const line of text.split(/\n/)) {
    const t = line.trim();
    if (!t) continue;
    all.push(JSON.parse(t));
  }
}

function fixEnglishObjectiveId(id) {
  return id
    .replaceAll('READ-3RW', 'READ-3Rw')
    .replaceAll('READ-3RV', 'READ-3Rv')
    .replaceAll('READ-3RG', 'READ-3Rg')
    .replaceAll('READ-3RS', 'READ-3Rs')
    .replaceAll('READ-3RI', 'READ-3Ri')
    .replaceAll('READ-3RA', 'READ-3Ra')
    .replaceAll('WRIT-3WW', 'WRIT-3Ww')
    .replaceAll('WRIT-3WV', 'WRIT-3Wv')
    .replaceAll('WRIT-3WG', 'WRIT-3Wg')
    .replaceAll('WRIT-3WS', 'WRIT-3Ws')
    .replaceAll('WRIT-3WC', 'WRIT-3Wc')
    .replaceAll('WRIT-3WP', 'WRIT-3Wp')
    .replaceAll('SPKL-3SLM', 'SPKL-3SLm')
    .replaceAll('SPKL-3SLS', 'SPKL-3SLs')
    .replaceAll('SPKL-3SLG', 'SPKL-3SLg')
    .replaceAll('SPKL-3SLP', 'SPKL-3SLp')
    .replaceAll('SPKL-3SLR', 'SPKL-3SLr');
}

for (const o of all) {
  o.id = fixEnglishObjectiveId(o.id);
  if (o.cambridgeStandard?.startsWith('*')) {
    o.cambridgeStandard = o.cambridgeStandard.slice(1);
  }
}

const esc = (s) => JSON.stringify(s);
const blocks = all.map(
  (o) => `  {
    id: ${esc(o.id)},
    gradeLevel: ${o.gradeLevel},
    domain: ${esc(o.domain)},
    ixlStyleSkill:
      ${esc(o.ixlStyleSkill)},
    cambridgeStandard:
      ${esc(o.cambridgeStandard)},
    diagnosticTrigger:
      ${esc(o.diagnosticTrigger)},
  },`,
);

const header = `import type { CurriculumObjective } from '../curriculumTypes';

/**
 * Cambridge Primary English / Literacy — Stage 3 (Grade 3).
 *
 * \`id\` values embed the official strand code with Cambridge casing (e.g. \`3Rv\` not \`3RV\`),
 * matching notation like \`3Rv.01\` in the framework — e.g. \`ENGL-G3-READ-3Rv01\`.
 */
export const cambridgeEnglishStage3: CurriculumObjective[] = [
`;

fs.writeFileSync(outPath, `${header}${blocks.join('\n')}\n];\n`);
console.log('Wrote', outPath, 'objectives:', all.length);
