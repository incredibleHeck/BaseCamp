export interface CurriculumObjective {
  id: string;
  gradeLevel: number;
  domain: string;
  ixlStyleSkill: string;
  cambridgeStandard: string;
  diagnosticTrigger: string;
}

export const cambridgeMathTaxonomy: CurriculumObjective[] = [
  {
    id: 'MATH-G1-NUM-01',
    gradeLevel: 1,
    domain: 'Numeracy',
    ixlStyleSkill: 'Count forward and backward within 20, starting from any number',
    cambridgeStandard:
      '1Nc1 — Count, read and write numbers to 20; recite the number sequence forwards and backwards from any small number',
    diagnosticTrigger:
      'Student skips numbers when counting aloud (e.g., …14, 15, 17…) or cannot continue from a middle number such as starting at 9.',
  },
  {
    id: 'MATH-G1-NUM-02',
    gradeLevel: 1,
    domain: 'Numeracy',
    ixlStyleSkill: 'Recognize tens and ones in two-digit numbers up to 20 using concrete and pictorial models',
    cambridgeStandard:
      '1Nc3 — Understand place value in two-digit numbers (tens and ones) within familiar contexts',
    diagnosticTrigger:
      "Student treats 17 as '7 and 1' or draws seventeen objects as one unstructured group with no grouping of ten.",
  },
  {
    id: 'MATH-G1-NUM-03',
    gradeLevel: 1,
    domain: 'Numeracy',
    ixlStyleSkill: 'Add two one-digit numbers with totals to 20 using counting on or number bonds',
    cambridgeStandard: '1Nc5 — Recall and use addition facts within 20; relate addition to combining sets',
    diagnosticTrigger:
      'Student counts all objects from one every time for 6 + 5 instead of counting on, and frequently arrives at 10 or 12 by double-counting.',
  },
  {
    id: 'MATH-G1-NUM-04',
    gradeLevel: 1,
    domain: 'Numeracy',
    ixlStyleSkill: 'Subtract within 20 by taking away or finding the difference, using known facts',
    cambridgeStandard:
      '1Nc6 — Understand subtraction as take-away and difference; use facts within 20',
    diagnosticTrigger:
      "For 15 − 8, student adds 8 + 15 or answers 23, treating the minus sign as 'more' rather than removal or gap.",
  },
  {
    id: 'MATH-G1-GEO-01',
    gradeLevel: 1,
    domain: 'Geometry',
    ixlStyleSkill:
      'Name, sort and describe 2D shapes (circle, triangle, square, rectangle) using informal language',
    cambridgeStandard:
      '1Gg1 — Recognize, name and sort common 2D shapes; describe them using sides and corners in everyday language',
    diagnosticTrigger:
      "Student calls any four-sided shape a square or confuses a triangle with a 'corner' of the room rather than a closed three-sided figure.",
  },
  {
    id: 'MATH-G2-NUM-01',
    gradeLevel: 2,
    domain: 'Numeracy',
    ixlStyleSkill: 'Read, write and compare two-digit numbers; use <, =, > with place-value reasoning',
    cambridgeStandard:
      '2Nc2 — Compare and order two-digit numbers; use place value to explain which is greater',
    diagnosticTrigger:
      'Student says 38 > 91 because 8 > 1, comparing only the ones digits and ignoring tens.',
  },
  {
    id: 'MATH-G2-NUM-02',
    gradeLevel: 2,
    domain: 'Numeracy',
    ixlStyleSkill: 'Add a two-digit number and a one-digit number without crossing a tens boundary',
    cambridgeStandard:
      '2Nc4 — Add and subtract one-digit numbers to or from two-digit numbers without bridging ten in supported contexts',
    diagnosticTrigger:
      'Student writes 32 + 5 = 82, aligning the 5 under the 3 instead of the 2, then adds columns as if both were tens and ones.',
  },
  {
    id: 'MATH-G2-NUM-03',
    gradeLevel: 2,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Add two two-digit numbers with one regrouping of ones into tens (standard or expanded layout)',
    cambridgeStandard:
      '2Nc5 — Add two two-digit numbers with exchange of ten ones for one ten where appropriate',
    diagnosticTrigger:
      'After ones sum to 13, student writes 3 and forgets to record the new ten, so 27 + 16 is answered as 33 instead of 43.',
  },
  {
    id: 'MATH-G2-NUM-04',
    gradeLevel: 2,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Recall multiplication facts for the 2, 5 and 10 times tables and relate to repeated addition',
    cambridgeStandard:
      '2Nc8 — Recall and use multiplication facts for 2, 5 and 10; connect multiplication to equal groups',
    diagnosticTrigger:
      'For 5 × 3, student draws five groups of five or answers 53, confusing multiplication with concatenation of digits or addition of the factors only.',
  },
  {
    id: 'MATH-G2-MEA-01',
    gradeLevel: 2,
    domain: 'Measurement',
    ixlStyleSkill:
      "Tell time to the quarter hour on analogue and digital clocks; use language 'past' and 'to'",
    cambridgeStandard:
      '2Gg4 — Read the time on analogue and digital clocks to the quarter hour; use vocabulary of position in the hour',
    diagnosticTrigger:
      "Student reads the hour hand as pointing to '3' at quarter past three, or swaps hour and minute hands so 3:15 is read as 5:03.",
  },
];
