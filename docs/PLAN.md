# FluentFoxUi — Optimization & Refactor Plan

Grounded in a four-part audit (performance, reusability, architecture, code quality) of the current
`main`. Each item lists **impact**, **effort**, the **owner agent**, concrete **files**, and
**acceptance criteria**. Phases are ordered so each is safe and independently shippable. No app code
has been changed yet — this is the reviewable plan.

> **Companion doc:** UI/UX (visual design, dark mode, motion, responsiveness, premium/Home-page
> polish) lives in **`docs/UIUX_PLAN.md`** against **`docs/UIUX_STANDARDS.md`**. Overlaps: this
> plan's Phase 3.1 (data hook / `.catch`) ↔ UIUX Phase U4 (loading/empty/error visuals); Phase 1.6
> (images) ↔ UIUX U3.8; Phase 2A `SectionHeader` ↔ UIUX U2.3. Build each shared piece once.

**Legend:** Impact 🔴 high / 🟠 medium / 🟢 low · Effort ⏱ S/M/L · Owner = which `.claude/agents/*`.

---

## Phase 0 — Correctness & quick wins (do first; low risk, high trust)

> **Progress:** 0.1 `.env.production` ✅ Done (2026-07-06) — now uses `VITE_API_URL`; NODE_ENV build warning cleared. 0.2–0.6 pending.

| # | Item | Impact | Effort | Owner |
|---|------|--------|--------|-------|
| 0.1 | **Fix `.env.production`** — it uses `NEXT_PUBLIC_API_URL`/`NEXT_BUILD_TURBO` (Next.js). Vite only reads `VITE_*`, so prod builds fall back to `''` and every API call hits a relative path → **auth silently breaks in production**. Set `VITE_API_URL=…`. | 🔴 | ⏱S | perf/arch |
| 0.2 | **Delete dead asset** `src/assets/animations/student.json` (~375 KB, imported nowhere). | 🟠 | ⏱S | perf-optimizer |
| 0.3 | **Remove stray `console.log`s**: `api/services/quizService.ts:17`, `interactiveService.ts:17`, `profileService.ts:13`, `Hero/HeroVisual.tsx:31-32`. Keep the `ErrorBoundary` `console.error`. | 🟢 | ⏱S | refactor |
| 0.4 | **Resolve `VITE_AUTH_BYPASS`** — declared in `.env.local` but no code reads it. Either implement it in the auth init path or delete it. | 🟢 | ⏱S | arch |
| 0.5 | **Type the 2 `any`s** in `utils/mdxParser.ts:98,139` (`VocabEntry[]`, a `Frontmatter` interface). | 🟢 | ⏱S | refactor |
| 0.6 | **Delete stale Next.js lint config** — `.eslintignore` references `.next/`, `next.config.js`, etc. (there's no ESLint config at all). Removed as part of 4.1. | 🟢 | ⏱S | — |

**Acceptance:** prod build points at the real API; `git grep console.log src/` clean (except boundary); no `any` in `mdxParser`; `tsc` passes.

---

## Phase 1 — Performance (highest ROI; behavior-preserving)

Baseline measured: single **`dist/assets/index-*.js` ≈ 1.58 MB**, zero code-splitting.

| # | Item | Impact | Effort | Owner |
|---|------|--------|--------|-------|
| 1.1 | **Route-level code-splitting.** Convert all 15 route elements in `src/App.tsx:16-30,116-151` to `React.lazy` + a shared `<Suspense>` fallback. Split heavy routes first: `QuizPage` (confetti+lottie), `GrammarPage` (MDX), `Classes*`, `Dashboard`/`Profile`, legal pages. | 🔴 | ⏱M | perf-optimizer |
| 1.2 | **Lazy MDX** — `api/mock/grammarData.ts:5` uses `import.meta.glob(..., { eager: true })`, inlining + parsing all 25 chapters at startup for *every* visitor (runs the heavy `mdxParser` regex on the main thread). Switch to `eager: false` and parse only the requested chapter. | 🔴 | ⏱M | perf-optimizer |
| 1.3 | **Vite `manualChunks`** in `vite.config.ts` for `framer-motion`, `cobe`, `lottie-react`, `@lottiefiles/dotlottie-react` so vendors cache independently. | 🟠 | ⏱S | perf-optimizer |
| 1.4 | **Memoize `UIContext`** (`context/UIContext.tsx:71-89`) — value object + `toggleDarkMode`/`toggleMouseFollower`/`setBackgroundAnimation` are recreated every render → app-wide re-render storm. `useMemo` the value, `useCallback` the fns. Also memoize `AuthContext.tsx:155` and `ModalContext.tsx:26` value objects. | 🔴 | ⏱S | perf-optimizer |
| 1.5 | **Globe rAF** — `components/ui/3d-globe.tsx:121-166` calls `setProjected` ~60×/sec, reconciling 13 bubbles every frame on the landing page. Drive positions via refs/`transform`; lazy-mount the globe (it's `hidden md:flex`). | 🟠 | ⏱M | perf-optimizer |
| 1.6 | **Image optimization** — `public/grammar/n5/*.png` are **1.16 MB + 1.25 MB**; convert to sized WebP/AVIF. Add `loading="lazy"` + `width`/`height` to `<img>` in `ProfileOverlay.tsx:132,212`, `Navbar.tsx:283,433`, `ProfileHero.tsx:24`, `AboutPage.tsx:119`. Compress the 163 KB 512px favicon. | 🟠 | ⏱M | perf-optimizer |
| 1.7 | **`React.memo`** pure grid cards (`CurriculumCard`, hiragana `CharCard`, etc.) — do **after** 1.4 so the wins are real. | 🟢 | ⏱S | perf-optimizer |
| 1.8 | **Stable keys** — replace index keys on mutable lists (see audit L3); leave static lists. | 🟢 | ⏱S | refactor |

**Acceptance:** rebuild shows initial JS chunk dropped from ~1.58 MB to a few hundred KB; landing route no longer loads confetti/quiz/MDX; React DevTools shows no UIContext re-render cascade on dark-mode toggle. Every change measured before/after.

---

## Phase 2 — Reusable component system ("create one component, reuse it")

Build the missing primitives, then migrate call sites. **Build → migrate → delete** duplicates.

### 2A. Build primitives (owner: component-builder) — new `src/components/ui/`
| Primitive | Replaces (from audit) |
|-----------|------------------------|
| `cn()` util (`src/lib/cn.ts`) | all manual template-literal class strings |
| `Card` (variant/padding/hoverable) | 34+ inline card shells |
| `Modal` (portal, backdrop, scroll-lock, Escape, CloseButton, size) | 3 hand-rolled modals (`AuthModal`, `QuizConfig/KanjiModal`, `ProfileOverlay`) with inconsistent behavior |
| `SectionHeader` + `Eyebrow` (variant pill/plain, align) | ~16 hand-rolled eyebrow/title/description blocks |
| `TextField` / `PasswordField` / `SelectField` / `FormLabel` | copied `inputClass`/`labelClass`/`inputCls` across Auth + Profile + QuizConfig; duplicated password-visibility toggle |
| `Button` (extend: `size`, `fullWidth`, `loading`, `as`/`asChild`) | inline submit buttons in 5+ Auth files + `<Link>`-as-button in `VerifyEmailPage` |
| `Badge`/`Chip` + `JlptBadge` + `src/lib/jlpt.ts` config | 5 duplicated JLPT color/label maps + 8 pill re-implementations |
| `StatCard` | 4 metric-cell reimplementations (Dashboard/StatsGrid, StreakCalendar, HomePage) |
| `StatusMessage` + `IconRing` | success/confirm panels in AuthModal, ForgotPassword, Otp, VerifyEmail |
| `LoadingState` / `ErrorState` / `EmptyState` | the 4 different ad-hoc loading representations |
| `src/lib/motion.ts` (`springs`, `fadeInUp`) | inline framer-motion spring configs repeated across 6 files |

### 2B. Migrate & de-dupe (owner: refactor-consolidator)
| # | Item | Impact | Effort |
|---|------|--------|--------|
| 2.1 | Merge near-duplicates: `HiraganaChart/CharGrid` + `VariantCharGrid` → one `CharGrid`; `HiraganaChart/LearningGuide` + `KanjiChart/KanjiLearningGuide` → one `LearningGuideCard`. | 🟠 | ⏱M |
| 2.2 | Rename colliding `CharCard`s → `CharOfTheDayCard` (Hero) and `KanaCard` (HiraganaChart); both consume `<Card>`. | 🟢 | ⏱S |
| 2.3 | Route all inline auth/quiz submit buttons through `<Button>`; all close buttons through `<CloseButton>`; raw `material-symbols` spans through `<Icon>`. | 🟠 | ⏱M |
| 2.4 | Replace 34+ card shells with `<Card>`, ~16 headers with `<SectionHeader>`, JLPT maps with `jlpt.ts`/`<JlptBadge>`, metric cells with `<StatCard>`. | 🟠 | ⏱L |
| 2.5 | Add missing barrel `components/sections/QuizConfig/index.ts`; standardize barrels per the standards. | 🟢 | ⏱S |

**Acceptance:** `git grep 'bg-surface-container-low.*rounded'` and the JLPT-map / inputClass greps collapse to the primitives; no visual/behavior change (eyeball key screens); `tsc`/build green.

---

## Phase 3 — State & data-fetching architecture

| # | Item | Impact | Effort | Owner |
|---|------|--------|--------|-------|
| 3.1 | **Shared data hook.** Add `src/hooks/useAsync.ts` returning `{data, loading, error, refetch}` with an unmount guard, then wrap each domain: `useDashboard`, `useKanji`, `useProfile`, `useHiragana`, … Fixes the missing-`.catch` "stuck skeleton forever" bug in `DashboardPage.tsx:60`, `ProfilePage.tsx:12`, `HiraganaPage.tsx:15`, `KanjiPage.tsx:18`, `CurriculumGrid.tsx:10`, `InteractiveWidget.tsx:11`, `Newsletter.tsx:12`, `QuizConfig.tsx:20`. | 🔴 | ⏱M | architect→builder |
| 3.2 | **(Optional, recommended) TanStack Query** for real server data (caching/dedupe/retry). Call sites stay `const { data, isLoading, error } = useX()`. Adds `@tanstack/react-query`. | 🟠 | ⏱M | architect |
| 3.3 | **Consolidate auth** — today split across `AuthContext.user`, `authStore` (token), `tokenManager` (refresh), and `localStorage['ff_auth_user']`, hand-synced from 3 layers. Move to **one Zustand slice** (`user`+`accessToken`+`status`) with `persist`; keep refresh token in `tokenManager`; do boot-refresh in one `initAuth()`. `useAuth()` becomes a selector so consumers don't change. | 🟠 | ⏱L | architect |
| 3.4 | **Fix inverted layering** — `authService.ts:24` imports `AuthUser` *from* `context/AuthContext`. Move `AuthUser` (and the `classes` domain types living in `api/mock/classes.ts`) to `src/types`. | 🟠 | ⏱S | refactor |
| 3.5 | **Service layer for everything** — add `grammarService`/`classesService`; stop importing `@/api/mock/*` directly in `GrammarPage`, `GrammarSidebar`, `Navbar`, `Footer`, `ClassesPage`, `ClassDetailPage`. Add a `VITE_USE_MOCK` toggle in `src/lib/config.ts` so mock↔real is one flag, not 11 edits. Enforce with `no-restricted-imports`. | 🟠 | ⏱M | architect→refactor |
| 3.6 | **UI store** — replace `UIContext`'s 3 manual `localStorage` effects with a Zustand `persist` slice. Keep `ModalContext` as Context (correctly ephemeral). | 🟢 | ⏱M | architect |
| 3.7 | **Unify user profile** — `AuthUser` (never populated), `UserProfile`, and `UIContext.overlayProfile` are 3 drifting shapes (`DashboardPage.tsx:67` always shows "Learner"). Pick one and populate it. | 🟠 | ⏱M | architect |

**Acceptance:** a rejected service shows `<ErrorState>` (not an infinite skeleton); one auth source of truth; no `@/api/mock` imports outside `src/api` (lint-enforced); `import.meta.env` read only in `lib/config.ts`.

---

## Phase 4 — Tooling, structure, a11y, docs

| # | Item | Impact | Effort | Owner |
|---|------|--------|--------|-------|
| 4.1 | **ESLint flat config** (`typescript-eslint`, `react-hooks`, `jsx-a11y`, `no-restricted-imports` for mocks) + `npm run lint`; delete the stale Next.js `.eslintignore`. | 🟠 | ⏱M | architect |
| 4.2 | **Prettier** + `npm run format` — settles the semicolon split (8 files use `;`, the rest don't). Run once repo-wide. | 🟢 | ⏱S | architect |
| 4.3 | **Split oversized components** (>~150 lines / multi-responsibility): `Navbar.tsx` (493 → mobile drawer + avatar menu), `ClassDetailPage.tsx` (460 → extract `StarRating`/`RatingBar`/`ReviewCard`/`AccordionItem`), `GrammarContent.tsx` (459 → block renderers), `SignUpForm.tsx` (420 → steps). | 🟠 | ⏱L | refactor |
| 4.4 | **A11y fixes** — keyboard-enable interactive `<div>`s in `KanjiChart/KanjiCard.tsx:52`, `Profile/ProfileHero.tsx:15`; add `aria-label` to `QuizConfig/KanjiModal` close button; improve generic `alt="Avatar"`. | 🟠 | ⏱S | refactor |
| 4.5 | **Docs** — JSDoc on every `ui/` primitive and shared hook; a short `README.md`; comment the `mdxParser` regex. Raise coverage from ~8%. | 🟢 | ⏱M | builder |
| 4.6 | **Type `import.meta.env`** in `vite-env.d.ts` via an `ImportMetaEnv` interface. | 🟢 | ⏱S | refactor |

**Acceptance:** `npm run lint` and `format:check` pass in CI; no component > ~200 lines; primitives documented.

---

## Suggested execution order
1. **Phase 0** (an afternoon; builds trust, fixes the prod bug).
2. **Phase 1.1–1.4** (the bundle + re-render wins — biggest user-visible speed gain).
3. **Phase 2A then 2B** (primitives first, then migrate — this is the "reusable component" core).
4. **Phase 3.1** (kill the stuck-skeleton bug), then 3.3–3.5 (state/architecture).
5. **Phase 4** (tooling + polish) — 4.1/4.2 can run early to guard everything after.

## How to run it (with the agents)
- `frontend-architect` — approve/refine this plan, own Phase 3 decisions and Phase 4.1.
- `component-builder` — Phase 2A (primitives), 4.5 (docs).
- `refactor-consolidator` — Phase 2B, 3.4, 4.3, 4.4, plus 0.3/0.5.
- `perf-optimizer` — Phase 0.1/0.2 and all of Phase 1 (always measure before/after).
- `frontend-reviewer` — review each phase's diff against `docs/FRONTEND_STANDARDS.md` before merge.

> Every task is behavior-preserving unless explicitly flagged. Keep `src/api/client.ts`,
> `errors.ts`, `tokenManager.ts`, and `RequireAuth.tsx` intact — they are the strongest parts of
> the codebase.
