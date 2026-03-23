import type { CurriculumObjective } from '../curriculumTypes';

/**
 * Cambridge Primary Mathematics — Stage 6 (Grade 6).
 */
export const cambridgeMathStage6: CurriculumObjective[] = [
  {
    id: 'MATH-G6-NUM-6NC01',
    gradeLevel: 6,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Skip-count forward and backward by fractions and decimals, crossing zero into negative numbers.',
    cambridgeStandard:
      '6Nc.01 Count on and count back in steps of constant size, including fractions and decimals, and extend beyond zero to include negative numbers.',
    diagnosticTrigger:
      'Student attempts to count backward across zero by decimals (e.g., subtracting 0.2 from 0.4) but treats the negative threshold like an absolute barrier, jumping from 0.2 straight to -0.2 instead of landing accurately on 0.',
  },
  {
    id: 'MATH-G6-NUM-6NC02',
    gradeLevel: 6,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Use and interpret algebraic letters representing variable quantities in addition and subtraction equations.',
    cambridgeStandard:
      '6Nc.02 Recognise the use of letters to represent quantities that vary in addition and subtraction calculations.',
    diagnosticTrigger:
      "Student assumes a letter inherently represents its alphabetic position (e.g., a=1, b=2) or a static shape, entirely failing to conceptualize that a variable like 'x' can dynamically represent multiple continuous numerical values.",
  },
  {
    id: 'MATH-G6-NUM-6NC03',
    gradeLevel: 6,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Use multiplication to determine the position-to-term rule (nth term) of a linear sequence.',
    cambridgeStandard:
      '6Nc.03 Use the relationship between repeated addition of a constant and multiplication to find and use a position-to-term rule.',
    diagnosticTrigger:
      'Student attempts to find the 50th term of a sequence by manually writing out 50 sequential additions, demonstrating a failure to cognitively abstract the constant step size into a multiplicative algebraic rule.',
  },
  {
    id: 'MATH-G6-NUM-6NC04',
    gradeLevel: 6,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Generate the terms of a sequence using the position index and knowledge of perfect squares.',
    cambridgeStandard:
      '6Nc.04 Use knowledge of square numbers to generate terms in a sequence, given its position.',
    diagnosticTrigger:
      'Student multiplies the position number by 2 instead of squaring it (e.g., stating the 5th term is 10 instead of 25), confusing the base-10 linear multiplier with the geometric operation of multiplying a base area by itself.',
  },
  {
    id: 'MATH-G6-NUM-6NI01',
    gradeLevel: 6,
    domain: 'Numeracy',
    ixlStyleSkill: 'Add and subtract positive and negative integers accurately.',
    cambridgeStandard: '6Ni.01 Estimate, add and subtract integers.',
    diagnosticTrigger:
      'Student subtracts a negative integer by moving further down the number line (e.g., 5 - (-3) = 2), unable to cognitively invert the operation to realize that removing a negative deficit structurally translates into a positive addition.',
  },
  {
    id: 'MATH-G6-NUM-6NI02',
    gradeLevel: 6,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Apply associative, commutative, and distributive laws alongside the order of operations.',
    cambridgeStandard:
      '6Ni.02 Use knowledge of laws of arithmetic and order of operations to simplify calculations.',
    diagnosticTrigger:
      'Student processes a complex string of mixed operations purely left-to-right regardless of the mathematical symbols, displaying a rigid typewriter-reading approach that entirely ignores the hierarchical priority of multiplication over addition.',
  },
  {
    id: 'MATH-G6-NUM-6NI03',
    gradeLevel: 6,
    domain: 'Numeracy',
    ixlStyleSkill: 'Use brackets to correctly alter the standard order of operations in an equation.',
    cambridgeStandard: '6Ni.03 Understand that brackets can be used to alter the order of operations.',
    diagnosticTrigger:
      'Student performs the multiplication outside the brackets before the addition inside the brackets (e.g., calculating 3 × (4 + 2) as 12 + 2 = 14), failing to prioritize the parenthetical enclosure as an inviolable, isolated mathematical sub-routine.',
  },
  {
    id: 'MATH-G6-NUM-6NI04',
    gradeLevel: 6,
    domain: 'Numeracy',
    ixlStyleSkill: 'Multiply whole numbers up to 10,000 by 1- or 2-digit numbers.',
    cambridgeStandard:
      '6Ni.04 Estimate and multiply whole numbers up to 10 000 by 1-digit or 2-digit whole numbers.',
    diagnosticTrigger:
      'Student vertically misaligns the second partial product when multiplying by a 2-digit multiplier because they neglect to write the zero placeholder, failing to physically shift the base-10 calculation into the tens column.',
  },
  {
    id: 'MATH-G6-NUM-6NI05',
    gradeLevel: 6,
    domain: 'Numeracy',
    ixlStyleSkill: 'Divide whole numbers up to 1,000 by 1- or 2-digit divisors.',
    cambridgeStandard:
      '6Ni.05 Estimate and divide whole numbers up to 1000 by 1-digit or 2-digit whole numbers.',
    diagnosticTrigger:
      'Student incorrectly brings down multiple digits at once without inserting a corresponding zero placeholder in the quotient, failing to hold the spatial hierarchy when a partial dividend is too small to be divided.',
  },
  {
    id: 'MATH-G6-NUM-6NI06',
    gradeLevel: 6,
    domain: 'Numeracy',
    ixlStyleSkill: 'Find the common multiples and common factors of two or more given numbers.',
    cambridgeStandard: '6Ni.06 Understand common multiples and common factors.',
    diagnosticTrigger:
      'Student conflates the two distinct concepts entirely, attempting to list infinitely growing multiples of two numbers when explicitly asked to extract their bounded, internal common fraction factors.',
  },
  {
    id: 'MATH-G6-NUM-6NI07',
    gradeLevel: 6,
    domain: 'Numeracy',
    ixlStyleSkill: 'Apply divisibility rules for 3, 6, and 9 by summing digits and checking parity.',
    cambridgeStandard:
      '6Ni.07 Use knowledge of factors and multiples to understand tests of divisibility by 3, 6 and 9.',
    diagnosticTrigger:
      'Student looks exclusively at the final terminal digit to determine divisibility by 3 or 9 (similar to the rule for 5), failing to execute the required cross-column addition heuristic to systematically sum all the digits.',
  },
  {
    id: 'MATH-G6-NUM-6NI08',
    gradeLevel: 6,
    domain: 'Numeracy',
    ixlStyleSkill: 'Identify perfect cube numbers up to 125.',
    cambridgeStandard:
      '6Ni.08 Use knowledge of multiplication and square numbers to recognise cube numbers (from 1 to 125).',
    diagnosticTrigger:
      'Student computes a cube number by simply multiplying the base integer by 3 (e.g., calculating 4³ as 12 instead of 64), deeply confusing 3D volumetric geometric scaling with a basic 1D linear multiplier.',
  },
  {
    id: 'MATH-G6-NUM-6NP01',
    gradeLevel: 6,
    domain: 'Numeracy',
    ixlStyleSkill: 'Identify the place value of any digit in a decimal number up to thousandths.',
    cambridgeStandard:
      '6Np.01 Understand and explain the value of each digit in decimals (tenths, hundredths and thousandths).',
    diagnosticTrigger:
      'Student claims that 0.45 is larger than 0.5 because 45 is a physically larger integer than 5, revealing a complete collapse of fractional place value hierarchy by treating the decimal extension identically to a whole number string.',
  },
  {
    id: 'MATH-G6-NUM-6NP02',
    gradeLevel: 6,
    domain: 'Numeracy',
    ixlStyleSkill: 'Multiply and divide whole numbers and decimals by 10, 100, and 1,000.',
    cambridgeStandard:
      '6Np.02 Use knowledge of place value to multiply and divide whole numbers and decimals by 10, 100 and 1000.',
    diagnosticTrigger:
      'Student mechanically adds literal zeros to the right-hand end of a decimal when multiplying by 100 (e.g., 4.25 × 100 = 4.2500) rather than spatially shifting all digits two coordinate columns left across the fixed decimal anchor.',
  },
  {
    id: 'MATH-G6-NUM-6NP03',
    gradeLevel: 6,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Break apart and recombine decimal numbers into varied place-value groupings up to thousandths.',
    cambridgeStandard:
      '6Np.03 Compose, decompose and regroup numbers, including decimals (tenths, hundredths and thousandths).',
    diagnosticTrigger:
      "Student cannot cognitively regroup 0.12 as '12 hundredths', strictly locking the '1' exclusively into the tenths column, demonstrating a rigid inability to fluently shift and compress fractional base-10 boundaries.",
  },
  {
    id: 'MATH-G6-NUM-6NP04',
    gradeLevel: 6,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Round decimals with two decimal places to the nearest tenth or whole integer.',
    cambridgeStandard: '6Np.04 Round numbers with 2 decimal places to the nearest tenth or whole number.',
    diagnosticTrigger:
      'Student rounds 4.96 to the nearest whole number as 6 by erroneously cascading the rounding event twice (9 rounded up to 10, carrying over to round the 4 to a 6), instead of directly targeting the singular tenths place threshold.',
  },
  {
    id: 'MATH-G6-NUM-6NF01',
    gradeLevel: 6,
    domain: 'Numeracy',
    ixlStyleSkill: 'Interpret proper and improper fractions strictly as division equations.',
    cambridgeStandard:
      '6Nf.01 Understand that a fraction can be represented as a division of the numerator by the denominator (proper and improper fractions).',
    diagnosticTrigger:
      "Student views an improper fraction like 7/4 as a purely geometric impossibility ('you cannot take 7 parts out of 4'), failing to mentally transition from a physical 'parts-of-a-whole' limit to the abstract 'numerator divided by denominator' operation.",
  },
  {
    id: 'MATH-G6-NUM-6NF02',
    gradeLevel: 6,
    domain: 'Numeracy',
    ixlStyleSkill: 'Calculate fractional amounts of whole numbers using proper and improper fractions.',
    cambridgeStandard: '6Nf.02 Understand that proper and improper fractions can act as operators.',
    diagnosticTrigger:
      "Student incorrectly divides the integer quantity by the numerator and multiplies by the denominator, perfectly reversing the mathematical roles because they misunderstand the fraction bar's strict division/scaling hierarchy.",
  },
  {
    id: 'MATH-G6-NUM-6NF03',
    gradeLevel: 6,
    domain: 'Numeracy',
    ixlStyleSkill: 'Simplify fractions to their lowest terms by identifying the greatest common factor.',
    cambridgeStandard: '6Nf.03 Use knowledge of equivalence to write fractions in their simplest form.',
    diagnosticTrigger:
      'Student halts simplification prematurely (e.g., reducing 12/16 to 6/8 and fully stopping), failing to continuously extract iterative common factors until visually reaching an indivisible, prime numerical state.',
  },
  {
    id: 'MATH-G6-NUM-6NF04',
    gradeLevel: 6,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Convert fluidly between equivalent fractions, decimals, and percentages up to two decimal places.',
    cambridgeStandard:
      '6Nf.04 Recognise that fractions, decimals (one or two decimal places) and percentages can have equivalent values.',
    diagnosticTrigger:
      'Student explicitly maps the geometric fraction denominator directly onto the decimal string (e.g., writing 1/4 as 0.4 or 4%), entirely failing to execute the base-100 scaling operation required to unify the three metric formats.',
  },
  {
    id: 'MATH-G6-NUM-6NF05',
    gradeLevel: 6,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Add and subtract fractions with unlike denominators by finding a common denominator first.',
    cambridgeStandard: '6Nf.05 Estimate, add and subtract fractions with different denominators.',
    diagnosticTrigger:
      'Student routinely adds both the numerators and the distinct denominators straight across horizontally (e.g., 1/3 + 1/4 = 2/7), treating the denominator as a countable additive quantity rather than an immutable slice-size parameter requiring standardization.',
  },
  {
    id: 'MATH-G6-NUM-6NF06',
    gradeLevel: 6,
    domain: 'Numeracy',
    ixlStyleSkill: 'Multiply and divide proper fractions by whole integers.',
    cambridgeStandard: '6Nf.06 Estimate, multiply and divide proper fractions by whole numbers.',
    diagnosticTrigger:
      'Student multiplying a fraction by a whole number multiplies both the top numerator and bottom denominator by the integer (e.g., 2/3 × 4 = 8/12), fundamentally confusing a whole number multiplier with an identity fraction equivalence operation (4/4).',
  },
  {
    id: 'MATH-G6-NUM-6NF07',
    gradeLevel: 6,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Calculate specific percentages (like 1%, 5%, 15%) of a given shape or quantity.',
    cambridgeStandard:
      '6Nf.07 Recognise percentages (1%, and multiples of 5% up to 100%) of shapes and whole numbers.',
    diagnosticTrigger:
      'Student attempts to calculate 5% by simply dividing the total numerical quantity by 5, mistakenly conflating the percentage label with a direct denominator rather than conceptualizing it structurally as 5 slices out of 100.',
  },
  {
    id: 'MATH-G6-NUM-6NF08',
    gradeLevel: 6,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Compare and order mixed lists of decimals, fractions, and percentages using <, >, =.',
    cambridgeStandard:
      '6Nf.08 Understand the relative size of quantities to compare and order numbers with one or two decimal places, proper fractions with different denominators and percentages, using the symbols =, > and <.',
    diagnosticTrigger:
      'Student blindly compares raw visual digits without standardizing the mathematical format first, asserting that 0.4 is strictly smaller than 1/8 purely because 4 is visually less than 8.',
  },
  {
    id: 'MATH-G6-NUM-6NF09',
    gradeLevel: 6,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Align and calculate addition and subtraction problems involving mismatched decimal lengths.',
    cambridgeStandard:
      '6Nf.09 Estimate, add and subtract numbers with the same or different number of decimal places.',
    diagnosticTrigger:
      'Student aligns the mismatched length decimals by right-justifying their terminal digits on the paper instead of strictly locking the decimal points, causing a catastrophic vertical calculation collision between tenths, hundredths, and thousandths.',
  },
  {
    id: 'MATH-G6-NUM-6NF10',
    gradeLevel: 6,
    domain: 'Numeracy',
    ixlStyleSkill: 'Multiply numbers up to two decimal places by 1- or 2-digit integers.',
    cambridgeStandard:
      '6Nf.10 Estimate and multiply numbers with one or two decimal places by 1-digit and 2-digit whole numbers.',
    diagnosticTrigger:
      'Student correctly computes the raw multiplication digits but arbitrarily drops the decimal back into the final product exactly where it sat in the top number, failing to actively count and conserve the total multiplied fractional magnitude.',
  },
  {
    id: 'MATH-G6-NUM-6NF11',
    gradeLevel: 6,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Divide a decimal by a whole number, accurately placing the decimal point in the quotient.',
    cambridgeStandard:
      '6Nf.11 Estimate and divide numbers with one or two decimal places by whole numbers.',
    diagnosticTrigger:
      'Student treats the printed decimal point as a physical mathematical stop-sign and halts division completely, abandoning the remaining dividend instead of appending structural placeholder zeros to continue extracting the fractional quotient.',
  },
  {
    id: 'MATH-G6-NUM-6NF12',
    gradeLevel: 6,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Solve direct proportion problems by applying a constant multiplicative scaling factor.',
    cambridgeStandard:
      '6Nf.12 Understand the relationship between two quantities when they are in direct proportion.',
    diagnosticTrigger:
      'Student attempts to scale up a geometric proportion by using a constant additive difference (e.g., adding 2 to all sides instead of multiplying by 2), failing to conserve the internal part-to-part multiplicative ratio.',
  },
  {
    id: 'MATH-G6-NUM-6NF13',
    gradeLevel: 6,
    domain: 'Numeracy',
    ixlStyleSkill: 'Generate and simplify equivalent ratios using multiplication and division.',
    cambridgeStandard: '6Nf.13 Use knowledge of equivalence to understand and use equivalent ratios.',
    diagnosticTrigger:
      'Student simplifies a 3-part ratio like 4:6:8 into 2:3:8, completely forgetting to structurally apply the common division operator uniformly across every single isolated term in the comparative sequence.',
  },
  {
    id: 'MATH-G6-MEA-6GT01',
    gradeLevel: 6,
    domain: 'Measurement',
    ixlStyleSkill:
      'Convert between decimal hours (e.g., 2.25 hours) and mixed units (e.g., 2 hours 15 minutes).',
    cambridgeStandard: '6Gt.01 Convert between time intervals expressed as a decimal and in mixed units.',
    diagnosticTrigger:
      "Student explicitly translates the decimal segment 0.25 directly into a literal '25 minutes', suffering a fundamental cognitive collision between base-10 decimal scaling and the base-60 sexagesimal structure of an analog clock.",
  },
  {
    id: 'MATH-G6-GEO-6GG01',
    gradeLevel: 6,
    domain: 'Geometry',
    ixlStyleSkill:
      'Classify quadrilaterals by tracking parallel lines, angles, symmetrical properties, and diagonals.',
    cambridgeStandard:
      '6Gg.01 Identify, describe, classify and sketch quadrilaterals, including reference to angles, symmetrical properties, parallel sides and diagonals.',
    diagnosticTrigger:
      "Student insists a slanted rhombus is solely a 'diamond' and denies it belongs mathematically to the parallelogram family, rigidly relying on prototypical 2D orientation rather than explicitly tracking pairs of parallel opposite sides.",
  },
  {
    id: 'MATH-G6-GEO-6GG02',
    gradeLevel: 6,
    domain: 'Geometry',
    ixlStyleSkill:
      'Identify and label the center, radius, diameter, and circumference of a circle.',
    cambridgeStandard:
      '6Gg.02 Know the parts of a circle: - centre - radius - diameter - circumference.',
    diagnosticTrigger:
      "Student draws a line segment arbitrarily from perimeter edge to edge without passing strictly through the central anchor point, and incorrectly labels this geometric chord as the true mathematical 'diameter'.",
  },
  {
    id: 'MATH-G6-MEA-6GG03',
    gradeLevel: 6,
    domain: 'Measurement',
    ixlStyleSkill:
      'Calculate the area of a right-angled triangle by treating it as half of a rectangle.',
    cambridgeStandard:
      '6Gg.03 Use knowledge of area of rectangles to estimate and calculate the area of right-angled triangles.',
    diagnosticTrigger:
      "Student calculates the area by cleanly multiplying the base by the height but completely forgets to apply the fractional 'halving' division step, fundamentally failing to visualize the 2D triangle as a geometrically bisected rectangle.",
  },
  {
    id: 'MATH-G6-GEO-6GG04',
    gradeLevel: 6,
    domain: 'Geometry',
    ixlStyleSkill:
      'Decompose and sketch complex 3D structures built by combining multiple solid shapes.',
    cambridgeStandard: '6Gg.04 Identify, describe and sketch compound 3D shapes.',
    diagnosticTrigger:
      'Student incorrectly calculates the total surface area by blindly adding the surface areas of the isolated 3D component shapes together, completely failing to spatially subtract the internal occluded faces where the two solids physically intersect.',
  },
  {
    id: 'MATH-G6-MEA-6GG05',
    gradeLevel: 6,
    domain: 'Measurement',
    ixlStyleSkill:
      'Distinguish between the volume of an object (space it occupies) and capacity (space inside a container).',
    cambridgeStandard: '6Gg.05 Understand the difference between capacity and volume.',
    diagnosticTrigger:
      "Student measures the thick, physical outer bounding walls of a hollow container when explicitly asked for its 'capacity', completely failing to differentiate the gross volumetric mass of the material from the internal negative void space available for fluid.",
  },
  {
    id: 'MATH-G6-GEO-6GG06',
    gradeLevel: 6,
    domain: 'Geometry',
    ixlStyleSkill:
      'Sketch and verify valid 2D flat nets that fold into specific 3D solid prisms and pyramids.',
    cambridgeStandard:
      '6Gg.06 Identify and sketch different nets for cubes, cuboids, prisms and pyramids.',
    diagnosticTrigger:
      'Student draws a 2D net for a square-based pyramid that connects the four identical triangular faces end-to-end in a straight line, completely lacking the internal topological visualization required to realize they will never fold up to meet at a single apex.',
  },
  {
    id: 'MATH-G6-MEA-6GG07',
    gradeLevel: 6,
    domain: 'Measurement',
    ixlStyleSkill:
      'Calculate the total surface area of a 3D shape by finding the sum of its 2D net faces.',
    cambridgeStandard:
      '6Gg.07 Understand the relationship between area of 2D shapes and surface area of 3D shapes.',
    diagnosticTrigger:
      "Student computes the internal cubic volume (L × W × H) when explicitly asked to calculate the surface area, displaying a profound semantic and spatial mix-up between a 3D figure's interior geometric capacity and its exterior 2D wrapping footprint.",
  },
  {
    id: 'MATH-G6-GEO-6GG08',
    gradeLevel: 6,
    domain: 'Geometry',
    ixlStyleSkill:
      'Identify the exact order of rotational symmetry (up to 4) for given 2D shapes.',
    cambridgeStandard:
      "6Gg.08 Identify rotational symmetry in familiar shapes, patterns or images with maximum order 4. Describe rotational symmetry as 'order'.",
    diagnosticTrigger:
      "Student counts the original starting position twice when visually spinning a shape exactly 360 degrees, erroneously concluding that a completely non-symmetrical shape possesses an 'order of 2' rather than an identity 'order of 1'.",
  },
  {
    id: 'MATH-G6-GEO-6GG09',
    gradeLevel: 6,
    domain: 'Geometry',
    ixlStyleSkill:
      'Use a protractor to accurately measure and draw acute, right, obtuse, and reflex angles.',
    cambridgeStandard: '6Gg.09 Classify, estimate, measure and draw angles.',
    diagnosticTrigger:
      'Student consistently misreads a visually obvious obtuse angle of 130° strictly as an acute angle of 50°, falling into the cognitive trap of blindly reading the incorrect interior track on the dual-numbered protractor arc without structurally estimating first.',
  },
  {
    id: 'MATH-G6-GEO-6GG10',
    gradeLevel: 6,
    domain: 'Geometry',
    ixlStyleSkill:
      'Calculate the missing interior angle of any triangle by subtracting the knowns from 180°.',
    cambridgeStandard:
      '6Gg.10 Know that the sum of the angles in a triangle is 180º, and use this to calculate missing angles in a triangle.',
    diagnosticTrigger:
      'Student encounters a 2D isosceles triangle with only one explicitly written numerical angle and completely freezes, failing to deploy the structural geometric knowledge that the twin base angles must be mathematically identical to subtract from 180°.',
  },
  {
    id: 'MATH-G6-GEO-6GG11',
    gradeLevel: 6,
    domain: 'Geometry',
    ixlStyleSkill:
      'Use a compass to strictly construct a circle given a specific radius or diameter dimension.',
    cambridgeStandard: '6Gg.11 Construct circles of a specified radius or diameter.',
    diagnosticTrigger:
      'Student is explicitly asked to draw a circle with a 6 cm diameter but physically opens their drawing compass legs to exactly 6 cm, resulting in a massively oversized boundary because they failed to divide the diameter into the required radial span.',
  },
  {
    id: 'MATH-G6-GEO-6GP01',
    gradeLevel: 6,
    domain: 'Geometry',
    ixlStyleSkill:
      'Plot coordinates featuring negative integers and decimals across all four quadrants.',
    cambridgeStandard:
      '6Gp.01 Read and plot coordinates including integers, fractions and decimals, in all four quadrants (with the aid of a grid).',
    diagnosticTrigger:
      'Student successfully plots a negative x-coordinate but erroneously mirrors the point upwards into the upper-left Quadrant 2 instead of the lower-left Quadrant 3 when the y-coordinate is also negative, losing track of the dual negative polarity below the horizontal axis.',
  },
  {
    id: 'MATH-G6-GEO-6GP02',
    gradeLevel: 6,
    domain: 'Geometry',
    ixlStyleSkill:
      'Calculate the missing coordinate of a geometric shape spanning across multiple quadrants.',
    cambridgeStandard:
      '6Gp.02 Use knowledge of 2D shapes and coordinates to plot points to form lines and shapes in all four quadrants.',
    diagnosticTrigger:
      'Student successfully infers a missing vertex spatial distance but makes an off-by-one counting error when bridging the physical shape across the origin into Quadrants 2, 3, or 4, fundamentally forgetting that the zero axis line itself counts as a rigid spatial integer step.',
  },
  {
    id: 'MATH-G6-GEO-6GP03',
    gradeLevel: 6,
    domain: 'Geometry',
    ixlStyleSkill:
      'Translate 2D shapes on a 4-quadrant coordinate grid, mapping corresponding vertices.',
    cambridgeStandard:
      '6Gp.03 Translate 2D shapes, identifying the corresponding points between the original and the translated image, on coordinate grids.',
    diagnosticTrigger:
      'Student attempts to translate a polygon by physically counting the grid spaces from the right-hand edge of the original shape to the left-hand edge of the new shape, resulting in a distorted, shrunken translation vector because they did not track homologous vertex to vertex.',
  },
  {
    id: 'MATH-G6-GEO-6GP04',
    gradeLevel: 6,
    domain: 'Geometry',
    ixlStyleSkill:
      'Reflect 2D shapes accurately across diagonal (y = x) and non-standard mirror lines on a grid.',
    cambridgeStandard:
      '6Gp.04 Reflect 2D shapes in a given mirror line (vertical, horizontal and diagonal), on square grids.',
    diagnosticTrigger:
      'Student attempts to reflect a drawn shape across a diagonal mirror line by just dropping the vertices straight down vertically, completely unable to conceptually invert the 90-degree orthogonal x/y step distances required for a true diagonal coordinate reflection.',
  },
  {
    id: 'MATH-G6-GEO-6GP05',
    gradeLevel: 6,
    domain: 'Geometry',
    ixlStyleSkill:
      'Rotate a 2D shape exactly 90 degrees clockwise or anticlockwise around a specific corner vertex.',
    cambridgeStandard:
      '6Gp.05 Rotate shapes 90º around a vertex (clockwise or anticlockwise).',
    diagnosticTrigger:
      'Student correctly visualizes the shape turning 90 degrees but entirely unmoors it from the specifically instructed pivot vertex, translating it into empty grid space because they treat mathematical rotation as a floating global operation rather than an anchored radial swing.',
  },
  {
    id: 'MATH-G6-STAT-6SS01',
    gradeLevel: 6,
    domain: 'Statistics',
    ixlStyleSkill:
      'Formulate statistical questions, predict outcomes, and select appropriate variables to investigate datasets.',
    cambridgeStandard:
      '6Ss.01 Plan and conduct an investigation and make predictions for a set of related statistical questions, considering what data to collect (categorical, discrete and continuous data).',
    diagnosticTrigger:
      'Student plans a statistical investigation by actively selecting a severely biased or incredibly tiny sample subset (e.g., polling only 3 close friends), failing to mathematically recognize that extreme sampling bias entirely invalidates demographic inference and prediction.',
  },
  {
    id: 'MATH-G6-STAT-6SS02',
    gradeLevel: 6,
    domain: 'Statistics',
    ixlStyleSkill:
      'Construct complex graphs including pie charts, histograms, and scatter graphs, selecting the right graph for the data type.',
    cambridgeStandard:
      '6Ss.02 Record, organise and represent categorical, discrete and continuous data. Choose and explain which representation to use in a given situation: - Venn and Carroll diagrams - tally charts and frequency tables - bar charts - waffle diagrams and pie charts - frequency diagrams for continuous data - line graphs - scatter graphs - dot plots.',
    diagnosticTrigger:
      "Student attempts to force purely independent categorical nominal data (like 'favorite eye colors') onto a continuous line graph, falsely drawing interstitial line segments that imply a non-existent fractional progression between the distinct word variables.",
  },
  {
    id: 'MATH-G6-STAT-6SS03',
    gradeLevel: 6,
    domain: 'Statistics',
    ixlStyleSkill:
      'Calculate and choose between the mean, median, mode, and range to best represent a given data set.',
    cambridgeStandard:
      '6Ss.03 Understand that the mode, median, mean and range are ways to describe and summarise data sets. Find and interpret the mode (including bimodal data), median, mean and range, and consider their appropriateness for the context.',
    diagnosticTrigger:
      "Student successfully computes the exact mathematical mean but blindly applies it to heavily skewed data (e.g., averaging salaries where one person makes millions), failing to conceptually recognize that an extreme outlier completely shatters the mean's validity as a central tendency.",
  },
  {
    id: 'MATH-G6-STAT-6SS04',
    gradeLevel: 6,
    domain: 'Statistics',
    ixlStyleSkill:
      'Compare different datasets by analyzing variance, spread, and identifying logical real-world patterns.',
    cambridgeStandard:
      '6Ss.04 Interpret data, identifying patterns, within and between data sets, to answer statistical questions. Discuss conclusions, considering the sources of variation, and check predictions.',
    diagnosticTrigger:
      'Student observes a distinct correlation slope on a plotted scatter graph and automatically concludes absolute direct causation (e.g., claiming bigger shoe sizes cause higher reading scores), entirely omitting the presence of hidden, secondary covariant factors like biological age.',
  },
  {
    id: 'MATH-G6-STAT-6SP01',
    gradeLevel: 6,
    domain: 'Statistics',
    ixlStyleSkill:
      'Convert probability scenarios into exact fractions, decimals, or percentages to compare likelihoods.',
    cambridgeStandard:
      '6Sp.01 Use the language associated with probability and proportion to describe and compare possible outcomes.',
    diagnosticTrigger:
      "Student correctly deduces verbally that a specific random event has a '1 in 4 chance' of happening but writes the formal mathematical probability fraction as 1/5, fundamentally misinterpreting the phrasing as a part-to-part ratio rather than extracting the unified whole denominator.",
  },
  {
    id: 'MATH-G6-STAT-6SP02',
    gradeLevel: 6,
    domain: 'Statistics',
    ixlStyleSkill:
      'Differentiate between mutually exclusive events and independent concurrent events.',
    cambridgeStandard:
      "6Sp.02 Identify when two events can happen at the same time and when they cannot, and know that the latter are called 'mutually exclusive'.",
    diagnosticTrigger:
      "Student incorrectly claims that rolling an even number and rolling a 2 on a single 6-sided die are 'mutually exclusive' mathematical events, failing to map the logical subset overlap where a single physical outcome perfectly satisfies both statistical conditions simultaneously.",
  },
  {
    id: 'MATH-G6-STAT-6SP03',
    gradeLevel: 6,
    domain: 'Statistics',
    ixlStyleSkill:
      'Understand that complex real-world probabilities require massive empirical sampling to model accurately.',
    cambridgeStandard:
      '6Sp.03 Recognise that some probabilities can only be modelled through experiments using a large number of trials.',
    diagnosticTrigger:
      'Student flips a weighted, asymmetrical object (like a plastic bottle) exactly 10 times, records 7 standing upright, and mathematically assumes the true theoretical probability is definitively 70%, completely ignoring the extreme statistical noise inherently present in tiny sample sizes.',
  },
  {
    id: 'MATH-G6-STAT-6SP04',
    gradeLevel: 6,
    domain: 'Statistics',
    ixlStyleSkill:
      'Simulate probability events over many trials and analyze why empirical results converge on theoretical probability.',
    cambridgeStandard:
      '6Sp.04 Conduct chance experiments or simulations, using small and large numbers of trials. Predict, analyse and describe the frequency of outcomes using the language of probability.',
    diagnosticTrigger:
      "Student executes 100 random dice rolls and becomes mathematically confused when the face '3' appears 15 times instead of precisely 16.6 times, revealing a rigid cognitive expectation for perfect algebraic symmetry instead of accepting natural probabilistic variance limits.",
  },
];
