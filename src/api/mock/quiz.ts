import type { QuizConfigData } from '@/types'

export const mockQuizConfig: QuizConfigData = {
  pageLabel: 'Study Session',
  heading: 'Configure Your Path.',
  subheading:
    'Design your perfect learning rhythm. Select your focus area and calibrate the difficulty to match your current proficiency.',
  jlptLevels: [
    { value: 'n5', label: 'JLPT N5 (Basic)' },
    { value: 'n4', label: 'JLPT N4 (Intermediate)' },
    { value: 'n3', label: 'JLPT N3 (Advanced)' },
    { value: 'n2', label: 'JLPT N2 (Pre-Fluent)' },
    { value: 'n1', label: 'JLPT N1 (Mastery)' },
  ],
  categories: [
    { value: 'kanji', label: 'Kanji' },
    { value: 'hiragana', label: 'Hiragana' },
    { value: 'katakana', label: 'Katakana' },
    { value: 'grammar', label: 'Grammar' },
    { value: 'pyq', label: 'Prev. Year' },
  ],
  kanjiPreview: [
    { character: '日', meaning: 'Sun / Day' },
    { character: '月', meaning: 'Moon / Month' },
    { character: '火', meaning: 'Fire' },
    { character: '水', meaning: 'Water' },
  ],
  selectableKanji: [
    { character: '日', selected: true },
    { character: '月', selected: true },
    { character: '火', selected: true },
    { character: '水', selected: true },
    { character: '木', selected: false },
    { character: '金', selected: false },
    { character: '土', selected: false },
    { character: '山', selected: false },
    { character: '川', selected: false },
    { character: '田', selected: false },
    { character: '人', selected: false },
    { character: '口', selected: false },
    { character: '目', selected: false },
    { character: '手', selected: false },
    { character: '足', selected: false },
    { character: '力', selected: false },
    { character: '大', selected: false },
    { character: '小', selected: false },
    { character: '中', selected: false },
    { character: '上', selected: false },
  ],
  grammarCards: [
    { id: 'chapter', icon: 'history_edu', title: 'Chapter', description: 'Select lesson range' },
    { id: 'time', icon: 'schedule', title: 'Time & Date', description: 'Days, months, hours' },
    { id: 'counters', icon: 'calculate', title: 'Counters', description: 'Specific object units' },
  ],
  proTip:
    '"The key to Kanji is not memorization, but recognition of the radicals. Focus on the core building blocks today."',
}
