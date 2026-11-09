# Agent 4: UI/UX review of the Grammar chapter page (/grammar/n5/2)

Standard: docs/UIUX_STANDARDS.md (cited below as "§n"). Code: src/pages/GrammarPage.tsx, src/components/grammar/*, src/components/layout/FixedSidebar.tsx, src/components/ui/InteractiveWord.tsx.
Screenshots: (session screenshots, not committed) shots-ux/ (shortened below to shots-ux/)
- desk-fold / desk-full / desk-dark-fold / desk-dark-full (1440x900)
- tab-fold / tab-full / tab-dark-fold (1024x768); mob-fold / mob-full / mob-dark-* / mob-scrolled / mob-sheet (390x844)
- desk-concept1, desk-concept5, desk-hover, desk-hints, desk-dark-concept1, desk-dark-hints, desk-tab-{vocabulary,exercise,listening}

Caveat about the environment: the sandbox proxy blocks cdn.foxsensei.com (returns 403), so the chapter board image (shots show raw alt text)
and the Vocabulary/Exercise/Listening tabs (they show the ErrorState) failed here. I judged those tabs from code, not from how they look live.
The grammar notes tab loaded completely.

## A. Verdict

The owner is right on both counts. The page is **too simple at the top and too complex in the body**.
- **Too simple:** the area above the fold is four stacked lines that all say where you are (the tab eyebrow `N5 · CHAPTER 2 · title`, a second
  breadcrumb `N5 COURSE > CHAPTER 2 > GRAMMAR NOTES`, a `CHAPTER 2` pill, then the H1), followed by six grey pills that look clickable but
  aren't. Nothing tells the learner what this chapter asks of them or what to do next. There's no progress for this chapter and no estimated time.
- **Too complex:** in the body each concept is a box inside a box inside a box (card with border, shadow, hover lift, colored stripe and header
  rule, then a tinted key-rule box, then tinted example cards). Each card also has a "1 / 6" counter and a Hide control on every sentence. A
  second vocabulary list with its own mastery state sits in a right rail, duplicating the Vocabulary tab. Five accent colors are picked by
  keywords in the concept title.
- The primary next step ("Mark Chapter 2 as Complete", then "Next: Chapter 3") skips the chapter's own Vocabulary, Exercise and Listening
  steps. The headline feature "Show All Hints" is **broken**: it does nothing visible.

Ratings (out of 5): Color/contrast 3 · Elevation 2 · Typography 3 · Spacing 3 · Shape/icons 3.5 · Motion 3 · States 3.5 · Hierarchy/wayfinding 2 · Japanese reading comfort 2 · Dark mode 4.

## B. Must-fix

1. **"Show All Hints" is broken. All 15 tooltips stack off-screen at (0, -12px).** `InteractiveWord.tsx:21,24-29,71-80`: `visible = showAll || …`,
   but `tipPos` is only measured on hover, click or focus, so when `showAll` is on every portal renders at `left:0; top:-12px`. I measured
   15 fixed tooltips at `0px,-12px` (shots-ux/desk-hints.png: the page looks unchanged, and only a smear shows at the top-left).
   Fix: drop the tooltip-based "show all" and switch on **inline furigana** instead (`<ruby>` with `<rt>`, see B2). Tooltips stay for meaning on
   tap/hover only.
2. **Kanji have no furigana, so readings are hidden behind hover.** `GrammarContent.tsx:253-255` and `InteractiveWord.tsx:118-122` show 辞書, 傘
   and 私 bare with a dotted underline. The reading appears only in a hover tooltip, set at `text-2xs uppercase tracking-[0.2em]`
   (`InteractiveWord.tsx:91`), which letter-spaces kana and puts them at 11px. That is wrong for N5 learners. Fix: render the
   `<ruby>漢字<rt>かんじ</rt></ruby>` primitive (`<Furigana>`) with `rt` at `text-xs` and `text-on-surface-variant`, controlled by one page-level
   "Furigana: on / hover / off" toggle that replaces the "Show All Hints" button.
3. **The Japanese typography is not set up as Japanese.** The grammar example sentences carry no `lang="ja"` and no `font-jp` (the
   `tailwind.config.ts:117` token exists and the Vocabulary tab uses it at `ChapterVocabulary.tsx:149`). `InteractiveWord.tsx:110` adds `mx-1.5`
   and `tracking-wider`, which puts fake spaces inside sentences ("それは 辞書 ですか。", shots-ux/desk-concept1.png). The key rule and translations
   are `italic` (`GrammarContent.tsx:218,259`), which gives CJK glyphs a synthetic slant. Fix: wrap every example in `lang="ja" font-jp
   leading-[1.9]` (add a `leading-jp` token), set `mx-0 tracking-normal` on words, and never italicize Japanese. Mark emphasis with weight or color.
4. **Muted text fails contrast.** Several elements use `text-on-surface-variant/50` = rgba(93,63,61,.5) on `#f8f9fa`, which I computed at **≈2.5:1**
   (AA needs 4.5:1). Affected: the concept counter "1 / 6" (`GrammarContent.tsx:196`), the per-sentence "HIDE" (`:264`, 12px uppercase), "Tap a
   word to mark it as mastered" (`:378`), and the vocab counter `/60` (`:314`). Also the locked-level copy at `/40` and `/50` (`GrammarPage.tsx:54,62`;
   `ChapterList.tsx:~90-93`), locked level segments at `/40` (`LevelSwitcher.tsx:45`), and the ChapterProgress hint at `/60` (`ChapterProgress.tsx:~42`).
   Fix: use `text-on-surface-variant` at full strength. Remove an element entirely rather than fading it below AA.
5. **The next-step flow skips three quarters of the chapter.** `GrammarContent.tsx:405-472` ends the Grammar tab with "Mark Chapter N as
   Complete" plus Previous/Next *chapter*. Nothing sends the learner to this chapter's Vocabulary → Exercise → Listening tabs, even though
   `CHAPTER_TABS` (`levels.ts:40-45`) defines that sequence. Fix: end every tab with one **Continue bar**: "Next: Vocabulary · 8 words →".
   Chapter completion belongs at the end of the last step, or is earned by the Exercise, which the code already supports through
   `ChapterExercise.tsx:66-68`, the "passing completes the chapter" setting.
6. **Wayfinding is said 4 times above the fold, and the tab label disagrees with the breadcrumb.** `ChapterTabs.tsx:21-24` eyebrow,
   `GrammarContent.tsx:104-116` breadcrumb, `:135-138` "Chapter 2" pill, `:145` H1 (shots-ux/desk-fold.png). The breadcrumb says "Grammar Notes"
   while the tab says "Grammar". Fix: one `<LessonHeader>` above the tabs with breadcrumb `N5 Grammar / Chapter 2 of 25`, then the H1, the description
   and a meta line. Delete the second breadcrumb, the Chapter pill, and the H1 that differs per tab (see B7).
7. **Each tab has a different header.** On Grammar the H1 is the chapter title at `text-4xl md:text-5xl` (`GrammarContent.tsx:145`). On Vocabulary it is
   "Words in this chapter" at `text-2xl sm:text-3xl` (`ChapterVocabulary.tsx:78`), and on Exercise it is "Practise this chapter" (`PracticeIntro.tsx:21`).
   Switching tabs makes the page jump and swaps the H1 meaning. Fix: the chapter H1 lives in `<LessonHeader>` above the tabs and stays put. Each tab
   body starts with an H2 from one recipe.
8. **The concept accent color is picked by keywords in the title.** `GrammarContent.tsx:22-33` maps "negation" to `error` red, "question" to
   `secondary` blue, "possession" to `tertiary` teal, and so on. Chapter 2 shows teal, blue and orange stripes (shots-ux/desk-full.png). This breaks
   §0.2 (one accent) and means nothing to the learner. Red reads as "wrong". Fix: delete `getConceptStyle`. Concept number badges use `primary` or
   neutral, and callouts use one `<Callout tone="rule">` style.
9. **Stacked elevation and nested boxes (§0.3, §2).** The concept `section` combines `border-outline-variant/20` + `shadow-elevation-1` +
   `hover:shadow-elevation-2` (a hover lift on something you can't click) + a stripe + a header `border-b` (`GrammarContent.tsx:181-186`).
   Inside it, the key rule is tint + `border-l-4` (`:212`), the note is tint + border (`:227`), and each example is border + tint (`:250`). Borders at
   `/15` and `/20` are below the `/40` minimum in §2. Fix: concepts become **unboxed sections** separated by whitespace (`space-y-16`) and an H2.
   Only the examples get one quiet surface (`bg-surface-container-low rounded-2xl`, no border). Remove the hover shadow.
10. **The right rail duplicates the Vocabulary tab and has its own mastery state.** `GrammarContent.tsx:300-383` lists the vocab again, with
    mastery saved in `localStorage` under `ff-vocab-*` (`:45-68`). That progress is not connected to `useChapterProgress` or to the Vocabulary
    tab's quiz. Mastered rows drop to `opacity-40` (contrast failure). The rail stops after about 1,800px and leaves a blank column for the rest
    of the page (shots-ux/desk-concept5.png). Fix: remove the vocab card. Replace the rail with a sticky **"On this page"** concept list
    (scroll-spy) plus a one-line "8 words in this chapter → Vocabulary" link. Move Cultural Insight inline after the concepts (it already
    is on mobile, `:282`).
11. **Phone chrome takes about 24% of the screen.** On a 390x844 phone the navbar is 80px and `MobileGrammarNav` is two rows (~120px)
    (`MobileGrammarNav.tsx:59-61`, shots-ux/mob-fold.png, mob-scrolled.png). One full row is a level switcher where 4 of 5 segments are locked.
    Fix: one 56px row, `‹  N5 · Ch 2 of 25 ▾  ›`. Move the level choice inside the chapter sheet, and hide the bar on scroll-down and show it on
    scroll-up.
12. **Content parsing shows raw markdown and drops structure.** The page shows "This is a book \*\*on/about\*\* computers." and "This is
    \*\*my\*\* book." (shots-ux/desk-concept5.png; source `src/assets/grammar/n5/chapter-2.mdx:73,79`). The sub-heading "1. Topic/Content
    Modification" renders, but "2. Ownership" is lost. Reply lines such as "…サントスさんの[かばん]です。" become examples with no translation and
    show literal brackets. Romaji is parsed (`types/grammar.ts:11`) but never rendered in the example cards. "Warning:" callouts are relabelled
    "Note:". Fix in `src/utils/mdxParser.ts:362-381`: run inline markdown on `english`, keep `###` sub-heads as concept sub-sections, and treat
    indented `* **…**` as a reply to the previous example.

## C. Should (polish, ranked by impact)

1. **The concept pills look clickable but aren't** (`GrammarContent.tsx:153-164`). Turn them into the anchor TOC ("On this page") with
   numbered links and scroll-spy. On mobile they become a collapsible "6 concepts" disclosure, so the pills stop taking ~200px (shots-ux/mob-fold.png).
2. **Show progress inside the chapter.** The tabs show no state, and `ChapterProgress` counts only chapters. Add a step state to each tab
   (✓ done, vocab best %, exercise best %), which already exists in `progress.byChapter` (`GrammarPage.tsx:189-192`). Add a small ring
   "2 of 4 steps" in the LessonHeader.
3. **Show romaji and translation per sentence, with one setting.** Delete the per-sentence "HIDE" buttons (`GrammarContent.tsx:262-268`). They are
   12px, fail contrast, have no `aria-pressed` and no `type`. Replace them with one segmented "Show: Furigana · Romaji · English" control in the
   lesson toolbar, remembered in the UI store.
4. **Add audio to the example sentences.** The Vocabulary tab already has `SpeakerButton` + `useJapaneseSpeech`. Add a 44px speaker to each
   example card. It is the single biggest boost to how authentic the page feels.
5. **The completion block is louder than the content** (`GrammarContent.tsx:409-431`): a 4xl ghost icon, a tinted panel, a border, and confetti
   in hex colors (`:414`) that ignores reduced motion. Fix: keep it inside the Continue bar, use the `canvas-confetti` option
   `disableForReducedMotion: true`, and take colors from CSS vars (`--primary`) or skip the confetti.
6. **The chapter list in the sidebar is busy.** "Currently studying" repeats the obvious (`ChapterList.tsx:~70`). The 25 items have no grouping, and
   the sidebar has no "Continue where you left off". Fix: drop the subline (the highlight already says it), and auto-scroll the active item into
   view (on desktop, chapter 2 is fine, but chapter 20 opens off-screen). Group the list into "Units" (e.g. 1-5 Basics), or at least show a done
   tick and an in-progress half ring.
7. **There is no guard on line length.** At 1440 the concept text runs ~95 characters per line (shots-ux/desk-concept1.png). Fix: `max-w-prose`
   (or a `max-w-[68ch]` token) on the reading column. Center the column, with the rail sticky on the right from xl up.
8. **Hand-made type sizes in ChapterVisual.** `text-[0.66rem]`, `text-[0.65rem]` (≈10.5px, below the 12px floor), and three tracking values
   `0.1em`, `0.12em`, `0.16em` (`ChapterVisual.tsx:428,456,541,584,598`). It also uses `text-home-accent` instead of `primary`. Fix: use the
   `<Eyebrow>` recipe and `text-xs`.
9. **The eyebrow recipe varies across the page.** It appears as `tracking-[0.18em] font-bold` (ChapterTabs:21), `tracking-[0.2em]` (breadcrumb:105),
   `tracking-widest` (GrammarContent:136,213,239,286,309, GrammarSidebar:28). Fix: one `<Eyebrow>`.
10. **The board image has no failure fallback.** When the board fails, raw alt text spills into a 900px-wide empty box (shots-ux/desk-fold.png).
    That looked broken here because of the sandbox, but it will happen to real users on flaky networks. Fix: give `<Figure>` an
    `onError` → coded diagram (the `items` already exist), plus an aspect-ratio box so the layout doesn't shift.
11. **The radius scale is used inconsistently.** The PracticeIntro card is `rounded-3xl` (`PracticeIntro.tsx:20`) and concept cards are
    `rounded-2xl`. One check icon is `text-[1.05rem]` (`ChapterList.tsx:53`). LevelSwitcher uses `shadow-sm` (`LevelSwitcher.tsx:67`)
    instead of an elevation token.
12. **The reveal toggle is pill + border-2 + primary**, an orange outlined button at the top right that competes with the active tab for
    accent (`GrammarContent.tsx:122-126`). Once replaced by the toolbar segmented control, keep orange for the active tab and the Continue CTA only.

## D. Could

- Estimated reading time and "6 concepts · 8 words · ~12 min" meta line under the H1.
- Keyboard: `j/k` between concepts, `→` Continue.
- Remember the last tab and scroll position per chapter, and add "Resume Chapter 2 · Exercise" in the sidebar header.
- Dark mode is largely good (shots-ux/desk-dark-fold.png, desk-dark-concept1.png). Concept borders at `/20` are invisible on charcoal, but that
  goes away once boxes are removed. Check that the `diagram-tone-*` chips keep 4.5:1 on dark (the これ green is close).
- Locked-level screen (`GrammarPage.tsx:30-68`): it repeats "N4 … N1 Coming Soon" in a list that the switcher already shows. Fix: replace it with
  an EmptyState (icon, one line, "Continue N5 →" action).
- "Content coming soon for this level!" (`GrammarPage.tsx:160-166`) is bare text. Use `EmptyState`.

## Proposed page structure (wireframe in words)

Desktop ≥ lg (three zones: course nav · reading column · on-this-page rail)
```
[Navbar]
┌ ChapterNav (left, 288px, sticky) ─┐ ┌ Reading column (max ~68ch, centered) ────────────────┐ ┌ Rail xl+ (sticky) ┐
│ N5 Grammar          [level ▾]     │ │ Breadcrumb: N5 Grammar / Chapter 2 of 25               │ │ ON THIS PAGE       │
│ ◔ 3 of 25 chapters                │ │ H1 Demonstratives & Possession                         │ │ 1 これ・それ・あれ ●│
│ ▶ Resume: Ch 2 · Exercise         │ │ one-line description                                   │ │ 2 この・その・あの  │
│ ── Unit 1 · Basics ──             │ │ 6 concepts · 8 words · ~12 min        ◔ 1/4 steps      │ │ 3 そう・違います    │
│ ✓ 1 Identity & Basic Particles    │ │ ┌ StepTabs: ①Grammar ✓ ②Vocabulary 40% ③Exercise ④Listening ┐ │ … 6 の            │
│ ● 2 Demonstratives & Possession   │ │ └────────────────────────────────────────────────────┘ │ │ ─────────          │
│   3 Locations & Directions        │ │ Lesson toolbar (sticky under nav): Furigana ◐ · Romaji · English  │ 8 words → Vocab   │
│   …                               │ │ ChapterVisual (board, 16:9, fallback diagram)          │ └───────────────────┘
└───────────────────────────────────┘ │ ── 01 Demonstrative Nouns ─────────── (H2, no box)     │
                                      │ prose (16px, leading-relaxed)                          │
                                      │ Callout[rule]: これ near me · それ near you · あれ far │
                                      │ ExampleSentence: ruby JP (24px, font-jp, leading-jp) 🔊 │
                                      │                  romaji (sm, muted) / English (base)   │
                                      │ … concepts 02–06 separated by space-y-16 …             │
                                      │ Callout[culture]: Cultural insight                     │
                                      │ ContinueBar: "Next: Vocabulary · 8 words  →" (primary) │
                                      │              secondary text link: "Skip to Chapter 3"  │
                                      └────────────────────────────────────────────────────────┘
```
Tablet (md to lg): no left sidebar. A single-row ChapterNav bar (‹ N5 · Ch 2 of 25 ▾ ›) opens the sheet. The rail folds into a collapsible
"On this page" under the header.
Phone: Navbar (64px) plus one 56px ChapterNav row that hides on scroll-down. The header is the breadcrumb line, the H1 (fluid clamp) and the meta line.
StepTabs scroll horizontally with icons and state dots. The toolbar becomes a single "Aa" button that opens a sheet with the Furigana, Romaji and
English switches. Concepts are full-bleed sections. ContinueBar is **sticky at the bottom** (safe-area padded) once the user passes 60% of the page.
The chapter sheet holds the level switcher, progress and unit-grouped list.

Order of the Grammar tab body: Visual → Concepts 1..n → Cultural insight → Continue. The Vocabulary, Exercise and Listening tabs use the same
LessonHeader and StepTabs and end with the same ContinueBar (Exercise → Listening → "Chapter complete · Next chapter →").

## Design-system requirements

Tokens
- `leading-jp` (≈1.9) and `font-jp` applied through a `.ja` / `lang="ja"` base rule. Furigana sizes: `rt` = `text-xs`, base 18/24/28 steps
  (`text-ja-sm/md/lg`).
- `max-w-reading` (≈68ch) for prose columns. A `nav` height token is already in use (`theme(spacing.nav)`); add `chapter-bar` (56px) and use both
  for `scroll-mt`.
- Muted-text rule: only `on-surface-variant` (no `/40`, `/50`, `/60` on text). Add `on-surface-subtle` if needed, tested for 4.5:1 in both themes.
- Semantic `success` for done ticks (separate from primary), and `info` for notes. Callout tones: `rule` / `note` / `culture` / `warning`, all
  token-based with light and dark values.
- Elevation: use only `elevation-1/2/3`. Remove `shadow-sm` and `shadow-inner`. Borders are `outline-variant/50` minimum.
- Motion: `duration-fast/base`, `ease-standard`. Confetti is optional, a single burst, and gated on reduced motion.

Components
- `<LessonHeader>`: breadcrumb (`<Breadcrumb>` with `aria-current`), H1 (fluid clamp), description, meta (`concepts · words · minutes`), and a
  `<ProgressRing>` for chapter steps. One per page, above the tabs.
- `<StepTabs>`: the ordered steps of a chapter (Grammar/Vocabulary/Exercise/Listening) with a state per step (`todo | in-progress % | done`),
  ≥44px targets, horizontal scroll on phone, `aria-current="page"`.
- `<ChapterNav>`: one component in two forms, the desktop sidebar card and the phone bar + `<Sheet>`. It contains the level menu (locked levels in
  the menu, not a 5-segment bar), `<ProgressBar>`/ring, "Resume" link, `<ChapterList>` grouped by unit with auto-scroll to active.
- `<OnThisPage>`: anchor TOC with scroll-spy. On phone it becomes a disclosure.
- `<LessonToolbar>` + `<SegmentedControl>`: Furigana / Romaji / English display preferences, saved in the UI store.
- `<Furigana>` (ruby) and `<JapaneseText>` (lang, font, leading). `<InteractiveWord>` rebuilt on top of them: the meaning popover is anchored with
  floating positioning (recompute on scroll and resize) and never shown en masse.
- `<ExampleSentence>`: JP line (ruby), romaji, English, a `<SpeakerButton>`, and optional reply lines (A/B dialogue). One quiet surface, no border.
- `<Callout tone>`: replaces the key-rule, note and cultural-insight boxes. Icon, eyebrow, body, no italic.
- `<ConceptSection>`: numbered H2 with an anchor id. No card or shadow.
- `<ContinueBar>`: one primary "Next: <step> →" with an optional secondary link. It sits inline at the end of the body and goes sticky at the bottom
  on phone, and also handles "Mark complete" when on the last step.
- `<Eyebrow>`: the single caps-label recipe (`text-xs font-semibold uppercase tracking-[0.18em]`).
- `<Figure>`: aspect-ratio box, lazy image, `onError` fallback slot, caption.
- `EmptyState`/`ErrorState`: already shared. Use them for the "coming soon" and locked-level screens as well.
