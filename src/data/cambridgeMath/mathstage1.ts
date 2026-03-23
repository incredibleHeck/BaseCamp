import type { CurriculumObjective } from '../curriculumTypes';

/**
 * Cambridge Primary Mathematics — Stage 1 (Grade 1).
 */
export const cambridgeMathStage1: CurriculumObjective[] = [
  {
    id: 'MATH-G1-NUM-1NC01',
    gradeLevel: 1,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Count up to 20 objects by touching or pointing to each one once, matching one number to one object.',
    cambridgeStandard:
      '1Nc.01 Count objects from 0 to 20, recognising conservation of number and one-to-one correspondence.',
    diagnosticTrigger:
      'Student recounts the same items or claims the total has changed when objects are spatially stretched out, failing to demonstrate conservation of number because they rely purely on the visual length of the row rather than 1-to-1 matching.',
  },
  {
    id: 'MATH-G1-NUM-1NC02',
    gradeLevel: 1,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Instantly recognize amounts up to 10 in standard patterns like dice, dominoes, or ten-frames.',
    cambridgeStandard:
      '1Nc.02 Recognise the number of objects presented in familiar patterns up to 10, without counting.',
    diagnosticTrigger:
      'Student points and touches every single dot on a standard ten-frame representation one by one, failing to instantly subitize the clustered spatial quantity.',
  },
  {
    id: 'MATH-G1-NUM-1NC03',
    gradeLevel: 1,
    domain: 'Numeracy',
    ixlStyleSkill: 'Estimate a group of up to 20 items using visual clusters and count to check the guess.',
    cambridgeStandard:
      '1Nc.03 Estimate the number of objects or people (up to 20), and check by counting.',
    diagnosticTrigger:
      'Student attempts to physically count a dense, uncountable pile of items (like a box of raisins) from a picture one-by-one rather than deploying a visual volume estimate, lacking the concept of approximate scale.',
  },
  {
    id: 'MATH-G1-NUM-1NC04',
    gradeLevel: 1,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Count forward and backward by 1s, 2s, and 10s from any starting number up to 20.',
    cambridgeStandard:
      '1Nc.04 Count on in ones, twos or tens, and count back in ones and tens, starting from any number (from 0 to 20).',
    diagnosticTrigger:
      "Student calculates addition perfectly but resets to zero or freezes when asked to 'count back', treating counting on and back as disconnected actions rather than bidirectional movement on the same continuous mental number line.",
  },
  {
    id: 'MATH-G1-NUM-1NC05',
    gradeLevel: 1,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Identify odd and even numbers up to 20 by pairing objects and checking for leftovers.',
    cambridgeStandard:
      "1Nc.05 Understand even and odd numbers as 'every other number' when counting (from 0 to 20).",
    diagnosticTrigger:
      "Student groups objects in a ten-frame but ignores the 'one extra' spatial leftover, failing to physically map the 'pairs vs. pairs plus one' structural rule that defines even and odd parity.",
  },
  {
    id: 'MATH-G1-NUM-1NC06',
    gradeLevel: 1,
    domain: 'Numeracy',
    ixlStyleSkill: 'Describe repeating patterns of colors, shapes, and sizes using sequence words.',
    cambridgeStandard: '1Nc.06 Use familiar language to describe sequences of objects.',
    diagnosticTrigger:
      "Student successfully extends a visual pattern but cannot articulate the alternating sequence rule verbally, lacking the positional vocabulary (e.g., 'red comes after blue') to generalize spatial repetition.",
  },
  {
    id: 'MATH-G1-NUM-1NM01',
    gradeLevel: 1,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Identify and sort commonly used local coins and bills by recognizing their specific sizes and colors.',
    cambridgeStandard: '1Nm.01 Recognise money used in local currency.',
    diagnosticTrigger:
      'Student categorizes currency strictly by physical shape or sheer size without recognizing the abstract printed denomination, falsely assuming a physically larger coin inherently holds higher monetary value.',
  },
  {
    id: 'MATH-G1-NUM-1NI01',
    gradeLevel: 1,
    domain: 'Numeracy',
    ixlStyleSkill: 'Read and write numbers and their matching number words from 0 to 20.',
    cambridgeStandard:
      '1Ni.01 Recite, read and write number names and whole numbers (from 0 to 20).',
    diagnosticTrigger:
      "Student writes '14' as '41' due to the phonetic English irregularity of teen numbers ('four-teen'), completely reversing the correct base-10 digit order.",
  },
  {
    id: 'MATH-G1-NUM-1NI02',
    gradeLevel: 1,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Add numbers by combining two groups or by placing the larger number in your head and counting on.',
    cambridgeStandard: '1Ni.02 Understand addition as - counting on - combining two sets.',
    diagnosticTrigger:
      "Student solves 8 + 3 by counting out 8 objects, then 3 objects, and finally recounting all 11 from scratch, failing to hold the first set's cardinality in working memory to execute the efficient 'count on' strategy.",
  },
  {
    id: 'MATH-G1-NUM-1NI03',
    gradeLevel: 1,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Subtract numbers by taking away items, counting backward, or finding the difference between two sets.',
    cambridgeStandard: '1Ni.03 Understand subtraction as: - counting back - take away - difference.',
    diagnosticTrigger:
      "Student subtracts easily when 'taking away' items but freezes when asked 'how many more does group A have than group B?', entirely missing the comparative 'difference' interpretation of the subtraction operator.",
  },
  {
    id: 'MATH-G1-NUM-1NI04',
    gradeLevel: 1,
    domain: 'Numeracy',
    ixlStyleSkill: 'Recall number pairs (bonds) that add up to exactly 10, including 0 and 10.',
    cambridgeStandard: '1Ni.04 Recognise complements of 10.',
    diagnosticTrigger:
      'Student resorts to physically counting on their fingers starting from zero for every single complement rather than instantly retrieving 0-to-10 number bonds as automated paired associative facts.',
  },
  {
    id: 'MATH-G1-NUM-1NI05',
    gradeLevel: 1,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Estimate the answer before calculating basic addition and subtraction problems within 20.',
    cambridgeStandard:
      '1Ni.05 Estimate, add and subtract whole numbers (where the answer is from 0 to 20).',
    diagnosticTrigger:
      'Student writes 1 + 5 = 17 and confidently accepts the answer, applying rote symbol copying without estimating the spatial magnitude of the numbers to immediately recognize the logical impossibility.',
  },
  {
    id: 'MATH-G1-NUM-1NI06',
    gradeLevel: 1,
    domain: 'Numeracy',
    ixlStyleSkill: 'Recall addition doubles facts up to double 10 (10 + 10).',
    cambridgeStandard: '1Ni.06 Know doubles up to double 10.',
    diagnosticTrigger:
      'Student sequentially counts one-by-one to calculate \'double 4\' rather than accessing automated associative memory for twin base facts, showing an over-reliance on serial addition loops.',
  },
  {
    id: 'MATH-G1-NUM-1NP01',
    gradeLevel: 1,
    domain: 'Numeracy',
    ixlStyleSkill: 'Identify zero as representing nought, nil, or a completely empty set.',
    cambridgeStandard: '1Np.01 Understand that zero represents none of something.',
    diagnosticTrigger:
      "Student writes '1' when asked to record the number of items inside an empty container, confusing the physical presence of the drawn container itself with the cardinality of its internal contents.",
  },
  {
    id: 'MATH-G1-NUM-1NP02',
    gradeLevel: 1,
    domain: 'Numeracy',
    ixlStyleSkill: 'Break apart numbers between 10 and 20 into one ten and some ones.',
    cambridgeStandard: '1Np.02 Compose, decompose and regroup numbers from 10 to 20.',
    diagnosticTrigger:
      'Student decomposes 14 randomly as 7 + 7 but freezes when asked to represent it strictly as 1 ten and 4 ones, treating teen numbers merely as addition pairs rather than hierarchical base-10 block structures.',
  },
  {
    id: 'MATH-G1-NUM-1NP03',
    gradeLevel: 1,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Compare and order numbers up to 20 on a number line using words like more, less, and same.',
    cambridgeStandard:
      '1Np.03 Understand the relative size of quantities to compare and order numbers from 0 to 20.',
    diagnosticTrigger:
      'Student places the number 15 exactly in the physical center between 10 and 30 on a blank number line rather than clustering it correctly in the 10-20 interval, revealing a warped internal spatial continuum.',
  },
  {
    id: 'MATH-G1-NUM-1NP04',
    gradeLevel: 1,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Identify positions in a sequence using ordinal words from first (1st) to tenth (10th).',
    cambridgeStandard: '1Np.04 Recognise and use the ordinal numbers from 1st to 10th.',
    diagnosticTrigger:
      "Student labels the third object in a sequence strictly as 'number 3' instead of 'third', linguistically and conceptually conflating total cardinal quantity with specific ordinal sequence rank.",
  },
  {
    id: 'MATH-G1-NUM-1NF01',
    gradeLevel: 1,
    domain: 'Numeracy',
    ixlStyleSkill: 'Identify whether a shape is divided into two equal parts or two unequal parts.',
    cambridgeStandard:
      '1Nf.01 Understand that an object or shape can be split into two equal parts or two unequal parts.',
    diagnosticTrigger:
      "Student declares a rectangle split diagonally into two triangles as 'unequal', rigidly believing that halves must be perfectly congruent mirror shapes rather than just verifying equivalent geometric area.",
  },
  {
    id: 'MATH-G1-NUM-1NF02',
    gradeLevel: 1,
    domain: 'Numeracy',
    ixlStyleSkill:
      'Identify one half of a continuous shape or one half of an even group of objects.',
    cambridgeStandard:
      '1Nf.02 Understand that a half can describe one of two equal parts of a quantity or set of objects.',
    diagnosticTrigger:
      "Student circles one single counter from a scattered group of 8 to represent a 'half', misunderstanding that finding half of a discrete set requires fair-sharing the entire group into exactly two equal subsets.",
  },
  {
    id: 'MATH-G1-NUM-1NF03',
    gradeLevel: 1,
    domain: 'Numeracy',
    ixlStyleSkill: 'Calculate exactly one half of an even whole number to shrink its value.',
    cambridgeStandard: '1Nf.03 Understand that a half can act as an operator (whole number answers).',
    diagnosticTrigger:
      "Student sees the instruction 'half of 8' and subtracts 2, fundamentally confusing the proportional fractional shrinking operator with a discrete additive subtraction mechanism.",
  },
  {
    id: 'MATH-G1-NUM-1NF04',
    gradeLevel: 1,
    domain: 'Numeracy',
    ixlStyleSkill: 'Mentally combine two separate halves to reconstruct a single whole shape or set.',
    cambridgeStandard: '1Nf.04 Understand and visualise that halves can be combined to make wholes.',
    diagnosticTrigger:
      "Student counts four separate half-circle pieces as 'four wholes' rather than mentally pairing the fragmented halves back together to correctly conserve and deduce 'two wholes'.",
  },
  {
    id: 'MATH-G1-MEA-1GT01',
    gradeLevel: 1,
    domain: 'Measurement',
    ixlStyleSkill:
      'Use time vocabulary like morning, afternoon, yesterday, today, and tomorrow correctly.',
    cambridgeStandard: '1Gt.01 Use familiar language to describe units of time.',
    diagnosticTrigger:
      "Student states they will do an activity 'yesterday', demonstrating a profound linguistic and cognitive detachment from the forward directional flow of past/future temporal routines.",
  },
  {
    id: 'MATH-G1-MEA-1GT02',
    gradeLevel: 1,
    domain: 'Measurement',
    ixlStyleSkill:
      'Recite and correctly sequence the specific days of the week and months of the year.',
    cambridgeStandard: '1Gt.02 Know the days of the week and the months of the year.',
    diagnosticTrigger:
      'Student inserts months into the days of the week or loops the sequence arbitrarily, failing to strictly segregate the mutually exclusive, closed cyclical nature of varying calendar scales.',
  },
  {
    id: 'MATH-G1-MEA-1GT03',
    gradeLevel: 1,
    domain: 'Measurement',
    ixlStyleSkill:
      'Read analog and digital clocks to identify time to the exact hour and half-hour.',
    cambridgeStandard: '1Gt.03 Recognise time to the hour and half hour.',
    diagnosticTrigger:
      "Student reads 'half past three' but draws the analog hour hand pointing exactly dead-center on the integer 3, failing to geometrically scale the hour hand's continuous movement between numbers.",
  },
  {
    id: 'MATH-G1-GEO-1GG01',
    gradeLevel: 1,
    domain: 'Geometry',
    ixlStyleSkill:
      'Sort and describe 2D shapes by counting sides and identifying straight or curved boundaries.',
    cambridgeStandard:
      '1Gg.01 Identify, describe and sort 2D shapes by their characteristics or properties, including reference to number of sides and whether the sides are curved or straight.',
    diagnosticTrigger:
      'Student sorts shapes solely by superficial characteristics like color or size rather than actively analyzing the fundamental geometric properties of straight boundaries versus continuous curved edges.',
  },
  {
    id: 'MATH-G1-MEA-1GG02',
    gradeLevel: 1,
    domain: 'Measurement',
    ixlStyleSkill:
      "Compare objects' length, height, and distance using words like longer, tallest, and thinnest.",
    cambridgeStandard:
      '1Gg.02 Use familiar language to describe length, including long, longer, longest, thin, thinner, thinnest, short, shorter, shortest, tall, taller and tallest.',
    diagnosticTrigger:
      'Student asserts a vertically standing pencil is inherently \'longer\' than an identical horizontally lying pencil, falling prey to vertical 1D centration and failing to conserve length across orientation.',
  },
  {
    id: 'MATH-G1-GEO-1GG03',
    gradeLevel: 1,
    domain: 'Geometry',
    ixlStyleSkill:
      'Sort and describe 3D solid shapes by finding flat faces, curved surfaces, and edges.',
    cambridgeStandard:
      '1Gg.03 Identify, describe and sort 3D shapes by their properties, including reference to the number of faces, edges and whether faces are flat or curved.',
    diagnosticTrigger:
      'Student categorizes a sphere and a cylinder together solely because they both roll, lacking the analytic geometric vocabulary to differentiate between a purely curved surface and a solid possessing discrete flat faces.',
  },
  {
    id: 'MATH-G1-MEA-1GG04',
    gradeLevel: 1,
    domain: 'Measurement',
    ixlStyleSkill:
      'Compare the mass of objects using words like heavy, heavier, light, and lighter.',
    cambridgeStandard: '1Gg.04 Use familiar language to describe mass, including heavy, light, less and more.',
    diagnosticTrigger:
      'Student visually assumes a physically massive but empty cardboard box must inherently possess more mass than a tiny dense metal block, completely conflating visual volumetric size with physical gravitational weight.',
  },
  {
    id: 'MATH-G1-MEA-1GG05',
    gradeLevel: 1,
    domain: 'Measurement',
    ixlStyleSkill:
      'Describe and compare the liquid capacity of containers using words like full, empty, and holds more.',
    cambridgeStandard: '1Gg.05 Use familiar language to describe capacity, including full, empty, less and more.',
    diagnosticTrigger:
      'Student judges a tall, extremely thin glass as holding more liquid than a short, wide bucket solely because the water level rests vertically higher, completely ignoring the cross-sectional volumetric area.',
  },
  {
    id: 'MATH-G1-GEO-1GG06',
    gradeLevel: 1,
    domain: 'Geometry',
    ixlStyleSkill:
      'Differentiate between flat 2D shapes drawn on paper and solid 3D shapes holding volume.',
    cambridgeStandard: '1Gg.06 Differentiate between 2D and 3D shapes.',
    diagnosticTrigger:
      "Student points to the circular top of a physical 3D cylinder and incorrectly labels the entire 3D object a 'circle', collapsing the volumetric solid down to a single flattened 2D perceptual plane.",
  },
  {
    id: 'MATH-G1-GEO-1GG07',
    gradeLevel: 1,
    domain: 'Geometry',
    ixlStyleSkill:
      'Identify symmetrical shapes that look exactly the same when turned or rotated.',
    cambridgeStandard: '1Gg.07 Identify when a shape looks identical as it rotates.',
    diagnosticTrigger:
      "Student claims a physical square changes into a completely new shape (a diamond) when it is rotated 45 degrees, failing to conserve the object's rigid geometric identity through rotational transformation.",
  },
  {
    id: 'MATH-G1-MEA-1GG08',
    gradeLevel: 1,
    domain: 'Measurement',
    ixlStyleSkill:
      'Choose the correct tool with a numbered scale (ruler, balance, jug, or thermometer) to measure different properties.',
    cambridgeStandard:
      '1Gg.08 Explore instruments that have numbered scales, and select the most appropriate instrument to measure length, mass, capacity and temperature.',
    diagnosticTrigger:
      'Student attempts to use a flat ruler to figure out how much liquid water is inside a jug, demonstrating a fundamental semantic disconnect between the physical 3D fluid property being quantified and the tool\'s 1D linear measuring mechanism.',
  },
  {
    id: 'MATH-G1-GEO-1GP01',
    gradeLevel: 1,
    domain: 'Geometry',
    ixlStyleSkill:
      'Describe position and direction relative to other objects using words like above, below, left, and right.',
    cambridgeStandard: '1Gp.01 Use familiar language to describe position and direction.',
    diagnosticTrigger:
      "Student perfectly identifies 'up' and 'down' but guesses randomly when differentiating 'left' and 'right', indicating an unsolidified egocentric mapping of lateral spatial coordinates.",
  },
  {
    id: 'MATH-G1-STAT-1SS01',
    gradeLevel: 1,
    domain: 'Statistics',
    ixlStyleSkill:
      'Answer non-statistical questions where data fits into distinct categories (like favorite colors).',
    cambridgeStandard: '1Ss.01 Answer non-statistical questions (categorical data).',
    diagnosticTrigger:
      "Student provides an irrelevant, hyper-specific personal anecdote when asked a categorical non-statistical question like 'What is your favorite fruit?', unable to abstract and map their preference to a strictly defined nominal category.",
  },
  {
    id: 'MATH-G1-STAT-1SS02',
    gradeLevel: 1,
    domain: 'Statistics',
    ixlStyleSkill:
      'Organize and record categorical data using lists, tables, tally charts, pictograms, and block graphs.',
    cambridgeStandard:
      '1Ss.02 Record, organise and represent categorical data using: - practical resources and drawings - lists and tables - Venn and Carroll diagrams - block graphs and pictograms.',
    diagnosticTrigger:
      'Student draws symbols of drastically inconsistent sizes in a pictogram (where 1 drawing = 1 data value), causing a category with fewer absolute items to visually overshadow a mathematically larger category.',
  },
  {
    id: 'MATH-G1-STAT-1SS03',
    gradeLevel: 1,
    domain: 'Statistics',
    ixlStyleSkill:
      'Interpret data from charts to discuss conclusions using comparison words like most, least, more, and less.',
    cambridgeStandard:
      '1Ss.03 Describe data, using familiar language including reference to more, less, most or least to answer non-statistical questions and discuss conclusions.',
    diagnosticTrigger:
      "Student successfully reads the discrete numerical value of a single bar on a block graph but stalls completely when asked 'how many more', unable to execute the subtractive mental operation required to compare distinct categorical quantities.",
  },
];
