# 02: Cross-examination (Agent 2)

Inputs: 00 (the user's answers, which are binding), 01, 03, 04 and 06. I checked them against the repo (`/home/user/FluentFoxUi`, branch `claude/laughing-dirac-2bah0n`) and against the live site.
New screenshots, now that the CDN and API load: `(session screenshots, not committed) shots-x/`
- `{d,m}-{light,dark}-g-{grammar,vocab,exercise,listening}-{fold,full}.png`
- `{d,m}-light-{kana-chart,kana-learn,kana-tests,kanji-course,kanji-detail,quiz}-*.png`
- `d-hints-on.png`, `d-menu-kana.png`, `d-menu-jlpt.png`, `m-drawer.png`, `m-sheet.png`

Scripts: `agents/xshots.js` and `agents/xprobe.js` (keyboard order, tooltip positions, hit sizes).
I computed contrast with the WCAG relative-luminance formula, using the token values in `src/index.css`.

## 0. Read this first: the repo is behind production

- `git log origin/main` has one more commit than the checked-out branch: `18517b9 "added voice"`, 17 files, +1723 lines.
- That commit rewrote `ChapterExercise.tsx` and **deleted `PracticeIntro.tsx`**.
- The live Exercise tab (`shots-x/d-light-g-exercise-full.png`) has four groups: Vocabulary, Confirm, Construct and Review. That makes 6 drills plus a "Chapter test". Guests can open all of them, and only the test needs sign-in.
- So every finding in 01 and 04 about PracticeIntro is about dead code: the `rounded-3xl` "fourth card recipe", "Practise this chapter (PracticeIntro.tsx:21)", and "Exercise is LearnerOnly".
- **Any redesign must be built on `origin/main`.**

## 1. Verdicts on the major claims

| # | Claim (source) | Verdict | Evidence |
|---|---|---|---|
| 1 | "Show All Hints" renders every tooltip off-screen (04 B1) | **CONFIRMED** | Live probe: all 15 portals at `left:0px; top:-12px` (`d-hints-on.png`). Cause: `tipPos` starts at `{0,0}` (`InteractiveWord.tsx:18`) and is only measured on hover, click or focus (`:24-45`), while `visible = showAll ‖ …` (`:21`). There is a second bug nobody mentioned: the positions are `fixed` and never re-measured on scroll or resize, so a tooltip opened by tap goes stale as soon as the page scrolls. |
| 2 | Japanese sentences have no `lang`/JP font (04 B3) | **CONFIRMED** | Probe on the first InteractiveWord: `lang=en`, `font-family: Inter`. The `mx-1.5` and `tracking-wider` come from `InteractiveWord.tsx:110,118`. |
| 3 | `on-primary` white on dark primary = 2.47:1 (01 P0-1) | **CONFIRMED** | Computed 2.47. **Missed:** kana and kanji already work around it with `dark:bg-primary-container` (white on #B35223 = **5.06:1**) in `ContinueCard.tsx:31` and `UnitStepItem.tsx:30`. Only grammar is broken. That makes it a token bug (fix `--on-primary` in dark mode, or alias the solid-fill role), not a component bug. |
| 4 | error 2.81, tertiary 2.4–2.5 on dark (01) | **CONFIRMED** | Computed 2.81 for error, and 2.38 / 2.49 for tertiary. |
| 5 | Muted `/50` ≈ 2.5:1, `/40` 2.03, `/60` 3.08 (01, 04) | **CONFIRMED** (one number slightly off) | Light: /40 2.03, /50 2.51, /60 **3.15**, /70 3.97. Dark: /50 3.00, /70 4.73. Mastered vocab rows at `opacity-40` measure 2.50. |
| 6 | "Currently studying" 2.33:1 (01) | **CONFIRMED** | 2.33 (`ChapterList.tsx:71`). |
| 7 | Borders invisible: outline-variant 1.71, /20 ≈ 1.1 (01) | **CONFIRMED** | 1.71 and 1.10 in light; 1.35 in dark. |
| 8 | Radius scale non-monotonic, md 6 > lg 4 (01 P1-15) | **CONFIRMED** | `tailwind.config.ts:133-136` overrides DEFAULT, lg and xl but not md, so Tailwind's default md (0.375rem) survives. The comment on line 132 says "monotonic" and does not list md. |
| 9 | Location stated 4× above the fold (01 #20, 04 B6) | **CONFIRMED on desktop; 01 OVERSTATED on mobile** | Desktop shows the kicker (`ChapterTabs.tsx:21`), breadcrumb (`GrammarContent.tsx:105`), "Chapter 2" pill (`:136`) and H1 (`:145`). The sidebar highlight makes a fifth. On mobile the breadcrumb is `hidden lg:flex` and the kicker drops the title (`sm:inline`), so it is **4, not 5**: kicker, "Chapter 2 of 25", pill, H1. The `<title>` is also generic ("FoxSensei — Learn Japanese Naturally"), while kana and kanji pages set their own. |
| 10 | Concept colours chosen by keywords: "teal ×3, orange-light, orange ×2" (01) / "teal, **blue** and orange" (04) | **BOTH WRONG in detail** | Concept 04 is "Alternative **Question**s", which hits the `question` branch first (`GrammarContent.tsx:26`), so it gets `secondary`, not fox-light. Concept 05 "Possessive" does not contain "possession", so it falls back to primary. Result: tertiary ×3, secondary ×1, primary ×2, and the fox-light branch never fires in chapter 2. `secondary` is terracotta #B15126 in light and **sakura pink** in dark, never blue. The core point (the colour means nothing) stands. |
| 11 | Concept pills are "in-page anchors" (03 §4) | **WRONG** (01 and 04 are right) | They are `<span>` elements (`GrammarContent.tsx:156`), and no concept `section` has an `id` (probe: `-,-,-,-,-,-`). So the `ANCHOR_OFFSET` maths in `GrammarPage.tsx:27` currently does nothing. |
| 12 | Phone chrome takes about 24% (04 B11) | **CONFIRMED, and worse on Listening** | Navbar 80px plus the two-row MobileGrammarNav (~120px) is about 200 of 844px (23.7%). On Listening, the sticky player bar wraps to 3 rows (~150px, `ChapterListening.tsx:443`, `m-light-g-listening-full.png`), so about **41%** of the screen is chrome. |
| 13 | Rail vocab duplicates the Vocabulary tab (04 B10) | **CONFIRMED, and understated** | They are not duplicates: they **disagree**. The rail lists **8** words from the MDX; the tab lists **25** words from the learn API (`d-light-g-vocab-full.png`). A learner who "masters 8/8" in the rail has seen a third of the list. |
| 14 | Exercise passing completes the chapter, "ChapterExercise.tsx:66-68" (04 B5) | **Right idea, wrong citation** | That file has 53 lines on this branch. On live (`origin/main`) only the server-marked "Chapter test" can complete the chapter, and the 6 drills "aren't saved". |
| 15 | Board image fails without a fallback (04 C10) | **CONFIRMED as a risk**, but it loads in prod | The board now renders (`d-light-g-grammar-fold.png`). A fallback is still needed. |
| 16 | MobileGrammarNav must be `fixed` because of the App's `overflow-x-hidden` (code comment `MobileGrammarNav.tsx:53`) | **STALE** | `App.tsx:181` now uses `overflow-x-clip`, and `sticky` already works elsewhere (`SectionNav.tsx:53`, `DashboardSidebar.tsx:85`). The fixed bar with a measured spacer can be deleted. |

## 2. Challenges to the proposed fixes

The biggest miss in 01 and 04: they inventoried `src/components/ui/` only. **The kana and kanji courses already ship most of the proposed components**, they follow the user's brief, and they look calmer and clearer than grammar (`shots-x/d-light-kana-learn-full.png`, `d-light-kanji-course-full.png`). Building new ones would break the CLAUDE.md "Reuse first" rule.

| Proposed (04) | Already exists | Ruling |
|---|---|---|
| `<LessonHeader>` | `kanaCourse/CourseHeader.tsx` (Eyebrow, display-sm H1 with `tabIndex=-1` focus target, one line, meta strip, ProgressBar) and `kanji/KanjiCourseHeader.tsx` | **Generalise CourseHeader** into a shared `CourseHeader` (props: eyebrow, title, description, meta, progress). Don't add a third header. |
| `<StepTabs>` with ticks | `learn/UnitStepTabs.tsx` (ticks, arrow-key tablist, quiz gate for guests), `learn/StepProgress.tsx` ("0 of 4 steps"), `learn/UnitStepItem.tsx` (numbered marker that becomes a tick), `kanaCourse/StatusIcon.tsx` | Grammar tabs are **routes** (`ChapterTabs` links); UnitStepTabs swaps content in place. So **don't reuse UnitStepTabs as is**. Instead extend `ChapterTabs` (or `CourseSectionNav`) with an optional `number` and `state` slot drawn by `StatusIcon`, and put `StepProgress` in the header. That gives the user's "1-2-3-4 with ticks, any tab reachable" with no new primitive. |
| `<ContinueBar>`, sticky at the bottom on phone | `kanaCourse/ContinueCard.tsx` ("Up next · Start / Continue", already has guest-vs-returning states), `KanjiTodayCard.tsx`, `learn/ActionLink.tsx` | **Keep the inline end-of-tab "Next step" (ActionLink). Reject the sticky phone version.** On Listening it would stack on the existing sticky player bar, and it adds a third fixed layer to the 24% of chrome we are trying to cut. Put a ContinueCard-style "Up next" at the **top** of the chapter for signed-in learners, as kana and kanji do. |
| `<OnThisPage>` scroll-spy rail | `classes/detail/CourseTabs.tsx` already does section scroll-spy; `kanaCourse/CourseRail.tsx` is a sticky rail | At 1024–1279px, a 288px chapter sidebar plus a 68ch column plus a third rail is cramped, and it adds clutter (00: "less clutter"). **Ruling:** turn the existing concept pills into real anchors (add ids; the scroll offset already exists). Add a rail only at `xl+`, reusing CourseTabs' scroll-spy logic. |
| `<LessonToolbar>` Furigana / Romaji / English | Listening already has its own **Normal · Hiragana · Hide** radiogroup plus Romaji and English `Switch`es (`ChapterListening.tsx:457-476`). Kanji keeps a separate furigana preference (`kanji/levelConfigs.ts:64`, `ff-kanji-*-furigana-v1`). | A grammar toolbar would be the **third** reading-preference system. Make **one** `useReadingPrefs` store (furigana, romaji, english) that Listening, Grammar and Kanji share. Extract Listening's hand-rolled radiogroup into `ui/SegmentedControl` (it is the missing primitive 01 named). |
| Inline furigana `<ruby>` | `lib/content/listening/rubyText.ts` already parses `漢字[かんじ]` into tokens with readings. Nothing renders `<rt>` yet (grep). | Do it: build `<Furigana>` on `rubyText`. **Caveat:** grammar MDX only marks the words wrapped in `<InteractiveWord>`; other kanji in the sentences (e.g. 本, 先生) have no reading data. Furigana coverage needs the content converted to the bracket notation, or the toggle will look broken on half the kanji. |
| Unbox the concepts into plain sections (04 B9) | | **Partly reject.** The user said the page is *too simple* and asked for "bigger, clearer headings and steps". Six unboxed prose sections on an 8.8k-px phone page read as one wall of text. Keep **one** container level, with no border+shadow+stripe stack: `UnitStepItem`'s numbered marker and connecting rail (the concepts become steps 1–6, ticked as you scroll past or open them), and examples on one quiet `surface-container-low` panel. That fixes box-in-box without going flat. |
| Move the level choice into the sheet (04 B11) | | **Agree**, and go further: there are three level-picker patterns (see P7). |
| `<ChapterNav>` sidebar kept on desktop | | Watch the keyboard cost. There is no skip link, and a Tab user goes through **7 nav stops + N5 + 25 chapter links** before reaching the chapter tabs (probe). Either collapse the chapter list into a disclosure ("Chapter 2 of 25 ▾", the same component on every breakpoint), or add a skip link and `aria-current`. |

## 3. Missed problems (not in 01, 03 or 04)

1. **Grammar is the outlier, not the template.** Kana and kanji use: CourseHeader → sticky CourseSectionNav → "Up next/Today" ContinueCard → grouped unit rows with StatusIcon → right rail. Grammar uses a fixed left card, a kicker, tabs, a breadcrumb, a pill and an H1. The user's scope ("redo lesson pages, grammar, kana, kanji") is best met by **moving grammar onto the course layout**, not by inventing a fourth one.
2. **The Japanese font mixes per glyph.** `font-jp` (Zen Maru) is subset to hiragana, 6 katakana (カガメラレン) and about 20 kanji (`fonts.css:300`). Any word with glyphs inside and outside the subset switches typeface mid-word.
   - 毎日 on the kanji page: 日 (U+65E5) is in the subset, 毎 is not.
   - Every katakana word, e.g. ボールペン.
   - The 8xl Zen Maru 日 hero on `/kanji/日` reads like a rounded "8" next to the KanjiVG stroke diagram (`KanjiDetailPage.tsx:227`, `d-light-kanji-detail-full.png`).
   - A rounded "maru" face is also a poor choice for kanji shape recognition.
3. **The chapter's activities contradict each other.**
   - Vocabulary is practised in three places: rail tap-to-master, the Vocab-tab quiz, and the Exercise "Vocabulary" group. The Exercise group has the same name as the tab.
   - Listening exists both as Exercise "Listen and choose" and as the Listening tab ("Listen and read").
   - The JLPT mega-menu describes Listening as "pick what they mean", which is actually the Exercise drill (`d-menu-jlpt.png`).
   - Steps 1-2-3-4 only make sense once each tab has one distinct job.
4. **Mobile Vocabulary hides the meaning.** The table is `min-w-[40rem]` (`ChapterVocabulary.tsx:92`). At 390px only Word / Kana / part of Romaji are visible; Meaning, Hint and Audio sit off-screen behind a sideways scroll (`m-light-g-vocab-fold.png`). On phones it needs a stacked row layout.
5. **Guest and signed-in users get four unrelated sign-in treatments.**
   - Vocab: an inline lock bar next to the H1 that competes with it.
   - Exercise: an inline bar inside a grey panel.
   - Kanji detail: a full panel *inside the "Remember it" mnemonic card*.
   - Kana: sign-in comes up when the quiz is opened.
   - Log in is primary and Sign up is outline, which is the wrong emphasis for a guest-acquisition moment.
   - Guests see "Your Progress 0/25" with no hint that it is saved on this device only (`GrammarPage.tsx:109`).
   - Signed-in learners get no "Continue" on grammar at all; ContinueCard exists only in kana and kanji.
   - 00 requires "guests: start here / signed in: continue". The pattern exists; grammar doesn't use it.
6. **Top menu IA** (from code and the live shots):
   - **Kana▾** holds Kanji (`api/mock/navigation.ts:6-11`). `/kana/kanji` even redirects (`App.tsx:324`).
   - **JLPT▾** is grammar only: 4 links that all open **chapter 1**, whatever your progress. It omits N5/N4 Kanji, although kanji are JLPT-levelled.
   - "Quiz" is the auth-gated test centre, a fourth testing entry next to the kana "Check" and the kanji and grammar "Tests"/"Chapter test".
   - No top-level item shows an active state except JLPT.
   - Desktop triggers are **52×20px** (probe), against the 44px rule.
   - On mobile, the drawer nests JLPT → N5 → 4 tabs, then 4 locked rows, and pushes "Sign in / up" past the fold (`m-drawer.png`).
   - Navbar and Footer import `@/api/mock/navigation` directly (`Navbar.tsx:3`, `Footer.tsx:3`), against CLAUDE.md rule 7.
   - The logo gradient uses raw `from-orange-500 via-amber-500` (`Navbar.tsx:141`), against rule 2.
7. **Three level-picker patterns.**
   - Grammar: a segmented bar where 4 of 5 segments are locked.
   - Kanji: pills with "Soon" (`d-light-kanji-course-full.png`).
   - Mega-menu: rows with lock icons.
   - Plus the LockedLevelScreen that lists the levels a fourth time.
8. **Three "selected" styles.**
   - Primary fill: N5 segment, Log in.
   - Primary underline: tabs.
   - Black `on-surface` fill: Listening's passage pills and the "Normal" segment (`d-light-g-listening-full.png`).
   - Plus `primary/10` tint: sidebar item, kanji level pill, Stroke order tab.
9. **Keyboard and focus.**
   - No skip link (probe: none found).
   - Grammar only calls `window.scrollTo(0,0)` on chapter or tab change (`GrammarPage.tsx:104`). It doesn't move focus to the H1 the way `KanaCourseLayout` does, so screen-reader users get no "page changed".
   - InteractiveWord is a `span role=button` with `aria-expanded` but no accessible relationship to its portal tooltip.
   - The per-example "Hide" button measures **48×20px**, has no `type` and no `aria-pressed` (`GrammarContent.tsx:262`).
10. **Unfinished content shipped to learners, beyond 01's list.** A "DRAFT" badge on kanji mnemonics (`KanjiDetailPage.tsx:365`, visible in `d-light-kanji-detail-full.png`), plus the MDX authoring note (`chapter-2.mdx:100`).
11. **Empty and error states.**
    - "Content coming soon for this level!" is bare text (`GrammarPage.tsx:163`).
    - The list-level ErrorState drops the whole layout (no sidebar, no tabs, `:152-157`), so the learner loses navigation exactly when they need it.
    - Tab-level errors keep the tabs but offer no "read the notes instead" route.
    - The confetti ignores reduced motion and uses hex colours (`GrammarContent.tsx:414`).

## 4. Reconciled TOP 15: what the new design system must solve

| # | Problem | Evidence | Fix: token or component |
|---|---|---|---|
| 1 | **Grammar uses its own layout, unlike kana and kanji** (fixed sidebar, kicker, breadcrumb, pill, H1), so lessons don't feel like one product | §3.1; compare `d-light-kana-learn-full.png` with `d-light-g-grammar-fold.png` | Promote `CourseHeader`, `CourseSectionNav`, `ContinueCard`, `StatusIcon`, `StepProgress` and `ActionLink` from `kanaCourse/` and `learn/` into `components/course/`. Grammar adopts them, giving one lesson shell for all three courses. |
| 2 | **There is no guided step flow** in the chapter; the next CTA skips 3 of the 4 tabs | `GrammarContent.tsx:405-472`; 04 B5 | Numbered `ChapterTabs` (1 Grammar, 2 Words, 3 Practice, 4 Listen) with a `StatusIcon` state, `StepProgress` "1 of 4" in the header, and an inline end-of-tab `ActionLink` "Next step: Words →". No sticky bar. |
| 3 | **Guest and returning users aren't distinguished** on grammar; four different sign-in treatments | §3.5 | `ContinueCard` states (guest: "Start · Chapter 1"; returning: "Continue · Ch 2 · Practice"), one `SignInPrompt` placement rule (end of the step, never inside content cards), and a "saved on this device" note for guests. |
| 4 | **"Where am I" said 4×**, generic `<title>`, no focus move | §1 #9; §3.9 | One `CourseHeader` (eyebrow "N5 Grammar · Chapter 2 of 25", H1, one line, meta), `document.title` set from page config, focus on the H1 when the route changes. |
| 5 | **Dark solid-primary fails contrast (2.47)**; error 2.81; tertiary 2.4 | §1 #3–4 | Token fix: dark `--on-primary` = #1A0F0A (as `--home-on-accent`), or a `primary-solid` role; give `error` a dark value; drop `tertiary`. Then delete the `dark:bg-primary-container` workarounds. |
| 6 | **Faded text and borders below AA** (/40–/60 text 2.0–3.2; borders 1.1–1.7) | §1 #5–7 | Lint rule: no alpha on `text-on-surface-variant`; add `on-surface-subtle` (≥4.5 in both themes); border floor `outline-variant/60` (already the de facto value in kana and kanji). |
| 7 | **Japanese text isn't typeset as Japanese**: `lang=en`, Inter, fake spaces, italic CJK, and Zen Maru switching faces per glyph | §1 #2; §3.2 | `<JaText>` (exists) and a `lang="ja"` base rule; `font-jp` changes to a **full-coverage non-rounded JP face** for content (keep Zen Maru for display kana only) or a system stack with no subset; `leading-jp`; never italic. |
| 8 | **Readings hidden behind a broken hover** ("Show All Hints" renders off-screen) | §1 #1 | `<Furigana>` built on `rubyText.ts`; a meaning popover anchored with floating positioning; content converted to bracket readings so coverage is complete. |
| 9 | **Three reading-preference systems** (Listening script/romaji/english, kanji furigana, grammar hints/hide) | §2 | One `useReadingPrefs` store and an extracted `ui/SegmentedControl`, used by every lesson. |
| 10 | **Box-in-box concept cards** with keyword colours and stacked elevation, but a fully flat page would be "too simple" | `GrammarContent.tsx:22-33,181-250`; 00 | Concepts become a numbered step list (`UnitStepItem` marker and rail), one quiet example surface, `Callout tone=rule\|note\|culture`, one accent. The rule is border **or** elevation, never both. |
| 11 | **Activities overlap or contradict**: 8 vs 25 words; vocab practised 3×; listening 2×; tab and group names collide | §1 #13; §3.3 | Content model: one job per step. Delete the rail mastery store, rename the Exercise groups so they don't reuse tab names, keep "Listen and choose" only in Listening, and align the mega-menu copy. |
| 12 | **Phone chrome takes 24–41% of the screen**; two-row bar with a locked-level segment; three-row player bar | §1 #12 | One sticky 48–56px course bar (`CourseSectionNav` pattern, `sticky`, not fixed) with "‹ Ch 2 of 25 ▾ ›"; levels in the sheet; Listening's player bar collapses to one row with prefs behind an "Aa" button. |
| 13 | **Top-menu IA is muddled**: Kanji under Kana, Grammar only via JLPT (always ch 1), 4 test entry points, 20px triggers, no active state, nested drawer | §3.6 | `navigation` config moves out of `api/mock` into `lib/content/nav.ts`: **Kana · Kanji · Grammar · Practice · Classes**. Each item's menu deep-links to "continue" for signed-in users. `NavItem` gets min-h-11 and `aria-current`. The drawer becomes flat (one level). |
| 14 | **Inconsistent selection, level and shape language** (3 selected styles, 3 level pickers, radius md>lg, 12 eyebrow trackings) | §3.7–8; §1 #8 | Tokens: monotonic radius (sm 6 · md 10 · lg 12 · xl 16 · 2xl 20 · full). One `selected` recipe (primary underline for nav, `primary/10` + primary text for list and segments). One `LevelPicker` (available levels plus a single "More levels coming" line). One `Eyebrow`. |
| 15 | **Keyboard, mobile-table and state gaps**: no skip link, 25 tab stops before content, `span role=button`, 48×20 Hide; mobile vocab table hides the meaning; bare "coming soon"; an error state that drops navigation; DRAFT and authoring notes shipped; confetti ignores reduced motion | §3.4, 3.9–3.11 | `SkipLink` in the layout, chapter list behind a disclosure, `InteractiveWord` as a real `<button>`, a stacked `WordRow` under `sm`, `EmptyState`/`ErrorState` rendered *inside* the course shell, a content lint that blocks `draft` and authoring notes, `disableForReducedMotion`. |

## 5. What must not be lost (things the other agents got right, plus what to keep)

- The tone system, the elevation tokens, ChapterTabs' 44px targets, CloseButton, Switch, TextLink and ProgressBar.
- The kana and kanji course pattern, which is the best existing expression of "calm but clearer" (00).
- The Listening tab's word-highlight-with-voice, which is the most "authentic" interaction on the site. Keep it, and give its controls the shared prefs.
