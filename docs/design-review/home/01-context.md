# 01 — Product context: FoxSensei HOME PAGE (`/`)

Branch `claude/laughing-dirac-2bah0n` (merged with origin/main). Researcher: product-context-researcher. No repo files edited.
User request: home page "more engaging and eye-catching", "some promotion", "different content after login".

---

## 1. Product
- FoxSensei (repo FluentFoxUi): a free, browser-based Japanese course. The path is kana → JLPT kanji → N5 grammar chapters, plus server-graded spaced review (SRS), streaks and a progress dashboard. It also has a curated directory of outside video courses (`/classes`). Stack: React 18, Vite, Tailwind, React Router 6 (`package.json`, `CLAUDE.md`).
- **There is no paid plan.** The code has no pricing, Stripe or subscription logic (confirmed in `docs/design-review/06-user-info.md`). Every claim on the home page must stay "free".
- Level status:
  | Area | Live | Coming soon / locked | Source |
  |---|---|---|---|
  | Kana | Hiragana, Katakana | none | `src/lib/content/kana/scriptIds.ts`, `hiraganaUnits.ts`, `katakanaUnits.ts` |
  | Kanji | N5, N4 | N3, N2, N1 get `KanjiComingSoonPage` | `src/lib/content/kanji/levels.ts:23-29` |
  | Grammar / JLPT chapters | N5 (25 chapters) | N4, N3, N2, N1 are locked | `src/components/grammar/LevelSwitcher.tsx:7` (`LOCKED_GRAMMAR_LEVELS`) |
  | SRS tracks | hiragana, katakana, kanji_n5, vocab_n5, grammar_n5 | — | `src/lib/learn/paths.ts:9` |

## 2. Audience
- Total beginners: copy starts at "your first あ", and the hero CTA is "Find my starting point".
- Returning learners: they have a streak, due reviews and a dashboard.
- An earlier answer from the user (`docs/design-review/00-user-answers.md`) says: **"Both equally — guests see 'start here', signed-in users see 'continue'."** That matches this request ("different content after login").
- Device split is unknown (Cloudflare beacon only). Standards say design mobile-first (`06-user-info.md`).

## 3. Feature & nav map (live labels)
Navbar (`src/api/mock/navigation.ts`, `src/components/layout/Navbar/Navbar.tsx`):
| Item | Opens |
|---|---|
| Logo "FoxSensei" | `/` |
| **Kana ▾** | Hiragana `/kana/hiragana` (→ `/chart`), Katakana `/kana/katakana`, Kanji `/kanji` (→ last level or N5). Kanji sits under "Kana". |
| **JLPT ▾** (mega menu, `JlptMegaMenu.tsx`) | N5…N1 down the left. Each level shows Grammar / Vocabulary / Exercise / Listening, which open `/grammar/<lvl>/1[/tab]`. N4–N1 are shown locked. |
| **Quiz** | `/quiz` (test centre, RequireAuth guestPrompt). For signed-in users it shows a `DueBadge` with the reviews due now. |
| **Classes** | `/classes` (public, curated YouTube/Udemy/Website courses filtered by JLPT level) |
| Theme toggle | light/dark |
| Guest: **Sign in / up** | auth modal |
| Signed-in: StreakFire + "N day streak" pill (md+) | first click shows `StreakMonthPopup`, the second opens `/dashboard` |
| Signed-in: avatar menu | Profile, Dashboard, Admin (if permitted), theme, logout |
Footer: About, Privacy, Terms, Contact (`mailto:hello@foxsensei.com`, marked "sample — replace" in `src/lib/content/home/founder.ts:7`), plus the voice credit lines from `/audio/info` (live: "Japanese voice: AivisSpeech:まお · …morioki · 花音 · まい · fumifumi · にせ · 阿井田 茂 · TANAKA · yukyu").

## 4. What `/` renders today

### Code path
`src/App.tsx:316` → `{ index: true, element: <HomePage /> }` (imported eagerly) → `src/pages/HomePage.tsx` → `src/components/sections/HomePage/ConceptHome.tsx`.
- In `App.tsx:132-157` the ambient petals/koi background and the MouseFollower are **turned off on `/`** on purpose ("the homepage … is deliberately calm").

`ConceptHome` (90 lines) contains only:
1. **Hero** (`#top`, `h-[100svh] min-h-[42rem]`).
   - Full-bleed illustrated photo: `/images/home/journey*.webp` in light mode, `changes*.webp` in dark (a night scene), chosen by `useUI().darkMode`.
   - `concept-hero-wash` overlay and `FallingPetals`.
   - Eyebrow pill: "A little curiosity goes a long way".
   - H1: "A little Japanese. / A whole *new world.*"
   - Body: "From your first あ to the stories you've always wanted to understand…"
   - Primary CTA **"Find my starting point →"**, which calls `useStartLearning().startLearning`.
   - Text link "See how it works ↓" (`#journey`), then the tagline "At your pace. On your own path."
2. **`HowItWorks`** (`#journey`, `HowItWorks.tsx` + `howItWorksDemos.tsx`; copy in `src/lib/content/home/howItWorks.ts`). Intro "Learn to read Japanese, one step at a time.", then 4 numbered steps, each with a small local "Try it" demo that never touches progress:
   - 01 Hiragana & katakana: "All 92 basic kana…". Demo: tap あいうえお.
   - 02 Kanji · N5 → N4: "79 N5 and 166 N4 kanji…", "N3–N1 coming soon." Demo: 木 → 林 → 森.
   - 03 N5 grammar: "25 illustrated N5 grammar chapters…". Demo: tile-order 私は / 学生です.
   - 04 Review & progress: SRS explainer, "Review and the dashboard need a free account." Demo: 山 multiple choice.
   - After the steps: "Prefer video lessons? Browse hand-picked courses by JLPT level →" (`/classes`).
   - Closing: "Start reading Japanese today." with CTA **"Start hiragana →"** (`/kana/hiragana`).
- Uses its own palette, `home-*` tokens (`tailwind.config.ts:9-27`, `--home-*` in `src/index.css`), and `concept-*` CSS classes, not the app `surface-*` tokens.

### Guest vs signed-in
| | Guest | Signed-in |
|---|---|---|
| Page body | ConceptHome as above | **Identical. Nothing in ConceptHome reads `user`.** |
| Navbar | "Sign in / up" | Streak pill, Quiz due badge, avatar |
| "Find my starting point" | Opens the **sign-up modal** (`useStartLearning.ts:17-20`). There is no placement test, so the label over-promises (also flagged in `06-user-info.md` assumption 5). | `navigate('/dashboard')` |
| "Start hiragana" (closing) | `/kana/hiragana` | same |

### Redirect after login?
**No automatic redirect from `/` to the dashboard.**
- Logging in from the home modal: `openModal('signup')` passes no `returnTo`, so `handleAuthenticated` (`AuthModal.tsx:158-168`) closes the modal and **stays on `/`**. Unverified users are the exception and go to `/verify-email`.
- Google/X OAuth uses `returnPath = pathname` (`AuthModal.tsx:41,146`), so it also returns to `/`. The service default `/dashboard` (`authService.ts:116,124`) only applies when no returnTo is passed.
- Only `VerifyEmailPage` (after 1.5s), `VerifyPendingPage` and `RedirectIfAuthed` send users to `/dashboard`. `RedirectIfAuthed` is not used on `/`.
- Result: a signed-in learner who lands on `/` sees the guest marketing page. That is the gap the user is pointing at.

### `/dashboard` (RequireAuth; `src/pages/dashboard/*`, sections in `src/lib/dashboard/sections.ts`)
- Layout: its own left sidebar (tabs on phones) showing due-now and streak (`DashboardLayout.tsx`).
- **Overview** (`OverviewPage.tsx`):
  - Greeting "Good morning, {firstName}." plus "You are X% of the way to JLPT N5".
  - 4 StatTiles: Streak (current/longest), Today's goal answers/goal, Due now plus minutes today, Avg answer time.
  - `TodayPanel`: "N reviews due", "Review all", and "Learn <track>" per track.
  - 30-day answers ColumnChart, RetentionCard, MasteryBars per track, LearningBalance radar, MilestoneList.
- Other sections: Activity, Kana, Kanji, Grammar (chapter progress), Review (forecast and recall), Weak spots (hard cards and mix-ups).
- **A signed-in home should not duplicate this.** It should be a short "continue" launchpad that links into it.

### Unused home section components (exported in `src/components/sections/HomePage/index.ts`, never imported)
| # | Component | Copy file | Purpose | Honesty caveats in its copy |
|---|---|---|---|---|
| 1 | `HomeHero` (+ `TryLessonCard`) | `lib/content/home/hero.ts` | Older hero: "Learn Japanese, *without the chaos.*", "Start learning free", plus an interactive **60-second lesson** (す, し → read すし, "2 of 46 hiragana learned"). | "No card needed" implies a paid tier exists. Otherwise real. |
| 2 | `LevelPicker` | `levels.ts` | "Where are you with Japanese right now?" 3 cards (can't read / can read kana / finished N5), each with a "Your first week" day plan. | The `n4` plan promises an "N5 check quiz" and "N4 chapter 1 grammar", **which do not exist** (N4 grammar is locked; there is no placement test). It also mentions "native audio", but the audio is AivisSpeech TTS. |
| 3 | `LearningPath` (+ `PathTrack`, `PathBoard`) | `path.ts` | Dark "train line" Kana → N5 → N4 → N3 (locked) with a reveal-the-meaning board. | File header: "SAMPLE VALUES — replace before launch". Chips are wrong: "12 chapters" N5 (real: 25), "10 chapters" N4 (no N4 grammar). Times and "spring 2027" N3 date are invented. "Notify me" has no backend. |
| 4 | `DashboardExample` | `dashboard.ts` | Static sample dashboard ("Good morning, Yuki", 7-day streak, topics to revisit, recent quizzes), labelled "Example dashboard". | Sample data, clearly labelled. Mentions "て-form", which is not in N5 content. |
| 5 | `WhyItWorks` | `why.ts` | 3 learning-science points: retrieval quizzes, spaced review, one clear next step. | Fine. |
| 6 | `ResourcesSection` | `resources.ts` | "Free courses hub": NHK Easy Japanese, Coursera, WaniKani, plus "Browse all" to `/classes`. | Has a `TODO(owner)` "COURSERA · SAMPLE UNIVERSITY". Duplicates `/classes`. |
| 7 | `FounderSection` | `founder.ts` | "Made by one learner" note from "Shivam", mailto feedback, "Recently shipped" changelog. | Name, intro, email and changelog dates are all "sample — replace". UIUX_STANDARDS §10 bans the dev name. |
| 8 | `FaqSection` | `faq.ts` | 5 `<details>` FAQs (free? beginner? time/day? JLPT? install?). | 3 answers are "sample — replace". The JLPT answer says "N5 and N4 chapter by chapter", but N4 grammar is locked. The "listening limited" line is now out of date because the Listening tab shipped. |
| 9 | `FinalCta` | `finalCta.ts` | Closing band "Your next five minutes: five new hiragana." with a がんばれ watermark. | References the TryLessonCard. |
Also unused, from an older template, and data from mock-only `interactiveService`/`curriculumService`: `sections/Newsletter` (email signup, no real backend), `sections/CurriculumGrid` ("Structured for Mastery … Haruki Murakami"), and `sections/InteractiveWidget/DragWidget`. These have no `.catch`, which breaks golden rule 3. **Do not revive them as they are.**

## 5. Real data available for a home page
| Data | Value | Source | Endpoint | Needs sign-in? |
|---|---|---|---|---|
| Hiragana | 104 kana in 13 units (46 basic + 25 dakuten + 33 combos) | `src/lib/content/kana/hiraganaUnits.ts` | bundled, or `/content/...` via `kanaContentService`/`contentSource` | No |
| Katakana | 132 kana in 15 units (adds long vowels/small ッ and 26 foreign sounds) | `katakanaUnits.ts` | same | No |
| "92 basic kana" | 46 + 46, the figure already used in copy | `howItWorks.ts` | — | — |
| Kanji | **N5 79 in 13 units; N4 166 in 21 units** (245 total) | `src/lib/content/kanji/generated/n5.index.json`, `n4.index.json` | `/content/kanji/{level}/index` with bundled fallback (`kanjiService.ts`) | No |
| Grammar | **25 N5 chapters** (`src/assets/grammar/n5/chapter-1..25.mdx`) | `grammarService` (mock list today; API `/content/grammar/{level}/chapters/{slug}`) | | No (reading) |
| Chapter vocabulary | **~585 word entries across 25 N5 chapters** (count of `w(` rows; may include repeats) | `src/lib/content/grammar/chapterVocab.ts` | `/content/grammar/n5/chapters/{slug}` | No |
| Exercise types | **Up to 19 per chapter**: 18 sets in 4 groups plus "Chapter review". Vocabulary: Word→English, English→word, How is it read?, Type the reading, Word in a sentence. Grammar: Choose the word, Fix the mistake, Fill the gap, True or false, Read and choose, Look and choose. Listening: Hear the word, Listen and choose, Listen and order, Listen and write. Build: Say it in Japanese, Put in order, Change the form, Write it. | `src/lib/learn/chapterPractice.ts:623-655` | built client-side from chapter content | Guests can view. Practice routes are gated. |
| Chapter tabs | Grammar · Vocabulary · Exercise · **Listening** | `src/lib/content/jlpt/levels.ts` | | No |
| Voices | Multi-voice cast (main/alt plus `voices` keys f1/m2…). Live credits list 9 AivisSpeech voices. | `audioService.ts` | `GET /audio/info`, `POST /audio/clips` are **public**; `POST /audio/speak` needs a verified user | info: No |
| Classes | Curated external courses by JLPT level and platform (YouTube/Udemy/Website), plus `meta.levels` and `meta.stats` counts | `classesService.ts`, `ClassesPage.tsx` | `GET /classes?level=&platform=&free=` (falls back to mock if unreachable) | No |
| Streak | current, longest | `ProgressOverview.streak`; `StreakFire` (pure CSS, `components/ui/StreakFire.tsx`) | `GET /progress/overview` | **Yes, verified** |
| Today | answers/goal, goal_met, due_now, new_kana_left, new_kanji_left, reviews_left, active_ms | `types/progress.ts:44` | `/progress/overview` | Yes |
| Review due | due_now, due_today, new_left_today, learned, **next_unit {title, slug}**, goal | `types/learn.ts:79` | `GET /learn/summary[?track=]` (`useLearnSummary`) | Yes |
| Per-track mastery | total_items, mastered_pct, retention_30d | `TrackOverview` | `/progress/overview` | Yes |
| JLPT progress | `jlptProgress` 0–100 (share of N5 items mastered), targetLevel, milestones, skill balance | `types/index.ts:166` | `GET /progress/dashboard` | Yes |
| Calendar / forecast / weak items | answers per day, forecast, weak items, confusions | `progressService.ts` | `/progress/calendar`, `/forecast`, `/weak`, `/weak-groups`, `/confusions` | Yes |
| Unit progress / tests | per-unit steps, test history | `learningPathService.ts` | `/learn/units`, `/learn/tests/history` | Yes. **Guests get an empty path; nothing is stored for them.** |
Hooks already exist and fetch nothing for guests: `useProgressOverview`, `useProgressDashboard`, `useProgressCalendar` (`hooks/useProgress.ts`), `useLearnSummary`, `TodayPanel`, `DueBadge`, `StreakFire`. The overview request is shared and cached with the navbar, so a signed-in home adds almost no cost.

## 6. What can honestly be "promoted"
**True today:**
- **100% free.** There is no paid plan. Don't add "No card needed", because it implies one.
- No install needed: it runs in the browser and is a PWA (`vite-plugin-pwa`).
- **Listening / voice:** a new Listening tab per chapter and audio for words and sentences, with a multi-voice Japanese cast (AivisSpeech, credited). Call it "natural Japanese voices", **not "native speakers"**.
- **19 ways to practise every chapter** (Exercise tab, commit `1ef5e2c`), with mastery and best scores.
- 25 illustrated N5 grammar chapters; ~585 chapter words.
- 245 kanji (N5 79 + N4 166) with stroke order, units, level tests and certificates. Kana certificates exist (`CERTIFICATE_TITLE`).
- Printable charts and worksheets (Downloads pages).
- Server-graded spaced review, streaks and dashboard (free account).
- Hand-picked video courses (`/classes`) by level.
- **Coming soon:** N4 grammar chapters; N3–N1 kanji and grammar. No dates exist in code (spring 2027 is a placeholder), so show "Coming soon" with no date.

**Never invent:** pricing or plans, testimonials, user/learner counts ("50k learners" was removed earlier for this reason, UIUX_PLAN), ratings, JLPT pass rates, press logos, founder identity or changelog dates.
**Conflict to flag:** UIUX_STANDARDS §11 still recommends a "Testimonials" section. **There are no real testimonials, so skip it or replace it with product proof.**
Real numbers: 92 basic kana (104 hiragana / 132 katakana incl. extensions), 245 kanji (79 + 166), 34 kanji units, 25 chapters, ~585 words, 19 exercise types, 4 chapter tabs, 5 SRS tracks, 9 credited voices (live footer).

## 7. Live vs code (https://www.foxsensei.com/, fetched 2026-11-09, reachable, not blocked)
Screenshots (Playwright chromium, deviceScaleFactor 1, full page):
- `(session files, not committed) shots/home-1440-light.png` (3668px tall)
- `(session files, not committed) shots/home-1440-dark.png`
- `(session files, not committed) shots/home-390-light.png` (4902px tall)
- `(session files, not committed) shots/home-390-dark.png`
- `(session files, not committed) shots/home-390-light-fold.png` (first screen only)
- Script: `(session files, not committed) shoot.cjs`

Findings:
- **The live site matches the branch.** It shows ConceptHome: hero (sakura village by day; night scene in dark) → HowItWorks 4 steps with demos → classes line → "Start reading Japanese today" → footer. Nav labels match: Kana▾ JLPT▾ Quiz Classes, Sign in / up. No visible lag in structure. Signed-in state could not be captured (no test account).
- Observations for the design team:
  - Below the hero the page is **one flat beige (or navy) canvas**. Four near-identical white or navy demo cards, no surface alternation, no colour or imagery after the hero. This is the "not eye-catching" problem.
  - Nothing promotes the newest features (Listening, voices, 19 exercises), kanji counts beyond step text, or classes beyond one text line.
  - There is no social or product proof: no dashboard preview, no streak visual.
  - Two different primary CTAs: "Find my starting point" (opens sign-up) and "Start hiragana".
  - At 390px the hero body text runs over busy image detail and readability drops ("wanted to understand…" over the houses). The eyebrow pill wraps to 2 lines.
  - Hero is 100svh, so on desktop the first demo starts below the fold.
  - Footer voice credits are a long run-on line.

## 8. Design goals (translated from the user's words)
1. **Eye-catching:**
   - Keep the hero illustration (it is the brand asset). Add rhythm below it: alternate `home-canvas`/`home-tile`/a dark band (dark `surface-inverse` in both themes).
   - Use bigger Japanese glyphs as visual anchors and one motion moment (respect `prefers-reduced-motion`; the home page has ambient motion off on purpose).
2. **Some promotion (honest):**
   - A "What's new" strip or feature band: Listening + voices, 19 exercise types, kanji N4 now live, Classes.
   - A "real numbers" trust strip (92 kana · 245 kanji · 25 chapters · 19 exercises · free). State each number once (UIUX_STANDARDS §10).
   - A "Coming soon: N4 grammar, N3–N1" roadmap chip, with no dates.
3. **Different content after login:**
   - Branch ConceptHome on `useAuth().user`. Signed-in users get a compact **"Continue" launchpad**:
     - greeting
     - StreakFire + streak
     - due reviews CTA (`useLearnSummary.due_now`, "Review all")
     - **next unit** (`summary.next_unit`)
     - today's goal ring
     - JLPT N5 % (`/progress/dashboard`)
     - "what's new" cards
     - link to the full dashboard
   - Reuse `TodayPanel`/`StatTile`/`DueBadge`; do not rebuild the dashboard. Decide whether `/` should redirect (default: no, see Unknowns).
4. **One next step per state:**
   - Guest: one primary CTA ("Start free with hiragana", or open sign-up). Rename or fix "Find my starting point".
   - Signed-in: "Review N due" when due > 0, else "Continue: <next unit>".
5. **Progressive disclosure:** keep the 4 demos (they are the best interactive proof). The TryLessonCard (60-second lesson) is a strong unused hero candidate.
6. Every async block on the signed-in home gets loading/error/empty states (`AsyncBlock`), dark-mode parity, 44px targets, and `lang="ja"`.
7. **Token decision:** stay on `home-*` for the home page (current), or move to app `surface-*`. This is an open question (06 assumption 2).

## 9. Agents / skills (`.claude/agents/`)
| Agent | Enforces |
|---|---|
| frontend-architect | Structure, state, data-flow layering (component → hook → service), folder placement |
| component-builder | New reusable, accessible, token-only primitives |
| refactor-consolidator | Removes duplication and migrates call sites to `src/components/ui` primitives |
| perf-optimizer | Lazy loading, bundle size, memo, images. The home page is eager, so a signed-in branch must lazy-load its widgets. |
| frontend-reviewer | Pre-merge check against FRONTEND_STANDARDS (strict TS, tokens, states, a11y) |
| ui-ux-reviewer | Colour/contrast, dark parity, elevation, type, motion, premium/minimal (UIUX_STANDARDS) |
| responsive-auditor | 320–1440 breakpoints, touch targets, fluid type, reduced motion |
| product-context-researcher | This briefing |
| design-auditor | Token/type/component inventory with screenshots |
| design-cross-examiner | Verifies other reviews, rules on reuse, reconciled TOP 15 |
| user-intent-evaluator | ≤4 multiple-choice questions plus defaults |
| design-manager | Final QA, coverage matrix, top 5 corrections |
**Gaps no agent covers:**
- (a) **Copy and honesty:** checking that marketing claims and numbers match the data (sample copy in `lib/content/home/*`). Suggestion: make cross-examiner check numbers against §5.
- (b) Conversion and analytics: there are no events beyond the Cloudflare beacon, so the effect of a redesign cannot be measured.
- (c) SEO/meta for `/` (`scripts/seo` exists, but no agent owns it).
- (d) Illustration and image art direction (hero webp assets).
- (e) Signed-in test fixtures: no agent can screenshot a logged-in state without credentials or a mock.

## 10. Unknowns only the user can answer (with defaults)
1. **Signed-in `/`:** a "continue" launchpad on `/`, or auto-redirect to `/dashboard`? *Default: launchpad on `/`, no redirect (the logo still works as "home").*
2. **What to promote first:** Listening/voices, 19 exercises, Kanji N4, Classes, or "N4 grammar coming soon"? *Default: one "What's new" band featuring Listening + 19 exercises, with Classes and Coming-soon as secondary.*
3. **Founder story and contact:** is "Shivam" / `hello@foxsensei.com` / the changelog real and allowed on the page? *Default: leave FounderSection out until confirmed.*
4. **Visual intensity:** keep the calm illustrated style and add more colour bands, or go more playful (fox mascot, badges)? *Default: calm but richer, as in 00-user-answers "Calm, but clearer".*
5. Release dates for N4 grammar / N3: *Default: "Coming soon", with no date.*
6. A newsletter or "notify me" needs a backend endpoint that doesn't exist. *Default: omit.*
7. Primary guest CTA wording, since "Find my starting point" has no placement test behind it. *Default: "Start free — learn hiragana", or revive the LevelPicker with its copy corrected.*

---

## Summary
1. `/` → `HomePage` → `ConceptHome`: illustrated full-screen hero plus a 4-step "How FoxSensei works" with local demos, a classes line and a "Start hiragana" CTA.
2. Signed-in users see the **same page**. Only the navbar changes (streak, due badge, avatar), and there is no redirect to `/dashboard` after login from home.
3. "Find my starting point" just opens sign-up for guests (no placement test) and goes to `/dashboard` for members.
4. 9 unused home sections (HomeHero+TryLessonCard, LevelPicker, LearningPath, DashboardExample, WhyItWorks, ResourcesSection, FounderSection, FaqSection, FinalCta) plus old Newsletter/CurriculumGrid/InteractiveWidget. Many contain "sample — replace" or false copy (12 chapters, N4 grammar, spring 2027, Shivam).
5. Real numbers: 92 basic kana (104 hiragana / 132 katakana), 245 kanji (N5 79 + N4 166), 25 N5 chapters, ~585 words, 19 exercise types, 4 chapter tabs, 9 credited voices.
6. Live: kana, N5/N4 kanji, N5 grammar. Locked or coming soon: N4–N1 grammar, N3–N1 kanji.
7. Signed-in data (streak, due, next_unit, goal, JLPT %) comes from `/progress/*` and `/learn/summary`, which need a verified login. Hooks already exist and skip guests.
8. Public data: content, `/classes`, `/audio/info`.
9. No paid plan, testimonials or user counts exist: promote "free", Listening/voices, 19 exercises, kanji N4 and Classes honestly.
10. The live site matches the branch. Below the hero it is a flat single-tone canvas with 4 samey cards, no promotion or product proof, and weak hero text contrast on mobile.
11. Goals: richer section rhythm, an honest "What's new" plus a numbers strip, and a signed-in "Continue" launchpad reusing TodayPanel/StreakFire/DueBadge, with one next step per state.
12. Open questions: launchpad vs redirect, what to promote, founder/contact reality, visual intensity, guest CTA wording.
