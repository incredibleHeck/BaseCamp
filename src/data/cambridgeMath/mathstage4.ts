import type { CurriculumObjective } from '../curriculumTypes';

/**
 * Cambridge Primary Mathematics — Stage 4 (Grade 4).
 */
export const cambridgeMathStage4: CurriculumObjective[] = [
  {
    id: 'MATH-G4-NUM-4NC01',
    gradeLevel: 4,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Skip-count forward and backward by 1s, 10s, 100s, and 1,000s, crossing zero into negative numbers.',
    cambridgeStandard:
      '4Nc.01 Count on and count back in steps of constant size: 1-digit numbers, tens, hundreds or thousands, starting from any number, and extending beyond zero to include negative numbers.',
    diagnosticTrigger:
      'Student incorrectly treats zero as a mirror or stopping point when counting backward (e.g., counting down by tens from 15 as 15, 5, 0, -5 instead of -5), failing to continuously subtract across the zero boundary on the mental number line.',
  },
  {
    id: 'MATH-G4-NUM-4NC02',
    gradeLevel: 4,
    domain: 'Numeracy',
    ixlStyleSkill: 'Predict whether the sum or difference of odd and even numbers will be odd or even.',
    cambridgeStandard:
      '4Nc.02 Recognise and explain generalisations when adding and subtracting combinations of even and odd numbers.',
    diagnosticTrigger:
      "Student rigidly calculates the exact arithmetic sum for every problem rather than abstracting the structural rule that an odd plus an odd physically pairs up the 'leftover' units to yield an even whole.",
  },
  {
    id: 'MATH-G4-NUM-4NC03',
    gradeLevel: 4,
    domain: 'Numeracy',
    ixlStyleSkill: 'Find the missing number in equations where shapes or symbols represent unknown quantities.',
    cambridgeStandard:
      '4Nc.03 Recognise the use of objects, shapes or symbols to represent unknown quantities in addition and subtraction calculations.',
    diagnosticTrigger:
      'Student writes two different numerical values into identical shapes within the same equation (e.g., substituting 4 and 6 into two identical squares that sum to 10), failing to understand the pre-algebraic rule that a specific symbol must maintain a constant numerical value.',
  },
  {
    id: 'MATH-G4-NUM-4NC04',
    gradeLevel: 4,
    domain: 'Numeracy',
    ixlStyleSkill: 'Identify the term-to-term rule and extend linear and non-linear number sequences.',
    cambridgeStandard:
      '4Nc.04 Recognise and extend linear and non-linear sequences, and describe the term-to-term rule.',
    diagnosticTrigger:
      'Student assumes every sequence strictly adds a constant and tries to force an arithmetic difference on a geometric progression (e.g., continuing 2, 4, 8... with 12 instead of 16), unable to cognitively shift to a multiplicative term-to-term rule.',
  },
  {
    id: 'MATH-G4-NUM-4NC05',
    gradeLevel: 4,
    domain: 'Numeracy',
    ixlStyleSkill: 'Identify and draw the next figure in a spatial pattern of square numbers.',
    cambridgeStandard: '4Nc.05 Recognise and extend the spatial pattern of square numbers.',
    diagnosticTrigger:
      'Student extends a drawn 3x3 array to a 4x3 array instead of a 4x4 array, focusing only on adding one row and failing to simultaneously scale both geometric dimensions to conserve the mathematical square property.',
  },
  {
    id: 'MATH-G4-NUM-4NI01',
    gradeLevel: 4,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Read and write whole numbers greater than 1,000 and negative numbers using words and numerals.',
    cambridgeStandard: '4Ni.01 Read and write number names and whole numbers greater than 1000 and less than 0.',
    diagnosticTrigger:
      "Student reads or writes -34 as 'minus thirty-four' as a strict subtraction operation rather than conceptualizing it structurally as 'negative thirty-four', a distinct integer coordinate below zero.",
  },
  {
    id: 'MATH-G4-NUM-4NI02',
    gradeLevel: 4,
    domain: 'Numeracy',
    ixlStyleSkill: 'Estimate totals and accurately add or subtract whole numbers with up to three digits.',
    cambridgeStandard: '4Ni.02 Estimate, add and subtract whole numbers with up to three digits.',
    diagnosticTrigger:
      'Student correctly executes the regrouping procedure but skips the estimation step entirely, blindly accepting a calculated answer that is wildly out of magnitude bounds without noticing the logical impossibility.',
  },
  {
    id: 'MATH-G4-NUM-4NI03',
    gradeLevel: 4,
    domain: 'Numeracy',
    ixlStyleSkill: 'Use the associative property to group numbers differently to make multiplication easier.',
    cambridgeStandard:
      '4Ni.03 Understand the associative property of multiplication, and use this to simplify calculations.',
    diagnosticTrigger:
      'Student rigidly multiplies a sequence like 5 x 7 x 2 strictly from left-to-right (35 x 2), missing the cognitive opportunity to dynamically regroup the 5 and 2 into a base-10 anchor (10 x 7) to drastically reduce working memory load.',
  },
  {
    id: 'MATH-G4-NUM-4NI04',
    gradeLevel: 4,
    domain: 'Numeracy',
    ixlStyleSkill: 'Recall all multiplication and division facts up to 10 × 10 fluently.',
    cambridgeStandard: '4Ni.04 Know all times tables from 1 to 10.',
    diagnosticTrigger:
      'Student continues to rely on sequential skip-counting or finger-tracking for 7s, 8s, and 9s, indicating these facts have not yet transitioned from procedural calculation loops into direct semantic memory retrieval networks.',
  },
  {
    id: 'MATH-G4-NUM-4NI05',
    gradeLevel: 4,
    domain: 'Numeracy',
    ixlStyleSkill: 'Multiply whole numbers up to 1,000 by a 1-digit number.',
    cambridgeStandard: '4Ni.05 Estimate and multiply whole numbers up to 1000 by 1-digit whole numbers.',
    diagnosticTrigger:
      'Student misaligns the partial products or forgets to multiply the 1-digit multiplier by the tens or hundreds column (e.g., computing 342 x 2 by just multiplying the ones and hundreds), indicating a breakdown in applying the distributive property across all spatial place values.',
  },
  {
    id: 'MATH-G4-NUM-4NI06',
    gradeLevel: 4,
    domain: 'Numeracy',
    ixlStyleSkill: 'Divide numbers up to 100 by a 1-digit number, including problems with remainders.',
    cambridgeStandard: '4Ni.06 Estimate and divide whole numbers up to 100 by 1-digit whole numbers.',
    diagnosticTrigger:
      'Student writes the remainder as a standalone integer identical to the quotient (e.g., 25 / 4 = 6 R 1 written as 61), lacking the positional notation and conceptual boundary to separate the primary quotient from the indivisible leftover magnitude.',
  },
  {
    id: 'MATH-G4-NUM-4NI07',
    gradeLevel: 4,
    domain: 'Numeracy',
    ixlStyleSkill: 'Identify factors and multiples of a number and explain their relationship.',
    cambridgeStandard: '4Ni.07 Understand the relationship between multiples and factors.',
    diagnosticTrigger:
      'Student conflates the two terms entirely, listing infinitely expanding multiples (e.g., 12, 24, 36) when asked to find the finite, bounded set of internal factors that divide evenly into 12.',
  },
  {
    id: 'MATH-G4-NUM-4NI08',
    gradeLevel: 4,
    domain: 'Numeracy',
    ixlStyleSkill: 'Use divisibility rules to test if numbers divide evenly by 2, 5, 10, 25, 50, and 100.',
    cambridgeStandard:
      '4Ni.08 Use knowledge of factors and multiples to understand tests of divisibility by 2, 5, 10, 25, 50 and 100.',
    diagnosticTrigger:
      'Student attempts long division to verify if 3,475 is divisible by 25 instead of spatially isolating the final two digits (75) to execute a rapid chunking heuristic based on known multiples of 25.',
  },
  {
    id: 'MATH-G4-NUM-4NP01',
    gradeLevel: 4,
    domain: 'Numeracy',
    ixlStyleSkill: 'Identify the place value and total value of any digit in numbers up to the millions.',
    cambridgeStandard:
      '4Np.01 Understand and explain that the value of each digit in numbers is determined by its position in that number.',
    diagnosticTrigger:
      "Student identifies the '4' in 34,500 as representing 'four thousand' but cannot articulate that it equals forty hundreds, rigidly locking the digit to a single nominal label instead of understanding its nested, proportional base-10 value.",
  },
  {
    id: 'MATH-G4-NUM-4NP02',
    gradeLevel: 4,
    domain: 'Numeracy',
    ixlStyleSkill: 'Multiply and divide whole numbers by 10 and 100 by shifting digits.',
    cambridgeStandard: '4Np.02 Use knowledge of place value to multiply and divide whole numbers by 10 and 100.',
    diagnosticTrigger:
      'Student attempts to multiply by 10 by blindly appending a zero to the end of a number without cognitively conceptualizing that the entire sequence of digits has actually shifted one spatial column to the left in the base-10 hierarchy.',
  },
  {
    id: 'MATH-G4-NUM-4NP03',
    gradeLevel: 4,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Decompose and regroup numbers in multiple ways (e.g., 4,687 as 46 hundreds and 87 ones).',
    cambridgeStandard: '4Np.03 Compose, decompose and regroup whole numbers.',
    diagnosticTrigger:
      'Student successfully writes standard expanded form but freezes when asked to represent 4,687 as 46 hundreds and 87 ones, demonstrating a rigid column-by-column mental framework that cannot flexibly cross place-value boundaries.',
  },
  {
    id: 'MATH-G4-NUM-4NP04',
    gradeLevel: 4,
    domain: 'Numeracy',
    ixlStyleSkill: 'Compare and order positive and negative numbers using <, >, and =.',
    cambridgeStandard:
      '4Np.04 Understand the relative size of quantities to compare and order positive and negative numbers, using the symbols =, > and <.',
    diagnosticTrigger:
      'Student states that -15 is greater than -5 by falsely carrying over whole-number magnitude logic, failing to mirror the spatial logic of the number line where larger absolute values below zero equate to smaller geometric coordinates.',
  },
  {
    id: 'MATH-G4-NUM-4NP05',
    gradeLevel: 4,
    domain: 'Numeracy',
    ixlStyleSkill: 'Round multi-digit numbers to the nearest 10, 100, 1,000, 10,000, or 100,000.',
    cambridgeStandard: '4Np.05 Round numbers to the nearest 10, 100, 1000, 10 000 or 100 000.',
    diagnosticTrigger:
      'Student rounds 1,234,567 to the nearest 10,000 by evaluating the millions digit instead of strictly targeting the thousands place as the critical spatial threshold deciding the directional round of the 10,000s column.',
  },
  {
    id: 'MATH-G4-NUM-4NF01',
    gradeLevel: 4,
    domain: 'Numeracy',
    ixlStyleSkill: 'Explain why fractions with larger denominators represent smaller parts of a whole.',
    cambridgeStandard: '4Nf.01 Understand that the more parts a whole is divided into, the smaller the parts become.',
    diagnosticTrigger:
      'Student persistently claims that 1/8 is larger than 1/4 because 8 is a larger integer, failing to neurologically invert their whole-number logic to map larger denominators to highly fractured, smaller geometric subdivisions.',
  },
  {
    id: 'MATH-G4-NUM-4NF02',
    gradeLevel: 4,
    domain: 'Numeracy',
    ixlStyleSkill: 'Relate fractions to division (e.g., interpret 1/4 as 1 divided by 4).',
    cambridgeStandard:
      '4Nf.02 Understand that a fraction can be represented as a division of the numerator by the denominator (unit fractions and three-quarters).',
    diagnosticTrigger:
      "Student sees '1 ÷ 4' and writes '4' instead of '1/4', completely reversing the active roles of the divisor and dividend because they are uncomfortable generating a fractional magnitude mathematically less than one.",
  },
  {
    id: 'MATH-G4-NUM-4NF03',
    gradeLevel: 4,
    domain: 'Numeracy',
    ixlStyleSkill: 'Calculate a unit fraction of a given number or quantity (e.g., 1/5 of 20).',
    cambridgeStandard: '4Nf.03 Understand that unit fractions can act as operators.',
    diagnosticTrigger:
      'Student multiplies the whole number quantity by the denominator (e.g., 1/4 of 12 = 48) instead of dividing by it, fundamentally misinterpreting the unit fraction as an additive scaling factor rather than a partitive shrinking operator.',
  },
  {
    id: 'MATH-G4-NUM-4NF04',
    gradeLevel: 4,
    domain: 'Numeracy',
    ixlStyleSkill: 'Identify and generate equivalent proper fractions.',
    cambridgeStandard: '4Nf.04 Recognise that two proper fractions can have an equivalent value.',
    diagnosticTrigger:
      'Student adds the same constant to both numerator and denominator to find an equivalent fraction (e.g., 1/2 = 2/3) instead of applying the mandated multiplicative scaling factor required to conserve the proportional geometric ratio.',
  },
  {
    id: 'MATH-G4-NUM-4NF05',
    gradeLevel: 4,
    domain: 'Numeracy',
    ixlStyleSkill: 'Add and subtract fractions with the same denominator.',
    cambridgeStandard: '4Nf.05 Estimate, add and subtract fractions with the same denominator.',
    diagnosticTrigger:
      'Student routinely adds both numerators and denominators together (e.g., 3/8 + 2/8 = 5/16), treating the denominator as a countable quantity rather than a static geometric label defining the immutable size of the spatial partitions.',
  },
  {
    id: 'MATH-G4-NUM-4NF06',
    gradeLevel: 4,
    domain: 'Numeracy',
    ixlStyleSkill: 'Identify percentages as parts per hundred and write them using the % symbol.',
    cambridgeStandard:
      '4Nf.06 Understand percentage as the number of parts in each hundred, and use the percentage symbol (%).',
    diagnosticTrigger:
      "Student shades 5 random squares on a 10x10 grid and writes '50%', erroneously conflating 1 part out of 100 directly with 1 part out of 10 due to a failure in dual-scale visual processing.",
  },
  {
    id: 'MATH-G4-NUM-4NF07',
    gradeLevel: 4,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Compare and order proper fractions using equivalent fractions and <, >, = symbols.',
    cambridgeStandard:
      '4Nf.07 Use knowledge of equivalence to compare and order proper fractions, using the symbols =, > and <.',
    diagnosticTrigger:
      'Student compares 2/5 and 4/10 and states 4/10 is larger purely because 4 > 2, failing to execute the internal working memory operation of scaling 2/5 to a common denominator to recognize true geometric equivalence.',
  },
  {
    id: 'MATH-G4-MEA-4GT01',
    gradeLevel: 4,
    domain: 'Measurement',
    ixlStyleSkill:
      'Convert between standard units of time (seconds, minutes, hours, days, weeks, months, years).',
    cambridgeStandard: '4Gt.01 Understand the direct relationship between units of time, and convert between them.',
    diagnosticTrigger:
      'Student multiplies by 10 or 100 to convert hours to minutes (e.g., claiming 2 hours = 200 minutes), misapplying universal metric base-10 rules to the irregular base-60 sexagesimal system of temporal duration.',
  },
  {
    id: 'MATH-G4-MEA-4GT02',
    gradeLevel: 4,
    domain: 'Measurement',
    ixlStyleSkill:
      'Read exact minutes on analog clocks and convert between 12-hour and 24-hour digital times.',
    cambridgeStandard:
      '4Gt.02 Read and record time accurately in digital notation (12- and 24-hour) and on analogue clocks.',
    diagnosticTrigger:
      'Student converts 3:00 PM to 03:00 instead of 15:00, failing to map the modular +12 arithmetic shift required to project afternoon hours onto the continuous 24-hour temporal scale.',
  },
  {
    id: 'MATH-G4-MEA-4GT03',
    gradeLevel: 4,
    domain: 'Measurement',
    ixlStyleSkill: 'Extract information and calculate times using 12-hour and 24-hour timetables.',
    cambridgeStandard: '4Gt.03 Interpret and use the information in timetables (12- and 24-hour clock).',
    diagnosticTrigger:
      'Student calculates duration on a timetable by simply subtracting the integer values linearly (e.g., 14:20 to 15:10 is 15 - 14 = 1 hour and 10 - 20 = -10 minutes), completely missing the necessary base-60 modulo carryover.',
  },
  {
    id: 'MATH-G4-MEA-4GT04',
    gradeLevel: 4,
    domain: 'Measurement',
    ixlStyleSkill:
      'Calculate elapsed time across related units without bridging through 60 (e.g., days to weeks).',
    cambridgeStandard:
      '4Gt.04 Find time intervals between different units: - days, weeks, months and years - seconds, minutes and hours that do not bridge through 60.',
    diagnosticTrigger:
      "Student counts the start day as 'Day 1' of the interval rather than mathematically calculating the gap between days, leading to a systemic off-by-one counting error when calculating intervals in weeks and days.",
  },
  {
    id: 'MATH-G4-GEO-4GG01',
    gradeLevel: 4,
    domain: 'Geometry',
    ixlStyleSkill: 'Combine 2D shapes to create compound shapes and determine if they tessellate.',
    cambridgeStandard:
      '4Gg.01 Investigate what shapes can be made if two or more shapes are combined, and analyse their properties, including reference to tessellation.',
    diagnosticTrigger:
      "Student forces curved shapes or non-regular polygons together, leaving visible gaps but claiming they 'tessellate,' failing to recognize that tessellation requires the exact topological matching of straight edges and vertices summing to 360 degrees.",
  },
  {
    id: 'MATH-G4-MEA-4GG02',
    gradeLevel: 4,
    domain: 'Measurement',
    ixlStyleSkill:
      'Calculate the area of a compound shape by dividing it into two smaller rectangles.',
    cambridgeStandard:
      '4Gg.02 Estimate and measure perimeter and area of 2D shapes, understanding that two areas can be added together to calculate the area of a compound shape.',
    diagnosticTrigger:
      'Student attempts to multiply the total outer perimeter dimensions of a rectilinear compound shape to find the area, ignoring the structural necessity to decompose the non-standard polygon into discrete, orthogonally calculable rectangular zones.',
  },
  {
    id: 'MATH-G4-MEA-4GG03',
    gradeLevel: 4,
    domain: 'Measurement',
    ixlStyleSkill:
      'Use the formulas to calculate the area and perimeter of drawn squares and rectangles.',
    cambridgeStandard:
      '4Gg.03 Draw rectangles and squares on square grids, and measure their perimeter and area. Derive and use formulae to calculate areas and perimeters of rectangles and squares.',
    diagnosticTrigger:
      'Student confuses the two derived formulas, multiplying side lengths when asked for perimeter or adding them when asked for area, indicating a total semantic detachment from the physical 1D boundary edge versus the 2D surface concept.',
  },
  {
    id: 'MATH-G4-MEA-4GG04',
    gradeLevel: 4,
    domain: 'Measurement',
    ixlStyleSkill: 'Estimate the area of irregular shapes on a grid by combining partial squares.',
    cambridgeStandard: '4Gg.04 Estimate the area of irregular shapes on a square grid (whole and part squares).',
    diagnosticTrigger:
      'Student strictly counts only perfectly intact, fully enclosed squares inside the irregular boundary, completely discarding all partial squares and severely underestimating the total continuous 2D spatial area.',
  },
  {
    id: 'MATH-G4-GEO-4GG05',
    gradeLevel: 4,
    domain: 'Geometry',
    ixlStyleSkill:
      'Identify and describe the 2D flat shapes that make up the faces of 3D solid figures.',
    cambridgeStandard: '4Gg.05 Identify 2D faces of 3D shapes, and describe their properties.',
    diagnosticTrigger:
      'Student looks at a square-based pyramid and claims it is made entirely of triangles, completely ignoring the occluded bottom base geometry because their visual perception is locked exclusively onto the primary lateral faces.',
  },
  {
    id: 'MATH-G4-GEO-4GG06',
    gradeLevel: 4,
    domain: 'Geometry',
    ixlStyleSkill: 'Match a flattened 2D paper net to the 3D solid figure it folds into.',
    cambridgeStandard: '4Gg.06 Match nets to their corresponding 3D shapes.',
    diagnosticTrigger:
      'Student incorrectly selects a net with 5 square faces for a fully closed geometric cube, unable to neurologically simulate the topological folding action required to realize one physical face will be completely missing.',
  },
  {
    id: 'MATH-G4-GEO-4GG07',
    gradeLevel: 4,
    domain: 'Geometry',
    ixlStyleSkill: 'Draw horizontal, vertical, and diagonal lines of symmetry on shapes and patterns.',
    cambridgeStandard:
      '4Gg.07 Identify all horizontal, vertical and diagonal lines of symmetry on 2D shapes and patterns.',
    diagnosticTrigger:
      "Student draws a diagonal line of symmetry corner-to-corner through a non-square rectangle, erroneously equating the concept of 'bisecting into equal halves' with a true geometric point-to-point mirror reflection.",
  },
  {
    id: 'MATH-G4-GEO-4GG08',
    gradeLevel: 4,
    domain: 'Geometry',
    ixlStyleSkill: 'Classify angles as acute, right, or obtuse without using a protractor.',
    cambridgeStandard:
      '4Gg.08 Estimate, compare and classify angles, using geometric vocabulary including acute, right and obtuse.',
    diagnosticTrigger:
      'Student categorizes an angle based on the physical length of the drawn line segments radiating from the vertex rather than comparing the invisible rotational opening distance against a 90-degree orthogonal benchmark.',
  },
  {
    id: 'MATH-G4-MEA-4GG09',
    gradeLevel: 4,
    domain: 'Measurement',
    ixlStyleSkill: 'Read measurement scales where pointers land on unnumbered fractional marks.',
    cambridgeStandard: '4Gg.09 Use knowledge of fractions to read and interpret a measuring scale.',
    diagnosticTrigger:
      'Student counts the literal number of tick marks between integers (e.g., seeing 3 lines between 0 and 1 and assuming the first line is 1/3), failing to mathematically divide the continuous interval block into 4 equal fractional spatial gaps.',
  },
  {
    id: 'MATH-G4-GEO-4GP01',
    gradeLevel: 4,
    domain: 'Geometry',
    ixlStyleSkill:
      'Describe and follow movement on a map using cardinal and diagonal ordinal directions (NE, NW, SE, SW).',
    cambridgeStandard:
      '4Gp.01 Interpret and create descriptions of position, direction and movement, including reference to cardinal and ordinal points, and their notations.',
    diagnosticTrigger:
      'Student moves purely horizontally and then vertically to reach a point rather than utilizing the 45-degree diagonal ordinal vectors (like NE), lacking the spatial integration required for dual-axis diagonal movement.',
  },
  {
    id: 'MATH-G4-GEO-4GP02',
    gradeLevel: 4,
    domain: 'Geometry',
    ixlStyleSkill: 'Read and plot points on a coordinate grid using (x, y) coordinates in the first quadrant.',
    cambridgeStandard:
      '4Gp.02 Understand that position can be described using coordinate notation. Read and plot coordinates in the first quadrant (with the aid of a grid).',
    diagnosticTrigger:
      'Student plots (3, 5) by moving 3 units up the y-axis and 5 units across the x-axis, fundamentally reversing the strict Cartesian syntax that demands horizontal traversal before vertical translation.',
  },
  {
    id: 'MATH-G4-GEO-4GP03',
    gradeLevel: 4,
    domain: 'Geometry',
    ixlStyleSkill: 'Draw the exact reflection of a shape over a mirror line on a square grid.',
    cambridgeStandard:
      '4Gp.03 Reflect 2D shapes in a horizontal or vertical mirror line, including where the mirror line is the edge of the shape, on square grids.',
    diagnosticTrigger:
      'Student copies the shape exactly as oriented instead of flipping it, effectively performing a linear slide (translation) and failing to invert the perpendicular coordinate distances across the mirror axis.',
  },
  {
    id: 'MATH-G4-STAT-4SS01',
    gradeLevel: 4,
    domain: 'Statistics',
    ixlStyleSkill:
      'Plan a statistical investigation by choosing the correct type of categorical or discrete data to collect.',
    cambridgeStandard:
      '4Ss.01 Plan and conduct an investigation to answer statistical questions, considering what data to collect (categorical and discrete data).',
    diagnosticTrigger:
      "Student proposes collecting an irrelevant qualitative metric (e.g., asking 'What is your favorite book?') when attempting to answer a quantitative statistical question like 'Which children's book is easier to read?', showing a disconnect between research hypothesis and variable selection.",
  },
  {
    id: 'MATH-G4-STAT-4SS02',
    gradeLevel: 4,
    domain: 'Statistics',
    ixlStyleSkill:
      'Choose the best graph to organize data (Venn, tally, bar chart, or dot plot) and draw it accurately.',
    cambridgeStandard:
      '4Ss.02 Record, organise and represent categorical and discrete data. Choose and explain which representation to use in a given situation: - Venn and Carroll diagrams - tally charts and frequency tables - pictograms and bar charts - dot plots (one dot per count).',
    diagnosticTrigger:
      'Student plots discrete categorical data onto a bar chart but merges the bars so they touch seamlessly, fundamentally violating the spatial rules of nominal data presentation which require distinct gaps between independent categories.',
  },
  {
    id: 'MATH-G4-STAT-4SS03',
    gradeLevel: 4,
    domain: 'Statistics',
    ixlStyleSkill:
      'Compare two data sets or graphs and explain their similarities and differences using evidence.',
    cambridgeStandard:
      '4Ss.03 Interpret data, identifying similarities and variations, within and between data sets, to answer statistical questions. Discuss conclusions, considering the sources of variation.',
    diagnosticTrigger:
      'Student visually compares the raw height of bars across two different graphs without verifying the y-axis scales, drawing entirely false comparative conclusions because they ignored the underlying scalar intervals.',
  },
  {
    id: 'MATH-G4-STAT-4SP01',
    gradeLevel: 4,
    domain: 'Statistics',
    ixlStyleSkill:
      'Describe the chance of real-world events using probability words like impossible, unlikely, likely, and certain.',
    cambridgeStandard:
      '4Sp.01 Use language associated with chance to describe familiar events, including reference to maybe, likely, certain, impossible.',
    diagnosticTrigger:
      "Student labels an event with a 1-in-100 chance of occurring as strictly 'impossible', displaying a cognitive failure to tolerate low-probability mathematical risk versus absolute deterministic certainty.",
  },
  {
    id: 'MATH-G4-STAT-4SP02',
    gradeLevel: 4,
    domain: 'Statistics',
    ixlStyleSkill: 'Run probability experiments and explain why more trials produce more predictable results.',
    cambridgeStandard:
      '4Sp.02 Conduct chance experiments, using small and large numbers of trials, and present and describe the results using the language of probability.',
    diagnosticTrigger:
      'Student expects a 6-sided die rolled exactly 6 times to perfectly yield one of each number, failing to comprehend the concept of localized random variance and the necessity of large sample sets to model theoretical equilibrium.',
  },
];
