/**
 * studyNotes.js
 *
 * Content for the Library feature:
 *   - NOVEL: The Lekki Headmaster (current JAMB Literature set text)
 *   - NOTES: Topic-by-topic class notes for every subject 2Wise supports
 *
 * Structure:
 *   NOVEL_DATA   — novel overview, characters, themes, chapters, exam tips
 *   SUBJECT_NOTES — { [subject]: { [topicSlug]: { title, body, keyPoints, examTip } } }
 */

// ─────────────────────────────────────────────────────────────────────────────
// NOVEL: The Lekki Headmaster by Wale Okediran
// ─────────────────────────────────────────────────────────────────────────────

export const NOVEL_DATA = {
  title:  'The Lekki Headmaster',
  author: 'Wale Okediran',
  genre:  'Nigerian Contemporary Fiction',
  year:   2009,

  synopsis: `The Lekki Headmaster follows Bello Lawal, a principled and idealistic headmaster posted to a struggling public school in the rapidly developing Lekki area of Lagos. Surrounded by a community caught between traditional values and the lure of urban wealth, Bello must navigate institutional corruption, political interference, poor infrastructure, and community apathy — all while trying to give the children in his care a genuine education. The novel is a sharp critique of Nigeria's public education system and the social forces that undermine it, but ultimately it is a story of resilience, quiet heroism, and the transformative power of one committed individual.`,

  themes: [
    {
      title: 'Corruption and Institutional Failure',
      body: 'The school reflects the rot in the wider Nigerian system — funds are diverted, officials demand bribes, and merit is consistently sacrificed for connection. Bello\'s battle with the education authorities is the novel\'s central conflict.',
    },
    {
      title: 'Education as Liberation',
      body: 'Despite every obstacle, Bello holds firm to the belief that education is the only true path out of poverty. The children he teaches represent hope — and the stakes of his fight are their futures.',
    },
    {
      title: 'Urbanisation and Social Change',
      body: 'Lekki in the novel is a microcosm of Lagos\'s rapid transformation — old fishing communities displaced by real-estate development, traditional community bonds dissolving under economic pressure. The school sits at the fault line of old and new Nigeria.',
    },
    {
      title: 'Integrity and Personal Courage',
      body: 'Bello is not a saint but he consistently chooses principle over personal comfort. His refusal to compromise even when it costs him professionally is the moral spine of the novel.',
    },
    {
      title: 'Community and Collective Responsibility',
      body: 'The novel argues that schools fail not just because of bad governance but because communities abdicate responsibility. Parents who are absent, who do not hold leaders accountable, share in the failure.',
    },
    {
      title: 'Gender and Opportunity',
      body: 'Several female characters — including students — face specific barriers: early marriage, domestic burdens, sexual harassment. The novel does not romanticise these realities.',
    },
  ],

  characters: [
    {
      name: 'Bello Lawal',
      role: 'Protagonist — the headmaster',
      description: 'An educated, principled man from a modest background who believes deeply in public education. His idealism is tested relentlessly but never fully broken. He is flawed — sometimes stubborn and self-righteous — but his commitment to his students is genuine.',
    },
    {
      name: 'Mama Tunde (Iya Tunde)',
      role: 'Community elder / PTA leader',
      description: 'A powerful market woman and informal community leader. She represents the voice of the community and becomes one of Bello\'s most important — if unpredictable — allies. Her pragmatism contrasts with Bello\'s idealism.',
    },
    {
      name: 'Mr. Otunla',
      role: 'Local government education officer',
      description: 'The primary antagonist. A bureaucrat who uses his position to extract bribes and sabotage anyone who challenges the status quo. He represents systemic corruption made personal.',
    },
    {
      name: 'Comfort Lawal',
      role: 'Bello\'s wife',
      description: 'Supportive but increasingly strained by the financial and social cost of her husband\'s principles. Her character gives the novel its domestic dimension — the private toll of public integrity.',
    },
    {
      name: 'Tunde',
      role: 'Student — symbol of potential',
      description: 'A bright student from a poor home whose fate is intertwined with the school\'s. Tunde represents what is at stake in every decision the headmaster makes.',
    },
    {
      name: 'Pastor Emmanuel',
      role: 'Local religious figure',
      description: 'A morally ambiguous character who sometimes assists Bello and sometimes complicates matters. He reflects the complex role of religion in Nigerian public life.',
    },
  ],

  chapters: [
    { number: 1, title: 'Arrival', summary: 'Bello arrives at the Lekki school for the first time and is confronted immediately by the physical decay of the building, absent teachers, and an almost feral atmosphere among the students. He begins to understand the scale of the problem.' },
    { number: 2, title: 'The Community', summary: 'Bello explores Lekki — the fishing villages, the luxury estates under construction, the market. He meets Mama Tunde and begins to understand the social dynamics he is operating within.' },
    { number: 3, title: 'First Battles', summary: 'Bello introduces discipline and structure. Some teachers resist. He clashes with Mr. Otunla for the first time over missing school funds. The community is watchful but not yet engaged.' },
    { number: 4, title: 'The Children', summary: 'Several students are introduced in depth — including Tunde. Bello begins holding extra classes. A girl is withdrawn from school for marriage. Bello confronts her father.' },
    { number: 5, title: 'Political Interference', summary: 'A local politician attempts to use the school for a rally and expects Bello\'s cooperation. Bello\'s refusal has professional consequences. His relationship with Comfort becomes strained.' },
    { number: 6, title: 'Allies and Enemies', summary: 'Mama Tunde mobilises the PTA after Bello speaks at a community meeting. Some teachers begin to align with Bello. Otunla escalates his interference.' },
    { number: 7, title: 'Crisis', summary: 'A major crisis — the school building partially collapses (or faces closure order). Bello fights to keep it open. The community is forced to decide whether to support him.' },
    { number: 8, title: 'Resolution', summary: 'A form of resolution is reached — not a clean victory but a qualified one. The school survives. Otunla faces some accountability. Tunde\'s future is secured. Bello remains — battered but unbroken.' },
  ],

  literaryDevices: [
    { device: 'Symbolism', example: 'The crumbling school building symbolises the state of public education in Nigeria.' },
    { device: 'Irony', example: 'The school is located in Lekki — one of Lagos\'s most expensive areas — yet it is in a state of utter neglect.' },
    { device: 'Characterisation', example: 'Okediran uses dialogue and action rather than description to reveal character — Bello is known by what he does, not what the narrator tells us.' },
    { device: 'Social Realism', example: 'The novel deliberately avoids romanticising poverty or corruption — it shows both in unflinching, specific detail.' },
    { device: 'Foreshadowing', example: 'Early descriptions of the crumbling building foreshadow the structural crisis in Chapter 7.' },
    { device: 'Dialogue', example: 'Lagos pidgin and Yoruba phrases are woven into dialogue to ground characters in authentic Nigerian speech.' },
  ],

  examTips: [
    'JAMB frequently asks about themes — know all six themes and a textual example for each.',
    'Character questions often focus on Bello\'s relationship with specific characters. Know Bello + Mama Tunde, Bello + Otunla, Bello + Comfort.',
    'Know the novel\'s setting in detail — Lekki\'s social geography matters to the novel\'s meaning.',
    'Literary device questions are common — especially symbolism, irony, and characterisation.',
    'The author\'s purpose (social criticism of Nigeria\'s education system) is a recurring essay and MCQ topic.',
    '"What does X represent?" questions are about symbolism. The school itself is the most important symbol.',
    'Know the title\'s significance — "Lekki Headmaster" signals both place (specific, real Lagos) and role (institutional, not personal).',
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// SUBJECT NOTES
// ─────────────────────────────────────────────────────────────────────────────

export const SUBJECT_NOTES = {

  // ── ENGLISH LANGUAGE ────────────────────────────────────────────────────
  english: {
    'comprehension': {
      title: 'Comprehension',
      body: `Comprehension tests your ability to understand a passage and answer questions accurately from it. JAMB passages are usually 300–500 words and cover academic, social, or narrative topics.

Always read the passage twice before answering. On the first read, get the general meaning. On the second, focus on details. Answer only from what is in the passage — do not bring in outside knowledge.

For "what does the writer mean by X?" questions, look at the context around X — the sentence before and after usually gives the meaning. For vocabulary questions, substitute each option into the sentence and choose the one that makes the most sense.

Watch for questions that ask for the "main idea" — this is different from a supporting detail. The main idea is the central argument or purpose of the whole passage, not just one paragraph.`,
      keyPoints: [
        'Read twice: first for meaning, second for detail',
        'Only use information from the passage — never personal knowledge',
        'Main idea = central purpose of the whole passage',
        'Vocabulary: use context (surrounding sentences) to determine meaning',
        'Inference questions ask what the writer implies — not what they state directly',
      ],
      examTip: 'JAMB often asks about the "tone" of a passage — is it critical, objective, sarcastic, optimistic? Identify the writer\'s attitude toward the subject.',
    },

    'lexis-and-structure': {
      title: 'Lexis and Structure',
      body: `Lexis refers to vocabulary — the individual words of the language. Structure refers to grammar — how those words are arranged into sentences.

JAMB tests lexis through synonym questions (words that mean the same thing), antonym questions (opposites), and idiomatic expressions. For idioms, learn them as whole phrases — "burn the midnight oil" means to work late, not literally to burn anything.

Grammar questions cover:
• Subject-verb agreement — the verb must agree with its subject, not with nearby nouns. "The committee, along with its advisors, was present." (committee = singular)
• Tense consistency — do not switch tense within a sentence without reason
• Pronoun reference — a pronoun must clearly refer to a specific antecedent
• Conditional sentences (if-clauses) — If I were you (not "was"), If she comes (not "will come")`,
      keyPoints: [
        'Collective nouns (committee, staff, jury) take singular verbs when acting as one unit',
        '"Neither...nor" and "either...or": verb agrees with the nearer subject',
        'Conditional: Type 1 = If + present simple + will. Type 2 = If + past simple + would',
        '"Between" is used for two things; "among" for more than two',
        '"Fewer" is for countable nouns; "less" for uncountable',
      ],
      examTip: 'The most tested grammar areas in JAMB are subject-verb agreement, tense, and pronoun case (I/me, he/him, who/whom).',
    },

    'oral-english': {
      title: 'Oral English (Phonetics)',
      body: `Oral English in JAMB covers vowel sounds, consonant sounds, stress, and intonation. Most questions give you words and ask which ones share a particular sound.

The 12 pure vowel sounds of English: /iː/ (beat), /ɪ/ (bit), /e/ (bed), /æ/ (bad), /ɑː/ (bar), /ɒ/ (bot), /ɔː/ (bore), /ʊ/ (book), /uː/ (boot), /ʌ/ (bus), /ɜː/ (bird), /ə/ (about).

Stress: in two-syllable nouns, stress usually falls on the first syllable (REcord, PREsent). In two-syllable verbs, stress often falls on the second syllable (reCORD, preSENT). Some words change meaning based on stress.

Consonant sounds to know: /θ/ (think) vs /ð/ (the), /ʃ/ (shop) vs /ʒ/ (measure), /tʃ/ (chair) vs /dʒ/ (jar).`,
      keyPoints: [
        '/iː/ is a long sound (eat, beat, feet) — do not confuse with short /ɪ/ (it, bit, fit)',
        'Silent letters: knife (k), write (w), psychology (p), island (s)',
        'Stress shift: nouns stress syllable 1, verbs stress syllable 2 — REcord vs reCORD',
        '/æ/ is the "cat, hat, bat" sound — not the same as /ɑː/ (car, far, bar)',
        'Diphthongs are two vowel sounds gliding together: /eɪ/ (day), /aɪ/ (my), /ɔɪ/ (boy)',
      ],
      examTip: 'JAMB frequently asks: "Which word has a different vowel sound?" Know the IPA symbols — they appear in options as phonetic transcriptions.',
    },

    'figures-of-speech': {
      title: 'Figures of Speech',
      body: `Figures of speech are literary techniques that use words in non-literal ways to create effect. JAMB tests identification and explanation of these devices.

• Simile: comparison using "like" or "as" — "Her voice was like silk"
• Metaphor: direct comparison without "like/as" — "His voice was silk"
• Personification: giving human qualities to non-human things — "The wind whispered"
• Hyperbole: deliberate exaggeration — "I've told you a million times"
• Irony: saying the opposite of what you mean, or a situation where the opposite of what is expected happens
• Oxymoron: two contradictory words together — "deafening silence", "bittersweet"
• Alliteration: repetition of the same initial consonant sound — "Peter Piper picked"
• Onomatopoeia: words that sound like what they describe — "buzz", "hiss", "splash"
• Euphemism: a mild word substituted for something harsh — "passed away" for "died"
• Paradox: a statement that seems contradictory but reveals a truth — "Less is more"`,
      keyPoints: [
        'Simile uses "like" or "as" — Metaphor does not',
        'Personification always attributes HUMAN qualities to NON-HUMAN things',
        'Oxymoron = two contradictory words in one phrase',
        'Irony ≠ coincidence. Irony is about expectation vs reality',
        'Euphemism softens harsh realities — "correctional facility" for "prison"',
      ],
      examTip: '"Identify the figure of speech" is a guaranteed JAMB question. Be especially sure you can distinguish simile from metaphor and personification from other devices.',
    },

    'summary': {
      title: 'Summary Writing',
      body: `Summary writing asks you to reduce a passage to its essential points in your own words. JAMB summary questions specify the number of points required and the maximum number of sentences.

Process:
1. Read the passage carefully
2. Identify the specific aspect you are being asked to summarise (e.g. "advantages of X" or "how Y happens")
3. Pick out only the relevant points — ignore unrelated parts even if they seem important
4. Re-express each point in simple, clear language
5. Use your own words as much as possible — do not copy sentences

Each point should be a distinct, separate idea. Do not combine two different points into one sentence — you lose marks. Do not add points not in the passage.`,
      keyPoints: [
        'Use your own words — copying loses marks',
        'Only include what is relevant to the specific question asked',
        'One point = one sentence (unless instructed otherwise)',
        'Do not add personal opinions or outside knowledge',
        'Count your points — do not exceed the number requested',
      ],
      examTip: 'JAMB summary carries marks for both content (correct points identified) and expression (clarity and use of own words). You can lose half your marks just by copying.',
    },
  },

  // ── MATHEMATICS ─────────────────────────────────────────────────────────
  mathematics: {
    'number-and-numeration': {
      title: 'Number & Numeration',
      body: `This topic covers the classification and properties of numbers, and operations on them.

Types of numbers:
• Natural numbers: 1, 2, 3, 4... (counting numbers)
• Integers: ...-2, -1, 0, 1, 2... (includes negatives and zero)
• Rational numbers: can be expressed as p/q where q ≠ 0 (includes fractions and terminating/recurring decimals)
• Irrational numbers: cannot be expressed as a fraction — √2, π, √3
• Real numbers: all rational and irrational numbers combined

Number bases: JAMB frequently tests conversion between base 10 and other bases (base 2, 8, 16).
• To convert from base 10 to base n: divide repeatedly by n, collect remainders upward
• To convert from base n to base 10: multiply each digit by n raised to its position power

Modular arithmetic: a ≡ b (mod n) means a and b have the same remainder when divided by n.
Example: 17 ≡ 2 (mod 5) because 17 = 3×5 + 2`,
      keyPoints: [
        'LCM (Lowest Common Multiple) — smallest number divisible by all given numbers',
        'HCF (Highest Common Factor) — largest number that divides all given numbers exactly',
        'Base conversion: divide by base, collect remainders from bottom to top',
        'Fractions: to divide, multiply by the reciprocal of the second fraction',
        'BODMAS/PEMDAS: Brackets, Orders, Division/Multiplication, Addition/Subtraction',
      ],
      examTip: 'Number base questions appear almost every year. Practice converting numbers between base 2 and base 10 until it is automatic.',
    },

    'algebra': {
      title: 'Algebra',
      body: `Algebra is the use of symbols and letters to represent numbers and express relationships.

Linear equations: one variable, highest power = 1.
Solve by isolating the variable: 3x + 7 = 22 → 3x = 15 → x = 5

Simultaneous equations: two equations, two unknowns.
• Substitution: express one variable in terms of the other, substitute
• Elimination: multiply equations to make one variable's coefficients equal, then add or subtract

Factorisation: express an expression as a product of its factors.
• Common factor: 6x² + 9x = 3x(2x + 3)
• Difference of two squares: a² − b² = (a+b)(a−b)
• Trinomial: x² + 5x + 6 = (x+2)(x+3) — find two numbers that add to 5 and multiply to 6

Variation:
• Direct: y ∝ x means y = kx (as x increases, y increases proportionally)
• Inverse: y ∝ 1/x means y = k/x (as x increases, y decreases)
• Joint: y ∝ xz means y = kxz`,
      keyPoints: [
        'When solving equations, always perform the same operation on BOTH sides',
        'Difference of two squares: a² − b² = (a+b)(a−b) — appears very frequently',
        'For direct variation y = kx: find k first using given values, then use k for new values',
        'Inequalities: multiplying or dividing by a NEGATIVE reverses the inequality sign',
        'Index laws: aᵐ × aⁿ = aᵐ⁺ⁿ, aᵐ ÷ aⁿ = aᵐ⁻ⁿ, (aᵐ)ⁿ = aᵐⁿ, a⁰ = 1',
      ],
      examTip: 'Factorisation is tested heavily. Know all three types (common factor, difference of squares, trinomial) cold. Also know how to identify which type applies.',
    },

    'quadratic-equations': {
      title: 'Quadratic Equations',
      body: `A quadratic equation has the form ax² + bx + c = 0 where a ≠ 0.

Three methods to solve:
1. Factorisation: (x−p)(x−q) = 0 → x = p or x = q. Find p and q such that p+q = −b/a and p×q = c/a
2. Completing the square: move constant to right, add (b/2a)² to both sides, take square root
3. Quadratic formula: x = (−b ± √(b²−4ac)) / 2a

The discriminant b²−4ac tells you the nature of roots:
• b²−4ac > 0: two distinct real roots
• b²−4ac = 0: one repeated real root
• b²−4ac < 0: no real roots (complex roots)

Sum and product of roots: if α and β are roots of ax² + bx + c = 0,
then α + β = −b/a and α × β = c/a

These can be used to form a quadratic equation: x² − (α+β)x + αβ = 0`,
      keyPoints: [
        'Quadratic formula always works — use it when factorisation is not obvious',
        'Discriminant: positive = 2 real roots, zero = 1 repeated root, negative = no real roots',
        'Sum of roots = −b/a, Product of roots = c/a',
        'Forming equation from roots: x² − (sum)x + (product) = 0',
        'Word problems: let the unknown be x, form the equation, solve, check answers make sense',
      ],
      examTip: 'JAMB frequently gives roots and asks you to find the original equation. Use sum and product of roots. Also expect discriminant questions ("find k such that the equation has equal roots").',
    },

    'mensuration': {
      title: 'Mensuration',
      body: `Mensuration deals with the measurement of geometric figures — lengths, areas, and volumes.

Key formulae:
Circle: Area = πr², Circumference = 2πr
Triangle: Area = ½ × base × height
Trapezium: Area = ½(a+b)h where a and b are parallel sides
Cylinder: Volume = πr²h, Curved surface area = 2πrh, Total surface = 2πr(r+h)
Cone: Volume = ⅓πr²h, Slant height l = √(r²+h²), Curved surface = πrl
Sphere: Volume = 4/3πr³, Surface area = 4πr²
Sector of circle: Area = (θ/360) × πr², Arc length = (θ/360) × 2πr

JAMB frequently uses π = 22/7 (not 3.14) unless stated otherwise.

Pythagoras theorem: In a right triangle, c² = a² + b² where c is the hypotenuse.
Common Pythagorean triples: 3-4-5, 5-12-13, 8-15-17.`,
      keyPoints: [
        'Use π = 22/7 unless the question specifies otherwise',
        'Sector area and arc length both use the fraction θ/360',
        'Cylinder and cone have "curved" vs "total" surface area — read the question carefully',
        'Pythagoras: the hypotenuse is ALWAYS the longest side, opposite the right angle',
        '1 m² = 10,000 cm² (not 100). 1 m³ = 1,000,000 cm³',
      ],
      examTip: 'Sector and arc questions are extremely common. Remember: θ/360 is the fraction of the full circle. Multiply this by the full area or circumference.',
    },

    'statistics': {
      title: 'Statistics & Probability',
      body: `Statistics is the collection, organisation, and interpretation of numerical data.

Measures of central tendency:
• Mean: sum of all values ÷ number of values
• Median: middle value when data is arranged in order. For even number of values: average of the two middle values
• Mode: most frequently occurring value

Measures of spread:
• Range: largest value − smallest value
• Variance: average of squared deviations from the mean
• Standard deviation: √Variance (the square root of variance)

Probability:
• P(event) = number of favourable outcomes / total possible outcomes
• 0 ≤ P(E) ≤ 1. P(impossible) = 0. P(certain) = 1
• P(A or B) = P(A) + P(B) − P(A and B)
• For mutually exclusive events: P(A or B) = P(A) + P(B)
• For independent events: P(A and B) = P(A) × P(B)`,
      keyPoints: [
        'Mean is affected by outliers (extreme values); median is not',
        'For grouped data, use midpoints of class intervals to calculate mean',
        'P(not A) = 1 − P(A)',
        '"At least one" problems: use P(at least one) = 1 − P(none)',
        'Cumulative frequency is used to find median and quartiles from a table',
      ],
      examTip: '"Without replacement" means the sample space changes after each draw — multiply conditional probabilities. "With replacement" means the probability stays the same each time.',
    },

    'geometry': {
      title: 'Geometry',
      body: `Geometry covers properties of shapes, angles, and spatial relationships.

Angles:
• Angles on a straight line sum to 180°
• Angles at a point sum to 360°
• Vertically opposite angles are equal
• Alternate angles (Z-angles) are equal (parallel lines)
• Corresponding angles (F-angles) are equal (parallel lines)
• Co-interior angles (C-angles) are supplementary — sum to 180°

Triangles:
• Angle sum = 180°
• Exterior angle = sum of the two non-adjacent interior angles
• Equilateral: all sides equal, all angles 60°
• Isosceles: two equal sides, base angles equal

Polygons:
• Sum of interior angles of n-sided polygon = (n−2) × 180°
• Each interior angle of a regular polygon = (n−2)×180° / n
• Sum of exterior angles of any polygon = 360°

Circle theorems (commonly tested):
• Angle at centre = 2 × angle at circumference (same arc)
• Angles in the same segment are equal
• Angle in a semicircle = 90°
• Opposite angles of a cyclic quadrilateral sum to 180°`,
      keyPoints: [
        'Exterior angle of a triangle = sum of the two opposite interior angles',
        'A tangent to a circle is perpendicular to the radius at the point of contact',
        'The angle in a semicircle is always 90°',
        'Sum of interior angles: triangle=180°, quadrilateral=360°, pentagon=540°, hexagon=720°',
        'Regular polygon: all sides equal, all angles equal',
      ],
      examTip: 'Circle theorem questions often require you to identify which theorem applies before you can solve. Draw the diagram, label all known angles, and the correct theorem usually becomes visible.',
    },

    'trigonometry': {
      title: 'Trigonometry',
      body: `Trigonometry studies the relationship between angles and sides in triangles.

SOH-CAH-TOA:
• sin θ = Opposite / Hypotenuse
• cos θ = Adjacent / Hypotenuse
• tan θ = Opposite / Adjacent

Key values to memorise:
| Angle | sin  | cos  | tan     |
|-------|------|------|---------|
| 0°    | 0    | 1    | 0       |
| 30°   | ½    | √3/2 | 1/√3   |
| 45°   | √2/2 | √2/2 | 1       |
| 60°   | √3/2 | ½    | √3      |
| 90°   | 1    | 0    | undefined|

Sine rule: a/sin A = b/sin B = c/sin C (use for non-right triangles)
Cosine rule: a² = b² + c² − 2bc cos A (use when you have two sides and included angle)

Angles of elevation and depression: always measured from the horizontal.`,
      keyPoints: [
        'SOH-CAH-TOA only applies to RIGHT-ANGLED triangles',
        'For non-right triangles: use Sine Rule or Cosine Rule',
        'sin 30° = cos 60° = ½. This symmetry appears in many questions',
        'Bearing is always measured clockwise from North',
        '1 radian = 180/π degrees. π radians = 180°',
      ],
      examTip: 'Angles of elevation/depression questions almost always draw a right triangle — identify the right angle, label opposite/adjacent/hypotenuse relative to the given angle, then apply SOH-CAH-TOA.',
    },
  },

  // ── CHEMISTRY ───────────────────────────────────────────────────────────
  chemistry: {
    'atomic-structure': {
      title: 'Atomic Structure',
      body: `The atom is the smallest particle of an element that retains the chemical properties of that element. It consists of:
• Nucleus: contains protons (positive charge) and neutrons (no charge)
• Electron shells: contain electrons (negative charge) orbiting the nucleus

Key definitions:
• Atomic number (Z): number of protons in the nucleus. Identifies the element.
• Mass number (A): total number of protons + neutrons
• Number of neutrons = Mass number − Atomic number
• In a neutral atom: number of protons = number of electrons

Isotopes: atoms of the same element with the same atomic number but different mass numbers (different numbers of neutrons). Example: Carbon-12 and Carbon-14.

Electron configuration: electrons fill shells in order. Max electrons per shell: Shell 1 = 2, Shell 2 = 8, Shell 3 = 18.
• Sodium (Z=11): 2, 8, 1
• Chlorine (Z=17): 2, 8, 7
• Calcium (Z=20): 2, 8, 8, 2

Valence electrons (outermost shell electrons) determine chemical behaviour.`,
      keyPoints: [
        'Atomic number = number of protons = number of electrons (neutral atom)',
        'Mass number = protons + neutrons',
        'Isotopes: same element, same protons, different neutrons, different mass numbers',
        'Valence electrons = electrons in the outermost shell',
        'Elements in the same group of the periodic table have the same number of valence electrons',
      ],
      examTip: 'JAMB often gives you an element\'s atomic number and asks for its electron configuration or which period/group it belongs to. Practice writing configurations for Z = 1 to 20.',
    },

    'periodic-table': {
      title: 'The Periodic Table',
      body: `The periodic table arranges elements by increasing atomic number, with elements with similar properties in the same vertical column (group).

Structure:
• Periods (rows): elements in the same period have the same number of electron shells
• Groups (columns): elements in the same group have the same number of valence electrons and similar properties

Important groups:
• Group I (Alkali metals): Li, Na, K — very reactive, 1 valence electron, form +1 ions
• Group II (Alkaline earth metals): Be, Mg, Ca — reactive, 2 valence electrons, form +2 ions
• Group VII (Halogens): F, Cl, Br, I — very reactive, 7 valence electrons, form −1 ions
• Group 0/VIII (Noble gases): He, Ne, Ar — unreactive, full outer shell, 8 valence electrons (except He: 2)

Trends across a period (left → right):
• Atomic radius decreases
• Electronegativity increases
• Ionisation energy generally increases
• Metallic character decreases

Trends down a group (top → bottom):
• Atomic radius increases
• Reactivity increases for metals, decreases for non-metals (halogens)`,
      keyPoints: [
        'Period number = number of electron shells',
        'Group number = number of valence electrons (for main groups)',
        'Alkali metals become MORE reactive going down the group',
        'Halogens become LESS reactive going down the group',
        'Electronegativity: highest at top-right of table (Fluorine is most electronegative)',
      ],
      examTip: 'Know the first 20 elements by symbol, name, and position. Also know the properties of each main group — JAMB loves Group I, Group VII, and Group 0 questions.',
    },

    'chemical-bonding': {
      title: 'Chemical Bonding',
      body: `Chemical bonds are the forces that hold atoms together in compounds.

Ionic bonding: transfer of electrons from metal to non-metal.
• Metal loses electrons → becomes positive ion (cation)
• Non-metal gains electrons → becomes negative ion (anion)
• Electrostatic attraction between ions forms the bond
• Example: Na + Cl → NaCl (Na loses 1 electron, Cl gains 1)
• Properties: high melting point, conducts electricity when dissolved or molten, soluble in water

Covalent bonding: sharing of electrons between two non-metals.
• Each atom contributes one electron to the shared pair
• Single bond = 1 shared pair, Double bond = 2 shared pairs, Triple = 3
• Properties: low melting point, does not conduct electricity, often gases or liquids at room temperature

Metallic bonding: sea of delocalised electrons surrounding positive metal ions.
• Explains why metals conduct electricity and heat, and are malleable and ductile

Dative/coordinate bond: both electrons in the shared pair come from one atom only.
• Example: NH₃ + H⁺ → NH₄⁺ (nitrogen donates the lone pair)`,
      keyPoints: [
        'Ionic: metal + non-metal. Covalent: non-metal + non-metal',
        'Ionic compounds conduct electricity in solution or when molten — NOT as solids',
        'Covalent compounds generally do NOT conduct electricity',
        'Electronegativity difference > 1.7 → ionic bond. Less than 1.7 → covalent',
        'Metallic bonds explain conductivity, malleability, and ductility of metals',
      ],
      examTip: 'A question that asks "why does ionic compound X conduct electricity only when dissolved?" is testing whether you know that ions must be free to move — they are fixed in the solid lattice.',
    },

    'acids-bases-salts': {
      title: 'Acids, Bases & Salts',
      body: `Acids are substances that donate protons (H⁺ ions) in solution. Bases accept protons.

Arrhenius definition: Acid produces H⁺ in water. Base produces OH⁻ in water.
Brønsted-Lowry: Acid is a proton donor. Base is a proton acceptor.

Strong vs weak:
• Strong acids: fully dissociate — HCl, H₂SO₄, HNO₃
• Weak acids: partially dissociate — ethanoic acid (CH₃COOH), citric acid
• Strong bases: NaOH, KOH
• Weak base: NH₃

pH scale: 0–14. pH 7 = neutral. pH < 7 = acidic. pH > 7 = alkaline.
pH = −log[H⁺]

Indicators:
• Litmus: red in acid, blue in alkali
• Universal indicator: range of colours
• Phenolphthalein: colourless in acid, pink in alkali (used for strong base titrations)
• Methyl orange: red in acid, yellow in alkali (used for strong acid titrations)

Salts are formed by neutralisation (acid + base → salt + water).
• HCl + NaOH → NaCl + H₂O
• H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O`,
      keyPoints: [
        'Strong acid + strong base → neutral salt (pH 7)',
        'Strong acid + weak base → acidic salt (pH < 7)',
        'Weak acid + strong base → alkaline salt (pH > 7)',
        'Amphoteric oxides react with both acids and bases (e.g. Al₂O₃, ZnO)',
        'Basicity of acid = number of replaceable H⁺ ions: HCl = monobasic, H₂SO₄ = dibasic',
      ],
      examTip: 'Indicator choice in titration depends on the STRENGTH of acid and base — not just which one you have. Strong acid + strong base: any indicator works. Weak acid + strong base: use phenolphthalein.',
    },

    'organic-chemistry': {
      title: 'Organic Chemistry',
      body: `Organic chemistry is the study of carbon compounds. Carbon forms 4 bonds and can form chains (aliphatic) or rings (aromatic).

Homologous series: families of organic compounds with the same general formula and functional group, differing by CH₂.

Key series:
• Alkanes: CₙH₂ₙ₊₂. Single bonds only. Saturated. Example: methane (CH₄), ethane (C₂H₆)
• Alkenes: CₙH₂ₙ. One or more double bonds. Unsaturated. Example: ethene (C₂H₄)
• Alkynes: CₙH₂ₙ₋₂. One or more triple bonds. Example: ethyne (C₂H₂)
• Alcohols: −OH group. CₙH₂ₙ₊₁OH. Example: methanol (CH₃OH), ethanol (C₂H₅OH)
• Carboxylic acids: −COOH group. Example: methanoic acid (HCOOH), ethanoic acid
• Esters: formed from acid + alcohol. −COO− linkage. Used as flavourings

Reactions to know:
• Addition: alkenes + H₂ → alkane (hydrogenation); alkenes + Br₂ → dibromoalkane
• Substitution: alkanes + Cl₂ (UV light) → chloroalkane + HCl
• Fermentation: C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂ (glucose → ethanol)
• Esterification: carboxylic acid + alcohol → ester + water (with acid catalyst)`,
      keyPoints: [
        'Alkanes are saturated (only single bonds). Alkenes/alkynes are unsaturated',
        'Bromine water test: decolourised by alkenes (addition across double bond), not alkanes',
        'Fermentation: yeast, no oxygen, 37°C, produces ethanol',
        'Distillation of crude oil (fractional distillation) separates by boiling point',
        'IUPAC naming: count carbons in longest chain → meth(1), eth(2), prop(3), but(4), pent(5)',
      ],
      examTip: '"Which gas decolourises bromine water?" — ethene (C₂H₄). This is one of the most frequently tested organic chemistry facts in JAMB.',
    },
  },

  // ── BIOLOGY ─────────────────────────────────────────────────────────────
  biology: {
    'cell-biology': {
      title: 'Cell Biology',
      body: `The cell is the basic structural and functional unit of all living things.

Prokaryotic cells (bacteria, blue-green algae): no true nucleus, no membrane-bound organelles, smaller, no mitochondria.

Eukaryotic cells (plants, animals, fungi): have a true nucleus and membrane-bound organelles.

Key organelles:
• Nucleus: contains DNA, controls cell activities
• Mitochondria: site of aerobic respiration, produces ATP ("powerhouse of the cell")
• Ribosomes: site of protein synthesis (translation)
• Endoplasmic reticulum (ER): rough ER (with ribosomes) = protein synthesis; smooth ER = lipid synthesis
• Golgi apparatus: packages and secretes proteins
• Chloroplasts (plants only): site of photosynthesis, contains chlorophyll
• Vacuole: large central vacuole in plants for storage and turgor pressure; small vacuoles in animals
• Cell wall (plants, fungi, bacteria): provides structural support. Made of cellulose in plants

Differences between plant and animal cells:
• Plant cells have: cell wall, chloroplasts, large central vacuole
• Animal cells have: centrioles (for cell division), no cell wall, no chloroplasts`,
      keyPoints: [
        'Mitochondria = site of aerobic respiration (ATP production)',
        'Ribosomes = site of protein synthesis',
        'Chloroplasts are found ONLY in plant cells and some protists',
        'Prokaryotes have NO nucleus — DNA is free in the cytoplasm',
        'Cell membrane is present in ALL cells — prokaryotic and eukaryotic',
      ],
      examTip: '"Which organelle is responsible for X?" questions are extremely common. Memorise: nucleus=control, mitochondria=energy, ribosome=protein, chloroplast=photosynthesis.',
    },

    'genetics': {
      title: 'Genetics',
      body: `Genetics is the study of heredity — how traits are passed from parents to offspring.

Key terms:
• Gene: a segment of DNA that codes for a specific trait
• Allele: different forms of a gene (e.g. tall (T) and short (t))
• Dominant allele: expressed when present (capital letter)
• Recessive allele: only expressed when two copies are present (lowercase letter)
• Homozygous: both alleles the same (TT or tt)
• Heterozygous: alleles different (Tt)
• Phenotype: the physical appearance (tall or short)
• Genotype: the genetic makeup (TT, Tt, or tt)

Mendel's laws:
• Law of Segregation: each organism has two alleles for each trait; they separate during gamete formation
• Law of Independent Assortment: alleles for different traits are inherited independently

Monohybrid cross: crossing for one trait.
Cross Tt × Tt gives: TT : Tt : Tt : tt = 3 tall : 1 short (3:1 phenotypic ratio)

Sex determination: males = XY, females = XX. Sex is determined by the father's sperm (X or Y).

Codominance: both alleles are fully expressed. Example: blood groups (IAIB gives AB blood type).`,
      keyPoints: [
        'Dominant masks recessive. Recessive needs two copies to show',
        'F1 generation: offspring of original cross. F2: offspring of F1 × F1',
        'Monohybrid F2 ratio: 3:1 (phenotype), 1:2:1 (genotype)',
        'Sex-linked traits: carried on X chromosome. More common in males (XY)',
        'Mutation = change in DNA sequence. Can be inherited if in sex cells',
      ],
      examTip: 'Always draw the Punnett square for genetics questions — do not try to work them out in your head. Write out all four combinations systematically.',
    },

    'photosynthesis': {
      title: 'Photosynthesis',
      body: `Photosynthesis is the process by which green plants use light energy to convert carbon dioxide and water into glucose and oxygen.

Overall equation:
6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂

Two stages:
1. Light-dependent reactions (in thylakoid membranes):
   • Light is absorbed by chlorophyll
   • Water is split (photolysis): 2H₂O → 4H⁺ + 4e⁻ + O₂ (oxygen is released here)
   • ATP and NADPH are produced
   • Photosystems I and II are involved

2. Light-independent reactions / Calvin cycle (in stroma):
   • CO₂ is fixed (combined with RuBP)
   • ATP and NADPH from Stage 1 are used
   • Glucose is produced

Factors affecting rate of photosynthesis:
• Light intensity: higher light = faster rate (up to a point)
• CO₂ concentration: higher CO₂ = faster rate (up to a point)
• Temperature: increases rate up to ~40°C, then decreases (enzymes denature)
• Chlorophyll concentration`,
      keyPoints: [
        'Oxygen is released during the LIGHT-DEPENDENT stage (photolysis of water)',
        'CO₂ is fixed during the LIGHT-INDEPENDENT stage (Calvin cycle) in the stroma',
        'Chlorophyll absorbs red and blue light — reflects green (which is why leaves appear green)',
        'Limiting factors: whichever factor is in shortest supply limits the rate',
        'Variegated leaves (green + white patches): only green parts photosynthesise',
      ],
      examTip: '"Where does photosynthesis occur?" → chloroplasts. "Where is oxygen released?" → thylakoid membrane (light-dependent stage). These are two different questions with different answers.',
    },

    'ecology': {
      title: 'Ecology',
      body: `Ecology is the study of relationships between organisms and their environment.

Key terms:
• Habitat: the physical place where an organism lives
• Niche: the role of an organism in its ecosystem (what it eats, when it's active, etc.)
• Population: all members of one species in an area
• Community: all populations of different species living in an area
• Ecosystem: community + its non-living (abiotic) environment

Food chains and webs:
• Producer → Primary consumer → Secondary consumer → Tertiary consumer
• Arrows show direction of energy flow (from eaten to eater)
• Producers are always green plants (autotrophs)
• Consumers are animals (heterotrophs)

Energy flow:
• Only about 10% of energy passes from one trophic level to the next
• 90% is lost as heat, movement, excretion

Nutrient cycles:
• Carbon cycle: photosynthesis (removes CO₂), respiration and decomposition (releases CO₂)
• Nitrogen cycle: nitrogen fixation → nitrification → assimilation → denitrification

Ecological relationships: predation, competition, symbiosis (mutualism, commensalism, parasitism)`,
      keyPoints: [
        'Producers make their own food via photosynthesis — they start every food chain',
        'Energy decreases at each trophic level — pyramids of energy always taper upward',
        'Decomposers (bacteria, fungi) break down dead matter and return nutrients to soil',
        'Mutualism: both species benefit. Parasitism: one benefits, one is harmed',
        'Biotic factors: other organisms. Abiotic: temperature, rainfall, pH, light',
      ],
      examTip: '"What will happen if species X is removed from the food web?" — trace all chains involving X: its prey will increase, its predators will decrease. Follow the arrows.',
    },
  },

  // ── PHYSICS ─────────────────────────────────────────────────────────────
  physics: {
    'mechanics': {
      title: 'Mechanics',
      body: `Mechanics is the study of motion and the forces that cause motion.

Key quantities:
• Distance: total path length (scalar)
• Displacement: straight-line distance from start to end + direction (vector)
• Speed: distance / time (scalar)
• Velocity: displacement / time + direction (vector)
• Acceleration: change in velocity / time. a = (v−u)/t

Newton's Laws of Motion:
1. First Law (Inertia): An object at rest stays at rest, and an object in motion stays in motion, unless acted on by an external force
2. Second Law: F = ma (force = mass × acceleration)
3. Third Law: For every action there is an equal and opposite reaction

Equations of motion (constant acceleration):
• v = u + at
• s = ut + ½at²
• v² = u² + 2as
• s = (u+v)/2 × t
Where u = initial velocity, v = final velocity, a = acceleration, s = displacement, t = time

Momentum: p = mv. Conservation of momentum: total momentum before = total momentum after (in a closed system).

Work, Energy, Power:
• Work = Force × distance (in direction of force). W = Fd cos θ
• Kinetic energy = ½mv²
• Potential energy = mgh
• Power = Work/Time = Energy/Time. P = Fv`,
      keyPoints: [
        'Free fall: acceleration due to gravity g = 10 m/s² (JAMB uses 10, not 9.8)',
        'Weight = mg (weight is a force, measured in Newtons)',
        'At maximum height in projectile motion, vertical velocity = 0',
        'Conservation of energy: KE + PE = constant (no friction)',
        'Impulse = force × time = change in momentum',
      ],
      examTip: 'JAMB uses g = 10 m/s² unless the question specifies otherwise. The equations of motion are given in the exam but you must know which one to use based on what is given and what is asked.',
    },

    'electricity': {
      title: 'Electricity',
      body: `Electricity concerns the movement of electric charges and the effects of that movement.

Basic quantities:
• Charge (Q): measured in Coulombs (C). Q = It
• Current (I): rate of flow of charge. I = Q/t. Measured in Amperes (A)
• Voltage/EMF (V): energy per unit charge. Measured in Volts (V)
• Resistance (R): opposition to current flow. Measured in Ohms (Ω)

Ohm's Law: V = IR (voltage = current × resistance)

Resistors in circuits:
• Series: R_total = R₁ + R₂ + R₃ (same current through each)
• Parallel: 1/R_total = 1/R₁ + 1/R₂ + 1/R₃ (same voltage across each)

Power:
• P = IV = I²R = V²/R
• Energy = Power × Time = VIt

Kirchhoff's Laws:
• First law (junction rule): sum of currents entering a junction = sum leaving
• Second law (loop rule): sum of EMFs in a loop = sum of voltage drops

Electric field: E = F/q = V/d (for uniform field). Force on charge: F = qE`,
      keyPoints: [
        'In series circuit: same current, voltages add up',
        'In parallel circuit: same voltage, currents add up',
        'Adding a resistor in series INCREASES total resistance',
        'Adding a resistor in parallel DECREASES total resistance',
        'Internal resistance: terminal voltage = EMF − (I × r)',
      ],
      examTip: 'Parallel resistance calculation: for just two resistors, use the product-over-sum shortcut: R = (R₁×R₂)/(R₁+R₂). This is faster than the 1/R formula for two resistors.',
    },

    'waves': {
      title: 'Waves',
      body: `A wave transfers energy from one place to another without transferring matter.

Types of waves:
• Transverse waves: oscillation perpendicular to wave direction. Example: light, water waves
• Longitudinal waves: oscillation parallel to wave direction. Example: sound waves (compressions and rarefactions)

Key wave quantities:
• Amplitude (A): maximum displacement from equilibrium
• Wavelength (λ): distance between two consecutive identical points
• Frequency (f): number of complete oscillations per second. Unit: Hz
• Period (T): time for one complete oscillation. T = 1/f
• Wave speed (v): v = fλ

Sound:
• Speed in air ≈ 340 m/s at room temperature
• Speed is faster in solids and liquids than in gases
• Cannot travel through a vacuum
• Pitch is determined by frequency. Loudness by amplitude.

Light:
• Speed in vacuum = 3 × 10⁸ m/s
• Refraction: bending of waves at a boundary between media. Snell's Law: n₁ sin θ₁ = n₂ sin θ₂
• Total internal reflection occurs when angle of incidence > critical angle
• Refractive index n = c/v = sin i / sin r`,
      keyPoints: [
        'Speed = frequency × wavelength (v = fλ) — applies to ALL waves',
        'Sound cannot travel through a vacuum — light can',
        'Increasing frequency = decreasing wavelength (at constant speed)',
        'At boundary: frequency stays the same, speed and wavelength change',
        'Critical angle: sin C = 1/n (for total internal reflection)',
      ],
      examTip: '"Calculate the wavelength given frequency and speed" — use v = fλ rearranged: λ = v/f. Always check your units — speed in m/s gives wavelength in metres.',
    },
  },

  // ── ECONOMICS ───────────────────────────────────────────────────────────
  economics: {
    'demand-supply': {
      title: 'Demand and Supply',
      body: `Demand is the quantity of a good consumers are willing and able to buy at various prices over a given time period.

Law of Demand: as price rises, quantity demanded falls (inverse relationship), ceteris paribus (all other things being equal).

Factors that shift the demand curve (not price — price causes movement along the curve):
• Income: higher income → more demand (for normal goods); less demand (for inferior goods)
• Price of related goods: substitute goods and complementary goods
• Consumer tastes and preferences
• Population size
• Expectations about future prices

Supply is the quantity producers are willing and able to sell at various prices.

Law of Supply: as price rises, quantity supplied increases (direct relationship).

Factors that shift the supply curve:
• Cost of production (wages, raw materials)
• Technology improvements
• Government taxes and subsidies
• Number of producers

Equilibrium: where quantity demanded = quantity supplied. Price has no tendency to change.

Price elasticity of demand (PED) = % change in quantity demanded / % change in price
• |PED| > 1: elastic (demand is sensitive to price)
• |PED| < 1: inelastic (demand is not sensitive to price)
• |PED| = 1: unit elastic`,
      keyPoints: [
        'Movement along curve: caused by change in the good\'s own price',
        'Shift of curve: caused by any other factor (income, other prices, tastes)',
        'Inferior goods: demand FALLS when income rises (e.g. cheap staple foods)',
        'Complements: goods used together — if one rises in price, demand for both falls',
        'Substitutes: if good A rises in price, demand for substitute B rises',
      ],
      examTip: 'JAMB frequently distinguishes "change in demand" (whole curve shifts) from "change in quantity demanded" (movement along existing curve). Price changes cause movement, not shifts.',
    },

    'national-income': {
      title: 'National Income',
      body: `National income is the total value of goods and services produced by a country in a given year.

Measures of national income:
• GDP (Gross Domestic Product): total value of all goods and services produced within a country's borders in a year
• GNP (Gross National Product): GDP + net factor income from abroad (includes earnings of citizens abroad)
• NNP (Net National Product): GNP − Depreciation
• National Income (NI) = NNP at factor cost

Three approaches to measuring GDP:
1. Output/Product method: sum of value added at each stage of production
2. Income method: sum of all factor incomes (wages + rent + interest + profit)
3. Expenditure method: C + I + G + (X−M) where C=consumption, I=investment, G=government spending, X=exports, M=imports

GDP vs GNP: if a Nigerian company produces in the UK, it contributes to UK's GDP but Nigeria's GNP.

Problems with using national income as a welfare measure: does not account for income distribution, environmental damage, non-market activities, or cost of living differences.`,
      keyPoints: [
        'GDP = total output within a country\'s borders (regardless of who owns the enterprise)',
        'GNP = GDP + net property income from abroad',
        'Depreciation = wear and tear on capital goods',
        'Per capita income = national income ÷ population (better welfare measure than total)',
        'Real GDP adjusts for inflation; Nominal GDP does not',
      ],
      examTip: 'GDP vs GNP: the key difference is "within borders" (GDP) vs "by nationals" (GNP). A multinational company operating in Nigeria contributes to Nigeria\'s GDP but not GNP.',
    },

    'money-banking': {
      title: 'Money and Banking',
      body: `Money is anything generally accepted as a medium of exchange, store of value, unit of account, and standard of deferred payment.

Functions of money:
1. Medium of exchange — eliminates the need for barter
2. Store of value — money retains value over time
3. Unit of account — provides a common measure of value
4. Standard of deferred payment — enables credit transactions

Types of money:
• Commodity money: has intrinsic value (gold, silver)
• Fiat money: value by government decree (paper notes, coins)
• Near money: assets easily convertible to money (Treasury bills, savings deposits)

Central Bank (CBN in Nigeria) functions:
• Banker to the government
• Banker to commercial banks (lender of last resort)
• Issues currency
• Controls monetary policy (interest rates, reserve requirements)
• Manages foreign exchange reserves

Commercial bank functions:
• Accept deposits
• Grant loans
• Transfer funds (cheques, transfers)
• Create credit (credit creation / money multiplier)

Credit creation multiplier = 1 / Cash reserve ratio`,
      keyPoints: [
        'CBN is the apex bank — it regulates all other banks in Nigeria',
        'Repo rate / Monetary Policy Rate (MPR): rate at which CBN lends to commercial banks',
        'High interest rates → less borrowing → less spending → less inflation',
        'Money supply: M1 = currency + demand deposits. M2 adds savings/time deposits',
        'Inflation erodes the purchasing power of money (store of value function)',
      ],
      examTip: '"What is the primary function of money?" — medium of exchange. This is the original function that money was created to fulfil, replacing barter.',
    },
  },

  // ── GOVERNMENT ──────────────────────────────────────────────────────────
  government: {
    'democracy-government': {
      title: 'Democracy & Government',
      body: `Government is the institution through which political authority is exercised in a state.

Forms of government:
• Democracy: sovereignty lies with the people, exercised directly or through elected representatives
• Monarchy: head of state is a king/queen — can be absolute (ruler has total power) or constitutional (limited by law)
• Oligarchy: rule by a small group
• Theocracy: government based on religious law
• Totalitarianism/Dictatorship: one leader or party with absolute control

Types of democracy:
• Direct democracy: citizens vote on every issue (ancient Athens). Impractical for large modern states
• Representative/Indirect democracy: citizens elect representatives to make decisions on their behalf
• Liberal democracy: combines representative democracy with protection of individual rights and freedoms

Features of democracy:
• Free and fair elections
• Rule of law (law applies equally to all, including rulers)
• Independent judiciary
• Free press and freedom of speech
• Protection of minority rights
• Multi-party system`,
      keyPoints: [
        'Lincoln\'s definition: "government of the people, by the people, for the people"',
        'Direct democracy is impractical for large populations — most modern states use representative democracy',
        'Rule of law: no one is above the law. Dicey\'s principle of the constitution.',
        'Sovereignty: supreme power/authority in a state. Popular sovereignty = sovereignty of the people',
        'Separation of powers: legislature (laws), executive (implements), judiciary (interprets)',
      ],
      examTip: 'JAMB often asks about features/characteristics of democracy. Know at least five: free elections, rule of law, independent judiciary, protection of rights, separation of powers, free press.',
    },

    'constitution': {
      title: 'Constitution',
      body: `A constitution is the fundamental law of a state that outlines the structure of government, the rights of citizens, and the limitations on governmental power.

Types of constitution:
• Written: contained in a single document. Example: Nigeria, USA
• Unwritten/Uncodified: not in one document — conventions, precedents, Acts of Parliament. Example: UK
• Rigid: requires special procedure (supermajority, referendum) to amend. Example: Nigeria's 1999 constitution
• Flexible: can be amended by the same process as ordinary legislation. Example: UK

Nigerian Constitutional history:
• 1922 Clifford Constitution — first legislative council in Nigeria
• 1946 Richards Constitution — introduced regionalism
• 1951 Macpherson Constitution — increased Nigerian participation
• 1954 Lyttleton Constitution — introduced true federalism
• 1960 Independence Constitution
• 1963 Republican Constitution — Nigeria became a republic
• 1979 Constitution — Second Republic
• 1999 Constitution — current (amended 2010, 2011, 2017)

Amendment procedure (1999 Constitution): requires two-thirds majority of National Assembly + two-thirds of State Houses of Assembly for constitutional changes.`,
      keyPoints: [
        '1954 Lyttleton Constitution introduced true federalism to Nigeria',
        'The 1999 Constitution is a rigid document — requires special majority to amend',
        'Supremacy of the constitution: the constitution is the highest law; any law inconsistent with it is void',
        'Fundamental rights: Chapter IV of the 1999 Constitution (right to life, dignity, fair hearing, etc.)',
        'Section 2(2) of 1999 Constitution: Nigeria is a federation',
      ],
      examTip: 'Constitutional history questions are very common in JAMB Government. Learn the date, name, and ONE key feature of each major Nigerian constitution from 1922 to 1999.',
    },

    'nigerian-government': {
      title: 'Nigerian Government Structures',
      body: `Nigeria operates as a Federal Republic with three tiers: Federal, State, and Local Government.

Arms of government:
• Legislature (National Assembly): makes laws
  - Senate: 109 senators (3 per state + 1 FCT)
  - House of Representatives: 360 members
• Executive: implements laws
  - President (head of state and government)
  - Vice President, Federal Executive Council (cabinet)
• Judiciary: interprets laws
  - Supreme Court → Court of Appeal → Federal High Court / State High Courts

The Executive:
• President is elected for a 4-year term, maximum 2 terms
• Must be at least 35 years old, secondary school certificate minimum
• Removal: impeachment requires two-thirds of National Assembly

State Government:
• Governor heads the executive
• State House of Assembly (legislature)
• At least 24 members per state

Local Government:
• Third tier of government
• Chairman heads the LGA
• 774 LGAs in Nigeria`,
      keyPoints: [
        'Nigeria has 36 states + FCT (Federal Capital Territory)',
        'Senate: 109 members. House of Reps: 360 members',
        'President: 35 years minimum, 4-year term, max 2 terms',
        'INEC (Independent National Electoral Commission) conducts federal and state elections',
        'Federalism: powers shared between federal and state governments (Exclusive, Concurrent, Residual)',
      ],
      examTip: 'Know the composition of the National Assembly cold: 109 senators (3 per state + 1 FCT), 360 House of Reps members. Also know the President\'s constitutional requirements (age, education, residency).',
    },
  },

  // ── LITERATURE ───────────────────────────────────────────────────────────
  literature: {
    'prose': {
      title: 'Prose Fiction',
      body: `Prose is fiction written in ordinary language (not verse). JAMB Literature tests your understanding of set texts — currently The Lekki Headmaster by Wale Okediran.

Elements of prose fiction:
• Plot: the sequence of events. Freytag's pyramid: exposition → rising action → climax → falling action → resolution
• Character: protagonist (main character), antagonist (opposes protagonist), flat (simple, unchanging), round (complex, changes)
• Setting: time and place. In The Lekki Headmaster, Lekki (Lagos) is not just background — it is thematically significant
• Theme: the central ideas the author explores. Not the same as plot (plot is what happens; theme is what it means)
• Point of view: who tells the story. Third-person omniscient, first-person, third-person limited
• Style: the author's characteristic use of language, including diction, tone, and syntax

For The Lekki Headmaster, know:
• All major themes (corruption, education, community, integrity)
• All major characters and their roles
• The setting and why it matters
• Key events and their significance
• The author's purpose: social critique of Nigeria's public education system`,
      keyPoints: [
        'Protagonist = main character. Antagonist = character who opposes the protagonist',
        'Plot ≠ theme. Plot is events; theme is the underlying meaning/message',
        'Setting in this novel is symbolic — Lekki\'s wealth contrasts with the school\'s poverty',
        'Climax = the highest point of tension in the plot',
        'Authorial purpose: what the writer intends the reader to feel/think/understand',
      ],
      examTip: 'JAMB essay questions often start with "Discuss the theme of X in [novel]." Prepare a structured response: define the theme, give three specific examples from the text, explain each example.',
    },

    'literary-devices': {
      title: 'Literary Devices',
      body: `Literary devices are techniques writers use to create meaning and effect. Many overlap with figures of speech but are used specifically in the context of longer texts.

Narrative devices:
• Foreshadowing: hints at future events
• Flashback: interruption of the narrative to describe past events
• In medias res: beginning a story in the middle of the action
• Dramatic irony: reader knows something a character does not

Character devices:
• Foil: a character who contrasts with another to highlight their qualities
• Soliloquy (drama): a character speaks their thoughts aloud
• Stream of consciousness: narration that replicates the flow of thought

Language devices (as used in prose and poetry):
• Imagery: language that appeals to the senses
• Symbolism: objects or actions that represent ideas beyond their literal meaning
• Allegory: an extended narrative where characters/events represent abstract ideas
• Motif: a recurring element (image, phrase, symbol) that reinforces the theme
• Diction: word choice — formal/informal, archaic/modern, simple/complex

For poetry:
• Rhyme scheme: the pattern of end rhymes (ABAB, ABBA, AABB etc.)
• Metre/rhythm: the pattern of stressed and unstressed syllables
• Stanza: a grouped set of lines (like a paragraph in prose)`,
      keyPoints: [
        'Foreshadowing creates suspense and makes the ending feel inevitable',
        'Symbolism: look for objects that appear repeatedly — they usually carry meaning',
        'Dramatic irony creates tension — the reader is in a position of superior knowledge',
        'A foil character exists to make the protagonist\'s qualities more visible by contrast',
        'Motif ≠ symbol. A motif is recurring; a symbol can appear just once',
      ],
      examTip: '"How does the author use symbolism/imagery/irony in this passage?" — identify the device, quote the example, explain the effect it creates on the reader.',
    },
  },

  // ── COMMERCE ────────────────────────────────────────────────────────────
  commerce: {
    'trade': {
      title: 'Trade',
      body: `Trade is the buying and selling of goods and services. Commerce is the wider system that facilitates trade, including banking, transportation, insurance, and warehousing.

Types of trade:
• Home/Domestic trade: buying and selling within a country
  - Wholesale trade: buying in large quantities from producers and selling to retailers
  - Retail trade: selling directly to the final consumer in small quantities
• Foreign/International trade: buying and selling between countries
  - Imports: goods brought into a country
  - Exports: goods sent out of a country
  - Entrepôt trade (Re-export): importing goods for re-export to a third country

Channels of distribution:
Manufacturer → Wholesaler → Retailer → Consumer (traditional)
Manufacturer → Consumer (direct selling/e-commerce)

Role of the middleman (wholesaler):
• Bulk breaking: buys large quantities and sells smaller quantities to retailers
• Storage: warehouses goods between production and sale
• Risk-bearing: absorbs price fluctuations
• Financing: extends credit to retailers
• Transport: delivers goods to retailers

Balance of trade: difference between the value of exports and imports.
• Favourable (surplus): exports > imports
• Unfavourable (deficit): imports > exports`,
      keyPoints: [
        'Wholesale: producer → wholesaler → retailer. Retail: retailer → consumer',
        'Entrepôt trade: import → store → re-export to another country',
        'Favourable balance of trade: exports exceed imports',
        'Invisible trade: services (tourism, banking, shipping) rather than physical goods',
        'Dumping: selling goods in a foreign market below cost to undercut competition',
      ],
      examTip: '"What is the function of a wholesaler?" — break bulk, provide storage, extend credit to retailers, bear risk. JAMB commonly asks for 3–4 functions.',
    },
  },

  // ── ACCOUNTING ───────────────────────────────────────────────────────────
  accounting: {
    'bookkeeping-basics': {
      title: 'Bookkeeping Basics',
      body: `Bookkeeping is the systematic recording of financial transactions in a business.

The accounting equation: Assets = Liabilities + Capital (Owner's Equity)
• Assets: what the business owns (cash, debtors, inventory, equipment)
• Liabilities: what the business owes (creditors, loans, overdrafts)
• Capital: the owner's investment in the business

Double-entry bookkeeping: every transaction affects at least two accounts — one debit and one credit.

Rules of double entry:
• Assets increase → Debit the asset account
• Assets decrease → Credit the asset account
• Liabilities/Capital increase → Credit the account
• Liabilities/Capital decrease → Debit the account

Source documents: the original records of transactions.
• Invoice: document issued by seller to buyer detailing goods/services and price
• Receipt: confirms payment received
• Credit note: issued when goods are returned
• Statement of account: summary of transactions between buyer and seller

Books of original entry (Daybooks):
• Sales daybook (Sales journal)
• Purchases daybook
• Returns inwards book
• Returns outwards book
• Cash book (records all cash and bank transactions)
• General journal (for non-routine entries)`,
      keyPoints: [
        'Accounting equation: Assets = Capital + Liabilities (must always balance)',
        'Debit (Dr): left side of T-account. Credit (Cr): right side',
        'Assets and expenses increase on the debit side',
        'Liabilities, capital, and income increase on the credit side',
        'Trial balance: list of all ledger balances — debits must equal credits',
      ],
      examTip: '"Which side of the ledger is X recorded?" — remember DEAD CLIC: Debits increase Expenses, Assets, Drawings. Credits increase Liabilities, Income, Capital.',
    },

    'final-accounts': {
      title: 'Final Accounts',
      body: `Final accounts are prepared at the end of an accounting period to show the financial performance and position of a business.

Trading Account: shows gross profit.
Net Sales − Cost of Goods Sold = Gross Profit
Cost of Goods Sold = Opening Stock + Purchases − Closing Stock

Profit and Loss Account: shows net profit.
Gross Profit + Other Income − Expenses = Net Profit

Balance Sheet: shows financial position at a point in time. Not an account — it is a statement.
• Assets side: Non-current assets + Current assets
• Liabilities + Capital side: Capital + Non-current liabilities + Current liabilities

Current assets (ordered by liquidity, least liquid first): Stock → Debtors → Cash at bank → Cash in hand
Non-current assets: land, buildings, machinery, vehicles

Current liabilities: creditors, bank overdraft, accruals
Non-current liabilities: long-term loans, mortgages

Adjustments to final accounts:
• Accruals: expenses incurred but not yet paid — add to expense, show as current liability
• Prepayments: expenses paid in advance — deduct from expense, show as current asset
• Bad debts: confirmed non-recoverable debtors — deduct from debtors, charge to P&L
• Depreciation: annual charge for wear and tear on non-current assets`,
      keyPoints: [
        'Trading account → Profit & Loss → Balance Sheet (in that order)',
        'Gross profit = Net sales − Cost of goods sold',
        'Net profit = Gross profit + other income − all expenses',
        'Balance Sheet must balance: Total Assets = Capital + Total Liabilities',
        'Accruals increase the expense; prepayments decrease it',
      ],
      examTip: 'JAMB loves asking about the treatment of adjustments — accruals and prepayments specifically. An accrual is added to the expense in P&L and shown as a current liability on the Balance Sheet.',
    },
  },
}
