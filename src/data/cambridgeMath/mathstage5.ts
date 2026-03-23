import type { CurriculumObjective } from '../curriculumTypes';

/**
 * Cambridge Primary Mathematics — Stage 5 (Grade 5).
 */
export const cambridgeMathStage5: CurriculumObjective[] = [
  {
    id: 'MATH-G5-NUM-5NC01',
    gradeLevel: 5,
    domain: 'Numeracy',
    ixlStyleSkill: 'Skip-count forward and backward by constant steps across zero into negative numbers.',
    cambridgeStandard:
      '5Nc.01 Count on and count back in steps of constant size, and extend beyond zero to include negative numbers.',
    diagnosticTrigger:
      'Student counts backward past zero by incorrectly mirroring subtraction logic (e.g., 5, 2, -1, 0, -1, -2), failing to maintain the constant geometric step size across the zero boundary on the mental number line.',
  },
  {
    id: 'MATH-G5-NUM-5NC02',
    gradeLevel: 5,
    domain: 'Numeracy',
    ixlStyleSkill: 'Find multiple pairs of values that satisfy equations with two unknown symbols.',
    cambridgeStandard:
      '5Nc.02 Recognise the use of objects, shapes or symbols to represent two unknown quantities in addition and subtraction calculations.',
    diagnosticTrigger:
      'Student assigns the exact same numerical value to two visibly different symbols (e.g., setting both a square and a circle to 5 when solving Square + Circle = 10), misunderstanding that distinct variables can hold separate values.',
  },
  {
    id: 'MATH-G5-NUM-5NC03',
    gradeLevel: 5,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Use multiplication to find any specific term in a sequence without calculating every step.',
    cambridgeStandard:
      '5Nc.03 Use the relationship between repeated addition of a constant and multiplication to find any term of a linear sequence.',
    diagnosticTrigger:
      'Student painstakingly adds the constant step sequentially on paper to find the 50th term, lacking the structural algebraic insight to multiply the step size by the position index.',
  },
  {
    id: 'MATH-G5-NUM-5NC04',
    gradeLevel: 5,
    domain: 'Numeracy',
    ixlStyleSkill: 'Identify and draw the next figure for square and triangular number patterns.',
    cambridgeStandard: '5Nc.04 Recognise and extend the spatial pattern of square and triangular numbers.',
    diagnosticTrigger:
      'Student extends a triangular number pattern by simply adding a static row of identical dots rather than systematically incrementing the geometric step size (e.g., adding +3, then +4, then +5 dots).',
  },
  {
    id: 'MATH-G5-NUM-5NI01',
    gradeLevel: 5,
    domain: 'Numeracy',
    ixlStyleSkill: 'Estimate, add, and subtract integers, including negative numbers.',
    cambridgeStandard: '5Ni.01 Estimate, add and subtract integers, including where one integer is negative.',
    diagnosticTrigger:
      'Student subtracts a negative number by moving further left (more negative) on the number line, failing to neurologically map that removing a mathematical deficit is structurally identical to addition.',
  },
  {
    id: 'MATH-G5-NUM-5NI02',
    gradeLevel: 5,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Use commutative, associative, and distributive laws to make mental calculations easier.',
    cambridgeStandard: '5Ni.02 Understand which law of arithmetic to apply to simplify calculations.',
    diagnosticTrigger:
      'Student rigidly calculates a complex string like 25 x 17 x 4 exactly left-to-right, completely missing the spatial opportunity to reorder and group (25 x 4) to bypass overwhelming working memory limits.',
  },
  {
    id: 'MATH-G5-NUM-5NI03',
    gradeLevel: 5,
    domain: 'Numeracy',
    ixlStyleSkill: 'Apply the correct order of operations (multiply/divide before add/subtract).',
    cambridgeStandard: '5Ni.03 Understand that the four operations follow a particular order.',
    diagnosticTrigger:
      'Student calculates 3 + 5 x 2 sequentially from left-to-right to get 16, failing to apply the hierarchical operational dominance of multiplication over addition.',
  },
  {
    id: 'MATH-G5-NUM-5NI04',
    gradeLevel: 5,
    domain: 'Numeracy',
    ixlStyleSkill: 'Multiply numbers up to 1,000 by 1- or 2-digit numbers.',
    cambridgeStandard:
      '5Ni.04 Estimate and multiply whole numbers up to 1000 by 1-digit or 2-digit whole numbers.',
    diagnosticTrigger:
      'Student catastrophically misaligns the second partial product when multiplying by a 2-digit number because they forget to place the structural zero placeholder required for the base-10 column shift.',
  },
  {
    id: 'MATH-G5-NUM-5NI05',
    gradeLevel: 5,
    domain: 'Numeracy',
    ixlStyleSkill: 'Divide numbers up to 1,000 by a 1-digit number.',
    cambridgeStandard: '5Ni.05 Estimate and divide whole numbers up to 1000 by 1-digit whole numbers.',
    diagnosticTrigger:
      'Student incorrectly expresses a raw integer remainder directly as a decimal (e.g., writing 104 ÷ 3 = 34 r 2 as 34.2), fundamentally conflating discrete leftover counts with continuous fractional magnitude.',
  },
  {
    id: 'MATH-G5-NUM-5NI06',
    gradeLevel: 5,
    domain: 'Numeracy',
    ixlStyleSkill: 'Identify prime and composite numbers and explain the difference.',
    cambridgeStandard: '5Ni.06 Understand and explain the difference between prime and composite numbers.',
    diagnosticTrigger:
      "Student misidentifies odd composite numbers like 9 or 15 as 'prime' simply because they do not cleanly divide by 2, falsely conflating the binary concept of parity with the structural concept of primality.",
  },
  {
    id: 'MATH-G5-NUM-5NI07',
    gradeLevel: 5,
    domain: 'Numeracy',
    ixlStyleSkill: 'Use rules to test if a large number is divisible by 4 and 8.',
    cambridgeStandard:
      '5Ni.07 Use knowledge of factors and multiples to understand tests of divisibility by 4 and 8.',
    diagnosticTrigger:
      'Student laboriously executes full long division on a 5-digit number to test for divisibility by 4, lacking the chunking heuristic to exclusively isolate and evaluate only the final two spatial digits.',
  },
  {
    id: 'MATH-G5-NUM-5NI08',
    gradeLevel: 5,
    domain: 'Numeracy',
    ixlStyleSkill: 'Identify perfect square numbers up to 100.',
    cambridgeStandard: '5Ni.08 Use knowledge of multiplication to recognise square numbers (from 1 to 100).',
    diagnosticTrigger:
      'Student calculates the square of a number by multiplying the base by 2 (e.g., evaluating 7² as 14 instead of 49), misinterpreting the geometric exponent notation as a standard additive multiplier.',
  },
  {
    id: 'MATH-G5-NUM-5NP01',
    gradeLevel: 5,
    domain: 'Numeracy',
    ixlStyleSkill: 'Identify the place value of tenths and hundredths in a decimal number.',
    cambridgeStandard: '5Np.01 Understand and explain the value of each digit in decimals (tenths and hundredths).',
    diagnosticTrigger:
      "Student reads 0.45 aloud as 'zero point forty-five' and mentally processes the decimal extension exactly like a base-10 integer, demonstrating a failure to map fractional hierarchy correctly.",
  },
  {
    id: 'MATH-G5-NUM-5NP02',
    gradeLevel: 5,
    domain: 'Numeracy',
    ixlStyleSkill: 'Multiply and divide whole numbers by 10, 100, and 1,000.',
    cambridgeStandard: '5Np.02 Use knowledge of place value to multiply and divide whole numbers by 10, 100 and 1000.',
    diagnosticTrigger:
      'Student literally draws or erases zeros at the end of numbers rather than moving the digits geometrically across columns, a heuristic that instantly fails when they are later introduced to decimals.',
  },
  {
    id: 'MATH-G5-NUM-5NP03',
    gradeLevel: 5,
    domain: 'Numeracy',
    ixlStyleSkill: 'Multiply and divide decimals by 10 and 100 by shifting digits.',
    cambridgeStandard: '5Np.03 Use knowledge of place value to multiply and divide decimals by 10 and 100.',
    diagnosticTrigger:
      'Student appends a zero to the end of a decimal (e.g., 4.5 × 10 = 4.50) because they mechanically carry over whole-number typographical rules instead of physically shifting the digits relative to the fixed decimal anchor.',
  },
  {
    id: 'MATH-G5-NUM-5NP04',
    gradeLevel: 5,
    domain: 'Numeracy',
    ixlStyleSkill: 'Decompose numbers including tenths and hundredths into expanded form.',
    cambridgeStandard: '5Np.04 Compose, decompose and regroup numbers, including decimals (tenths and hundredths).',
    diagnosticTrigger:
      "Student decomposes 20.56 inaccurately as '2 tens and 5 tenths and 60 hundredths', redundantly scaling the final column due to a breakdown in positional independence.",
  },
  {
    id: 'MATH-G5-NUM-5NP05',
    gradeLevel: 5,
    domain: 'Numeracy',
    ixlStyleSkill: 'Round decimals with one decimal place to the nearest whole number.',
    cambridgeStandard: '5Np.05 Round numbers with one decimal place to the nearest whole number.',
    diagnosticTrigger:
      'Student rounds a value like 4.5 down to 4 instead of up to 5, failing to mentally map 0.5 as the precise geometric midpoint threshold that mandates an upward coordinate shift.',
  },
  {
    id: 'MATH-G5-NUM-5NF01',
    gradeLevel: 5,
    domain: 'Numeracy',
    ixlStyleSkill: 'Interpret fractions as division problems (e.g., 3/4 = 3 ÷ 4).',
    cambridgeStandard:
      '5Nf.01 Understand that a fraction can be represented as a division of the numerator by the denominator (unit fractions, three-quarters, tenths and hundredths).',
    diagnosticTrigger:
      "Student interprets '3 ÷ 4' as a mathematical impossibility ('you can't share 3 among 4') and reverses the operation to 4 ÷ 3, demonstrating an absolute cognitive block against generating fractional quotients less than 1.",
  },
  {
    id: 'MATH-G5-NUM-5NF02',
    gradeLevel: 5,
    domain: 'Numeracy',
    ixlStyleSkill: 'Calculate proper fractions of a whole number (e.g., 3/4 of 20).',
    cambridgeStandard: '5Nf.02 Understand that proper fractions can act as operators.',
    diagnosticTrigger:
      "Student multiplies the integer strictly by the numerator but forgets to execute the denominator's division step, proving they view the fraction purely as a whole-number additive multiplier rather than a two-step proportional operator.",
  },
  {
    id: 'MATH-G5-NUM-5NF03',
    gradeLevel: 5,
    domain: 'Numeracy',
    ixlStyleSkill: 'Convert between improper fractions and mixed numbers.',
    cambridgeStandard: '5Nf.03 Recognise that improper fractions and mixed numbers can have an equivalent value.',
    diagnosticTrigger:
      'Student repeatedly subtracts the numerator from the denominator when attempting to convert an improper fraction, rather than systematically dividing the numerator by the denominator to extract whole base units.',
  },
  {
    id: 'MATH-G5-NUM-5NF04',
    gradeLevel: 5,
    domain: 'Numeracy',
    ixlStyleSkill: 'Identify equivalent forms between fractions, decimals, and percentages.',
    cambridgeStandard:
      '5Nf.04 Recognise that proper fractions, decimals (one decimal place) and percentages can have equivalent values.',
    diagnosticTrigger:
      "Student erroneously equates the fraction 1/5 with the decimal 0.15 or 15%, mapping the literal physical digit '5' into the decimal space instead of performing the base-100 geometric scaling required.",
  },
  {
    id: 'MATH-G5-NUM-5NF05',
    gradeLevel: 5,
    domain: 'Numeracy',
    ixlStyleSkill: 'Add and subtract fractions where one denominator is a multiple of the other.',
    cambridgeStandard:
      '5Nf.05 Estimate, add and subtract fractions with the same denominator and denominators that are multiples of each other.',
    diagnosticTrigger:
      'Student sequentially adds the numerators and the mismatched denominators together (e.g., 1/4 + 3/8 = 4/12), completely bypassing the mandatory spatial step of scaling the larger geometric slice into equivalent smaller units.',
  },
  {
    id: 'MATH-G5-NUM-5NF06',
    gradeLevel: 5,
    domain: 'Numeracy',
    ixlStyleSkill: 'Multiply and divide unit fractions by whole numbers using models.',
    cambridgeStandard: '5Nf.06 Estimate, multiply and divide unit fractions by a whole number.',
    diagnosticTrigger:
      'Student multiplies both the numerator and the denominator of a unit fraction by the whole number (e.g., 1/4 x 3 = 3/12 instead of 3/4), incorrectly treating the integer as an identity fraction (3/3).',
  },
  {
    id: 'MATH-G5-NUM-5NF07',
    gradeLevel: 5,
    domain: 'Numeracy',
    ixlStyleSkill: 'Write a shaded percentage of a shape as a fraction out of 100.',
    cambridgeStandard:
      '5Nf.07 Recognise percentages of shapes, and write percentages as a fraction with denominator 100.',
    diagnosticTrigger:
      "Student colors exactly 5 squares on a massive 10x10 grid and confidently writes '50%', succumbing to a severe visual scaling error because their brain is defaulting to a base-10 frame instead of base-100.",
  },
  {
    id: 'MATH-G5-NUM-5NF08',
    gradeLevel: 5,
    domain: 'Numeracy',
    ixlStyleSkill: 'Compare and order decimals, fractions, and percentages on a number line.',
    cambridgeStandard:
      '5Nf.08 Understand the relative size of quantities to compare and order numbers with one decimal place, proper fractions with the same denominator and percentages, using the symbols =, > and <.',
    diagnosticTrigger:
      "Student states that the decimal 0.3 is smaller than 20% simply because the raw digit '3' looks smaller than the integer '20', unable to mentally convert the differing formats into a unified baseline metric for comparison.",
  },
  {
    id: 'MATH-G5-NUM-5NF09',
    gradeLevel: 5,
    domain: 'Numeracy',
    ixlStyleSkill: 'Add and subtract decimals that have the same number of decimal places.',
    cambridgeStandard: '5Nf.09 Estimate, add and subtract numbers with the same number of decimal places.',
    diagnosticTrigger:
      'Student stacks the decimals misaligned, treating them like right-justified integers, which causes a catastrophic vertical collision between tenths and hundredths when calculating the final sum.',
  },
  {
    id: 'MATH-G5-NUM-5NF10',
    gradeLevel: 5,
    domain: 'Numeracy',
    ixlStyleSkill: 'Multiply a decimal (with one decimal place) by a 1-digit whole number.',
    cambridgeStandard: '5Nf.10 Estimate and multiply numbers with one decimal place by 1-digit whole numbers.',
    diagnosticTrigger:
      'Student successfully executes the raw multiplication but drops the decimal point entirely in the final product (e.g., 4.5 x 3 = 135), failing to preserve the scaled 10-fold magnitude compression of the original multiplicand.',
  },
  {
    id: 'MATH-G5-NUM-5NF11',
    gradeLevel: 5,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Differentiate between a ratio (comparing part to part) and proportion (comparing part to whole).',
    cambridgeStandard:
      '5Nf.11 Understand that: - a proportion compares part to whole - a ratio compares part to part of two or more quantities.',
    diagnosticTrigger:
      'Student extracts a part-to-part ratio of 4 red to 5 blue counters (4:5) and then falsely claims the fraction of red counters is 4/5 instead of 4/9, displaying a fundamental blind spot regarding the aggregated whole.',
  },
  {
    id: 'MATH-G5-MEA-5GT01',
    gradeLevel: 5,
    domain: 'Measurement',
    ixlStyleSkill:
      'Understand and use time intervals less than one second, such as tenths of a second.',
    cambridgeStandard: '5Gt.01 Understand time intervals less than one second.',
    diagnosticTrigger:
      "Student interprets a digital stopwatch reading of '12.5 seconds' conceptually as '12 minutes and 5 seconds', entirely unable to map base-10 fractional decimals onto micro-temporal measurements.",
  },
  {
    id: 'MATH-G5-MEA-5GT02',
    gradeLevel: 5,
    domain: 'Measurement',
    ixlStyleSkill: 'Compare digital and analog times across different global time zones.',
    cambridgeStandard:
      '5Gt.02 Compare times between time zones in digital notation (12- and 24-hour) and on analogue clocks.',
    diagnosticTrigger:
      'Student successfully adds a 5-hour timezone difference but completely fails to flip the AM/PM marker or advance the calendar date when the calculated interval crosses the absolute midnight threshold.',
  },
  {
    id: 'MATH-G5-MEA-5GT03',
    gradeLevel: 5,
    domain: 'Measurement',
    ixlStyleSkill: 'Calculate time intervals across hour marks (e.g., 5:45 to 6:20).',
    cambridgeStandard: '5Gt.03 Find time intervals in seconds, minutes and hours that bridge through 60.',
    diagnosticTrigger:
      "Student relies on rigid base-10 vertical addition, writing mathematically impossible times like '5:82' when adding 45 minutes to 5:37 because they entirely bypass the required base-60 temporal overflow regrouping.",
  },
  {
    id: 'MATH-G5-MEA-5GT04',
    gradeLevel: 5,
    domain: 'Measurement',
    ixlStyleSkill:
      'Convert time intervals between decimals (e.g., 1.5 hours) and mixed units (1 hour 30 mins).',
    cambridgeStandard:
      '5Gt.04 Recognise that a time interval can be expressed as a decimal, or in mixed units.',
    diagnosticTrigger:
      "Student strictly translates the decimal 1.5 hours directly into '1 hour and 50 minutes', suffering a critical cognitive clash between base-10 decimal scaling and the base-60 sexagesimal clock structure.",
  },
  {
    id: 'MATH-G5-GEO-5GG01',
    gradeLevel: 5,
    domain: 'Geometry',
    ixlStyleSkill:
      'Classify and draw isosceles, equilateral, and scalene triangles based on angles and symmetry.',
    cambridgeStandard:
      '5Gg.01 Identify, describe, classify and sketch isosceles, equilateral or scalene triangles, including reference to angles and symmetrical properties.',
    diagnosticTrigger:
      "Student misidentifies an oblique or rotated isosceles triangle as a 'scalene' triangle simply because the two congruent mirror-image sides are not perfectly anchored parallel to the bottom of the page.",
  },
  {
    id: 'MATH-G5-MEA-5GG02',
    gradeLevel: 5,
    domain: 'Measurement',
    ixlStyleSkill:
      'Understand that shapes with the exact same perimeter can have completely different areas.',
    cambridgeStandard:
      '5Gg.02 Estimate and measure perimeter and area of 2D shapes, understanding that shapes with the same perimeter can have different areas and vice versa.',
    diagnosticTrigger:
      'Student insists that a long, skinny 1x10 rectangle and a 5x6 rectangle must have exactly identical areas because their perimeters both equal 22, severely conflating 1D boundary wireframe with 2D planar capacity.',
  },
  {
    id: 'MATH-G5-MEA-5GG03',
    gradeLevel: 5,
    domain: 'Measurement',
    ixlStyleSkill: 'Divide compound shapes into rectangles to calculate total area and perimeter.',
    cambridgeStandard:
      '5Gg.03 Draw compound shapes that can be divided into rectangles and squares. Estimate, measure and calculate their perimeter and area.',
    diagnosticTrigger:
      'Student physically draws a dividing line through an L-shaped room to separate it into rectangles, but accidentally adds the newly drawn internal boundary line to the final outside perimeter calculation.',
  },
  {
    id: 'MATH-G5-GEO-5GG04',
    gradeLevel: 5,
    domain: 'Geometry',
    ixlStyleSkill: 'Identify and sketch 3D shapes even when they are rotated into unusual positions.',
    cambridgeStandard: '5Gg.04 Identify, describe and sketch 3D shapes in different orientations.',
    diagnosticTrigger:
      'Student looks at a square-based pyramid resting sideways on one of its triangular faces and categorizes it as a completely different topological solid, unable to preserve mental 3D invariance during arbitrary spatial rotation.',
  },
  {
    id: 'MATH-G5-GEO-5GG05',
    gradeLevel: 5,
    domain: 'Geometry',
    ixlStyleSkill: 'Identify which flat 2D nets can correctly fold up to make a 3D cube.',
    cambridgeStandard: '5Gg.05 Identify and sketch different nets for a cube.',
    diagnosticTrigger:
      'Student confidently selects a 6-square cross-shaped net without recognizing that two of the side flaps will topologically collide and overlap on the exact same face when physically folded.',
  },
  {
    id: 'MATH-G5-GEO-5GG06',
    gradeLevel: 5,
    domain: 'Geometry',
    ixlStyleSkill: 'Use reflective symmetry to draw the missing half of a complex pattern.',
    cambridgeStandard:
      '5Gg.06 Use knowledge of reflective symmetry to identify and complete symmetrical patterns.',
    diagnosticTrigger:
      'Student attempts to complete the symmetrical pattern by strictly copying the layout (a translation/slide) rather than mathematically inverting the orthogonal distance of each pixel away from the defined mirror axis.',
  },
  {
    id: 'MATH-G5-GEO-5GG07',
    gradeLevel: 5,
    domain: 'Geometry',
    ixlStyleSkill: 'Classify angles as acute, right, obtuse, or reflex.',
    cambridgeStandard:
      '5Gg.07 Estimate, compare and classify angles, using geometric vocabulary including acute, right, obtuse and reflex.',
    diagnosticTrigger:
      'Student completely fails to recognize a reflex angle marked by an external arc, intuitively defaulting to measuring only the internal acute/obtuse space trapped inside the vertex lines.',
  },
  {
    id: 'MATH-G5-GEO-5GG08',
    gradeLevel: 5,
    domain: 'Geometry',
    ixlStyleSkill: 'Calculate a missing angle on a straight line knowing the total is 180°.',
    cambridgeStandard:
      '5Gg.08 Know that the sum of the angles on a straight line is 180º and use this to calculate missing angles on a straight line.',
    diagnosticTrigger:
      'Student subtracts the known angle from 360° or 90° instead of 180° to find the missing supplement, demonstrating a total lack of semantic geometry anchoring regarding the flat 180-degree horizon line.',
  },
  {
    id: 'MATH-G5-GEO-5GP01',
    gradeLevel: 5,
    domain: 'Geometry',
    ixlStyleSkill: 'Compare the relative position of two coordinates (e.g., Which point is higher?).',
    cambridgeStandard: '5Gp.01 Compare the relative position of coordinates (with or without the aid of a grid).',
    diagnosticTrigger:
      'Student reads point A(4, 7) and claims it is physically further to the right than point B(5, 2) strictly because 7 > 2, fatally confusing vertical y-axis displacement with horizontal x-axis traversal.',
  },
  {
    id: 'MATH-G5-GEO-5GP02',
    gradeLevel: 5,
    domain: 'Geometry',
    ixlStyleSkill: 'Plot sets of coordinates to form specific 2D shapes on a grid.',
    cambridgeStandard:
      '5Gp.02 Use knowledge of 2D shapes and coordinates to plot points to form lines and shapes in the first quadrant (with the aid of a grid).',
    diagnosticTrigger:
      'Student plots the 4th missing vertex of a requested rectangle by loose visual eyeballing instead of rigidly calculating the parallel and perpendicular Cartesian numerical distances from the other three anchored coordinates.',
  },
  {
    id: 'MATH-G5-GEO-5GP03',
    gradeLevel: 5,
    domain: 'Geometry',
    ixlStyleSkill: 'Translate a 2D shape on a grid and track how the specific points move.',
    cambridgeStandard:
      '5Gp.03 Translate 2D shapes, identifying the corresponding points between the original and the translated image, on square grids.',
    diagnosticTrigger:
      "Student attempts to perform a 'move 3 right' translation by counting 3 spaces starting from the right edge of the original shape to the left edge of the new shape, resulting in a distorted offset because they didn't track a single uniform vertex.",
  },
  {
    id: 'MATH-G5-GEO-5GP04',
    gradeLevel: 5,
    domain: 'Geometry',
    ixlStyleSkill: 'Reflect 2D shapes across horizontal and vertical mirror lines to make patterns.',
    cambridgeStandard:
      '5Gp.04 Reflect 2D shapes in both horizontal and vertical mirror lines to create patterns on square grids.',
    diagnosticTrigger:
      'Student distorts the final reflected geometry because they count grid squares starting from the absolute edge of the paper boundary rather than projecting perpendicular counts tightly outward from the drawn internal mirror line.',
  },
  {
    id: 'MATH-G5-STAT-5SS01',
    gradeLevel: 5,
    domain: 'Statistics',
    ixlStyleSkill:
      'Plan investigations using categorical, discrete, and continuous measurement data.',
    cambridgeStandard:
      '5Ss.01 Plan and conduct an investigation to answer a set of related statistical questions, considering what data to collect (categorical, discrete and continuous data).',
    diagnosticTrigger:
      "Student incorrectly proposes a deterministic, single-answer non-statistical question (e.g., 'How tall am I exactly?') when tasked with generating a continuous data survey meant to capture demographic population variance.",
  },
  {
    id: 'MATH-G5-STAT-5SS02',
    gradeLevel: 5,
    domain: 'Statistics',
    ixlStyleSkill:
      'Record continuous and discrete data using frequency diagrams, waffle diagrams, and line graphs.',
    cambridgeStandard:
      '5Ss.02 Record, organise and represent categorical, discrete and continuous data. Choose and explain which representation to use in a given situation: - Venn and Carroll diagrams - tally charts and frequency tables - bar charts - waffle diagrams - frequency diagrams for continuous data - line graphs - dot plots (one dot per data point).',
    diagnosticTrigger:
      'Student plots grouped continuous measurement data (like varying human heights) onto a discrete bar chart with spaced physical gaps between the bars rather than utilizing a seamlessly merged, contiguous frequency histogram.',
  },
  {
    id: 'MATH-G5-STAT-5SS03',
    gradeLevel: 5,
    domain: 'Statistics',
    ixlStyleSkill:
      'Find and interpret the mode and median of a data set, choosing the best fit for context.',
    cambridgeStandard:
      '5Ss.03 Understand that the mode and median are ways to describe and summarise data sets. Find and interpret the mode and the median, and consider their appropriateness for the context.',
    diagnosticTrigger:
      'Student attempts to find the mode on a bar chart and incorrectly writes down the numeric peak frequency from the y-axis instead of identifying the underlying categorical data label from the x-axis.',
  },
  {
    id: 'MATH-G5-STAT-5SS04',
    gradeLevel: 5,
    domain: 'Statistics',
    ixlStyleSkill:
      'Explain conclusions from data by identifying patterns and sources of statistical variation.',
    cambridgeStandard:
      '5Ss.04 Interpret data, identifying patterns, within and between data sets, to answer statistical questions. Discuss conclusions, considering the sources of variation.',
    diagnosticTrigger:
      "Student attributes all statistical spread or outlier points strictly to 'human mistakes in counting' rather than acknowledging natural environmental, demographic, or contextual variance inherent within a valid sample.",
  },
  {
    id: 'MATH-G5-STAT-5SP01',
    gradeLevel: 5,
    domain: 'Statistics',
    ixlStyleSkill:
      'Use probability language to assess and compare the likelihood and risk of events.',
    cambridgeStandard:
      '5Sp.01 Use the language associated with likelihood to describe and compare likelihood and risk of familiar events, including those with equally likely outcomes.',
    diagnosticTrigger:
      "Student confidently claims that flipping 'tails' three times in a row makes 'heads' mathematically guaranteed on the fourth flip, succumbing entirely to the Gambler's Fallacy regarding independent localized events.",
  },
  {
    id: 'MATH-G5-STAT-5SP02',
    gradeLevel: 5,
    domain: 'Statistics',
    ixlStyleSkill:
      'Identify whether events are equally likely, more likely, or less likely based on their layout.',
    cambridgeStandard:
      '5Sp.02 Recognise that some outcomes are equally likely to happen and some outcomes are more (or less) likely to happen, when doing practical activities.',
    diagnosticTrigger:
      "Student looks at a drastically unequal spinner (e.g., 75% red, 25% blue) and asserts both colors have a '1-in-2 chance' simply because there are two nominal color categories, totally overriding the geometric surface area mapping.",
  },
  {
    id: 'MATH-G5-STAT-5SP03',
    gradeLevel: 5,
    domain: 'Statistics',
    ixlStyleSkill:
      'Conduct probability experiments and explain the difference between small and large trial sets.',
    cambridgeStandard:
      '5Sp.03 Conduct chance experiments or simulations, using small and large numbers of trials, and present and describe the results using the language of probability.',
    diagnosticTrigger:
      "Student executes a tiny sample size of exactly 5 coin flips, gets 4 heads, and formally declares the physical coin to be biased or 'broken', fundamentally failing to grasp the smoothing necessity of the Law of Large Numbers.",
  },
];
