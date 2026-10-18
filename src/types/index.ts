// ─── Navigation ───────────────────────────────────────────────────────────────

export interface DropdownItem {
  label: string
  href: string
}

export interface NavItem {
  label: string
  href?: string
  dropdown?: DropdownItem[]
  /** Flat links shown instead of the dropdown in the phone menu. */
  mobileLinks?: DropdownItem[]
}

// ─── Flashcard ────────────────────────────────────────────────────────────────

export interface FlashCardData {
  id: string
  character: string
  reading: string
  meaning: string
}

// ─── Curriculum ───────────────────────────────────────────────────────────────

export interface CurriculumCardData {
  id: string
  icon: string
  title: string
  description: string
  href: string
}

// ─── Interactive Widget ───────────────────────────────────────────────────────

export interface DragBlock {
  id: string
  character: string
  isCorrect?: boolean
}

export interface DragWidgetData {
  instruction: string
  targetWord: string
  dropZones: number
  prefilled: string
  blocks: DragBlock[]
}

// ─── Newsletter ───────────────────────────────────────────────────────────────

export interface NewsletterData {
  heading: string
  subheading: string
  decorativeChar: string
  buttonLabel: string
  placeholder: string
}

// ─── Footer ───────────────────────────────────────────────────────────────────

export interface FooterLink {
  label: string
  href: string
}

// ─── Hiragana ─────────────────────────────────────────────────────────────────

export type KanaType = 'basic' | 'dakuten' | 'compound' | 'foreign'

export interface KanaChar {
  id: string
  character: string        // full unicode character string
  romaji: string
  type: KanaType
  isEmpty?: boolean        // grid spacer / placeholder slot
  isCompound?: boolean     // two-part display (e.g. き + small ゃ)
}

export interface KanaSection {
  id: string
  title: string
  accentColor: 'primary' | 'tertiary'
  columns: number          // grid columns
  chars: KanaChar[]
}

// ─── Kanji ────────────────────────────────────────────────────────────────────

export type JlptLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1'

// ─── Quiz Config ──────────────────────────────────────────────────────────────

export type QuizCategory = 'kanji' | 'hiragana' | 'katakana' | 'grammar' | 'pyq'
export type QuizFilterMethod = 'chapter' | 'custom'
export type QuizJlptLevel = 'n5' | 'n4' | 'n3' | 'n2' | 'n1'

export interface QuizJlptOption {
  value: QuizJlptLevel
  label: string
}

export interface QuizCategoryOption {
  value: QuizCategory
  label: string
}

export interface QuizKanjiPreviewChar {
  character: string
  meaning: string
}

export interface QuizSelectableKanji {
  character: string
  selected: boolean
}

export interface QuizGrammarCard {
  id: string
  icon: string
  title: string
  description: string
}

export interface QuizConfigData {
  pageLabel: string
  heading: string
  subheading: string
  jlptLevels: QuizJlptOption[]
  categories: QuizCategoryOption[]
  kanjiPreview: QuizKanjiPreviewChar[]
  selectableKanji: QuizSelectableKanji[]
  grammarCards: QuizGrammarCard[]
  proTip: string
}

// ─── Quiz Game ────────────────────────────────────────────────────────────────

export type QuizQuestionType =
  | 'hiragana-to-romaji'
  | 'romaji-to-hiragana'
  | 'kanji-to-meaning'
  | 'kanji-to-onyomi'

export interface QuizQuestionData {
  id: string
  type: QuizQuestionType
  prompt: string          // The character or word shown to the user
  promptLabel: string     // Instruction text e.g. "What is the romaji reading?"
  correctAnswer: string   // Correct option value
  options: string[]       // Exactly 4 options (includes correct answer)
}

export interface QuizResultData {
  score: number
  total: number
  timeElapsed: number     // seconds
  missedQuestions: QuizQuestionData[]
  maxStreak: number
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export type AvatarKind = 'upload' | 'preset' | 'oauth' | 'default'

export interface ProfileAvatar {
  kind:     AvatarKind
  presetId: string | null
  /** A preset is a public path (pass it through asset()); upload/oauth URLs are absolute. */
  url:      string
}

export interface SessionLocation {
  countryCode: string | null
  region:      string | null
  city:        string | null
  latitude:    number | null
  longitude:   number | null
  /** 'gps' is the browser's position; 'ip' is approximate. */
  source:      'ip' | 'gps' | null
  accuracyM:   number | null
}

export interface DeviceSession {
  id:         string
  browser:    string
  os:         string
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown'
  /** Masked address such as 203.0.113.x; empty when unknown. */
  ipApprox:   string
  location:   SessionLocation
  /** True when the login came through a VPN, so an IP location may be wrong. */
  isVpn:      boolean | null
  isCurrent:  boolean
  createdAt:  string
  lastUsedAt: string
}

export interface UserProfile {
  id:             string
  username:       string
  email:          string
  firstName:      string
  lastName:       string
  bio:            string
  nativeLanguage: string
  countryCode:    string
  city:           string
  targetLevel:    JlptLevel | null
  timeZone:       string
  dailyReminder:  boolean
  reminderTime:   string
  avatar:         ProfileAvatar
  /** ISO timestamps. */
  joinedAt:       string
  lastLoginAt:    string | null
  lastLogin:      DeviceSession | null
}

/** Only the fields present are changed; '' clears an optional field. */
export interface ProfileUpdatePayload {
  firstName?:      string
  lastName?:       string
  bio?:            string
  nativeLanguage?: string
  countryCode?:    string
  city?:           string
  targetLevel?:    JlptLevel | ''
  timeZone?:       string
  avatarPreset?:   string
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  studyHours: number
  /** Answers on cards already introduced. */
  cardsReviewed: number
  /** Null until there is a leaderboard; hidden when null. */
  globalRank: string | null
  currentStreak: number
  jlptProgress: number   // 0–100: share of N5 items (kana included) mastered
  targetLevel: JlptLevel
}

/**
 * Accuracy per skill, 0–100. Grammar, vocabulary and speaking have no
 * questions yet and stay 0; the dashboard shows the skills that are asked.
 */
export interface SkillBalance {
  kanji: number
  grammar: number
  listening: number
  vocabulary: number
  /** Kana reading answers. */
  reading: number
  speaking: number
  kanaReading: number
  kanjiMeaning: number
  kanjiReading: number
}

export interface Milestone {
  id: string
  icon: string
  title: string
  subtitle: string
  progressValue: number
  progressMax: number
  colorClass: string
}

export type StudyLogStatus = 'completed' | 'in-progress'

export interface StudyLogEntry {
  id: string
  icon: string
  iconColorClass: string
  title: string
  subtitle: string
  date: string
  duration: string
  status: StudyLogStatus
  xp: number | null
}

export interface DayActivity {
  date: string     // ISO YYYY-MM-DD
  minutes: number  // study minutes; 0 = no activity
  /** Daily goal met (counts for the streak); from GET /progress/calendar. */
  goalMet?: boolean
}

export interface StreakCalendarData {
  activities: DayActivity[]
  currentStreak: number
  longestStreak: number
  totalActiveDays: number
  thisWeekMinutes: number
}

export interface DashboardData {
  stats: DashboardStats
  skillBalance: SkillBalance
  milestones: Milestone[]
  studyLog: StudyLogEntry[]
  streakCalendar: StreakCalendarData
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export type AuthTab  = 'login' | 'signup'
export type AuthStep = 'form' | 'registered' | 'forgot'

export interface LoginPayload {
  email:    string
  password: string
}
