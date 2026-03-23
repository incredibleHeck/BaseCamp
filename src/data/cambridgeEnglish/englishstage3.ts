import type { CurriculumObjective } from '../curriculumTypes';

/**
 * Cambridge Primary English / Literacy — Stage 3 (Grade 3).
 *
 * `id` values embed the official strand code with Cambridge casing (e.g. `3Rv` not `3RV`),
 * matching notation like `3Rv.01` in the framework — e.g. `ENGL-G3-READ-3Rv01`.
 */
export const cambridgeEnglishStage3: CurriculumObjective[] = [
  {
    id: "ENGL-G3-READ-3Rw01",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Read words where the same letters make different or unusual sounds (e.g., 'young', 'could', 'move').",
    cambridgeStandard:
      "3Rw.01 Identify less common ways in which graphemes can be pronounced, e.g. young, could; move, love.",
    diagnosticTrigger:
      "Student rigidly applies the most frequent pronunciation rule to exception words (e.g., rhyming 'move' with 'cove' or 'young' with 'bound'), demonstrating an inability to access secondary, irregular grapheme-phoneme mappings.",
  },
  {
    id: "ENGL-G3-READ-3Rw02",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Read common contractions that use an apostrophe to show missing letters (e.g., can't, don't).",
    cambridgeStandard:
      "3Rw.02 Read words with an apostrophe to mark omission of letters, e.g. can't, don't.",
    diagnosticTrigger:
      "Student stops reading when encountering an apostrophe or reads the two root words separately (e.g., reading 'don't' as 'do not'), failing to recognize the visual contraction as a single, fluid lexical unit.",
  },
  {
    id: "ENGL-G3-READ-3Rw03",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Use a mix of phonics, breaking words into syllables, and context clues to read unfamiliar words.",
    cambridgeStandard:
      "3Rw.03 Use effective strategies to read unfamiliar words, including using phonic knowledge, segmenting and contextual information.",
    diagnosticTrigger:
      "Student repeatedly guesses an unknown word based exclusively on its first letter, ignoring both the subsequent syllables and the surrounding sentence context, showing a lack of multi-strategy decoding integration.",
  },
  {
    id: "ENGL-G3-READ-3Rw04",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Recognize many sight words quickly, including tricky homophones (e.g., there/their/they're).",
    cambridgeStandard:
      "3Rw.04 Extend the range of common words recognised on sight, including homophones and near-homophones.",
    diagnosticTrigger:
      "Student reads a sentence aloud but misinterprets the meaning because they conflate a homophone with its auditory twin (e.g., thinking 'The knight rode' refers to nighttime), indicating a failure to map orthographic spelling directly to semantic meaning.",
  },
  {
    id: "ENGL-G3-READ-3Rv01",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Figure out what a new word means by looking at the words and sentences around it.",
    cambridgeStandard:
      "3Rv.01 Deduce the meanings of unfamiliar words from their context.",
    diagnosticTrigger:
      "Student asks what a word means but refuses to re-read the sentence to look for clues, demonstrating a complete reliance on external definitions rather than active, context-based semantic problem solving.",
  },
  {
    id: "ENGL-G3-READ-3Rv02",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Collect interesting new words and synonyms from reading to use later in writing.",
    cambridgeStandard:
      "3Rv.02 Identify and record interesting and significant words, and synonyms, from texts to inform own writing.",
    diagnosticTrigger:
      "Student reads a highly descriptive passage but cannot select a single 'powerful' word to record, defaulting to basic functional vocabulary and showing low metalinguistic awareness of authorial word choice.",
  },
  {
    id: "ENGL-G3-READ-3Rv03",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Find words quickly in a dictionary or glossary by looking at the first two letters.",
    cambridgeStandard:
      "3Rv.03 Use the initial two letters to organise words in alphabetical order, and to locate words in dictionaries and glossaries.",
    diagnosticTrigger:
      "Student attempts to locate 'train' in a dictionary but stops at the 'T' section and scans randomly, failing to utilize the second letter 'r' to systematically narrow the alphabetical search field.",
  },
  {
    id: "ENGL-G3-READ-3Rv04",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Notice and explain how descriptive nouns and adjectives make a story more interesting.",
    cambridgeStandard:
      "3Rv.04 Explore and comment on words in texts that make an impact on the reader, including noun phrases and adjectives.",
    diagnosticTrigger:
      "Student can identify an adjective in a text but cannot explain *why* the author chose it, treating descriptive language merely as a grammatical feature rather than a tool for evoking sensory imagery.",
  },
  {
    id: "ENGL-G3-READ-3Rv05",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Notice how authors use different 'speaking verbs' (e.g., whispered, shouted, asked) instead of just 'said'.",
    cambridgeStandard:
      "3Rv.05 Explore and comment on how a writer's choice of verbs to introduce and conclude dialogue enhances the meaning.",
    diagnosticTrigger:
      "Student reads dialogue tagged with 'whispered' or 'screamed' but reads it in a flat, neutral tone, failing to process the specific dialogue verb as a semantic cue for volume or emotion.",
  },
  {
    id: "ENGL-G3-READ-3Rv06",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Identify how sentences start differently to show time, place, or how something happens.",
    cambridgeStandard:
      "3Rv.06 Explore how different sentence openings are used for different purposes, including time, place and manner, e.g. Later that day, …; In the distance, …; Slowly and carefully, …",
    diagnosticTrigger:
      "Student reads a text with varied fronted adverbials but cannot answer 'when' or 'where' an event happened, missing how introductory phrases structurally establish the spatial or temporal setting.",
  },
  {
    id: "ENGL-G3-READ-3Rv07",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Identify sound words (onomatopoeia) like 'crash' or 'buzz' in a story or poem.",
    cambridgeStandard:
      "3Rv.07 Identify simple figurative language in texts, including sound effects and simple onomatopoeia.",
    diagnosticTrigger:
      "Student reads a sound effect word literally without altering their expression or recognizing it as a representation of noise, showing a lack of awareness of phonosymbolic literary devices.",
  },
  {
    id: "ENGL-G3-READ-3Rg01",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Read familiar texts smoothly by paying attention to punctuation and grammar rules.",
    cambridgeStandard:
      "3Rg.01 Use knowledge of punctuation and grammar to read familiar texts with understanding.",
    diagnosticTrigger:
      "Student reads sentences word-by-word with equal stress, entirely ignoring commas and full stops, which fragments the syntax and destroys their own reading comprehension.",
  },
  {
    id: "ENGL-G3-READ-3Rg02",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Understand when and why an author uses an exclamation mark to show strong feeling.",
    cambridgeStandard:
      "3Rg.02 Explore in texts, and understand, the use of exclamation marks.",
    diagnosticTrigger:
      "Student reads a sentence ending in an exclamation mark with a flat, falling intonation, failing to decode the punctuation as a visual signal for excitement, volume, or urgency.",
  },
  {
    id: "ENGL-G3-READ-3Rg03",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Understand how apostrophes are used in contractions to show missing letters.",
    cambridgeStandard:
      "3Rg.03 Explore in texts, and understand, the use of apostrophes to mark omission of letters in shortened forms, e.g. can't, don't.",
    diagnosticTrigger:
      "Student points to the apostrophe in 'didn't' and claims it shows possession (belonging to 'didn'), confusing the grammatical function of an omission apostrophe with a possessive apostrophe.",
  },
  {
    id: "ENGL-G3-READ-3Rg04",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Notice the difference in punctuation between the main story and when characters speak out loud.",
    cambridgeStandard:
      "3Rg.04 Explore in texts, and understand, similarities and differences between the punctuation of narrative and direct speech.",
    diagnosticTrigger:
      "Student becomes confused about who is speaking because they fail to visually distinguish the text trapped inside the inverted commas from the surrounding narrative tagging.",
  },
  {
    id: "ENGL-G3-READ-3Rg05",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Identify whether a sentence is telling (statement), asking (question), ordering (command), or exclaiming.",
    cambridgeStandard:
      "3Rg.05 Explore in texts, and understand, the grammar and purpose of different types of sentences (statements, commands/instructions, questions and exclamations).",
    diagnosticTrigger:
      "Student cannot differentiate between a polite question and a direct command in a text, showing a deficit in recognizing imperative versus interrogative grammatical structures.",
  },
  {
    id: "ENGL-G3-READ-3Rg06",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Understand long sentences that have multiple parts joined by connecting words, including 'if' sentences.",
    cambridgeStandard:
      "3Rg.06 Explore in texts, and understand, the grammar of multi-clause sentences, including conditional sentences.",
    diagnosticTrigger:
      "Student reads an 'If... then...' conditional sentence but treats both clauses as independent, guaranteed facts, failing to grasp the logical dependency established by the conditional syntax.",
  },
  {
    id: "ENGL-G3-READ-3Rg07",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Explain the job of nouns (naming), verbs (doing), and adjectives (describing) in a sentence.",
    cambridgeStandard:
      "3Rg.07 Explore the purpose and grammar of nouns, verbs and adjectives in sentences.",
    diagnosticTrigger:
      "Student can circle a verb but cannot articulate that it represents the action in the sentence, demonstrating rote identification without functional grammatical understanding.",
  },
  {
    id: "ENGL-G3-READ-3Rg08",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Find and label nouns, pronouns, verbs, and adjectives in a reading passage.",
    cambridgeStandard:
      "3Rg.08 Identify nouns, pronouns, verbs and adjectives in texts.",
    diagnosticTrigger:
      "Student consistently mislabels adverbs or pronouns as adjectives, revealing an unrefined mental taxonomy for parts of speech beyond the basic noun/verb binary.",
  },
  {
    id: "ENGL-G3-READ-3Rg09",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Understand how prepositions (e.g., under, behind, before) show where or when things happen.",
    cambridgeStandard:
      "3Rg.09 Explore the different purposes of prepositions.",
    diagnosticTrigger:
      "Student reads a sentence with a spatial preposition (e.g., 'The cat hid under the bed') but cannot visually or verbally place the objects in relation to one another, showing weak spatial-syntactic mapping.",
  },
  {
    id: "ENGL-G3-READ-3Rg10",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Identify whether a story is happening now (present tense) or already happened (past tense).",
    cambridgeStandard:
      "3Rg.10 Explore and identify past and present verb forms in texts, including irregular verbs.",
    diagnosticTrigger:
      "Student reads a narrative written entirely in the past tense but verbally retells it using present tense verbs, indicating a failure to track or maintain temporal continuity derived from verb morphology.",
  },
  {
    id: "ENGL-G3-READ-3Rg11",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Match tricky past-tense verbs (like 'went' or 'saw') to their present-tense forms ('go' or 'see').",
    cambridgeStandard:
      "3Rg.11 Identify common irregular verb forms in the past tense and relate them to the present tense.",
    diagnosticTrigger:
      "Student does not recognize that 'caught' is the past action of 'catch', treating the irregular past-tense form as an entirely unrelated vocabulary word.",
  },
  {
    id: "ENGL-G3-READ-3Rs01",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Explain how an event at the beginning of a story connects to something that happens later.",
    cambridgeStandard:
      "3Rs.01 Explore and describe how events or ideas in a text relate to earlier or later events or ideas.",
    diagnosticTrigger:
      "Student can recall isolated events from a text but cannot explain how character's action in chapter one directly caused the problem in chapter three, lacking macro-structural causal tracking.",
  },
  {
    id: "ENGL-G3-READ-3Rs02",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Recognize the different structural layouts of stories, poems, plays, and information books.",
    cambridgeStandard:
      "3Rs.02 Explore and recognise the key features of text structure in a range of different fiction and non-fiction texts, including poems and playscripts.",
    diagnosticTrigger:
      "Student attempts to read a playscript linearly, reading the character names aloud as part of the dialogue, failing to understand the visual formatting rules of dramatic text.",
  },
  {
    id: "ENGL-G3-READ-3Rs03",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Identify how texts are broken up into paragraphs, sections, chapters, or bulleted lists.",
    cambridgeStandard:
      "3Rs.03 Explore and recognise different ways that information is organised in texts, including paragraphs, sections and chapters, and bulleted and numbered lists.",
    diagnosticTrigger:
      "Student skips over bulleted lists or boxed text in an informational book, assuming only the main body paragraphs contain valid reading material.",
  },
  {
    id: "ENGL-G3-READ-3Rs04",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Notice how transition words at the start of a sentence (like 'Later that day...') connect back to the previous sentence.",
    cambridgeStandard:
      "3Rs.04 Explore and recognise how sentence openings in texts establish links between sentences, e.g. Later that day, …",
    diagnosticTrigger:
      "Student reads a transition phrase like 'Because of this,' but cannot identify what 'this' refers to in the preceding sentence, showing a breakdown in backward-reaching cohesive referencing.",
  },
  {
    id: "ENGL-G3-READ-3Ri01",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Explain the difference between fiction and non-fiction and locate them correctly in a library.",
    cambridgeStandard:
      "3Ri.01 Understand the difference between fiction and non-fiction texts and locate books by classification.",
    diagnosticTrigger:
      "Student looks for a book about real-life sharks in the alphabetized storybook section, demonstrating a failure to understand the fundamental library classification split between narrative and informational texts.",
  },
  {
    id: "ENGL-G3-READ-3Ri02",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Read different types of fiction (like plays or poems) and notice how pictures or media help tell the story.",
    cambridgeStandard:
      "3Ri.02 Read and explore a range of fiction genres, poems and playscripts, including identifying the contribution of any visual elements or multimedia.",
    diagnosticTrigger:
      "Student reads a graphic novel or highly illustrated text but completely ignores the visual panels, missing crucial plot inferences that are absent from the written dialogue.",
  },
  {
    id: "ENGL-G3-READ-3Ri03",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Identify and compare the typical features of different fiction genres (e.g., fairy tales vs. realistic stories).",
    cambridgeStandard:
      "3Ri.03 Identify, discuss and compare different fiction genres and their typical characteristics.",
    diagnosticTrigger:
      "Student cannot differentiate between a science fiction story and a traditional fairy tale, failing to categorize narratives based on their genre-specific tropes and setting rules.",
  },
  {
    id: "ENGL-G3-READ-3Ri04",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Read and explore various types of non-fiction texts (like biographies, science books, or how-to guides).",
    cambridgeStandard:
      "3Ri.04 Read and explore a range of non-fiction text types.",
    diagnosticTrigger:
      "Student actively avoids all non-fiction texts during independent reading, lacking the cognitive flexibility or stamina required to process dense, fact-based expository writing.",
  },
  {
    id: "ENGL-G3-READ-3Ri05",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Identify the purpose of a non-fiction text and how the author tries to keep the reader interested.",
    cambridgeStandard:
      "3Ri.05 Identify, discuss and compare the purposes and features of different non-fiction text types, including how texts engage the reader.",
    diagnosticTrigger:
      "Student cannot explain why an author included 'Fun Facts' boxes in an informational text, failing to recognize structural features deliberately designed to hook reader engagement.",
  },
  {
    id: "ENGL-G3-READ-3Ri06",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Find explicitly stated facts, answers, and details directly within a text.",
    cambridgeStandard:
      "3Ri.06 Explore explicit meanings in a range of texts.",
    diagnosticTrigger:
      "Student provides an answer based entirely on outside prior knowledge rather than locating the explicitly stated, contradicting fact written clearly in the provided text.",
  },
  {
    id: "ENGL-G3-READ-3Ri07",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Identify the main idea or 'gist' of a paragraph or short text.",
    cambridgeStandard:
      "3Ri.07 Identify the main points or gist from reading a text.",
    diagnosticTrigger:
      "Student is asked what a paragraph is mostly about and responds by reciting a single, minor, hyper-specific detail, unable to zoom out to synthesize the overarching main idea.",
  },
  {
    id: "ENGL-G3-READ-3Ri08",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Explain how a story's setting and characters change or grow throughout the book.",
    cambridgeStandard:
      "3Ri.08 Explain how settings and characters are developed in a story.",
    diagnosticTrigger:
      "Student views characters as entirely static and cannot identify how a protagonist's feelings or behaviors changed from the beginning of the story to the resolution.",
  },
  {
    id: "ENGL-G3-READ-3Ri09",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Read and follow a sequence of written instructions to complete a task.",
    cambridgeStandard:
      "3Ri.09 Follow written instructions to carry out an activity.",
    diagnosticTrigger:
      "Student attempts to complete a physical task by jumping straight to step 4 without reading steps 1-3, failing to respect the rigid temporal necessity of procedural texts.",
  },
  {
    id: "ENGL-G3-READ-3Ri10",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Understand implied meanings and 'read between the lines' to find clues the author didn't state directly.",
    cambridgeStandard:
      "3Ri.10 Explore implicit meanings in a range of texts.",
    diagnosticTrigger:
      "Student reads 'the sky grew dark and the wind howled' but cannot infer a storm is coming, requiring the author to explicitly state every plot development without relying on atmospheric implication.",
  },
  {
    id: "ENGL-G3-READ-3Ri11",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Predict how a story will end by thinking about how similar stories usually end.",
    cambridgeStandard:
      "3Ri.11 Predict story endings based on knowledge of other stories.",
    diagnosticTrigger:
      "Student predicts a wildly unrealistic ending to a realistic fiction story, failing to apply their background schema of genre conventions to constrain and guide logical predictions.",
  },
  {
    id: "ENGL-G3-READ-3Ri12",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Make inferences about a character's hidden feelings, thoughts, or motives.",
    cambridgeStandard:
      "3Ri.12 Make inferences from texts, including about the feelings, thoughts and motives of story characters.",
    diagnosticTrigger:
      "Student cannot deduce *why* a character lied, stating only that 'they lied,' demonstrating an inability to infer psychological motives or internal emotional states from external dialogue.",
  },
  {
    id: "ENGL-G3-READ-3Ri13",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Tell the difference between a proven fact and a personal opinion in a text.",
    cambridgeStandard:
      "3Ri.13 Begin to distinguish between fact and opinion in texts.",
    diagnosticTrigger:
      "Student reads the sentence 'Pizza is the best food' and categorizes it as a factual statement, unable to differentiate subjective authorial preference from objective, verifiable information.",
  },
  {
    id: "ENGL-G3-READ-3Ri14",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Scan a page of text quickly to locate a specific name, date, or piece of information.",
    cambridgeStandard:
      "3Ri.14 Scan a text to find and use specific information to answer a question.",
    diagnosticTrigger:
      "Student attempts to find a specific date by slowly re-reading the entire page aloud from the very first word, entirely lacking the visual scanning skills to hunt for specific typographical targets.",
  },
  {
    id: "ENGL-G3-READ-3Ri15",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Use the index at the back of a book to find specific information.",
    cambridgeStandard:
      "3Ri.15 Locate relevant information in texts, including using an index.",
    diagnosticTrigger:
      "Student looks for a specific topic by randomly flipping through the middle pages of an informational book, completely ignoring the alphabetical index as an efficient navigational tool.",
  },
  {
    id: "ENGL-G3-READ-3Ri16",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Answer questions by pointing back to a specific sentence or detail in the text.",
    cambridgeStandard:
      "3Ri.16 Answer questions with some reference to single points in a text.",
    diagnosticTrigger:
      "Student gives a correct answer but when asked to prove it, they cannot locate the specific sentence on the page that confirms their thought, showing weak text-referencing skills.",
  },
  {
    id: "ENGL-G3-READ-3Ri17",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Identify the underlying theme or lesson of a story, and compare it to similar stories.",
    cambridgeStandard:
      "3Ri.17 Recognise the theme of a text, and common themes in different texts.",
    diagnosticTrigger:
      "Student summarizes the plot action perfectly but cannot identify the moral or lesson (e.g., 'friendship' or 'bravery'), failing to abstract the thematic message from the literal narrative events.",
  },
  {
    id: "ENGL-G3-READ-3Ra01",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Show enjoyment while reading independently or sharing stories, plays, and non-fiction.",
    cambridgeStandard:
      "3Ra.01 Enjoy independent and shared reading of fiction genres, poems, playscripts and non-fiction texts.",
    diagnosticTrigger:
      "Student exhibits extreme reluctance or visible frustration during independent reading time, abandoning texts after only a few pages without attempting to engage with the narrative.",
  },
  {
    id: "ENGL-G3-READ-3Ra02",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Read silently to yourself for sustained periods.",
    cambridgeStandard:
      "3Ra.02 Read texts silently.",
    diagnosticTrigger:
      "Student cannot read without intensely whispering or mumbling every word aloud, indicating they are still overly reliant on auditory feedback and have not internalized fluent, silent visual reading.",
  },
  {
    id: "ENGL-G3-READ-3Ra03",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Write or share a book review that summarizes the story and gives a personal opinion.",
    cambridgeStandard:
      "3Ra.03 Share a review of a text, summarising what it is about and expressing opinions about it.",
    diagnosticTrigger:
      "Student's book review consists entirely of a plot summary without a single sentence evaluating the quality of the book or expressing a personal subjective opinion.",
  },
  {
    id: "ENGL-G3-READ-3Ra04",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Choose books to read based on reading the back cover (blurb) or peer reviews.",
    cambridgeStandard:
      "3Ra.04 Make choices about books to read for pleasure, including based on blurbs and reviews.",
    diagnosticTrigger:
      "Student randomly selects books based solely on the front cover image, completely ignoring the written blurb on the back that provides essential plot and genre context.",
  },
  {
    id: "ENGL-G3-READ-3Ra05",
    gradeLevel: 3,
    domain: "Reading",
    ixlStyleSkill:
      "Compare different versions of the same story, like various myths or fairy tales.",
    cambridgeStandard:
      "3Ra.05 Compare different retellings of the same story, including the influence of when and where they were written (e.g. myths and legends).",
    diagnosticTrigger:
      "Student reads two cultural variations of the Cinderella story but cannot identify the core structural similarities or explain why the settings differ, failing to perform cross-textual comparative analysis.",
  },
  {
    id: "ENGL-G3-WRIT-3Ww01",
    gradeLevel: 3,
    domain: "Writing",
    ixlStyleSkill:
      "Spell words using different letter combinations for the same consonant sound (e.g., 'j' in jar vs. 'g' in giraffe).",
    cambridgeStandard:
      "3Ww.01 Explore and use common ways in which consonant phonemes can be represented, e.g. jar, giraffe, age, bridge; cat, kitten, brick.",
    diagnosticTrigger:
      "Student rigidly uses only the most basic letter for a sound, writing 'jiraffe' for giraffe or 'kat' for cat, failing to adapt to alternate orthographic representations of consonant phonemes.",
  },
  {
    id: "ENGL-G3-WRIT-3Ww02",
    gradeLevel: 3,
    domain: "Writing",
    ixlStyleSkill:
      "Apply spelling rules when adding -ed or -ing to verbs, like dropping the 'e' or doubling the consonant.",
    cambridgeStandard:
      "3Ww.02 Use recognition of long and short vowel sounds and spelling rules to add -s, -ed and -ing to verbs, including omitting -e before -ing, and doubling consonants where necessary.",
    diagnosticTrigger:
      "Student writes 'makeing' instead of 'making' or 'runing' instead of 'running', demonstrating a failure to apply morphological transformation rules (drop-e, double consonant) when attaching suffixes.",
  },
  {
    id: "ENGL-G3-WRIT-3Ww03",
    gradeLevel: 3,
    domain: "Writing",
    ixlStyleSkill:
      "Spell words with common prefixes (re-, in-) and suffixes (-ment, -ness, -less).",
    cambridgeStandard:
      "3Ww.03 Spell words with a range of common prefixes and suffixes, including re-, in-, -ment, -ness and -less.",
    diagnosticTrigger:
      "Student misspells base words when a suffix is added (e.g., writing 'hapy-ness' instead of 'happiness'), failing to navigate the orthographic boundary between root and affix.",
  },
  {
    id: "ENGL-G3-WRIT-3Ww04",
    gradeLevel: 3,
    domain: "Writing",
    ixlStyleSkill:
      "Spell tricky homophones correctly based on what they mean (e.g., to/too/two, right/write).",
    cambridgeStandard:
      "3Ww.04 Spell common homophones correctly to match their meaning, including to, two, too and right, write.",
    diagnosticTrigger:
      "Student writes 'I have to apples' or 'He was righting a letter', indicating they retrieve spellings purely by phonetic sound without cross-referencing the grammatical or semantic context.",
  },
  {
    id: "ENGL-G3-WRIT-3Ww05",
    gradeLevel: 3,
    domain: "Writing",
    ixlStyleSkill:
      "Use a mix of sounding out, memory tricks, and spelling patterns to spell difficult or irregular words.",
    cambridgeStandard:
      "3Ww.05 Use effective strategies, including spelling patterns, visual memory, mnemonics and segmenting, to spell some unfamiliar regular and exception words correctly (including for compound words).",
    diagnosticTrigger:
      "Student repeatedly misspells the same irregular word in a single paragraph using five different phonetic variations, demonstrating an inability to lock the visual orthographic string into working memory.",
  },
  {
    id: "ENGL-G3-WRIT-3Ww06",
    gradeLevel: 3,
    domain: "Writing",
    ixlStyleSkill:
      "Use a dictionary or spell-checker to fix misspelled words and keep a personal spelling log.",
    cambridgeStandard:
      "3Ww.06 Use paper-based and on-screen tools to find the correct spelling of words; keep and use spelling logs of misspelt words, and identify words that need to be learned.",
    diagnosticTrigger:
      "Student circles a word they know is misspelled but refuses to look it up, guessing wildly or abandoning the sentence entirely because they lack the navigational skills to use a dictionary.",
  },
  {
    id: "ENGL-G3-WRIT-3Wv01",
    gradeLevel: 3,
    domain: "Writing",
    ixlStyleSkill:
      "Use specific, technical vocabulary when writing about a familiar topic.",
    cambridgeStandard:
      "3Wv.01 Use specialised vocabulary accurately to match a familiar topic.",
    diagnosticTrigger:
      "Student writes an informational text about space but relies entirely on generic nouns like 'big rocks' or 'circles' instead of retrieving targeted, domain-specific vocabulary like 'asteroids' or 'planets'.",
  },
  {
    id: "ENGL-G3-WRIT-3Wv02",
    gradeLevel: 3,
    domain: "Writing",
    ixlStyleSkill:
      "Replace boring, overused words (like big, little, good) with more interesting synonyms.",
    cambridgeStandard:
      "3Wv.02 Explore and use synonyms for high frequency words, e.g. big, little, good.",
    diagnosticTrigger:
      "Student writes a descriptive paragraph using the word 'nice' five separate times, demonstrating a restricted expressive lexicon and an inability to retrieve varied semantic synonyms.",
  },
  {
    id: "ENGL-G3-WRIT-3Wv03",
    gradeLevel: 3,
    domain: "Writing",
    ixlStyleSkill:
      "Use a variety of speaking verbs (like whispered, shouted, asked) instead of just 'said' in dialogue.",
    cambridgeStandard:
      "3Wv.03 Explore and use different verbs for introducing and concluding dialogue, e.g. said, asked.",
    diagnosticTrigger:
      "Student writes an entire page of character dialogue relying exclusively on the verb 'said', missing the opportunity to encode character emotion or volume through varied dialogue tags.",
  },
  {
    id: "ENGL-G3-WRIT-3Wv04",
    gradeLevel: 3,
    domain: "Writing",
    ixlStyleSkill:
      "Start sentences in different ways to show time, place, or how an action happened.",
    cambridgeStandard:
      "3Wv.04 Use a variety of sentence openings, including using language of time, place and manner, e.g. Later that day, …; In the distance, …; Slowly and carefully, …",
    diagnosticTrigger:
      "Student begins every single sentence in a narrative with a subject pronoun (e.g., 'He walked. He saw. He went.'), demonstrating a rigid syntactic template that avoids fronted adverbials.",
  },
  {
    id: "ENGL-G3-WRIT-3Wv05",
    gradeLevel: 3,
    domain: "Writing",
    ixlStyleSkill:
      "Choose powerful words and noun phrases to make writing more impactful and descriptive.",
    cambridgeStandard:
      "3Wv.05 Choose and use words and phrases (including noun phrases) to strengthen the impact of writing.",
    diagnosticTrigger:
      "Student writes 'the dog barked' instead of expanding the noun phrase to 'the massive, angry dog barked', failing to utilize pre-modification to build vivid imagery for the reader.",
  },
  {
    id: "ENGL-G3-WRIT-3Wv06",
    gradeLevel: 3,
    domain: "Writing",
    ixlStyleSkill:
      "Include sound words (onomatopoeia) like 'crash' or 'boom' to make writing more exciting.",
    cambridgeStandard:
      "3Wv.06 Use simple figurative language, including sound effects and simple onomatopoeia.",
    diagnosticTrigger:
      "Student describes a chaotic scene (like a thunderstorm or a falling object) purely through literal action verbs, completely missing the stylistic opportunity to employ sensory sound words.",
  },
  {
    id: "ENGL-G3-WRIT-3Wv07",
    gradeLevel: 3,
    domain: "Writing",
    ixlStyleSkill:
      "Use a personal word list or a thesaurus to find new words to upgrade your writing.",
    cambridgeStandard:
      "3Wv.07 Use own lists of interesting and significant words, dictionaries and thesauruses to extend the range of vocabulary used in written work.",
    diagnosticTrigger:
      "Student stares blankly at a page when asked to 'improve' a sentence, entirely unprompted to consult a classroom word wall or thesaurus to independently upgrade their lexical choices.",
  },
  {
    id: "ENGL-G3-WRIT-3Wg01",
    gradeLevel: 3,
    domain: "Writing",
    ixlStyleSkill:
      "Correctly place full stops, question marks, and exclamation marks at the end of sentences.",
    cambridgeStandard:
      "3Wg.01 Use full stops, question marks and exclamation marks correctly in different types of sentences.",
    diagnosticTrigger:
      "Student places full stops at the end of every sentence regardless of context, failing to syntactically monitor when a sentence requires the interrogative or exclamatory punctuation marks.",
  },
  {
    id: "ENGL-G3-WRIT-3Wg02",
    gradeLevel: 3,
    domain: "Writing",
    ixlStyleSkill:
      "Use apostrophes correctly to show where letters are missing in shortened words (contractions).",
    cambridgeStandard:
      "3Wg.02 Use apostrophes to mark omission of letters in shortened forms, e.g. can't, don't.",
    diagnosticTrigger:
      "Student places the apostrophe in the space between the original words (e.g., writing 'do'nt') rather than accurately placing it in the exact spatial position of the omitted letter.",
  },
  {
    id: "ENGL-G3-WRIT-3Wg03",
    gradeLevel: 3,
    domain: "Writing",
    ixlStyleSkill:
      "Use speech marks (quotation marks) to show exactly what a character is saying out loud.",
    cambridgeStandard:
      "3Wg.03 Use speech marks to punctuate direct speech.",
    diagnosticTrigger:
      "Student writes character dialogue but completely omits inverted commas, bleeding the spoken words directly into the narrative tagging and destroying the structural clarity of the scene.",
  },
  {
    id: "ENGL-G3-WRIT-3Wg04",
    gradeLevel: 3,
    domain: "Writing",
    ixlStyleSkill:
      "Write a mix of statements, commands, questions, and exclamations using the correct grammar for each.",
    cambridgeStandard:
      "3Wg.04 Use different types of sentences and their grammar appropriately (statements, commands/instructions, questions and exclamations).",
    diagnosticTrigger:
      "Student attempts to write an instructional guide but phrases every step as a passive statement (e.g., 'You should fold the paper') rather than utilizing the direct imperative grammar ('Fold the paper').",
  },
  {
    id: "ENGL-G3-WRIT-3Wg05",
    gradeLevel: 3,
    domain: "Writing",
    ixlStyleSkill:
      "Write long sentences by joining ideas together with connecting words for time, place, and cause.",
    cambridgeStandard:
      "3Wg.05 Write multi-clause sentences using simple connectives of time, place and cause.",
    diagnosticTrigger:
      "Student writes highly disjointed, staccato clauses (e.g., 'It rained. We stayed inside.') and fails to construct complex causal syntax using subordinating conjunctions like 'because' or 'since'.",
  },
  {
    id: "ENGL-G3-WRIT-3Wg06",
    gradeLevel: 3,
    domain: "Writing",
    ixlStyleSkill:
      "Keep the verb tense (past or present) consistent throughout a whole piece of writing.",
    cambridgeStandard:
      "3Wg.06 Use regular present and past verb forms accurately and consistently across a text.",
    diagnosticTrigger:
      "Student begins a narrative in the past tense ('He walked') but accidentally shifts mid-paragraph into the present tense ('and then he jumps'), indicating a failure to maintain macro-level temporal cohesion.",
  },
  {
    id: "ENGL-G3-WRIT-3Wg07",
    gradeLevel: 3,
    domain: "Writing",
    ixlStyleSkill:
      "Write common irregular past-tense verbs correctly (e.g., went, saw, ran).",
    cambridgeStandard:
      "3Wg.07 Use common irregular verb forms accurately in the past tense.",
    diagnosticTrigger:
      "Student overgeneralizes the standard '-ed' morphological rule, writing 'catched' instead of 'caught' or 'goed' instead of 'went', failing to retrieve the irregular forms from memory.",
  },
  {
    id: "ENGL-G3-WRIT-3Wg08",
    gradeLevel: 3,
    domain: "Writing",
    ixlStyleSkill:
      "Use prepositions (like under, behind, through) accurately to show location or time.",
    cambridgeStandard:
      "3Wg.08 Use a range of prepositions accurately.",
    diagnosticTrigger:
      "Student uses vague or incorrect prepositions to describe spatial relationships (e.g., writing 'He walked in the bridge' instead of 'across the bridge'), reflecting poor spatial-linguistic mapping.",
  },
  {
    id: "ENGL-G3-WRIT-3Ws01",
    gradeLevel: 3,
    domain: "Writing",
    ixlStyleSkill:
      "Write events and ideas in a logical order to build a clear story plot.",
    cambridgeStandard:
      "3Ws.01 Write a logical sequence of events or ideas, e.g. to develop the plot of a story.",
    diagnosticTrigger:
      "Student writes a narrative where the climax occurs arbitrarily before the characters are even introduced, demonstrating a severe inability to sequence causal events into a logical narrative arc.",
  },
  {
    id: "ENGL-G3-WRIT-3Ws02",
    gradeLevel: 3,
    domain: "Writing",
    ixlStyleSkill:
      "Group related ideas together into clear paragraphs or sections.",
    cambridgeStandard:
      "3Ws.02 Begin to organise similar ideas in paragraphs and sections.",
    diagnosticTrigger:
      "Student writes a full-page informational report as one massive, unbroken block of text, jumping between subtopics randomly without utilizing spatial paragraph breaks to signal thematic shifts.",
  },
  {
    id: "ENGL-G3-WRIT-3Ws03",
    gradeLevel: 3,
    domain: "Writing",
    ixlStyleSkill:
      "Use transition words at the start of sentences to connect ideas smoothly.",
    cambridgeStandard:
      "3Ws.03 Use sentence openings that establish links between ideas in different sentences, e.g. Later that day, …",
    diagnosticTrigger:
      "Student writes sequential sentences that feel entirely disconnected (e.g., 'He went to the store. He was eating dinner.'), failing to use fronted temporal transitions to bridge the logical time-jump.",
  },
  {
    id: "ENGL-G3-WRIT-3Ws04",
    gradeLevel: 3,
    domain: "Writing",
    ixlStyleSkill:
      "Use text features like bullet points or numbered lists to organize non-fiction writing.",
    cambridgeStandard:
      "3Ws.04 Use organisational features appropriate to the text type, e.g. bulleted and numbered lists.",
    diagnosticTrigger:
      "Student attempts to write a procedural recipe using dense, flowing narrative paragraphs, completely failing to employ the numbered lists structurally expected for step-by-step instructions.",
  },
  {
    id: "ENGL-G3-WRIT-3Wc01",
    gradeLevel: 3,
    domain: "Writing",
    ixlStyleSkill:
      "Write creative stories and poems in a variety of different genres.",
    cambridgeStandard:
      "3Wc.01 Develop creative writing in a range of different genres of fiction and types of poems.",
    diagnosticTrigger:
      "Student is tasked with writing a science fiction story but produces a standard realistic playground narrative, unable to cognitively shift their creative ideation into alternate genre constraints.",
  },
  {
    id: "ENGL-G3-WRIT-3Wc02",
    gradeLevel: 3,
    domain: "Writing",
    ixlStyleSkill:
      "Plan writing by taking notes and outlining main ideas before starting.",
    cambridgeStandard:
      "3Wc.02 Plan and record main points and ideas before writing.",
    diagnosticTrigger:
      "Student refuses to use a graphic organizer, immediately diving into writing the first sentence but completely abandoning the text halfway down the page because they lost the thread of their own plot.",
  },
  {
    id: "ENGL-G3-WRIT-3Wc03",
    gradeLevel: 3,
    domain: "Writing",
    ixlStyleSkill:
      "Write detailed descriptions of settings and characters to make stories more vivid.",
    cambridgeStandard:
      "3Wc.03 Develop descriptions of settings and characters when writing stories.",
    diagnosticTrigger:
      "Student introduces a new character simply by name ('Then John walked in') without offering a single physical, emotional, or behavioral detail, leaving the narrative entirely devoid of imagery.",
  },
  {
    id: "ENGL-G3-WRIT-3Wc04",
    gradeLevel: 3,
    domain: "Writing",
    ixlStyleSkill:
      "Write a simple script for a play based on a story you know.",
    cambridgeStandard:
      "3Wc.04 Write a simple playscript based on a given narrative.",
    diagnosticTrigger:
      "Student attempts to write a playscript by writing standard narrative paragraphs with quotation marks, failing to adopt the structural format of centered character names and colon separators.",
  },
  {
    id: "ENGL-G3-WRIT-3Wc05",
    gradeLevel: 3,
    domain: "Writing",
    ixlStyleSkill:
      "Change your writing style and layout to match the specific type of text you are creating.",
    cambridgeStandard:
      "3Wc.05 Develop writing for a purpose using language and features appropriate for a range of text types.",
    diagnosticTrigger:
      "Student writes a formal persuasive letter using casual slang, emojis, and narrative storytelling, showing a severe inability to adjust pragmatic tone to match the text's utilitarian purpose.",
  },
  {
    id: "ENGL-G3-WRIT-3Wc06",
    gradeLevel: 3,
    domain: "Writing",
    ixlStyleSkill:
      "Write clearly for a specific audience, choosing the right information and tone.",
    cambridgeStandard:
      "3Wc.06 Develop writing of a range of text types for a specified audience, using appropriate content and language.",
    diagnosticTrigger:
      "Student writes an instructional manual 'for kindergarteners' using dense, highly complex vocabulary and zero pictures, failing entirely to engage in audience-appropriate perspective-taking.",
  },
  {
    id: "ENGL-G3-WRIT-3Wp01",
    gradeLevel: 3,
    domain: "Writing",
    ixlStyleSkill:
      "Write smoothly and legibly so others can easily read your work.",
    cambridgeStandard:
      "3Wp.01 Begin to write legibly and fluently.",
    diagnosticTrigger:
      "Student produces handwriting that fluctuates wildly in size, drifts completely off the ruled lines, and lacks consistent spacing, indicating poor fine motor automaticity.",
  },
  {
    id: "ENGL-G3-WRIT-3Wp02",
    gradeLevel: 3,
    domain: "Writing",
    ixlStyleSkill:
      "Fill out tables or diagrams to organize information found in a text.",
    cambridgeStandard:
      "3Wp.02 Complete a table or diagram to record information drawn from a text.",
    diagnosticTrigger:
      "Student attempts to summarize comparison data by writing out full paragraphs rather than utilizing the spatial efficiency of the provided graphic organizer or Venn diagram.",
  },
  {
    id: "ENGL-G3-WRIT-3Wp03",
    gradeLevel: 3,
    domain: "Writing",
    ixlStyleSkill:
      "Present your writing using layouts that fit the audience (like adding pictures or typing on a screen).",
    cambridgeStandard:
      "3Wp.03 Explore and use different ways of laying out and presenting texts to suit the purpose and audience (handwritten, printed and onscreen).",
    diagnosticTrigger:
      "Student writes an informational poster entirely in tiny, dense, left-aligned text, failing to utilize spatial layout strategies like centering, bolding, or adding visual white space to engage the audience.",
  },
  {
    id: "ENGL-G3-WRIT-3Wp04",
    gradeLevel: 3,
    domain: "Writing",
    ixlStyleSkill:
      "Read your own and peers' writing and suggest ways to improve the meaning and accuracy.",
    cambridgeStandard:
      "3Wp.04 Evaluate own and others' writing, suggesting improvements for sense, accuracy and content.",
    diagnosticTrigger:
      "Student reviews a peer's highly confusing, incomplete draft and states 'It's good,' unable to adopt an editorial, critical lens to identify semantic gaps or syntactic errors.",
  },
  {
    id: "ENGL-G3-WRIT-3Wp05",
    gradeLevel: 3,
    domain: "Writing",
    ixlStyleSkill:
      "Check writing for spelling, grammar, and punctuation mistakes, using digital tools when helpful.",
    cambridgeStandard:
      "3Wp.05 Proofread for grammar, spelling and punctuation errors, and make corrections, including using on-screen tools.",
    diagnosticTrigger:
      "Student sees a red squiggly spell-check line on the computer screen and ignores it entirely, lacking the self-monitoring reflex to pause and execute a mechanical correction.",
  },
  {
    id: "ENGL-G3-SPKL-3SLm01",
    gradeLevel: 3,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Speak smoothly and confidently in group discussions and familiar settings.",
    cambridgeStandard:
      "3SLm.01 Speak fluently and confidently in a range of familiar contexts.",
    diagnosticTrigger:
      "Student speaks in highly fragmented, staccato bursts filled with 'um' and 'uh', completely losing their train of thought due to anxiety or poor oral syntactic planning.",
  },
  {
    id: "ENGL-G3-SPKL-3SLm02",
    gradeLevel: 3,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Choose the most important details to share when explaining something to others.",
    cambridgeStandard:
      "3SLm.02 Select appropriate information, with appropriate detail, as needed.",
    diagnosticTrigger:
      "Student recounts a movie plot by detailing every single minor, irrelevant action sequentially, unable to selectively filter information to highlight the macro-level main points.",
  },
  {
    id: "ENGL-G3-SPKL-3SLm03",
    gradeLevel: 3,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Choose the right words to match the topic and the formality of the situation.",
    cambridgeStandard:
      "3SLm.03 Use vocabulary appropriate to the situation.",
    diagnosticTrigger:
      "Student delivers a formal presentation to the class using highly informal playground slang, demonstrating an inability to shift their lexical register to match the communicative context.",
  },
  {
    id: "ENGL-G3-SPKL-3SLm04",
    gradeLevel: 3,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Use body language, facial expressions, and eye contact intentionally to improve communication.",
    cambridgeStandard:
      "3SLm.04 Use non-verbal communication techniques for different purposes.",
    diagnosticTrigger:
      "Student attempts to emphasize a dramatic point during a speech but maintains a completely rigid, motionless posture and a flat facial affect, failing to align physical kinesics with verbal intent.",
  },
  {
    id: "ENGL-G3-SPKL-3SLm05",
    gradeLevel: 3,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Change your tone of voice and language to keep the audience interested and engaged.",
    cambridgeStandard:
      "3SLm.05 Show awareness of an audience, e.g. by adapting language and tone to engage them.",
    diagnosticTrigger:
      "Student reads a report aloud by staring exclusively at their paper and droning in a monotone voice, entirely oblivious to the fact that the peer audience has stopped listening.",
  },
  {
    id: "ENGL-G3-SPKL-3SLs01",
    gradeLevel: 3,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Listen carefully to a sequence of instructions and follow them accurately.",
    cambridgeStandard:
      "3SLs.01 Listen and respond appropriately, including following a sequence of instructions to carry out an activity.",
    diagnosticTrigger:
      "Student hears a three-step instruction but executes the steps out of order, indicating a breakdown in sequencing and holding multi-part auditory information in working memory.",
  },
  {
    id: "ENGL-G3-SPKL-3SLs02",
    gradeLevel: 3,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Ask questions that prove you understood the main ideas of what you heard or read.",
    cambridgeStandard:
      "3SLs.02 Ask questions about what is heard or read that demonstrate understanding of the main points.",
    diagnosticTrigger:
      "Student asks a question about a completely trivial, irrelevant detail after a presentation, rather than probing deeper into the core thesis, showing poor synthesis of the main ideas.",
  },
  {
    id: "ENGL-G3-SPKL-3SLg01",
    gradeLevel: 3,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Take on and perform a specific role (like leader or note-taker) in a group project.",
    cambridgeStandard:
      "3SLg.01 Begin to take an assigned role within a group.",
    diagnosticTrigger:
      "Student is assigned the role of 'timekeeper' but completely abandons the responsibility to independently execute the primary task themselves, failing to adhere to structured collaborative parameters.",
  },
  {
    id: "ENGL-G3-SPKL-3SLg02",
    gradeLevel: 3,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Respond politely to someone else's opinion when sharing your own.",
    cambridgeStandard:
      "3SLg.02 Respond politely to another point of view with a personal point of view.",
    diagnosticTrigger:
      "Student reacts to a peer's differing opinion by immediately shouting 'No, you're wrong!' rather than using a softening phrase like 'I disagree because...', lacking social-verbal moderation skills.",
  },
  {
    id: "ENGL-G3-SPKL-3SLg03",
    gradeLevel: 3,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Add helpful, related comments to keep a group discussion moving forward.",
    cambridgeStandard:
      "3SLg.03 Extend a discussion by contributing relevant comments.",
    diagnosticTrigger:
      "Student either remains entirely silent during a debate or interjects with a completely off-topic fact, failing to weave their contribution into the existing conversational thread.",
  },
  {
    id: "ENGL-G3-SPKL-3SLg04",
    gradeLevel: 3,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Take turns speaking and acknowledge what the previous person just said before adding your point.",
    cambridgeStandard:
      "3SLg.04 Take turns in a discussion, acknowledging what others have said.",
    diagnosticTrigger:
      "Student waits for a peer to finish speaking but immediately launches into their own completely unrelated point, showing a failure to actively bridge or validate the prior speaker's input.",
  },
  {
    id: "ENGL-G3-SPKL-3SLp01",
    gradeLevel: 3,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Read aloud smoothly, matching the emotion and meaning of the words.",
    cambridgeStandard:
      "3SLp.01 Read aloud with expression appropriate to the meaning and sound of the words.",
    diagnosticTrigger:
      "Student reads a highly suspenseful, action-packed paragraph with the exact same slow, lethargic pacing as a factual textbook, failing to adjust prosody to match semantic tone.",
  },
  {
    id: "ENGL-G3-SPKL-3SLp02",
    gradeLevel: 3,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Use different voices or tones for different characters when reading aloud.",
    cambridgeStandard:
      "3SLp.02 Show awareness of different voices when reading aloud.",
    diagnosticTrigger:
      "Student reads a conversation between an angry giant and a timid mouse using their standard speaking voice for both, failing to manipulate pitch and volume to represent distinct character traits.",
  },
  {
    id: "ENGL-G3-SPKL-3SLp03",
    gradeLevel: 3,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Read familiar texts accurately by pausing at punctuation and following grammar rules.",
    cambridgeStandard:
      "3SLp.03 Use knowledge of punctuation and grammar to read familiar texts with accuracy.",
    diagnosticTrigger:
      "Student ignores commas in a complex list, reading it as one continuous, breathless rush, which destroys the syntactical structure and obscures the intended meaning.",
  },
  {
    id: "ENGL-G3-SPKL-3SLp04",
    gradeLevel: 3,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Use your voice, body language, and movement to act out a character in a play or drama.",
    cambridgeStandard:
      "3SLp.04 Use speech, gesture and movement to create a character in drama.",
    diagnosticTrigger:
      "Student stands completely still with their arms glued to their sides while reciting a script, unable to physically embody or project the kinetic traits of the dramatic persona.",
  },
  {
    id: "ENGL-G3-SPKL-3SLp05",
    gradeLevel: 3,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Plan and give a short solo presentation about a familiar topic to the class.",
    cambridgeStandard:
      "3SLp.05 Plan and deliver a presentation independently on a familiar subject in a familiar context.",
    diagnosticTrigger:
      "Student attempts to give a presentation but has no planned structure, rambling randomly and repeating themselves because they failed to logically sequence their ideas beforehand.",
  },
  {
    id: "ENGL-G3-SPKL-3SLr01",
    gradeLevel: 3,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Evaluate a presentation or discussion, pointing out what was good and what to fix next time.",
    cambridgeStandard:
      "3SLr.01 Begin to evaluate own and others' talk, including what went well and what could be improved next time.",
    diagnosticTrigger:
      "Student can only offer generic praise ('it was nice') but completely freezes when asked for one specific area of constructive improvement, lacking the critical framework to assess oral delivery.",
  },
  {
    id: "ENGL-G3-SPKL-3SLr02",
    gradeLevel: 3,
    domain: "Speaking and Listening",
    ixlStyleSkill:
      "Explain how meaning changes based on both the words spoken and the body language used.",
    cambridgeStandard:
      "3SLr.02 Begin to comment on the ways that meaning can be expressed verbally and non-verbally in different contexts.",
    diagnosticTrigger:
      "Student takes a sarcastic or exaggerated verbal statement completely literally, failing to synthesize the speaker's rolling eyes and exaggerated tone as communicative modifiers of the text.",
  },
];
