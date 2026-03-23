import type { CurriculumObjective } from '../curriculumTypes';

/**
 * Cambridge Primary English / Literacy — Stage 6 (Grade 6).
 *
 * `id` values embed the official strand code with Cambridge casing (e.g. `6Rv` not `6RV`),
 * matching notation like `6Rv.01` in the framework — e.g. `ENGL-G6-READ-6Rv01`.
 */
export const cambridgeEnglishStage6: CurriculumObjective[] = [
  {
    id: 'ENGL-G6-READ-6Rv01',
    gradeLevel: 6,
    domain: 'Reading',
    ixlStyleSkill:
      'Determine the meaning of archaic or complex phrases using context clues.',
    cambridgeStandard:
      '6Rv.01 Deduce the meanings of unfamiliar phrases from their context, including phrases which are no longer common in modern times.',
    diagnosticTrigger:
      "Student interprets archaic idioms with strict literalism (e.g., reading 'fain would I' as a physical desire for a person named Fain), failing to inhibit primary semantic meanings in favor of contextually-derived historical schemas.",
  },
  {
    id: 'ENGL-G6-READ-6Rv02',
    gradeLevel: 6,
    domain: 'Reading',
    ixlStyleSkill:
      'Analyze word origins and how foreign languages influence English vocabulary.',
    cambridgeStandard:
      '6Rv.02 Explore word origins and derivations, including the use of words from other languages.',
    diagnosticTrigger:
      "Student treats etymologically related words as entirely isolated units, failing to utilize morphological roots (e.g., 'tele-' or 'aqua-') to decode meaning across different word families.",
  },
  {
    id: 'ENGL-G6-READ-6Rv03',
    gradeLevel: 6,
    domain: 'Reading',
    ixlStyleSkill:
      'Curate and categorize interesting vocabulary and synonyms from reading for use in writing.',
    cambridgeStandard:
      '*6Rv.03 Identify and record interesting and significant words, and synonyms, from texts to inform own writing.',
    diagnosticTrigger:
      'Student selects only ubiquitous, high-frequency words for their word bank, demonstrating a lack of metalinguistic awareness regarding the nuanced impact of Tier 2 and Tier 3 vocabulary.',
  },
  {
    id: 'ENGL-G6-READ-6Rv04',
    gradeLevel: 6,
    domain: 'Reading',
    ixlStyleSkill:
      "Evaluate how a writer's specific language choices affect the reader's experience.",
    cambridgeStandard:
      "6Rv.04 Comment on a writer's choice of language, demonstrating some awareness of the impact on the reader.",
    diagnosticTrigger:
      "Student describes a text's effect using vague emotional terms (e.g., 'it is good') but cannot link that reaction back to specific lexical devices like emotive verbs or sensory adjectives.",
  },
  {
    id: 'ENGL-G6-READ-6Rv05',
    gradeLevel: 6,
    domain: 'Reading',
    ixlStyleSkill:
      'Identify and interpret common figurative expressions and idioms.',
    cambridgeStandard:
      '6Rv.05 Explore commonly used figurative expressions, e.g. as cool as a cucumber, crying crocodile tears.',
    diagnosticTrigger:
      'Student displays cognitive confusion when an idiom contradicts the literal visual scene, unable to suppress the literal image to access the culturally-stored metaphorical meaning.',
  },
  {
    id: 'ENGL-G6-READ-6Rv06',
    gradeLevel: 6,
    domain: 'Reading',
    ixlStyleSkill:
      'Explain how figurative language builds complex imagery beyond the literal level.',
    cambridgeStandard:
      '*6Rv.06 Begin to explain how figurative language creates imagery in texts and takes understanding beyond the literal.',
    diagnosticTrigger:
      'Student can identify a metaphor but fails to explain the abstract quality being compared, focusing only on the two literal objects mentioned rather than the shared characteristic.',
  },
  {
    id: 'ENGL-G6-READ-6Rg01',
    gradeLevel: 6,
    domain: 'Reading',
    ixlStyleSkill:
      'Interpret advanced punctuation markers like colons, semicolons, and ellipses in complex texts.',
    cambridgeStandard:
      '6Rg.01 Explore in texts, and understand, the uses of colons, semi-colons, ellipses, parenthetic commas, dashes and brackets.',
    diagnosticTrigger:
      "Student ignores high-level punctuation cues during oral reading, treating semicolons as full stops and parenthetic dashes as errors, which results in a total collapse of the sentence's hierarchical logic.",
  },
  {
    id: 'ENGL-G6-READ-6Rg02',
    gradeLevel: 6,
    domain: 'Reading',
    ixlStyleSkill:
      'Identify main and subordinate clauses to understand the structure of complex sentences.',
    cambridgeStandard:
      '6Rg.02 Identify the main clause and other clauses (subordinate clauses) in a complex sentence.',
    diagnosticTrigger:
      'Student misidentifies the subordinate clause as the main action of the sentence, showing an inability to distinguish between the core proposition and the supplementary information.',
  },
  {
    id: 'ENGL-G6-READ-6Rg03',
    gradeLevel: 6,
    domain: 'Reading',
    ixlStyleSkill:
      'Analyze how sentence length and variety influence the rhythm and impact of a text.',
    cambridgeStandard:
      "6Rg.03 Begin to show awareness of the impact of a writer's choices of sentence length and structure.",
    diagnosticTrigger:
      'Student fails to notice the change in pace created by short, staccato sentences in a suspenseful passage, reading them with the same elongated cadence as a descriptive paragraph.',
  },
  {
    id: 'ENGL-G6-READ-6Rg04',
    gradeLevel: 6,
    domain: 'Reading',
    ixlStyleSkill:
      'Understand how relative pronouns (who, which, that) introduce descriptive detail.',
    cambridgeStandard:
      '6Rg.04 Explore how different relative pronouns are used in texts to introduce additional detail.',
    diagnosticTrigger:
      'Student loses the antecedent of a relative pronoun in a complex sentence, resulting in the misattribution of a characteristic to the wrong noun.',
  },
  {
    id: 'ENGL-G6-READ-6Rg05',
    gradeLevel: 6,
    domain: 'Reading',
    ixlStyleSkill:
      'Categorize words into classes and explain their grammatical functions.',
    cambridgeStandard:
      '6Rg.05 Identify different word classes in texts and understand their purposes.',
    diagnosticTrigger:
      'Student consistently mislabels adverbs as adjectives or prepositions as conjunctions, indicating an unsolidified mental model of the relational roles words play within syntax.',
  },
  {
    id: 'ENGL-G6-READ-6Rg06',
    gradeLevel: 6,
    domain: 'Reading',
    ixlStyleSkill:
      'Differentiate between active and passive voice and understand their effect on the reader.',
    cambridgeStandard:
      '6Rg.06 Explore, and understand, the use of active and passive verb forms.',
    diagnosticTrigger:
      "Student misidentifies the agent of an action in a passive sentence (e.g., 'The bone was eaten by the dog'), incorrectly assuming the first noun mentioned is the subject performing the verb.",
  },
  {
    id: 'ENGL-G6-READ-6Rg07',
    gradeLevel: 6,
    domain: 'Reading',
    ixlStyleSkill:
      'Compare the grammatical differences between written narrative and spoken dialogue.',
    cambridgeStandard:
      '6Rg.07 Explore differences between written and spoken English by comparing narrative and dialogue.',
    diagnosticTrigger:
      'Student expects perfect grammatical adherence in fictional dialogue and becomes confused by elision or non-standard syntax, failing to recognize dialogue as a representation of authentic speech.',
  },
  {
    id: 'ENGL-G6-READ-6Rg08',
    gradeLevel: 6,
    domain: 'Reading',
    ixlStyleSkill:
      'Analyze a wide range of grammatical features including verb forms and sentence types.',
    cambridgeStandard:
      '6Rg.08 Explore and discuss grammatical features in a range of texts, e.g. verb forms, sentence types, use of different word classes.',
    diagnosticTrigger:
      "Student perceives a text as a 'wall of words' and is unable to deconstruct it into its functional grammatical parts when prompted for analysis.",
  },
  {
    id: 'ENGL-G6-READ-6Rs01',
    gradeLevel: 6,
    domain: 'Reading',
    ixlStyleSkill:
      'Track how ideas progress, including the use of flashbacks or non-linear time.',
    cambridgeStandard:
      '6Rs.01 Explore and describe the progression of ideas in a text, including the handling of time (e.g. to manage flashbacks, or events which are presented out of chronological order).',
    diagnosticTrigger:
      'Student becomes temporally disoriented by a flashback, interpreting the past event as a current plot development because they missed the subtle tense-shifts or structural markers.',
  },
  {
    id: 'ENGL-G6-READ-6Rs02',
    gradeLevel: 6,
    domain: 'Reading',
    ixlStyleSkill:
      'Identify the key organizational features of diverse fiction and non-fiction text types.',
    cambridgeStandard:
      '*6Rs.02 Explore and recognise the key features of text structure in a range of different fiction and non-fiction texts, including poems and playscripts.',
    diagnosticTrigger:
      'Student attempts to apply the organizational logic of a narrative story to a non-fiction argument, searching for a chronological plot rather than identifying the hierarchical structure of claims and evidence.',
  },
  {
    id: 'ENGL-G6-READ-6Rs03',
    gradeLevel: 6,
    domain: 'Reading',
    ixlStyleSkill:
      'Explain how ideas are linked cohesively using chapters, sections, and transition words.',
    cambridgeStandard:
      '6Rs.03 Explore and recognise how ideas are organised and linked cohesively across a text, e.g. new chapters to manage flashbacks or events which are presented out of chronological order; use of however and on the other hand to introduce a new paragraph in a balanced argument.',
    diagnosticTrigger:
      "Student fails to detect the logical shift in a balanced argument, missing the connective signal (e.g., 'however') and assuming the author has suddenly contradicted themselves.",
  },
  {
    id: 'ENGL-G6-READ-6Ri01',
    gradeLevel: 6,
    domain: 'Reading',
    ixlStyleSkill:
      'Classify fiction and non-fiction books and use library systems to locate them.',
    cambridgeStandard:
      '*6Ri.01 Understand the difference between fiction and non-fiction texts and locate books by classification.',
    diagnosticTrigger:
      'Student searches for a realistic historical fiction book in the informational history section, failing to recognize that narrative intent overrides factual setting in library categorization.',
  },
  {
    id: 'ENGL-G6-READ-6Ri02',
    gradeLevel: 6,
    domain: 'Reading',
    ixlStyleSkill:
      'Analyze the impact of visual and multimedia elements on the meaning of a text.',
    cambridgeStandard:
      '*6Ri.02 Read and explore a range of fiction genres, poems and playscripts, including identifying the contribution of any visual elements or multimedia.',
    diagnosticTrigger:
      'Student treats an illustration as a decoration rather than a source of data, failing to adjust their interpretation of the text when the visual evidence provides contradicting subtext.',
  },
  {
    id: 'ENGL-G6-READ-6Ri03',
    gradeLevel: 6,
    domain: 'Reading',
    ixlStyleSkill:
      'Compare the defining characteristics and tropes of different fiction genres.',
    cambridgeStandard:
      '*6Ri.03 Identify, discuss and compare different fiction genres and their typical characteristics.',
    diagnosticTrigger:
      "Student identifies a genre based on a single superficial element (e.g., 'there is a sword, so it is a history book'), showing a lack of awareness of structural genre conventions like fantasy magic systems or mystery red herrings.",
  },
  {
    id: 'ENGL-G6-READ-6Ri04',
    gradeLevel: 6,
    domain: 'Reading',
    ixlStyleSkill:
      'Explore and navigate a wide variety of non-fiction texts independently.',
    cambridgeStandard:
      '*6Ri.04 Read and explore a range of non-fiction text types.',
    diagnosticTrigger:
      'Student displays low cognitive stamina for non-fiction prose, quickly abandoning texts that lack a central protagonist or emotional narrative arc.',
  },
  {
    id: 'ENGL-G6-READ-6Ri05',
    gradeLevel: 6,
    domain: 'Reading',
    ixlStyleSkill:
      'Evaluate non-fiction texts for balance, clarity, and the use of persuasive arguments.',
    cambridgeStandard:
      '6Ri.05 Identify, discuss and compare the purposes and features of different non-fiction text types, including balanced written arguments.',
    diagnosticTrigger:
      'Student accepts a one-sided persuasive piece as absolute fact, unable to identify the absence of counter-arguments or the use of biased lexical choices.',
  },
  {
    id: 'ENGL-G6-READ-6Ri06',
    gradeLevel: 6,
    domain: 'Reading',
    ixlStyleSkill:
      'Identify explicitly stated information across a broad range of texts.',
    cambridgeStandard:
      '*6Ri.06 Explore explicit meanings in a range of texts.',
    diagnosticTrigger:
      'Student provides answers based on personal assumptions rather than retrieving the specific, explicitly written evidence that contradicts those assumptions.',
  },
  {
    id: 'ENGL-G6-READ-6Ri07',
    gradeLevel: 6,
    domain: 'Reading',
    ixlStyleSkill:
      'Summarize information by synthesizing points from multiple sections of a text.',
    cambridgeStandard:
      '6Ri.07 Summarise explicit meanings drawn from more than one point in a text.',
    diagnosticTrigger:
      "Student produces a 'summary' that is merely a list of the first three sentences, failing to synthesize information from the conclusion or middle of the text.",
  },
  {
    id: 'ENGL-G6-READ-6Ri08',
    gradeLevel: 6,
    domain: 'Reading',
    ixlStyleSkill:
      'Explain implicit meanings and subtext in complex texts.',
    cambridgeStandard:
      '*6Ri.08 Explore implicit meanings in a range of texts.',
    diagnosticTrigger:
      "Student can recount what a character did but is unable to explain the character's subtextual emotion (e.g., 'he said it was fine but slammed the door'), showing a literal-bound interpretation of behavior.",
  },
  {
    id: 'ENGL-G6-READ-6Ri09',
    gradeLevel: 6,
    domain: 'Reading',
    ixlStyleSkill:
      'Support predictions with evidence pulled from several different parts of a story.',
    cambridgeStandard:
      '6Ri.09 Use evidence from more than one point in a story to support predictions about what might happen later in the story.',
    diagnosticTrigger:
      'Student makes wild plot guesses based on a single recent event, failing to integrate character history or established themes to constrain their predictions.',
  },
  {
    id: 'ENGL-G6-READ-6Ri10',
    gradeLevel: 6,
    domain: 'Reading',
    ixlStyleSkill:
      'Draw logical and plausible inferences from complex text passages.',
    cambridgeStandard:
      '6Ri.10 Make a range of plausible inferences from texts.',
    diagnosticTrigger:
      "Student generates inferences that are logically impossible within the context of the story's world, indicating a breakdown in the integration of text clues and real-world logic.",
  },
  {
    id: 'ENGL-G6-READ-6Ri11',
    gradeLevel: 6,
    domain: 'Reading',
    ixlStyleSkill:
      "Analyze how a writer uses characters and setting to influence the reader's mood and reaction.",
    cambridgeStandard:
      '6Ri.11 Comment on how a writer influences the reaction of readers, including how they present characters and settings, and evoke particular moods (e.g. suspense, anger, excitement).',
    diagnosticTrigger:
      "Student recognizes they feel 'scared' but attributes the feeling to their own personality rather than identifying the writer's deliberate use of sensory details and pacing to evoke suspense.",
  },
  {
    id: 'ENGL-G6-READ-6Ri12',
    gradeLevel: 6,
    domain: 'Reading',
    ixlStyleSkill:
      'Distinguish between objective facts and subjective opinions in advanced texts.',
    cambridgeStandard:
      '*6Ri.12 Distinguish between fact and opinion in a range of texts.',
    diagnosticTrigger:
      "Student misidentifies a value judgment (e.g., 'The team played poorly') as a fact because it appears in a professional-looking news format, failing to detect the subjective qualifier.",
  },
  {
    id: 'ENGL-G6-READ-6Ri13',
    gradeLevel: 6,
    domain: 'Reading',
    ixlStyleSkill:
      'Efficiently locate relevant information across multiple texts or sections.',
    cambridgeStandard:
      '6Ri.13 Locate and use relevant information from one or more points in a text, or from different texts, confidently and efficiently.',
    diagnosticTrigger:
      'Student attempts to answer a comparative question by reading only the first text and ignoring the second, unable to coordinate information across distinct visual sources.',
  },
  {
    id: 'ENGL-G6-READ-6Ri14',
    gradeLevel: 6,
    domain: 'Reading',
    ixlStyleSkill:
      'Provide evidence-based answers using specific quotations from the text.',
    cambridgeStandard:
      '*6Ri.14 Support answers to questions with reference to, or quotations from, one or more points in a text.',
    diagnosticTrigger:
      'Student gives a vague oral summary of an idea when asked for a quotation, failing to recognize the specific mechanical and legalistic requirement of an exact textual transcript.',
  },
  {
    id: 'ENGL-G6-READ-6Ri15',
    gradeLevel: 6,
    domain: 'Reading',
    ixlStyleSkill:
      'Analyze both explicit and implicit ways an author conveys the theme of a text.',
    cambridgeStandard:
      '6Ri.15 Recognise explicit and implicit ways in which the theme of a text is conveyed.',
    diagnosticTrigger:
      'Student can identify a theme if stated in the title but misses it when conveyed through recurring symbolic imagery or character failure, showing a lack of symbolic processing.',
  },
  {
    id: 'ENGL-G6-READ-6Ri16',
    gradeLevel: 6,
    domain: 'Reading',
    ixlStyleSkill:
      'Evaluate how different viewpoints are expressed in fiction and non-fiction.',
    cambridgeStandard:
      '6Ri.16 Comment on how different viewpoints are expressed in fiction and non-fiction texts.',
    diagnosticTrigger:
      "Student assumes the author is always the speaker, failing to recognize that a character's viewpoint in fiction may be intentionally limited, biased, or 'wrong'.",
  },
  {
    id: 'ENGL-G6-READ-6Ri17',
    gradeLevel: 6,
    domain: 'Reading',
    ixlStyleSkill:
      "Distinguish between the writer's personal voice and the narrator's fictional persona.",
    cambridgeStandard:
      "6Ri.17 Distinguish between texts with a writer's voice and texts with a narrator's voice.",
    diagnosticTrigger:
      "Student attributes character speech directly to the author's own life experiences, failing to cognitively separate the literal creator from the artistic creation.",
  },
  {
    id: 'ENGL-G6-READ-6Ra01',
    gradeLevel: 6,
    domain: 'Reading',
    ixlStyleSkill:
      'Engage with a wide range of text types and fiction genres independently.',
    cambridgeStandard:
      '*6Ra.01 Enjoy independent and shared reading of fiction genres, poems, playscripts and non-fiction texts.',
    diagnosticTrigger:
      "Student exhibits 'genre rigidity,' refusing to read anything but a single specific series or format (e.g., graphic novels), showing a lack of cognitive flexibility in text engagement.",
  },
  {
    id: 'ENGL-G6-READ-6Ra02',
    gradeLevel: 6,
    domain: 'Reading',
    ixlStyleSkill:
      "Express personal preferences regarding a writer's language, style, and themes.",
    cambridgeStandard:
      '6Ra.02 Express personal responses to texts, including preferences in terms of language, style and themes.',
    diagnosticTrigger:
      "Student's 'response' is a literal plot recount, lacking any evaluative commentary on the author's aesthetic choices or stylistic flair.",
  },
  {
    id: 'ENGL-G6-READ-6Ra03',
    gradeLevel: 6,
    domain: 'Reading',
    ixlStyleSkill:
      'Expand reading choices to include diverse writers and contrasting genres.',
    cambridgeStandard:
      '6Ra.03 Begin to choose a more diverse range of books to read, including writers or genres which compare or contrast with previous reading.',
    diagnosticTrigger:
      'Student ignores new or unfamiliar book recommendations during library time, defaulting to the same repetitive author/genre despite demonstrated fluency in other areas.',
  },
  {
    id: 'ENGL-G6-READ-6Ra04',
    gradeLevel: 6,
    domain: 'Reading',
    ixlStyleSkill:
      "Comment on how a reader's own context (time and place) influences their reaction to a text.",
    cambridgeStandard:
      '6Ra.04 Comment on how readers might react differently to the same text, depending on where or when they are reading it.',
    diagnosticTrigger:
      "Student insists their interpretation of a classic text is the only possible one, failing to consider how a 19th-century reader or a reader from another culture would perceive the same events.",
  },
  {
    id: 'ENGL-G6-WRIT-6Ww01',
    gradeLevel: 6,
    domain: 'Writing',
    ixlStyleSkill:
      'Apply complex spelling rules for representing consonants (e.g., -que for /k/ or -dge for /ʤ/).',
    cambridgeStandard:
      '6Ww.01 Explore and use different ways of representing consonants, e.g. -ck, -k, -ke, -que or -ch for /k/; -ch or -tch for /ʧ/; j-, g- or -dge for /ʤ/.',
    diagnosticTrigger:
      "Student over-generalizes basic consonant patterns (e.g., spelling 'unique' as 'unick'), failing to recognize and apply higher-level orthographic conventions for loan words or specific phonetic endings.",
  },
  {
    id: 'ENGL-G6-WRIT-6Ww02',
    gradeLevel: 6,
    domain: 'Writing',
    ixlStyleSkill:
      'Spell words with similar-sounding but differently-spelled suffixes (e.g., -tion vs. -cian).',
    cambridgeStandard:
      '6Ww.02 Explore and spell words with different suffixes but similar pronunciation, e.g. -tion, -cian, -sion, -ssion; -ance, -ence.',
    diagnosticTrigger:
      "Student relies purely on phonetic sound for complex endings (e.g., spelling 'musician' as 'musishun'), lacking the morphological awareness of how root words (music) dictate suffix choice.",
  },
  {
    id: 'ENGL-G6-WRIT-6Ww03',
    gradeLevel: 6,
    domain: 'Writing',
    ixlStyleSkill:
      'Apply prefix and suffix rules correctly even when the root word must change.',
    cambridgeStandard:
      '6Ww.03 Further develop understanding of how to add prefixes and suffixes to root words, and when the root word changes.',
    diagnosticTrigger:
      "Student fails to drop the final 'e' or double the consonant when adding suffixes (e.g., writing 'decideing' or 'bigest'), demonstrating an unrefined grasp of morphological junction rules.",
  },
  {
    id: 'ENGL-G6-WRIT-6Ww04',
    gradeLevel: 6,
    domain: 'Writing',
    ixlStyleSkill:
      'Spell complex homophones and commonly confused words accurately (e.g., aloud/allowed).',
    cambridgeStandard:
      '6Ww.04 Spell familiar homophones and commonly confused words correctly, e.g. aloud, allowed; past, passed; advice, advise; desert, dessert.',
    diagnosticTrigger:
      "Student selects the correct phonetic word but the wrong semantic spelling (e.g., 'the desert was tasty'), indicating a breakdown in the link between orthographic memory and semantic context.",
  },
  {
    id: 'ENGL-G6-WRIT-6Ww05',
    gradeLevel: 6,
    domain: 'Writing',
    ixlStyleSkill:
      'Investigate and apply a wide range of complex spelling rules and exceptions.',
    cambridgeStandard:
      '6Ww.05 Explore a range of spelling rules and exceptions.',
    diagnosticTrigger:
      "Student rigidly applies a rule (e.g., 'i before e') to exception words like 'weight' or 'neighbor', showing an inability to modulate rules with higher-order exceptions.",
  },
  {
    id: 'ENGL-G6-WRIT-6Ww06',
    gradeLevel: 6,
    domain: 'Writing',
    ixlStyleSkill:
      'Use diverse spelling strategies to accurately spell a broad range of challenging words.',
    cambridgeStandard:
      '6Ww.06 Use effective strategies to spell a wide range of words correctly.',
    diagnosticTrigger:
      "Student guesses at word spellings based on visual 'shape' rather than utilizing systematic phonological or morphological breakdown, leading to unrecognizable letter strings.",
  },
  {
    id: 'ENGL-G6-WRIT-6Ww07',
    gradeLevel: 6,
    domain: 'Writing',
    ixlStyleSkill:
      'Use digital and paper tools to verify spelling and maintain a personal log of learned words.',
    cambridgeStandard:
      '*6Ww.07 Use paper-based and on-screen tools to find the correct spelling of words; keep and use spelling logs of misspelt words, and identify words that need to be learned.',
    diagnosticTrigger:
      "Student ignores automated spell-check prompts or 'red underlines' on screen, demonstrating a lack of self-correction habits and over-reliance on draft speed over accuracy.",
  },
  {
    id: 'ENGL-G6-WRIT-6Wv01',
    gradeLevel: 6,
    domain: 'Writing',
    ixlStyleSkill:
      'Apply specialized, technical vocabulary correctly in topically-relevant writing.',
    cambridgeStandard:
      '*6Wv.01 Use specialised vocabulary accurately to match a familiar topic.',
    diagnosticTrigger:
      "Student uses vague pronouns or generic terms (e.g., 'the thingy in the cell') when precise Tier 3 terminology (e.g., 'mitochondria') is required, indicating weak lexical retrieval of domain-specific nouns.",
  },
  {
    id: 'ENGL-G6-WRIT-6Wv02',
    gradeLevel: 6,
    domain: 'Writing',
    ixlStyleSkill:
      'Use precise words and phrases to convey subtle shades of meaning appropriate to the context.',
    cambridgeStandard:
      '6Wv.02 Explore and use words and phrases to convey shades of meaning appropriate to the context.',
    diagnosticTrigger:
      "Student describes a high-intensity scene using low-intensity adjectives (e.g., 'the big storm was bad'), demonstrating a failure to match lexical intensity with narrative context.",
  },
  {
    id: 'ENGL-G6-WRIT-6Wv03',
    gradeLevel: 6,
    domain: 'Writing',
    ixlStyleSkill:
      'Use prefixes and suffixes to transform and refine the meaning of words in writing.',
    cambridgeStandard:
      '6Wv.03 Transform meaning with prefixes and suffixes.',
    diagnosticTrigger:
      "Student uses the wrong prefix to negate a word (e.g., 'unlogical' instead of 'illogical'), showing a disconnect in the semantic-morphological mapping of Latinate affixes.",
  },
  {
    id: 'ENGL-G6-WRIT-6Wv04',
    gradeLevel: 6,
    domain: 'Writing',
    ixlStyleSkill:
      'Select and use imaginative vocabulary to build rich detail in creative writing.',
    cambridgeStandard:
      '6Wv.04 Choose and use vocabulary carefully to develop imaginative detail.',
    diagnosticTrigger:
      "Student's descriptive writing is purely functional and nouns-heavy, lacking the sensory modifiers needed to construct a vivid mental image for the reader.",
  },
  {
    id: 'ENGL-G6-WRIT-6Wv05',
    gradeLevel: 6,
    domain: 'Writing',
    ixlStyleSkill:
      'Use figurative language to trigger an imaginative and emotional response in the reader.',
    cambridgeStandard:
      '*6Wv.05 Begin to use figurative language to evoke an imaginative response from the reader.',
    diagnosticTrigger:
      "Student creates similes that are semantically 'flat' or cliché (e.g., 'as red as an apple'), failing to generate original comparisons that enhance the specific mood of the text.",
  },
  {
    id: 'ENGL-G6-WRIT-6Wv06',
    gradeLevel: 6,
    domain: 'Writing',
    ixlStyleSkill:
      'Incorporate interesting words from personal lists, dictionaries, and thesauruses into drafts.',
    cambridgeStandard:
      '*6Wv.06 Use own lists of interesting and significant words, dictionaries and thesauruses to extend the range of vocabulary used in written work.',
    diagnosticTrigger:
      "Student replaces words with thesaurus synonyms that are grammatically or contextually inappropriate (e.g., using 'enormous' to describe a high score), showing a lack of semantic boundary awareness.",
  },
  {
    id: 'ENGL-G6-WRIT-6Wg01',
    gradeLevel: 6,
    domain: 'Writing',
    ixlStyleSkill:
      'Use dashes, brackets, and parenthetic commas to add extra information to sentences.',
    cambridgeStandard:
      '6Wg.01 Use commas, dashes and brackets parenthetically.',
    diagnosticTrigger:
      'Student fails to close a parenthetic clause (e.g., opening a bracket but never shutting it), resulting in a syntactic breakdown where the extra info bleeds into the main clause.',
  },
  {
    id: 'ENGL-G6-WRIT-6Wg02',
    gradeLevel: 6,
    domain: 'Writing',
    ixlStyleSkill:
      'Punctuate direct and reported speech accurately, including tense and pronoun shifts.',
    cambridgeStandard:
      '6Wg.02 Punctuate direct and reported speech accurately.',
    diagnosticTrigger:
      "Student fails to shift pronouns when moving from direct to reported speech (e.g., 'She said that I was hungry' instead of 'She said that she was hungry'), creating semantic ambiguity.",
  },
  {
    id: 'ENGL-G6-WRIT-6Wg03',
    gradeLevel: 6,
    domain: 'Writing',
    ixlStyleSkill:
      'Use punctuation effectively to organize ideas in long, complex sentences.',
    cambridgeStandard:
      '6Wg.03 Use punctuation effectively to clarify meaning in complex sentences.',
    diagnosticTrigger:
      "Student writes 'comma splices' (joining two independent thoughts with only a comma), failing to recognize the need for a full stop or semicolon to mark the major structural break.",
  },
  {
    id: 'ENGL-G6-WRIT-6Wg04',
    gradeLevel: 6,
    domain: 'Writing',
    ixlStyleSkill:
      'Choose between simple, compound, and complex sentences to achieve specific effects.',
    cambridgeStandard:
      '6Wg.04 Use a variety of simple, compound and complex sentences chosen for effect.',
    diagnosticTrigger:
      "Student's writing style is repetitive and monotonous due to an over-reliance on a single sentence template (e.g., exclusively simple S-V-O sentences).",
  },
  {
    id: 'ENGL-G6-WRIT-6Wg05',
    gradeLevel: 6,
    domain: 'Writing',
    ixlStyleSkill:
      'Employ both active and passive verb forms purposefully within writing.',
    cambridgeStandard:
      '6Wg.05 Use active and passive verb forms within sentences.',
    diagnosticTrigger:
      'Student uses the passive voice in an action-heavy scene, inadvertently distancing the reader from the protagonist and slowing the narrative momentum.',
  },
  {
    id: 'ENGL-G6-WRIT-6Wg06',
    gradeLevel: 6,
    domain: 'Writing',
    ixlStyleSkill:
      'Ensure quantifiers (e.g., less/fewer) agree grammatically with countable and uncountable nouns.',
    cambridgeStandard:
      '6Wg.06 Ensure grammatical agreement of quantifiers with countable and uncountable nouns, e.g. less and fewer.',
    diagnosticTrigger:
      "Student uses 'less' with plural countable nouns (e.g., 'less students'), demonstrating a failure to cognitively categorize nouns into discrete vs. mass types for agreement.",
  },
  {
    id: 'ENGL-G6-WRIT-6Wg07',
    gradeLevel: 6,
    domain: 'Writing',
    ixlStyleSkill:
      'Use relative pronouns to add detail and complexity to sentences.',
    cambridgeStandard:
      '6Wg.07 Use relative pronouns to introduce additional detail.',
    diagnosticTrigger:
      "Student writes fragmented relative clauses as standalone sentences (e.g., 'Which was very tall.'), failing to attach the descriptive detail to its required head noun.",
  },
  {
    id: 'ENGL-G6-WRIT-6Wg08',
    gradeLevel: 6,
    domain: 'Writing',
    ixlStyleSkill:
      'Consistently apply the conventions of Standard English in formal writing.',
    cambridgeStandard:
      '6Wg.08 Use the conventions of standard English appropriately in writing, including for different types of texts, e.g. verb forms, sentence structure, use of different word classes.',
    diagnosticTrigger:
      "Student uses informal 'text-speak' or playground slang in a formal report, failing to adapt their grammatical register to the academic purpose of the text.",
  },
  {
    id: 'ENGL-G6-WRIT-6Ws01',
    gradeLevel: 6,
    domain: 'Writing',
    ixlStyleSkill:
      'Sustain and develop a single idea across an entire piece of writing, linking the end to the beginning.',
    cambridgeStandard:
      '6Ws.01 Manage the development of an idea across an extended piece of writing, e.g. by linking the end to the beginning.',
    diagnosticTrigger:
      "Student's concluding paragraph introduces a completely new topic or fails to reference the initial problem, showing a breakdown in global thematic cohesion.",
  },
  {
    id: 'ENGL-G6-WRIT-6Ws02',
    gradeLevel: 6,
    domain: 'Writing',
    ixlStyleSkill:
      'Use paragraphs, sections, and chapters to manage non-linear timelines or complex ideas.',
    cambridgeStandard:
      '6Ws.02 Use paragraphs, sections and chapters to organise ideas and support overall cohesion of a text, e.g. new chapters to manage flashbacks or events which are presented out of chronological sequence.',
    diagnosticTrigger:
      "Student shifts a scene's location or time without a paragraph break, causing the reader to experience spatial-temporal confusion within a single block of text.",
  },
  {
    id: 'ENGL-G6-WRIT-6Ws03',
    gradeLevel: 6,
    domain: 'Writing',
    ixlStyleSkill:
      'Use advanced connectives to link paragraphs and introduce counter-arguments cohesively.',
    cambridgeStandard:
      '6Ws.03 Use a range of connectives to link paragraphs and sections clearly and cohesively, e.g. use of however and on the other hand to introduce counter-arguments in a balanced argument.',
    diagnosticTrigger:
      "Student's transition between opposing paragraphs is abrupt and jarring, lacking the logical 'pivot' word (e.g., 'Conversely') needed to prepare the reader for a change in perspective.",
  },
  {
    id: 'ENGL-G6-WRIT-6Ws04',
    gradeLevel: 6,
    domain: 'Writing',
    ixlStyleSkill:
      'Employ text features like bulleted and numbered lists to organize complex information.',
    cambridgeStandard:
      '*6Ws.04 Use organisational features appropriate to the text type, e.g. bulleted and numbered lists.',
    diagnosticTrigger:
      'Student attempts to explain a multi-step procedure as a dense narrative paragraph, failing to utilize vertical list structures that facilitate procedural processing.',
  },
  {
    id: 'ENGL-G6-WRIT-6Wc01',
    gradeLevel: 6,
    domain: 'Writing',
    ixlStyleSkill:
      'Compose creative stories and poems in multiple genres, experimenting with style.',
    cambridgeStandard:
      '*6Wc.01 Develop creative writing in a range of different genres of fiction and types of poems.',
    diagnosticTrigger:
      "Student's 'creative' output is a repetitive, low-effort mimicry of a single formula, failing to adopt the stylistic markers required for distinct genres like mystery or sci-fi.",
  },
  {
    id: 'ENGL-G6-WRIT-6Wc02',
    gradeLevel: 6,
    domain: 'Writing',
    ixlStyleSkill:
      'Use chapters or sections in planning to organize the structure of extended writing.',
    cambridgeStandard:
      '6Wc.02 Use effective planning to inform the content and structure of extended writing, e.g. chapters.',
    diagnosticTrigger:
      'Student begins an extended writing task without a structural plan, resulting in a text that loses focus and becomes aimless after the first page.',
  },
  {
    id: 'ENGL-G6-WRIT-6Wc03',
    gradeLevel: 6,
    domain: 'Writing',
    ixlStyleSkill:
      'Create vivid, engaging descriptions of characters, settings, and action.',
    cambridgeStandard:
      '6Wc.03 When writing stories, develop descriptions of settings, characters and action that engage and entertain the reader.',
    diagnosticTrigger:
      "Student relies on overused generic adjectives (e.g., 'the scary monster') rather than building specific sensory details that trigger the reader's imagination.",
  },
  {
    id: 'ENGL-G6-WRIT-6Wc04',
    gradeLevel: 6,
    domain: 'Writing',
    ixlStyleSkill:
      'Include multiple character viewpoints and use flashbacks to add depth to fiction.',
    cambridgeStandard:
      '6Wc.04 Include different viewpoints in fiction, e.g. when writing stories with flashbacks.',
    diagnosticTrigger:
      'Student attempts a flashback but fails to signal the transition with a tense shift or structural cue, leaving the reader confused about the chronological reality of the scene.',
  },
  {
    id: 'ENGL-G6-WRIT-6Wc05',
    gradeLevel: 6,
    domain: 'Writing',
    ixlStyleSkill:
      'Write playscripts that use language and stage directions to develop character and setting.',
    cambridgeStandard:
      '6Wc.05 Write a playscript using production notes, language and stage directions, to develop characters and settings.',
    diagnosticTrigger:
      "Student includes character thoughts inside the dialogue (e.g., 'I am very nervous, I thought to myself'), failing to use external actions or stage directions to convey internal state.",
  },
  {
    id: 'ENGL-G6-WRIT-6Wc06',
    gradeLevel: 6,
    domain: 'Writing',
    ixlStyleSkill:
      'Adapt writing features and language to suit the specific purpose of diverse text types.',
    cambridgeStandard:
      '*6Wc.06 Develop writing for a purpose using language and features appropriate for a range of text types.',
    diagnosticTrigger:
      "Student uses a formal, dry tone in a supposedly 'exciting adventure' story, demonstrating an inability to match their lexical choices to the intended communicative effect.",
  },
  {
    id: 'ENGL-G6-WRIT-6Wc07',
    gradeLevel: 6,
    domain: 'Writing',
    ixlStyleSkill:
      'Write for specific audiences using content and language tailored to them.',
    cambridgeStandard:
      '*6Wc.07 Develop writing of a range of text types for a specified audience, using appropriate content and language.',
    diagnosticTrigger:
      "Student uses highly technical jargon in a text meant for young children, failing to perform the cognitive perspective-taking required for audience-appropriate register shifting.",
  },
  {
    id: 'ENGL-G6-WRIT-6Wc08',
    gradeLevel: 6,
    domain: 'Writing',
    ixlStyleSkill:
      'Write logically organized balanced arguments that present multiple sides of a topic.',
    cambridgeStandard:
      '6Wc.08 Write balanced arguments, developing points logically and convincingly.',
    diagnosticTrigger:
      "Student's 'balanced argument' is entirely one-sided, failing to even mention opposing viewpoints, which demonstrates a lack of argumentative cognitive breadth.",
  },
  {
    id: 'ENGL-G6-WRIT-6Wp01',
    gradeLevel: 6,
    domain: 'Writing',
    ixlStyleSkill:
      'Develop a legible, fluent, and efficient personal handwriting style.',
    cambridgeStandard:
      '6Wp.01 Develop a personal handwriting style to write legibly, fluently and with appropriate speed.',
    diagnosticTrigger:
      "Student's handwriting becomes illegible under timed conditions, showing that fine motor control has not yet reached the level of automaticity required for high-volume Stage 6 output.",
  },
  {
    id: 'ENGL-G6-WRIT-6Wp02',
    gradeLevel: 6,
    domain: 'Writing',
    ixlStyleSkill:
      'Decide when and how to take notes to most effectively support the writing process.',
    cambridgeStandard:
      '6Wp.02 Begin to decide when it is helpful to take notes and how to record them.',
    diagnosticTrigger:
      "Student attempts to memorize entire source passages rather than taking notes, resulting in 'cognitive overload' and an inability to reproduce key information later.",
  },
  {
    id: 'ENGL-G6-WRIT-6Wp03',
    gradeLevel: 6,
    domain: 'Writing',
    ixlStyleSkill:
      'Choose the best layout (handwritten or digital) to suit a specific audience and purpose.',
    cambridgeStandard:
      '*6Wp.03 Begin to choose appropriate ways to lay out and present texts to suit the purpose and audience (handwritten, printed and onscreen).',
    diagnosticTrigger:
      'Student chooses a highly decorative, unreadable digital font for a formal report, prioritizing superficial aesthetics over the functional requirement of clarity.',
  },
  {
    id: 'ENGL-G6-WRIT-6Wp04',
    gradeLevel: 6,
    domain: 'Writing',
    ixlStyleSkill:
      'Evaluate and improve writing drafts for sense, accuracy, and overall impact.',
    cambridgeStandard:
      '*6Wp.04 Evaluate own and others’ writing, suggesting improvements for sense, accuracy and content, including to enhance the effect.',
    diagnosticTrigger:
      'Student corrects minor spelling errors but ignores major logical gaps or confusing sentences during the revision phase, showing a surface-level approach to editing.',
  },
  {
    id: 'ENGL-G6-WRIT-6Wp05',
    gradeLevel: 6,
    domain: 'Writing',
    ixlStyleSkill:
      'Proofread for grammar, spelling, and punctuation errors and make necessary corrections.',
    cambridgeStandard:
      '*6Wp.05 Proofread for grammar, spelling and punctuation errors, and make corrections, including using on-screen tools.',
    diagnosticTrigger:
      'Student submits a final draft with multiple errors that they actually know how to fix, indicating a failure to deploy a systematic, disciplined final check.',
  },
  {
    id: 'ENGL-G6-SPKL-6SLm01',
    gradeLevel: 6,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Adjust the pace and tone of speech appropriately for formal and informal situations.',
    cambridgeStandard:
      '6SLm.01 Adapt pace and tone of speech appropriately in formal and informal contexts.',
    diagnosticTrigger:
      'Student uses informal playground slang and a casual, rapid pace during a formal classroom presentation, failing to adapt their oral register to the social context.',
  },
  {
    id: 'ENGL-G6-SPKL-6SLm02',
    gradeLevel: 6,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Organize spoken information to highlight both main points and supporting details clearly.',
    cambridgeStandard:
      '6SLm.02 Structure information to aid the listener’s understanding of the main and subsidiary points.',
    diagnosticTrigger:
      'Student presents a jumble of minor facts without ever stating the main topic, leaving the listener unable to identify the core purpose of the speech.',
  },
  {
    id: 'ENGL-G6-SPKL-6SLm03',
    gradeLevel: 6,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Convey complex ideas and opinions orally with increasing detail and clarity.',
    cambridgeStandard:
      '6SLm.03 Use language to convey ideas and opinions, with increasing clarity and detail.',
    diagnosticTrigger:
      "Student provides 'circular' verbal arguments (e.g., 'it's good because it's good'), lacking the expressive vocabulary needed to articulate specific reasons or evidence.",
  },
  {
    id: 'ENGL-G6-SPKL-6SLm04',
    gradeLevel: 6,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Adapt non-verbal communication techniques to suit different purposes and audiences.',
    cambridgeStandard:
      '*6SLm.04 Adapt non-verbal communication techniques for different purposes and contexts.',
    diagnosticTrigger:
      "Student maintains a rigid, motionless posture when telling a supposedly 'exciting' story, failing to use body language to synchronize with the emotional arc of the narrative.",
  },
  {
    id: 'ENGL-G6-SPKL-6SLm05',
    gradeLevel: 6,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Demonstrate awareness of various audiences by using the correct social register.',
    cambridgeStandard:
      '*6SLm.05 Show awareness of different audiences, e.g. by using the appropriate register.',
    diagnosticTrigger:
      'Student addresses a visiting professional with the same overly-familiar tone they use for a close friend, indicating a deficit in social-pragmatic perspective taking.',
  },
  {
    id: 'ENGL-G6-SPKL-6SLs01',
    gradeLevel: 6,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Listen actively and provide reasoned responses that reference specific points made by a speaker.',
    cambridgeStandard:
      '6SLs.01 Listen, reflect on what is heard and give a reasoned response with reference to at least one specific point made by the speaker.',
    diagnosticTrigger:
      "Student's oral response to a presentation is entirely generic (e.g., 'that was good'), showing they were unable to retain or process a specific, concrete detail from the auditory stream.",
  },
  {
    id: 'ENGL-G6-SPKL-6SLg01',
    gradeLevel: 6,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Assume and delegate diverse roles within a group to complete collaborative tasks.',
    cambridgeStandard:
      '*6SLg.01 Take different assigned roles within groups, and begin to assign roles within a group.',
    diagnosticTrigger:
      "Student attempts to control all aspects of a group project, refusing to delegate tasks or trust others' specific roles, showing a failure in collaborative leadership.",
  },
  {
    id: 'ENGL-G6-SPKL-6SLg02',
    gradeLevel: 6,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Listen to and show genuine consideration for viewpoints different from your own.',
    cambridgeStandard:
      '*6SLg.02 Show consideration of another point of view.',
    diagnosticTrigger:
      "Student immediately dismisses a peer's opinion with personal insults or eye-rolling, showing an inability to engage in civil, evidence-based academic disagreement.",
  },
  {
    id: 'ENGL-G6-SPKL-6SLg03',
    gradeLevel: 6,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      "Develop and refine group ideas by building on others' contributions during a discussion.",
    cambridgeStandard:
      "6SLg.03 Extend a discussion by building on own and others' ideas.",
    diagnosticTrigger:
      'Student repeats their own pre-planned point over and over during a group talk, failing to modify or expand their idea based on the new information provided by peers.',
  },
  {
    id: 'ENGL-G6-SPKL-6SLg04',
    gradeLevel: 6,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Actively encourage peers to participate and take turns during group discussions.',
    cambridgeStandard:
      '6SLg.04 Encourage others to take turns in a discussion.',
    diagnosticTrigger:
      "Student monopolizes the conversation and ignores a quiet peer's attempts to join, failing to recognize and facilitate the equitable social dynamics of the group.",
  },
  {
    id: 'ENGL-G6-SPKL-6SLp01',
    gradeLevel: 6,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Read aloud with high accuracy, growing confidence, and a unique expressive style.',
    cambridgeStandard:
      '*6SLp.01 Read aloud with accuracy, and increasing confidence and style.',
    diagnosticTrigger:
      "Student reads with perfect technical accuracy but in a rapid, monotonous 'race' to the finish, indicating a lack of connection between decoding and expressive performance.",
  },
  {
    id: 'ENGL-G6-SPKL-6SLp02',
    gradeLevel: 6,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Convey character traits in drama through deliberate and varied choices of speech and movement.',
    cambridgeStandard:
      '6SLp.02 Convey ideas about characters in drama in different roles and scenarios through deliberate choice of speech, gesture and movement.',
    diagnosticTrigger:
      'Student uses the exact same vocal tone and body language for two very different characters in a play, failing to utilize physical and auditory markers to represent distinct personas.',
  },
  {
    id: 'ENGL-G6-SPKL-6SLp03',
    gradeLevel: 6,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Plan and deliver sophisticated presentations, adapting content and style for diverse audiences.',
    cambridgeStandard:
      '*6SLp.03 Plan and deliver independent and group presentations confidently to a range of audiences, adapting presentations appropriately to the audience.',
    diagnosticTrigger:
      "Student fails to explain complex terms during a presentation to a younger class, showing a breakdown in 'theory of mind' regarding the audience's baseline knowledge.",
  },
  {
    id: 'ENGL-G6-SPKL-6SLp04',
    gradeLevel: 6,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Select the most appropriate media (video, audio, or visual) to enhance a specific presentation.',
    cambridgeStandard:
      '*6SLp.04 Begin to make choices about the most appropriate media for a particular presentation.',
    diagnosticTrigger:
      'Student selects a complex digital media tool that is purely distracting and irrelevant to the presentation\'s core message, showing poor assessment of communicative utility.',
  },
  {
    id: 'ENGL-G6-SPKL-6SLr01',
    gradeLevel: 6,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      "Evaluate your own and others' speech, noting areas for technical and content improvement.",
    cambridgeStandard:
      "*6SLr.01 Evaluate own and others' talk, including what went well and what could be improved next time.",
    diagnosticTrigger:
      "Student provides only 'feel-good' feedback to peers and is unable to identify one specific area of verbal delivery (like eye contact or volume) that needs technical refinement.",
  },
  {
    id: 'ENGL-G6-SPKL-6SLr02',
    gradeLevel: 6,
    domain: 'Speaking and Listening',
    ixlStyleSkill:
      'Explain how and why communication varies across different social registers and contexts.',
    cambridgeStandard:
      '6SLr.02 Begin to explain variations in communication, including register.',
    diagnosticTrigger:
      "Student perceives formal speech as simply 'acting fake,' failing to recognize register-shifting as a necessary and sophisticated social-cognitive adaptation.",
  },
];
