/**
 * Pilot GES-aligned curriculum snippets for RAG (Phase 2).
 * Replace/expand with full syllabus ingest later; IDs follow illustrative GES-style codes.
 */
export interface GesCurriculumChunk {
  objectiveId: string;
  objectiveTitle: string;
  subject: 'numeracy' | 'literacy' | 'both';
  gradeBand: string;
  strand: string;
  excerpt: string;
  keywords: string[];
}

export const GES_CURRICULUM_PILOT: GesCurriculumChunk[] = [
  {
    objectiveId: 'GES Numeracy 6.2.1',
    objectiveTitle: 'Understand fractions as parts of a whole',
    subject: 'numeracy',
    gradeBand: 'P6',
    strand: 'Number',
    excerpt:
      'Learners compare and order simple fractions; relate fractions to division and to real contexts (e.g. sharing plantain, measuring water).',
    keywords: ['fraction', 'numerator', 'denominator', 'whole', 'part', 'sharing', 'half', 'quarter'],
  },
  {
    objectiveId: 'GES Numeracy 6.2.2',
    objectiveTitle: 'Add and subtract fractions with related denominators',
    subject: 'numeracy',
    gradeBand: 'P6',
    strand: 'Number',
    excerpt:
      'Learners add and subtract fractions where one denominator is a multiple of the other; simplify answers where appropriate.',
    keywords: ['fraction', 'subtract', 'add', 'denominator', 'numerator', 'simplify', 'lcd'],
  },
  {
    objectiveId: 'GES Numeracy 6.1.3',
    objectiveTitle: 'Decimal notation and place value',
    subject: 'numeracy',
    gradeBand: 'P6',
    strand: 'Number',
    excerpt:
      'Learners read and write decimals to two places; compare decimals; relate decimals to fractions (tenths, hundredths).',
    keywords: ['decimal', 'place value', 'tenth', 'hundredth', 'compare'],
  },
  {
    objectiveId: 'GES Numeracy 6.3.1',
    objectiveTitle: 'Solve word problems using the four operations',
    subject: 'numeracy',
    gradeBand: 'P6',
    strand: 'Problem solving',
    excerpt:
      'Learners interpret multi-step word problems set in familiar Ghanaian contexts; choose appropriate operations and check reasonableness.',
    keywords: ['word problem', 'problem', 'multi-step', 'operation', 'context'],
  },
  {
    objectiveId: 'GES Literacy 6.1.1',
    objectiveTitle: 'Phonics, blending and decoding',
    subject: 'literacy',
    gradeBand: 'P6',
    strand: 'Reading',
    excerpt:
      'Learners apply phonics knowledge to decode unfamiliar words including common digraphs (e.g. ch, sh, th) and syllable patterns.',
    keywords: ['phonics', 'decode', 'sound', 'digraph', 'ch', 'reading', 'spelling', 'blend'],
  },
  {
    objectiveId: 'GES Literacy 6.1.2',
    objectiveTitle: 'Reading fluency and comprehension',
    subject: 'literacy',
    gradeBand: 'P6',
    strand: 'Reading',
    excerpt:
      'Learners read age-appropriate texts with increasing fluency; answer literal and inferential questions; summarise main ideas.',
    keywords: ['comprehension', 'fluency', 'infer', 'summary', 'main idea', 'text'],
  },
  {
    objectiveId: 'GES Literacy 6.2.1',
    objectiveTitle: 'Vocabulary in context (including ESL support)',
    subject: 'literacy',
    gradeBand: 'P6',
    strand: 'Language',
    excerpt:
      'Learners infer meaning of new words from context; teachers bridge L1 and English vocabulary for mathematics and science terms.',
    keywords: ['vocabulary', 'esl', 'context', 'meaning', 'english', 'word'],
  },
  {
    objectiveId: 'GES Literacy 6.3.1',
    objectiveTitle: 'Writing organised paragraphs',
    subject: 'literacy',
    gradeBand: 'P6',
    strand: 'Writing',
    excerpt:
      'Learners plan and write short paragraphs with topic sentences, supporting detail, and simple cohesive devices.',
    keywords: ['writing', 'paragraph', 'sentence', 'grammar', 'punctuation'],
  },
];
