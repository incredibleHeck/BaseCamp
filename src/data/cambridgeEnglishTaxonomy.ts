import type { CurriculumObjective } from './cambridgeTaxonomy';

/**
 * Cambridge Primary English / Literacy pilot objectives (keyword RAG + judge-facing codes).
 */
export const cambridgeEnglishTaxonomy: CurriculumObjective[] = [
  {
    id: 'ENG-G1-PHO-01',
    gradeLevel: 1,
    domain: 'Literacy',
    ixlStyleSkill: 'Blend sounds to read consonant-vowel-consonant (CVC) words',
    cambridgeStandard: '1Rw1 — Use phonic knowledge to read decodable words and simple sentences',
    diagnosticTrigger:
      'Student sounds out individual letters (c-a-t) but guesses a completely different word (car) instead of blending them.',
  },
  {
    id: 'ENG-G1-PUN-01',
    gradeLevel: 1,
    domain: 'Literacy',
    ixlStyleSkill: 'Identify and use capital letters and full stops in simple sentences',
    cambridgeStandard:
      '1Wp1 — Use a capital letter for the start of a sentence and for names, and a full stop at the end',
    diagnosticTrigger:
      'Student writes a continuous string of words with no punctuation, or places capital letters randomly in the middle of words.',
  },
  {
    id: 'ENG-G1-COM-01',
    gradeLevel: 1,
    domain: 'Literacy',
    ixlStyleSkill: 'Identify the main characters and setting in a simple story',
    cambridgeStandard: '1Ri2 — Identify the main events and characters in a story',
    diagnosticTrigger:
      "When asked 'Who is this story about?', the student points to a random object in the illustration rather than naming the character.",
  },
  {
    id: 'ENG-G2-GRA-01',
    gradeLevel: 2,
    domain: 'Literacy',
    ixlStyleSkill: 'Use common adjectives to describe nouns (e.g., size, color, shape)',
    cambridgeStandard: '2Wg4 — Use adjectives to add detail to nouns',
    diagnosticTrigger:
      "Student writes 'The dog ran' instead of 'The big brown dog ran', showing no descriptive expansion of the noun.",
  },
  {
    id: 'ENG-G2-SPE-01',
    gradeLevel: 2,
    domain: 'Literacy',
    ixlStyleSkill: "Spell words with common vowel digraphs (e.g., 'ee', 'ea', 'ai', 'ay')",
    cambridgeStandard: '2Ww2 — Spell words with common vowel graphemes',
    diagnosticTrigger:
      "Student writes 'tre' instead of 'tree' or 'plai' instead of 'play', lacking awareness of two-letter vowel teams.",
  },
];
