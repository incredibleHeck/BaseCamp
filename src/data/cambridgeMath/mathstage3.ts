import type { CurriculumObjective } from '../curriculumTypes';

/**
 * Cambridge Primary Mathematics — Stage 3 (Grade 3).
 */
export const cambridgeMathStage3: CurriculumObjective[] = [
  {
    id: 'MATH-G3-NUM-3NC01',
    gradeLevel: 3,
    domain: 'Numeracy',
    ixlStyleSkill: 'Estimate the number of items in a large group up to 1,000 by grouping.',
    cambridgeStandard: '3Nc.01 Estimate the number of objects or people (up to 1000).',
    diagnosticTrigger:
      'Student offers a wildly disproportionate single-number guess (e.g., 50 for a jar of 800) because they fail to spatially chunk the visual field into representative base-10 anchor groups like hundreds or tens.',
  },
  {
    id: 'MATH-G3-NUM-3NC02',
    gradeLevel: 3,
    domain: 'Numeracy',
    ixlStyleSkill: 'Skip-count forward and backward by 1s, 10s, and 100s from any starting number.',
    cambridgeStandard:
      '3Nc.02 Count on and count back in steps of constant size: 1-digit numbers, tens or hundreds, starting from any number (from 0 to 1000).',
    diagnosticTrigger:
      'Student alters the wrong place-value digit when skip-counting off-decade (e.g., counting back by tens from 344 as 344, 343, 342), demonstrating an inability to isolate and manipulate the tens column in working memory.',
  },
  {
    id: 'MATH-G3-NUM-3NC03',
    gradeLevel: 3,
    domain: 'Numeracy',
    ixlStyleSkill: 'Identify multi-digit even and odd numbers by looking at the ones digit.',
    cambridgeStandard: '3Nc.03 Use knowledge of even and odd numbers up to 10 to recognise and sort numbers.',
    diagnosticTrigger:
      'Student incorrectly attempts to divide the entire multi-digit number by 2 or evaluates the leading hundreds digit to determine parity, rather than automating the parity check by exclusively isolating the terminal ones digit.',
  },
  {
    id: 'MATH-G3-NUM-3NC04',
    gradeLevel: 3,
    domain: 'Numeracy',
    ixlStyleSkill: 'Find the missing number in equations where an object or symbol represents an unknown.',
    cambridgeStandard:
      '3Nc.04 Recognise the use of an object to represent an unknown quantity in addition and subtraction calculations.',
    diagnosticTrigger:
      'Student simply adds or subtracts all visible numbers in the equation (e.g., treating 10 - [box] = 3 as 10 - 3 = 7 and writing 7 without connecting it to the box), completely missing the pre-algebraic concept of equivalence and unknown substitution.',
  },
  {
    id: 'MATH-G3-NUM-3NC05',
    gradeLevel: 3,
    domain: 'Numeracy',
    ixlStyleSkill: 'Identify the term-to-term arithmetic rule and extend linear number sequences.',
    cambridgeStandard: '3Nc.05 Recognise and extend linear sequences, and describe the term-to-term rule.',
    diagnosticTrigger:
      'Student guesses the next number based on a superficial digit-appearance pattern rather than computing the strict arithmetic difference between adjacent terms to establish the constant additive or subtractive step size.',
  },
  {
    id: 'MATH-G3-NUM-3NC06',
    gradeLevel: 3,
    domain: 'Numeracy',
    ixlStyleSkill: 'Draw the next figure in a spatial pattern that grows or shrinks by a constant amount.',
    cambridgeStandard: '3Nc.06 Extend spatial patterns formed from adding and subtracting a constant.',
    diagnosticTrigger:
      'Student draws a shape that is visually larger overall but fails to systematically iterate the exact constant number of discrete geometric components dictated by the spatial growth rule.',
  },
  {
    id: 'MATH-G3-NUM-3NM01',
    gradeLevel: 3,
    domain: 'Numeracy',
    ixlStyleSkill: 'Read and interpret money notation using a decimal point.',
    cambridgeStandard: '3Nm.01 Interpret money notation for currencies that use a decimal point.',
    diagnosticTrigger:
      "Student ignores the decimal point entirely and reads $3.25 as 'three hundred and twenty-five dollars', failing to recognize the decimal as a rigid syntactic boundary separating whole integer units from fractional hundredths.",
  },
  {
    id: 'MATH-G3-NUM-3NM02',
    gradeLevel: 3,
    domain: 'Numeracy',
    ixlStyleSkill: 'Add and subtract decimal money amounts to calculate total cost and change.',
    cambridgeStandard: '3Nm.02 Add and subtract amounts of money to give change.',
    diagnosticTrigger:
      'Student subtracts the smaller numerical digits from the larger digits in each column regardless of top/bottom position, specifically to avoid the cognitive load of regrouping across the decimal barrier when calculating change.',
  },
  {
    id: 'MATH-G3-NUM-3NI01',
    gradeLevel: 3,
    domain: 'Numeracy',
    ixlStyleSkill: 'Read and write numbers up to 1,000 using words and numerals.',
    cambridgeStandard: '3Ni.01 Recite, read and write number names and whole numbers (from 0 to 1000).',
    diagnosticTrigger:
      "Student writes 'three hundred and forty-one' sequentially as '300401', demonstrating a phonetic concatenation strategy rather than applying base-10 hierarchical spatial overlap.",
  },
  {
    id: 'MATH-G3-NUM-3NI02',
    gradeLevel: 3,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Use commutative and associative properties to reorder and group numbers for easier addition.',
    cambridgeStandard:
      '3Ni.02 Understand the commutative and associative properties of addition, and use these to simplify calculations.',
    diagnosticTrigger:
      'Student rigidly adds numbers strictly from left to right (e.g., 8 + 4 + 2) using laborious serial counting, missing the associative spatial opportunity to mentally snap the 8 and 2 together into a base-10 anchor first.',
  },
  {
    id: 'MATH-G3-NUM-3NI03',
    gradeLevel: 3,
    domain: 'Numeracy',
    ixlStyleSkill: 'Find missing numbers that make 100 or multiples of 10 and 100 up to 1,000.',
    cambridgeStandard:
      '3Ni.03 Recognise complements of 100 and complements of multiples of 10 or 100 (up to 1000).',
    diagnosticTrigger:
      'Student calculates the complement to 100 by finding numbers that make 10 in both the ones and tens columns (e.g., 64 + 46 = 100), forgetting that the ones column summing to 10 causes a carryover that mandates the tens column complement must sum to 9.',
  },
  {
    id: 'MATH-G3-NUM-3NI04',
    gradeLevel: 3,
    domain: 'Numeracy',
    ixlStyleSkill: 'Add and subtract 3-digit numbers with regrouping.',
    cambridgeStandard:
      '3Ni.04 Estimate, add and subtract whole numbers with up to three digits (regrouping of ones or tens).',
    diagnosticTrigger:
      'Student successfully regroups across non-zero digits but fails completely when bridging across a zero in the minuend (e.g., 304 - 127), abandoning base-10 decomposition and simply subtracting the smaller bottom digit.',
  },
  {
    id: 'MATH-G3-NUM-3NI05',
    gradeLevel: 3,
    domain: 'Numeracy',
    ixlStyleSkill: 'Use inverse relationships to link multiplication and division facts.',
    cambridgeStandard: '3Ni.05 Understand and explain the relationship between multiplication and division.',
    diagnosticTrigger:
      'Student attempts to solve a division problem by repeatedly drawing and counting tallies from scratch, entirely failing to reverse their stored semantic multiplication array facts to retrieve the quotient.',
  },
  {
    id: 'MATH-G3-NUM-3NI06',
    gradeLevel: 3,
    domain: 'Numeracy',
    ixlStyleSkill: 'Use commutative and distributive properties to break apart and solve multiplication.',
    cambridgeStandard:
      '3Ni.06 Understand and explain the commutative and distributive properties of multiplication, and use these to simplify calculations.',
    diagnosticTrigger:
      'Student refuses to flip an unfamiliar fact like 8 x 2 into the known 2 x 8, demonstrating a rigid, unidirectional view of multiplication that lacks a commutative geometric array representation.',
  },
  {
    id: 'MATH-G3-NUM-3NI07',
    gradeLevel: 3,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Fluently recall multiplication and division facts for the 1, 2, 3, 4, 5, 6, 8, 9, and 10 times tables.',
    cambridgeStandard: '3Ni.07 Know 1, 2, 3, 4, 5, 6, 8, 9 and 10 times tables.',
    diagnosticTrigger:
      'Student consistently relies on serial skip-counting on fingers from zero for core mid-range tables (like 6s and 8s) because they have failed to map these operations into automated associative memory networks.',
  },
  {
    id: 'MATH-G3-NUM-3NI08',
    gradeLevel: 3,
    domain: 'Numeracy',
    ixlStyleSkill: 'Multiply 2-digit numbers by 2, 3, 4, and 5.',
    cambridgeStandard: '3Ni.08 Estimate and multiply whole numbers up to 100 by 2, 3, 4 and 5.',
    diagnosticTrigger:
      'Student multiplies the tens digit but completely ignores the ones digit during horizontal calculation, missing the foundational distributive law that the multiplier must systematically act on all decomposed parts.',
  },
  {
    id: 'MATH-G3-NUM-3NI09',
    gradeLevel: 3,
    domain: 'Numeracy',
    ixlStyleSkill: 'Divide 2-digit numbers by 2, 3, 4, and 5, including remainders.',
    cambridgeStandard: '3Ni.09 Estimate and divide whole numbers up to 100 by 2, 3, 4 and 5.',
    diagnosticTrigger:
      'Student arbitrarily drops the remainder entirely or forces the division to equal a whole number by altering the dividend, failing to conceptualize division as a strict partitioning of discrete sets with valid, indivisible leftovers.',
  },
  {
    id: 'MATH-G3-NUM-3NI10',
    gradeLevel: 3,
    domain: 'Numeracy',
    ixlStyleSkill: 'Identify multiples of 2, 5, and 10 up to 1,000.',
    cambridgeStandard: '3Ni.10 Recognise multiples of 2, 5 and 10 (up to 1000).',
    diagnosticTrigger:
      'Student attempts to fully execute long division by 5 on a 3-digit number to check if it is a multiple, rather than instantly applying the visual heuristic of checking if the terminal ones digit is exactly 0 or 5.',
  },
  {
    id: 'MATH-G3-NUM-3NP01',
    gradeLevel: 3,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Identify the place value of digits up to the hundreds place, understanding zero as a placeholder.',
    cambridgeStandard:
      '3Np.01 Understand and explain that the value of each digit is determined by its position in that number (up to 3-digit numbers).',
    diagnosticTrigger:
      "Student identifies the '8' in 842 simply as the quantity '8' instead of '800', cognitively isolating the individual numeral from its multiplicative spatial position in the base-10 hierarchy.",
  },
  {
    id: 'MATH-G3-NUM-3NP02',
    gradeLevel: 3,
    domain: 'Numeracy',
    ixlStyleSkill: 'Multiply whole numbers by 10 by shifting digits one place to the left.',
    cambridgeStandard: '3Np.02 Use knowledge of place value to multiply whole numbers by 10.',
    diagnosticTrigger:
      'Student attempts to multiply by 10 by blindly appending a literal zero to the end of the written number rather than conceptualizing that the entire sequence of digits has shifted one spatial column to the left.',
  },
  {
    id: 'MATH-G3-NUM-3NP03',
    gradeLevel: 3,
    domain: 'Numeracy',
    ixlStyleSkill: 'Decompose and regroup 3-digit numbers into hundreds, tens, and ones in multiple ways.',
    cambridgeStandard: '3Np.03 Compose, decompose and regroup 3-digit numbers, using hundreds, tens and ones.',
    diagnosticTrigger:
      "Student cannot interpret '2 hundreds, 14 tens, and 3 ones' as 343, locking into a strict 1-digit-per-column rule and failing to fluidly regroup 10 tens upward into 1 hundred.",
  },
  {
    id: 'MATH-G3-NUM-3NP04',
    gradeLevel: 3,
    domain: 'Numeracy',
    ixlStyleSkill: 'Compare and order 3-digit numbers using <, >, and =.',
    cambridgeStandard:
      '3Np.04 Understand the relative size of quantities to compare and order 3-digit positive numbers, using the symbols =, > and <.',
    diagnosticTrigger:
      'Student compares 419 and 398 and declares 398 greater because it contains the higher individual digits 9 and 8, mistakenly using a maximum-digit heuristic instead of comparing hierarchically from the hundreds place down.',
  },
  {
    id: 'MATH-G3-NUM-3NP05',
    gradeLevel: 3,
    domain: 'Numeracy',
    ixlStyleSkill: 'Round 3-digit numbers to the nearest 10 or 100.',
    cambridgeStandard: '3Np.05 Round 3-digit numbers to the nearest 10 or 100.',
    diagnosticTrigger:
      'Student rounds 452 to the nearest hundred as 500 by first incorrectly rounding the 52 up to 60, then cascading the rounding error up to the hundreds, failing to evaluate the number as a single holistic coordinate.',
  },
  {
    id: 'MATH-G3-NUM-3NF01',
    gradeLevel: 3,
    domain: 'Numeracy',
    ixlStyleSkill: 'Understand that fractions are equal parts that combine to make one whole.',
    cambridgeStandard:
      '3Nf.01 Understand and explain that fractions are several equal parts of an object or shape and all the parts, taken together, equal one whole.',
    diagnosticTrigger:
      "Student asserts that 3/3 is geometrically smaller than a 'whole', failing to conceptually fuse the identical numerator and denominator into the complete, unfragmented unity of 1.",
  },
  {
    id: 'MATH-G3-NUM-3NF02',
    gradeLevel: 3,
    domain: 'Numeracy',
    ixlStyleSkill: 'Recognize that equivalent fractions occupy the same area regardless of shape or orientation.',
    cambridgeStandard:
      '3Nf.02 Understand that the relationship between the whole and the parts depends on the relative size of each, regardless of their shape or orientation.',
    diagnosticTrigger:
      "Student claims a square divided diagonally into quarters has 'smaller' pieces than a square divided into a grid of four sub-squares, failing to conserve mathematical area when the geometric orientation changes.",
  },
  {
    id: 'MATH-G3-NUM-3NF03',
    gradeLevel: 3,
    domain: 'Numeracy',
    ixlStyleSkill: 'Identify fractions of a set or group of distinct objects.',
    cambridgeStandard:
      '3Nf.03 Understand and explain that fractions can describe equal parts of a quantity or set of objects.',
    diagnosticTrigger:
      'Student counts the specific number of shaded objects to form the denominator instead of using the total items in the entire set, fundamentally confusing a part-to-part ratio with a part-to-whole fraction.',
  },
  {
    id: 'MATH-G3-NUM-3NF04',
    gradeLevel: 3,
    domain: 'Numeracy',
    ixlStyleSkill: 'Relate fractions like 1/2, 1/4, and 3/4 to the operation of division.',
    cambridgeStandard:
      '3Nf.04 Understand that a fraction can be represented as a division of the numerator by the denominator (half, quarter and three-quarters).',
    diagnosticTrigger:
      'Student sees the fraction bar purely as a geometric separator between two independent whole numbers rather than an explicit operational symbol commanding the mathematical division of the top quantity by the bottom quantity.',
  },
  {
    id: 'MATH-G3-NUM-3NF05',
    gradeLevel: 3,
    domain: 'Numeracy',
    ixlStyleSkill: 'Calculate a fraction of a quantity (e.g., finding 1/3 or 3/4 of a number).',
    cambridgeStandard:
      '3Nf.05 Understand that fractions (half, quarter, three-quarters, third and tenth) can act as operators.',
    diagnosticTrigger:
      'Student multiplies the whole number quantity by the numerator but forgets to divide by the denominator (e.g., 3/4 of 12 = 36), misinterpreting the unit fraction as a strictly additive scaling factor rather than a partitive shrinking operator.',
  },
  {
    id: 'MATH-G3-NUM-3NF06',
    gradeLevel: 3,
    domain: 'Numeracy',
    ixlStyleSkill: 'Identify equivalent fractions for halves, quarters, fifths, and tenths using models.',
    cambridgeStandard: '3Nf.06 Recognise that two fractions can have an equivalent value (halves, quarters, fifths and tenths).',
    diagnosticTrigger:
      'Student claims 1/2 and 2/4 are different amounts because 2 and 4 are visually larger numbers, unable to spatially map proportional scaling to realize the fractional area remains perfectly identical.',
  },
  {
    id: 'MATH-G3-NUM-3NF07',
    gradeLevel: 3,
    domain: 'Numeracy',
    ixlStyleSkill: 'Add and subtract fractions with the same denominator within one whole.',
    cambridgeStandard: '3Nf.07 Estimate, add and subtract fractions with the same denominator (within one whole).',
    diagnosticTrigger:
      'Student routinely adds both the numerators and the denominators together (e.g., 1/4 + 2/4 = 3/8), treating the denominator as a countable quantity rather than a static geometric label defining the slice size.',
  },
  {
    id: 'MATH-G3-NUM-3NF08',
    gradeLevel: 3,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Compare and order fractions with the same denominator or unit fractions using <, >, =.',
    cambridgeStandard:
      '3Nf.08 Use knowledge of equivalence to compare and order unit fractions and fractions with the same denominator, using the symbols =, > and <.',
    diagnosticTrigger:
      'Student states that 1/8 > 1/3 strictly because 8 is a larger whole number than 3, completely failing to invert their whole-number logic to understand that larger denominators mean geometrically smaller spatial partitions.',
  },
  {
    id: 'MATH-G3-MEA-3GT01',
    gradeLevel: 3,
    domain: 'Measurement',
    ixlStyleSkill: 'Choose the appropriate time unit (seconds, minutes, hours, days) for familiar tasks.',
    cambridgeStandard: '3Gt.01 Choose the appropriate unit of time for familiar activities.',
    diagnosticTrigger:
      "Student selects 'hours' for a rapid task like tying shoes or blinking, demonstrating a profound inability to mentally simulate and anchor the physical duration of an event to standard abstract temporal units.",
  },
  {
    id: 'MATH-G3-MEA-3GT02',
    gradeLevel: 3,
    domain: 'Measurement',
    ixlStyleSkill: 'Read exact minutes on analog clocks and write time in 12-hour digital notation.',
    cambridgeStandard: '3Gt.02 Read and record time accurately in digital notation (12-hour) and on analogue clocks.',
    diagnosticTrigger:
      "Student reads the minute hand pointing exactly to the 4 as '4 minutes' instead of '20 minutes', failing to apply the requisite base-5 multiplicative scaling to the numbers printed on the analog clock face.",
  },
  {
    id: 'MATH-G3-MEA-3GT03',
    gradeLevel: 3,
    domain: 'Measurement',
    ixlStyleSkill: 'Read and interpret schedules and timetables using the 12-hour clock.',
    cambridgeStandard: '3Gt.03 Interpret and use the information in timetables (12-hour clock).',
    diagnosticTrigger:
      'Student reads across the wrong row or column in a 2D timetable matrix, failing to spatially track the orthogonal intersection of a specific scheduled event and its corresponding chronological time slot.',
  },
  {
    id: 'MATH-G3-MEA-3GT04',
    gradeLevel: 3,
    domain: 'Measurement',
    ixlStyleSkill: 'Calculate the time interval between two dates or times in days, weeks, months, or years.',
    cambridgeStandard:
      '3Gt.04 Understand the difference between a time and a time interval. Find time intervals between the same units in days, weeks, months and years.',
    diagnosticTrigger:
      'Student calculates a time interval by strictly subtracting calendar dates as base-10 integers (e.g., Oct 15 to Nov 2 as 15 - 2), completely ignoring the irregular modulo arithmetic required for bridging unequal month lengths.',
  },
  {
    id: 'MATH-G3-GEO-3GG01',
    gradeLevel: 3,
    domain: 'Geometry',
    ixlStyleSkill: 'Classify and draw 2D shapes, differentiating between regular and irregular polygons.',
    cambridgeStandard:
      '3Gg.01 Identify, describe, classify, name and sketch 2D shapes by their properties. Differentiate between regular and irregular polygons.',
    diagnosticTrigger:
      "Student categorizes a stretched, scalene triangle as 'not a triangle' or 'irregular' in a way that implies it isn't a true polygon, displaying a rigid adherence to equilateral prototypes rather than counting structural vertices.",
  },
  {
    id: 'MATH-G3-MEA-3GG02',
    gradeLevel: 3,
    domain: 'Measurement',
    ixlStyleSkill: 'Measure length using cm, m, and km, and understand how they compare.',
    cambridgeStandard:
      '3Gg.02 Estimate and measure lengths in centimetres (cm), metres (m) and kilometres (km). Understand the relationship between units.',
    diagnosticTrigger:
      "Student estimates the length of a classroom desk as '10 kilometers', showing a profound lack of spatial magnitude scaling and a disconnect between the unit's abbreviation and its real-world physical span.",
  },
  {
    id: 'MATH-G3-MEA-3GG03',
    gradeLevel: 3,
    domain: 'Measurement',
    ixlStyleSkill: 'Differentiate between perimeter (adding lengths) and area (space occupied).',
    cambridgeStandard:
      '3Gg.03 Understand that perimeter is the total distance around a 2D shape and can be calculated by adding lengths, and area is how much space a 2D shape occupies within its boundary.',
    diagnosticTrigger:
      'Student counts the 2D grid squares strictly inside a shape when asked for the perimeter, fundamentally conflating 1-dimensional boundary edge length with 2-dimensional surface capacity.',
  },
  {
    id: 'MATH-G3-MEA-3GG04',
    gradeLevel: 3,
    domain: 'Measurement',
    ixlStyleSkill: 'Calculate perimeter using metric units and find area by counting grid squares.',
    cambridgeStandard:
      '3Gg.04 Draw lines, rectangles and squares. Estimate, measure and calculate the perimeter of a shape, using appropriate metric units, and area on a square grid.',
    diagnosticTrigger:
      'Student measures the perimeter of a drawn rectangle but only adds the two explicitly labeled adjacent sides (length + width), forgetting to conceptually project the identical measurements to the two unlabeled parallel sides.',
  },
  {
    id: 'MATH-G3-GEO-3GG05',
    gradeLevel: 3,
    domain: 'Geometry',
    ixlStyleSkill: 'Identify, describe, and sketch 3D solid shapes based on faces, edges, and vertices.',
    cambridgeStandard: '3Gg.05 Identify, describe, sort, name and sketch 3D shapes by their properties.',
    diagnosticTrigger:
      "Student describes a cylinder as having 'no edges', failing to recognize that the curved geometric boundaries seamlessly connecting the flat circular faces to the rounded surface strictly qualify as continuous mathematical edges.",
  },
  {
    id: 'MATH-G3-MEA-3GG06',
    gradeLevel: 3,
    domain: 'Measurement',
    ixlStyleSkill: 'Estimate and measure mass in grams and kilograms.',
    cambridgeStandard:
      '3Gg.06 Estimate and measure the mass of objects in grams (g) and kilograms (kg). Understand the relationship between units.',
    diagnosticTrigger:
      'Student uses kilograms to measure the mass of a single pencil, unable to apply the heuristic that a kilogram is a heavy anchor unit (like a textbook) while grams are specifically for light, fractional masses.',
  },
  {
    id: 'MATH-G3-MEA-3GG07',
    gradeLevel: 3,
    domain: 'Measurement',
    ixlStyleSkill: 'Estimate and measure liquid capacity in milliliters and liters.',
    cambridgeStandard:
      '3Gg.07 Estimate and measure capacity in millilitres (ml) and litres (l), and understand their relationships.',
    diagnosticTrigger:
      "Student records a measured capacity as exactly '200' without appending 'ml' or 'L', treating volumetric capacity simply as an abstract counting integer rather than a continuous physical property requiring a specific unit scale.",
  },
  {
    id: 'MATH-G3-GEO-3GG08',
    gradeLevel: 3,
    domain: 'Geometry',
    ixlStyleSkill: 'Recognize 3D shapes from 2D pictures, isometric drawings, and diagrams.',
    cambridgeStandard: '3Gg.08 Recognise pictures, drawings and diagrams of 3D shapes.',
    diagnosticTrigger:
      "Student looks at an oblique 2D isometric drawing of a pyramid and calls it a flat 'triangle', unable to cognitively decode the angled lines and shading that neurologically signal three-dimensional depth and volumetric projection.",
  },
  {
    id: 'MATH-G3-GEO-3GG09',
    gradeLevel: 3,
    domain: 'Geometry',
    ixlStyleSkill: 'Identify horizontal and vertical lines of symmetry on 2D shapes.',
    cambridgeStandard: '3Gg.09 Identify both horizontal and vertical lines of symmetry on 2D shapes and patterns.',
    diagnosticTrigger:
      'Student assumes any shape with a vertical line of symmetry automatically possesses a horizontal line of symmetry (like an upright kite), failing to independently test the horizontal orthogonal axis for point-to-point mirror reflection.',
  },
  {
    id: 'MATH-G3-GEO-3GG10',
    gradeLevel: 3,
    domain: 'Geometry',
    ixlStyleSkill:
      'Compare angles to a right angle (90°) and recognize a straight line as two right angles (180°).',
    cambridgeStandard:
      '3Gg.10 Compare angles with a right angle. Recognise that a straight line is equivalent to two right angles or a half turn.',
    diagnosticTrigger:
      'Student judges the size of an angle strictly by the physical drawn length of the intersecting line segments on the paper rather than evaluating the invisible rotational opening distance (arc) between those two lines.',
  },
  {
    id: 'MATH-G3-MEA-3GG11',
    gradeLevel: 3,
    domain: 'Measurement',
    ixlStyleSkill:
      'Read measuring scales with partially numbered intervals for length, mass, capacity, and temperature.',
    cambridgeStandard: '3Gg.11 Use instruments that measure length, mass, capacity and temperature.',
    diagnosticTrigger:
      'Student misreads a thermometer where increments go up by 2s as going up by 1s, blindly counting the physical tick marks rather than mathematically interpolating the true interval values between the numbered markers.',
  },
  {
    id: 'MATH-G3-GEO-3GP01',
    gradeLevel: 3,
    domain: 'Geometry',
    ixlStyleSkill: 'Describe position and direction using compass points (North, East, South, West).',
    cambridgeStandard:
      '3Gp.01 Interpret and create descriptions of position, direction and movement, including reference to cardinal points.',
    diagnosticTrigger:
      'Student successfully moves an object North or South but misinterprets East and West, completely inverting the horizontal axis because they lack a locked spatial mnemonic to reliably anchor the absolute coordinate plane.',
  },
  {
    id: 'MATH-G3-GEO-3GP02',
    gradeLevel: 3,
    domain: 'Geometry',
    ixlStyleSkill: 'Draw the reflection of a 2D shape over a horizontal or vertical mirror line.',
    cambridgeStandard:
      '3Gp.02 Sketch the reflection of a 2D shape in a horizontal or vertical mirror line, including where the mirror line is the edge of the shape.',
    diagnosticTrigger:
      'Student physically translates (slides) the shape across the mirror line without flipping it, preserving the original left-to-right orientation rather than strictly reversing the perpendicular distance of each individual vertex.',
  },
  {
    id: 'MATH-G3-STAT-3SS01',
    gradeLevel: 3,
    domain: 'Statistics',
    ixlStyleSkill: 'Collect categorical and countable discrete data to answer statistical questions.',
    cambridgeStandard:
      '3Ss.01 Conduct an investigation to answer non-statistical and statistical questions (categorical and discrete data).',
    diagnosticTrigger:
      "Student poses a statistical question (e.g., 'What is the favorite color?') but collects only a single data point from themselves, completely failing to grasp that statistical investigation fundamentally requires aggregate sampling to measure population variation.",
  },
  {
    id: 'MATH-G3-STAT-3SS02',
    gradeLevel: 3,
    domain: 'Statistics',
    ixlStyleSkill:
      'Record data using Venn diagrams, Carroll diagrams, tally charts, pictograms, and bar charts.',
    cambridgeStandard:
      '3Ss.02 Record, organise and represent categorical and discrete data. Choose and explain which representation to use in a given situation: - Venn and Carroll diagrams - tally charts and frequency tables - pictograms and bar charts.',
    diagnosticTrigger:
      'Student plots a bar chart but spaces the numerical y-axis arbitrarily (e.g., jumping from 2 to 5 to 10 based only on the raw data points present in the set), completely violating the strict requirement of a constant, linear metric scale.',
  },
  {
    id: 'MATH-G3-STAT-3SS03',
    gradeLevel: 3,
    domain: 'Statistics',
    ixlStyleSkill: 'Answer questions by interpreting similarities and differences in data charts.',
    cambridgeStandard:
      '3Ss.03 Interpret data, identifying similarities and variations, within data sets, to answer non-statistical and statistical questions and discuss conclusions.',
    diagnosticTrigger:
      'Student reads the height of the tallest bar perfectly but cannot explain what the bar represents in the real world, treating the graph as abstract geometry rather than a visual proxy for categorical quantity and real-world variation.',
  },
  {
    id: 'MATH-G3-STAT-3SP01',
    gradeLevel: 3,
    domain: 'Statistics',
    ixlStyleSkill:
      'Describe the likelihood of events using probability words like certain, impossible, and likely.',
    cambridgeStandard:
      "3Sp.01 Use familiar language associated with chance to describe events, including 'it will happen', 'it will not happen', 'it might happen'.",
    diagnosticTrigger:
      "Student labels a highly improbable event (like drawing a specific named card from a full deck) as strictly 'impossible', failing to cognitively distinguish between a zero-probability certainty and a low-probability mathematical risk.",
  },
  {
    id: 'MATH-G3-STAT-3SP02',
    gradeLevel: 3,
    domain: 'Statistics',
    ixlStyleSkill: 'Run probability experiments with coins, spinners, or dice and record the results.',
    cambridgeStandard: '3Sp.02 Conduct chance experiments, and present and describe the results.',
    diagnosticTrigger:
      'Student expects a spinner divided evenly between 4 colors to yield a perfectly rotating sequential pattern (Red, Blue, Green, Yellow, Red...), fundamentally misunderstanding the statistical independence and localized clustering inherent in short-term random events.',
  },
];
