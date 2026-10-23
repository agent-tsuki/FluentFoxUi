/**
 * Bundled seed data for the Classes pages, in the exact API (snake_case) shape.
 *
 * Served by `classesService` only when the API cannot be reached; it mirrors
 * the seed migrations (real channel URLs, avatars, banners, intro videos,
 * playlist ids and thumbnails). Playlist videos are filled by a server-side
 * YouTube API sync, so they are empty here. There are no ratings or reviews.
 */
import type {
  ApiClassChannelProfile,
  ApiClassCourseCard,
  ApiClassCourseDetail,
  ApiClassesList,
  ApiJlptLevel,
} from '@/types/api'
import type { ClassesFilters } from '@/types/classes'

type SeedChannel = ApiClassChannelProfile

type SeedCourse = Omit<ApiClassCourseDetail, 'channel' | 'more_from_channel' | 'similar' | 'videos'> & {
  channel_slug: string
  is_featured:  boolean
  sort_order:   number
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
      'Hitoki is a native Japanese speaker who introduces the onomatopoeia used in everyday Japanese life, with visuals, sounds and short real-life stories. Most videos have Japanese, English and Chinese subtitles.',
    intro_video_id: null,
    subscriber_count: 436000,
    video_count: 149,
    accent_color: '#00897B',
    teaching_style:
      'Short, funny real-life stories told in slow, clear Japanese, each built around one onomatopoeia and how people actually use it. Subtitles in Japanese, English and Chinese.',
    best_for: ['Learners who know kana and basic grammar', 'Anime and manga fans', 'Learners who want listening practice with subtitles'],
    not_for: ['Absolute beginners who need English explanations', 'Learners preparing for a JLPT exam'],
    pros: [
      'Teaches onomatopoeia, which textbooks barely cover',
      'Native speaker who talks slowly and clearly',
      'Subtitles in Japanese, English and Chinese',
      'Entertaining stories about real life in Japan',
    ],
    cons: [
      'Mostly spoken in Japanese, hard for complete beginners',
      'Not a structured grammar course',
      'Some videos are culture vlogs rather than lessons',
    ],
    verdict: 'The most fun way to learn the sound words Japanese people use every day.',
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
    summary: 'Learn the sound words (ドキドキ, ゴロゴロ, ギリギリ…) that Japanese people use every day, through short stories in easy Japanese with subtitles.',
    level: 'N5',
    platform: 'youtube',
    url: 'https://www.youtube.com/playlist?list=PLNc4a4bdNUduYoRLzSZ-IxNENdWT3Fvy_',
    playlist_id: 'PLNc4a4bdNUduYoRLzSZ-IxNENdWT3Fvy_',
    is_free: true,
    price_note: 'Completely free on YouTube',
    thumbnail_url: 'https://i.ytimg.com/vi/1XhJo_c-uvA/hqdefault.jpg',
    tags: ['Vocabulary', 'Listening', 'Onomatopoeia', 'Culture'],
    what_you_learn: [
      'The onomatopoeia every Japanese person uses',
      'Words for feelings: ドキドキ, もやもや, ワクワク',
      'Words for food and textures: サクサク, カリカリ, プチプチ',
      'Everyday situations: ギリギリ, ぴったり, ぎゅうぎゅう',
      'Listening practice with natural, slow Japanese',
      'Culture and daily life in Japan',
    ],
    curriculum: [
      { title: 'Start here: words everyone uses', topics: ['Weird onomatopoeia you actually use', 'Onomatopoeia every Japanese person has used', '3 onomatopoeia that help you understand anime', 'What ドキドキ really means'] },
      { title: 'Feelings and moods', topics: ['もやもや: life full of unclear feelings', 'イチャイチャ', 'キレキレ vs キレた', 'ボロボロ: worn out', 'ワクワク, as Anya says it in Spy x Family'] },
      { title: 'Food and textures', topics: ['プチプチ textures', 'Natto onomatopoeia', 'サクサク: working like you eat cookies', 'カリカリ: crispy snacks', 'ヌルヌル: slippery'] },
      { title: 'Everyday life in Japan', topics: ['ギリギリ: only just made it', 'ぎゅうぎゅう: packed trains', 'ぴったり: arriving right on time', 'ノリノリ: surviving a Japanese party', 'Convenience store phrases'] },
      { title: 'Culture and stories', topics: ['Learning Japanese at a cat café', 'Snack bars for older people', 'Dating in the Heian period: こっそり', 'A Japanese superstition about lightning', 'Breaking school trip rules'] },
    ],
    total_duration_sec: 0,
    last_synced_at: null,
    is_featured: false,
    sort_order: 7,
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
    video_count: 0,
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
  const { channel_slug, is_featured: _featured, sort_order: _order, ...fields } = course
  const others = ordered(courses).filter(c => c.slug !== slug)
  return {
    ...fields,
    videos: [],
    channel: channelOf(course),
    more_from_channel: others.filter(c => c.channel_slug === channel_slug).slice(0, RAIL_SIZE).map(toCard),
    similar: others.filter(c => c.channel_slug !== channel_slug && c.level === course.level).slice(0, RAIL_SIZE).map(toCard),
  }
}
