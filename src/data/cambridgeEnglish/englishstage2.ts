import type { CurriculumObjective } from '../curriculumTypes';

/**
 * Cambridge Primary English / Literacy — Stage 2 (Grade 2).
 *
 * `id` values embed the official strand code with Cambridge casing (e.g. `2Rv` not `2RV`),
 * matching notation like `2Rv.01` in the framework — e.g. `ENGL-G2-READ-2Rv01`.
 */
export const cambridgeEnglishStage2: CurriculumObjective[] = [
  {
    id: "ENGL-G2-READ-2Rw01",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Recognize that the same letters can make different sounds in different words (e.g., 'ow' in 'how' and 'low').",
    cambridgeStandard:
      "2Rw.01 Identify common ways in which graphemes can be pronounced differently, e.g. how and low; hot and cold.",
    diagnosticTrigger:
      "Student rigidly applies a single phonetic rule to a grapheme (e.g., reading 'low' to rhyme with 'how'), demonstrating an inability to flexibly switch between alternative pronunciations based on orthographic context.",
  },
  {
    id: "ENGL-G2-READ-2Rw02",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Read words with split digraphs or 'magic e' (e.g., made, like).",
    cambridgeStandard:
      "2Rw.02 Read words with split digraphs, e.g. made, like.",
    diagnosticTrigger:
      "Student pronounces a split digraph word with a short vowel sound (e.g., reading 'made' as 'mad'), completely ignoring the terminal 'e' as a spatial signal to lengthen the preceding vowel phoneme.",
  },
  {
    id: "ENGL-G2-READ-2Rw03",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Read words with common prefixes (un-, dis-, re-) and suffixes (-er, -est, -ly, -y, -ful).",
    cambridgeStandard:
      "2Rw.03 Read words with common prefixes and suffixes, including un-, dis-, re-, -er, -est, -ly, -y and -ful.",
    diagnosticTrigger:
      "Student attempts to sound out a morphologically complex word as one long phonetic string, rather than structurally segmenting the word to isolate the known prefix or suffix from the stable root.",
  },
  {
    id: "ENGL-G2-READ-2Rw04",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Read familiar words quickly without sounding them out.",
    cambridgeStandard:
      "2Rw.04 Read familiar words quickly and accurately, usually without audible sounding and blending.",
    diagnosticTrigger:
      "Student continues to laboriously sound out every letter of high-frequency words they have read many times, indicating a failure to transition from procedural decoding to automatic whole-word orthographic recognition.",
  },
  {
    id: "ENGL-G2-READ-2Rw05",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Use phonics knowledge to sound out unfamiliar words.",
    cambridgeStandard:
      "2Rw.05 Use phonic knowledge to decode unfamiliar words.",
    diagnosticTrigger:
      "Student guesses wildly at an unfamiliar word based on its first letter and the picture, demonstrating a complete avoidance of applying systematic, sequential phonetic decoding strategies.",
  },
  {
    id: "ENGL-G2-READ-2Rw06",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Break down multisyllabic and compound words into smaller parts to read them.",
    cambridgeStandard:
      "2Rw.06 Read multi-syllabic and compound words by segmenting them into syllables.",
    diagnosticTrigger:
      "Student attempts to sound out a long word like 'butterfly' as a single, overwhelming sequence of phonemes rather than visually chunking it into its constituent syllabic parts.",
  },
  {
    id: "ENGL-G2-READ-2Rw07",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Recognize and read sight words, including common homophones (e.g., to/two/too).",
    cambridgeStandard:
      "2Rw.07 Extend the range of common words recognised on sight, including homophones and near-homophones.",
    diagnosticTrigger:
      "Student reads a sentence containing a homophone but is unable to determine the correct meaning from context, indicating they have only memorized the phonetic sound, not the distinct orthographic patterns.",
  },
  {
    id: "ENGL-G2-READ-2Rv01",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Guess the meaning of unfamiliar words using context clues.",
    cambridgeStandard:
      "2Rv.01 Identify possible meanings of unfamiliar words encountered in reading.",
    diagnosticTrigger:
      "Student stops reading entirely when they encounter an unknown word and fails to read the surrounding sentence to infer its meaning, showing a lack of contextual semantic problem-solving.",
  },
  {
    id: "ENGL-G2-READ-2Rv02",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Collect interesting words from texts to use in writing.",
    cambridgeStandard:
      "2Rv.02 Identify and record interesting and significant words from texts to inform own writing.",
    diagnosticTrigger:
      "Student exclusively selects basic, high-frequency nouns when asked to collect 'interesting' words, unable to recognize or appreciate the impact of more descriptive adjectives or powerful verbs.",
  },
  {
    id: "ENGL-G2-READ-2Rv03",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Use the first letter of a word to find it in a simple dictionary or glossary.",
    cambridgeStandard:
      "2Rv.03 Use the initial letter to organise words in alphabetical order, and to locate words in simple dictionaries and glossaries.",
    diagnosticTrigger:
      "Student scans a dictionary page randomly from top to bottom rather than using the initial letter to systematically navigate the alphabetically ordered structure.",
  },
  {
    id: "ENGL-G2-READ-2Rv04",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Notice how sounds and descriptive words like adjectives create interest in a text.",
    cambridgeStandard:
      "2Rv.04 Explore and comment on sounds and words in texts, including adjectives.",
    diagnosticTrigger:
      "Student can identify an adjective but cannot explain how it enhances the noun or creates a more vivid mental image for the reader.",
  },
  {
    id: "ENGL-G2-READ-2Rv05",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Identify different ways sentences can begin, especially with time-related words.",
    cambridgeStandard:
      "2Rv.05 Explore different ways of beginning sentences in texts, including using language of time.",
    diagnosticTrigger:
      "Student reads a text with varied sentence openings but is unable to recognize the pattern or purpose, showing a lack of awareness of how authors use syntax to structure narrative time.",
  },
  {
    id: "ENGL-G2-READ-2Rg01",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Use punctuation like speech marks to read with expression.",
    cambridgeStandard:
      "2Rg.01 Show understanding of punctuation, including speech marks, and simple grammar when re-reading text.",
    diagnosticTrigger:
      "Student reads dialogue in a flat, narrative monotone, failing to use quotation marks as a visual cue to change vocal tone or embody a character's voice.",
  },
  {
    id: "ENGL-G2-READ-2Rg02",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Understand the difference between a full stop (telling) and a question mark (asking).",
    cambridgeStandard:
      "2Rg.02 Explore in texts, and understand, the differences in use of full stops and question marks.",
    diagnosticTrigger:
      "Student reads a question with falling intonation as if it were a statement, ignoring the terminal question mark as a prosodic cue to raise their pitch.",
  },
  {
    id: "ENGL-G2-READ-2Rg03",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Understand how connecting words like 'and', 'but', 'because', 'if', and 'when' link ideas.",
    cambridgeStandard:
      "2Rg.03 Explore in texts sentences that contain and, but, because, if, when.",
    diagnosticTrigger:
      "Student reads a sentence with a causal connective like 'because' but cannot explain the cause-and-effect relationship between the two joined clauses.",
  },
  {
    id: "ENGL-G2-READ-2Rg04",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Recognize the grammar of commands and questions.",
    cambridgeStandard:
      "2Rg.04 Explore in texts, and understand, the grammar of commands/instructions and questions.",
    diagnosticTrigger:
      "Student identifies a question by its question mark but cannot identify a command that lacks one, failing to recognize the imperative verb form as a grammatical indicator.",
  },
  {
    id: "ENGL-G2-READ-2Rg05",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Identify nouns, noun phrases, adjectives, and quantifiers (e.g., some, most, all).",
    cambridgeStandard:
      "2Rg.05 Explore in texts examples of nouns and noun phrases, including use of common adjectives and simple quantifiers (e.g. some, most, all).",
    diagnosticTrigger:
      "Student can identify a simple noun but not a full noun phrase, failing to recognize that adjectives and quantifiers function as a cohesive unit to modify the noun.",
  },
  {
    id: "ENGL-G2-READ-2Rg06",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Understand how pronouns (he, she, they) replace nouns in a text.",
    cambridgeStandard:
      "2Rg.06 Explore examples of pronouns in texts, including their purpose and how they agree grammatically with verbs.",
    diagnosticTrigger:
      "Student becomes confused about who is performing an action when a pronoun is used, unable to trace the pronoun back to its original noun antecedent.",
  },
  {
    id: "ENGL-G2-READ-2Rs01",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Discuss the sequence of events or ideas in a text.",
    cambridgeStandard:
      "2Rs.01 Talk about the sequence of events or ideas in a text.",
    diagnosticTrigger:
      "Student can recall individual facts from a text but presents them in a haphazard order, showing an inability to reconstruct the logical or chronological flow of the author's argument.",
  },
  {
    id: "ENGL-G2-READ-2Rs02",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Recognize the structural features of different text types like stories and poems.",
    cambridgeStandard:
      "2Rs.02 Explore and recognise the features of text structure in a range of different fiction and non-fiction texts, including simple poems.",
    diagnosticTrigger:
      "Student identifies a poem as a 'story' because it contains characters, failing to recognize the structural features of line breaks, stanzas, and rhyme schemes that define the poetic form.",
  },
  {
    id: "ENGL-G2-READ-2Rs03",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Use subheadings and labeled diagrams to find information in a text.",
    cambridgeStandard:
      "2Rs.03 Explore and recognise organisational features that help the reader to find information in texts, including subheadings and labelled diagrams.",
    diagnosticTrigger:
      "Student reads an entire non-fiction article from start to finish to find one specific fact, completely ignoring bolded subheadings that would allow for efficient scanning and information retrieval.",
  },
  {
    id: "ENGL-G2-READ-2Ri01",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Identify whether a text is fiction or non-fiction.",
    cambridgeStandard:
      "2Ri.01 Begin to distinguish between fiction and non-fiction texts.",
    diagnosticTrigger:
      "Student classifies a realistic fiction story as non-fiction simply because it features humans and not talking animals, lacking the ability to evaluate the narrative for fabricated plot elements.",
  },
  {
    id: "ENGL-G2-READ-2Ri02",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Read simple stories and poems, noticing how pictures add to the meaning.",
    cambridgeStandard:
      "2Ri.02 Read and explore a range of simple stories and poems, including identifying the contribution of any visual elements.",
    diagnosticTrigger:
      "Student describes the text and the picture as two separate, unrelated entities, failing to synthesize them to understand how the illustration enhances or clarifies the written narrative.",
  },
  {
    id: "ENGL-G2-READ-2Ri03",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Identify the basic features of a story, like characters and setting.",
    cambridgeStandard:
      "2Ri.03 Identify the characteristics of simple stories.",
    diagnosticTrigger:
      "Student can retell the plot but cannot name the main character or describe the setting, indicating a failure to extract and categorize core narrative elements.",
  },
  {
    id: "ENGL-G2-READ-2Ri04",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Read and explore a variety of simple non-fiction texts.",
    cambridgeStandard:
      "2Ri.04 Read and explore a range of simple non-fiction text types.",
    diagnosticTrigger:
      "Student expresses confusion while reading an informational text, expecting a plot and resolution, demonstrating an inability to switch cognitive reading schemas from narrative to expository.",
  },
  {
    id: "ENGL-G2-READ-2Ri05",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Recognize that different non-fiction texts have different purposes and features.",
    cambridgeStandard:
      "2Ri.05 Begin to show awareness that different non-fiction text types have different purposes and begin to identify their features.",
    diagnosticTrigger:
      "Student cannot differentiate between a recipe (procedural) and a biography (descriptive), failing to identify the author's communicative intent based on structural and linguistic cues.",
  },
  {
    id: "ENGL-G2-READ-2Ri06",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Find and understand explicitly stated information in simple texts.",
    cambridgeStandard:
      "2Ri.06 Explore explicit meanings in simple texts.",
    diagnosticTrigger:
      "Student is unable to answer a literal question when the answer is stated directly in the text, indicating a significant breakdown in basic reading comprehension and short-term memory retrieval.",
  },
  {
    id: "ENGL-G2-READ-2Ri07",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Retell a story by identifying the main events in order.",
    cambridgeStandard:
      "2Ri.07 Identify and use the main events to retell a story verbally.",
    diagnosticTrigger:
      "Student's verbal retelling is a jumbled mix of minor details and major plot points presented out of sequence, demonstrating a weakness in identifying narrative hierarchy and temporal structure.",
  },
  {
    id: "ENGL-G2-READ-2Ri08",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Describe the setting and characters in a story.",
    cambridgeStandard:
      "2Ri.08 Describe story settings and characters.",
    diagnosticTrigger:
      "Student retells the action of a story but cannot describe the main character's appearance or personality, indicating a failure to integrate descriptive details into their mental model of the character.",
  },
  {
    id: "ENGL-G2-READ-2Ri09",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Find information in tables and labeled diagrams.",
    cambridgeStandard:
      "2Ri.09 Find information from simple visual sources, including tables and labelled diagrams.",
    diagnosticTrigger:
      "Student scans the main paragraph text repeatedly when the requested information is clearly organized in an adjacent table, showing an inability to read and interpret non-prose data formats.",
  },
  {
    id: "ENGL-G2-READ-2Ri10",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Understand meanings that are implied but not directly stated.",
    cambridgeStandard:
      "2Ri.10 Explore implicit meanings in simple texts.",
    diagnosticTrigger:
      "Student cannot infer a character's sadness from the text 'Tears rolled down her cheeks,' requiring the explicit sentence 'She was sad' to understand the emotion.",
  },
  {
    id: "ENGL-G2-READ-2Ri11",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Predict how a story will end based on events that have already happened.",
    cambridgeStandard:
      "2Ri.11 Predict story endings.",
    diagnosticTrigger:
      "Student's prediction for a story's ending is completely disconnected from the established characters and plot, showing a failure to use causal reasoning to anticipate narrative direction.",
  },
  {
    id: "ENGL-G2-READ-2Ri12",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Make simple inferences based on what characters say and do.",
    cambridgeStandard:
      "2Ri.12 Make simple inferences based on what is said or done in a text.",
    diagnosticTrigger:
      "Student cannot explain a character's motivation for an action, relying only on the literal description of the event rather than inferring the underlying intent.",
  },
  {
    id: "ENGL-G2-READ-2Ri13",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Answer simple, direct questions about a short text.",
    cambridgeStandard:
      "2Ri.13 Answer simple questions from reading a short text.",
    diagnosticTrigger:
      "Student rereads the text multiple times but is still unable to locate an explicit piece of information, indicating significant difficulty with text scanning and information retrieval.",
  },
  {
    id: "ENGL-G2-READ-2Ri14",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Use a contents page to find information in a book.",
    cambridgeStandard:
      "2Ri.14 Locate relevant information in texts, including using a contents page.",
    diagnosticTrigger:
      "Student flips through a book page by page from the beginning to find a specific chapter, completely ignoring the contents page as a navigational tool.",
  },
  {
    id: "ENGL-G2-READ-2Ri15",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Explain answers to questions by referring back to the text.",
    cambridgeStandard:
      "2Ri.15 Answer questions about texts with some explanation of thinking.",
    diagnosticTrigger:
      "Student provides a correct answer to an inferential question but when asked 'Why do you think that?' they respond 'I don't know,' showing an inability to consciously trace their reasoning back to specific textual clues.",
  },
  {
    id: "ENGL-G2-READ-2Ri16",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Identify and discuss patterns like rhyme and repetition in stories and poems.",
    cambridgeStandard:
      "2Ri.16 Talk about patterns in simple stories and poems, e.g. rhyme, repetition.",
    diagnosticTrigger:
      "Student reads a rhyming couplet without noticing the sound similarity, demonstrating low phonological sensitivity to the musicality and patterns in literary language.",
  },
  {
    id: "ENGL-G2-READ-2Ra01",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Show enjoyment and engage actively with a variety of texts.",
    cambridgeStandard:
      "2Ra.01 Enjoy reading and hearing a range of simple stories, poems and non-fiction texts.",
    diagnosticTrigger:
      "Student exhibits consistent off-task behavior such as fidgeting or looking around the room during read-alouds, indicating a lack of engagement and listening stamina.",
  },
  {
    id: "ENGL-G2-READ-2Ra02",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Read silently sometimes, and other times read aloud.",
    cambridgeStandard:
      "2Ra.02 Begin to read texts silently as well as aloud.",
    diagnosticTrigger:
      "Student moves their lips and subvocalizes constantly while reading silently, indicating an over-reliance on phonological processing and a difficulty with purely orthographic, high-speed reading.",
  },
  {
    id: "ENGL-G2-READ-2Ra03",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Discuss texts and give reasons for what you like or dislike.",
    cambridgeStandard:
      "2Ra.03 Discuss texts read or heard, including giving reasons for likes and dislikes.",
    diagnosticTrigger:
      "Student can state they liked or disliked a story but cannot articulate a single specific reason, providing only vague responses like 'it was good,' showing underdeveloped evaluative and expressive skills.",
  },
  {
    id: "ENGL-G2-READ-2Ra04",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Choose books to read for enjoyment.",
    cambridgeStandard:
      "2Ra.04 Make choices about books to read for pleasure.",
    diagnosticTrigger:
      "Student spends an excessive amount of time wandering the library and is unable to select a book independently, demonstrating anxiety or an inability to make choices based on personal interest.",
  },
  {
    id: "ENGL-G2-READ-2Ra05",
    gradeLevel: 2,
    domain: "Reading",
    ixlStyleSkill:
      "Recognize that stories can be set in different times and places.",
    cambridgeStandard:
      "2Ra.05 Recognise that stories may be from different times and places.",
    diagnosticTrigger:
      "Student expresses confusion about a historical story, questioning why the characters don't use modern technology, indicating difficulty in understanding that settings can differ from their own lived experience.",
  },
  {
    id: "ENGL-G2-WRIT-2Ww01",
    gradeLevel: 2,
    domain: "Writing",
    ixlStyleSkill:
      "Use different spelling patterns for common sounds, like 'ai' and 'ay' for the long A sound.",
    cambridgeStandard:
      "2Ww.01 Explore and use different spellings of common phonemes, including long vowel phonemes, e.g. day, rain, made, great; apple, travel, metal.",
    diagnosticTrigger:
      "Student spells words using only the most basic sound-letter correspondence (e.g., spelling 'rain' as 'ran' or 'rayn' every time), failing to apply varying orthographic patterns for long vowel sounds.",
  },
  {
    id: "ENGL-G2-WRIT-2Ww02",
    gradeLevel: 2,
    domain: "Writing",
    ixlStyleSkill:
      "Spell words using split digraphs or 'magic e' (e.g., made, like).",
    cambridgeStandard:
      "2Ww.02 Explore and use spellings of words with split digraphs, e.g. made, like.",
    diagnosticTrigger:
      "Student consistently leaves off the final 'e' in split digraph words (e.g., spelling 'made' as 'mad' or 'like' as 'lik'), demonstrating a failure to apply the morphological rule that lengthens the preceding vowel.",
  },
  {
    id: "ENGL-G2-WRIT-2Ww03",
    gradeLevel: 2,
    domain: "Writing",
    ixlStyleSkill:
      "Use known spelling patterns to spell rhyming words (e.g., whale, snail).",
    cambridgeStandard:
      "2Ww.03 Relate rhyme to known spelling patterns, e.g. whale, snail.",
    diagnosticTrigger:
      "Student spells rhyming words using completely different phonetic approaches despite recognizing the rhyme (e.g., spelling 'snail' as 'snale' even after correctly spelling 'pail'), failing to map analogical spelling patterns.",
  },
  {
    id: "ENGL-G2-WRIT-2Ww04",
    gradeLevel: 2,
    domain: "Writing",
    ixlStyleSkill:
      "Spell common irregular plural nouns correctly (e.g., mice, sheep).",
    cambridgeStandard:
      "2Ww.04 Use common irregular plurals, e.g. mice, sheep.",
    diagnosticTrigger:
      "Student applies standard plural 's' or 'es' endings to irregular nouns (e.g., writing 'mouses' or 'sheeps'), overgeneralizing morphological rules and failing to retrieve the irregular forms from memory.",
  },
  {
    id: "ENGL-G2-WRIT-2Ww05",
    gradeLevel: 2,
    domain: "Writing",
    ixlStyleSkill:
      "Add endings like -s, -ed, and -ing to verbs without changing the root word.",
    cambridgeStandard:
      "2Ww.05 Explore and use verbs with endings -s, -ed and -ing where no change is needed to the root, and understand the effect on the meaning of a verb of adding these endings.",
    diagnosticTrigger:
      "Student writes the root verb instead of the inflected form (e.g., writing 'jump' instead of 'jumped' for a past action), showing a lack of morphological awareness regarding tense.",
  },
  {
    id: "ENGL-G2-WRIT-2Ww06",
    gradeLevel: 2,
    domain: "Writing",
    ixlStyleSkill:
      "Spell words with common prefixes (un-, dis-) and suffixes (-er, -est, -ful, -ly).",
    cambridgeStandard:
      "2Ww.06 Spell some words with common prefixes and suffixes, including un-, dis-, -er, -est, -ful and -ly.",
    diagnosticTrigger:
      "Student attempts to spell morphologically complex words purely phonetically (e.g., spelling 'helpful' as 'helpfoll'), failing to recognize and apply standard suffix letter strings.",
  },
  {
    id: "ENGL-G2-WRIT-2Ww07",
    gradeLevel: 2,
    domain: "Writing",
    ixlStyleSkill:
      "Spell common homophones correctly based on their meaning (e.g., tail/tale, blew/blue).",
    cambridgeStandard:
      "2Ww.07 Explore and use words which sound the same but have different spellings of long vowels (homophones), e.g. tail and tale, stare and stair, blew and blue.",
    diagnosticTrigger:
      "Student repeatedly uses the wrong spelling of a homophone for the context (e.g., writing 'The dog wagged its tale'), indicating a failure to orthographically distinguish words based on semantic meaning.",
  },
  {
    id: "ENGL-G2-WRIT-2Ww08",
    gradeLevel: 2,
    domain: "Writing",
    ixlStyleSkill:
      "Use phonics and spelling patterns to spell common regular words correctly.",
    cambridgeStandard:
      "2Ww.08 Use knowledge of phonemes and spelling patterns to spell a range of common regular words correctly.",
    diagnosticTrigger:
      "Student writes strings of random letters for decodable words, demonstrating a severe breakdown in phoneme-to-grapheme encoding and sequential spelling strategies.",
  },
  {
    id: "ENGL-G2-WRIT-2Ww09",
    gradeLevel: 2,
    domain: "Writing",
    ixlStyleSkill:
      "Spell common exception and sight words accurately.",
    cambridgeStandard:
      "2Ww.09 Spell a range of common exception words accurately.",
    diagnosticTrigger:
      "Student consistently misspells high-frequency exception words phonetically (e.g., writing 'wuz' for 'was' or 'sed' for 'said'), failing to commit these irregular visual strings to long-term orthographic memory.",
  },
  {
    id: "ENGL-G2-WRIT-2Ww10",
    gradeLevel: 2,
    domain: "Writing",
    ixlStyleSkill:
      "Use spelling logs and ask for help to spell unfamiliar words.",
    cambridgeStandard:
      "2Ww.10 Ask for support in spelling unfamiliar words and use spelling logs to support future writing.",
    diagnosticTrigger:
      "Student avoids using new or complex vocabulary in their writing entirely because they are unsure of the spelling, rather than utilizing resources like dictionaries or spelling logs, indicating risk-aversion.",
  },
  {
    id: "ENGL-G2-WRIT-2Wv01",
    gradeLevel: 2,
    domain: "Writing",
    ixlStyleSkill:
      "Use topic-specific vocabulary when writing about familiar subjects.",
    cambridgeStandard:
      "2Wv.01 Use vocabulary relevant to a familiar topic.",
    diagnosticTrigger:
      "Student relies heavily on vague, non-specific nouns (like 'stuff' or 'things') when writing about a defined topic, showing poor lexical retrieval for specialized vocabulary.",
  },
  {
    id: "ENGL-G2-WRIT-2Wv02",
    gradeLevel: 2,
    domain: "Writing",
    ixlStyleSkill:
      "Use a variety of adjectives to describe characters and settings in a story.",
    cambridgeStandard:
      "2Wv.02 In story writing, use a range of adjectives to describe characters and settings.",
    diagnosticTrigger:
      "Student writes narratives using only bare noun-verb structures without any descriptive language, failing to use adjectives to build sensory details for the reader.",
  },
  {
    id: "ENGL-G2-WRIT-2Wv03",
    gradeLevel: 2,
    domain: "Writing",
    ixlStyleSkill:
      "Vary how sentences begin, using time words like 'Suddenly' or 'That morning'.",
    cambridgeStandard:
      "2Wv.03 Begin to vary sentence openings, including using language of time, e.g. Suddenly …, That morning …",
    diagnosticTrigger:
      "Student begins every single sentence in a narrative with 'Then' or 'And', demonstrating a lack of syntactic variety and poor use of temporal transition phrases.",
  },
  {
    id: "ENGL-G2-WRIT-2Wv04",
    gradeLevel: 2,
    domain: "Writing",
    ixlStyleSkill:
      "Choose interesting words and phrases to describe people and places vividly.",
    cambridgeStandard:
      "2Wv.04 Choose and use interesting words and phrases, including to describe people and places.",
    diagnosticTrigger:
      "Student consistently defaults to overused, generic adjectives like 'good' or 'nice' rather than selecting more precise or evocative vocabulary, showing a lack of descriptive ambition.",
  },
  {
    id: "ENGL-G2-WRIT-2Wv05",
    gradeLevel: 2,
    domain: "Writing",
    ixlStyleSkill:
      "Keep a list of interesting words and use them to improve your writing.",
    cambridgeStandard:
      "2Wv.05 Use own lists of interesting and significant words to extend the range of vocabulary used in written work.",
    diagnosticTrigger:
      "Student never incorporates newly learned or collected vocabulary into their independent writing tasks, compartmentalizing new words rather than applying them expressively.",
  },
  {
    id: "ENGL-G2-WRIT-2Wg01",
    gradeLevel: 2,
    domain: "Writing",
    ixlStyleSkill:
      "Use capital letters, full stops, and question marks correctly in simple sentences.",
    cambridgeStandard:
      "2Wg.01 Use capital letters, full stops and question marks correctly in simple sentences.",
    diagnosticTrigger:
      "Student writes interrogative sentences but ends them with a full stop instead of a question mark, demonstrating a failure to match end punctuation to the syntactic function of the sentence.",
  },
  {
    id: "ENGL-G2-WRIT-2Wg02",
    gradeLevel: 2,
    domain: "Writing",
    ixlStyleSkill:
      "Use commas to separate items in a list.",
    cambridgeStandard:
      "2Wg.02 Explore and use commas to separate items in lists.",
    diagnosticTrigger:
      "Student uses 'and' between every single item in a series (e.g., 'apples and bananas and grapes') instead of using commas to separate list elements efficiently.",
  },
  {
    id: "ENGL-G2-WRIT-2Wg03",
    gradeLevel: 2,
    domain: "Writing",
    ixlStyleSkill:
      "Include direct speech in writing, starting a new line for each new speaker.",
    cambridgeStandard:
      "2Wg.03 Begin to include direct speech in writing, using a new line for each speaker.",
    diagnosticTrigger:
      "Student writes dialogue for multiple characters clumped together in a single paragraph, completely failing to use line breaks as structural cues to indicate a change in speaker.",
  },
  {
    id: "ENGL-G2-WRIT-2Wg04",
    gradeLevel: 2,
    domain: "Writing",
    ixlStyleSkill:
      "Write clear statements, commands, and questions.",
    cambridgeStandard:
      "2Wg.04 Write clear statements, commands/instructions and questions.",
    diagnosticTrigger:
      "Student attempts to write an instruction but phrases it as a passive statement rather than using an imperative verb structure, showing confusion about grammatical mood.",
  },
  {
    id: "ENGL-G2-WRIT-2Wg05",
    gradeLevel: 2,
    domain: "Writing",
    ixlStyleSkill:
      "Write simple and multi-clause sentences using 'and', 'but', or 'or'.",
    cambridgeStandard:
      "2Wg.05 Write simple sentences, and multi-clause sentences using and, but, or.",
    diagnosticTrigger:
      "Student writes only short, disjointed simple sentences and never attempts to compound related ideas using basic coordinating conjunctions, limiting syntactic fluidity.",
  },
  {
    id: "ENGL-G2-WRIT-2Wg06",
    gradeLevel: 2,
    domain: "Writing",
    ixlStyleSkill:
      "Write longer sentences using connecting words like 'because', 'if', and 'when'.",
    cambridgeStandard:
      "2Wg.06 Begin to write multi-clause sentences using simple connectives, e.g. because, if, when.",
    diagnosticTrigger:
      "Student writes two related statements (e.g., 'I was wet. It rained.') without using a subordinating conjunction to establish the causal or temporal relationship, indicating weak syntactic linkage.",
  },
  {
    id: "ENGL-G2-WRIT-2Wg07",
    gradeLevel: 2,
    domain: "Writing",
    ixlStyleSkill:
      "Add suffixes like -s, -ing, and -ed to verbs to show present and past tenses.",
    cambridgeStandard:
      "2Wg.07 Begin to use suffixes -s, -ing and -ed appropriately for present and past verb forms in sentences.",
    diagnosticTrigger:
      "Student writes narrative events that have already happened using present-tense verb forms, demonstrating a failure to apply the '-ed' suffix to establish a consistent past tense.",
  },
  {
    id: "ENGL-G2-WRIT-2Wg08",
    gradeLevel: 2,
    domain: "Writing",
    ixlStyleSkill:
      "Use simple quantifiers like 'some', 'most', or 'all' correctly in sentences.",
    cambridgeStandard:
      "2Wg.08 Use simple quantifiers appropriately for the context, e.g. some, most, all.",
    diagnosticTrigger:
      "Student omits quantifiers entirely or uses them illogically (e.g., writing 'I ate all the cake' when describing eating a single slice), showing poor semantic control of quantity modifiers.",
  },
  {
    id: "ENGL-G2-WRIT-2Wg09",
    gradeLevel: 2,
    domain: "Writing",
    ixlStyleSkill:
      "Use pronouns to replace nouns and make sure they match the verbs correctly.",
    cambridgeStandard:
      "2Wg.09 Use pronouns in writing, and ensure grammatical agreement of nouns and pronouns with verbs.",
    diagnosticTrigger:
      "Student writes sentences with severe pronoun-verb disagreement (e.g., 'They is running' or 'She are happy'), indicating a breakdown in morphosyntactic agreement rules.",
  },
  {
    id: "ENGL-G2-WRIT-2Wg10",
    gradeLevel: 2,
    domain: "Writing",
    ixlStyleSkill:
      "Use adjectives, including comparative and superlative forms (e.g., bigger, biggest).",
    cambridgeStandard:
      "2Wg.10 Use common adjectives appropriately in sentences, including simple comparative and superlative forms.",
    diagnosticTrigger:
      "Student uses 'more' or 'most' incorrectly with single-syllable adjectives (e.g., writing 'more big' instead of 'bigger'), failing to apply the correct morphological comparative suffix.",
  },
  {
    id: "ENGL-G2-WRIT-2Ws01",
    gradeLevel: 2,
    domain: "Writing",
    ixlStyleSkill:
      "Write events or ideas in order, creating a story with a clear beginning, middle, and end.",
    cambridgeStandard:
      "2Ws.01 Write a sequence of events or ideas, including stories with a beginning, middle and end.",
    diagnosticTrigger:
      "Student writes a narrative that abruptly ends mid-action without any resolution, demonstrating a failure to structure and complete the required narrative arc.",
  },
  {
    id: "ENGL-G2-WRIT-2Ws02",
    gradeLevel: 2,
    domain: "Writing",
    ixlStyleSkill:
      "Group related sentences together when writing about similar ideas.",
    cambridgeStandard:
      "2Ws.02 Group together sentences relating to similar ideas.",
    diagnosticTrigger:
      "Student scatters related facts randomly throughout an informational text rather than clustering them together by subtopic, indicating an inability to spatially organize semantic categories.",
  },
  {
    id: "ENGL-G2-WRIT-2Ws03",
    gradeLevel: 2,
    domain: "Writing",
    ixlStyleSkill:
      "Use subheadings and labeled diagrams to organize information in a text.",
    cambridgeStandard:
      "2Ws.03 Use simple organisational features appropriate to the text type, e.g. subheadings, labelled diagrams.",
    diagnosticTrigger:
      "Student writes an entire non-fiction report as one massive block of text without using subheadings to separate sections, failing to apply expository structural formatting.",
  },
  {
    id: "ENGL-G2-WRIT-2Wc01",
    gradeLevel: 2,
    domain: "Writing",
    ixlStyleSkill:
      "Write simple stories and poems, using familiar structures as a guide.",
    cambridgeStandard:
      "2Wc.01 Begin to write simple stories and poems, including using the structures of familiar stories and poems.",
    diagnosticTrigger:
      "Student is given a familiar poem structure to emulate but produces disjointed prose that lacks any rhythm or patterned structure, showing an inability to map their ideas onto a provided framework.",
  },
  {
    id: "ENGL-G2-WRIT-2Wc02",
    gradeLevel: 2,
    domain: "Writing",
    ixlStyleSkill:
      "Discuss settings and characters with a group to plan a story before writing.",
    cambridgeStandard:
      "2Wc.02 Plan writing through discussion, e.g. talking about the setting and characters before writing a story.",
    diagnosticTrigger:
      "Student begins writing a story immediately without engaging in verbal pre-planning, quickly getting stuck because they haven't established basic narrative elements like setting or character.",
  },
  {
    id: "ENGL-G2-WRIT-2Wc03",
    gradeLevel: 2,
    domain: "Writing",
    ixlStyleSkill:
      "Include simple descriptions of the setting and characters in a story.",
    cambridgeStandard:
      "2Wc.03 Include simple descriptions of settings and characters when writing stories.",
    diagnosticTrigger:
      "Student's narrative consists entirely of action verbs ('he ran, he jumped') with zero descriptive details about where the action is happening or what the characters look like.",
  },
  {
    id: "ENGL-G2-WRIT-2Wc04",
    gradeLevel: 2,
    domain: "Writing",
    ixlStyleSkill:
      "Write texts suited for specific purposes, using the right language and layout.",
    cambridgeStandard:
      "2Wc.04 Begin to write for a purpose using basic language and features appropriate for the text type.",
    diagnosticTrigger:
      "Student attempts to write a persuasive poster but uses the formatting and tone of a fictional story, demonstrating a severe mismatch between the authorial intent and the chosen text type.",
  },
  {
    id: "ENGL-G2-WRIT-2Wc05",
    gradeLevel: 2,
    domain: "Writing",
    ixlStyleSkill:
      "Add extra information and details to develop ideas in non-fiction writing.",
    cambridgeStandard:
      "2Wc.05 Include additional information to develop some ideas when writing non-fiction texts.",
    diagnosticTrigger:
      "Student writes single, isolated facts about a topic without ever elaborating or providing an example, showing an inability to expand upon a core declarative statement.",
  },
  {
    id: "ENGL-G2-WRIT-2Wp01",
    gradeLevel: 2,
    domain: "Writing",
    ixlStyleSkill:
      "Write letters consistently in the correct size and keep spacing even between words.",
    cambridgeStandard:
      "2Wp.01 Ensure consistency in formation, size and proportion of letters and the spacing of words.",
    diagnosticTrigger:
      "Student's handwriting features massive sizing fluctuations and no physical spacing between words, resulting in an illegible, unsegmented string of letters due to poor spatial control.",
  },
  {
    id: "ENGL-G2-WRIT-2Wp02",
    gradeLevel: 2,
    domain: "Writing",
    ixlStyleSkill:
      "Know which letters should be joined in handwriting and which should not.",
    cambridgeStandard:
      "2Wp.02 Know how to join letters and which letters are best left unjoined.",
    diagnosticTrigger:
      "Student attempts to forcefully join every single letter with erratic, looping strokes regardless of letter shape, resulting in severe legibility issues because they don't recognize standard unjoined letters.",
  },
  {
    id: "ENGL-G2-WRIT-2Wp03",
    gradeLevel: 2,
    domain: "Writing",
    ixlStyleSkill:
      "Jot down key topic words or information from a non-fiction text.",
    cambridgeStandard:
      "2Wp.03 Record key information drawn from a non-fiction text, e.g. listing key topic words.",
    diagnosticTrigger:
      "Student attempts to copy entire sentences verbatim from a source text rather than extracting and listing the core topic words, showing an inability to synthesize and condense information.",
  },
  {
    id: "ENGL-G2-WRIT-2Wp04",
    gradeLevel: 2,
    domain: "Writing",
    ixlStyleSkill:
      "Present writing using creative formats like storyboards or labeled diagrams.",
    cambridgeStandard:
      "2Wp.04 Present text in a range of different ways, e.g. diagrams with typed labels, storyboards with handwritten captions.",
    diagnosticTrigger:
      "Student refuses to use multi-modal formats like a storyboard, insisting on writing purely linear prose because they lack the spatial organizational skills to map text to corresponding visual panels.",
  },
  {
    id: "ENGL-G2-WRIT-2Wp05",
    gradeLevel: 2,
    domain: "Writing",
    ixlStyleSkill:
      "Read your own writing out loud to others and share ideas to make it better.",
    cambridgeStandard:
      "2Wp.05 Read own writing to others and share ideas for improvements.",
    diagnosticTrigger:
      "Student becomes defensive or refuses to discuss their writing with peers, lacking the metacognitive distance required to view their own text objectively for revision.",
  },
  {
    id: "ENGL-G2-WRIT-2Wp06",
    gradeLevel: 2,
    domain: "Writing",
    ixlStyleSkill:
      "Proofread writing by reading it aloud to catch mistakes in punctuation and grammar.",
    cambridgeStandard:
      "2Wp.06 Begin to proofread for errors by re-reading own writing aloud (e.g. sentence punctuation, verb forms).",
    diagnosticTrigger:
      "Student reads their own text silently and claims it is perfect, failing to use the auditory feedback loop of reading aloud to catch glaring missing words or punctuation errors.",
  },
  {
    id: "ENGL-G2-SPKL-2SLm01",
    gradeLevel: 2,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Speak clearly and confidently when talking with familiar people.",
    cambridgeStandard:
      "2SLm.01 Speak clearly and confidently with familiar people.",
    diagnosticTrigger:
      "Student consistently mutters, drops their volume, or covers their mouth when speaking in a small group, demonstrating severe expressive anxiety or poor articulatory control.",
  },
  {
    id: "ENGL-G2-SPKL-2SLm02",
    gradeLevel: 2,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Provide enough relevant detail when answering questions or sharing information.",
    cambridgeStandard:
      "2SLm.02 Provide relevant information with sufficient detail, as needed.",
    diagnosticTrigger:
      "Student gives ultra-brief, one-word answers to open-ended questions, failing to elaborate or provide the necessary detail required for the listener to fully understand.",
  },
  {
    id: "ENGL-G2-SPKL-2SLm03",
    gradeLevel: 2,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Use relevant and descriptive vocabulary to describe events and feelings.",
    cambridgeStandard:
      "2SLm.03 Use relevant vocabulary to describe events and feelings.",
    diagnosticTrigger:
      "Student relies entirely on generic placeholder words ('the thingy', 'it was bad') to describe a specific event, showing a deficit in expressive vocabulary retrieval.",
  },
  {
    id: "ENGL-G2-SPKL-2SLm04",
    gradeLevel: 2,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Use body language, gestures, and eye contact while communicating.",
    cambridgeStandard:
      "2SLm.04 Show some use of non-verbal communication techniques.",
    diagnosticTrigger:
      "Student speaks with a completely rigid posture and avoids all eye contact, failing to employ non-verbal cues to emphasize points or engage the listener socially.",
  },
  {
    id: "ENGL-G2-SPKL-2SLm05",
    gradeLevel: 2,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Notice the listener's reactions and adjust tone or engagement to keep them interested.",
    cambridgeStandard:
      "2SLm.05 Show some awareness of the listener, e.g. by varying tone to engage them, by responding to their non-verbal cues.",
    diagnosticTrigger:
      "Student delivers a presentation in a flat monotone and ignores when peers look confused or distracted, indicating poor pragmatic awareness of audience feedback.",
  },
  {
    id: "ENGL-G2-SPKL-2SLs01",
    gradeLevel: 2,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Listen carefully and respond correctly, including recalling the main points.",
    cambridgeStandard:
      "2SLs.01 Listen and respond appropriately, including recalling the main points.",
    diagnosticTrigger:
      "Student listens to a short presentation but cannot recall a single key fact when asked immediately afterward, demonstrating a bottleneck in auditory working memory or sustained attention.",
  },
  {
    id: "ENGL-G2-SPKL-2SLs02",
    gradeLevel: 2,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Ask relevant questions to improve understanding of what is heard or read.",
    cambridgeStandard:
      "2SLs.02 Ask questions about what is heard or read to improve understanding.",
    diagnosticTrigger:
      "Student remains completely silent when a topic is obviously confusing, failing to deploy self-advocacy strategies or formulate interrogative questions to repair comprehension breakdowns.",
  },
  {
    id: "ENGL-G2-SPKL-2SLg01",
    gradeLevel: 2,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Work cooperatively with others in a group setting.",
    cambridgeStandard:
      "2SLg.01 Work with others in a group.",
    diagnosticTrigger:
      "Student physically isolates themselves from their assigned group or refuses to share materials, exhibiting a rigid inability to engage in collaborative task execution.",
  },
  {
    id: "ENGL-G2-SPKL-2SLg02",
    gradeLevel: 2,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Listen to and show understanding of group members' opinions.",
    cambridgeStandard:
      "2SLg.02 Show understanding of the opinions of others.",
    diagnosticTrigger:
      "Student immediately dismisses or talks over a peer who offers an alternate idea, demonstrating a lack of cognitive flexibility and an inability to process differing perspectives.",
  },
  {
    id: "ENGL-G2-SPKL-2SLg03",
    gradeLevel: 2,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Respond in a way that stays on-topic during group discussions.",
    cambridgeStandard:
      "2SLg.03 During a discussion, respond in a way that is relevant to the task.",
    diagnosticTrigger:
      "Student interjects with completely unrelated personal anecdotes during a focused group task, failing to sustain shared semantic attention to the relevant topic.",
  },
  {
    id: "ENGL-G2-SPKL-2SLg04",
    gradeLevel: 2,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Take turns speaking and add relevant information to the discussion.",
    cambridgeStandard:
      "2SLg.04 Take turns in speaking, adding relevant information.",
    diagnosticTrigger:
      "Student monopolizes the conversation entirely or interrupts constantly, demonstrating underdeveloped inhibition and a failure to abide by conversational turn-taking pragmatics.",
  },
  {
    id: "ENGL-G2-SPKL-2SLp01",
    gradeLevel: 2,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Read familiar stories and poems out loud smoothly and with expression.",
    cambridgeStandard:
      "2SLp.01 Read familiar stories and poems aloud with fluency and expression.",
    diagnosticTrigger:
      "Student reads a familiar, highly emotional text in a completely flat, robotic cadence, indicating a failure to translate orthographic comprehension into vocal prosody.",
  },
  {
    id: "ENGL-G2-SPKL-2SLp02",
    gradeLevel: 2,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Change your voice when reading direct speech marked by quotation marks.",
    cambridgeStandard:
      "2SLp.02 Show awareness of speech marks when reading aloud.",
    diagnosticTrigger:
      "Student reads dialogue exactly the same way as narrative text, entirely ignoring quotation marks as a visual cue to enact a distinct character voice.",
  },
  {
    id: "ENGL-G2-SPKL-2SLp03",
    gradeLevel: 2,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Use role-play to explore characters and situations more deeply.",
    cambridgeStandard:
      "2SLp.03 Extend experiences and ideas about characters and situations through role-play.",
    diagnosticTrigger:
      "Student cannot adopt a persona during a drama activity, rigidly remaining 'themselves' and failing to exhibit the cognitive empathy required for basic dramatic role-play.",
  },
  {
    id: "ENGL-G2-SPKL-2SLp04",
    gradeLevel: 2,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Deliver a short, prepared presentation about an object or event.",
    cambridgeStandard:
      "2SLp.04 Deliver a short presentation in a familiar context about a chosen object or event.",
    diagnosticTrigger:
      "Student becomes completely mute or overly reliant on reading directly from a script during a short presentation, unable to retrieve and orally perform planned, structured content.",
  },
  {
    id: "ENGL-G2-SPKL-2SLr01",
    gradeLevel: 2,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Discuss personal choices and activities, explaining the reasoning behind them.",
    cambridgeStandard:
      "2SLr.01 Talk about own activities, including why they made particular choices.",
    diagnosticTrigger:
      "Student can describe an activity they completed but is entirely unable to explain why they chose to do it that way, demonstrating a lack of meta-cognitive self-reflection.",
  },
  {
    id: "ENGL-G2-SPKL-2SLr02",
    gradeLevel: 2,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Talk constructively about others' presentations, explaining what was enjoyable.",
    cambridgeStandard:
      "2SLr.02 Talk about others' presentations, including what they enjoyed and why.",
    diagnosticTrigger:
      "Student provides only generic feedback like 'It was good' and cannot pinpoint a specific element of a peer's presentation they liked, showing underdeveloped evaluative listening skills.",
  },
];
