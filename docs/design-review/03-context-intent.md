# Agent 3: Context & Intent Research (FoxSensei)

Sources: CLAUDE.md, ONBOARDING.md (an empty team template), docs/* (FRONTEND_STANDARDS, UIUX_STANDARDS, PLAN, UIUX_PLAN, CLASSES_UI_SPEC), package.json, src/App.tsx, src/components/grammar/*, src/assets/grammar/n5/chapter-2.mdx, src/lib/content/*, and a live render with Playwright and headless Chrome on 2026-11-09 (desktop 1440 and mobile 390). Live extracts and screenshots are in `(session files, not committed) live/`.

---

## 1. Product
- **FoxSensei** (repo name FluentFoxUi) is a free web app for learning Japanese, live at www.foxsensei.com. It is built with React 18, strict TypeScript, Vite 5, Tailwind 3, React Router 6, Zustand and framer-motion. It is a PWA and talks to a real backend at `api.foxsensei.com`, with assets served from `cdn.foxsensei.com`.
- **Core promise**, from the live home page: "Learn to read Japanese, one step at a time." The path runs kana → JLPT kanji → N5 grammar, with spaced review ("a few minutes of review a day") holding it together. The server grades answers and stores streaks and progress.
- **Brand and tone**: calm, premium, "authentically Japanese". The one accent colour is fox orange. Brand visuals include the fox mascot, kana, koi, sakura petals and がんばれ. UIUX_STANDARDS §0: "Restraint over decoration. Remove before you add."
- **Access model**: guests can browse charts, unit pages, kanji pages and grammar notes. Practice, quizzes, tests, review and the dashboard need a signed-in, verified account (`RequireAuth guestPrompt`). Grammar completion is saved in localStorage for guests and on the server for signed-in learners.

## 2. Audience
- **Mostly absolute beginners and false beginners**: "From your first あ…". The first CTA, "Start hiragana", needs no account. Content depth is greatest at the bottom of the ladder:
  - Kana: hiragana and katakana, 104 chart entries each including dakuten and yōon.
  - Kanji: N5 (79 kanji, 13 units) and N4 (166). N3–N1 are "Soon".
  - Grammar: N5 only (25 chapters). N4–N1 are locked "coming soon" levels with a "Unlock Pro Deck" button, but Pro is not built yet; the button opens sign-up.
- **Secondary audience**: learners heading toward the JLPT who want structure (the JLPT mega-menu, level tests, certificates) and people who prefer video ("Classes", hand-picked YouTube and Udemy courses sorted by JLPT level).
- **Admin and teacher users**: `/admin/*` (channels, courses, teachers, permissions, audio). This is separate from the learner UX.
- Implication: the main reader is someone **who doesn't know what they don't know yet**. Wayfinding ("where am I, what's next") matters more than having lots of features.

## 3. Feature and nav map
**Top nav, live and in `src/api/mock/navigation.ts`**: `Kana ▾` (Hiragana, Katakana, Kanji) · `JLPT ▾` (a mega-menu: levels N5–N1 → that level's chapters/sections, plus "Not sure of your level?") · `Quiz` · `Classes`. On the right: the theme toggle and "Sign in / up". When signed in, the right side shows a streak pill with a calendar popover, Dashboard and an avatar menu. On mobile everything sits behind a hamburger drawer. Footer: About, Privacy, Terms, Contact.
- Problem: **Kanji sits under "Kana"**, and **Grammar has no top-level label**. It is reached only through "JLPT".

| Area | Routes | Sub-nav (live labels) |
|---|---|---|
| Home | `/` | Hero ("A little Japanese. A whole new world.", CTA "Find my starting point", plus "See how it works") → HowItWorks (01 Read the kana · 02 Build up kanji · 03 Put words into sentences · 04 Keep what you learn; each has a "Try it" mini-demo) → closing CTA "Start reading Japanese today" |
| Kana course | `/kana/{hiragana,katakana}/{chart,learn,tests,downloads}` plus practice/:mode, test, skip/:scope | **Chart · Learn · Check · Print** (the labels differ from the route names `tests`/`downloads`) |
| Kanji course | `/kanji/{n5,n4}/{,reviews,browse,tests,downloads}`, `/kanji/:char`, N3–N1 show a coming-soon page | N5/N4/N3 Soon… level pills, then **Course · Reviews · Browse · Tests · Downloads**. The Course tab shows a "TODAY · Unit 1" card, units grouped by theme, "Test out" and "Know N5? Test out" |
| Grammar (JLPT) | `/grammar/:level/:chapterId?/:tab?`, `/jlpt/*` → redirects to `/grammar/<lvl>/1` | Chapter tabs **Grammar · Vocabulary · Exercise · Listening** |
| Quiz / Test center | `/quiz` (auth) | A setup → testing → results state machine (`components/testCenter/*`): subject, level, scope, question types and length. Ungraded |
| Learn/Review | `/learn/lesson/:track`, `/review`, `/learn/how-grading-works` | Lessons and reviews graded by the server (SRS) |
| Classes | `/classes`, `/classes/:teacherId` | Filter bar and course grid (spec: docs/CLASSES_UI_SPEC.md) |
| Dashboard | `/dashboard/{,activity,kana,kanji,grammar,review,weak-spots}` (auth) | A left sidebar on desktop, tabs on phones |
| Account | `/profile` (with a `?tab=learning` setting), verify-email, reset-password, OAuth callback | |

**Unused home sections.** Nine section components in `src/components/sections/HomePage/` are not rendered on the live home page: LevelPicker ("Start where you are"), TryLessonCard, FaqSection, FounderSection, ResourcesSection, LearningPath/PathBoard/PathTrack, DashboardExample and WhyItWorks. The home page is now only Hero plus HowItWorks (`ConceptHome.tsx`), and it lives on the `home-*` token set (`bg-home-canvas`, `text-home-ink`, `home-accent`). The home section table in UIUX_PLAN.md (StatsBar, Testimonials, globe…) is **out of date** and describes a home page that no longer exists.

## 4. Grammar chapter anatomy and learner flow
**Where the content comes from.** Chapter content lives in `src/assets/grammar/n5/chapter-N.mdx` (frontmatter plus `## Concept NN:` sections, `> **Key Rule**` blockquotes, example bullets with Japanese / romaji / English, `<InteractiveWord kanji reading meaning/>`, a "Sidebar: Cultural Nuance" section and a "Chapter N Vocabulary Grid" table). The path to the screen is: `utils/mdxParser` → `api/services/grammarService` → hooks `useGrammarChapters` (the list) and `useGrammarChapter` (one chapter, with the next one prefetched). Illustrated "boards" are `/images/grammar/n5/boards/n5_ch_two.webp`, with a `-768` version for phones (`lib/content/grammar/boards.ts`). Per-chapter visual specs live in `components/grammar/ChapterVisual.tsx`, in a `visuals` map. The Vocabulary, Exercise and Listening tabs pull from the **learn API** (`useChapterContent`, `chapterQuestions`), not from the MDX file.

**What N5 chapter 2 teaches: "Demonstratives & Possession."** Description: "Learn to identify objects, indicate distance, confirm information, and talk about who things belong to."
1. Demonstrative nouns これ・それ・あれ (the ko-so-a-do distance system)
2. Demonstrative adjectives この・その・あの (each must be followed by a noun)
3. Confirming: はい、そうです / いいえ、違います
4. Alternative questions 〜ですか、〜ですか
5. の, expanded: topic/content ("a book about computers") and ownership
6. の as a noun substitute ("サントスさんのです"); it can stand for things, never people
- Then a Cultural Nuance section (これ vs この, the polite お- prefix, the falling pitch of そうですか) and 8 vocabulary words (これ, それ, あれ, 辞書, 傘, 本, ボールペン, お土産).
- Visual primer: the "Distance map · Choose by distance" board (これ near me / それ near you / あれ far from both), plus a café scene illustration.

**Layout of the Grammar tab, from top to bottom (live, desktop):**
- Fixed left sidebar: "GRAMMAR COURSE", level switcher (N5 plus locked N4–N1), "Your Progress 0/25" bar, and a list of all 25 chapters with "Currently studying".
- In the main column:
  1. Eyebrow "N5 · CHAPTER 2 · Demonstratives & Possession"
  2. Tab bar
  3. Breadcrumb "N5 COURSE › CHAPTER 2 › GRAMMAR NOTES" next to a "Show All Hints" toggle
  4. "CHAPTER 2" pill
  5. H1 and description
  6. Six concept overview pills (in-page anchors)
  7. Distance-map board
  8. Concept cards 01–06, each with a colour accent chosen by keywords in its title, "n / 6", a Key Rule box, notes and example sentences with "HIDE" toggles for the translations
  9. A right column with "CHAPTER VOCABULARY 0/8" (tap a word to mark it mastered, saved in localStorage) and "CULTURAL INSIGHT"
  10. "Mark Chapter 2 as Complete" (fires confetti)
  11. Previous / Next chapter links
- **Mobile**: the sidebar becomes a sticky bar with the level switcher, "‹ Chapter 2 of 25 ⌄ ›" (which opens a bottom sheet, `ChapterSheet`) and the tabs.

**Other tabs:**
- **Vocabulary**: "Words in this chapter", a table (Word / Kana / …, with audio) and "Take the vocab quiz". The quiz needs an account (`LearnerOnly`).
- **Exercise**: a `PracticeIntro` card, "Practise this chapter", with two item types: "Fill the gap" and "What does it mean?". It runs `ChapterQuiz`, saves answers, adds the sentences to reviews, and can mark the chapter complete if the learner's setting says so.
- **Listening**: hear words and sentences and pick the meaning.

**How progress works:**
- Chapter `completed`: on the server for signed-in learners (`useChapterProgress`), otherwise in localStorage `ff-complete-<level>`.
- `exerciseBest`, `vocabBest`, `vocabPassed`: server only.
- Per-word "mastered" in the grammar notes sidebar: localStorage only (`ff-vocab-<level>-<id>`), a **third and separate** progress store.

**The intended learner flow** (from the code and copy): read the Grammar notes → (optionally) check the Vocabulary words and take the vocab quiz → do the Exercise (saved, feeds review) → Listening → mark complete → Next chapter. The UI **does not show this sequence**:
- The tabs look like equal peers, not steps.
- Nothing on the Grammar tab points to "now practise this" except the tab bar at the very top.
- "Mark complete" is a manual button that has nothing to do with whether the exercise was passed.

## 5. Live vs code (observations)
1. **Chapter identity is shown 3–4 times** before the content starts: the tab eyebrow, the breadcrumb, the "CHAPTER 2" pill and the H1 (the sidebar shows it a fifth time). On mobile, the level switcher, chapter picker, eyebrow, tabs and "Show All Hints" stack into about 5 rows of chrome above the H1. This is the "complex" half of the user's complaint.
2. **The page is long and evenly weighted.** The desktop grammar page is about 5,400px tall; mobile is about 8,800px. Six concept cards look the same, so there is no sense of progress through the page and no sticky "you are on concept 3 of 6".
3. **Content defects reach learners:**
   - Literal `**on/about**` and `**my**` asterisks are rendered in translations.
   - An authoring note is shipped as learner copy: "Make sure your design clearly separates these conceptual cards".
   - Concept 02's examples render as plain bullets (romaji shown, no HIDE toggle), unlike the other concepts.
   - There are empty sub-headings: "Affirmative Confirmation" and "1. Topic/Content Modification".
   - The MDX still says "Hover or toggle to reveal…" (hover-only wording).
4. **The document title isn't chapter-specific** on grammar pages ("FoxSensei — Learn Japanese Naturally"). Kana and kanji pages set their own ("Chart · Hiragana · FoxSensei").
5. **Sub-nav naming is inconsistent between courses**:
   - Kana: Chart / Learn / **Check / Print**
   - Kanji: Course / Reviews / Browse / **Tests / Downloads**
   - Grammar: Grammar / Vocabulary / Exercise / Listening
   - The kanji course has a "TODAY · next step" card. Grammar and kana have no equivalent.
6. **The nav taxonomy is muddled**: Kanji sits under "Kana"; Grammar is hidden behind "JLPT"; "Quiz" (the test center) is a separate entry from each course's own Tests tab.
7. **The home CTA "Find my starting point" opens the sign-up modal** (`useStartLearning`). It does not run a placement or level picker, even though a LevelPicker component exists and is unused. The label promises something the action doesn't do.
8. The `ChapterTabs` JSDoc says "three parts" but there are four tabs. This is minor, but a sign the grammar module has grown piece by piece.
9. **Environment caveat:** in this sandbox, `api.foxsensei.com` and `cdn.foxsensei.com` are blocked by the egress proxy (403). So the live Vocabulary and Exercise tabs showed "Something went wrong" and the board image was broken in my screenshots. **These are not production bugs**, but they show what the error states look like: a generic error with retry, inside an otherwise blank tab.
10. Docs drift: UIUX_PLAN's home table and FRONTEND_STANDARDS' "15 routes, no lazy loading" baseline are out of date. App.tsx already lazy-loads every route except Home and uses `LoadingState`/`ErrorState`/`EmptyState`. Treat UIUX_STANDARDS as **the rules** and UIUX_PLAN/PLAN as **partly done**.

## 6. Design goals derived from the user's intent
User: *"the page looks too simple and also complex; I want users to easily navigate and use the website."*

Read as: **too simple** = flat, samey, low hierarchy, no sense of journey or progress (long uniform card stacks, a home page that is a hero plus 4 steps). **Too complex** = too much chrome and repeated wayfinding, controls with equal visual weight, unclear taxonomy, and several parallel progress systems. Concrete goals:

1. **One clear "next step" on every screen.** Each page has a single primary action that matches what it says it does. For a guest, that is "Start hiragana" or "Continue Chapter 2 → Exercise". For a signed-in learner, it is "Continue where you left off". This mirrors the kanji "TODAY" card in kana and grammar.
2. **Say where you are once.** Collapse eyebrow + breadcrumb + pill + H1 into one compact header (level · chapter n/25 · title). On mobile, at most one sticky bar (chapter picker plus prev/next); the tabs scroll with the page or sit inside it.
3. **Make the chapter flow a sequence, not peer tabs.** Present Learn (notes) → Words → Practice → Listen as numbered steps with completion ticks. End the notes with a "Next: practise these 6 patterns" handoff. Tie "complete" to finishing the steps instead of a separate confetti button.
4. **Progressive disclosure inside long lessons.** Use a compact "On this page" stepper or sticky concept index (1/6…6/6), concepts that collapse or appear one at a time, and examples that start with the translation hidden. Vocabulary and cultural notes go in side panels or drawers, not full-height columns.
5. **Rhythm and hierarchy instead of uniform cards.** Vary concept presentation: the rule as the hero line, examples as a quieter list, the visual board as the anchor. Keep the restraint rules (one accent, type-led hierarchy, no stacked border+shadow+tint). Drop the keyword-based colour accents unless they carry meaning.
6. **One mental model for navigation.** Make the top nav match the learning path: **Kana · Kanji · Grammar (by JLPT level) · Practice/Tests · Classes**. Use the same sub-nav vocabulary across courses (for example Overview/Learn · Chart/Browse · Practice · Tests · Downloads).
7. **One visible progress model.** Merge the chapter-complete flag, the notes-sidebar "mastered words" and the exercise/vocab bests into one "chapter progress" summary. Show progress the same way in the sidebar, the mobile picker and the dashboard.
8. **Honest affordances.** CTA labels match their behaviour ("Find my starting point" → a real level picker, or rename it). No hover-only wording. Locked levels say plainly what is available today.
9. **Designed states everywhere.** The Vocabulary and Exercise error and empty states should keep the learner moving ("Words couldn't load. Read the notes or try again") rather than leaving a dead tab.
10. **Accessibility and responsiveness stay non-negotiable** (UIUX_STANDARDS §9): touch targets ≥ 44px, works with no horizontal scroll at 320px, reduced motion, both themes, Japanese text selectable.

## 7. Agents and skills, and what each one enforces
`.claude/agents/`, all bound to docs/FRONTEND_STANDARDS.md and/or docs/UIUX_STANDARDS.md:

| Agent | Role | Rule it enforces |
|---|---|---|
| frontend-architect | plans, no bulk edits | Folder placement; state tool choice (Zustand / Context / data hook / useState); layering component → hook → service → apiClient\|mock; `import.meta.env` only in lib/config; one source of truth per concern; cite file:line |
| component-builder | builds primitives | Reuse before build; tokens only; named export, a `XProps` interface, variant maps, `className` merged last via `cn()`; files under ~150 lines; accessible by construction; one-line JSDoc; must typecheck |
| refactor-consolidator | migrates call sites | Behaviour- and visual-preserving migration onto shared primitives; list every call site first; small batches; delete the dead code; fix real bugs it finds and say so |
| perf-optimizer | bundle and render performance | Measure before and after; lazy routes and assets, manualChunks, memoize contexts and callbacks, no per-frame setState, `<img>` lazy with dimensions |
| frontend-reviewer | read-only review | The FRONTEND_STANDARDS checklist: reuse, tokens, loading/error/empty, performance, strict TS, a11y, structure/docs, correctness; must-fix vs nice-to-have |
| ui-ux-reviewer | read-only design review | UIUX_STANDARDS: tokens and dark-mode parity, WCAG AA contrast, one elevation language, type scale and one eyebrow recipe, spacing rhythm, radius and `<Icon>`, quiet motion with reduced-motion support, designed states; "prefer remove over add" |
| responsive-auditor | read-only responsive review | Breakpoints 320/375/768/1024/1440; mobile-first; fluid `clamp()` type; no overflow; touch targets ≥ 44px; no hover-only behaviour; drawer scroll-lock, Esc and focus trap; responsive images; dvh; reduced motion |

Other skills available to this session:
- **frontend-design:frontend-design**: aesthetic direction and distinctive, non-templated UI. Use it for a redesign concept; it must still obey the token and restraint rules.
- **artifact-design / Artifact tool** (quickstart → Design or Design System type): for publishing visual mock-ups or a design-system page for review. **artifact-diagramming** for flow or IA diagrams. **run** to launch the app for visual checks.
- Note: none of the agents owns **information architecture or wayfinding**, which is what this user request is mainly about. Pair frontend-architect (structure) with ui-ux-reviewer (hierarchy), and treat goals 1–7 above as the brief.

## 8. Unknowns only the user can answer
1. **Scope**: is the "too simple / too complex" concern about the grammar chapter page specifically, the whole site, or the home page too?
2. **Primary persona and success metric**: a guest who has never studied Japanese (conversion to sign-up) or a returning learner (chapter completion and daily review)? This decides what the single primary CTA is.
3. **Chapter flow**: should Grammar → Vocabulary → Exercise → Listening be a required sequence, or optional peers? Should "complete" be manual or earned by passing the Exercise?
4. **Top-nav taxonomy**: is it OK to rename or restructure it (for example a top-level "Grammar", moving Kanji out of "Kana", merging "Quiz" into "Practice")? Do the URLs need to stay stable?
5. **Home page**: keep the minimal concept home (Hero + HowItWorks), or bring back some unused sections (LevelPicker placement, FAQ, Founder, TryLesson)? What should "Find my starting point" actually do?
6. **Pro/paid plans**: is "Unlock Pro Deck" or paid N4+ grammar a real plan (it shapes how locked levels are presented), or should locked levels just say "coming soon"?
7. **Content edits**: may the designers or agents fix MDX copy (the stray `**`, the authoring note, the empty sub-headings), or does a content owner do that?
8. **Visual direction**: keep the current calm concept-home look (the `home-*` tokens, hero photography) as the reference for the inner pages, or unify the inner pages on the app `surface/*` tokens?
9. **Deliverable**: code changes in the repo, or design mock-ups (Artifact Design) for sign-off first?
10. **Devices**: what is the mobile vs desktop split? The grammar page is about 8.8k px tall on phones, so a mobile-first restructure could be the priority.
