/**
 * Bundled seed data for the Classes pages, in the exact API (snake_case) shape.
 *
 * Served by `classesService` only when the API cannot be reached; it mirrors
 * the seed migrations (real channel URLs, avatars, banners, intro videos,
 * playlist ids and thumbnails). Playlist videos are normally filled by a
 * server-side YouTube API sync; a course may carry a seeded list (see
 * `onomappuVideos.ts`), otherwise they are empty here. There are no ratings or reviews.
 */
import type {
  ApiClassChannelProfile,
  ApiClassCourseCard,
  ApiClassCourseDetail,
  ApiClassesList,
  ApiClassVideo,
  ApiJlptLevel,
} from '@/types/api'
import type { ClassesFilters } from '@/types/classes'
import { ONOMAPPU_NATURAL_JAPANESE_VIDEOS, ONOMAPPU_ONOMATOPOEIA_VIDEOS } from '@/api/mock/onomappuVideos'

type SeedChannel = ApiClassChannelProfile

type SeedCourse = Omit<ApiClassCourseDetail, 'channel' | 'more_from_channel' | 'similar' | 'videos'> & {
  channel_slug: string
  is_featured:  boolean
  sort_order:   number
  videos?:      ApiClassVideo[]
}

const YT_AVATAR_SUFFIX = '=s240-c-k-c0x00ffffff-no-rj'
const YT_BANNER_SUFFIX = '=w2120-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj'

const channels: SeedChannel[] = [
  {
    slug: 'japanese-ammo-with-misa',
    name: 'Japanese Ammo with Misa',
    platform: 'youtube',
    url: 'https://www.youtube.com/@JapaneseAmmowithMisa',
    handle: '@JapaneseAmmowithMisa',
    youtube_channel_id: 'UCBSyd8tXJoEJKIXfrwkPdbA',
    avatar_url: `https://yt3.googleusercontent.com/xOk8YBLsc0lES-K1tM0TxOQf_iwgsgtek9rJrxgLei69lxbEk1WKpxtICsQTxDQE3nPzF50zyQ${YT_AVATAR_SUFFIX}`,
    banner_url: `https://yt3.googleusercontent.com/MfnWcqAw9go8z47AKbPJsOwt1aJotJMCpUzh0EOfw0N9tNbJE3ckJLLGkpVp1vDMk6cyglE3${YT_BANNER_SUFFIX}`,
    description:
      'Misa is a native Japanese teacher who explains real, conversational Japanese for beginners. Her lessons are known for their relaxed pace, clear explanations, and everyday sentences rather than textbook-only phrases.',
    intro_video_id: 'WYYaf711IEM',
    subscriber_count: 660000,
    video_count: null,
    accent_color: '#E53935',
    teaching_style:
      'Warm, story-driven explanations with lots of natural example sentences. Each grammar point is broken into small steps and checked with quick practice questions.',
    best_for: ['Absolute beginners', 'Learners who want natural, spoken Japanese', 'Visual learners who like clear on-screen notes'],
    not_for: ['Learners who want strict JLPT mock tests', 'Anyone looking for a textbook-style syllabus'],
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
      'No official downloadable PDF notes',
    ],
    verdict: 'The friendliest place to start Japanese grammar from zero.',
  },
  {
    slug: 'cure-dolly',
    name: 'Organic Japanese with Cure Dolly',
    platform: 'youtube',
    url: 'https://www.youtube.com/@organicjapanesewithcuredol49',
    handle: '@organicjapanesewithcuredol49',
    youtube_channel_id: 'UCkdmU8hGK4Fg3LghTVtKltQ',
    avatar_url: `https://yt3.googleusercontent.com/ytc/AIdro_nw8mg4x0-3A56gFtGKYZ6QNfQPwTqqmDFuIhpdmOQU8cQ${YT_AVATAR_SUFFIX}`,
    banner_url: `https://yt3.googleusercontent.com/N1yd7VVW1cLLJTJMo-QBtEZAKdb-h9kAngHDmCcPPFCRWMjBmfdqtLtMl6-whZMSKDGFJ8FszQ${YT_BANNER_SUFFIX}`,
    description:
      'The "Organic Japanese" series teaches Japanese through its own internal logic rather than forcing it onto English grammar. Unconventional in presentation, it is widely regarded as one of the most rigorous approaches to Japanese grammar online.',
    intro_video_id: 'TkS5APqAFHA',
    subscriber_count: 106000,
    video_count: null,
    accent_color: '#9B59B6',
    teaching_style:
      'Structural and analytical: explains how Japanese sentences are built, then rebuilds each pattern from that core. Dense lessons narrated by an animated avatar.',
    best_for: ['Learners confused by は vs が', 'Analytical learners who want to know why', 'Self-learners who already read kana'],
    not_for: ['Complete beginners who have not learned kana', 'Learners who want vocabulary or listening practice'],
    pros: [
      'Deepest grammatical explanations available for free',
      'Corrects many misconceptions from textbooks',
      'Builds real intuition for the language',
      'Dense and efficient — no filler content',
    ],
    cons: [
      'Unconventional presentation style (avatar, filtered voice)',
      'Some prior kana knowledge needed',
      'No vocabulary or listening practice',
      'Dense videos often need rewatching',
    ],
    verdict: 'The best free explanation of how Japanese grammar really works.',
  },
  {
    slug: 'tokini-andy',
    name: 'ToKini Andy',
    platform: 'youtube',
    url: 'https://www.youtube.com/@ToKiniAndy',
    handle: '@ToKiniAndy',
    youtube_channel_id: 'UCsHzgQRjPzOz_w4HSrNLIVw',
    avatar_url: `https://yt3.googleusercontent.com/Odm1BnpElzpeAsSWhLXe58XTa_5Fk5h5QtQYwGW4UpjEKqknncffawSNwPIESYhcxYVp6HXLKQ${YT_AVATAR_SUFFIX}`,
    banner_url: `https://yt3.googleusercontent.com/s4SVUQ_Hpyzyj_aNowD2HE4IBvV2rFWFveFMNWXlWQbBaW3aYZXXpCXVyi-HmCPCJZQvzJlHWQ${YT_BANNER_SUFFIX}`,
    description:
      'Andy follows the popular Genki textbook series chapter by chapter, making the channel an ideal companion for university students and self-learners using Genki.',
    intro_video_id: null,
    subscriber_count: 233000,
    video_count: null,
    accent_color: '#E74C3C',
    teaching_style:
      'Clear, energetic, textbook-aligned walkthroughs that show how each grammar point maps to the JLPT N5/N4 requirements.',
    best_for: ['Genki I & II users', 'Learners preparing for JLPT N5/N4', 'Students who like a fixed chapter order'],
    not_for: ['Learners without the Genki textbook who want a standalone course', 'Anyone focused on casual, spoken Japanese'],
    pros: [
      'Directly aligned with Genki',
      'Explicitly maps to JLPT N5 requirements',
      'Well-structured, chapter-by-chapter progression',
      'Covers kanji systematically',
    ],
    cons: [
      'Best used alongside the Genki textbook (extra cost)',
      'Less focus on natural/casual Japanese',
      'Some chapters are long (40–60 min)',
    ],
    verdict: 'The companion to have open next to your Genki textbook.',
  },
  {
    slug: 'nihongo-no-mori',
    name: '日本語の森 (Nihongo no Mori)',
    platform: 'youtube',
    url: 'https://www.youtube.com/@nihongonomori2013',
    handle: '@nihongonomori2013',
    youtube_channel_id: 'UCVx6RFaEAg46xfAsD2zz16w',
    avatar_url: `https://yt3.googleusercontent.com/_t0OeOIzQtIRDzEMxlzOTdOSAJhln6BnC3UPFbAadIpXvjmEUWegaJfqB5e75laWE6afeabd${YT_AVATAR_SUFFIX}`,
    banner_url: `https://yt3.googleusercontent.com/5MxpA_nxsQybgEkogiORf4huCNqg0DCRGQLTH20OpdJx6VuF2-WyKJ6Ewmnq0u359SwgeEhvnT0${YT_BANNER_SUFFIX}`,
    description:
      'A channel run by native Japanese teachers built for JLPT preparation. Every lesson maps directly to an exam objective — a grammar point, vocabulary group or kanji reading.',
    intro_video_id: '1SGCu28948U',
    subscriber_count: 932000,
    video_count: null,
    accent_color: '#27AE60',
    teaching_style:
      'Classroom whiteboard lessons by native teachers, ordered exactly like the JLPT syllabus. Serious, focused and exam-first.',
    best_for: ['Learners with a JLPT date booked', 'Learners who already know some Japanese', 'Anyone who likes a classroom format'],
    not_for: ['Learners looking for entertainment value', 'Anyone who wants cultural context and casual speech'],
    pros: [
      'Most exam-focused free resource available',
      'Native Japanese teachers',
      'Covers grammar, vocabulary and kanji',
      'Professional whiteboard format — easy to follow',
    ],
    cons: [
      'Dry, classroom-style — low entertainment value',
      'Assumes some prior Japanese knowledge',
      'Limited cultural context or real-world usage',
    ],
    verdict: 'The most direct free route to passing the JLPT.',
  },
  {
    slug: 'onomappu',
    name: 'Onomappu',
    platform: 'youtube',
    url: 'https://www.youtube.com/@Onomappu',
    handle: '@Onomappu',
    youtube_channel_id: 'UCLuymDHiOySsAQ9Nc-4NoEQ',
    avatar_url: `https://yt3.googleusercontent.com/ud91_Fq3diILbmp6tJF2Y0KUUmbaE9pTq7kINsj6TXZDhaf0Pj8hgvBNIu2cfFlgFNWj_Bv1Zg${YT_AVATAR_SUFFIX}`,
    banner_url: `https://yt3.googleusercontent.com/s4FFj4czgg44wjJrI9w6pE6bWMdrCUTWyXYoLNNGhcMVGmaNYFzA8EpFOyKxL5i8S1SexH6X${YT_BANNER_SUFFIX}`,
    description:
      'Onomappu is a YouTube channel by Hitoki, a native Japanese speaker and former medical student in Japan, that teaches Japanese onomatopoeia and natural everyday usage. Most videos are short single-topic lessons explained in easy Japanese with subtitles, often built around personal stories, food and culture.',
    intro_video_id: null,
    subscriber_count: 436000,
    video_count: 149,
    accent_color: '#00897B',
    teaching_style:
      'Short videos (about 4 to 13 minutes) that each focus on one word or usage point. Hitoki explains mostly in easy, natural Japanese with subtitles, using stories and real situations instead of drills.',
    best_for: [
      'Late N5 to N3 learners who want to sound more natural',
      'Anime and manga fans who keep meeting words like ドキドキ and キラキラ',
      'Textbook learners who want to hear how natives really use common words',
    ],
    not_for: [
      'Absolute beginners: best once you know kana and basic grammar',
      'Learners looking for structured JLPT drills or exam practice',
      'Anyone who needs formal or business Japanese',
    ],
    pros: [
      'About 40 focused onomatopoeia videos, which is rare on YouTube',
      'Clear lessons on words learners often misuse: やばい, じゃん, 大丈夫, は/が, よ/ね, あげる/くれる/もらう',
      'Short, self-contained videos that are easy to fit into a daily routine',
      'Explanations in natural Japanese double as listening practice',
    ],
    cons: [
      'Playlists mix lessons with vlogs, reactions and promotion, so some videos are worth skipping',
      'Explanations are mostly in Japanese, so beginners will lean heavily on the subtitles',
      'No exercises, quizzes or review built into the playlists',
      'A few videos cover mature or flirty topics',
    ],
    verdict: 'A friendly native-speaker supplement for onomatopoeia and casual nuance, not a core course.',
  },
  {
    slug: 'japanesepod101',
    name: 'JapanesePod101',
    platform: 'website',
    url: 'https://www.japanesepod101.com',
    handle: null,
    youtube_channel_id: null,
    avatar_url: null,
    banner_url: null,
    description:
      'One of the largest online Japanese learning platforms. Podcast-style lessons with a native speaker and an English-speaking host make dialogue feel natural. A free tier gives access to hundreds of lessons.',
    intro_video_id: null,
    subscriber_count: null,
    video_count: null,
    accent_color: '#2980B9',
    teaching_style: 'Audio-first dialogues followed by a breakdown of vocabulary, grammar and cultural notes.',
    best_for: ['Commuters who learn by listening', 'Learners who want a guided path by level'],
    not_for: ['Learners who want deep grammar explanations', 'Anyone who dislikes upgrade prompts'],
    pros: [
      'Large library of Japanese lessons',
      'Audio-first format — great for commuters',
      'Structured learning path by level',
      'Free tier has substantial content',
    ],
    cons: [
      'Best features locked behind a subscription',
      'Can feel sales-y with upgrade prompts',
      'Less grammar depth than dedicated grammar channels',
    ],
    verdict: 'Best for building listening skills on the go.',
  },
]

const courses: SeedCourse[] = [
  {
    slug: 'misa-n5-complete',
    channel_slug: 'japanese-ammo-with-misa',
    title: 'Japanese Ammo — Complete N5 Beginner Course',
    summary: 'Native Japanese teacher with a warm, story-driven teaching style. Perfect for absolute beginners.',
    level: 'N5',
    platform: 'youtube',
    url: 'https://www.youtube.com/playlist?list=PLd5-Wp_4tLqaDGh1kvlS_N0X3O_bTaKar',
    playlist_id: 'PLd5-Wp_4tLqaDGh1kvlS_N0X3O_bTaKar',
    is_free: true,
    price_note: 'Completely free on YouTube',
    thumbnail_url: 'https://i.ytimg.com/vi/GU1UTcbFwIc/hqdefault.jpg',
    tags: ['Grammar', 'Vocab', 'Speaking', 'Listening'],
    what_you_learn: [
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
      { title: 'Unit 1 — The Writing Systems', topics: ['Hiragana complete chart', 'Katakana complete chart', 'Reading practice exercises', 'Introduction to Kanji radicals'] },
      { title: 'Unit 2 — Core Grammar Foundations', topics: ['Sentence structure: Subject + Object + Verb', 'Topic particle は vs subject particle が', 'Noun + です sentences', 'Question formation with か'] },
      { title: 'Unit 3 — Verbs & Conjugation', topics: ['Verb groups (godan, ichidan, irregular)', 'Masu-form (polite present)', 'Ta-form (polite past)', 'Negative forms (ません、なかった)', 'Te-form and its uses'] },
      { title: 'Unit 4 — Adjectives', topics: ['い-adjectives and conjugation', 'な-adjectives and their rules', 'Describing nouns', 'Adjective + て form for listing'] },
      { title: 'Unit 5 — Essential Particles', topics: ['Location: に and で', 'Direction: へ', 'Object: を', 'Time: に', 'Companion: と', 'Tool/means: で'] },
      { title: 'Unit 6 — Everyday Conversation', topics: ['Greetings and introductions', 'Shopping dialogues', 'Asking for directions', 'Expressing wants: たい', 'Can/Cannot: できる'] },
    ],
    total_duration_sec: 0,
    last_synced_at: null,
    is_featured: true,
    sort_order: 1,
  },
  {
    slug: 'cure-dolly-structural-grammar',
    channel_slug: 'cure-dolly',
    title: 'Organic Japanese with Cure Dolly — Structural Grammar',
    summary: 'Unconventional structural approach to Japanese grammar. Teaches the language as it actually works, not the Western textbook version.',
    level: 'N5',
    platform: 'youtube',
    url: 'https://www.youtube.com/playlist?list=PLg9uYxuZf8x_A-vcqqyOFZu06WlhnypWj',
    playlist_id: 'PLg9uYxuZf8x_A-vcqqyOFZu06WlhnypWj',
    is_free: true,
    price_note: 'Completely free on YouTube',
    thumbnail_url: 'https://i.ytimg.com/vi/pSvH9vH60Ig/hqdefault.jpg',
    tags: ['Grammar', 'Structure', 'Particles'],
    what_you_learn: [
      'The true function of は and が',
      'How Japanese sentence structure actually works',
      'The logical particle system decoded',
      'Verb and adjective engines — conjugation as transformation',
      'How to think in Japanese, not translate from English',
      'Compound sentences and clause attachment',
      'Helper verbs: いる、ある、くれる、もらう、あげる',
    ],
    curriculum: [
      { title: 'Foundations — The Real Structure of Japanese', topics: ['The Japanese sentence engine', 'Null subject and zero pronoun', 'は as topic marker (not subject)', 'が as the real subject particle'] },
      { title: 'The Logical Particles', topics: ['を — the object of the verb', 'に — the target particle', 'で — the contextual particle', 'へ、から、まで'] },
      { title: 'Verb Morphology', topics: ['Verb groups and their stems', 'The て-form as a root of many helpers', 'ている — ongoing state/action', 'てある — resultant state'] },
      { title: 'Adjective System', topics: ['い-adjectives as verb-like words', 'な-adjectives as noun-like words', 'Adjectival clauses', 'The の nominaliser'] },
      { title: 'Advanced N5 Concepts', topics: ['Causative: させる', 'Passive: られる', 'Potential: できる / られる', 'Combining clauses with から、ので、が、けど'] },
    ],
    total_duration_sec: 0,
    last_synced_at: null,
    is_featured: false,
    sort_order: 2,
  },
  {
    slug: 'tokini-andy-genki-n5',
    channel_slug: 'tokini-andy',
    title: 'Genki I & II Complete Walkthrough — N5/N4 JLPT',
    summary: 'Textbook-aligned JLPT prep with Genki I & II. Best for learners who want structured, exam-focused progress.',
    level: 'N5',
    platform: 'youtube',
    url: 'https://www.youtube.com/playlist?list=PLA_RcUI8km1NKAoxPzDoIoflnd6bNC7Qm',
    playlist_id: 'PLA_RcUI8km1NKAoxPzDoIoflnd6bNC7Qm',
    is_free: true,
    price_note: 'Free on YouTube (Genki textbook sold separately)',
    thumbnail_url: 'https://i.ytimg.com/vi/GaQBL4XHuSo/hqdefault.jpg',
    tags: ['Grammar', 'JLPT Prep', 'Genki', 'Structured'],
    what_you_learn: [
      'All Genki I grammar patterns (N5 range)',
      'Vocabulary from Genki I chapters 1–12',
      'JLPT N5 grammar mapping — know exactly what to study',
      'Reading practice with furigana support',
      'Kanji introduced per chapter',
      'Grammar nuances: differences between similar patterns',
    ],
    curriculum: [
      { title: 'Genki I — Chapters 1–4', topics: ['Introductions, numbers, time', 'これ/それ/あれ、どれ', 'X は Y です', 'Noun の Noun'] },
      { title: 'Genki I — Chapters 5–8', topics: ['Verb conjugation (godan & ichidan)', 'Direction に/へ, location で', 'Past tense verbs and adjectives', '〜たい (want to do)'] },
      { title: 'Genki I — Chapters 9–12', topics: ['て-form requests and permissions', 'いる/いない, ある/ない', 'Comparisons: 〜より〜の方が', 'Short forms and casual speech'] },
    ],
    total_duration_sec: 0,
    last_synced_at: null,
    is_featured: false,
    sort_order: 3,
  },
  {
    slug: 'nihongo-no-mori-jlpt-n5',
    channel_slug: 'nihongo-no-mori',
    title: 'JLPT N5 Complete Prep — Grammar, Vocab & Kanji',
    summary: 'JLPT-specific preparation by native Japanese teachers. Laser-focused on passing the exam.',
    level: 'N5',
    platform: 'youtube',
    url: 'https://www.youtube.com/playlist?list=PLINFE8v4DOhtoQSCYikWP_iRyauCeS7mT',
    playlist_id: 'PLINFE8v4DOhtoQSCYikWP_iRyauCeS7mT',
    is_free: true,
    price_note: 'Completely free on YouTube',
    thumbnail_url: 'https://i.ytimg.com/vi/kpR9lZKWWp0/hqdefault.jpg',
    tags: ['JLPT', 'Grammar', 'Kanji', 'Vocabulary'],
    what_you_learn: [
      'All N5 grammar points in exam-focused order',
      'N5 vocabulary with usage examples',
      'N5 kanji with readings and compounds',
      'JLPT question format and strategy',
      'Common traps and distractor patterns in N5 questions',
    ],
    curriculum: [
      { title: 'N5 Grammar', topics: ['Sentence enders: ね、よ、か', 'Permission and prohibition: ていい、てはいけない', 'Ability: ことができる', 'Experience: たことがある', '〜ながら (while doing)', '〜てから (after doing)'] },
      { title: 'N5 Vocabulary Drills', topics: ['Category-based vocab (food, travel, daily life)', 'Common counters (本、枚、個、匹)', 'Time expressions and frequency adverbs'] },
      { title: 'N5 Kanji', topics: ['Kanji by category (numbers, nature, body)', 'On-yomi vs kun-yomi drills', 'Common compound words'] },
    ],
    total_duration_sec: 0,
    last_synced_at: null,
    is_featured: false,
    sort_order: 4,
  },
  {
    slug: 'japanesepod101-n5-path',
    channel_slug: 'japanesepod101',
    title: 'JapanesePod101 — Absolute Beginner to N5 Path',
    summary: 'A large structured Japanese course online. Free tier available with hundreds of audio and video lessons.',
    level: 'N5',
    platform: 'website',
    url: 'https://www.japanesepod101.com',
    playlist_id: null,
    is_free: false,
    price_note: 'Free tier available. Premium is a paid subscription.',
    thumbnail_url: 'https://cdn.innovativelanguage.com/sns/thumbnail/site/thumb_fb_japanese.png',
    tags: ['Listening', 'Vocab', 'Grammar', 'Structured Path'],
    what_you_learn: [
      'Survival Japanese for travel and daily life',
      'Listening comprehension through natural dialogues',
      'N5 vocabulary in context',
      'Grammar explanations with audio examples',
      'Cultural notes woven into every lesson',
    ],
    curriculum: [
      { title: 'Absolute Beginner Path', topics: ['Greetings and self-introduction', 'Numbers and counting', 'Telling time and dates', 'Basic shopping dialogue'] },
      { title: 'Beginner Path (N5 Level)', topics: ['Verb conjugations in context', 'Describing people and places', 'Making plans and invitations', 'Polite requests and refusals'] },
    ],
    total_duration_sec: 0,
    last_synced_at: null,
    is_featured: false,
    sort_order: 5,
  },
  {
    slug: 'onomappu-japanese-onomatopoeia',
    channel_slug: 'onomappu',
    title: 'Onomappu — Everyday Japanese Onomatopoeia',
    summary: 'Short native-speaker lessons on everyday onomatopoeia like ドキドキ, イライラ and サクサク, told through stories. Best once you know kana and basic grammar.',
    level: 'N5',
    platform: 'youtube',
    url: 'https://www.youtube.com/playlist?list=PLNc4a4bdNUduYoRLzSZ-IxNENdWT3Fvy_',
    playlist_id: 'PLNc4a4bdNUduYoRLzSZ-IxNENdWT3Fvy_',
    is_free: true,
    price_note: 'Completely free on YouTube',
    thumbnail_url: 'https://i.ytimg.com/vi/qXoqOvJ9pBE/hqdefault.jpg',
    tags: ['Onomatopoeia', 'Vocabulary', 'Listening', 'Culture'],
    what_you_learn: [
      'Use common feeling words like ドキドキ, イライラ and もやもや',
      'Describe food textures with サクサク, カリカリ, プチプチ and ねばねば',
      'Tell look-alike pairs apart, such as どんどん and だんだん',
      'Understand figurative meanings, like カリカリ for an irritable person',
      'Recognise onomatopoeia you hear in anime and manga',
      'Follow short explanations given in easy, natural Japanese',
    ],
    curriculum: [
      { title: 'Getting started', topics: [
        'Everyday onomatopoeia natives use',
        'わくわく, パリパリ and つるつる',
        'ゴロゴロ: lazing around at home',
        'ギリギリ: just barely',
        'どんどん vs だんだん',
      ] },
      { title: 'Feelings and moods', topics: [
        'ドキドキ beyond romance',
        'もやもや: a vague, unsettled feeling',
        'イライラ: feeling irritated',
        'ビクビク and ブルブル: fear and shivering',
        'ノリノリ: in high spirits at a party',
        'ボロボロ: worn out',
      ] },
      { title: 'Food and texture', topics: [
        'プチプチ: popping textures',
        'ねばねば: sticky natto',
        'サクサク: crunchy, and working smoothly',
        'カリカリ: crispy, or irritable',
      ] },
      { title: 'One word, many uses', topics: [
        'キラキラ: sparkling things and people',
        'バラバラ: scattered or split up',
        'ガラガラ: empty, gargling, hoarse',
        'キレた vs キレキレ',
        'ぐるぐる: feeling dizzy',
      ] },
      { title: 'People and situations', topics: [
        'じろじろ: staring',
        'ぎゅうぎゅう: a packed train',
        'ベタベタ: clingy',
        'ガリガリ: very skinny',
        'こっそり: doing something secretly',
        'ぴったり and time etiquette',
      ] },
      { title: 'Anime, culture and stories', topics: [
        'Onomatopoeia that help with anime',
        "Anya's わくわく in Spy x Family",
        'モテモテ and モテ期',
        'ドロドロ: messy relationships',
        'じゃんけん and its sounds',
        'Convenience store phrases',
      ] },
    ],
    total_duration_sec: 24339,
    videos: ONOMAPPU_ONOMATOPOEIA_VIDEOS,
    last_synced_at: null,
    is_featured: false,
    sort_order: 7,
  },
  {
    slug: 'onomappu-natural-japanese',
    channel_slug: 'onomappu',
    title: 'Onomappu — Natural Japanese: Particles, Nuance and Casual Speech',
    summary: 'A native speaker explains は/が, よ/ね, あげる/くれる/もらう, 大丈夫, じゃん and やばい so you sound natural. Best once you know kana and basic grammar.',
    level: 'N5',
    platform: 'youtube',
    url: 'https://www.youtube.com/playlist?list=PLNc4a4bdNUdtxwNxBIn6M58BoqQuAqlzr',
    playlist_id: 'PLNc4a4bdNUdtxwNxBIn6M58BoqQuAqlzr',
    is_free: true,
    price_note: 'Completely free on YouTube',
    thumbnail_url: 'https://i.ytimg.com/vi/DYQ5YXb-ARU/hqdefault.jpg',
    tags: ['Grammar', 'Particles', 'Nuance', 'Casual speech'],
    what_you_learn: [
      'Choose between は and が, and ある and いる',
      'Use よ and ね to sound natural, not pushy',
      'Use あげる, くれる and もらう from the right point of view',
      'Hear the different meanings of 大丈夫, including a polite no',
      'Order, apologise and say no politely in real situations',
      'Use casual じゃん and やばい the way natives do',
    ],
    curriculum: [
      { title: 'Core grammar nuance', topics: [
        'ある vs いる',
        'い-adjectives vs な-adjectives',
        'あげる, くれる and もらう',
        'は vs が',
        'The particle よ',
        'The particle ね',
      ] },
      { title: 'Everyday situations', topics: [
        'Restaurant phrases',
        'すみません, ごめん and apologising',
        'The many meanings of 大丈夫',
        'Saying no without いいえ',
      ] },
      { title: 'Praise and compliments', topics: ['Replying when told 上手', 'Complimenting men and women', 'How かわいい is used'] },
      { title: 'Casual speech and slang', topics: [
        'Four uses of じゃん',
        'やばい, good and bad',
        "Top 5 young people's slang words",
        'Can you use anime phrases in real life?',
        'おじさん構文 texting style',
        'レロレロ from JoJo',
      ] },
      { title: 'Culture and extra words (optional)', topics: [
        'Katakana English (和製英語)',
        '告白: love-confession culture',
        'The thunder god and your おへそ',
        'Superstitions that surprise foreigners',
        'ぴちぴち and beauty standards',
      ] },
    ],
    total_duration_sec: 16650,
    videos: ONOMAPPU_NATURAL_JAPANESE_VIDEOS,
    last_synced_at: null,
    is_featured: false,
    sort_order: 8,
  },
]

const LEVELS: ApiJlptLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1']
const RAIL_SIZE = 3

function channelOf(course: SeedCourse): SeedChannel {
  const channel = channels.find(c => c.slug === course.channel_slug)
  if (!channel) throw new Error(`Seed course ${course.slug} has no channel ${course.channel_slug}`)
  return channel
}

function toCard(course: SeedCourse): ApiClassCourseCard {
  const channel = channelOf(course)
  return {
    slug: course.slug,
    title: course.title,
    summary: course.summary,
    level: course.level,
    platform: course.platform,
    is_free: course.is_free,
    is_featured: course.is_featured,
    thumbnail_url: course.thumbnail_url,
    video_count: course.videos?.length ?? 0,
    total_duration_sec: course.total_duration_sec,
    tags: course.tags,
    channel: {
      slug: channel.slug,
      name: channel.name,
      avatar_url: channel.avatar_url,
      accent_color: channel.accent_color,
      subscriber_count: channel.subscriber_count,
    },
  }
}

/** Same order as the API: featured first, then sort_order, then title. */
function ordered(list: SeedCourse[]): SeedCourse[] {
  return [...list].sort(
    (a, b) => Number(b.is_featured) - Number(a.is_featured) || a.sort_order - b.sort_order || a.title.localeCompare(b.title),
  )
}

export function mockClassesList(filters: ClassesFilters): ApiClassesList {
  const items = ordered(courses).filter(
    c =>
      (!filters.level || c.level === filters.level) &&
      (!filters.platform || c.platform === filters.platform) &&
      (!filters.freeOnly || c.is_free),
  )
  return {
    items: items.map(toCard),
    meta: {
      levels: LEVELS.map(level => {
        const count = courses.filter(c => c.level === level).length
        return { level, count, locked: count === 0 }
      }),
      stats: { course_count: courses.length, channel_count: channels.length },
    },
  }
}

export function mockClassDetail(slug: string): ApiClassCourseDetail | null {
  const course = courses.find(c => c.slug === slug)
  if (!course) return null
  const { channel_slug, is_featured: _featured, sort_order: _order, videos, ...fields } = course
  const others = ordered(courses).filter(c => c.slug !== slug)
  return {
    ...fields,
    videos: videos ?? [],
    channel: channelOf(course),
    more_from_channel: others.filter(c => c.channel_slug === channel_slug).slice(0, RAIL_SIZE).map(toCard),
    similar: others.filter(c => c.channel_slug !== channel_slug && c.level === course.level).slice(0, RAIL_SIZE).map(toCard),
  }
}
