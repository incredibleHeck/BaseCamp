import type { CurriculumObjective } from '../curriculumTypes';

/**
 * Cambridge Primary English / Literacy — Stage 5 (Grade 5).
 *
 * `id` values embed the official strand code with Cambridge casing (e.g. `5Rv` not `5RV`),
 * matching notation like `5Rv.01` in the framework — e.g. `ENGL-G5-READ-5Rv01`.
 */
export const cambridgeEnglishStage5: CurriculumObjective[] = [
  {
    id: 'ENGL-G5-READ-5Rv01',
    gradeLevel: 5,
    domain: 'Reading',
    ixlStyleSkill:
      'Determine the meaning of new words by breaking them into roots, prefixes, and suffixes or using context clues.',
    cambridgeStandard:
      '5Rv.01 Deduce the meanings of unfamiliar words, including using context and knowledge of root words, prefixes and suffixes.',
    diagnosticTrigger:
      'Student ignores known affixes and attempts to guess the word meaning entirely from a single familiar-looking letter string within the word, failing to apply systematic morphological decomposition.',
  },
  {
    id: 'ENGL-G5-READ-5Rv02',
    gradeLevel: 5,
    domain: 'Reading',
    ixlStyleSkill:
      'Identify common idioms and explain their non-literal meanings in context.',
    cambridgeStandard:
      '5Rv.02 Explore common idiomatic phrases and their meanings.',
    diagnosticTrigger:
      "Student interprets figurative expressions like 'break a leg' or 'under the weather' with strict literalism, indicating a failure to inhibit primary semantic meanings in favor of culturally-encoded figurative schemas.",
  },
  {
    id: 'ENGL-G5-READ-5Rv03',
    gradeLevel: 5,
    domain: 'Reading',
    ixlStyleSkill:
      'Identify and collect interesting words and synonyms from reading to use in your own writing.',
    cambridgeStandard:
      '*5Rv.03 Identify and record interesting and significant words, and synonyms, from texts to inform own writing.',
    diagnosticTrigger:
      "Student selects only high-frequency, functional words when asked to identify 'significant' vocabulary, demonstrating a lack of metalinguistic awareness regarding a writer's intent and lexical impact.",
  },
  {
    id: 'ENGL-G5-READ-5Rv04',
    gradeLevel: 5,
    domain: 'Reading',
    ixlStyleSkill:
      'Find words quickly in alphabetical lists like dictionaries by using multiple letters.',
    cambridgeStandard:
      '5Rv.04 Locate words efficiently in alphabetically organised lists.',
    diagnosticTrigger:
      'Student scans a dictionary page from the top for every search rather than using guide words or the fourth/fifth letter of a word to navigate the alphabetical hierarchy efficiently.',
  },
  {
    id: 'ENGL-G5-READ-5Rv05',
    gradeLevel: 5,
    domain: 'Reading',
    ixlStyleSkill:
      "Explain how a writer's choice of words creates a specific feeling or mood in a story.",
    cambridgeStandard:
      "5Rv.05 Comment on a writer's choice of language, including how it conveys feeling and mood.",
    diagnosticTrigger:
      "Student identifies that a story is 'sad' or 'scary' but cannot pinpoint the specific verbs or adjectives the author used to evoke that emotion, showing a disconnect between lexical input and emotional output.",
  },
  {
    id: 'ENGL-G5-READ-5Rv06',
    gradeLevel: 5,
    domain: 'Reading',
    ixlStyleSkill:
      'Identify and explain examples of metaphors and personification in a text.',
    cambridgeStandard:
      '5Rv.06 Identify figurative language in texts, including metaphors and personification.',
    diagnosticTrigger:
      "Student identifies personification as a character's literal action (e.g., 'the wind whispered' means a character named Wind spoke), failing to recognize the attribution of human traits to non-human entities.",
  },
  {
    id: 'ENGL-G5-READ-5Rv07',
    gradeLevel: 5,
    domain: 'Reading',
    ixlStyleSkill:
      'Describe the mental images created by figurative language and explain why they are used.',
    cambridgeStandard:
      '*5Rv.07 Begin to explain how figurative language creates imagery in texts and takes understanding beyond the literal.',
    diagnosticTrigger:
      "Student provides a literal description of a metaphor's components on paper rather than articulating the abstract sensory comparison or 'mental picture' intended by the author.",
  },
  {
    id: 'ENGL-G5-READ-5Rg01',
    gradeLevel: 5,
    domain: 'Reading',
    ixlStyleSkill:
      'Differentiate between direct speech (quotes) and reported speech (summarized talk).',
    cambridgeStandard:
      '5Rg.01 Explore in texts, and understand, grammar and punctuation differences between direct and reported speech.',
    diagnosticTrigger:
      "Student misinterprets the tense shifts in reported speech, failing to recognize that 'he said he was going' refers to a past intention rather than a current action.",
  },
  {
    id: 'ENGL-G5-READ-5Rg02',
    gradeLevel: 5,
    domain: 'Reading',
    ixlStyleSkill:
      'Identify the different parts of a sentence (clauses) and the words that connect them.',
    cambridgeStandard:
      '5Rg.02 Recognise different clauses within sentences and the connectives that link them.',
    diagnosticTrigger:
      'Student treats a subordinate clause as a standalone sentence or misses the relationship established by the connective, leading to a breakdown in understanding causal or temporal dependencies.',
  },
  {
    id: 'ENGL-G5-READ-5Rg03',
    gradeLevel: 5,
    domain: 'Reading',
    ixlStyleSkill:
      "Understand abstract nouns and how quantifiers (like 'fewer' and 'less') change based on what you are counting.",
    cambridgeStandard:
      '5Rg.03 Explore and discuss different types of nouns, including abstract nouns, and how quantifiers (e.g. fewer, less) relate to countable and uncountable nouns.',
    diagnosticTrigger:
      "Student uses 'less' for countable items (e.g., 'less cookies') on paper, demonstrating a failure to categorize nouns into discrete vs. mass entities for grammatical agreement.",
  },
  {
    id: 'ENGL-G5-READ-5Rg04',
    gradeLevel: 5,
    domain: 'Reading',
    ixlStyleSkill:
      'Use pronouns and possessive pronouns (theirs, mine) to make sentences clearer and avoid repeating nouns.',
    cambridgeStandard:
      '5Rg.04 Explore in texts use of pronouns, including possessive pronouns (e.g. theirs, mine), to avoid repetition of nouns while still maintaining clarity.',
    diagnosticTrigger:
      "Student loses the antecedent of a pronoun in a long paragraph, incorrectly attributing an action to the wrong character because they cannot track the 'noun-to-pronoun' chain over multiple sentences.",
  },
  {
    id: 'ENGL-G5-READ-5Rg05',
    gradeLevel: 5,
    domain: 'Reading',
    ixlStyleSkill:
      'Identify and use modal verbs (should, would, could) to show how likely something is to happen.',
    cambridgeStandard:
      '5Rg.05 Explore how different modal verbs express degrees of possibility, e.g. should, would, could.',
    diagnosticTrigger:
      "Student interprets a possibility (e.g., 'It might rain') as a certainty, failing to decode the nuanced degree of probability encoded in the specific modal verb.",
  },
  {
    id: 'ENGL-G5-READ-5Rg06',
    gradeLevel: 5,
    domain: 'Reading',
    ixlStyleSkill:
      'Identify when a text uses Standard English and recognize its rules.',
    cambridgeStandard:
      '5Rg.06 Explore in texts the conventions of standard English.',
    diagnosticTrigger:
      'Student fails to identify colloquialisms or informal dialect as distinct from Standard English, treating all written word forms as having equal grammatical weight regardless of context.',
  },
  {
    id: 'ENGL-G5-READ-5Rs01',
    gradeLevel: 5,
    domain: 'Reading',
    ixlStyleSkill:
      'Describe how ideas develop throughout a text and compare this progression between different books.',
    cambridgeStandard:
      '5Rs.01 Explore and describe the progression of ideas in a text; compare the progression in different texts.',
    diagnosticTrigger:
      "Student summarizes events chronologically but cannot articulate the logical 'thread' or cumulative growth of an argument or theme across the text's structure.",
  },
  {
    id: 'ENGL-G5-READ-5Rs02',
    gradeLevel: 5,
    domain: 'Reading',
    ixlStyleSkill:
      'Identify the key structural features of various genres, including fiction, non-fiction, poems, and playscripts.',
    cambridgeStandard:
      '*5Rs.02 Explore and recognise the key features of text structure in a range of different fiction and non-fiction texts, including poems and playscripts.',
    diagnosticTrigger:
      'Student treats a playscript as a narrative, reading stage directions aloud as part of the dialogue, indicating a failure to recognize structural conventions of dramatic text.',
  },
  {
    id: 'ENGL-G5-READ-5Rs03',
    gradeLevel: 5,
    domain: 'Reading',
    ixlStyleSkill:
      'Identify how the order of paragraphs and sections creates different effects for the reader.',
    cambridgeStandard:
      '5Rs.03 Explore and recognise how different effects can be achieved by sequencing sections and paragraphs in different ways.',
    diagnosticTrigger:
      'Student cannot explain why an author chose to start with a flashback or an end-result, showing a lack of understanding regarding non-linear structural impact on reader engagement.',
  },
  {
    id: 'ENGL-G5-READ-5Ri01',
    gradeLevel: 5,
    domain: 'Reading',
    ixlStyleSkill:
      'Explain the difference between fiction and non-fiction and find books using library classifications.',
    cambridgeStandard:
      '*5Ri.01 Understand the difference between fiction and non-fiction texts and locate books by classification.',
    diagnosticTrigger:
      'Student searches for a factual book using a Dewey Decimal number in the middle of the alphabetized fiction shelves, failing to understand the fundamental split in library organizational systems.',
  },
  {
    id: 'ENGL-G5-READ-5Ri02',
    gradeLevel: 5,
    domain: 'Reading',
    ixlStyleSkill:
      'Explore how visual elements or multimedia (like videos or charts) add meaning to fiction and plays.',
    cambridgeStandard:
      '*5Ri.02 Read and explore a range of fiction genres, poems and playscripts, including identifying the contribution of any visual elements or multimedia.',
    diagnosticTrigger:
      "Student reads the dialogue of a playscript but ignores the set descriptions and diagrams, resulting in a failure to visualize the spatial arrangement of the scene.",
  },
  {
    id: 'ENGL-G5-READ-5Ri03',
    gradeLevel: 5,
    domain: 'Reading',
    ixlStyleSkill:
      'Compare the characteristics of different fiction genres (e.g., sci-fi, mystery, fantasy).',
    cambridgeStandard:
      '*5Ri.03 Identify, discuss and compare different fiction genres and their typical characteristics.',
    diagnosticTrigger:
      'Student mislabels a story genre because they focus only on a character\'s name rather than identifying defining structural elements like magic systems or historical accuracy.',
  },
  {
    id: 'ENGL-G5-READ-5Ri04',
    gradeLevel: 5,
    domain: 'Reading',
    ixlStyleSkill:
      'Identify and explore the features of various non-fiction text types (e.g., reports, explanations).',
    cambridgeStandard:
      '*5Ri.04 Read and explore a range of non-fiction text types.',
    diagnosticTrigger:
      'Student attempts to read a non-fiction information text cover-to-cover like a story, entirely ignoring index and glossary features designed for non-linear information retrieval.',
  },
  {
    id: 'ENGL-G5-READ-5Ri05',
    gradeLevel: 5,
    domain: 'Reading',
    ixlStyleSkill:
      'Compare how different non-fiction texts use personal or impersonal styles to achieve their purpose.',
    cambridgeStandard:
      '5Ri.05 Identify, discuss and compare the purposes and features of different non-fiction text types, including evaluating texts for purpose and clarity, and recognising use of personal and impersonal style.',
    diagnosticTrigger:
      'Student fails to detect bias in a first-person persuasive piece, accepting it as objective fact because they cannot distinguish between subjective personal style and impersonal reported data.',
  },
  {
    id: 'ENGL-G5-READ-5Ri06',
    gradeLevel: 5,
    domain: 'Reading',
    ixlStyleSkill:
      'Find and explain explicit information and direct answers in a variety of texts.',
    cambridgeStandard:
      '*5Ri.06 Explore explicit meanings in a range of texts.',
    diagnosticTrigger:
      "Student provides a 'common sense' answer to a reading question that is explicitly contradicted by a specific sentence in the text, indicating a failure to prioritize text-based evidence over prior knowledge.",
  },
  {
    id: 'ENGL-G5-READ-5Ri07',
    gradeLevel: 5,
    domain: 'Reading',
    ixlStyleSkill:
      'Identify the main points of a text and group related ideas together.',
    cambridgeStandard:
      '5Ri.07 Extract main points from a text, and group and link ideas.',
    diagnosticTrigger:
      "Student identifies a minor, hyper-specific detail as the 'main point' of a paragraph, demonstrating an inability to synthesize a collection of facts into an overarching summary.",
  },
  {
    id: 'ENGL-G5-READ-5Ri08',
    gradeLevel: 5,
    domain: 'Reading',
    ixlStyleSkill:
      'Compare how characters and settings are shown in playscripts vs. films.',
    cambridgeStandard:
      '5Ri.08 Recognise and compare the dramatic conventions of playscripts and films, including how they contribute to the development of characters and settings.',
    diagnosticTrigger:
      "Student cannot identify how a film uses music or lighting to convey the same character emotion that a playscript might show through a written 'stage direction' or 'aside'.",
  },
  {
    id: 'ENGL-G5-READ-5Ri09',
    gradeLevel: 5,
    domain: 'Reading',
    ixlStyleSkill:
      'Explain implicit meanings and themes that are not directly stated by the author.',
    cambridgeStandard:
      '*5Ri.09 Explore implicit meanings in a range of texts.',
    diagnosticTrigger:
      "Student provides only literal recounts of a character's actions and is unable to describe the character's internal feelings or hidden motivations when they are not explicitly named in the text.",
  },
  {
    id: 'ENGL-G5-READ-5Ri10',
    gradeLevel: 5,
    domain: 'Reading',
    ixlStyleSkill:
      'Predict what will happen next in a story using character traits and previous plot events.',
    cambridgeStandard:
      '5Ri.10 Use a range of types of clues in stories (e.g. personality of characters) to predict what might happen next.',
    diagnosticTrigger:
      "Student makes a plot prediction that contradicts a character's established personality (e.g., predicting a timid character will suddenly fight a dragon), failing to use internal character logic as a predictive constraint.",
  },
  {
    id: 'ENGL-G5-READ-5Ri11',
    gradeLevel: 5,
    domain: 'Reading',
    ixlStyleSkill:
      'Identify and explain the relationships between different characters in a story based on text clues.',
    cambridgeStandard:
      '5Ri.11 Make inferences from texts, including about the relationships between story characters.',
    diagnosticTrigger:
      "Student identifies characters as 'friends' or 'enemies' based on a single action rather than synthesizing their complex interactions over the entire duration of the text.",
  },
  {
    id: 'ENGL-G5-READ-5Ri12',
    gradeLevel: 5,
    domain: 'Reading',
    ixlStyleSkill:
      'Differentiate between fact and opinion across many different types of writing.',
    cambridgeStandard:
      '*5Ri.12 Distinguish between fact and opinion in a range of texts.',
    diagnosticTrigger:
      "Student categorizes a character's subjective claim as a 'fact' because it was stated by an authority figure in the book, failing to analyze the statement for evaluative language.",
  },
  {
    id: 'ENGL-G5-READ-5Ri13',
    gradeLevel: 5,
    domain: 'Reading',
    ixlStyleSkill:
      'Use skimming (reading for gist) and scanning (searching for specific info) correctly depending on the task.',
    cambridgeStandard:
      '5Ri.13 Use scanning and skimming appropriately depending on the type of information required.',
    diagnosticTrigger:
      "Student attempts to find a specific date by reading the entire passage word-for-word from the start, failing to utilize visual 'jump-searching' techniques for specific typographical cues.",
  },
  {
    id: 'ENGL-G5-READ-5Ri14',
    gradeLevel: 5,
    domain: 'Reading',
    ixlStyleSkill:
      'Locate and pull together information from different parts of a text or from multiple different texts.',
    cambridgeStandard:
      '5Ri.14 Locate and use relevant information from a single text or different texts.',
    diagnosticTrigger:
      'Student provides a fragmented answer that only utilizes information from the final paragraph, failing to synthesize related details found earlier in the text or in an accompanying side-bar.',
  },
  {
    id: 'ENGL-G5-READ-5Ri15',
    gradeLevel: 5,
    domain: 'Reading',
    ixlStyleSkill:
      'Back up your answers with direct evidence or quotes from the text.',
    cambridgeStandard:
      '*5Ri.15 Support answers to questions with reference to, or quotations from, one or more points in a text.',
    diagnosticTrigger:
      'Student provides a correct inferential answer but is unable to locate or copy the specific sentence on the page that logically supports their claim.',
  },
  {
    id: 'ENGL-G5-READ-5Ri16',
    gradeLevel: 5,
    domain: 'Reading',
    ixlStyleSkill:
      'Compare the themes, features, and language used in different texts.',
    cambridgeStandard:
      '5Ri.16 Recognise, compare and contrast the themes, features and language of texts.',
    diagnosticTrigger:
      "Student can identify the plot of two stories but cannot explain that both books share the theme of 'overcoming fear', showing a failure to abstract higher-order meaning.",
  },
  {
    id: 'ENGL-G5-READ-5Ri17',
    gradeLevel: 5,
    domain: 'Reading',
    ixlStyleSkill:
      'Describe the perspective or viewpoint an author has in a fiction or non-fiction book.',
    cambridgeStandard:
      '5Ri.17 Comment on how a viewpoint is expressed in fiction and non-fiction texts.',
    diagnosticTrigger:
      "Student confuses a first-person character's biased viewpoint with the author's objective truth, failing to recognize that a narrator can be unreliable or subjective.",
  },
  {
    id: 'ENGL-G5-READ-5Ra01',
    gradeLevel: 5,
    domain: 'Reading',
    ixlStyleSkill:
      'Engage with and enjoy a wide range of genres, including plays, poems, and informational texts.',
    cambridgeStandard:
      '*5Ra.01 Enjoy independent and shared reading of fiction genres, poems, playscripts and non-fiction texts.',
    diagnosticTrigger:
      'Student exhibits high levels of task avoidance when presented with a non-narrative text, such as a poem or report, indicating a lack of cognitive stamina for diverse textual structures.',
  },
  {
    id: 'ENGL-G5-READ-5Ra02',
    gradeLevel: 5,
    domain: 'Reading',
    ixlStyleSkill:
      'Share personal responses to reading, including your own opinions, reflections, and predictions.',
    cambridgeStandard:
      '5Ra.02 Express personal responses to texts, including predictions, opinions and reflections.',
    diagnosticTrigger:
      'Student provides only a literal plot summary when asked for a personal response, unable to bridge the text to their own internal evaluative or emotional reactions.',
  },
  {
    id: 'ENGL-G5-READ-5Ra03',
    gradeLevel: 5,
    domain: 'Reading',
    ixlStyleSkill:
      'Identify favorite authors and explain why you would recommend them to others.',
    cambridgeStandard:
      '5Ra.03 Develop preferences about favourite writers and share recommendations with others.',
    diagnosticTrigger:
      'Student cannot name a specific author whose style they enjoy, indicating an underdeveloped sense of authorial voice and a lack of comparative reading history.',
  },
  {
    id: 'ENGL-G5-READ-5Ra04',
    gradeLevel: 5,
    domain: 'Reading',
    ixlStyleSkill:
      'Consider how different readers might feel about the same book based on when or where they read it.',
    cambridgeStandard:
      '5Ra.04 Begin to consider how readers might react differently to the same text, depending on where or when they are reading it.',
    diagnosticTrigger:
      'Student insists that their own personal interpretation of a text is the only correct one, showing an inability to adopt the perspective of a reader from a different culture or time period.',
  },
  {
    id: 'ENGL-G5-WRIT-5Ww01',
    gradeLevel: 5,
    domain: 'Writing',
    ixlStyleSkill:
      "Spell words ending in unstressed vowel sounds (like 'er' in butter or 'y' in city) correctly.",
    cambridgeStandard:
      "5Ww.01 Explore and use spellings of unstressed vowel phonemes at the end of words, e.g. /з:/ (‘er’) at the end of butter, /i:/ ('ee’) at the end of city.",
    diagnosticTrigger:
      "Student spells unstressed endings purely phonetically, writing 'butta' or 'citee', demonstrating a failure to map the neutral schwa sound to conventional orthographic suffixes.",
  },
  {
    id: 'ENGL-G5-WRIT-5Ww02',
    gradeLevel: 5,
    domain: 'Writing',
    ixlStyleSkill:
      "Spell long words correctly, including those with 'silent' vowels or syllables (e.g., library, interest).",
    cambridgeStandard:
      "5Ww.02 Explore and use ‘silent’ vowels and syllables in polysyllabic words, e.g. library, interest.",
    diagnosticTrigger:
      "Student omits the internal unvoiced syllable when writing (e.g., 'libry' or 'intrest'), as their spelling relies too heavily on their own compressed speech patterns rather than visual memory.",
  },
  {
    id: 'ENGL-G5-WRIT-5Ww03',
    gradeLevel: 5,
    domain: 'Writing',
    ixlStyleSkill:
      "Apply rules for single and double consonants (e.g., full, -ful, -fully) correctly.",
    cambridgeStandard:
      '5Ww.03 Explore and use rules for single and double consonants, e.g. full, -ful, -fully.',
    diagnosticTrigger:
      "Student incorrectly doubles the 'l' in suffixes (e.g., writing 'helpfull'), failing to distinguish between the spelling of a standalone word and its form as a bound morpheme.",
  },
  {
    id: 'ENGL-G5-WRIT-5Ww04',
    gradeLevel: 5,
    domain: 'Writing',
    ixlStyleSkill:
      'Spell words using a wide range of prefixes and suffixes, including those that create opposites (un-, im-).',
    cambridgeStandard:
      '5Ww.04 Spell words with a wide range of common prefixes and suffixes, including understanding ways of creating opposites, e.g. un-, im-.',
    diagnosticTrigger:
      "Student uses the wrong negative prefix (e.g., 'unpossible' instead of 'impossible'), indicating a breakdown in the semantic-orthographic mapping of latin-based opposites.",
  },
  {
    id: 'ENGL-G5-WRIT-5Ww05',
    gradeLevel: 5,
    domain: 'Writing',
    ixlStyleSkill:
      'Use spelling rules to correctly add suffixes that start with vowels or consonants.',
    cambridgeStandard:
      '5Ww.05 Explore and use spelling rules for suffixes that begin with vowels and suffixes that begin with consonants.',
    diagnosticTrigger:
      "Student fails to drop the final 'e' or double the final consonant when adding a vowel-starting suffix (e.g., 'hopeing' or 'geting'), showing an inconsistent application of morphological junction rules.",
  },
  {
    id: 'ENGL-G5-WRIT-5Ww06',
    gradeLevel: 5,
    domain: 'Writing',
    ixlStyleSkill:
      'Correctly use homonyms—words that are spelled the same but have different meanings.',
    cambridgeStandard:
      '5Ww.06 Explore and use accurately words that have the same spelling but different meanings (homonyms), e.g. wave (hand gesture, hair curl, sea movement, etc.).',
    diagnosticTrigger:
      'Student uses a homonym in a sentence that is semantically nonsensical for that context, failing to retrieve the specific secondary definition required by the surrounding syntax.',
  },
  {
    id: 'ENGL-G5-WRIT-5Ww07',
    gradeLevel: 5,
    domain: 'Writing',
    ixlStyleSkill:
      'Spell words with uncommon letter patterns that are pronounced differently (e.g., pour, hour, piece).',
    cambridgeStandard:
      '5Ww.07 Spell words with less common letter strings which may be pronounced differently, e.g. pour, hour; piece, pie.',
    diagnosticTrigger:
      "Student over-applies a common phonics rule to an exception (e.g., spelling 'hour' as 'owr'), showing a failure to shift from phonetic decoding to visual-orthographic 'word-picture' storage.",
  },
  {
    id: 'ENGL-G5-WRIT-5Ww08',
    gradeLevel: 5,
    domain: 'Writing',
    ixlStyleSkill:
      'Recognize and correctly spell words that are exceptions to standard spelling rules.',
    cambridgeStandard:
      '5Ww.08 Explore exceptions to known spelling rules.',
    diagnosticTrigger:
      "Student rigidly applies a recently learned rule (like 'i before e') to words that are explicitly exempt (like 'height' or 'weigh'), demonstrating an inability to modulate rules with contextual exceptions.",
  },
  {
    id: 'ENGL-G5-WRIT-5Ww09',
    gradeLevel: 5,
    domain: 'Writing',
    ixlStyleSkill:
      'Use known spelling rules and word families to figure out how to spell unfamiliar words.',
    cambridgeStandard:
      '5Ww.09 Use effective strategies, including spelling rules and exceptions, and using known spellings to work out the spelling of related words, to spell a range of words correctly.',
    diagnosticTrigger:
      "Student attempts to spell an unfamiliar word from scratch using phonetics rather than looking for a familiar 'base' or 'root' inside the word to guide the orthography.",
  },
  {
    id: 'ENGL-G5-WRIT-5Ww10',
    gradeLevel: 5,
    domain: 'Writing',
    ixlStyleSkill:
      'Use digital and paper tools to check your spelling and maintain a personal log of tricky words.',
    cambridgeStandard:
      '*5Ww.10 Use paper-based and on-screen tools to find the correct spelling of words; keep and use spelling logs of misspelt words, and identify words that need to be learned.',
    diagnosticTrigger:
      'Student ignores automated spell-check warnings on a screen or stalls on a known tricky word without consulting their personal log, demonstrating poor self-correction habits.',
  },
  {
    id: 'ENGL-G5-WRIT-5Wv01',
    gradeLevel: 5,
    domain: 'Writing',
    ixlStyleSkill:
      'Use specialized and technical vocabulary correctly when writing about a specific topic.',
    cambridgeStandard:
      '*5Wv.01 Use specialised vocabulary accurately to match a familiar topic.',
    diagnosticTrigger:
      "Student relies on vague pronouns or placeholders (e.g., 'the thing in the engine') instead of using the precise technical nouns learned during the topic study.",
  },
  {
    id: 'ENGL-G5-WRIT-5Wv02',
    gradeLevel: 5,
    domain: 'Writing',
    ixlStyleSkill:
      'Use synonyms to show precise shades of meaning in your writing (e.g., tepid vs. hot).',
    cambridgeStandard:
      '5Wv.02 Explore synonyms and words conveying shades of meaning, and use them accurately in own writing.',
    diagnosticTrigger:
      "Student uses 'big' or 'good' repeatedly in a descriptive piece, failing to access a thesaurus or their own mental lexicon for more precise, contextual synonyms.",
  },
  {
    id: 'ENGL-G5-WRIT-5Wv03',
    gradeLevel: 5,
    domain: 'Writing',
    ixlStyleSkill:
      'Choose words and phrases deliberately to convey a specific feeling or mood to the reader.',
    cambridgeStandard:
      '5Wv.03 Choose and use words and phrases carefully to convey feeling and mood.',
    diagnosticTrigger:
      "Student's vocabulary choice is emotionally neutral even when the prompt requires a high-stakes or dramatic tone, showing a lack of intentional word-to-mood mapping.",
  },
  {
    id: 'ENGL-G5-WRIT-5Wv04',
    gradeLevel: 5,
    domain: 'Writing',
    ixlStyleSkill:
      'Use figurative language (like metaphors) to create vivid mental images for your reader.',
    cambridgeStandard:
      '*5Wv.04 Begin to use figurative language to evoke an imaginative response from the reader.',
    diagnosticTrigger:
      "Student writes purely literal, objective descriptions (e.g., 'it was a sunny day') and struggles to generate an analogy or simile even when prompted to be 'creative'.",
  },
  {
    id: 'ENGL-G5-WRIT-5Wv05',
    gradeLevel: 5,
    domain: 'Writing',
    ixlStyleSkill:
      'Use dictionaries and thesauruses to expand the variety of words used in your work.',
    cambridgeStandard:
      '*5Wv.05 Use own lists of interesting and significant words, dictionaries and thesauruses to extend the range of vocabulary used in written work.',
    diagnosticTrigger:
      'Student looks up a word in a thesaurus but selects the very first synonym regardless of whether it fits the grammatical or semantic context of their sentence.',
  },
  {
    id: 'ENGL-G5-WRIT-5Wg01',
    gradeLevel: 5,
    domain: 'Writing',
    ixlStyleSkill:
      'Use commas correctly to separate parts of a sentence and make the meaning clear.',
    cambridgeStandard:
      '5Wg.01 Begin to use commas to separate clauses within sentences and clarify meaning in complex sentences.',
    diagnosticTrigger:
      "Student writes long, multi-clause sentences without any internal punctuation, resulting in a 'breathless' text that is difficult for a reader to parse syntactically.",
  },
  {
    id: 'ENGL-G5-WRIT-5Wg02',
    gradeLevel: 5,
    domain: 'Writing',
    ixlStyleSkill:
      'Use apostrophes accurately for both contractions and possession.',
    cambridgeStandard:
      '5Wg.02 Use apostrophes accurately.',
    diagnosticTrigger:
      "Student consistently places apostrophes in plural nouns (e.g., 'the apple's are sweet') when no possession or omission is present, indicating a failure to distinguish between pluralization and punctuation rules.",
  },
  {
    id: 'ENGL-G5-WRIT-5Wg03',
    gradeLevel: 5,
    domain: 'Writing',
    ixlStyleSkill:
      'Punctuate direct speech perfectly, including commas and quotation marks.',
    cambridgeStandard:
      '5Wg.03 Punctuate direct speech accurately.',
    diagnosticTrigger:
      'Student places terminal punctuation outside of the closing quotation marks (e.g., "Stop"!), demonstrating a failure to internalize the spatial layout of dramatic punctuation.',
  },
  {
    id: 'ENGL-G5-WRIT-5Wg04',
    gradeLevel: 5,
    domain: 'Writing',
    ixlStyleSkill:
      'Create long sentences by combining simple ones and reordering their parts.',
    cambridgeStandard:
      '5Wg.04 Understand how to create multi-clause sentences by combining simple sentences and reordering clauses; use simple, compound and complex sentences.',
    diagnosticTrigger:
      "Student relies exclusively on simple 'subject-verb-object' sentences, failing to utilize coordinating or subordinating conjunctions to show relationships between ideas.",
  },
  {
    id: 'ENGL-G5-WRIT-5Wg05',
    gradeLevel: 5,
    domain: 'Writing',
    ixlStyleSkill:
      'Use modal verbs (should, might, could) to show different levels of certainty.',
    cambridgeStandard:
      '5Wg.05 Use a wide range of modal verbs accurately to express degrees of possibility, e.g. should, would, could.',
    diagnosticTrigger:
      "Student uses 'will' for every future action on paper, unable to express doubt, permission, or hypothetical scenarios through more nuanced modal choices.",
  },
  {
    id: 'ENGL-G5-WRIT-5Wg06',
    gradeLevel: 5,
    domain: 'Writing',
    ixlStyleSkill:
      'Use possessive pronouns (theirs, mine) correctly so the reader knows who owns what.',
    cambridgeStandard:
      '5Wg.06 Use pronouns, including possessive pronouns (e.g. theirs, mine), appropriately so it is clear to what or whom they refer.',
    diagnosticTrigger:
      "Student uses a possessive pronoun that lacks a clear antecedent, causing the reader to be unable to identify who 'it' or 'theirs' refers to in the previous sentence.",
  },
  {
    id: 'ENGL-G5-WRIT-5Wg07',
    gradeLevel: 5,
    domain: 'Writing',
    ixlStyleSkill:
      'Correctly form and use comparative and superlative words (e.g., better, best; more quickly, most quickly).',
    cambridgeStandard:
      '5Wg.07 Form and use comparative and superlative adjectives and adverbs correctly, e.g. better, best; smaller, smallest; more quickly, most quickly.',
    diagnosticTrigger:
      "Student incorrectly doubles a comparative (e.g., writing 'more better' or 'most smallest'), indicating a failure to recognize which adjectives require suffixes versus those that require adverbial modifiers.",
  },
  {
    id: 'ENGL-G5-WRIT-5Wg08',
    gradeLevel: 5,
    domain: 'Writing',
    ixlStyleSkill:
      'Use a wide range of adverbs and adverbial phrases to add detail to your verbs.',
    cambridgeStandard:
      '5Wg.08 Use a wide range of adverbs and adverbial phrases.',
    diagnosticTrigger:
      "Student describes an action using only 'very' or 'really' as modifiers (e.g., 'he ran very fast'), failing to utilize more precise adverbs like 'swiftly' or 'breathlessly'.",
  },
  {
    id: 'ENGL-G5-WRIT-5Ws01',
    gradeLevel: 5,
    domain: 'Writing',
    ixlStyleSkill:
      'Develop ideas smoothly and logically throughout a long piece of writing.',
    cambridgeStandard:
      '5Ws.01 Begin to develop ideas cohesively across longer pieces of writing.',
    diagnosticTrigger:
      'Student writes a multi-page story where the plot jumps randomly in time without transitional phrases, resulting in a fragmented text that lacks macro-level cohesion.',
  },
  {
    id: 'ENGL-G5-WRIT-5Ws02',
    gradeLevel: 5,
    domain: 'Writing',
    ixlStyleSkill:
      'Organize writing into paragraphs and sections to make it easier for the reader to understand.',
    cambridgeStandard:
      '5Ws.02 Organise ideas in paragraphs and sections to achieve an appropriate effect.',
    diagnosticTrigger:
      "Student writes a dense 'wall of text' for an informational report, failing to use spatial breaks or sub-headings to signal a shift in topic or sub-point.",
  },
  {
    id: 'ENGL-G5-WRIT-5Ws03',
    gradeLevel: 5,
    domain: 'Writing',
    ixlStyleSkill:
      'Use text features like bullet points and numbered lists where appropriate.',
    cambridgeStandard:
      '*5Ws.03 Use organisational features appropriate to the text type, e.g. bulleted and numbered lists.',
    diagnosticTrigger:
      'Student writes a set of instructions as a long, flowing paragraph, failing to utilize vertical list structures that facilitate quick procedural scanning for the reader.',
  },
  {
    id: 'ENGL-G5-WRIT-5Wc01',
    gradeLevel: 5,
    domain: 'Writing',
    ixlStyleSkill:
      'Write creative stories and poems in many different styles and genres.',
    cambridgeStandard:
      '*5Wc.01 Develop creative writing in a range of different genres of fiction and types of poems.',
    diagnosticTrigger:
      "Student uses the same formulaic 'fairytale' opening and structure for every story prompt, regardless of the assigned genre (e.g., sci-fi or mystery), showing a lack of stylistic flexibility.",
  },
  {
    id: 'ENGL-G5-WRIT-5Wc02',
    gradeLevel: 5,
    domain: 'Writing',
    ixlStyleSkill:
      'Plan the structure and content of your writing using paragraphs or sections before you start.',
    cambridgeStandard:
      '5Wc.02 Use effective planning to inform the content and structure of writing, e.g. paragraphs or sections.',
    diagnosticTrigger:
      'Student ignores their own pre-writing plan or mind-map as soon as they start the draft, resulting in a text that excludes major planned points or lacks the intended structure.',
  },
  {
    id: 'ENGL-G5-WRIT-5Wc03',
    gradeLevel: 5,
    domain: 'Writing',
    ixlStyleSkill:
      'Rewrite a scene or event from the perspective of a different character.',
    cambridgeStandard:
      '5Wc.03 Write new scenes or characters into a story; rewrite events from the viewpoint of another character.',
    diagnosticTrigger:
      "Student changes the pronoun (from 'I' to 'he') but keeps the character's internal thoughts and knowledge exactly the same as the original narrator, failing to inhibit the previous character's viewpoint.",
  },
  {
    id: 'ENGL-G5-WRIT-5Wc04',
    gradeLevel: 5,
    domain: 'Writing',
    ixlStyleSkill:
      "Show a character's opinion or attitude through what they say about settings and other people.",
    cambridgeStandard:
      "5Wc.04 Express a viewpoint in fiction through a character's opinions about a setting or other characters.",
    diagnosticTrigger:
      "Student's character dialogue is purely functional and 'robotic', failing to reveal the character's unique bias, mood, or motivation through their speech.",
  },
  {
    id: 'ENGL-G5-WRIT-5Wc05',
    gradeLevel: 5,
    domain: 'Writing',
    ixlStyleSkill:
      'Write a playscript that includes stage directions and notes for the actors.',
    cambridgeStandard:
      '5Wc.05 Write a playscript, including production notes and stage directions to guide performance.',
    diagnosticTrigger:
      'Student writes character names but forgets to include stage directions (in brackets or italics), making it impossible for an actor to know how to move or what emotion to project.',
  },
  {
    id: 'ENGL-G5-WRIT-5Wc06',
    gradeLevel: 5,
    domain: 'Writing',
    ixlStyleSkill:
      'Choose the right language and features to fit the purpose of your text (e.g., instructions vs. persuasion).',
    cambridgeStandard:
      '*5Wc.06 Develop writing for a purpose using language and features appropriate for a range of text types.',
    diagnosticTrigger:
      "Student uses highly formal, dry language in a creative 'adventure story' prompt, failing to match their lexical tone to the exciting, narrative purpose of the text.",
  },
  {
    id: 'ENGL-G5-WRIT-5Wc07',
    gradeLevel: 5,
    domain: 'Writing',
    ixlStyleSkill:
      'Write specifically for a target audience, using appropriate language and content for them.',
    cambridgeStandard:
      '*5Wc.07 Develop writing of a range of text types for a specified audience, using appropriate content and language.',
    diagnosticTrigger:
      'Student writes a formal report meant for experts using babyish language or overly-simple explanations, failing to engage in audience-appropriate register shifting.',
  },
  {
    id: 'ENGL-G5-WRIT-5Wc08',
    gradeLevel: 5,
    domain: 'Writing',
    ixlStyleSkill:
      'Maintain and defend a consistent opinion or viewpoint throughout a non-fiction piece.',
    cambridgeStandard:
      '5Wc.08 When writing non-fiction texts, present and justify a consistent viewpoint.',
    diagnosticTrigger:
      "Student contradicts their own thesis statement by the middle of an argumentative essay, providing a list of opposing points without refuting them or maintaining their original stance.",
  },
  {
    id: 'ENGL-G5-WRIT-5Wp01',
    gradeLevel: 5,
    domain: 'Writing',
    ixlStyleSkill:
      'Write neatly and smoothly for different tasks, choosing the best pen or pencil for each.',
    cambridgeStandard:
      '5Wp.01 Write legibly and fluently for different purposes, including choosing the writing implement that is best suited for a task.',
    diagnosticTrigger:
      'Student applies the same heavy pressure and erratic cursive formation used for rough notes when creating a final formal piece, showing a failure to adapt motor control to the specific writing purpose.',
  },
  {
    id: 'ENGL-G5-WRIT-5Wp02',
    gradeLevel: 5,
    domain: 'Writing',
    ixlStyleSkill:
      'Use bulleted lists and mind maps to take effective notes for your writing projects.',
    cambridgeStandard:
      '5Wp.02 Explore and use different ways of making notes (e.g. bulleted lists, mind maps) and use them to inform writing.',
    diagnosticTrigger:
      'Student attempts to take notes by copying full, long sentences verbatim from a source text rather than extracting key phrases into a structured visual format.',
  },
  {
    id: 'ENGL-G5-WRIT-5Wp03',
    gradeLevel: 5,
    domain: 'Writing',
    ixlStyleSkill:
      'Choose the best layout—handwritten, printed, or digital—to suit your audience and purpose.',
    cambridgeStandard:
      '*5Wp.03 Begin to choose appropriate ways to lay out and present texts to suit the purpose and audience (handwritten, printed and onscreen).',
    diagnosticTrigger:
      'Student chooses a highly decorative, illegible digital font for a formal report, prioritizing superficial aesthetics over the functional requirement of audience readability.',
  },
  {
    id: 'ENGL-G5-WRIT-5Wp04',
    gradeLevel: 5,
    domain: 'Writing',
    ixlStyleSkill:
      "Review your own and others' work to improve how it sounds, how accurate it is, and its impact.",
    cambridgeStandard:
      '*5Wp.04 Evaluate own and others’ writing, suggesting improvements for sense, accuracy and content, including to enhance the effect.',
    diagnosticTrigger:
      "Student reviews a peer's confusing draft and provides only vague praise (e.g., 'It was good') rather than identifying specific semantic gaps or syntactic errors for correction.",
  },
  {
    id: 'ENGL-G5-WRIT-5Wp05',
    gradeLevel: 5,
    domain: 'Writing',
    ixlStyleSkill:
      'Proofread for errors in grammar, spelling, and punctuation and make necessary fixes.',
    cambridgeStandard:
      '*5Wp.05 Proofread for grammar, spelling and punctuation errors, and make corrections, including using on-screen tools.',
    diagnosticTrigger:
      'Student submits a final draft with glaring, repeated errors in basic punctuation or capitalization, demonstrating a lack of a systematic self-monitoring checklist for polish.',
  },
  {
    id: 'ENGL-G5-SPKL-5SLm01',
    gradeLevel: 5,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Speak precisely, choosing to be either brief or detailed depending on what the situation needs.',
    cambridgeStandard:
      '5SLm.01 Speak precisely either with concision or at length, as appropriate to context.',
    diagnosticTrigger:
      "Student provides an overly long, tangential oral response when a brief 'yes/no' answer was appropriate, or vice-versa, failing to read the situational demand for concision.",
  },
  {
    id: 'ENGL-G5-SPKL-5SLm02',
    gradeLevel: 5,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Organize your spoken information in a way that helps the listener understand your purpose.',
    cambridgeStandard:
      "5SLm.02 Structure relevant information in a way that supports the purpose and aids the listener's understanding.",
    diagnosticTrigger:
      "Student explains a project's results before stating the original goal, causing the listener to become lost because the oral information lacks a logical structural hierarchy.",
  },
  {
    id: 'ENGL-G5-SPKL-5SLm03',
    gradeLevel: 5,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Use detailed language to explain your ideas and opinions clearly.',
    cambridgeStandard:
      '5SLm.03 Use language to convey ideas and opinions, with some detail.',
    diagnosticTrigger:
      "Student states an opinion (e.g., 'This book is boring') but cannot provide a single specific spoken reason to support it, showing a deficit in expressive evidence-building.",
  },
  {
    id: 'ENGL-G5-SPKL-5SLm04',
    gradeLevel: 5,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Adjust your body language and gestures to fit different speaking situations.',
    cambridgeStandard:
      '*5SLm.04 Adapt non-verbal communication techniques for different purposes and contexts.',
    diagnosticTrigger:
      'Student maintains the same casual, slouching posture during a formal classroom presentation that they use on the playground, failing to adapt non-verbal cues to the formal register.',
  },
  {
    id: 'ENGL-G5-SPKL-5SLm05',
    gradeLevel: 5,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Show awareness of your audience by using the right level of formal or informal speech.',
    cambridgeStandard:
      '*5SLm.05 Show awareness of different audiences, e.g. by using the appropriate register.',
    diagnosticTrigger:
      'Student addresses an adult authority figure using the same slang or abbreviated speech they use with peers, demonstrating a failure in social-pragmatic register shifting.',
  },
  {
    id: 'ENGL-G5-SPKL-5SLs01',
    gradeLevel: 5,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Listen to others, think about what they said, and give a thoughtful, reasoned response.',
    cambridgeStandard:
      '5SLs.01 Listen, reflect on what is heard and give a reasoned response.',
    diagnosticTrigger:
      "Student's response to a speaker is completely unrelated to the points just made, showing that they were waiting for their turn to speak rather than actively processing the auditory input.",
  },
  {
    id: 'ENGL-G5-SPKL-5SLg01',
    gradeLevel: 5,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Take on and assign different roles (like leader or scribe) within a group task.',
    cambridgeStandard:
      '*5SLg.01 Take different assigned roles within groups, and begin to assign roles within a group.',
    diagnosticTrigger:
      'Student attempts to perform all the group\'s work themselves or stays entirely passive, showing an inability to delegate or accept specific functional roles in a collaborative setting.',
  },
  {
    id: 'ENGL-G5-SPKL-5SLg02',
    gradeLevel: 5,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Listen to and consider other points of view during a group discussion.',
    cambridgeStandard:
      '*5SLg.02 Show consideration of another point of view.',
    diagnosticTrigger:
      'Student becomes defensive or argumentative as soon as a peer offers an alternative idea, showing a lack of cognitive flexibility to hold two opposing viewpoints simultaneously.',
  },
  {
    id: 'ENGL-G5-SPKL-5SLg03',
    gradeLevel: 5,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Ask and answer questions to help clarify and improve ideas during a group discussion.',
    cambridgeStandard:
      '5SLg.03 Extend a discussion by asking and answering questions to refine ideas.',
    diagnosticTrigger:
      'Student repeats the same point over and over without ever asking a peer to elaborate or clarify, causing the group\'s progress to stall due to a lack of inquisitive dialogic shifting.',
  },
  {
    id: 'ENGL-G5-SPKL-5SLg04',
    gradeLevel: 5,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Take turns speaking in a way that builds upon what someone else has already said.',
    cambridgeStandard:
      '5SLg.04 Take turns in a discussion, building on what others have said.',
    diagnosticTrigger:
      'Student interjects with a completely new, unrelated topic in the middle of a focused debate, failing to acknowledge or \'bridge\' the previous speaker\'s contribution.',
  },
  {
    id: 'ENGL-G5-SPKL-5SLp01',
    gradeLevel: 5,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Read aloud with accuracy, confidence, and a personal style that fits the text.',
    cambridgeStandard:
      '*5SLp.01 Read aloud with accuracy, and increasing confidence and style.',
    diagnosticTrigger:
      'Student reads a highly emotional passage with a flat, robotic monotone and frequent stumbles, indicating a failure to integrate semantic meaning with expressive vocal prosody.',
  },
  {
    id: 'ENGL-G5-SPKL-5SLp02',
    gradeLevel: 5,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Use deliberate speech, gestures, and movement to show a character\'s feelings in drama.',
    cambridgeStandard:
      '5SLp.02 Convey ideas about characters in drama through deliberate choice of speech, gesture and movement.',
    diagnosticTrigger:
      "Student delivers a character's lines with their hands in their pockets and eyes on the floor, failing to use kinetic markers to represent the character's physical presence or emotional state.",
  },
  {
    id: 'ENGL-G5-SPKL-5SLp03',
    gradeLevel: 5,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Plan and give confident presentations to different groups, adjusting for each audience.',
    cambridgeStandard:
      '*5SLp.03 Plan and deliver independent and group presentations confidently to a range of audiences, adapting presentations appropriately to the audience.',
    diagnosticTrigger:
      'Student uses the exact same presentation script and volume for a group of kindergarteners that they use for their peers, showing a failure in audience-centered perspective taking.',
  },
  {
    id: 'ENGL-G5-SPKL-5SLp04',
    gradeLevel: 5,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Choose the best tools or media (like slides or posters) to help with a presentation.',
    cambridgeStandard:
      '*5SLp.04 Begin to make choices about the most appropriate media for a particular presentation.',
    diagnosticTrigger:
      'Student selects a medium (like a tiny drawing) that is physically impossible for the intended audience to see, demonstrating a failure to assess the spatial demands of the presentation context.',
  },
  {
    id: 'ENGL-G5-SPKL-5SLr01',
    gradeLevel: 5,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      "Evaluate your own and others' speaking, noting what worked well and what could be better.",
    cambridgeStandard:
      "*5SLr.01 Evaluate own and others' talk, including what went well and what could be improved next time.",
    diagnosticTrigger:
      'Student cannot provide a single constructive suggestion for improvement after their own talk, showing a lack of meta-cognitive distance to view their own performance objectively.',
  },
  {
    id: 'ENGL-G5-SPKL-5SLr02',
    gradeLevel: 5,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Describe why people speak or communicate differently in different situations.',
    cambridgeStandard:
      '5SLr.02 Comment on how and why communication varies in different contexts.',
    diagnosticTrigger:
      "Student assumes that there is only one 'correct' way to speak and views variations in dialect or register as simple mistakes rather than context-dependent social adaptations.",
  },
];
