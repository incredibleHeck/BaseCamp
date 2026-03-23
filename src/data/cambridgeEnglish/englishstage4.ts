import type { CurriculumObjective } from '../curriculumTypes';

/**
 * Cambridge Primary English / Literacy — Stage 4 (Grade 4).
 *
 * `id` values embed the official strand code with Cambridge casing (e.g. `4Rv` not `4RV`),
 * matching notation like `4Rv.01` in the framework — e.g. `ENGL-G4-READ-4Rv01`.
 */
export const cambridgeEnglishStage4: CurriculumObjective[] = [
  {
    id: 'ENGL-G4-READ-4Rw01',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Apply a mix of phonics, grammar, and context clues to accurately decode unfamiliar multisyllabic words.',
    cambridgeStandard:
      '4Rw.01 Use effective strategies to read unfamiliar words accurately and confidently, including using phonic, morphological and grammatical knowledge, segmenting and contextual information.',
    diagnosticTrigger:
      "Student attempts to decode an unknown word strictly by sounding out individual phonemes left-to-right (e.g., sounding out 'unhappiness' letter-by-letter), failing to leverage morphological chunks like prefixes or suffixes to accelerate word recognition.",
  },
  {
    id: 'ENGL-G4-READ-4Rw02',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Identify stressed and unstressed syllables when reading multisyllabic words.',
    cambridgeStandard:
      '4Rw.02 Identify stressed and unstressed syllables in multi-syllabic words.',
    diagnosticTrigger:
      "Student places equal auditory weight on every single syllable of a multisyllabic word (e.g., reading 'elephant' as 'EL-E-PHANT' like a robot), demonstrating a failure to apply natural prosodic stress patterns to polysyllabic English words.",
  },
  {
    id: 'ENGL-G4-READ-4Rw03',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Read common sight words and differentiate between homophones automatically.',
    cambridgeStandard:
      '*4Rw.03 Extend the range of common words recognised on sight, including homophones and near-homophones.',
    diagnosticTrigger:
      "Student repeatedly pauses to sound out high-frequency near-homophones (like 'accept' vs 'except'), showing an inability to instantly recognize the whole-word orthographic string and match it to its specific semantic context.",
  },
  {
    id: 'ENGL-G4-READ-4Rv01',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Use context clues to determine the meaning of an unfamiliar word and suggest a synonym.',
    cambridgeStandard:
      '4Rv.01 Use context to suggest synonyms for unfamiliar words.',
    diagnosticTrigger:
      "Student stops at an unknown word (e.g., 'the dog *slumbered* on the bed') and cannot replace it with a known synonym (like 'slept'), indicating a failure to synthesize the surrounding sentence syntax to extract working meaning.",
  },
  {
    id: 'ENGL-G4-READ-4Rv02',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Identify the common root in a group of words and explain how it affects their meanings.',
    cambridgeStandard:
      '4Rv.02 Explore words with common roots and compare their meanings.',
    diagnosticTrigger:
      "Student treats related words like 'sign', 'signal', and 'signature' as completely isolated vocabulary items, entirely failing to recognize the shared morphological root that links their underlying semantic meaning.",
  },
  {
    id: 'ENGL-G4-READ-4Rv03',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Identify and record powerful words and synonyms from texts to improve writing.',
    cambridgeStandard:
      '*4Rv.03 Identify and record interesting and significant words, and synonyms, from texts to inform own writing.',
    diagnosticTrigger:
      "Student highlights basic functional verbs (e.g., 'said', 'went') when asked to find interesting vocabulary in a mentor text, demonstrating low metalinguistic awareness regarding stylistic word choice.",
  },
  {
    id: 'ENGL-G4-READ-4Rv04',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Use the third or fourth letter of a word to alphabetize and locate it in a dictionary.',
    cambridgeStandard:
      '4Rv.04 Use as many initial letters as necessary to organise words in alphabetical order, and to locate words in dictionaries and glossaries.',
    diagnosticTrigger:
      "Student attempts to look up 'breeze' in a dictionary but stops scanning after the 'br-' section, becoming lost because they fail to utilize the third letter ('e') to narrow down the alphabetical hierarchy.",
  },
  {
    id: 'ENGL-G4-READ-4Rv05',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      "Analyze how an author's choice of strong verbs (e.g., 'rushed' instead of 'went') impacts the reader.",
    cambridgeStandard:
      "4Rv.05 Explore and comment on how a writer's choice of words, including verbs, strengthens the impact on the reader, e.g. rushed instead of went.",
    diagnosticTrigger:
      "Student reads 'he trudged home' but describes the action simply as 'he walked', failing to recognize how the author's specific verb choice conveys the character's physical exhaustion or emotional reluctance.",
  },
  {
    id: 'ENGL-G4-READ-4Rv06',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Recognize the subtle shades of meaning between similar adjectives and adverbs.',
    cambridgeStandard:
      "4Rv.06 Explore and comment on how a writer's choice of words, including adjectives and adverbs, enhances the meaning (shades of meaning).",
    diagnosticTrigger:
      "Student equates the words 'warm', 'hot', and 'scorching' as meaning the exact same thing, demonstrating a lack of semantic precision regarding intensity and scalar gradations of descriptive language.",
  },
  {
    id: 'ENGL-G4-READ-4Rv07',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Identify similes and alliteration in a text and explain what they mean.',
    cambridgeStandard:
      '4Rv.07 Identify and recognise meaning of figurative language in texts, including alliteration and similes, e.g. as … as …',
    diagnosticTrigger:
      "Student reads 'she was as brave as a lion' and takes it literally, assuming the text is discussing actual animal zoology rather than recognizing the comparative structure of a figurative simile.",
  },
  {
    id: 'ENGL-G4-READ-4Rv08',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Explain the effect or impact that a simile or alliteration has on the reader.',
    cambridgeStandard:
      '4Rv.08 Comment on the impact of figurative language in texts, including alliteration and similes.',
    diagnosticTrigger:
      "Student can underline a simile but when asked why the author used it, responds 'to make it longer', completely missing how figurative language is deployed to evoke specific sensory or emotional imagery.",
  },
  {
    id: 'ENGL-G4-READ-4Rg01',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Use punctuation and grammar cues to understand the meaning of unfamiliar texts.',
    cambridgeStandard:
      '4Rg.01 Use knowledge of punctuation and grammar to read unfamiliar texts with understanding.',
    diagnosticTrigger:
      'Student reads a complex, multi-clause sentence in an unfamiliar text and completely loses the main subject, failing to use commas to mentally separate the main clause from the descriptive dependent clauses.',
  },
  {
    id: 'ENGL-G4-READ-4Rg02',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Explain why commas and apostrophes are used in specific sentences.',
    cambridgeStandard:
      '4Rg.02 Explore in texts, and understand, the use of commas and apostrophes.',
    diagnosticTrigger:
      "Student encounters a plural possessive like 'the dogs' bones' and misinterprets it as a contraction or a simple plural, indicating a failure to decode the specific grammatical function of the trailing apostrophe.",
  },
  {
    id: 'ENGL-G4-READ-4Rg03',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Identify the standard layout and punctuation rules for direct speech.',
    cambridgeStandard:
      '4Rg.03 Explore in texts, and understand, the standard layout and punctuation of direct speech.',
    diagnosticTrigger:
      'Student becomes confused during a dialogue-heavy passage, unable to track who is speaking because they do not recognize that a new indented paragraph visually signals a change in speaker.',
  },
  {
    id: 'ENGL-G4-READ-4Rg04',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      "Analyze how different connectives (like 'although' or 'however') change the meaning of a multi-clause sentence.",
    cambridgeStandard:
      '4Rg.04 Explore in texts the use of different connectives in multi-clause sentences.',
    diagnosticTrigger:
      "Student reads a sentence connected by 'although' (e.g., 'Although it rained, we played') but assumes the event was canceled, failing to process the connective as a signal of unexpected contrast.",
  },
  {
    id: 'ENGL-G4-READ-4Rg05',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Locate and highlight connectives (conjunctions) within a text.',
    cambridgeStandard:
      '4Rg.05 Identify connectives in texts.',
    diagnosticTrigger:
      "Student can identify basic coordinating conjunctions like 'and' or 'but' but completely glosses over subordinating connectives like 'because', 'while', or 'until', missing the structural joints of complex sentences.",
  },
  {
    id: 'ENGL-G4-READ-4Rg06',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Understand how quantifiers (e.g., either, neither, both) specify amounts or options in a sentence.',
    cambridgeStandard:
      '4Rg.06 Explore in texts a range of examples of quantifiers, e.g. either, neither, both.',
    diagnosticTrigger:
      "Student reads a sentence using 'neither of the boys' but assumes one of the boys actually performed the action, demonstrating a failure to decode the negative dual exclusion dictated by the quantifier.",
  },
  {
    id: 'ENGL-G4-READ-4Rg07',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Explain the purpose of adverbs and adverbial phrases (how, when, or where an action happened).',
    cambridgeStandard:
      '4Rg.07 Explore in texts examples of adverbs and adverbial phrases, including their purposes.',
    diagnosticTrigger:
      "Student reads 'In the morning, the ship arrived' but cannot answer *when* the ship arrived, failing to recognize the fronted adverbial phrase as setting the temporal context for the verb.",
  },
  {
    id: 'ENGL-G4-READ-4Rg08',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Locate adverbs in a text that describe verbs, adjectives, or other adverbs.',
    cambridgeStandard:
      '4Rg.08 Identify adverbs in texts.',
    diagnosticTrigger:
      "Student consistently misidentifies adverbs ending in '-ly' as adjectives, showing a fundamental grammatical confusion between words that modify nouns versus words that modify actions.",
  },
  {
    id: 'ENGL-G4-READ-4Rg09',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Identify past, present, and future verb tenses and explain how they sequence events in a story.',
    cambridgeStandard:
      '4Rg.09 Explore and understand how past, present and future verb forms are used in texts.',
    diagnosticTrigger:
      "Student reads a paragraph where the author flashes back using the past perfect tense ('he had seen') but interprets the event as happening currently, failing to track temporal shifts encoded in complex verb morphology.",
  },
  {
    id: 'ENGL-G4-READ-4Rg10',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Identify whether a singular or plural verb correctly matches the subject of a sentence.',
    cambridgeStandard:
      '4Rg.10 Explore in texts, and understand, subject-verb agreement.',
    diagnosticTrigger:
      "Student reads a sentence with a collective noun or compound subject (e.g., 'The group of boys are...') but fails to notice the grammatical error, showing weak intuitive monitoring of subject-verb number agreement.",
  },
  {
    id: 'ENGL-G4-READ-4Rs01',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Describe the main stages of a text from the introduction to the conclusion.',
    cambridgeStandard:
      '4Rs.01 Explore and describe the main stages in a text from introduction to conclusion.',
    diagnosticTrigger:
      'Student can recall isolated events from the middle of a story but cannot articulate how the initial problem introduced in chapter one is systematically resolved by the conclusion, lacking macro-level narrative mapping.',
  },
  {
    id: 'ENGL-G4-READ-4Rs02',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Identify the key structural features of poems, playscripts, and informational texts.',
    cambridgeStandard:
      '*4Rs.02 Explore and recognise the key features of text structure in a range of different fiction and non-fiction texts, including poems and playscripts.',
    diagnosticTrigger:
      'Student looks at a playscript and attempts to read the stage directions aloud as if they were spoken dialogue, failing to differentiate the visual formatting cues that separate action from speech.',
  },
  {
    id: 'ENGL-G4-READ-4Rs03',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Explain how ideas are grouped together into paragraphs and sections.',
    cambridgeStandard:
      '4Rs.03 Explore and recognise how ideas are organised in paragraphs and sections.',
    diagnosticTrigger:
      'Student cannot explain why an author started a new paragraph, failing to recognize that paragraph breaks visually signal a shift in topic, time, place, or speaker.',
  },
  {
    id: 'ENGL-G4-READ-4Rs04',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Track how points are logically sequenced and linked across different paragraphs.',
    cambridgeStandard:
      '4Rs.04 Explore and recognise how points are sequenced and linked to develop ideas within and between paragraphs.',
    diagnosticTrigger:
      'Student reads an argument essay but cannot see how the second paragraph builds directly upon the evidence presented in the first paragraph, treating each section as an entirely isolated, disconnected thought bubble.',
  },
  {
    id: 'ENGL-G4-READ-4Ri01',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Differentiate between fiction and non-fiction texts based on their content and library classification.',
    cambridgeStandard:
      '*4Ri.01 Understand the difference between fiction and non-fiction texts and locate books by classification.',
    diagnosticTrigger:
      'Student assumes a historical fiction novel is pure non-fiction simply because it contains real dates and real historical figures, failing to evaluate the presence of fabricated dialogue or invented protagonists.',
  },
  {
    id: 'ENGL-G4-READ-4Ri02',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Analyze how illustrations or multimedia elements contribute to the mood or meaning of a text.',
    cambridgeStandard:
      '*4Ri.02 Read and explore a range of fiction genres, poems and playscripts, including identifying the contribution of any visual elements or multimedia.',
    diagnosticTrigger:
      'Student reads a graphic novel or highly illustrated text but completely ignores the visual panels, missing crucial plot inferences or character subtext that is intentionally absent from the written dialogue.',
  },
  {
    id: 'ENGL-G4-READ-4Ri03',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Identify and compare the typical characteristics of different fiction genres (e.g., fantasy, mystery, historical fiction).',
    cambridgeStandard:
      '*4Ri.03 Identify, discuss and compare different fiction genres and their typical characteristics.',
    diagnosticTrigger:
      'Student cannot identify the genre of a text because they focus strictly on the plot action rather than recognizing the broader structural tropes (like magic systems in fantasy or clue-gathering in mysteries).',
  },
  {
    id: 'ENGL-G4-READ-4Ri04',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Read and navigate various types of non-fiction texts (e.g., reports, explanations, persuasions).',
    cambridgeStandard:
      '*4Ri.04 Read and explore a range of non-fiction text types.',
    diagnosticTrigger:
      'Student attempts to read a non-linear informational text straight through from page 1 to page 50, becoming quickly exhausted because they lack the schema to selectively dip in and out of expository reference material.',
  },
  {
    id: 'ENGL-G4-READ-4Ri05',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Identify the primary purpose of a non-fiction text, specifically noticing how the author tries to persuade the reader.',
    cambridgeStandard:
      '4Ri.05 Identify, discuss and compare the purposes and features of different non-fiction text types, including how texts persuade the reader.',
    diagnosticTrigger:
      'Student reads a persuasive advertisement or opinion column but interprets it as an objective, factual encyclopedia entry, failing to detect the author\'s underlying bias or persuasive linguistic formatting.',
  },
  {
    id: 'ENGL-G4-READ-4Ri06',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Locate explicit facts and direct statements within a range of texts.',
    cambridgeStandard:
      '*4Ri.06 Explore explicit meanings in a range of texts.',
    diagnosticTrigger:
      'Student frequently answers literal reading comprehension questions based on their own personal background knowledge rather than locating the explicitly stated, sometimes contradictory, facts printed in the text.',
  },
  {
    id: 'ENGL-G4-READ-4Ri07',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Identify the key words and phrases that summarize the main idea of a text.',
    cambridgeStandard:
      '4Ri.07 Identify key words and phrases that establish the main points in a text.',
    diagnosticTrigger:
      'Student highlights almost every single sentence in a paragraph when asked to find the main idea, demonstrating an inability to filter out minor supporting details to isolate the core thesis statement.',
  },
  {
    id: 'ENGL-G4-READ-4Ri08',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Use specific quotes from the text to explain how a setting or character is developed.',
    cambridgeStandard:
      '4Ri.08 Explain how settings and characters are developed, identifying key words and phrases from the story.',
    diagnosticTrigger:
      "Student describes a character as 'mean' but is completely unable to point to a specific action, piece of dialogue, or descriptive phrase in the text to prove that assertion, lacking text-based evidentiary skills.",
  },
  {
    id: 'ENGL-G4-READ-4Ri09',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Read between the lines to find implied meanings and subtext.',
    cambridgeStandard:
      '*4Ri.09 Explore implicit meanings in a range of texts.',
    diagnosticTrigger:
      "Student reads 'he slammed the door and stomped away' but cannot infer the character's anger without the author explicitly stating 'he was mad', demonstrating a rigid, literal-only processing of narrative events.",
  },
  {
    id: 'ENGL-G4-READ-4Ri10',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Predict future story events logically based on clues from previous events.',
    cambridgeStandard:
      '4Ri.10 Predict what happens next in a story based on previous events in the story.',
    diagnosticTrigger:
      "Student makes a prediction about the ending that entirely contradicts established character traits and previous plot rules, failing to use the text's internal logic to constrain their forecasting.",
  },
  {
    id: 'ENGL-G4-READ-4Ri11',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Make inferences about the setting or characters using subtle text clues.',
    cambridgeStandard:
      '4Ri.11 Make inferences from texts, including about story settings and characters.',
    diagnosticTrigger:
      "Student cannot deduce the historical time period of a story unless it is explicitly given a date, failing to infer the setting from subtle contextual clues like 'horse-drawn carriages' or 'candlelight'.",
  },
  {
    id: 'ENGL-G4-READ-4Ri12',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Distinguish between statements of proven fact and statements of personal opinion.',
    cambridgeStandard:
      '*4Ri.12 Begin to distinguish between fact and opinion in texts.',
    diagnosticTrigger:
      "Student reads a review stating 'This is the most exciting game ever made' and categorizes it as a proven fact, unable to differentiate subjective evaluative language from objective, verifiable reality.",
  },
  {
    id: 'ENGL-G4-READ-4Ri13',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      "Skim a text quickly to get the overall main idea or 'gist'.",
    cambridgeStandard:
      '4Ri.13 Skim to gain an overall sense of a text.',
    diagnosticTrigger:
      'Student is given one minute to skim a chapter and determine its topic but gets stuck reading the first paragraph word-for-word, lacking the visual pacing skills to jump across headings and topic sentences.',
  },
  {
    id: 'ENGL-G4-READ-4Ri14',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Scan a text efficiently to locate specific information to answer a question.',
    cambridgeStandard:
      '4Ri.14 Locate and use relevant information from a text to answer questions.',
    diagnosticTrigger:
      'Student tries to find a specific date to answer a question by slowly re-reading the entire page aloud from the top, entirely lacking the visual scanning ability to hunt specifically for numerical targets.',
  },
  {
    id: 'ENGL-G4-READ-4Ri15',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Answer comprehension questions by directly referencing a specific point in the text.',
    cambridgeStandard:
      '*4Ri.15 Answer questions with some reference to single points in a text.',
    diagnosticTrigger:
      "Student provides a correct answer but when asked 'where did you find that?', they sweep their hand over the whole page, unable to isolate and pinpoint the specific sentence that contains the supporting evidence.",
  },
  {
    id: 'ENGL-G4-READ-4Ri16',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Identify the underlying theme of a text and compare it to the themes of other texts.',
    cambridgeStandard:
      '4Ri.16 Recognise, compare and contrast the themes and features of texts.',
    diagnosticTrigger:
      "Student can summarize the plot of two different stories perfectly but fails to recognize that both stories share the exact same underlying moral theme of 'bravery in the face of fear', failing to abstract thematic constants.",
  },
  {
    id: 'ENGL-G4-READ-4Ri17',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Identify the viewpoint or perspective from which a story is being told (e.g., first-person vs. third-person).',
    cambridgeStandard:
      '4Ri.17 Identify the viewpoint from which a story is told.',
    diagnosticTrigger:
      "Student reads a first-person narrative ('I walked to the store') but attributes the thoughts to the author rather than the fictional protagonist, confusing the narrator's persona with the literal writer.",
  },
  {
    id: 'ENGL-G4-READ-4Ra01',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Read and enjoy a wide variety of fiction, non-fiction, poems, and plays.',
    cambridgeStandard:
      '*4Ra.01 Enjoy independent and shared reading of fiction genres, poems, playscripts and non-fiction texts.',
    diagnosticTrigger:
      "Student exhibits high reading anxiety and task avoidance whenever confronted with a genre outside their strict comfort zone (e.g., refusing to read a poem because they 'only read chapter books'), indicating low genre flexibility.",
  },
  {
    id: 'ENGL-G4-READ-4Ra02',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Connect characters and events in a story directly to your own personal life experiences.',
    cambridgeStandard:
      '4Ra.02 Express personal responses to texts, including linking characters, settings and events to personal experience.',
    diagnosticTrigger:
      'Student can answer literal questions about a character\'s conflict but stares blankly when asked if they have ever felt a similar way, displaying a barrier in synthesizing narrative empathy with autobiographical memory.',
  },
  {
    id: 'ENGL-G4-READ-4Ra03',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      'Develop personal reading preferences and recommend favorite books to peers.',
    cambridgeStandard:
      '4Ra.03 Develop preferences about favourite books and share recommendations with others.',
    diagnosticTrigger:
      'Student cannot name a favorite book or author when asked, relying entirely on the teacher to select all reading material, which demonstrates a lack of intrinsic reading identity and unformed personal taste.',
  },
  {
    id: 'ENGL-G4-READ-4Ra04',
    gradeLevel: 4,
    domain: 'Reading',
    ixlStyleSkill:
      "Explain how a story's historical time period or cultural setting influences the plot.",
    cambridgeStandard:
      '4Ra.04 Comment on how fiction reflects the time or context in which it is set.',
    diagnosticTrigger:
      "Student reads a historical fiction story set in the 1800s and repeatedly asks why the characters don't just 'call someone on the phone', failing to contextualize the narrative within its established temporal constraints.",
  },
  {
    id: 'ENGL-G4-WRIT-4Ww01',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      'Spell words with silent letters (e.g., knife, lamb) and unusual vowel spellings (e.g., water, young).',
    cambridgeStandard:
      "4Ww.01 Explore and use silent letters (e.g. knife, lamb) and different spellings of words with vowel phonemes (e.g. short vowel phonemes: umbrella, young and love ('o' before 'v'); long vowel phonemes after 'w': want, war, water, word).",
    diagnosticTrigger:
      "Student spells words purely phonetically, systematically dropping unvoiced letters (writing 'nife' instead of 'knife' or 'lam' for 'lamb'), failing to map historical, non-phonetic orthographic structures.",
  },
  {
    id: 'ENGL-G4-WRIT-4Ww02',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      "Apply spelling rules for plural nouns, including changing 'y' to 'ies' or 'f' to 'ves'.",
    cambridgeStandard:
      '4Ww.02 Explore and use spelling patterns for pluralisation, including -s, -es, -y/-ies and -f/-ves.',
    diagnosticTrigger:
      "Student simply tacks an '-s' onto the end of irregular base words (writing 'puppys' instead of 'puppies' or 'halfs' instead of 'halves'), demonstrating a failure to apply complex morphological transformation rules.",
  },
  {
    id: 'ENGL-G4-WRIT-4Ww03',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      'Spell words with advanced prefixes (trans-, pre-) and suffixes (-ion, -ation, -ous).',
    cambridgeStandard:
      '4Ww.03 Spell words with a range of common prefixes and suffixes, including trans-, pre-, -ion, -ation and -ous.',
    diagnosticTrigger:
      "Student spells complex suffixes phonetically rather than orthographically (e.g., writing 'acshun' instead of 'action' or 'famus' instead of 'famous'), showing a lack of visual memory for bound morphemes.",
  },
  {
    id: 'ENGL-G4-WRIT-4Ww04',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      'Use the spelling of a base root word to help spell related words (e.g., sign, signal, signature).',
    cambridgeStandard:
      '4Ww.04 Explore and build words with related roots and meanings, e.g. medical, medicine; sign, signal, signature.',
    diagnosticTrigger:
      "Student spells 'signal' correctly but spells 'sign' as 'sine', failing to utilize the morphological relationship between word families to deduce the presence of the silent 'g'.",
  },
  {
    id: 'ENGL-G4-WRIT-4Ww05',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      "Choose the correct spelling of homophones based on grammar, especially they're, their, and there.",
    cambridgeStandard:
      '4Ww.05 Spell common homophones correctly to match their grammatical purpose, including they’re, their, there.',
    diagnosticTrigger:
      "Student writes 'I went their' or 'There going home', indicating they retrieve spellings purely by phonetic sound without cross-referencing the required syntactical or possessive grammatical context.",
  },
  {
    id: 'ENGL-G4-WRIT-4Ww06',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      "Spell words containing the 'ough' letter string but with different pronunciations (tough, through, plough).",
    cambridgeStandard:
      '4Ww.06 Spell words with common letter strings but different pronunciations, e.g. tough, through, trough, plough.',
    diagnosticTrigger:
      "Student spells 'tough' as 'tuff' and 'through' as 'thru', relying entirely on direct phonetic transcription because they have not internalized the highly irregular, visually distinct 'ough' grapheme string.",
  },
  {
    id: 'ENGL-G4-WRIT-4Ww07',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      'Figure out and apply spelling rules by looking at patterns across multiple words.',
    cambridgeStandard:
      '4Ww.07 Generate spelling rules from spelling patterns, and test them.',
    diagnosticTrigger:
      "Student learns to double the consonant in 'running' but fails to apply the same structural logic to 'hitting', unable to abstract a generalized spelling rule (CVC doubling) from a specific instance.",
  },
  {
    id: 'ENGL-G4-WRIT-4Ww08',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      'Use a mix of chunking, spelling rules, and memory tricks to spell difficult words.',
    cambridgeStandard:
      '4Ww.08 Use effective strategies, including segmenting, spelling rules, visual memory and mnemonics, to spell a range of unfamiliar regular and exception words correctly.',
    diagnosticTrigger:
      "Student repeatedly erases and guesses at a long word, becoming frustrated, rather than breaking it down into manageable morphological chunks or applying a known mnemonic device, showing a lack of independent spelling stamina.",
  },
  {
    id: 'ENGL-G4-WRIT-4Ww09',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      'Use dictionaries, spell-checkers, and personal spelling logs to fix misspelled words.',
    cambridgeStandard:
      '*4Ww.09 Use paper-based and on-screen tools to find the correct spelling of words; keep and use spelling logs of misspelt words, and identify words that need to be learned.',
    diagnosticTrigger:
      'Student sees a red spell-check underline on the computer but ignores it, or guesses randomly at a dictionary entry, lacking the self-monitoring and navigational skills required to independently verify correct orthography.',
  },
  {
    id: 'ENGL-G4-WRIT-4Wv01',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      'Use specialized and technical vocabulary accurately when writing about specific topics.',
    cambridgeStandard:
      '*4Wv.01 Use specialised vocabulary accurately to match a familiar topic.',
    diagnosticTrigger:
      "Student writes a science report about the water cycle but relies entirely on generic phrases like 'the water goes up' instead of deploying targeted, domain-specific vocabulary like 'evaporation', indicating weak lexical retrieval.",
  },
  {
    id: 'ENGL-G4-WRIT-4Wv02',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      "Replace boring, overused words (like 'said', 'good', 'went') with more precise alternatives.",
    cambridgeStandard:
      '4Wv.02 Explore and use alternatives for overused words and phrases.',
    diagnosticTrigger:
      "Student's narrative draft contains the word 'nice' or 'went' seven times on a single page, demonstrating a restricted active vocabulary and a failure to utilize synonyms to elevate prose quality.",
  },
  {
    id: 'ENGL-G4-WRIT-4Wv03',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      'Choose the exact right adjective or adverb to show the precise shade of meaning (e.g., warm vs. boiling).',
    cambridgeStandard:
      '4Wv.03 Explore shades of meaning in adjectives and adverbs (e.g. tepid, warm, hot), and use them appropriately in own writing.',
    diagnosticTrigger:
      "Student describes a character whose house just burned down as 'sad' rather than 'devastated', failing to match the scalar intensity of the adjective to the extreme context of the narrative event.",
  },
  {
    id: 'ENGL-G4-WRIT-4Wv04',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      'Use powerful, active verbs to make writing more exciting and impactful.',
    cambridgeStandard:
      '4Wv.04 Choose and use words (including verbs, e.g. rushed instead of went) to strengthen the impact of writing.',
    diagnosticTrigger:
      "Student writes 'the lion ran at the man' instead of 'the lion charged the man', missing the stylistic opportunity to use a highly specific action verb to build tension and vivid imagery.",
  },
  {
    id: 'ENGL-G4-WRIT-4Wv05',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      'Include similes (comparisons using like or as) and alliteration in your writing.',
    cambridgeStandard:
      '4Wv.05 Use simple figurative language, including alliteration and similes.',
    diagnosticTrigger:
      "Student writes purely literal, functional descriptions (e.g., 'the snow was cold and white') and struggles when prompted to compare it to something else, showing a cognitive block in generating analogical figurative imagery.",
  },
  {
    id: 'ENGL-G4-WRIT-4Wv06',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      'Use a thesaurus or personal word lists to deliberately upgrade the vocabulary in a draft.',
    cambridgeStandard:
      '*4Wv.06 Use own lists of interesting and significant words, dictionaries and thesauruses to extend the range of vocabulary used in written work.',
    diagnosticTrigger:
      'Student finishes a first draft and refuses to revise any vocabulary, completely unprompted to independently consult a classroom word wall or thesaurus to elevate their initial, basic lexical choices.',
  },
  {
    id: 'ENGL-G4-WRIT-4Wg01',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      'Consistently place the correct punctuation mark at the end of every sentence.',
    cambridgeStandard:
      '4Wg.01 Consistently use accurate end-of-sentence punctuation.',
    diagnosticTrigger:
      'Student frequently writes comma splices or massive run-on paragraphs, demonstrating a systemic failure to recognize the syntactic boundaries that require terminal punctuation marks.',
  },
  {
    id: 'ENGL-G4-WRIT-4Wg02',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      'Use commas to separate clauses and make the meaning of a sentence clear.',
    cambridgeStandard:
      '4Wg.02 Begin to use commas to make the meaning of sentences clearer.',
    diagnosticTrigger:
      "Student writes a complex introductory phrase (e.g., 'After we ate the dog went to sleep') but omits the comma, creating a temporary, confusing misreading ('After we ate the dog'), failing to use punctuation for syntactic disambiguation.",
  },
  {
    id: 'ENGL-G4-WRIT-4Wg03',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      "Use apostrophes correctly to show singular possession (boy's) and plural possession (boys').",
    cambridgeStandard:
      '4Wg.03 Use apostrophes for singular and plural possession.',
    diagnosticTrigger:
      "Student consistently places the possessive apostrophe before the 's' on plural nouns (e.g., writing 'the dog's bones' when referring to multiple dogs), showing confusion over the spatial placement rule for plural possession.",
  },
  {
    id: 'ENGL-G4-WRIT-4Wg04',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      'Punctuate direct speech correctly, including commas before closing speech marks.',
    cambridgeStandard:
      '4Wg.04 Begin to use other punctuation alongside speech marks to punctuate direct speech.',
    diagnosticTrigger:
      'Student uses quotation marks but forgets to include the internal comma or terminal punctuation before the closing mark (e.g., writing "Stop" he said instead of "Stop," he said), missing the interior syntax rules of dialogue.',
  },
  {
    id: 'ENGL-G4-WRIT-4Wg05',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      'Write multi-clause sentences using a variety of conjunctions (e.g., although, because, until).',
    cambridgeStandard:
      '4Wg.05 Write multi-clause sentences using a range of connectives.',
    diagnosticTrigger:
      "Student writes exclusively using short, simple sentences or relies solely on the conjunction 'and', indicating an inability to construct complex syntactic relationships using subordinating connectives.",
  },
  {
    id: 'ENGL-G4-WRIT-4Wg06',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      'Keep verb tenses consistent and accurate across past, present, and future forms.',
    cambridgeStandard:
      '4Wg.06 Use past, present and future verb forms accurately.',
    diagnosticTrigger:
      'Student begins a narrative in the past tense but accidentally drifts into present tense during an action sequence, indicating a failure to maintain macro-level temporal continuity via strict verb morphology.',
  },
  {
    id: 'ENGL-G4-WRIT-4Wg07',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      'Use a mix of verb tenses purposefully, especially to differentiate narrator thoughts from character dialogue.',
    cambridgeStandard:
      '4Wg.07 Experiment with varying verb forms in texts, including in direct speech.',
    diagnosticTrigger:
      'Student writes dialogue for a character entirely in the past tense to match the surrounding narrative (e.g., He said, "I was going to the store right now"), failing to shift tense to represent the character\'s immediate, present moment.',
  },
  {
    id: 'ENGL-G4-WRIT-4Wg08',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      "Use the correct form of the verb 'to be' (am, is, are, was, were) to match the subject.",
    cambridgeStandard:
      '4Wg.08 Use the verb to be accurately, including subject-verb agreement for different verb forms.',
    diagnosticTrigger:
      "Student writes sentences with severe number disagreement (e.g., 'The group of dogs was running' or 'We is going'), indicating a breakdown in morphosyntactic matching rules for irregular auxiliary verbs.",
  },
  {
    id: 'ENGL-G4-WRIT-4Wg09',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      "Use specific quantifiers like 'either', 'neither', or 'both' correctly to describe amounts.",
    cambridgeStandard:
      '4Wg.09 Use a range of quantifiers appropriately for the context, e.g. either, neither, both.',
    diagnosticTrigger:
      "Student writes 'Neither of the boys are going' but uses a plural verb, or uses 'either' when referring to three or more options, demonstrating poor grammatical control over exclusive dual quantifiers.",
  },
  {
    id: 'ENGL-G4-WRIT-4Wg10',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      'Use adverbs and adverbial phrases to describe exactly how, when, or where an action happened.',
    cambridgeStandard:
      '4Wg.10 Use adverbs and adverbial phrases appropriately.',
    diagnosticTrigger:
      'Student writes a detailed action sequence but relies entirely on adjectives modifying nouns, failing to utilize adverbs to specify the manner, speed, or location of the actual verbs.',
  },
  {
    id: 'ENGL-G4-WRIT-4Ws01',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      'Organize ideas in a logical sequence, ensuring one point connects clearly to the next.',
    cambridgeStandard:
      '4Ws.01 Develop a logical sequence of ideas, making relationships between them clear.',
    diagnosticTrigger:
      'Student writes an informational piece that jumps erratically from habitat, to diet, back to habitat, and then to lifespan, demonstrating a severe lack of macro-structural thematic sequencing.',
  },
  {
    id: 'ENGL-G4-WRIT-4Ws02',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      'Use paragraphs consistently to group related ideas together.',
    cambridgeStandard:
      '4Ws.02 Use paragraphs and sections consistently to organise ideas.',
    diagnosticTrigger:
      'Student writes a two-page narrative as one massive, unbroken block of text, completely failing to utilize spatial paragraph breaks to signal shifts in time, location, or speaker.',
  },
  {
    id: 'ENGL-G4-WRIT-4Ws03',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      "Start new paragraphs with transition words (like 'although' or 'meanwhile') to link sections smoothly.",
    cambridgeStandard:
      '4Ws.03 Use connectives to establish links between paragraphs, e.g. if, although.',
    diagnosticTrigger:
      "Student starts every new paragraph abruptly with a noun or pronoun (e.g., 'The next day.', 'He went.'), entirely omitting cohesive transition phrases that build logical bridges between major text sections.",
  },
  {
    id: 'ENGL-G4-WRIT-4Ws04',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      'Use formatting features like bulleted lists and numbered steps to organize non-fiction text.',
    cambridgeStandard:
      '*4Ws.04 Use organisational features appropriate to the text type, e.g. bulleted and numbered lists.',
    diagnosticTrigger:
      'Student attempts to write a procedural manual using dense, flowing narrative paragraphs, completely failing to employ the numbered lists structurally expected for step-by-step informational instructions.',
  },
  {
    id: 'ENGL-G4-WRIT-4Wc01',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      'Write creative stories and poems across a variety of distinct genres.',
    cambridgeStandard:
      '*4Wc.01 Develop creative writing in a range of different genres of fiction and types of poems.',
    diagnosticTrigger:
      'Student is tasked with writing a mystery but produces a standard, conflict-free recount of a day at school, unable to cognitively adapt their creative ideation to fit genre-specific constraints and tropes.',
  },
  {
    id: 'ENGL-G4-WRIT-4Wc02',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      'Use different planning methods (like mind maps or outlines) to organize ideas before writing.',
    cambridgeStandard:
      '4Wc.02 Explore and use different ways of planning to inform writing for particular purposes.',
    diagnosticTrigger:
      'Student refuses to outline an argumentative essay, diving straight into writing and immediately getting lost in repetitive loops because they lack the working memory to plan syntax and structure simultaneously.',
  },
  {
    id: 'ENGL-G4-WRIT-4Wc03',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      'Create detailed character profiles before writing a story to guide character behavior.',
    cambridgeStandard:
      '4Wc.03 Write character profiles to inform story writing.',
    diagnosticTrigger:
      "Student's characters act randomly and inconsistently from scene to scene because the student failed to establish underlying character traits, motivations, or flaws during the pre-writing phase.",
  },
  {
    id: 'ENGL-G4-WRIT-4Wc04',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      'Write vivid descriptions of settings and characters that paint a clear picture for the reader.',
    cambridgeStandard:
      "4Wc.04 Develop descriptions of settings and characters to capture the reader's imagination.",
    diagnosticTrigger:
      "Student introduces a new setting by simply stating 'They went to the forest', offering zero sensory details or adjectives, leaving the narrative entirely devoid of atmospheric imagery.",
  },
  {
    id: 'ENGL-G4-WRIT-4Wc05',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      'Rewrite the beginning or ending of a story to change the outcome or mood.',
    cambridgeStandard:
      '4Wc.05 Write alternative beginnings and endings for stories.',
    diagnosticTrigger:
      'Student is tasked with writing an alternate ending but simply summarizes the original ending again in slightly different words, showing an inability to creatively diverge from an established narrative track.',
  },
  {
    id: 'ENGL-G4-WRIT-4Wc06',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      "Show a character's unique viewpoint or attitude by describing how they react to a setting or event.",
    cambridgeStandard:
      '4Wc.06 Begin to express a viewpoint in fiction through a character\'s opinions about a setting or other characters.',
    diagnosticTrigger:
      "Student writes a scene from the perspective of an angry character but describes the setting in a cheerful, objective tone, failing to filter the environmental description through the psychological lens of the narrator.",
  },
  {
    id: 'ENGL-G4-WRIT-4Wc07',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      'Write an original playscript using character names, colons, and stage directions.',
    cambridgeStandard:
      '4Wc.07 Write a simple original playscript.',
    diagnosticTrigger:
      "Student attempts to write a scene for a play but embeds the character's actions directly into their spoken dialogue lines rather than utilizing isolated, bracketed stage directions.",
  },
  {
    id: 'ENGL-G4-WRIT-4Wc08',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      'Adjust your vocabulary, tone, and text features to match the specific purpose of the writing.',
    cambridgeStandard:
      '*4Wc.08 Develop writing for a purpose using language and features appropriate for a range of text types.',
    diagnosticTrigger:
      "Student writes a formal scientific explanation using casual slang ('it gets super hot and stuff'), demonstrating a severe inability to adjust pragmatic tone to match a utilitarian, objective text type.",
  },
  {
    id: 'ENGL-G4-WRIT-4Wc09',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      'Write texts specifically designed for a target audience, ensuring the content is appropriate and engaging for them.',
    cambridgeStandard:
      '*4Wc.09 Develop writing of a range of text types for a specified audience, using appropriate content and language.',
    diagnosticTrigger:
      'Student writes a persuasive letter meant for the school principal but uses an aggressive, demanding tone without formal structure, failing entirely to engage in audience-appropriate perspective-taking.',
  },
  {
    id: 'ENGL-G4-WRIT-4Wc10',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      'Adopt and maintain a clear, consistent viewpoint when writing a persuasive or opinion piece.',
    cambridgeStandard:
      '4Wc.10 Adopt a viewpoint in non-fiction writing that is appropriate for the purpose and audience.',
    diagnosticTrigger:
      'Student writes a persuasive essay arguing to ban homework but halfway through begins listing the major benefits of homework without refuting them, undermining their own thesis due to a lack of argumentative cohesion.',
  },
  {
    id: 'ENGL-G4-WRIT-4Wp01',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      'Write legibly, smoothly, and quickly enough to keep up with your thoughts.',
    cambridgeStandard:
      '4Wp.01 Write legibly, fluently and with increasing speed.',
    diagnosticTrigger:
      'Student physically writes so slowly and laboriously that they lose their train of thought mid-sentence, indicating that fine motor execution has not yet become automatic, severely bottlenecking cognitive output.',
  },
  {
    id: 'ENGL-G4-WRIT-4Wp02',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      'Take short, bulleted notes from a text to gather facts before writing a report.',
    cambridgeStandard:
      '4Wp.02 Make short notes to record information from a text and use them to inform writing.',
    diagnosticTrigger:
      'Student attempts to take notes by copying entire massive paragraphs verbatim from the source material, completely lacking the ability to synthesize and condense complex text into isolated key phrases.',
  },
  {
    id: 'ENGL-G4-WRIT-4Wp03',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      'Choose the best layout for a piece of writing, utilizing handwriting, typing, or visual design elements.',
    cambridgeStandard:
      '*4Wp.03 Explore and use different ways of laying out and presenting texts to suit the purpose and audience (handwritten, printed and onscreen).',
    diagnosticTrigger:
      'Student is tasked with creating an engaging digital presentation but presents a single slide filled with dense, unformatted 10-point font, failing to utilize spatial layout and white space for audience readability.',
  },
  {
    id: 'ENGL-G4-WRIT-4Wp04',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      "Read your own and peers' drafts critically to suggest improvements for meaning and flow.",
    cambridgeStandard:
      '*4Wp.04 Evaluate own and others’ writing, suggesting improvements for sense, accuracy and content.',
    diagnosticTrigger:
      "Student reviews a peer's highly confusing, logically flawed draft and simply writes 'Good job,' unable to adopt a critical, editorial lens to identify semantic gaps or structural weaknesses.",
  },
  {
    id: 'ENGL-G4-WRIT-4Wp05',
    gradeLevel: 4,
    domain: 'Writing',
    ixlStyleSkill:
      'Proofread your final draft to catch and fix spelling, grammar, and punctuation errors.',
    cambridgeStandard:
      '*4Wp.05 Proofread for grammar, spelling and punctuation errors, and make corrections, including using on-screen tools.',
    diagnosticTrigger:
      'Student submits a final typed draft filled with red squiggly spell-check lines, lacking the metacognitive self-monitoring reflex to pause and execute mechanical corrections before completion.',
  },
  {
    id: 'ENGL-G4-SPKL-4SLm01',
    gradeLevel: 4,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Speak accurately and at length to explain ideas or tell stories in familiar settings.',
    cambridgeStandard:
      '4SLm.01 Speak with accuracy and sometimes at length in a range of familiar contexts.',
    diagnosticTrigger:
      'Student speaks in brief, highly fragmented sentences and trails off constantly when trying to explain a complex idea, unable to sustain the oral syntactic planning required for extended discourse.',
  },
  {
    id: 'ENGL-G4-SPKL-4SLm02',
    gradeLevel: 4,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Sequence your information logically so the listener can easily follow your explanation.',
    cambridgeStandard:
      "4SLm.02 Sequence relevant information to aid the listener's understanding.",
    diagnosticTrigger:
      'Student explains the rules of a game by starting with the winning condition, jumping to a random mid-game rule, and finally explaining how to set up the board, totally lacking logical chronological sequencing.',
  },
  {
    id: 'ENGL-G4-SPKL-4SLm03',
    gradeLevel: 4,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Choose exact, precise words to make your spoken meaning perfectly clear.',
    cambridgeStandard:
      '4SLm.03 Use vocabulary precisely to make the meaning clear.',
    diagnosticTrigger:
      "Student repeatedly uses vague, generalized language ('He got the thing and put it in the other thing') while giving an oral presentation, indicating poor expressive retrieval of specific nominal vocabulary.",
  },
  {
    id: 'ENGL-G4-SPKL-4SLm04',
    gradeLevel: 4,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Use body language, facial expressions, and hand gestures intentionally to support your message.',
    cambridgeStandard:
      '*4SLm.04 Use non-verbal communication techniques for different purposes.',
    diagnosticTrigger:
      "Student attempts to convey an urgent, exciting point during a debate but maintains a completely rigid posture, drooping shoulders, and flat facial affect, failing to align physical kinesics with verbal intent.",
  },
  {
    id: 'ENGL-G4-SPKL-4SLm05',
    gradeLevel: 4,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Adjust your speaking volume, tone, and language to match and engage your specific audience.',
    cambridgeStandard:
      '*4SLm.05 Show awareness of an audience, e.g. by adapting language and tone to engage them.',
    diagnosticTrigger:
      'Student presents a historical report to the class by staring strictly at their cue cards and droning in a quiet monotone, entirely oblivious to the fact that the audience has completely disengaged.',
  },
  {
    id: 'ENGL-G4-SPKL-4SLs01',
    gradeLevel: 4,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Listen actively and ask deep, follow-up questions to develop the speaker\'s ideas further.',
    cambridgeStandard:
      '4SLs.01 Listen and respond appropriately, including asking and answering questions to develop ideas.',
    diagnosticTrigger:
      "Student listens to a peer's detailed presentation but can only muster a generic 'Good job' during the Q&A, unable to synthesize the content into a targeted, probing follow-up question.",
  },
  {
    id: 'ENGL-G4-SPKL-4SLg01',
    gradeLevel: 4,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Take on and responsibly perform an assigned role (like facilitator or scribe) in a group project.',
    cambridgeStandard:
      '*4SLg.01 Begin to take an assigned role within a group.',
    diagnosticTrigger:
      "Student is assigned the role of 'discussion leader' but completely abandons the responsibility, either staying entirely silent or just doing the worksheet independently, failing to adhere to collaborative parameters.",
  },
  {
    id: 'ENGL-G4-SPKL-4SLg02',
    gradeLevel: 4,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      "Politely disagree with someone else's opinion by respectfully explaining your own viewpoint.",
    cambridgeStandard:
      '*4SLg.02 Respond politely to another point of view with a personal point of view.',
    diagnosticTrigger:
      "Student reacts to a peer's differing scientific hypothesis by immediately snapping 'No, that's stupid!' rather than employing a softening conversational frame like 'I see it differently because...', lacking verbal moderation skills.",
  },
  {
    id: 'ENGL-G4-SPKL-4SLg03',
    gradeLevel: 4,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Keep a group discussion moving by adding relevant comments or asking helpful questions.',
    cambridgeStandard:
      '4SLg.03 Extend a discussion by contributing relevant comments and questions.',
    diagnosticTrigger:
      'Student consistently derails group focus by interjecting completely off-topic personal anecdotes during a structured academic debate, unable to sustain shared semantic attention.',
  },
  {
    id: 'ENGL-G4-SPKL-4SLg04',
    gradeLevel: 4,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Take turns speaking by explicitly connecting your thoughts to what the previous person just said.',
    cambridgeStandard:
      '4SLg.04 Take turns in a discussion, making links with what others have said.',
    diagnosticTrigger:
      "Student waits for a peer to finish speaking but immediately launches into their own completely unrelated pre-planned point, showing a failure to actively bridge or validate the prior speaker's input.",
  },
  {
    id: 'ENGL-G4-SPKL-4SLp01',
    gradeLevel: 4,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Read aloud dynamically, changing your pace and volume to match the mood of the text.',
    cambridgeStandard:
      '4SLp.01 Read aloud with expression, adapting the pace and volume appropriate to the content.',
    diagnosticTrigger:
      'Student reads a highly suspenseful, terrifying paragraph with the exact same slow, lethargic pacing as a factual textbook index, failing to adjust reading prosody to match the semantic tone.',
  },
  {
    id: 'ENGL-G4-SPKL-4SLp02',
    gradeLevel: 4,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Read aloud smoothly and accurately, using punctuation (commas, dashes, periods) to guide your breath and phrasing.',
    cambridgeStandard:
      '4SLp.02 Read aloud with accuracy and fluency, showing awareness of punctuation.',
    diagnosticTrigger:
      "Student barrels rapidly through a complex sentence containing a semi-colon and multiple commas without taking a single breath, destroying the syntactical structure and obscuring the intended meaning for the listener.",
  },
  {
    id: 'ENGL-G4-SPKL-4SLp03',
    gradeLevel: 4,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Change your voice, physical gestures, and movement to accurately portray a specific character in a drama.',
    cambridgeStandard:
      '4SLp.03 Adapt speech, gesture and movement to portray a character in drama.',
    diagnosticTrigger:
      'Student is cast as an aggressive, loud character but delivers all their lines standing perfectly still with their arms at their sides in a quiet voice, unable to physically embody dramatic persona traits.',
  },
  {
    id: 'ENGL-G4-SPKL-4SLp04',
    gradeLevel: 4,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Plan and deliver a structured presentation as part of a group to an audience.',
    cambridgeStandard:
      '4SLp.04 Plan and deliver a group presentation on a familiar subject, including to a wider audience.',
    diagnosticTrigger:
      'Student attempts to present their slide but constantly looks over at their group members for help, having failed to organize speaking roles or rehearse the structural transitions beforehand.',
  },
  {
    id: 'ENGL-G4-SPKL-4SLr01',
    gradeLevel: 4,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      "Evaluate your own or a peer's presentation, pointing out specific strengths and areas for improvement.",
    cambridgeStandard:
      "*4SLr.01 Begin to evaluate own and others' talk, including what went well and what could be improved next time.",
    diagnosticTrigger:
      "Student evaluates a peer's presentation by saying 'It was nice,' but completely freezes when asked for one specific piece of constructive, technical feedback, lacking a critical framework to assess oral delivery.",
  },
  {
    id: 'ENGL-G4-SPKL-4SLr02',
    gradeLevel: 4,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Explain how the meaning of a sentence changes depending on the speaker\'s tone of voice or body language.',
    cambridgeStandard:
      '4SLr.02 Comment on the ways that meaning can be expressed verbally and non-verbally in different contexts.',
    diagnosticTrigger:
      "Student takes a highly sarcastic verbal statement (e.g., 'Oh, great job dropping that') completely literally, failing to synthesize the speaker's rolling eyes and exaggerated tone as non-verbal modifiers that invert the text.",
  },
];
