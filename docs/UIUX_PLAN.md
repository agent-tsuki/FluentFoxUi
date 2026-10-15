# FluentFoxUi — UI/UX Improvement Plan

From a two-part design audit (visual/premium-feel + responsiveness/interaction) of the current
`main`. Split into **must-fix** (defects / broken-in-dark-mode / a11y) and **can-improve** (polish),
then a **Home-page** tightening plan. Pairs with `docs/UIUX_STANDARDS.md` (the target) and
`docs/PLAN.md` (engineering plan — cross-referenced where items overlap). No app code changed yet.

**Legend:** Impact 🔴 high / 🟠 medium / 🟢 low · Effort ⏱ S/M/L · Owner = which `.claude/agents/*`.
Overall verdict: **strong bones, half-shipped dark mode + a few templated/inconsistent choices.**
Needs a consolidation pass, not a redesign.

---

## Phase U0 — Systemic must-fixes (small changes, app-wide impact)

> **Status: ✅ Done (2026-07-06)** — all 6 items applied; `tsc && vite build` green. Best eyeballed in the running app, in both themes.

| # | Item | Impact | Effort | Owner |
|---|------|--------|--------|-------|
| U0.1 | **Fix the radius scale.** `tailwind.config.ts:75-80` overrides `rounded-full` → **12px**, so all 118 `rounded-full` uses (avatars, icon badges, pills, and the `RequireAuth`/`QuizGame` **spinners**) render as squircles; scale is also non-monotonic (`full` < `2xl`). Set `full: '9999px'` and make the scale monotonic (sm 6 / lg 12 / xl 16 / 2xl 20). | 🔴 | ⏱S | ui-ux-reviewer→builder |
| U0.2 | **Fix `Button` dead styles.** `Button.tsx:22`: `hover:scale-102` is invalid (→ `hover:scale-[1.02]`); `transition-[transform,colors,shadow]` lists non-properties (use `transition-transform` or `transition`). Also replace non-existent `duration-250` in `FeaturesSection.tsx:44`, `CTABanner.tsx:30`. | 🔴 | ⏱S | refactor |
| U0.3 | **Fix Hero "live" pulse dot.** `Hero.tsx:78-83` uses inline `animation:'ping…'` but the `ping` keyframe is never emitted (no `animate-ping` usage anywhere) → the indicator is static. Use `animate-ping` or define the keyframe in `index.css`. | 🟠 | ⏱S | refactor |
| U0.4 | **Scope `user-select`.** `index.css:63-66` disables selection on `body` app-wide → learners can't copy Japanese text/readings/vocab. Scope `user-select:none` to chrome/decoration; set `user-select:text` on content containers. | 🔴 | ⏱S | ui-ux-reviewer→refactor |
| U0.5 | **Add global `prefers-reduced-motion`.** 0 support today across ~15 animation systems. Add a global reduce rule; make `FadeIn`/Hero entrance render final state immediately; pause petals/koi/globe/shimmer/streak-flame under reduced motion. | 🔴 | ⏱S | responsive-auditor→refactor |
| U0.6 | **Remove dev/placeholder copy.** Hardcoded dev name **"Shivam"** in DashboardPreview marketing (`DashboardPreview.tsx:65`). Replace with realistic sample data. | 🟠 | ⏱S | refactor |

**Acceptance:** circles/spinners are round; buttons visibly scale on hover; Hero dot pulses; Japanese
text is selectable; reduced-motion users get relief; no dev names in copy. Verify in **both themes**.

---

## Phase U1 — Finish dark mode (it's only half-shipped)

| # | Item | Impact | Effort | Owner |
|---|------|--------|--------|-------|
| U1.1 | **DashboardHero light-on-light.** `DashboardHero.tsx:42-64` uses `bg-on-surface text-inverse-on-surface` (both flip to light in dark) + `text-white/60`, `bg-white/20`, `border-white/5`. Introduce a **`surface-inverse`/brand-dark token** (dark in both themes) and rebuild on it. | 🔴 | ⏱M | ui-ux-reviewer→builder |
| U1.2 | **Tokenize the `#2f2521` brown panel** hardcoded in `StatsBar.tsx:64`, `HowItWorks.tsx:23`, `DashboardPreview.tsx:46`, `Hero/CharCard.tsx:51` → the `surface-inverse` token from U1.1. | 🟠 | ⏱S | refactor |
| U1.3 | **Semantic status tokens.** Add `success`/`warning`/`info` (light+dark) and replace raw `bg-green-100`/`bg-amber-400`/`bg-green-500/10` in `StudyLog.tsx:104`, `SignUpForm` strength bar, `VerifyEmailPage.tsx:140,177,207`. | 🟠 | ⏱M | builder→refactor |
| U1.4 | **Dark-aware shadows.** All bespoke shadows use `rgba(25,28,29,…)`/`rgba(0,0,0,…)` → invisible on charcoal (`Navbar.tsx:204`, `StudyLog.tsx:45`, `StreakCalendar.tsx:123`, `AuthModal.tsx:78`, `FlashCard.tsx:16`, `VerifyEmailPage.tsx:95`). Replace with the elevation tokens from U2.1. Also strengthen faint `outline-variant/20` borders. | 🟠 | ⏱M | builder→refactor |
| U1.5 | **`bg-white` tiles glare.** `MilestoneList.tsx:39,42`, `CurriculumCard.tsx:11` — swap to surface tokens. | 🟢 | ⏱S | refactor |
| U1.6 | **Theme-reactive components.** `XAuthButton.tsx:52` reads `classList.contains('dark')` once at render (won't recolor on toggle). Use a `useTheme()`/UI-store value or a MutationObserver like GoogleAuthButton. | 🟢 | ⏱S | refactor |
| U1.7 | **Radar chart hardcodes light colors.** `LearningBalance.tsx:71,87,97,110,126` use `#E7BCBA`/`#EA6B44`/`#926e6c` and `fontSize={7}`. Use `currentColor`/CSS vars + readable label size. | 🟠 | ⏱S | refactor |

**Acceptance:** every home + dashboard + auth screen is correct in dark mode — no light-on-light, no
invisible elevation, no glaring white tiles, status colors adapt.

---

## Phase U2 — Design-system consolidation

| # | Item | Impact | Effort | Owner |
|---|------|--------|--------|-------|
| U2.1 | **Elevation system.** Replace ~20 ad-hoc `shadow-md/lg/xl/2xl` + 15 bespoke `shadow-[…]` with 3 named dark-aware elevation tokens. | 🟠 | ⏱M | builder |
| U2.2 | **Type scale.** Replace 80+ `text-[9/10/11px]` with `text-xs`/a defined `text-2xs` (min 12px content). Replace arbitrary `text-[3.3rem]/[2.8rem]/[2.4rem]` headings with 2–3 defined display sizes; make hero/section headings fluid `clamp()`. | 🟠 | ⏱M | builder→refactor |
| U2.3 | **One eyebrow recipe.** Consolidate the 5 tracking values (`[0.2em]/[0.3em]/[2px]/[0.25em]/[0.18em]` + `tracking-tighter`) and mixed weights into the `<SectionHeader>`/`<Eyebrow>` primitive (see `docs/PLAN.md` 2A). | 🟠 | ⏱M | builder→refactor |
| U2.4 | **Icon consistency.** Replace emoji UI icons (📖🃏✏️ in `FeaturesSection`, DashboardPreview nav) with `<Icon>`; unify icon sizing on Tailwind `text-*` (drop inline `fontSize` in `ClassesPage`/`ClassDetailPage`). | 🟠 | ⏱M | refactor |
| U2.5 | **Section rhythm + nav-height token.** One section `py` (e.g. `py-20 md:py-28`); one nav-height value replacing `68/73/pt-24/28/32` across `HomePage`, `GrammarPage`, `ClassesPage`, `AboutPage`, `DashboardPage`, Navbar drawer. | 🟠 | ⏱M | refactor |

**Acceptance:** greps for `text-[9px]`, `shadow-[`, and arbitrary tracking collapse to tokens/
primitives; sections share rhythm; one nav-offset source of truth.

---

## Phase U3 — Responsiveness & interaction

| # | Item | Impact | Effort | Owner |
|---|------|--------|--------|-------|
| U3.1 | **`InteractiveWord` is hover-only → dead on touch** (core learning feature). `InteractiveWord.tsx:70-71` reveals reading/meaning via `onMouseEnter/Leave` only. Add tap-to-toggle + `tabIndex`/`onFocus`/`role="button"`; dismiss on outside tap. | 🔴 | ⏱S | responsive-auditor→refactor |
| U3.2 | **Nav dropdowns/avatar menu hover-only at `md`** → unreachable by tap/keyboard on tablets. `NavDropdown.tsx:19`, `Navbar.tsx:299`. Convert to click/tap disclosure + `focus-within`, close on outside/Esc. | 🔴 | ⏱M | responsive-auditor→refactor |
| U3.3 | **StatsBar never responsive** (4-across, unreadable at 320px). `StatsBar.tsx:37,64` → `grid grid-cols-2 md:grid-cols-4`, `md:` divider. (May be removed entirely — see U1/Home.) | 🟠 | ⏱S | refactor |
| U3.4 | **QuizProgress fixed `w-[800px]`** clipped < ~880px. `QuizProgress.tsx:12,14` → `w-full max-w-[800px]` + `flex-wrap`. | 🟠 | ⏱S | refactor |
| U3.5 | **Mobile drawer: no scroll-lock / Esc / focus trap.** `Navbar.tsx:382-490`. Lock body scroll while open, add Esc + `role="dialog" aria-modal`. | 🟠 | ⏱S | refactor |
| U3.6 | **Touch targets < 44px.** Dark toggle & hamburger `w-9 h-9` (36px, `Navbar.tsx:266,370`), `CloseButton` `w-8 h-8` (32px), streak pill, course "Visit →", footer links. Raise to `min-w-11 min-h-11` / add hit padding. | 🟠 | ⏱M | refactor |
| U3.7 | **Fluid type + min sizes.** Hard jumps (`text-4xl md:text-[3.3rem]` etc.) → `clamp()`; raise `text-[9px]/[10px]` labels to ≥ 11–12px on mobile. (Overlaps U2.2.) | 🟠 | ⏱M | refactor |
| U3.8 | **Responsive images.** Add `width`/`height` to all `<img>` (avatars, grammar); conditionally **render** (not just `hidden`) `HeroVisual` above `md` so mobile skips the globe + its 13 remote images; self-host/lazy those avatars. (Overlaps `docs/PLAN.md` 1.6.) | 🟠 | ⏱M | responsive-auditor→perf |
| U3.9 | **Viewport & units.** Add `viewport-fit=cover` + `env(safe-area-inset-top)` on fixed nav (`index.html`); switch `100vh` → `100dvh` in `GrammarSidebar.tsx:24`, `GrammarContent.tsx:287`, `GrammarPage.tsx:12`. | 🟢 | ⏱S | refactor |

**Acceptance:** no horizontal scroll at 320px; every tap-required interaction works by touch +
keyboard; targets ≥ 44px; headings scale fluidly; mobile skips the globe's remote images.

---

## Phase U4 — Loading / skeleton / empty / error (design side)

Shares the engineering fix in `docs/PLAN.md` **Phase 3.1** (the shared data hook that adds `.catch`).
This phase is the **visual** half:

| # | Item | Impact | Effort | Owner |
|---|------|--------|--------|-------|
| U4.1 | Build shared `LoadingState` / `ErrorState` / `EmptyState` (see `docs/PLAN.md` 2A) with a subtle **shimmer**; error states on-brand + retry. | 🟠 | ⏱M | builder |
| U4.2 | Add **layout-matching skeletons** to Kanji, Hiragana, Profile (mirror `DashboardSkeleton`) instead of spinner/`null`/nothing (`KanjiPage.tsx:18`, `HiraganaPage.tsx:15`, `ProfilePage.tsx:12`). | 🟠 | ⏱M | builder→refactor |
| U4.3 | **Designed empty states** for filterable views (Classes platform/level filters, Kanji filter). | 🟢 | ⏱S | builder |
| U4.4 | **Cap the QuizResults celebration.** `QuizResults.tsx:67-144` runs 9+ concurrent Lotties + a forever `setInterval` confetti. Reduce to a single 2–3s burst, gated on reduced-motion. | 🟠 | ⏱S | refactor |

---

## Home page — section-by-section verdict

Current order: Hero → StatsBar → Features → HowItWorks → Courses → DashboardPreview → Testimonials → CTA.

| # | Section | Verdict | Action |
|---|---------|---------|--------|
| 1 | **Hero** | Premium copy, **off-brand/templated visual** | **Keep + fix visual** — replace the Aceternity globe (`HeroVisual.tsx:3-16`, loads 13 external stock faces, `onMarkerClick` logs) with the on-brand `CharCard` (already built, currently unused); fix TrustAvatars inline hex + squircle borders; fix the dead ping dot. |
| 2 | **StatsBar** | Filler + **redundant** (3rd copy of "50k learners") | **Remove / fold into Hero** as a single trust strip. |
| 3 | **FeaturesSection** | Strongest section, on-brand | **Keep + simplify** — swap emoji icons → `<Icon>`; tokenize pastel `iconBg`. |
| 4 | **HowItWorks** | Clear, 100% hardcoded colors | **Keep + tokenize** (uses `#2f2521`, white text, `#EA6B44`, squircle number badges). |
| 5 | **CoursesSection** | Bloated, **duplicates** the Features "Free Courses" card *and* the whole `/classes` page | **Simplify 6→3 + "Browse all →"** link; tokenize its 15 hex values. |
| 6 | **DashboardPreview** | Good product proof | **Keep + fix + move up** — remove dev name "Shivam"; emoji nav → `<Icon>`; tokenize `#2f2521`. This is the differentiator — show it earlier. |
| 7 | **Testimonials** | Useful social proof | **Keep + strengthen** — fix inline-hex squircle avatars + hardcoded `#ccc` stars; add JLPT-pass badges/logos for authenticity. |
| 8 | **CTABanner** | Strong closer, on-brand (`がんばれ`) | **Keep** — swap `#EA6B44`→`bg-primary`, black shadow→token. |

**Cross-cutting:** "50,000+ learners" appears 3× (Hero badge + trust line + StatsBar); "Free Courses"
appears 3× (Feature card + Courses section + `/classes`); stats repeat in DashboardPreview. **Say each
thing once.**

**Recommended tightened order (premium + conversion):**
**Hero** (brand visual + one trust strip) → **Features** → **DashboardPreview** (product, front-loaded)
→ **HowItWorks** → **Courses** (3 + link) → **Testimonials** → **CTA.** Drops the redundant StatsBar,
de-dupes courses, front-loads the unique value, and alternates surface tones for rhythm.

---

## Suggested execution order
1. **Phase U0** (systemic quick wins — radius, button, selection, reduced-motion) — instantly lifts the whole app.
2. **Phase U1** (finish dark mode) — the biggest "feels unfinished" fix.
3. **Phase U3.1–U3.5** (touch/interaction defects) — real broken behavior.
4. **Home-page tightening** (U1 tokens + the section table) — the premium/authentic goal.
5. **Phase U2** (design-system consolidation) + **U4** (states) — durable polish; pairs with `docs/PLAN.md` Phase 2.

## Running it with the agents
- `ui-ux-reviewer` — owns U0.1/U0.4, U1.1, and reviews every UI change against `docs/UIUX_STANDARDS.md`.
- `responsive-auditor` — owns U0.5, U3.1/U3.2/U3.8, and the responsive scorecard.
- `component-builder` — builds tokens/primitives (elevation, type, status colors, state components).
- `refactor-consolidator` — applies the tokenization/migration across call sites.
- `perf-optimizer` — the image/globe work in U3.8 (overlaps `docs/PLAN.md` 1.6).

> Overlap map with `docs/PLAN.md`: U4↔Phase 3.1 (data hook/`.catch`), U3.8↔1.6 (images), eyebrow/
> SectionHeader↔Phase 2A. Do the shared primitive once; both plans consume it.
