/**
 * Copy for the homepage "Who's behind this" section (FounderSection) and the
 * site-wide contact address (also used by the footer "Contact" link).
 * Edit freely — the component renders whatever is here.
 */

/** Where learners can reach the maker. Used by FounderSection and the footer. */
export const CONTACT_EMAIL = 'hello@foxsensei.com' // sample — replace

/** Ready-made `mailto:` link for the footer and generic contact links. */
export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}`

export interface ShippedItem {
  /** Short date label, e.g. "Oct 2026". Must be unique (used as the list key). */
  date: string
  what: string
}

export interface FounderCopy {
  eyebrow: string
  title: string
  /** First name shown in the intro; its first letter becomes the avatar initial. */
  name: string
  /** First-person intro, shown after "Hi, I'm {name}." */
  intro: string
  feedbackLabel: string
  /** Subject line pre-filled in the feedback email. */
  feedbackSubject: string
  shippedHeading: string
  shipped: readonly ShippedItem[]
}

export const FOUNDER_COPY: FounderCopy = {
  eyebrow: "Who's behind this",
  title: 'Made by one learner, for learners.',
  name: 'Shivam', // sample — replace
  // sample — replace
  intro:
    "I started learning Japanese because I wanted to read and understand it without subtitles. " +
    'Most apps I tried hid the grammar behind streaks and paywalls, so I built the path I wished I had. ' +
    'My promise: the core path — kana, grammar and quizzes — stays free.',
  feedbackLabel: 'Tell me what to build next →',
  feedbackSubject: 'FoxSensei — what to build next', // sample — replace
  shippedHeading: 'Recently shipped',
  // sample — replace (dates and items)
  shipped: [
    { date: 'Oct 2026', what: 'Sign in with Google or X in one tap.' },
    { date: 'Sep 2026', what: 'N5 grammar chapters with examples you can copy.' },
    { date: 'Aug 2026', what: 'Hiragana chart and a quick quiz to check yourself.' },
  ],
}

/** `mailto:` link for the feedback CTA, with the subject pre-filled. */
export const FEEDBACK_MAILTO = `${CONTACT_MAILTO}?subject=${encodeURIComponent(FOUNDER_COPY.feedbackSubject)}`
