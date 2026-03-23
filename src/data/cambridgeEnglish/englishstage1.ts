import type { CurriculumObjective } from '../curriculumTypes';

/**
 * Cambridge Primary English / Literacy — Stage 1 (Grade 1).
 *
 * `id` values embed the official strand code with Cambridge casing (e.g. `1Rv` not `1RV`),
 * matching notation like `1Rv.03` in the framework — e.g. `ENGL-G1-READ-1Rv03`.
 */
export const cambridgeEnglishStage1: CurriculumObjective[] = [
  {
    id: "ENGL-G1-READ-1Rw01",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Identify alphabet letters by name and produce their most common sound.",
    cambridgeStandard:
      "1Rw.01 Know the name of each letter in the English alphabet and the most common sound (phoneme) associated with it.",
    diagnosticTrigger:
      "Student attempts to decode a word using the alphabetical name of the letter rather than its phonetic sound, reading 'cat' as 'see-ay-tee', indicating a failure to map graphemes to phonological representations.",
  },
  {
    id: "ENGL-G1-READ-1Rw02",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Read common consonant and vowel digraphs (e.g., sh, ch, ai, ee).",
    cambridgeStandard:
      "1Rw.02 Identify the sounds (phonemes) represented by more than one letter (consonant digraphs; vowel digraphs; trigraphs, e.g. th, sh, ch; ai, ee; igh).",
    diagnosticTrigger:
      "Student over-segments words by voicing every single letter independently (e.g., reading 'ship' as /s/-/h/-/i/-/p/), unable to visually chunk adjacent graphemes into single phonetic digraphs.",
  },
  {
    id: "ENGL-G1-READ-1Rw03",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Blend adjacent consonants to read consonant blends (e.g., br, nd).",
    cambridgeStandard:
      "1Rw.03 Blend to identify the sounds represented by adjacent consonants, e.g. br, nd.",
    diagnosticTrigger:
      "Student inserts an epenthetic schwa vowel between adjacent consonants (e.g., reading 'frog' as 'fuh-rog' or 'brim' as 'buh-rim'), demonstrating weak articulatory transition in consonant clusters.",
  },
  {
    id: "ENGL-G1-READ-1Rw04",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Read verbs ending with -s, -ed, and -ing.",
    cambridgeStandard:
      "1Rw.04 Read verbs with endings -s, -ed and -ing.",
    diagnosticTrigger:
      "Student reads the root of the word perfectly but drops or guesses the morphological suffix (reading 'jumping' as 'jump'), indicating visual processing that terminates prematurely at the word stem.",
  },
  {
    id: "ENGL-G1-READ-1Rw05",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Sound out and read simple decodable words.",
    cambridgeStandard:
      "1Rw.05 Use phonic knowledge to read decodable words.",
    diagnosticTrigger:
      "Student guesses a word based purely on the initial letter and context (e.g., reading 'house' as 'home'), demonstrating a compensatory avoidance of sequential left-to-right phonetic decoding.",
  },
  {
    id: "ENGL-G1-READ-1Rw06",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Use phonics to sound out parts of unfamiliar words.",
    cambridgeStandard:
      "1Rw.06 Use phonic knowledge to sound out some elements of unfamiliar words.",
    diagnosticTrigger:
      "Student completely freezes or skips an unknown multisyllabic word without attempting to isolate known syllable chunks or phonemes, lacking independent morphological attack strategies.",
  },
  {
    id: "ENGL-G1-READ-1Rw07",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Recognize and read high-frequency and common exception sight words.",
    cambridgeStandard:
      "1Rw.07 Begin to recognise a range of common words on sight, including common exception words.",
    diagnosticTrigger:
      "Student repeatedly attempts to sound out highly irregular sight words (e.g., decoding 'said' as /s/-/a/-/i/-/d/), failing to orthographically map the whole-word visual string into long-term memory.",
  },
  {
    id: "ENGL-G1-READ-1Rv01",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Understand the meaning of words and sentences while reading.",
    cambridgeStandard:
      "1Rv.01 Begin to show understanding of words and sentences encountered in reading.",
    diagnosticTrigger:
      "Student decodes a sentence with perfect phonetic accuracy but cannot select a matching picture or answer a basic 'who/what' question, exhibiting a severe hyperlexic disconnect between mechanical decoding and semantic comprehension.",
  },
  {
    id: "ENGL-G1-READ-1Rv02",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Use pictures to figure out the meaning of new or difficult words.",
    cambridgeStandard:
      "1Rv.02 Use pictures in texts as cues to support understanding of unfamiliar words.",
    diagnosticTrigger:
      "Student stalls entirely on an unfamiliar concrete noun and refuses to shift visual attention to the accompanying illustration to cross-reference meaning, indicating poor multimodal sensory integration.",
  },
  {
    id: "ENGL-G1-READ-1Rv03",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Identify and save interesting words from a text to use later.",
    cambridgeStandard:
      "1Rv.03 Identify and record interesting and significant words from texts to inform own writing.",
    diagnosticTrigger:
      "Student exclusively selects ubiquitous high-frequency words (like 'the' or 'and') when asked to find interesting vocabulary, showing a lack of metalinguistic awareness regarding descriptive or emotive lexical choices.",
  },
  {
    id: "ENGL-G1-READ-1Rv04",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Recite the alphabet in the correct order.",
    cambridgeStandard:
      "1Rv.04 Recite the alphabet in order.",
    diagnosticTrigger:
      "Student successfully recites the alphabet song but conflates 'L-M-N-O-P' into a single indistinguishable unit, lacking one-to-one cognitive mapping of the serial letters.",
  },
  {
    id: "ENGL-G1-READ-1Rv05",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Identify rhyming words and rhythm in a text or poem.",
    cambridgeStandard:
      "1Rv.05 Explore sounds and words in texts, e.g. rhyming words, rhythm.",
    diagnosticTrigger:
      "Student identifies words that start with the same letter rather than words that share an ending rime (e.g., matching 'cat' with 'cup' instead of 'bat'), demonstrating underdeveloped phonological awareness of ending sound structures.",
  },
  {
    id: "ENGL-G1-READ-1Rg01",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Notice and pause for full stops and capital letters while reading.",
    cambridgeStandard:
      "1Rg.01 Re-read text showing understanding of capital letters and full stops to indicate sentences, and simple grammatical links between words, e.g. [The girl] [is playing] with [her ball].",
    diagnosticTrigger:
      "Student reads continuously across sentence boundaries without dropping vocal pitch or pausing for breath, failing to recognize terminal punctuation as an orthographic boundary marker for syntactic phrasing.",
  },
  {
    id: "ENGL-G1-READ-1Rg02",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Understand why writers use full stops and capital letters.",
    cambridgeStandard:
      "1Rg.02 Explore in texts, and understand, the use of full stops and different uses of capital letters.",
    diagnosticTrigger:
      "Student assumes every single capital letter encountered mid-sentence (like a proper noun) signals the start of a completely new thought, unable to differentiate syntactic start markers from specific nominal capitalization.",
  },
  {
    id: "ENGL-G1-READ-1Rg03",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Identify complete sentences in a text.",
    cambridgeStandard:
      "1Rg.03 Identify sentences in texts.",
    diagnosticTrigger:
      "Student segments text randomly based on line breaks rather than searching for the capital letter and terminal punctuation pair, lacking a structural schema for complete grammatical propositions.",
  },
  {
    id: "ENGL-G1-READ-1Rg04",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Understand how the word 'and' joins ideas in a sentence.",
    cambridgeStandard:
      "1Rg.04 Explore in texts sentences that contain and.",
    diagnosticTrigger:
      "Student reads a compound subject (e.g., 'The cat and the dog ran') but processes them as disconnected entities, failing to cognitively fuse the nouns via the conjunctive operator into a single pluralized actor.",
  },
  {
    id: "ENGL-G1-READ-1Rg05",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Understand how verbs and word order make a sentence make sense.",
    cambridgeStandard:
      "1Rg.05 Explore in texts, and understand, the grammar of statements, including the importance of verbs and word order.",
    diagnosticTrigger:
      "Student reads a scrambled or semantically impossible sentence without self-correcting or hesitating, indicating zero active syntactic monitoring during the decoding process.",
  },
  {
    id: "ENGL-G1-READ-1Rg06",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Identify nouns (naming words) and verbs (action words) in a text.",
    cambridgeStandard:
      "1Rg.06 Explore in texts examples of nouns and verbs.",
    diagnosticTrigger:
      "Student cannot differentiate between an action and an object when prompted, routinely identifying physical nouns as 'doing words', revealing an unformed grammatical categorization system.",
  },
  {
    id: "ENGL-G1-READ-1Rg07",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Understand how to use the articles 'a', 'an', and 'the'.",
    cambridgeStandard:
      "1Rg.07 Explore, and understand, the use of articles the and a or an in sentences.",
    diagnosticTrigger:
      "Student reads 'an elephant' as 'a elephant' and fails to notice the phonetic clash, demonstrating an underdeveloped morphosyntactic awareness of vowel-initial noun linkage.",
  },
  {
    id: "ENGL-G1-READ-1Rs01",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Identify the beginning, middle, and end of a story.",
    cambridgeStandard:
      "1Rs.01 Talk about the sequence of events or actions in a text, e.g. what happens at the beginning, in the middle and at the end of a story.",
    diagnosticTrigger:
      "Student recounts narrative events in a completely randomized, fragmented order, indicating severe deficits in temporal sequencing and narrative arc memory mapping.",
  },
  {
    id: "ENGL-G1-READ-1Rs02",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Recognize how stories, non-fiction texts, and poems are structured.",
    cambridgeStandard:
      "1Rs.02 Explore and recognise the features of text structure in a range of different fiction and non-fiction texts, including simple poems.",
    diagnosticTrigger:
      "Student attempts to read an informational text cover-to-cover linearly like a story, entirely ignoring organizational sub-features like headings, bullet points, or glossaries.",
  },
  {
    id: "ENGL-G1-READ-1Rs03",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Identify the cover, title, and contents page of a book.",
    cambridgeStandard:
      "1Rs.03 Explore and recognise parts of a book, including cover, title and contents.",
    diagnosticTrigger:
      "Student opens an informational text and flips blindly to find a topic, entirely unaware of the functional utility of the table of contents as a navigational spatial index.",
  },
  {
    id: "ENGL-G1-READ-1Rs04",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Recognize how texts use pictures and layouts differently based on their purpose.",
    cambridgeStandard:
      "1Rs.04 Explore and recognise how texts for different purposes look different, e.g. different uses of pictures.",
    diagnosticTrigger:
      "Student cannot distinguish between a realistic photograph in an informational text and a cartoon illustration in a fiction story, failing to grasp the varying pragmatic functions of visual media.",
  },
  {
    id: "ENGL-G1-READ-1Ri01",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Read simple stories and identify how pictures help tell the story.",
    cambridgeStandard:
      "1Ri.01 Read and explore a range of simple stories and poems, including identifying the contribution of any visual elements.",
    diagnosticTrigger:
      "Student reads the words accurately but completely ignores the illustrations, missing crucial plot elements or character emotions that the author only conveyed visually.",
  },
  {
    id: "ENGL-G1-READ-1Ri02",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Identify the main parts of a simple story, such as characters and settings.",
    cambridgeStandard:
      "1Ri.02 Identify the characteristics of simple stories.",
    diagnosticTrigger:
      "Student cannot state who the story was about or where it took place immediately after reading, showing an inability to extract core macro-narrative elements from the local sentence details.",
  },
  {
    id: "ENGL-G1-READ-1Ri03",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Read and explore simple non-fiction texts.",
    cambridgeStandard:
      "1Ri.03 Read and explore a range of simple non-fiction text types.",
    diagnosticTrigger:
      "Student becomes frustrated when reading non-fiction because they are actively searching for a protagonist or a plot, applying an inappropriate fictional cognitive schema to expository text.",
  },
  {
    id: "ENGL-G1-READ-1Ri04",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Recognize the purpose of basic non-fiction texts (e.g., instructions vs. information).",
    cambridgeStandard:
      "1Ri.04 Begin to show awareness that different non-fiction text types have different purposes and begin to identify their features.",
    diagnosticTrigger:
      "Student reads a set of numbered instructions as a disconnected list of facts, failing to recognize the imperative tone and sequential necessity of procedural text.",
  },
  {
    id: "ENGL-G1-READ-1Ri05",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Find explicitly stated facts and meanings in simple texts.",
    cambridgeStandard:
      "1Ri.05 Explore explicit meanings in simple texts.",
    diagnosticTrigger:
      "Student cannot answer literal 'who' or 'what' questions immediately after reading a straightforward sentence, indicating a failure to hold explicit semantic details in their phonological loop.",
  },
  {
    id: "ENGL-G1-READ-1Ri06",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Retell a familiar story out loud including key events.",
    cambridgeStandard:
      "1Ri.06 Retell a familiar story verbally, including most of the relevant information.",
    diagnosticTrigger:
      "Student relies entirely on heavy adult prompting to piece together a narrative, unable to independently generate a cohesive verbal summary of the story's causal chain.",
  },
  {
    id: "ENGL-G1-READ-1Ri07",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Identify main characters and describe what happens to them.",
    cambridgeStandard:
      "1Ri.07 Identify the main characters in a story and talk about what happens to them.",
    diagnosticTrigger:
      "Student focuses intensely on minor, irrelevant background details (e.g., the color of a car in one scene) rather than tracking the primary protagonist's overarching actions and emotional changes.",
  },
  {
    id: "ENGL-G1-READ-1Ri08",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Find information by reading labels, lists, and captions.",
    cambridgeStandard:
      "1Ri.08 Find information by reading labels, lists and captions.",
    diagnosticTrigger:
      "Student scours the main body text for an answer that is explicitly provided in an image label or caption, ignoring non-prose text features entirely as a source of valid information.",
  },
  {
    id: "ENGL-G1-READ-1Ri09",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Understand implied meanings and clues not explicitly stated in the text.",
    cambridgeStandard:
      "1Ri.09 Explore implicit meanings in simple texts.",
    diagnosticTrigger:
      "Student requires literal phrasing ('he was sad') and cannot deduce a character's internal state from behavioral clues ('he dropped his head and cried'), showing a lack of basic inferential reasoning.",
  },
  {
    id: "ENGL-G1-READ-1Ri10",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Anticipate and predict what will happen next in a story.",
    cambridgeStandard:
      "1Ri.10 Anticipate what happens next in a story.",
    diagnosticTrigger:
      "Student makes wild, illogical predictions completely unmoored from the established plot, demonstrating an inability to synthesize prior text events to forecast highly probable outcomes.",
  },
  {
    id: "ENGL-G1-READ-1Ri11",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Make simple inferences based on character actions or story events.",
    cambridgeStandard:
      "1Ri.11 Make simple inferences based on events in a text.",
    diagnosticTrigger:
      "Student struggles to explain why an event happened if the text does not explicitly state the cause, demonstrating a rigid, surface-level reading comprehension bound strictly to literal text.",
  },
  {
    id: "ENGL-G1-READ-1Ri12",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Answer verbal questions about texts read aloud or independently.",
    cambridgeStandard:
      "1Ri.12 Respond verbally to simple questions about texts read or heard.",
    diagnosticTrigger:
      "Student gives echolalic or completely unrelated responses to direct verbal questions about a story, indicating a breakdown in receptive language processing during sustained listening tasks.",
  },
  {
    id: "ENGL-G1-READ-1Ri13",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Answer questions about texts and explain the reasoning behind the answer.",
    cambridgeStandard:
      "1Ri.13 Answer questions about texts with some explanation of thinking.",
    diagnosticTrigger:
      "Student provides a correct yes/no answer but freezes or says 'I just guessed' when asked 'how do you know?', unable to re-access their working memory to link their deduction to specific textual evidence.",
  },
  {
    id: "ENGL-G1-READ-1Ri14",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Join in with familiar rhymes and repetitive phrases while reading.",
    cambridgeStandard:
      "1Ri.14 Show understanding of rhyme and repetition when joining in with reading familiar simple stories and poems.",
    diagnosticTrigger:
      "Student fails to chime in on highly predictable, repetitive refrain lines during a shared reading, showing a severe lack of auditory pattern recognition and rhythmic anticipation.",
  },
  {
    id: "ENGL-G1-READ-1Ra01",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Show enjoyment and engage actively with stories, poems, and non-fiction texts.",
    cambridgeStandard:
      "1Ra.01 Enjoy reading and hearing a range of simple stories, poems and non-fiction texts.",
    diagnosticTrigger:
      "Student exhibits extreme task avoidance, visual wandering, or physical restlessness specifically during story-time, indicating auditory fatigue or overwhelming language processing demands.",
  },
  {
    id: "ENGL-G1-READ-1Ra02",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Read along with familiar words and phrases in shared texts.",
    cambridgeStandard:
      "1Ra.02 Join in with some words and phrases when reading familiar simple stories and poems together.",
    diagnosticTrigger:
      "Student remains completely silent or speaks out of sync during choral reading of a familiar text, unwilling or unable to synchronize their verbal output with the group's pacing.",
  },
  {
    id: "ENGL-G1-READ-1Ra03",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Read simple texts out loud independently.",
    cambridgeStandard:
      "1Ra.03 Read aloud simple texts independently.",
    diagnosticTrigger:
      "Student relies heavily on continuous adult prompting or echo-reading, lacking the orthographic confidence and visual tracking stamina to sustain independent oral reading.",
  },
  {
    id: "ENGL-G1-READ-1Ra04",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Discuss texts and connect story events to personal experiences.",
    cambridgeStandard:
      "1Ra.04 Talk about texts heard or read, including making links with own experiences and expressing likes and dislikes.",
    diagnosticTrigger:
      "Student cannot relate a simple story about a common event (like losing a toy) to their own life, showing a deficit in integrating autobiographical episodic memory with external narratives.",
  },
  {
    id: "ENGL-G1-READ-1Ra05",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Select books based on personal interest for independent reading.",
    cambridgeStandard:
      "1Ra.05 Begin to make choices about books to read or listen to for pleasure.",
    diagnosticTrigger:
      "Student randomly grabs books from the shelf without looking at covers or relies entirely on teacher selection, demonstrating a lack of intrinsic reading motivation and unformed personal preferences.",
  },
  {
    id: "ENGL-G1-READ-1Ra06",
    gradeLevel: 1,
    domain: "Reading",
    ixlStyleSkill:
      "Differentiate between realistic events in stories and fantasy or make-believe.",
    cambridgeStandard:
      "1Ra.06 Begin to identify how contexts and events in stories are the same as or different from real life.",
    diagnosticTrigger:
      "Student cannot distinguish whether a talking animal in a story is something that could physically happen in the real world, indicating an underdeveloped cognitive boundary between literal reality and narrative fantasy.",
  },
  {
    id: "ENGL-G1-WRIT-1Ww01",
    gradeLevel: 1,
    domain: "Writing",
    ixlStyleSkill:
      "Identify the most common letter for each sound when spelling.",
    cambridgeStandard:
      "1Ww.01 Identify the most common letter(s) (grapheme(s)) associated with each sound in the English language.",
    diagnosticTrigger:
      "Student hears a distinct consonant phoneme like /m/ but writes a visually dissimilar letter like 't', demonstrating a fundamental breakdown in phoneme-to-grapheme encoding.",
  },
  {
    id: "ENGL-G1-WRIT-1Ww02",
    gradeLevel: 1,
    domain: "Writing",
    ixlStyleSkill:
      "Spell words containing adjacent consonants (br, nd) and common digraphs (sh, ch, th).",
    cambridgeStandard:
      "1Ww.02 Identify letters (graphemes) for adjacent consonants (e.g. br, nd) and consonant digraphs, including th, ch and sh.",
    diagnosticTrigger:
      "Student systematically omits the second letter in an initial consonant blend (writing 'bed' for 'bread') or spells digraphs phonetically incorrect (writing 's' for 'sh'), reflecting poor auditory segmentation of clustered sounds.",
  },
  {
    id: "ENGL-G1-WRIT-1Ww03",
    gradeLevel: 1,
    domain: "Writing",
    ixlStyleSkill:
      "Use rhyming patterns to spell similar words (e.g., rock, clock, sock).",
    cambridgeStandard:
      "1Ww.03 Relate rhyme to shared spelling patterns, e.g. rock, clock, sock.",
    diagnosticTrigger:
      "Student spells rhyming words with entirely different, phonetically random vowel strings despite recognizing the shared rime, failing to apply analogical spelling strategies to word families.",
  },
  {
    id: "ENGL-G1-WRIT-1Ww04",
    gradeLevel: 1,
    domain: "Writing",
    ixlStyleSkill:
      "Add -s or -es to words to make plural nouns.",
    cambridgeStandard:
      "1Ww.04 Explore and use plural nouns with endings -s and -es, and understand the effect on the meaning of a noun of adding these endings.",
    diagnosticTrigger:
      "Student writes the singular form of a noun even when explicitly drawing or describing multiple items, indicating a lack of morphological awareness regarding written plural markers.",
  },
  {
    id: "ENGL-G1-WRIT-1Ww05",
    gradeLevel: 1,
    domain: "Writing",
    ixlStyleSkill:
      "Sound out and spell simple regular words using phonics.",
    cambridgeStandard:
      "1Ww.05 Choose plausible graphemes that match phonemes to write simple regular words and to attempt other words.",
    diagnosticTrigger:
      "Student writes strings of random consonants for simple CVC words (e.g., writing 'pzt' for 'cat'), showing a complete absence of sequential phonemic segmentation and encoding.",
  },
  {
    id: "ENGL-G1-WRIT-1Ww06",
    gradeLevel: 1,
    domain: "Writing",
    ixlStyleSkill:
      "Spell high-frequency words and common exception words correctly.",
    cambridgeStandard:
      "1Ww.06 Spell familiar words accurately, including common exception words.",
    diagnosticTrigger:
      "Student continually attempts to spell highly irregular sight words purely phonetically (e.g., writing 'sed' for 'said' or 'wuz' for 'was'), failing to retrieve the whole-word visual string from orthographic memory.",
  },
  {
    id: "ENGL-G1-WRIT-1Ww07",
    gradeLevel: 1,
    domain: "Writing",
    ixlStyleSkill:
      "Use spelling logs and ask for help to spell unfamiliar words.",
    cambridgeStandard:
      "1Ww.07 Ask for support in spelling unfamiliar words and use spelling logs to support future writing.",
    diagnosticTrigger:
      "Student deliberately simplifies their written vocabulary to avoid words they cannot spell rather than seeking help or using environmental print resources, demonstrating high risk-aversion in written expression.",
  },
  {
    id: "ENGL-G1-WRIT-1Wv01",
    gradeLevel: 1,
    domain: "Writing",
    ixlStyleSkill:
      "Use topic-specific vocabulary when writing.",
    cambridgeStandard:
      "1Wv.01 Use vocabulary relevant to a familiar topic.",
    diagnosticTrigger:
      "Student relies heavily on vague, generic placeholder nouns (e.g., 'the thing', 'the stuff') when writing about a highly specific topic, indicating weak lexical retrieval and poor expressive vocabulary.",
  },
  {
    id: "ENGL-G1-WRIT-1Wv02",
    gradeLevel: 1,
    domain: "Writing",
    ixlStyleSkill:
      "Use common story-starting phrases like 'Once upon a time'.",
    cambridgeStandard:
      "1Wv.02 Begin to use some formulaic language, e.g. Once upon a time …",
    diagnosticTrigger:
      "Student begins fictional narrative writing abruptly mid-action without establishing a setting or temporal context, demonstrating a lack of familiarity with standardized narrative discourse frames.",
  },
  {
    id: "ENGL-G1-WRIT-1Wv03",
    gradeLevel: 1,
    domain: "Writing",
    ixlStyleSkill:
      "Include interesting and descriptive words in writing.",
    cambridgeStandard:
      "1Wv.03 Use own lists of interesting and significant words to extend the range of vocabulary used in written work.",
    diagnosticTrigger:
      "Student writes strictly repetitive, bare-minimum subject-verb constructions (e.g., 'The cat ran. The dog ran.') without any adjectives, reflecting a rigid, unimaginative syntactic generation engine.",
  },
  {
    id: "ENGL-G1-WRIT-1Wg01",
    gradeLevel: 1,
    domain: "Writing",
    ixlStyleSkill:
      "Start a sentence with a capital letter and finish it with a full stop.",
    cambridgeStandard:
      "1Wg.01 Use a capital letter and full stop to start and end a sentence.",
    diagnosticTrigger:
      "Student writes a continuous, unpunctuated string of words across the page, demonstrating a complete lack of spatial and grammatical boundary recognition for complete thoughts.",
  },
  {
    id: "ENGL-G1-WRIT-1Wg02",
    gradeLevel: 1,
    domain: "Writing",
    ixlStyleSkill:
      "Use full stops to separate multiple sentences in a piece of writing.",
    cambridgeStandard:
      "1Wg.02 In more extended writing, end some sentences with a full stop.",
    diagnosticTrigger:
      "Student uses the conjunction 'and' repeatedly to link ten discrete actions together into a massive run-on chain, unable to cognitively segment propositions into distinct, punctuated statements.",
  },
  {
    id: "ENGL-G1-WRIT-1Wg03",
    gradeLevel: 1,
    domain: "Writing",
    ixlStyleSkill:
      "Capitalize the word 'I' and the names of people or places.",
    cambridgeStandard:
      "1Wg.03 Use a capital letter for 'I', for proper nouns and to start some sentences in more extended writing.",
    diagnosticTrigger:
      "Student consistently writes the personal pronoun 'I' as a lowercase 'i' or fails to capitalize their own given name, indicating a lack of proper noun orthographic awareness.",
  },
  {
    id: "ENGL-G1-WRIT-1Wg04",
    gradeLevel: 1,
    domain: "Writing",
    ixlStyleSkill:
      "Write complete and simple sentences that make sense.",
    cambridgeStandard:
      "1Wg.04 Write simple sentences.",
    diagnosticTrigger:
      "Student writes fragmented, isolated phrases consisting only of nouns (e.g., 'the big dog') without including any verbs, failing to construct a syntactically complete, active proposition.",
  },
  {
    id: "ENGL-G1-WRIT-1Wg05",
    gradeLevel: 1,
    domain: "Writing",
    ixlStyleSkill:
      "Use 'and' to join words, phrases, or short sentences together.",
    cambridgeStandard:
      "1Wg.05 Use and to join words and clauses.",
    diagnosticTrigger:
      "Student writes highly disjointed, staccato clauses (e.g., 'I ran. I jumped.') and struggles to use basic conjunctions to fluently compound related actions, showing limited syntactic dexterity.",
  },
  {
    id: "ENGL-G1-WRIT-1Wg06",
    gradeLevel: 1,
    domain: "Writing",
    ixlStyleSkill:
      "Choose 'a', 'an', or 'the' correctly when writing sentences.",
    cambridgeStandard:
      "1Wg.06 Use articles the and a or an appropriately in sentences.",
    diagnosticTrigger:
      "Student omits determiners and articles entirely when writing (e.g., 'I see cat'), reflecting poor morphological integration of structural function words.",
  },
  {
    id: "ENGL-G1-WRIT-1Ws01",
    gradeLevel: 1,
    domain: "Writing",
    ixlStyleSkill:
      "Write events in a logical sequence (first, next, last).",
    cambridgeStandard:
      "1Ws.01 Develop a simple sequence of known actions or events, e.g. by ordering sentences and then adding to them.",
    diagnosticTrigger:
      "Student writes narrative events wildly out of chronological order (e.g., writing the resolution before the inciting incident), demonstrating a severe deficit in sequential narrative logic.",
  },
  {
    id: "ENGL-G1-WRIT-1Ws02",
    gradeLevel: 1,
    domain: "Writing",
    ixlStyleSkill:
      "Use basic organizational features like subheadings or labeled diagrams.",
    cambridgeStandard:
      "1Ws.02 Use simple organisational features appropriate to the text type, e.g. subheadings, labelled diagrams.",
    diagnosticTrigger:
      "Student draws a detailed diagram for an informational text but fails to connect text labels to the drawing, unable to grasp the structural formatting required for non-fiction exposition.",
  },
  {
    id: "ENGL-G1-WRIT-1Wc01",
    gradeLevel: 1,
    domain: "Writing",
    ixlStyleSkill:
      "Write simple stories or poems modeled after familiar texts.",
    cambridgeStandard:
      "1Wc.01 Begin to write simple stories and poems, including using the structures of familiar stories and poems.",
    diagnosticTrigger:
      "Student cannot generate a storyline even when provided with a heavily scaffolded, familiar narrative framework, showing a profound deficit in generative narrative ideation.",
  },
  {
    id: "ENGL-G1-WRIT-1Wc02",
    gradeLevel: 1,
    domain: "Writing",
    ixlStyleSkill:
      "Plan writing by speaking ideas aloud before writing.",
    cambridgeStandard:
      "1Wc.02 Plan writing by speaking aloud, e.g. saying sentences or describing a sequence of events before writing them.",
    diagnosticTrigger:
      "Student immediately begins writing without oral rehearsal, quickly hitting a cognitive block and erasing constantly because they lack the working memory to plan syntax and execute motor skills simultaneously.",
  },
  {
    id: "ENGL-G1-WRIT-1Wc03",
    gradeLevel: 1,
    domain: "Writing",
    ixlStyleSkill:
      "Retell a familiar story by writing short sentences or captions.",
    cambridgeStandard:
      "1Wc.03 Develop a short written retelling of a familiar story, e.g. by writing sentences to caption pictures.",
    diagnosticTrigger:
      "Student produces detailed illustrations for a story but is unable to generate even a single descriptive sentence to accompany the image, showing a severe barrier in shifting from visual to linguistic representation.",
  },
  {
    id: "ENGL-G1-WRIT-1Wc04",
    gradeLevel: 1,
    domain: "Writing",
    ixlStyleSkill:
      "Write basic texts for different purposes (e.g., a list, a letter, a story).",
    cambridgeStandard:
      "1Wc.04 Begin to write for a purpose using basic language and features appropriate for the text type.",
    diagnosticTrigger:
      "Student attempts to write an instructional list as a dense, flowing narrative paragraph, unable to switch formatting pragmatics based on the specific utilitarian purpose of the text.",
  },
  {
    id: "ENGL-G1-WRIT-1Wc05",
    gradeLevel: 1,
    domain: "Writing",
    ixlStyleSkill:
      "Include factual information when writing simple non-fiction texts.",
    cambridgeStandard:
      "1Wc.05 Include some relevant information when writing simple non-fiction texts in familiar real-life contexts.",
    diagnosticTrigger:
      "Student inserts fictional, magical, or nonsensical elements into an 'all about animals' factual topic, unable to sustain the cognitive boundaries of objective informational writing.",
  },
  {
    id: "ENGL-G1-WRIT-1Wp01",
    gradeLevel: 1,
    domain: "Writing",
    ixlStyleSkill:
      "Hold a pencil comfortably using an efficient grip.",
    cambridgeStandard:
      "1Wp.01 Develop a comfortable and efficient pencil grip.",
    diagnosticTrigger:
      "Student grasps the pencil with a tight, full-fist palmar grip rather than a dynamic tripod grasp, resulting in heavy, erratic strokes and rapid physical hand fatigue during sustained writing tasks.",
  },
  {
    id: "ENGL-G1-WRIT-1Wp02",
    gradeLevel: 1,
    domain: "Writing",
    ixlStyleSkill:
      "Form lowercase and capital letters correctly with proper size and orientation.",
    cambridgeStandard:
      "1Wp.02 Form lower-case and upper-case letters correctly.",
    diagnosticTrigger:
      "Student produces mirror-written letters, mixes capitals and lowercase randomly within single words, or uses erratic bottom-to-top motor start points, indicating underdeveloped fine motor memory and spatial orientation.",
  },
  {
    id: "ENGL-G1-WRIT-1Wp03",
    gradeLevel: 1,
    domain: "Writing",
    ixlStyleSkill:
      "Begin to join some letters together, especially common digraphs.",
    cambridgeStandard:
      "1Wp.03 Join some letters, including to support use of multi-letter graphemes.",
    diagnosticTrigger:
      "Student spaces letters within a single word so far apart that they visually look like distinct words, failing to physically cluster graphemes to demonstrate cohesive word boundaries.",
  },
  {
    id: "ENGL-G1-WRIT-1Wp04",
    gradeLevel: 1,
    domain: "Writing",
    ixlStyleSkill:
      "Write short answers or lists in response to simple questions about a text.",
    cambridgeStandard:
      "1Wp.04 Record answers to simple questions about texts, e.g. in lists.",
    diagnosticTrigger:
      "Student can easily answer a comprehension question orally but freezes completely when required to record the exact same answer on paper, demonstrating high cognitive friction translating spoken thought into written format.",
  },
  {
    id: "ENGL-G1-WRIT-1Wp05",
    gradeLevel: 1,
    domain: "Writing",
    ixlStyleSkill:
      "Present writing in creative ways, like labeled diagrams or storyboards.",
    cambridgeStandard:
      "1Wp.05 Present text in a range of different ways, e.g. diagrams with typed labels, storyboards with handwritten captions.",
    diagnosticTrigger:
      "Student rigidly writes linear text straight across the page and refuses or struggles to engage in multimodal spatial presentation (like drawing boxes, arrows, or captions), showing a lack of spatial organizational flexibility.",
  },
  {
    id: "ENGL-G1-WRIT-1Wp06",
    gradeLevel: 1,
    domain: "Writing",
    ixlStyleSkill:
      "Read own writing out loud and talk about what was written.",
    cambridgeStandard:
      "1Wp.06 Read own writing aloud and talk about it.",
    diagnosticTrigger:
      "Student cannot read their own writing back immediately after composing it, indicating that the encoding process was purely mechanical symbol-copying without any underlying semantic retention.",
  },
  {
    id: "ENGL-G1-SPKL-1SLm01",
    gradeLevel: 1,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Speak clearly and loudly enough to be understood by peers and teachers.",
    cambridgeStandard:
      "1SLm.01 Speak audibly and clearly with familiar people.",
    diagnosticTrigger:
      "Student mumbles, looks at the floor, or drops vocal volume drastically when asked to share, demonstrating severe expressive anxiety or underdeveloped articulatory confidence.",
  },
  {
    id: "ENGL-G1-SPKL-1SLm02",
    gradeLevel: 1,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Share relevant information to answer questions or explain a topic.",
    cambridgeStandard:
      "1SLm.02 Provide relevant information, as needed.",
    diagnosticTrigger:
      "Student frequently goes off on highly unrelated, tangential topics when asked a direct question, unable to filter out extraneous internal thoughts to provide a concise, relevant verbal response.",
  },
  {
    id: "ENGL-G1-SPKL-1SLm03",
    gradeLevel: 1,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Use descriptive vocabulary to explain events and express feelings.",
    cambridgeStandard:
      "1SLm.03 Use some relevant vocabulary to describe events and feelings.",
    diagnosticTrigger:
      "Student relies entirely on physical pointing, grunting, or overly generalized terms like 'bad' or 'thing' to describe an upsetting event, showing a significant deficit in expressive emotional vocabulary.",
  },
  {
    id: "ENGL-G1-SPKL-1SLm04",
    gradeLevel: 1,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Use body language, gestures, and eye contact to communicate effectively.",
    cambridgeStandard:
      "1SLm.04 Show some use of non-verbal communication techniques.",
    diagnosticTrigger:
      "Student speaks with a completely flat affect, making zero eye contact and using no hand gestures, which severely impairs their ability to convey emphasis, emotion, or social engagement.",
  },
  {
    id: "ENGL-G1-SPKL-1SLm05",
    gradeLevel: 1,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Adjust tone of voice and notice the listener’s body language during conversation.",
    cambridgeStandard:
      "1SLm.05 Show some awareness of the listener, e.g. by varying tone to engage them, by responding to their non-verbal cues.",
    diagnosticTrigger:
      "Student continues to talk at length about a hyper-fixated topic without noticing that the listener has physically turned away or looks confused, indicating poor pragmatic monitoring of conversational partners.",
  },
  {
    id: "ENGL-G1-SPKL-1SLs01",
    gradeLevel: 1,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Listen carefully and follow a sequence of simple spoken instructions.",
    cambridgeStandard:
      "1SLs.01 Listen and respond appropriately, including following a sequence of simple instructions.",
    diagnosticTrigger:
      "Student perfectly executes the first step of a multi-step verbal instruction but immediately forgets the rest, indicating a severely bottlenecked auditory working memory capacity.",
  },
  {
    id: "ENGL-G1-SPKL-1SLs02",
    gradeLevel: 1,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Ask on-topic questions about what was just heard or read.",
    cambridgeStandard:
      "1SLs.02 Ask simple questions about what is heard or read.",
    diagnosticTrigger:
      "Student never asks clarifying questions when a read-aloud is obviously confusing, or asks totally unrelated questions, demonstrating passive listening without active semantic monitoring.",
  },
  {
    id: "ENGL-G1-SPKL-1SLg01",
    gradeLevel: 1,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Work cooperatively with peers in a small group setting.",
    cambridgeStandard:
      "1SLg.01 Work with others in a group.",
    diagnosticTrigger:
      "Student refuses to share materials, physically turns their back to the group, or dictates commands without listening, demonstrating significant barriers to collaborative, reciprocal social interaction.",
  },
  {
    id: "ENGL-G1-SPKL-1SLg02",
    gradeLevel: 1,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Listen to and acknowledge the ideas and opinions of group members.",
    cambridgeStandard:
      "1SLg.02 Show understanding of the opinions of others.",
    diagnosticTrigger:
      "Student becomes highly agitated, defensive, or argumentative when a peer suggests an idea different from their own, showing rigid thinking and an inability to process alternate perspectives.",
  },
  {
    id: "ENGL-G1-SPKL-1SLg03",
    gradeLevel: 1,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Listen to others during discussions without interrupting.",
    cambridgeStandard:
      "1SLg.03 During a discussion, listen to others without interrupting.",
    diagnosticTrigger:
      "Student constantly blurts out answers or talks loudly over peers during circle time, exhibiting poor impulse control and underdeveloped conversational turn-taking inhibition.",
  },
  {
    id: "ENGL-G1-SPKL-1SLg04",
    gradeLevel: 1,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Take turns speaking to share personal feelings and ideas.",
    cambridgeStandard:
      "1SLg.04 Take turns in speaking, expressing own feelings and ideas.",
    diagnosticTrigger:
      "Student completely withdraws during group sharing and relies heavily on peers to speak for them, indicating severe reluctance or inability to socially initiate expressive language.",
  },
  {
    id: "ENGL-G1-SPKL-1SLp01",
    gradeLevel: 1,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Re-read sentences aloud smoothly and with expressive voice.",
    cambridgeStandard:
      "1SLp.01 Re-read sentences aloud with some fluency and expression.",
    diagnosticTrigger:
      "Student reads entirely in a robotic, monotone voice, halting awkwardly in the middle of phrases regardless of punctuation, demonstrating a failure to process syntactic phrasing into natural prosody.",
  },
  {
    id: "ENGL-G1-SPKL-1SLp02",
    gradeLevel: 1,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Recite simple poems out loud, matching the rhythm and beat.",
    cambridgeStandard:
      "1SLp.02 Recite simple poems, showing awareness of rhythm.",
    diagnosticTrigger:
      "Student recites a poem completely out of sync with the intended beat, dropping the rhythmic cadence entirely and speaking it flatly like a disjointed prose list.",
  },
  {
    id: "ENGL-G1-SPKL-1SLp03",
    gradeLevel: 1,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Pause appropriately at full stops when reading aloud.",
    cambridgeStandard:
      "1SLp.03 Pause at full stops when reading aloud.",
    diagnosticTrigger:
      "Student barrels rapidly through periods without taking a breath, severely compromising the listener's comprehension because they are not visually decoding punctuation as a motor-pause command.",
  },
  {
    id: "ENGL-G1-SPKL-1SLp04",
    gradeLevel: 1,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Act out characters or situations through imaginative role-play.",
    cambridgeStandard:
      "1SLp.04 Engage in imaginative play, enacting simple characters or situations.",
    diagnosticTrigger:
      "Student relies solely on literal, functional uses of objects during free play (e.g., only rolling a car, never flying it) and cannot pretend to be a character, demonstrating a delay in symbolic or dramatic cognitive representation.",
  },
  {
    id: "ENGL-G1-SPKL-1SLp05",
    gradeLevel: 1,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Make a simple statement about oneself in a familiar setting.",
    cambridgeStandard:
      "1SLp.05 Make a simple personal statement in a familiar context.",
    diagnosticTrigger:
      "Student is unable to generate a basic 'I like...' or 'I am...' declarative sentence when prompted, showing difficulty mapping internal states to basic expressive syntax.",
  },
  {
    id: "ENGL-G1-SPKL-1SLr01",
    gradeLevel: 1,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Talk about personal activities and explain what was enjoyable.",
    cambridgeStandard:
      "1SLr.01 Talk about own activities, including what they enjoyed.",
    diagnosticTrigger:
      "Student can name a physical activity they completed but cannot provide any evaluative or emotional comment (like 'it was fun because...'), lacking the meta-cognitive ability to reflect verbally on personal experiences.",
  },
  {
    id: "ENGL-G1-SPKL-1SLr02",
    gradeLevel: 1,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Identify how someone might be feeling based on their body language or facial expression.",
    cambridgeStandard:
      "1SLr.02 Suggest how someone's non-verbal communication reflects their feelings.",
    diagnosticTrigger:
      "Student cannot identify that a character with a downturned mouth and tightly crossed arms is upset or angry, demonstrating a critical deficit in decoding non-verbal socio-emotional visual cues.",
  },
];
