/**
 * One-off / maintenance: merge eng-g2-frags/*.ndjson → ../src/data/cambridgeEnglish/englishstage2.ts
 * Run: node scripts/merge-english-g2-ndjson.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fragDir = path.join(__dirname, '../src/data/cambridgeEnglish/eng-g2-frags');
const outPath = path.join(__dirname, '../src/data/cambridgeEnglish/englishstage2.ts');

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
    .replaceAll('READ-2RW', 'READ-2Rw')
    .replaceAll('READ-2RV', 'READ-2Rv')
    .replaceAll('READ-2RG', 'READ-2Rg')
    .replaceAll('READ-2RS', 'READ-2Rs')
    .replaceAll('READ-2RI', 'READ-2Ri')
    .replaceAll('READ-2RA', 'READ-2Ra')
    .replaceAll('WRIT-2WW', 'WRIT-2Ww')
    .replaceAll('WRIT-2WV', 'WRIT-2Wv')
    .replaceAll('WRIT-2WG', 'WRIT-2Wg')
    .replaceAll('WRIT-2WS', 'WRIT-2Ws')
    .replaceAll('WRIT-2WC', 'WRIT-2Wc')
    .replaceAll('WRIT-2WP', 'WRIT-2Wp')
    .replaceAll('SPKL-2SLM', 'SPKL-2SLm')
    .replaceAll('SPKL-2SLS', 'SPKL-2SLs')
    .replaceAll('SPKL-2SLG', 'SPKL-2SLg')
    .replaceAll('SPKL-2SLP', 'SPKL-2SLp')
    .replaceAll('SPKL-2SLR', 'SPKL-2SLr');
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
 * Cambridge Primary English / Literacy — Stage 2 (Grade 2).
 *
 * \`id\` values embed the official strand code with Cambridge casing (e.g. \`2Rv\` not \`2RV\`),
 * matching notation like \`2Rv.01\` in the framework — e.g. \`ENGL-G2-READ-2Rv01\`.
 */
export const cambridgeEnglishStage2: CurriculumObjective[] = [
`;

fs.writeFileSync(outPath, `${header}${blocks.join('\n')}\n];\n`);
console.log('Wrote', outPath, 'objectives:', all.length);
