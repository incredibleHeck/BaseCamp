import type { CurriculumObjective } from '../curriculumTypes';

/**
 * Cambridge Primary Mathematics — Stage 2 (Grade 2).
 */
export const cambridgeMathStage2: CurriculumObjective[] = [
  {
    id: 'MATH-G2-NUM-2NC01',
    gradeLevel: 2,
    domain: 'Numeracy',
    ixlStyleSkill: 'Count sets of objects up to 100 accurately.',
    cambridgeStandard: '2Nc.01 Count objects from 0 to 100.',
    diagnosticTrigger:
      'Student loses track when counting large sets on paper, recounting or skipping drawn items because they lack a systematic spatial strategy, such as crossing out items, to partition counted versus uncounted space.',
  },
  {
    id: 'MATH-G2-NUM-2NC02',
    gradeLevel: 2,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Subitize and instantly identify quantities up to 10 in random or scattered arrangements.',
    cambridgeStandard:
      '2Nc.02 Recognise the number of objects presented in unfamiliar patterns up to 10, without counting.',
    diagnosticTrigger:
      'Student reverts to pointing and touching each individual item one-by-one rather than visually clustering a scattered group of dots into known subsets (e.g., seeing a 4 and a 3) to rapidly deduce the total.',
  },
  {
    id: 'MATH-G2-NUM-2NC03',
    gradeLevel: 2,
    domain: 'Numeracy',
    ixlStyleSkill: 'Estimate the number of objects in a collection up to 100.',
    cambridgeStandard: '2Nc.03 Estimate the number of objects or people (up to 100).',
    diagnosticTrigger:
      "Student writes down wildly unrealistic numbers (e.g., guessing '5' or '1000' for a jar of 50 beads), demonstrating an inability to mentally scale spatial base-10 benchmark quantities against visual volume.",
  },
  {
    id: 'MATH-G2-NUM-2NC04',
    gradeLevel: 2,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Count forward and backward by 1s, 2s, 5s, and 10s from any starting number within 100.',
    cambridgeStandard:
      '2Nc.04 Count on and count back in ones, twos, fives or tens, starting from any number (from 0 to 100).',
    diagnosticTrigger:
      'Student automatically resets to counting by 1s when asked to skip count by 10s from an off-decade starting number (e.g., 23, 33...), failing to cognitively isolate and sequentially manipulate just the tens place.',
  },
  {
    id: 'MATH-G2-NUM-2NC05',
    gradeLevel: 2,
    domain: 'Numeracy',
    ixlStyleSkill: 'Identify odd and even numbers up to 100 by looking at the ones digit.',
    cambridgeStandard: '2Nc.05 Recognise the characteristics of even and odd numbers (from 0 to 100).',
    diagnosticTrigger:
      'Student erroneously judges the parity of a number by looking at the tens digit instead of the ones digit, incorrectly concluding that 32 is odd simply because 3 is an odd digit.',
  },
  {
    id: 'MATH-G2-NUM-2NC06',
    gradeLevel: 2,
    domain: 'Numeracy',
    ixlStyleSkill: 'Identify rules and extend number sequences up to 100.',
    cambridgeStandard: '2Nc.06 Recognise, describe and extend numerical sequences (from 0 to 100).',
    diagnosticTrigger:
      'Student merely repeats the last given number or adds a random integer, unable to calculate the constant mathematical differential (step size) between adjacent terms in the sequence.',
  },
  {
    id: 'MATH-G2-NUM-2NM01',
    gradeLevel: 2,
    domain: 'Numeracy',
    ixlStyleSkill: 'Identify the value and notation of local currency.',
    cambridgeStandard: '2Nm.01 Recognise value and money notation used in local currency.',
    diagnosticTrigger:
      'Student writes money amounts using standard integer notation without the correct currency symbol, treating financial units merely as abstract counting numbers disconnected from real-world denominated value.',
  },
  {
    id: 'MATH-G2-NUM-2NM02',
    gradeLevel: 2,
    domain: 'Numeracy',
    ixlStyleSkill: 'Compare the total value of different combinations of coins and bills.',
    cambridgeStandard: '2Nm.02 Compare values of different combinations of coins or notes.',
    diagnosticTrigger:
      'Student strictly counts the physical quantity of coins on the page to determine which pile is worth more, completely ignoring the minted denomination value assigned to each individual coin.',
  },
  {
    id: 'MATH-G2-NUM-2NI01',
    gradeLevel: 2,
    domain: 'Numeracy',
    ixlStyleSkill: 'Read, write, and recite number words and numerals up to 100.',
    cambridgeStandard: '2Ni.01 Recite, read and write number names and whole numbers (from 0 to 100).',
    diagnosticTrigger:
      "Student writes '704' for seventy-four, linearly concatenating the literal digits for '70' and '4' side-by-side instead of using place value structure to overlap the tens and ones.",
  },
  {
    id: 'MATH-G2-NUM-2NI02',
    gradeLevel: 2,
    domain: 'Numeracy',
    ixlStyleSkill: 'Use inverse relationships to link addition and subtraction facts.',
    cambridgeStandard: '2Ni.02 Understand and explain the relationship between addition and subtraction.',
    diagnosticTrigger:
      'Student calculates 15 - 7 by starting from scratch and counting backward on fingers, failing to mentally reverse the part-whole relationship to retrieve the known addition fact 7 + 8 = 15.',
  },
  {
    id: 'MATH-G2-NUM-2NI03',
    gradeLevel: 2,
    domain: 'Numeracy',
    ixlStyleSkill: 'Find number pairs that add up to 20 or to multiples of 10 up to 100.',
    cambridgeStandard:
      '2Ni.03 Recognise complements of 20 and complements of multiples of 10 (up to 100).',
    diagnosticTrigger:
      'Student painstakingly counts on by ones to find the missing complement for 40 + ? = 100, lacking the automated retrieval of base-10 decade number bonds.',
  },
  {
    id: 'MATH-G2-NUM-2NI04',
    gradeLevel: 2,
    domain: 'Numeracy',
    ixlStyleSkill: 'Add and subtract two-digit numbers without regrouping.',
    cambridgeStandard:
      '2Ni.04 Estimate, add and subtract whole numbers with up to two digits (no regrouping of ones or tens).',
    diagnosticTrigger:
      'Student adds diagonally across place values (e.g., computing 42 + 31 by adding the 4 tens to the 1 one), fundamentally violating spatial alignment and columnar place value rules.',
  },
  {
    id: 'MATH-G2-NUM-2NI05',
    gradeLevel: 2,
    domain: 'Numeracy',
    ixlStyleSkill: 'Model multiplication using repeated addition and arrays.',
    cambridgeStandard: '2Ni.05 Understand multiplication as: - repeated addition - an array.',
    diagnosticTrigger:
      'Student draws completely scattered, unequal groups when asked to create a 3x4 array, failing to enforce the strict equal-group, grid-aligned spatial structure required for visual multiplication.',
  },
  {
    id: 'MATH-G2-NUM-2NI06',
    gradeLevel: 2,
    domain: 'Numeracy',
    ixlStyleSkill: 'Model division as sharing into equal groups or repeated subtraction.',
    cambridgeStandard:
      '2Ni.06 Understand division as: - sharing (number of items per group) - grouping (number of groups) - repeated subtraction.',
    diagnosticTrigger:
      "Student distributes drawn items into groups but ignores remainders or leaves groups unequal, completely missing the foundational constraint of 'fair sharing' that defines division.",
  },
  {
    id: 'MATH-G2-NUM-2NI07',
    gradeLevel: 2,
    domain: 'Numeracy',
    ixlStyleSkill: 'Recall multiplication facts for the 1, 2, 5, and 10 times tables.',
    cambridgeStandard: '2Ni.07 Know 1, 2, 5 and 10 times tables.',
    diagnosticTrigger:
      'Student slowly skip-counts sequentially on fingers from zero for every 5s multiplication fact rather than instantly retrieving the specific product from semantic associative memory.',
  },
  {
    id: 'MATH-G2-NUM-2NP01',
    gradeLevel: 2,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Identify the value of digits in a two-digit number, recognizing zero as a placeholder.',
    cambridgeStandard:
      '2Np.01 Understand and explain that the value of each digit in a 2-digit number is determined by its position in that number, recognising zero as a place holder.',
    diagnosticTrigger:
      "Student drops the zero in numbers like 50 when expanding or rewriting them, treating the 5 simply as 'five', failing to recognize zero's critical spatial role in shifting digits into the tens place.",
  },
  {
    id: 'MATH-G2-NUM-2NP02',
    gradeLevel: 2,
    domain: 'Numeracy',
    ixlStyleSkill: 'Break apart 2-digit numbers into tens and ones, and recombine them.',
    cambridgeStandard: '2Np.02 Compose, decompose and regroup 2-digit numbers, using tens and ones.',
    diagnosticTrigger:
      "Student cannot translate the phrase '3 tens and 6 ones' into the numeral 36, demonstrating a rigid, monolithic view of numbers rather than a flexible, compositional base-10 understanding.",
  },
  {
    id: 'MATH-G2-NUM-2NP03',
    gradeLevel: 2,
    domain: 'Numeracy',
    ixlStyleSkill: 'Compare and order two-digit numbers using relative size.',
    cambridgeStandard: '2Np.03 Understand the relative size of quantities to compare and order 2-digit numbers.',
    diagnosticTrigger:
      'Student decides that 49 is greater than 61 because 9 is the largest individual digit present, failing to prioritize the hierarchical dominance of the tens place over the ones place.',
  },
  {
    id: 'MATH-G2-NUM-2NP04',
    gradeLevel: 2,
    domain: 'Numeracy',
    ixlStyleSkill: 'Identify and use ordinal numbers to denote position in a sequence.',
    cambridgeStandard: '2Np.04 Recognise and use ordinal numbers.',
    diagnosticTrigger:
      "Student labels the 3rd item in a sequence as 'number 3' or 'three', linguistically and conceptually conflating cardinal quantity (how many total) with ordinal rank (which specific position).",
  },
  {
    id: 'MATH-G2-NUM-2NP05',
    gradeLevel: 2,
    domain: 'Numeracy',
    ixlStyleSkill: 'Round two-digit numbers to the nearest 10.',
    cambridgeStandard: '2Np.05 Round 2-digit numbers to the nearest 10.',
    diagnosticTrigger:
      'Student consistently rounds down regardless of the ones digit (e.g., truncating 48 to 40), misunderstanding the spatial midpoint threshold of 5 on the mental number line required for rounding.',
  },
  {
    id: 'MATH-G2-NUM-2NF01',
    gradeLevel: 2,
    domain: 'Numeracy',
    ixlStyleSkill: 'Differentiate between shapes divided into four equal parts and four unequal parts.',
    cambridgeStandard:
      '2Nf.01 Understand that an object or shape can be split into four equal parts or four unequal parts.',
    diagnosticTrigger:
      "Student draws three parallel lines haphazardly across a shape and labels the four resulting irregular slices as 'quarters', failing to visually verify strict area equality among the geometric parts.",
  },
  {
    id: 'MATH-G2-NUM-2NF02',
    gradeLevel: 2,
    domain: 'Numeracy',
    ixlStyleSkill: 'Identify a quarter (1/4) of a whole shape or a set of objects.',
    cambridgeStandard:
      '2Nf.02 Understand that a quarter can describe one of four equal parts of a quantity or set of objects.',
    diagnosticTrigger:
      "Student shades one single piece of a shape that is divided into three equal parts and calls it a quarter, conflating the loose idea of 'one piece' with the specific mathematical requirement of 'one out of four'.",
  },
  {
    id: 'MATH-G2-NUM-2NF03',
    gradeLevel: 2,
    domain: 'Numeracy',
    ixlStyleSkill: 'Relate finding one half or one quarter to dividing by 2 or 4.',
    cambridgeStandard: '2Nf.03 Understand that one half and one quarter can be interpreted as division.',
    diagnosticTrigger:
      'Student attempts to find a quarter of the number 12 by physically dividing the digits on the paper instead of bridging the fraction notation to the arithmetic operation of division by 4.',
  },
  {
    id: 'MATH-G2-NUM-2NF04',
    gradeLevel: 2,
    domain: 'Numeracy',
    ixlStyleSkill: 'Calculate halves, quarters, and three-quarters of a given number or quantity.',
    cambridgeStandard: '2Nf.04 Understand that fractions (half, quarter and three-quarters) can act as operators.',
    diagnosticTrigger:
      'Student accurately calculates 1/4 of a set but stops there when asked for 3/4, failing to execute the secondary operation of multiplying the derived unit fraction quantity by the numerator.',
  },
  {
    id: 'MATH-G2-NUM-2NF05',
    gradeLevel: 2,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Compare the relative size of fractions and identify equivalents for one whole and one half.',
    cambridgeStandard:
      '2Nf.05 Recognise the relative size of 1/4, 1/2, 3/4 and 1, and the equivalence of 1/2 and 2/4, and 2/2, 4/4 and 1.',
    diagnosticTrigger:
      'Student states that 1/4 is geometrically larger than 1/2 simply because 4 is greater than 2, misapplying whole-number cardinality logic to fraction denominators and misunderstanding the inverse slice-size relationship.',
  },
  {
    id: 'MATH-G2-NUM-2NF06',
    gradeLevel: 2,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Combine fractional parts like halves and quarters to visually create new fractions or wholes.',
    cambridgeStandard:
      '2Nf.06 Understand and visualise that wholes, halves and quarters can be combined to create new fractions.',
    diagnosticTrigger:
      'Student adds both the numerators and the denominators when conceptually combining 1/4 and 1/4 (e.g., writing 2/8), misinterpreting the denominator as a count rather than a fixed geometric unit size.',
  },
  {
    id: 'MATH-G2-MEA-2GT01',
    gradeLevel: 2,
    domain: 'Measurement',
    ixlStyleSkill:
      'Order and compare time units like seconds, minutes, hours, days, weeks, months, and years.',
    cambridgeStandard:
      '2Gt.01 Order and compare units of time (seconds, minutes, hours, days, weeks, months and years).',
    diagnosticTrigger:
      "Student claims a routine task like brushing teeth takes '5 hours' instead of '10 minutes', indicating a profound lack of temporal magnitude scaling and real-world anchoring for abstract time units.",
  },
  {
    id: 'MATH-G2-MEA-2GT02',
    gradeLevel: 2,
    domain: 'Measurement',
    ixlStyleSkill: 'Read and write the time to the nearest five minutes on analog and digital clocks.',
    cambridgeStandard:
      '2Gt.02 Read and record time to five minutes in digital notation (12-hour) and on analogue clocks.',
    diagnosticTrigger:
      "Student reads an analog clock with the minute hand pointing at the 3 as ':03' instead of ':15', failing to map the base-5 multiplicative scale onto the geometric numerals of the clock face.",
  },
  {
    id: 'MATH-G2-MEA-2GT03',
    gradeLevel: 2,
    domain: 'Measurement',
    ixlStyleSkill: 'Interpret calendars to find specific days, dates, and durations.',
    cambridgeStandard: '2Gt.03 Interpret and use the information in calendars.',
    diagnosticTrigger:
      'Student counts every single individual square on a calendar grid sequentially to find a date exactly one week later, rather than spatially navigating straight down the column to add 7 days instantly.',
  },
  {
    id: 'MATH-G2-GEO-2GG01',
    gradeLevel: 2,
    domain: 'Geometry',
    ixlStyleSkill:
      'Identify, describe, and sketch 2D shapes based on their sides and vertices, regardless of orientation.',
    cambridgeStandard:
      '2Gg.01 Identify, describe, sort, name and sketch 2D shapes by their properties, including reference to regular polygons, number of sides and vertices. Recognise these shapes in different positions and orientations.',
    diagnosticTrigger:
      "Student fails to identify a square if it is rotated 45 degrees, calling it a 'diamond' instead, demonstrating a reliance on prototypic orientation rather than invariant structural properties like equal side lengths.",
  },
  {
    id: 'MATH-G2-GEO-2GG02',
    gradeLevel: 2,
    domain: 'Geometry',
    ixlStyleSkill:
      'Identify the center of a circle and understand that all boundary points are equidistant from it.',
    cambridgeStandard:
      '2Gg.02 Understand that a circle has a centre and any point on the boundary is at the same distance from the centre.',
    diagnosticTrigger:
      'Student draws a noticeably off-center dot and accepts it as the middle of the circle, lacking the strict spatial constraint that a true center must enforce equal radial distances to the perimeter.',
  },
  {
    id: 'MATH-G2-MEA-2GG03',
    gradeLevel: 2,
    domain: 'Measurement',
    ixlStyleSkill: 'Estimate and measure the length of objects using standard and non-standard units.',
    cambridgeStandard:
      '2Gg.03 Understand that length is a fixed distance between two points. Estimate and measure lengths using non-standard or standard units.',
    diagnosticTrigger:
      "Student begins measuring a drawn object by aligning the ruler at the '1' mark instead of the '0' mark, resulting in a systemic off-by-one measurement error due to treating the ruler as a discrete counting tool.",
  },
  {
    id: 'MATH-G2-MEA-2GG04',
    gradeLevel: 2,
    domain: 'Measurement',
    ixlStyleSkill: 'Draw and measure straight lines accurately using standard units.',
    cambridgeStandard: '2Gg.04 Draw and measure lines, using standard units.',
    diagnosticTrigger:
      'Student traces a noticeably wobbly line alongside the ruler or lets the ruler slip during drawing, failing to lock the tool firmly to the paper\'s coordinate plane to produce a true geometric line segment.',
  },
  {
    id: 'MATH-G2-GEO-2GG05',
    gradeLevel: 2,
    domain: 'Geometry',
    ixlStyleSkill: 'Name and describe 3D solid shapes by identifying their faces, edges, and vertices.',
    cambridgeStandard:
      '2Gg.05 Identify, describe, sort and name 3D shapes by their properties, including reference to number and shapes of faces, edges and vertices.',
    diagnosticTrigger:
      'Student correctly counts the visible faces of a drawn 3D shape but completely ignores the hidden backside faces, unable to mentally construct and rotate the complete 3D topological model in working memory.',
  },
  {
    id: 'MATH-G2-MEA-2GG06',
    gradeLevel: 2,
    domain: 'Measurement',
    ixlStyleSkill: 'Estimate and measure the mass of objects.',
    cambridgeStandard:
      '2Gg.06 Understand that mass is the quantity of matter in an object. Estimate and measure familiar objects using non-standard or standard units.',
    diagnosticTrigger:
      'Student asserts that a drawn balance scale with the heavier object floating higher in the air is correct, misinterpreting the basic physical mechanics and gravity constraints of a mass balance.',
  },
  {
    id: 'MATH-G2-MEA-2GG07',
    gradeLevel: 2,
    domain: 'Measurement',
    ixlStyleSkill: 'Estimate and measure the liquid capacity of containers.',
    cambridgeStandard:
      '2Gg.07 Understand that capacity is the maximum amount that an object can contain. Estimate and measure the capacity of familiar objects using non-standard or standard units.',
    diagnosticTrigger:
      "Student assumes a tall, extremely thin glass holds more volume than a short, wide bucket solely because the water level rests higher, falling prey to vertical 1-dimensional centration while ignoring cross-sectional area.",
  },
  {
    id: 'MATH-G2-GEO-2GG08',
    gradeLevel: 2,
    domain: 'Geometry',
    ixlStyleSkill: 'Identify common 2D and 3D shapes in real-world objects.',
    cambridgeStandard: '2Gg.08 Identify 2D and 3D shapes in familiar objects.',
    diagnosticTrigger:
      "Student categorizes an image of a literal soccer ball as a 'circle' rather than a 'sphere', fundamentally collapsing 3D volumetric reality into a flattened 2D perceptual plane.",
  },
  {
    id: 'MATH-G2-GEO-2GG09',
    gradeLevel: 2,
    domain: 'Geometry',
    ixlStyleSkill: 'Draw and identify horizontal or vertical lines of symmetry on 2D shapes.',
    cambridgeStandard: '2Gg.09 Identify a horizontal or vertical line of symmetry on 2D shapes and patterns.',
    diagnosticTrigger:
      "Student draws a diagonal bisecting line through a non-square rectangle and claims it is a line of symmetry, erroneously equating 'cutting into two equal areas' with a true mirror reflection point-to-point correspondence.",
  },
  {
    id: 'MATH-G2-GEO-2GG10',
    gradeLevel: 2,
    domain: 'Geometry',
    ixlStyleSkill: 'Determine how many times a shape looks identical during a full 360-degree rotation.',
    cambridgeStandard: '2Gg.10 Predict and check how many times a shape looks identical as it completes a full turn.',
    diagnosticTrigger:
      'Student visually spins the shape but loses track of the original top vertex, resulting in random miscounts of rotational order because they lack an anchored mental reference frame.',
  },
  {
    id: 'MATH-G2-GEO-2GG11',
    gradeLevel: 2,
    domain: 'Geometry',
    ixlStyleSkill:
      'Describe turns and angles as whole, half, and quarter turns clockwise or anticlockwise.',
    cambridgeStandard:
      '2Gg.11 Understand that an angle is a description of a turn, including reference to the terms whole, half and quarter turns, both clockwise and anticlockwise.',
    diagnosticTrigger:
      "Student confuses a 'quarter turn clockwise' with sliding the physical shape to the right side of the page, fundamentally failing to distinguish rotational angular motion from linear lateral translation.",
  },
  {
    id: 'MATH-G2-MEA-2GG12',
    gradeLevel: 2,
    domain: 'Measurement',
    ixlStyleSkill: 'Read measurement scales where intermediate points represent continuous values.',
    cambridgeStandard:
      '2Gg.12 Understand a measuring scale as a continuous number line where intermediate points have value.',
    diagnosticTrigger:
      "Student counts the unnumbered tick marks on a scale strictly by ones (e.g., assuming the halfway mark between 0 and 10 is 1, not 5), unable to mentally divide the overarching interval by the spatial segments.",
  },
  {
    id: 'MATH-G2-GEO-2GP01',
    gradeLevel: 2,
    domain: 'Geometry',
    ixlStyleSkill: 'Use positional language and directions to describe movement on a grid.',
    cambridgeStandard: '2Gp.01 Use knowledge of position and direction to describe movement.',
    diagnosticTrigger:
      "Student interprets directional map instructions like 'turn right' strictly from their own fixed viewpoint sitting at the desk, failing to cognitively project themselves into the relative orientation of the moving object.",
  },
  {
    id: 'MATH-G2-GEO-2GP02',
    gradeLevel: 2,
    domain: 'Geometry',
    ixlStyleSkill: 'Sketch the reflection of a 2D shape over a vertical mirror line.',
    cambridgeStandard:
      '2Gp.02 Sketch the reflection of a 2D shape in a vertical mirror line, including where the mirror line is the edge of the shape.',
    diagnosticTrigger:
      'Student simply slides or copies the exact original shape to the other side of the vertical mirror line (translation) rather than inverting the left-right spatial coordinates to produce a true flipped reflection.',
  },
  {
    id: 'MATH-G2-STAT-2SS01',
    gradeLevel: 2,
    domain: 'Statistics',
    ixlStyleSkill: 'Investigate and answer questions using categorical data.',
    cambridgeStandard:
      '2Ss.01 Conduct an investigation to answer non-statistical and statistical questions (categorical data).',
    diagnosticTrigger:
      'Student provides anecdotal or personal answers to the questions rather than explicitly referencing the quantified categorical data points gathered during the mathematical investigation.',
  },
  {
    id: 'MATH-G2-STAT-2SS02',
    gradeLevel: 2,
    domain: 'Statistics',
    ixlStyleSkill: 'Record and display data using tables, diagrams, tally charts, and block graphs.',
    cambridgeStandard:
      '2Ss.02 Record, organise and represent categorical data. Choose and explain which representation to use in a given situation: - lists and tables - Venn and Carroll diagrams - tally charts - block graphs and pictograms.',
    diagnosticTrigger:
      'Student draws a block graph without standardizing the baseline or block sizes, leading to visually skewed bars where a lower frequency appears confusingly taller than a higher frequency.',
  },
  {
    id: 'MATH-G2-STAT-2SS03',
    gradeLevel: 2,
    domain: 'Statistics',
    ixlStyleSkill: 'Interpret data from charts to spot similarities, differences, and draw conclusions.',
    cambridgeStandard:
      '2Ss.03 Describe data, identifying similarities and variations to answer non-statistical and statistical questions and discuss conclusions.',
    diagnosticTrigger:
      "Student successfully reads individual data points from a chart but freezes when asked 'how many more', lacking the subtractive arithmetic operation required to compare distinct visual bar heights.",
  },
  {
    id: 'MATH-G2-STAT-2SP01',
    gradeLevel: 2,
    domain: 'Statistics',
    ixlStyleSkill:
      'Identify and describe sequences of events as predictable patterns or random outcomes.',
    cambridgeStandard:
      '2Sp.01 Use familiar language associated with patterns and randomness, including regular pattern and random pattern.',
    diagnosticTrigger:
      "Student attempts to force a completely random sequence of coin flips into an artificial repeating pattern, succumbing to the gambler's fallacy and failing to neurologically tolerate genuine probabilistic randomness.",
  },
  {
    id: 'MATH-G2-STAT-2SP02',
    gradeLevel: 2,
    domain: 'Statistics',
    ixlStyleSkill: 'Conduct simple probability experiments and record the outcomes.',
    cambridgeStandard: '2Sp.02 Conduct chance experiments with two outcomes, and present and describe the results.',
    diagnosticTrigger:
      "Student stops tallying halfway through an experiment, incorrectly believing that since a coin has 'two sides', the final outcome counts will magically automatically equalize without needing empirical tracking.",
  },
];
