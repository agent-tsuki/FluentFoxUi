/**
 * Copy for the homepage "Questions before you start" section (FaqSection).
 * Edit freely — each entry renders as one collapsible question.
 */

export interface FaqItem {
  /** Stable id (used as the list key). */
  id: string
  question: string
  answer: string
}

export interface FaqCopy {
  title: string
  items: readonly FaqItem[]
}

export const FAQ_COPY: FaqCopy = {
  title: 'Questions before you start',
  items: [
    {
      id: 'free',
      question: 'Is FoxSensei really free?',
      // sample — replace
      answer:
        'Yes. The core path — kana, N5 grammar, flashcards and quizzes — is free forever. ' +
        'If anything is ever paid, it will be an optional extra, never the lessons you need to progress.',
    },
    {
      id: 'beginner',
      question: "I don't know any Japanese. Can I start here?",
      answer: 'Yes. You start with hiragana — the 60-second lesson at the top of this page is literally step one.',
    },
    {
      id: 'time',
      question: 'How much time do I need each day?',
      // sample — replace ("about 15 minutes")
      answer:
        'A lesson plus review fits in about 15 minutes a day. Short daily sessions beat long weekly ones.',
    },
    {
      id: 'jlpt',
      question: 'Will this prepare me for JLPT N5 and N4?',
      // sample — replace (the honest-gaps sentence)
      answer:
        'The courses follow N5 and N4 chapter by chapter. Listening practice is still limited, ' +
        'so pair FoxSensei with a podcast or graded audio for that part of the exam.',
    },
    {
      id: 'install',
      question: 'Do I need to install an app?',
      answer: 'No. FoxSensei runs in your browser, on your phone or laptop.',
    },
  ],
}
