export type Platform = 'youtube' | 'udemy' | 'website'
export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1'

export interface CourseReview {
  author: string
  rating: number
  text: string
  date: string
  helpful: number
}

export interface CurriculumSection {
  title: string
  topics: string[]
}

export interface ClassTeacher {
  id: string
  name: string
  platform: Platform
  platformLabel: string
  platformUrl: string
  avatarInitials: string
  avatarColor: string
  bio: string
  longBio: string
  courseTitle: string
  level: JLPTLevel
  rating: number
  reviewCount: number
  studentCount: string
  videoCount?: string
  highlights: string[]
  tags: string[]
  free: boolean
  priceNote: string
  whatYouLearn: string[]
  curriculum: CurriculumSection[]
  reviews: CourseReview[]
  pros: string[]
  cons: string[]
}

export const classTeachers: ClassTeacher[] = [
  {
    id: 'misa-sensei',
    name: 'Misa Sensei',
    platform: 'youtube',
    platformLabel: 'YouTube',
    platformUrl: 'https://www.youtube.com/@japanese_ammo_with_misa',
    avatarInitials: 'MS',
    avatarColor: '#FF4444',
    bio: 'Native Japanese teacher with a warm, story-driven teaching style. Perfect for absolute beginners.',
    longBio:
      'Misa Sensei (Japanese Ammo with Misa) is a native Japanese teacher based in Japan. She started her YouTube channel to help absolute beginners learn real, conversational Japanese. Her lessons are known for their relaxed pace, clear explanations, and the use of everyday sentences rather than textbook-only phrases. Misa holds a degree in Japanese linguistics and has taught Japanese privately for over 8 years before going online.',
    courseTitle: 'Japanese Ammo — Complete N5 Beginner Course',
    level: 'N5',
    rating: 4.9,
    reviewCount: 3120,
    studentCount: '1.2M+',
    videoCount: '180+ videos',
    highlights: ['100% Free', '180+ Videos', 'Subtitles'],
    tags: ['Grammar', 'Vocab', 'Speaking', 'Listening'],
    free: true,
    priceNote: 'Completely free on YouTube',
    whatYouLearn: [
      'Hiragana & Katakana from scratch',
      'Essential N5 grammar patterns (は、が、を、に、で、と…)',
      'Verb conjugation: present, past, te-form, negative',
      'Adjective types (i-adjectives vs na-adjectives)',
      'Building natural conversational sentences',
      'Common daily vocabulary (300+ words)',
      'Numbers, dates, time expressions',
      'Polite vs casual speech registers',
    ],
    curriculum: [
      {
        title: 'Unit 1 — The Writing Systems',
        topics: ['Hiragana complete chart', 'Katakana complete chart', 'Reading practice exercises', 'Introduction to Kanji radicals'],
      },
      {
        title: 'Unit 2 — Core Grammar Foundations',
        topics: ['Sentence structure: Subject + Object + Verb', 'Topic particle は vs subject particle が', 'Noun + です sentences', 'Question formation with か'],
      },
      {
        title: 'Unit 3 — Verbs & Conjugation',
        topics: ['Verb groups (godan, ichidan, irregular)', 'Masu-form (polite present)', 'Ta-form (polite past)', 'Negative forms (ません、なかった)', 'Te-form and its uses'],
      },
      {
        title: 'Unit 4 — Adjectives',
        topics: ['い-adjectives and conjugation', 'な-adjectives and their rules', 'Describing nouns', 'Adjective + て form for listing'],
      },
      {
        title: 'Unit 5 — Essential Particles',
        topics: ['Location: に and で', 'Direction: へ', 'Object: を', 'Time: に', 'Companion: と', 'Tool/means: で'],
      },
      {
        title: 'Unit 6 — Everyday Conversation',
        topics: ['Greetings and introductions', 'Shopping dialogues', 'Asking for directions', 'Expressing wants: たい', 'Can/Cannot: できる'],
      },
    ],
    reviews: [
      {
        author: 'Alex M.',
        rating: 5,
        text: 'Misa is the best Japanese teacher on the internet. Her explanations of particles finally made sense after months of confusion with other resources.',
        date: 'March 2025',
        helpful: 342,
      },
      {
        author: 'Priya S.',
        rating: 5,
        text: 'I went from zero to passing JLPT N5 in 8 months using mainly her channel. The pace is perfect and she explains everything so clearly.',
        date: 'January 2025',
        helpful: 287,
      },
      {
        author: 'Tom K.',
        rating: 4,
        text: 'Incredible free resource. Only minor gripe is that some older videos have slightly inconsistent audio quality, but the content is gold.',
        date: 'February 2025',
        helpful: 201,
      },
      {
        author: 'Yuki L.',
        rating: 5,
        text: "As a Japanese speaker myself, I recommended Misa to all my foreign friends. Her nuances and cultural notes are spot-on and something you won't find elsewhere.",
        date: 'December 2024',
        helpful: 178,
      },
    ],
    pros: [
      'Native speaker with exceptional clarity',
      'Extremely beginner-friendly pacing',
      'Natural conversational Japanese (not just textbook)',
      'Free with no account required',
      'Covers all N5 grammar points',
    ],
    cons: [
      'No structured JLPT mock tests',
      'Older videos lack consistent formatting',
      'No downloadable PDF notes (community-made PDFs available)',
    ],
  },

  {
    id: 'cure-dolly',
    name: 'Cure Dolly',
    platform: 'youtube',
    platformLabel: 'YouTube',
    platformUrl: 'https://www.youtube.com/@organicjapanesewithcuredol5794',
    avatarInitials: 'CD',
    avatarColor: '#9B59B6',
    bio: 'Unconventional structural approach to Japanese grammar. Teaches the language as it actually works, not the Western textbook version.',
    longBio:
      'Cure Dolly (a pseudonymous teacher) created the "Organic Japanese" series based on the philosophy that Japanese is best learned through its own internal logic rather than force-mapped onto English grammatical concepts. The channel, though unconventional in presentation (using an AI/anime avatar), is widely regarded as one of the most intellectually rigorous approaches to Japanese grammar online. The series has a cult following among serious learners who want to truly understand — not just memorize — the language.',
    courseTitle: 'Organic Japanese with Cure Dolly — Structural Grammar',
    level: 'N5',
    rating: 4.7,
    reviewCount: 1840,
    studentCount: '500K+',
    videoCount: '70+ lessons',
    highlights: ['100% Free', 'Deep Grammar', 'Unique Method'],
    tags: ['Grammar', 'Structure', 'Deep Learning', 'Particles'],
    free: true,
    priceNote: 'Completely free on YouTube',
    whatYouLearn: [
      'The true function of は and が (not the Western explanation)',
      'How Japanese sentence structure actually works',
      'The logical particle system decoded',
      'Verb and adjective engines — conjugation as transformation',
      'How to think in Japanese, not translate from English',
      'Compound sentences and clause attachment',
      'The て-form as a connector vs the te-form as a request',
      'Helper verbs: いる、ある、くれる、もらう、あげる',
    ],
    curriculum: [
      {
        title: 'Foundations — The Real Structure of Japanese',
        topics: ['The Japanese sentence engine', 'Null subject and zero pronoun', 'は as topic marker (not subject)', 'が as the real subject particle'],
      },
      {
        title: 'The Logical Particles',
        topics: ['を — the object of the verb', 'に — the target particle', 'で — the contextual particle', 'へ、から、まで'],
      },
      {
        title: 'Verb Morphology',
        topics: ['Verb groups and their stems', 'The て-form as a root of many helpers', 'ている — ongoing state/action', 'てある — resultant state'],
      },
      {
        title: 'Adjective System',
        topics: ['い-adjectives as verb-like words', 'な-adjectives as noun-like words', 'Adjectival clauses', 'The の nominaliser'],
      },
      {
        title: 'Advanced N5 Concepts',
        topics: ['Causative: させる', 'Passive: られる', 'Potential: できる / られる', 'Combining clauses with から、ので、が、けど'],
      },
    ],
    reviews: [
      {
        author: 'Daniel H.',
        rating: 5,
        text: "Cure Dolly rewired how I think about Japanese. The は vs が explanation alone was worth the entire series. Nothing else on the internet explains it this well.",
        date: 'February 2025',
        helpful: 412,
      },
      {
        author: 'Mei C.',
        rating: 5,
        text: 'After struggling with Japanese grammar for 2 years, Cure Dolly made everything click in 2 weeks. The structural approach is brilliant.',
        date: 'March 2025',
        helpful: 388,
      },
      {
        author: 'Sam R.',
        rating: 4,
        text: 'Incredible content but the audio and avatar can be distracting at first. Push past that — the explanations are unmatched.',
        date: 'January 2025',
        helpful: 267,
      },
    ],
    pros: [
      'Deepest grammatical explanations available for free',
      'Corrects many misconceptions from textbooks',
      'Builds real intuition for the language',
      'Dense and efficient — no filler content',
      'Great for learners who want to truly understand Japanese',
    ],
    cons: [
      'Unconventional presentation style (AI avatar, filtered voice)',
      'Not for complete beginners — some prior kana knowledge needed',
      'No vocabulary or listening practice',
      'Dense videos require rewatching',
    ],
  },

  {
    id: 'tokini-andy',
    name: 'ToKini Andy',
    platform: 'youtube',
    platformLabel: 'YouTube',
    platformUrl: 'https://www.youtube.com/@ToKiniAndy',
    avatarInitials: 'TA',
    avatarColor: '#E74C3C',
    bio: 'Textbook-aligned JLPT prep with Genki I & II. Best for learners who want structured, exam-focused progress.',
    longBio:
      "ToKini Andy is an American teacher based in Japan who has lived in the country for over a decade. His channel follows the popular Genki textbook series chapter by chapter, making it the ideal companion resource for university students or self-learners using Genki. Andy's teaching style is clear, energetic, and exam-aware — he regularly shows how each grammar point maps to JLPT N5/N4 requirements. He also runs interactive live study sessions on YouTube.",
    courseTitle: 'Genki I & II Complete Walkthrough — N5/N4 JLPT',
    level: 'N5',
    rating: 4.8,
    reviewCount: 2100,
    studentCount: '400K+',
    videoCount: '120+ videos',
    highlights: ['100% Free', 'Genki Aligned', 'JLPT Focused'],
    tags: ['Grammar', 'JLPT Prep', 'Genki', 'Structured'],
    free: true,
    priceNote: 'Free on YouTube (Genki textbook sold separately)',
    whatYouLearn: [
      'All Genki I grammar patterns (N5 range)',
      'Vocabulary from Genki I chapters 1–12',
      'JLPT N5 grammar mapping — know exactly what to study',
      'Reading practice with furigana support',
      'Listening drills matching Genki audio',
      'Kanji introduced per chapter (103 N5 kanji)',
      'Sentence patterns used in JLPT-style questions',
      'Grammar nuances: differences between similar patterns',
    ],
    curriculum: [
      {
        title: 'Genki I — Chapters 1–4',
        topics: ['Introductions, numbers, time', 'これ/それ/あれ、どれ', 'X は Y です', 'Noun の Noun'],
      },
      {
        title: 'Genki I — Chapters 5–8',
        topics: ['Verb conjugation (godan & ichidan)', 'Direction に/へ, location で', 'Past tense verbs and adjectives', '〜たい (want to do)'],
      },
      {
        title: 'Genki I — Chapters 9–12',
        topics: ['て-form requests and permissions', 'いる/いない, ある/ない', 'Comparisons: 〜より〜の方が', 'Short forms and casual speech'],
      },
    ],
    reviews: [
      {
        author: 'Chris W.',
        rating: 5,
        text: 'Using Genki + ToKini Andy videos together is the best self-study combo I found. He explains every exercise and grammar note clearly.',
        date: 'March 2025',
        helpful: 320,
      },
      {
        author: 'Aisha T.',
        rating: 5,
        text: 'Passed N5 first try. Used his channel for the last 3 months before the exam. His JLPT breakdowns are incredibly useful.',
        date: 'December 2024',
        helpful: 289,
      },
      {
        author: 'Noel B.',
        rating: 4,
        text: "Great structured content. You'll need the Genki textbook to fully follow along, but even without it he explains concepts well.",
        date: 'February 2025',
        helpful: 198,
      },
    ],
    pros: [
      'Directly aligned with Genki — most popular Japanese textbook',
      'Explicitly maps to JLPT N5 requirements',
      'Well-structured, chapter-by-chapter progression',
      'Covers kanji systematically',
      'Regular live sessions and Q&A',
    ],
    cons: [
      'Best used alongside Genki textbook (extra cost)',
      'Less focus on natural/casual Japanese',
      'Some chapters are long (40-60 min)',
    ],
  },

  {
    id: 'nihongo-no-mori',
    name: 'Nihongo no Mori',
    platform: 'youtube',
    platformLabel: 'YouTube',
    platformUrl: 'https://www.youtube.com/@nihongonomori',
    avatarInitials: 'NM',
    avatarColor: '#27AE60',
    bio: 'JLPT-specific preparation by native Japanese teachers. Laser-focused on passing N5, N4, N3 exams.',
    longBio:
      'Nihongo no Mori ("Japanese Forest") is a channel run by a team of native Japanese teachers specifically designed for JLPT preparation. Unlike other channels that teach general Japanese, every lesson maps directly to a JLPT exam objective — grammar point, vocabulary category, or kanji reading. The team uses a classroom whiteboard format that feels professional and serious. Ideal for learners who already have some Japanese base and want focused exam preparation.',
    courseTitle: 'JLPT N5 Complete Prep — Grammar, Vocab & Kanji',
    level: 'N5',
    rating: 4.6,
    reviewCount: 980,
    studentCount: '300K+',
    videoCount: '90+ videos',
    highlights: ['100% Free', 'JLPT Specific', 'Native Teachers'],
    tags: ['JLPT', 'Grammar', 'Kanji', 'Vocabulary', 'Exam Prep'],
    free: true,
    priceNote: 'Completely free on YouTube',
    whatYouLearn: [
      'All N5 grammar points in exam-focused order',
      'N5 vocabulary list (800 words) with usage examples',
      'All 103 N5 kanji with readings and compounds',
      'JLPT question format and strategy',
      'Reading comprehension for short passages',
      'Listening question types and how to approach them',
      'Common traps and distractor patterns in N5 questions',
    ],
    curriculum: [
      {
        title: 'N5 Grammar — All 60+ Points',
        topics: ['Sentence enders: ね、よ、か', 'Permission and prohibition: ていい、てはいけない', 'Ability: ことができる', 'Experience: たことがある', '〜ながら (while doing)', '〜てから (after doing)'],
      },
      {
        title: 'N5 Vocabulary Drills',
        topics: ['Category-based vocab (food, travel, daily life)', 'Verb pairs (する/なる, 上げる/上がる)', 'Common counters (本、枚、個、匹)', 'Time expressions and frequency adverbs'],
      },
      {
        title: 'N5 Kanji 103',
        topics: ['Kanji by category (numbers, nature, body)', 'On-yomi vs kun-yomi drills', 'Common compound words', 'Writing stroke order guidance'],
      },
    ],
    reviews: [
      {
        author: 'Fatima A.',
        rating: 5,
        text: 'This is THE channel if you are serious about passing the JLPT. Every video is directly relevant to the exam. No fluff.',
        date: 'January 2025',
        helpful: 234,
      },
      {
        author: 'Lucas P.',
        rating: 4,
        text: 'Very dry but incredibly effective. I treated it like attending actual class and it worked. Passed N5 with high marks.',
        date: 'March 2025',
        helpful: 187,
      },
    ],
    pros: [
      'Most exam-focused free resource available',
      'Native Japanese teachers',
      'Covers all three N5 exam sections (grammar, vocab, kanji)',
      'Professional whiteboard format — easy to follow',
      'Directly usable as structured study plan',
    ],
    cons: [
      'Dry, classroom-style — low entertainment value',
      'Assumes some prior Japanese knowledge',
      'Limited cultural context or real-world usage',
    ],
  },

  {
    id: 'japanesepod101',
    name: 'JapanesePod101',
    platform: 'website',
    platformLabel: 'Website',
    platformUrl: 'https://www.japanesepod101.com',
    avatarInitials: 'JP',
    avatarColor: '#2980B9',
    bio: 'The most comprehensive structured Japanese course online. Free tier available with 100s of audio/video lessons.',
    longBio:
      'JapanesePod101 is one of the largest online Japanese learning platforms, operated by Innovative Language. It uses a podcast-style format with two hosts per lesson — one native Japanese speaker and one English-speaking learner — making dialogue feel natural. The platform has a free tier with hundreds of lessons accessible, while the premium plan unlocks personalized learning paths, PDF notes, and spaced-repetition vocabulary tools. It covers everything from absolute beginner to advanced, with structured pathways by level.',
    courseTitle: 'JapanesePod101 — Absolute Beginner to N5 Path',
    level: 'N5',
    rating: 4.5,
    reviewCount: 5600,
    studentCount: '2M+',
    videoCount: '500+ lessons',
    highlights: ['Free Tier', 'Audio + Video', 'PDF Notes'],
    tags: ['Listening', 'Vocab', 'Grammar', 'Structured Path'],
    free: false,
    priceNote: 'Free tier available. Premium from $4/mo',
    whatYouLearn: [
      'Survival Japanese for travel and daily life',
      'Listening comprehension through natural dialogues',
      'N5 vocabulary in context (not just word lists)',
      'Grammar explanations with audio examples',
      'Reading hiragana, katakana, and beginner kanji',
      'Cultural notes woven into every lesson',
      'Spaced-repetition vocabulary review (premium)',
      'Pronunciation and pitch accent basics',
    ],
    curriculum: [
      {
        title: 'Absolute Beginner Path',
        topics: ['Greetings and self-introduction', 'Numbers and counting', 'Telling time and dates', 'Basic shopping dialogue', 'Asking questions politely'],
      },
      {
        title: 'Beginner Path (N5 Level)',
        topics: ['Verb conjugations in context', 'Describing people and places', 'Making plans and invitations', 'Expressing preferences and opinions', 'Polite requests and refusals'],
      },
      {
        title: 'Vocabulary Builder',
        topics: ['1,000 most common Japanese words', 'Themed vocab sets (food, work, travel)', 'Flashcard-based SRS review', 'Word usage in natural sentences'],
      },
    ],
    reviews: [
      {
        author: 'Maria G.',
        rating: 5,
        text: 'The podcast format is so much more engaging than watching someone write on a whiteboard. I listen while commuting and my Japanese has improved massively.',
        date: 'February 2025',
        helpful: 445,
      },
      {
        author: 'James K.',
        rating: 4,
        text: 'Free tier is genuinely useful and has a lot of content. Premium is worth it for the PDF notes and vocab tools. Good structured path.',
        date: 'January 2025',
        helpful: 312,
      },
      {
        author: 'Sophie N.',
        rating: 4,
        text: 'Best for listening practice by far. The dialogues are natural and the cultural notes are a great bonus.',
        date: 'March 2025',
        helpful: 267,
      },
    ],
    pros: [
      'Largest library of Japanese lessons online',
      'Audio-first format — great for commuters',
      'Structured learning path by level',
      'Covers cultural context alongside language',
      'Free tier has substantial content',
    ],
    cons: [
      'Best features locked behind premium subscription',
      'Can feel sales-y with upgrade prompts',
      'Less grammar depth than dedicated grammar channels',
      'Older lessons have lower production quality',
    ],
  },

  {
    id: 'udemy-miku',
    name: 'Miku Sensei (Udemy)',
    platform: 'udemy',
    platformLabel: 'Udemy',
    platformUrl: 'https://www.udemy.com/course/japanese-for-beginners-n5/',
    avatarInitials: 'MK',
    avatarColor: '#A435F0',
    bio: 'Structured video course on Udemy. Often available for under ₹500 during sales. Great for learners who prefer a one-time purchase.',
    longBio:
      "Miku Sensei's Udemy course is one of the highest-rated paid Japanese courses on the platform, consistently sitting above 4.6 stars with 20,000+ students enrolled. The course is fully self-paced and covers complete N5 preparation with structured modules, quizzes, and downloadable resources. Udemy frequently runs sales, bringing the price from ₹3,499 down to ₹499 or less. Unlike YouTube channels, the course has a defined beginning and end — ideal for learners who prefer clear milestones and completion certificates.",
    courseTitle: 'Complete Japanese N5 — Beginner to JLPT Ready',
    level: 'N5',
    rating: 4.6,
    reviewCount: 12400,
    studentCount: '22K+',
    videoCount: '18 hours video',
    highlights: ['One-Time Purchase', 'Certificate', 'Downloadable Notes'],
    tags: ['Grammar', 'Vocab', 'JLPT', 'Certificate', 'Structured'],
    free: false,
    priceNote: 'Paid (₹499–₹3,499). Udemy sales frequent.',
    whatYouLearn: [
      'Complete N5 grammar syllabus — all 60+ grammar forms',
      'N5 vocabulary 800 words with audio pronunciation',
      'All 103 N5 kanji with stroke order and readings',
      'JLPT N5 full mock test with answer explanations',
      'Speaking practice — reading aloud exercises',
      'Section quizzes to test retention at each stage',
      'Certificate of completion (recognised by some employers)',
      'Lifetime access + free content updates',
    ],
    curriculum: [
      {
        title: 'Section 1 — Writing Systems',
        topics: ['Hiragana 46 characters', 'Katakana 46 characters', 'Dakuten, Combination characters', 'Introduction to 50 N5 Kanji'],
      },
      {
        title: 'Section 2 — Beginner Grammar',
        topics: ['Nouns, pronouns, particles', 'Adjective types', 'Verb groups and basic conjugations', 'Question sentences'],
      },
      {
        title: 'Section 3 — Intermediate N5 Grammar',
        topics: ['て-form and its 8 common uses', 'Conditional forms', 'Giving/receiving verbs', 'Expressing ability, desire, experience'],
      },
      {
        title: 'Section 4 — JLPT Mock Test',
        topics: ['Full N5 practice test', 'Answer walkthrough', 'Common mistake analysis', 'Score prediction and weak-point review'],
      },
    ],
    reviews: [
      {
        author: 'Ravi P.',
        rating: 5,
        text: 'Bought during a Udemy sale for ₹399. Absolute value for money. The mock test section alone was worth the price.',
        date: 'February 2025',
        helpful: 567,
      },
      {
        author: 'Elena S.',
        rating: 5,
        text: 'I tried free YouTube resources for a year and kept feeling lost. This course finally gave me the structure I needed. The quizzes really help retention.',
        date: 'March 2025',
        helpful: 490,
      },
      {
        author: 'Kevin L.',
        rating: 4,
        text: 'Good content and well paced. The certificate is a nice bonus. Would give 5 stars if there were more speaking exercises.',
        date: 'January 2025',
        helpful: 334,
      },
    ],
    pros: [
      'Full structured course with clear start and end',
      'Includes JLPT mock test — unique among free/cheap options',
      'Downloadable PDF notes for every section',
      'Certificate of completion included',
      'One-time cost — no subscription',
      'Frequently on sale for under ₹500',
    ],
    cons: [
      'Not free (though very cheap during sales)',
      'Less natural/conversational Japanese focus',
      'Cannot ask questions in real-time',
    ],
  },
]
