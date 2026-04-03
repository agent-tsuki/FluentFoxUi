import type { DragWidgetData, NewsletterData } from '@/types'

export const mockDragWidget: DragWidgetData = {
  instruction: 'Drag to form: "Konnichiwa"',
  targetWord: 'こんにちは',
  dropZones: 5,
  prefilled: 'こ',
  blocks: [
    { id: 'n', character: 'ん' },
    { id: 'ni', character: 'に', isCorrect: true },
    { id: 'chi', character: 'ち' },
    { id: 'ha', character: 'は' },
  ],
}

export const mockNewsletter: NewsletterData = {
  heading: 'Small steps, daily growth.',
  subheading: 'Get one free Kanji lesson in your inbox daily. No spam, just pure wisdom.',
  decorativeChar: '学',
  buttonLabel: 'Subscribe',
  placeholder: 'Your email address',
}
