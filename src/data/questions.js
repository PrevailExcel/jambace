// Sample JAMB past questions — covers all subjects
// Replace with real API data in production

export const SAMPLE_QUESTIONS = [
  // ── ENGLISH LANGUAGE
  {
    id: 'en-001', subject: 'english', year: 2023, topic: 'comprehension',
    text: 'Choose the option that best completes the sentence:\n\nThe committee ______ its findings to the board last Tuesday.',
    options: ['presented', 'has presented', 'presents', 'was presenting'],
    correctIndex: 0,
    explanation: '"Presented" is the correct simple past tense here because "last Tuesday" pins the action to a specific completed point in the past. "Has presented" (present perfect) would be used when no specific time is mentioned. "Presents" is present tense, and "was presenting" implies an action in progress at the time — neither fits.',
    verified: true, flagCount: 0, difficulty: 'easy', imagePath: null
  },
  {
    id: 'en-002', subject: 'english', year: 2022, topic: 'lexis-structure',
    text: 'In the sentence "The chairman, together with his directors, was present at the meeting", the subject of the verb is:',
    options: ['chairman', 'the chairman', 'directors', 'his directors'],
    correctIndex: 1,
    explanation: '"Together with his directors" is a parenthetical phrase — it does not change the grammatical subject. The true subject is "the chairman" (with the definite article), which is why the verb is singular: "was" not "were".',
    verified: true, flagCount: 0, difficulty: 'medium', imagePath: null
  },
  {
    id: 'en-003', subject: 'english', year: 2021, topic: 'oral-english',
    text: 'Which of the following words has a different vowel sound from the others?',
    options: ['bean', 'keen', 'seen', 'ten'],
    correctIndex: 3,
    explanation: '"Bean", "keen", and "seen" all contain the long /iː/ vowel sound. "Ten" contains the short /ɛ/ vowel sound, making it the odd one out.',
    verified: true, flagCount: 0, difficulty: 'easy', imagePath: null
  },
  {
    id: 'en-004', subject: 'english', year: 2020, topic: 'summary',
    text: 'The word "obsequious" most nearly means:',
    options: ['Aggressive and hostile', 'Excessively eager to please or obey', 'Forgetful and absent-minded', 'Curious and inquisitive'],
    correctIndex: 1,
    explanation: '"Obsequious" describes someone who is servilely compliant or deferential — excessively eager to please. It often carries a negative connotation of sycophancy or fawning behaviour.',
    verified: true, flagCount: 0, difficulty: 'hard', imagePath: null
  },
  {
    id: 'en-005', subject: 'english', year: 2019, topic: 'lexis-structure',
    text: 'Identify the figure of speech in the following: "The wind whispered through the trees."',
    options: ['Simile', 'Metaphor', 'Personification', 'Hyperbole'],
    correctIndex: 2,
    explanation: 'The sentence gives the wind — an inanimate object — the human quality of "whispering". This is personification. A simile would use "like" or "as". A metaphor would state the wind IS something else. Hyperbole is an exaggeration.',
    verified: true, flagCount: 0, difficulty: 'easy', imagePath: null
  },

  // ── MATHEMATICS
  {
    id: 'ma-001', subject: 'mathematics', year: 2023, topic: 'algebra',
    text: 'Find the value of x if 3x + 7 = 22',
    options: ['3', '5', '7', '9'],
    correctIndex: 1,
    explanation: '3x + 7 = 22\n3x = 22 − 7 = 15\nx = 15 ÷ 3 = 5\n\nAlways isolate the variable by performing inverse operations on both sides.',
    verified: true, flagCount: 0, difficulty: 'easy', imagePath: null
  },
  {
    id: 'ma-002', subject: 'mathematics', year: 2022, topic: 'quadratic-equations',
    text: 'Solve for x: x² − 5x + 6 = 0',
    options: ['x = 2 or x = 3', 'x = −2 or x = −3', 'x = 1 or x = 6', 'x = −1 or x = −6'],
    correctIndex: 0,
    explanation: 'Factorise: x² − 5x + 6 = (x − 2)(x − 3) = 0\nTherefore x = 2 or x = 3.\n\nTo factorise, find two numbers that multiply to +6 and add to −5. Those numbers are −2 and −3.',
    verified: true, flagCount: 0, difficulty: 'medium', imagePath: null
  },
  {
    id: 'ma-003', subject: 'mathematics', year: 2021, topic: 'geometry',
    text: 'The angle subtended by an arc at the centre of a circle is 120°. What is the angle subtended by the same arc at the circumference?',
    options: ['30°', '60°', '90°', '240°'],
    correctIndex: 1,
    explanation: 'By the Inscribed Angle Theorem: the angle at the centre is twice the angle at the circumference subtended by the same arc.\n\nAngle at circumference = 120° ÷ 2 = 60°',
    verified: true, flagCount: 0, difficulty: 'medium', imagePath: null
  },
  {
    id: 'ma-004', subject: 'mathematics', year: 2020, topic: 'statistics',
    text: 'The mean of 5 numbers is 8. If four of the numbers are 6, 10, 7, and 11, what is the fifth number?',
    options: ['4', '5', '6', '7'],
    correctIndex: 2,
    explanation: 'Mean = Sum ÷ Count\n8 = Sum ÷ 5\nSum = 40\n\nFifth number = 40 − (6 + 10 + 7 + 11) = 40 − 34 = 6',
    verified: true, flagCount: 0, difficulty: 'easy', imagePath: null
  },
  {
    id: 'ma-005', subject: 'mathematics', year: 2019, topic: 'trigonometry',
    text: 'If sin θ = 3/5, find cos θ (where θ is acute)',
    options: ['3/4', '4/5', '4/3', '5/3'],
    correctIndex: 1,
    explanation: 'Using Pythagoras: if sin θ = opposite/hypotenuse = 3/5\nThen opposite = 3, hypotenuse = 5\nAdjacent = √(5² − 3²) = √(25 − 9) = √16 = 4\n\ncos θ = adjacent/hypotenuse = 4/5',
    verified: true, flagCount: 0, difficulty: 'medium', imagePath: null
  },

  // ── CHEMISTRY
  {
    id: 'ch-001', subject: 'chemistry', year: 2023, topic: 'atomic-structure',
    text: 'An element has the electronic configuration 2, 8, 7. To which group in the periodic table does it belong?',
    options: ['Group V', 'Group VI', 'Group VII', 'Group VIII'],
    correctIndex: 2,
    explanation: 'The last shell has 7 electrons, placing this element in Group VII (the Halogens). The group number equals the number of electrons in the outermost shell for main group elements. This element is Chlorine (Cl, atomic number 17).',
    verified: true, flagCount: 0, difficulty: 'easy', imagePath: null
  },
  {
    id: 'ch-002', subject: 'chemistry', year: 2022, topic: 'chemical-bonding',
    text: 'Which of the following compounds has an ionic bond?',
    options: ['H₂O', 'CO₂', 'NaCl', 'NH₃'],
    correctIndex: 2,
    explanation: 'NaCl (sodium chloride) is formed by complete electron transfer from Na to Cl, creating Na⁺ and Cl⁻ ions held by electrostatic attraction — this is ionic bonding. H₂O, CO₂, and NH₃ are all formed by electron sharing (covalent bonds).',
    verified: true, flagCount: 0, difficulty: 'easy', imagePath: null
  },
  {
    id: 'ch-003', subject: 'chemistry', year: 2021, topic: 'organic-chemistry',
    text: 'The functional group —COOH is characteristic of:',
    options: ['Alcohols', 'Esters', 'Carboxylic acids', 'Aldehydes'],
    correctIndex: 2,
    explanation: '—COOH is the carboxyl group, which defines carboxylic acids (e.g., ethanoic acid, CH₃COOH). Alcohols have —OH, esters have —COO—, and aldehydes have —CHO.',
    verified: true, flagCount: 0, difficulty: 'easy', imagePath: null
  },
  {
    id: 'ch-004', subject: 'chemistry', year: 2020, topic: 'equilibrium',
    text: 'According to Le Chatelier\'s Principle, increasing pressure on a gaseous equilibrium will shift the reaction in the direction that:',
    options: [
      'Produces more gas molecules',
      'Reduces the number of gas molecules',
      'Raises the temperature',
      'Lowers the temperature'
    ],
    correctIndex: 1,
    explanation: 'Le Chatelier\'s Principle states that a system at equilibrium will respond to a stress by shifting to oppose that stress. Increasing pressure is relieved by shifting toward the side with fewer moles of gas, reducing pressure.',
    verified: true, flagCount: 2, difficulty: 'hard', imagePath: null
  },
  {
    id: 'ch-005', subject: 'chemistry', year: 2019, topic: 'electrochemistry',
    text: 'During electrolysis of dilute H₂SO₄, what is produced at the cathode?',
    options: ['Oxygen', 'Hydrogen', 'Sulphur dioxide', 'Water'],
    correctIndex: 1,
    explanation: 'The cathode is the negative electrode. Hydrogen ions (H⁺) from the acid are attracted to it and gain electrons (reduction): 2H⁺ + 2e⁻ → H₂. Oxygen is produced at the anode.',
    verified: true, flagCount: 0, difficulty: 'medium', imagePath: null
  },

  // ── BIOLOGY
  {
    id: 'bi-001', subject: 'biology', year: 2023, topic: 'cell-biology',
    text: 'Which organelle is responsible for producing ATP through aerobic respiration?',
    options: ['Ribosome', 'Golgi apparatus', 'Mitochondrion', 'Endoplasmic reticulum'],
    correctIndex: 2,
    explanation: 'The mitochondrion is the "powerhouse of the cell". It carries out aerobic respiration, converting glucose and oxygen into ATP (energy), CO₂, and water via the Krebs cycle and electron transport chain.',
    verified: true, flagCount: 0, difficulty: 'easy', imagePath: null
  },
  {
    id: 'bi-002', subject: 'biology', year: 2022, topic: 'genetics',
    text: 'In a monohybrid cross between two heterozygous parents (Aa × Aa), what is the expected phenotypic ratio of the offspring?',
    options: ['1:2:1', '3:1', '1:1', '2:1:1'],
    correctIndex: 1,
    explanation: 'From Aa × Aa:\nGenotypes: AA : Aa : aa = 1 : 2 : 1\nPhenotypes: If A is dominant, AA and Aa show dominant trait, aa shows recessive.\nPhenotypic ratio = 3 dominant : 1 recessive = 3:1',
    verified: true, flagCount: 0, difficulty: 'medium', imagePath: null
  },
  {
    id: 'bi-003', subject: 'biology', year: 2021, topic: 'ecology',
    text: 'Which of the following correctly describes a food chain?',
    options: [
      'Sun → Grasshopper → Grass → Frog → Snake',
      'Grass → Grasshopper → Frog → Snake → Eagle',
      'Eagle → Snake → Frog → Grasshopper → Grass',
      'Grasshopper → Grass → Frog → Eagle → Snake'
    ],
    correctIndex: 1,
    explanation: 'A food chain flows from producer to consumer in the order energy is transferred. Grass (producer) is eaten by Grasshopper (primary consumer) → Frog (secondary) → Snake (tertiary) → Eagle (quaternary). Energy always flows from lower to higher trophic levels.',
    verified: true, flagCount: 0, difficulty: 'easy', imagePath: null
  },
  {
    id: 'bi-004', subject: 'biology', year: 2020, topic: 'human-physiology',
    text: 'The part of the human brain responsible for balance and coordination of movement is the:',
    options: ['Cerebrum', 'Medulla oblongata', 'Cerebellum', 'Hypothalamus'],
    correctIndex: 2,
    explanation: 'The cerebellum (located at the back of the brain) coordinates voluntary movements, balance, and posture. The cerebrum handles higher thinking, the medulla oblongata controls involuntary functions (breathing, heartbeat), and the hypothalamus regulates homeostasis.',
    verified: true, flagCount: 0, difficulty: 'easy', imagePath: null
  },
  {
    id: 'bi-005', subject: 'biology', year: 2019, topic: 'photosynthesis',
    text: 'Which of the following is NOT a product of the light-dependent reactions of photosynthesis?',
    options: ['ATP', 'NADPH', 'Glucose', 'Oxygen'],
    correctIndex: 2,
    explanation: 'The light-dependent reactions produce ATP, NADPH, and O₂ (from splitting water). Glucose is produced later in the light-independent reactions (Calvin cycle) using the ATP and NADPH generated here.',
    verified: true, flagCount: 1, difficulty: 'hard', imagePath: null
  }
]

export const SUBJECT_CONFIG = {
  english:     { label: 'English Language', color: '#00C853', bg: '#E8FFF1' },
  mathematics: { label: 'Mathematics',       color: '#FFB800', bg: '#FFF8E1' },
  chemistry:   { label: 'Chemistry',          color: '#7B1FA2', bg: '#F3E5F5' },
  biology:     { label: 'Biology',            color: '#2196F3', bg: '#E3F2FD' },
  physics:     { label: 'Physics',            color: '#FF5722', bg: '#FBE9E7' },
  economics:   { label: 'Economics',          color: '#009688', bg: '#E0F2F1' },
  government:  { label: 'Government',         color: '#E91E63', bg: '#FCE4EC' },
  literature:  { label: 'Literature',         color: '#795548', bg: '#EFEBE9' },
}

export const EXAM_CONFIGS = {
  mock: {
    label: 'UTME Mock Exam',
    timeLimit: 60 * 60, // 60 minutes in seconds
    questionsPerSubject: 10,
    instructions: 'This is a full UTME simulation. Answer all questions within 60 minutes. You cannot pause this exam.'
  },
  practice: {
    label: 'Practice Session',
    timeLimit: null, // no time limit
    questionsPerSubject: 10,
    instructions: 'Practice at your own pace. Correct answers and explanations are shown after each question.'
  },
  'weak-areas': {
    label: 'Weak Area Drill',
    timeLimit: 20 * 60, // 20 minutes
    questionsPerSubject: 8,
    instructions: 'Focused practice on your weakest topics. Push through — this is where improvement happens.'
  },
  challenge: {
    label: 'Friend Challenge',
    timeLimit: 10 * 60, // 10 minutes
    questionsPerSubject: 5,
    instructions: 'You and your friend answer the same questions. Fastest with most correct wins.'
  }
}
