# 05: Manager / QA audit (Agent 5)

Inputs: 00, 01, 02, 03, 04 and 06; the standards (CLAUDE.md, docs/UIUX_STANDARDS.md, docs/FRONTEND_STANDARDS.md, .claude/agents/*.md); the design system in `scratchpad/ds/project/`; and the renders in `scratchpad/render/`. I looked at the GrammarChapterPage, GrammarChapterMobile, TopNav, StepTabs and ChapterNav renders in both themes.
Repo check: HEAD `8769123` is still **1 commit behind origin/main** (`git rev-list HEAD..origin/main` = 1).
The contrast script is `scratchpad/contrast.js` and uses the WCAG relative-luminance formula.

## 1. Agent grades

| Agent | Standards cited | Evidence | Stale or wrong info | Grade |
|---|---|---|---|---|
| 1 Design inventory | CLAUDE.md, UIUX_STANDARDS, FRONTEND_STANDARDS | Live Playwright at 1440 and 390, light and dark | cdn was blocked, and it says "everything else loaded" although the API tabs failed for 3 and 4. It never checked origin/main, so its PracticeIntro / `rounded-3xl` findings are dead code. It inventoried `ui/` only and missed the kana/kanji course components. Concept-colour detail is wrong (02 #10). | **B**: the most complete token record, but built on the stale branch |
| 2 Cross-examiner | 00 (binding), CLAUDE.md rules 1/2/7/8, UIUX contrast and targets | **Re-shot live with cdn and API working** (`shots-x/`), plus keyboard and hit-size probes and recomputed ratios | Found that the branch is 1 commit behind and that PracticeIntro is deleted. Enforced "Reuse first" against kana/kanji. No material errors. | **A**: verified evidence, and corrected every other agent |
| 3 Context/intent | CLAUDE.md, ONBOARDING, all docs/ (flagged PLAN and UIUX_PLAN drift), .claude/agents | Live render; API and cdn blocked (named) | Wrong that the concept pills are "in-page anchors". No origin/main check. | **B**: a good briefing with one factual error and the stale branch |
| 4 UI/UX | UIUX_STANDARDS § by §, file:line throughout | Screenshots at 3 widths and both themes. **Vocab, Exercise and Listening were judged from code** (cdn/API 403). | Its PracticeIntro and `ChapterExercise.tsx:66-68` citations are stale. "Secondary blue" is wrong (terracotta/sakura). It proposed new LessonHeader, StepTabs and sticky ContinueBar components that already exist in kana/kanji, which breaks CLAUDE.md rule 1. | **B**: strong diagnosis, weak on reuse and stale evidence for 3 of the 4 tabs |
| 6 User-info | UIUX_STANDARDS §0–9, UIUX_PLAN, App.tsx, analytics | Code evidence. It needed no screenshots. | None. It recommended "Total beginners", but the user chose "Both". That is fine because the question was asked. | **A**: answered what the evidence could answer, and asked 4 well-formed questions |
| Coordinator (DS) | Followed 02's rulings (reuse mapping, no sticky phone bar, rail only at xl, one prefs store) | Rendered previews in both themes | Its own README notes the stale branch. But the previews still use the stale "8 words" (the MDX rail count, where the live API has 25) and "10 questions" (live has 6 drills plus a Chapter test). Several of its rules are contradicted by its own previews (§4). | **B**: right content, uneven execution |

## 2. Coverage matrix

### Agent 2 TOP 15
| # | Problem | DS | Where |
|---|---|---|---|
| 1 | One lesson shell for all courses | Partial | README "Kana and kanji lessons use the same shell"; LessonHeader/README (generalises CourseHeader). There is **no kana or kanji preview**. |
| 2 | Guided step flow | Yes | StepTabs/README, ContinueBar/README, both page previews |
| 3 | Guest vs returning; one sign-in placement | Partial | Rules in TopNav, ContinueBar and ChapterNav READMEs. **No preview shows a guest.** There is no SignInPrompt component and no "saved on this device" note. |
| 4 | Location said 4×; title; focus | Partial | Title, focus and skip link are in README and LessonHeader. But the page preview states the position in the breadcrumb, the sidebar row, the "Continue · Ch 2" resume link, the Up-next card, the nav "Continue · N5 Ch 2" and a "Step 1 of 4" badge that duplicates StepTabs. |
| 5 | Dark primary / error / tertiary contrast | Yes | tokens.json `on-primary` dark #1a0f0a (7.61), `danger` dark; tertiary dropped |
| 6 | Faded text and borders | Yes | `ink-subtle`, `line-strong`, and the "never opacity on text" rule (one 4.44 miss, see §4) |
| 7 | Japanese typesetting | Yes | bundle.css `:lang(ja)`; README Typography (Noto Sans JP; Zen Maru for display only). The caveat is that Noto loads from Google Fonts and is not self-hosted. |
| 8 | Readings behind broken hover | Partial | ExampleSentence has ruby, built on rubyText, with the content prerequisite. **The meaning popover (floating positioning) and InteractiveWord as a real `<button>` are not specified.** |
| 9 | Three reading-preference systems | Yes | LessonToolbar/README (`useReadingPrefs`, `ui/SegmentedControl`) |
| 10 | Box-in-box concepts | Yes | ConceptSection/README, Callout/README, flat wells in bundle.css |
| 11 | Activities overlap | Partial | The one-job rule is in README and StepTabs. The previews still advertise "8 words" and "10 questions", and the mega-menu copy issue is moot. |
| 12 | Phone chrome 24–41% | Partial | GrammarChapterMobile (64 + 56 sticky bar, "Aa"). **The Listening player bar (the 41% case) is not addressed.** |
| 13 | Top-menu IA | Partial | TopNav/README has a flat menu, nav.ts and aria-current, but its items are "≥40px", against the 44px fix |
| 14 | Selection, level and shape language | Partial | Monotonic radius, one Eyebrow and one LevelPicker are done. There are still **6 "selected" recipes**: topnav sunken, step raised+shadow, seg raised+shadow, chaprow primary-soft, toc primary bar, option primary border. The radius values also differ from UIUX_STANDARDS §5. |
| 15 | Keyboard, mobile table, states | Partial | SkipLink, chapter disclosure, WordRow, EmptyState inside the shell, content lint and reduced motion are all present. InteractiveWord `<button>` and the 48×20 Hide are removed but not replaced by a spec. |

### Agent 4 Must-fix
| # | Item | DS | Where |
|---|---|---|---|
| B1 | Show All Hints broken | Yes | LessonToolbar/README |
| B2 | No furigana | Yes | ExampleSentence (`rt` at 11px, not the 12px 04 asked for: acceptable under §9's 11–12 floor) |
| B3 | Japanese not set as Japanese | Yes | bundle.css `:lang(ja)`, ExampleSentence |
| B4 | Muted text contrast | Yes | tokens.json ink ladder |
| B5 | Next step skips the chapter | Partial | ContinueBar has the flow. But it says "marks the chapter complete automatically" on the last step, while on origin/main only the server-graded Chapter test completes a chapter. |
| B6 | Wayfinding 4× | Partial | Same as TOP15 #4 |
| B7 | Header changes per tab | Yes | LessonHeader/README |
| B8 | Keyword accent colours | Yes | Callout/README |
| B9 | Stacked elevation | Yes | README Shape & elevation; bundle.css |
| B10 | Rail vocab duplicate | Yes | OnThisPage, WordRow ("the only list") |
| B11 | Phone chrome | Yes | ChapterNav/README (56px bar, level in sheet, hide on scroll) |
| B12 | Raw markdown, replies, romaji | Partial | Content lint, replies and romaji in ExampleSentence. The mdxParser fixes (inline md on `english`, `###` sub-heads, the "Warning" label) are not carried. |

**Totals (27 items): Yes 15 · Partial 12 · No 0.** TOP15: 6 Yes, 9 Partial. Must-fix: 9 Yes, 3 Partial.

## 3. User-decision conformance
- **Scope: lessons + menu.** Partial. The menu is covered, but only grammar is designed. There is no kana chart/learn or kanji course/detail page, although the user named all three.
- **Both guests and returning learners.** **Gap.** The rules exist, but every preview (desktop, mobile, TopNav, ChapterNav, ContinueBar) shows only the signed-in state.
- **Guided, skippable steps.** Conforms. All steps are links, and nothing is locked. One small inconsistency: "Show concepts 3–6" (page preview) vs "4–6" (ConceptSection/README, README §6).
- **Calm but clearer, bigger headings.** Mostly conforms, with three things to confirm:
  - The H1 is **32px, smaller than today's `md:text-5xl` (48px)**, while the user asked for *bigger* headings.
  - `surface` is now the home canvas, and `leaf` comes from the home palette. The user declined "Match the home page", and 06's default kept `home-*` on the home page.
  - Inter is swapped for DM Sans. UIUX_STANDARDS §3 says Inter, and nobody asked for the swap.
  - None of these breaks the calm look, but each is an unrequested brand change that needs sign-off or a standards update.

## 4. Spot-checks

Contrast (WCAG). The 6 required pairs, both themes:

| Pair | Washi (light) | Yoru (dark) |
|---|---|---|
| on-primary / primary | 4.99 | 7.61 |
| primary / surface | 4.61 | 7.34 |
| ink-subtle / surface-sunken | 4.86 | 6.60 |
| line-strong / surface | 3.43 | 4.04 |
| primary-ink / primary-soft | 6.66 | 8.11 |
| danger-ink / danger-soft | 7.42 | 10.69 |

All six pass. The other callout -ink/-soft pairs score 6.2 or more, and the focus ring scores 5.48 / 9.51 on surface.

**Fails found:**
- **ink-subtle / surface-hover, light: 4.44.** This hits `.fx-chaprow__sub` on hover, and surface-hover is also the "selected row" token.
- **success / surface-sunken, light: 4.46.** This is `.fx-step--done .fx-step__state`, the 12px "Done" text on the step track.
- **primary / primary-soft, light: 4.12**, and **primary / surface-hover, light: 3.88.** No recipe uses these today, but the README doesn't forbid them.

**Hardcoded values:** previews have no hex colours. There are px leaks:
- ChapterNav/preview.html has `border-radius:16px` where it should use `var(--radius-xl)`.
- `.fx-seg button {border-radius:6px}` in bundle.css is off-scale.
- The phone h1 `font-size:26px` is an inline style in GrammarChapterMobile.

**Rule contradictions:**
1. **"Exactly one primary per screen"** (README §2, Button/README) is broken by the desktop and mobile pages. Each has 3 primaries: the nav "Continue · N5 Ch 2", the Up-next "Continue" and "Next: Vocabulary". The nav and Up-next point at the page the learner is already on.
2. **"Every tap target ≥44px"** (README, GrammarChapterMobile/README) is broken by `.fx-topnav__link` (40), `.fx-select` (36), `.fx-btn--sm` (36, used for the phone nav Continue), `.fx-seg button` (34) and `.fx-toc a` (~30). TopNav/README itself says "≥40px".
3. **The responsive rules are not in the CSS.** README sets the rail at ≥1280, the chapter bar below 1024, and h1 26 / ex 24 on phone. bundle.css has only a 640px ContinueBar query, and `.fx-lesson` is a fixed 3-column grid (≈1312px). The phone layout exists only as inline `<style>` overrides in GrammarChapterMobile/preview.html.
4. **ChapterNav overflows its card** in both renders (ChapterNav-*.png, GrammarChapterPage-*.png). The level select, progress track and resume link run past the card's right edge, because `.fx-chapnav__title {white-space:nowrap}` plus `.fx-select {flex:none}` inflate the grid column.
5. tokens.json `space-16` says "gap between concept sections", but README says concepts are `space-12` apart, and bundle `.fx-concepts` uses space-12.
6. The radius scale (sm 4, md 8, lg 12, xl 16, no 2xl) differs from UIUX_STANDARDS §5 (sm 6, md/lg 10–12, xl 16, 2xl 20) and from 02 #14.
7. StepTabs uses `aria-current="step"` on route links. 04 and the StepTabs/README rule that "each step has its own URL" imply `aria-current="page"`.
8. Theming uses `[data-theme="dark"]`, while the repo uses `html.dark`. The README "Consuming" section should name the mapping.

## 5. Top 5 corrections (most important first)

1. **One primary, and state the place once.**
   - Files: `components/GrammarChapterPage/preview.html`, `components/GrammarChapterMobile/preview.html`, `components/TopNav/README.md`, `components/LessonHeader/README.md`, `README.md` §Principles 2.
   - Hide or ghost the TopNav "Continue" when its target is the current chapter.
   - Replace the primary "Continue" in `fx-upnext` with a text link ("Jump to concept 2"), or drop it when the resume point is on this page.
   - Remove the "Step 1 of 4" badge from the LessonHeader meta, because StepTabs already shows it.
   - Add this rule to README §2: "The nav CTA never points at the page you are on."
2. **Design the guest state and the other two courses** (user decisions on audience and scope).
   - Files: `components/GrammarChapterPage/preview.html` and `components/TopNav/preview.html`, plus new cards `components/KanaLessonPage/` and `components/KanjiCoursePage/`.
   - Add a guest variant to the page and TopNav previews:
     - TopNav: "Start here" (primary) and "Sign in" (ghost).
     - Up-next: "Start with concept 1".
     - ChapterNav: "Start with Chapter 1" plus "Progress saved on this device".
     - Last-step ContinueBar: "Save your progress" (secondary).
   - Add the kana and kanji lesson cards built from the same shell.
3. **Put the 44px rule and the breakpoints into the CSS.** File: `components/bundle.css`, plus `components/TopNav/README.md`.
   - Set `min-height: var(--touch-target)` on `.fx-topnav__link`, `.fx-select`, `.fx-seg button` and `.fx-toc a` (or give them hit padding).
   - Use the default button size, not `--sm`, for the phone nav Continue.
   - Add `@media (max-width:1279px)` to hide `.fx-lesson__rail` and switch to 2 columns.
   - Add `@media (max-width:1023px)` for 1 column, sidebar → `.fx-chapbar`, h1 26/32, `.fx-example__ja` 24/46, and concept rail hidden. Move these out of GrammarChapterMobile's inline `<style>`.
   - Change "≥40px" to "≥44px" in TopNav/README.
4. **Fix the two contrast misses and the sidebar overflow.** Files: `tokens.json` and `tokens.css`, `components/bundle.css`.
   - Light `ink-subtle` #6b665c → **#65605a**: 4.84 on surface-hover, 5.31 on sunken, 5.14 on primary-soft.
   - `.fx-step--done .fx-step__state { color: var(--success-ink) }` (6.35, was 4.46).
   - `.fx-chapnav > * { min-width: 0 }`, and drop `white-space:nowrap` / `flex:none` on `.fx-chapnav__title .fx-select` (use `flex: 0 1 auto; min-width: 0`).
   - In the `primary` usage note, add: "never as text on primary-soft or surface-hover (light 4.12 / 3.88)".
5. **Use the live content facts from origin/main.**
   - Files: `components/StepTabs/README.md` and `preview.html`, `components/ContinueBar/README.md` and `preview.html`, `components/GrammarChapterPage/preview.html`, `components/GrammarChapterMobile/preview.html`.
   - Replace "8 words" with the learn-API count (25 for N5 ch 2). The 8 came from the deleted rail.
   - Replace "10 questions" with "6 drills · chapter test".
   - Change ContinueBar's "marks the chapter complete automatically" to "the chapter completes when the server-graded Chapter test is passed. Drills aren't saved".
   - Remove "learn the 8 words" from StepTabs/README.

**Also (lower priority):**
- Get user sign-off on, or revert, the H1 shrinking to 32px (they asked for bigger), DM Sans, and the home-canvas surface.
- Align radius with UIUX_STANDARDS §5, or record the standards change.
- Reduce "selected" to 2 recipes.
- Specify the meaning popover / InteractiveWord `<button>` (TOP15 #8) and the Listening player bar (#12).
- Reconcile "concepts 3–6 / 4–6" and space-12 / 16.
- Add a README to `components/Cover/`.
