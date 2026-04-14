// ─── Navigation ───────────────────────────────────────────────────────────────

export interface DropdownItem {
  label: string
  href: string
}

export interface NavItem {
  label: string
  href?: string
  dropdown?: DropdownItem[]
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

export type KanaType = 'basic' | 'dakuten' | 'compound'

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

export interface KanjiChar {
  id: string
  character: string
  meaning: string          // English meaning
  onyomi: string           // 音読み (Chinese-derived reading)
  kunyomi: string          // 訓読み (native Japanese reading)
  strokes: number
  jlpt: JlptLevel
}

export interface KanjiGroup {
  id: string
  level: JlptLevel
  title: string
  description: string
  chars: KanjiChar[]
}

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

export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  location: string
  bio: string
  nativeLanguage: string
  targetLevel: JlptLevel
  joinedDate: string
  isPro: boolean
  gender?: 'male' | 'female'
  profileImage?: string
}

export interface ProfileUpdatePayload {
  firstName: string
  lastName: string
  email: string
  location: string
  bio: string
  nativeLanguage: string
  targetLevel: JlptLevel
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  studyHours: number
  cardsReviewed: number
  globalRank: string
  currentStreak: number
  jlptProgress: number   // 0–100
  targetLevel: JlptLevel
}

export interface SkillBalance {
  kanji: number
  grammar: number
  listening: number
  vocabulary: number
  reading: number
  speaking: number
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
export type AuthStep = 'form' | 'otp' | 'forgot' | 'registered'

/**
 * Payload collected by the SignUpForm and sent to POST /auth/register.
 * Field names use camelCase inside the app; authService maps them to
 * the snake_case names the server expects.
 */
export interface SignUpPayload {
  firstName:   string
  lastName:    string
  userName:    string
  email:       string
  nativeLang:  string
  phoneNumber: string
}

export interface LoginPayload {
  email:    string
  password: string
}

export interface OtpVerifyPayload {
  email: string
  code:  string
}

export interface OtpResponse {
  success: boolean
  message: string
}
