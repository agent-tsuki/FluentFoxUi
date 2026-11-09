# FoxSensei Home — UI/UX review (02)

Scope: live https://www.foxsensei.com/ (shot 2026-11-09) and `src/pages/HomePage.tsx` → `src/components/sections/HomePage/ConceptHome.tsx` + `HowItWorks.tsx` + `howItWorksDemos.tsx`, `src/index.css` (`--home-*`, `.concept-*`), `src/components/layout/Navbar/Navbar.tsx`, `src/components/layout/Footer/Footer.tsx`, `src/hooks/useStartLearning.ts`.
Authority: `docs/UIUX_STANDARDS.md`, `docs/FRONTEND_STANDARDS.md`, and the new design system (DS) at `scratchpad/ds/project/README.md` + `tokens.css`/`tokens.json`.

Screenshots (all in `(session files, not committed) shots-ux/`):
`light-1440-fold.png`, `light-1440-full.png`, `dark-1440-fold.png`, `dark-1440-full.png`, `light-768-fold.png`, `light-768-full.png`, `dark-768-fold.png`, `dark-768-full.png`, `light-390-fold.png`, `light-390-full.png`, `dark-390-fold.png`, `dark-390-full.png`.
Dark shots use `colorScheme: 'dark'` so the React night scene (`changes.webp`) loads. If you only add `.dark` to `<html>`, the CSS tokens flip but `HeroImage` keeps the day photo, because it reads `useUI().darkMode` and not the class.

---

## A. Verdict

The hero looks good. The page does not sell the product. At 1440 the light hero (sakura, Fuji, red bridge) and the Yoru night version are beautiful and clearly Japanese, and they are the strongest first impression the product has ever had. Then the 5-second test fails. "A little Japanese. A whole new world." does not say what FoxSensei is (a free course that teaches you to read Japanese: kana → kanji → grammar, with spaced review). The only orange CTA, "Find my starting point", promises a placement test that does not exist (`src/lib/content/home/howItWorks.ts:4` says not to promise one). For guests it opens the sign-up modal (`useStartLearning.ts:17-20`). For signed-in users it silently jumps to `/dashboard`.

Below the hero the page is a single long column: four identical "step + Try-it panel" rows (~2,400px at 1440, ~3,500px at 390). There is no proof (no certificate, no real product UI, no fox), no change of surface tone, and a second, different primary CTA at the end ("Start hiragana" → `/kana/hiragana`). The nav adds a third ("Sign in / up" → login modal), in orange in light mode. After login the page is identical, so a returning learner gets a marketing page instead of their next step.

The home page also runs on a third design language (`--home-*` palette, DM Serif Display, `.concept-*` classes, a 0.16em eyebrow, pill buttons). The new DS explicitly folds this into `surface`/`leaf`/`display`, so the home page is now the furthest page from the system.

Ratings (1–5)
| Dimension | Rating | Note |
|---|---|---|
| First impression / imagery | 4 | Hero art is premium. The bottom ~25% of the fold is empty mist, and nothing visual follows the hero. |
| 5-second value proposition | 2 | Poetic, not specific. No "free", no "read Japanese", no kana/kanji/grammar in the fold. |
| Single clear CTA | 1 | Three different primaries (nav sign-in, hero sign-up modal, closing Start hiragana). The hero label misrepresents what happens. |
| Hierarchy & rhythm | 2 | Hero is strong. After it, four same-weight rows with no focal point and no tone change. |
| Proof / credibility | 1 | None. Only "free account" caveats in small print. |
| Color & contrast | 3 | Text tokens pass on canvas. `home-subtle` text and `line-strong` control borders fail. Hero body text sits on busy photo at 390/768. |
| Typography | 2 | Off-system display face (DM Serif), arbitrary clamp/tracking, three eyebrow recipes. |
| Motion | 3 | Petals are lovely and reduced-motion-gated, but there are two infinite loops (photo drift + canvas) and petals cross body copy. |
| Japanese-ness / authenticity | 4 | Scenery, kana demos and Zen Maru glyphs are authentic. The fox (the brand) is absent apart from the 32px logo. |
| Guest → sign-up path | 2 | Sign-up is asked for first (hero) instead of after a first win. DS principle 7 says the opposite. |
| Signed-in experience | 1 | Not handled. |

---

## B. Must fix (defects)

1. **The hero CTA label does not match what it does.** `ConceptHome.tsx:36-44` reads "Find my starting point" but calls `startLearning` (`useStartLearning.ts:17-20`): the sign-up modal for guests, `/dashboard` for members. There is no placement flow (`howItWorks.ts:4`). Fix: guest → "Start with hiragana" (`<Link to="/kana/hiragana">`), matching DS TopNav ("Start here" → Kana chapter 1, not sign-up). Signed-in → render the signed-in home (section E). Screenshot: `light-1440-fold.png`.
2. **Three competing primaries; the fold has two oranges.** Nav `Navbar.tsx:281-287` (`variant="inverse"`, renders `primary` orange in light), hero `ConceptHome.tsx:36-44`, closing `HowItWorks.tsx:43-49`. DS rule: "one `primary` per view; two oranges on one screen means one of them is wrong." Fix: the nav guest slot becomes ghost "Sign in" plus one primary "Start here". On `/` the hero owns the primary, so hide the nav primary while the hero is in view (or make it secondary). The closing CTA must be the same action as the hero, not a different one. Screenshots: `light-1440-fold.png`, `light-768-fold.png`.
3. **Hero body copy is unreadable on narrow screens.** At 390 and 768 the paragraph (`ConceptHome.tsx:33`, `text-home-muted`) runs over the trees and house. Sampled photo behind "always / journey" is ~rgb(126,142,127), so `home-muted` text there is about **1.8:1**. The left-to-right wash (`index.css:649-657`, 90deg, fades out by 68%) does nothing in portrait. Fix: under `md`, add a bottom-up `home-wash` gradient behind the text column (or put the copy block on a `bg-home-canvas/80` panel with no blur), and shift the portrait crop with `object-position` so the village sits below the copy. Screenshots: `light-390-fold.png`, `light-768-fold.png`.
4. **Faint text fails AA.** "At your pace. On your own path." `ConceptHome.tsx:50` uses `text-xs text-home-subtle`: `#747c72` on `#f7f6f0` = **3.98:1** at 12px, and lower over the mist. Fix: delete the line (it repeats the eyebrow's sentiment). If kept, use `text-home-muted` (5.7:1) or DS `ink-subtle` `#65605a`.
5. **Control borders are invisible (WCAG 1.4.11).** `--home-line-strong` `#d7d8ca` on `home-tile` = **1.42:1** light, **1.66:1** dark (`index.css:68,143`). It is the only boundary on `.concept-demo-btn`, `.concept-kana-tile` and the dashed grammar slots (`index.css:584,608`, `howItWorksDemos.tsx:134`). Fix: map to DS `line-strong` (`#8a8478` Washi / `#6b7699` Yoru, both ≥3:1) and keep `line` for decorative hairlines only. Screenshot: `light-1440-full.png` (demo buttons).
6. **Nav CTA wraps at 768.** "Sign in / up" breaks onto two lines in a squashed pill (`Navbar.tsx:281-287`, `light-768-fold.png`, `dark-768-full.png`). Fix: `whitespace-nowrap`, and shorten to "Sign in" (ghost) per DS TopNav.
7. **Loops forever.** `ConceptHome.tsx:85` `animate-[concept-drift_25s_ease-in-out_infinite_alternate]` and the petals canvas (`FallingPetals.tsx`, rAF until unmount, still running when scrolled off-screen). Standards §7: "Nothing loops forever." Fix: run drift once (`1` iteration, ~12s, `forwards`). Pause petals with an IntersectionObserver when the hero leaves the viewport and on `visibilitychange`. Cap petals to a gentle burst (e.g. 60s), then let them settle.
8. **Petals cross body text.** In `dark-1440-fold.png` petals sit on "stories" and "journey". The canvas is `z-index: 4` (`index.css:641-647`) and the copy is `z-10`, so they render under the text but still fragment glyphs visually. Fix: mask the canvas's left 45% with `mask-image: linear-gradient(90deg, transparent 0 45%, #000 60%)`, since the source points are all at x ≥ 0.49 anyway.
9. **Signed-in users get the guest page.** `HomePage.tsx:1-5` always renders `ConceptHome`. The owner's requirement "change after login" is unmet. See section E.
10. **Footer seam in light.** `Footer.tsx:39` `bg-surface-container-low` (cool grey `#f3f4f5`) under warm `home-canvas` `#f7f6f0`, with `border-outline-variant/20` (pink, too faint per §2). Fix: footer on DS `surface-sunken` with a `line` top border. Screenshot: bottom of `light-1440-full.png`.

## C. Should (polish, ranked by impact)

1. **Rewrite the hero for the 5-second test.** Keep the poetry as the eyebrow, make the H1 concrete, and keep body copy to one line.
   - Eyebrow: "Free · Kana → Kanji → Grammar"
   - H1: "Learn to read Japanese." / "One small step at a time."
   - Body: "Start with あ today. No account needed."
   This removes the "A little Japanese / a whole new world" plus "From your first あ…" double-intro, and fills the empty bottom third of the fold (point 3).
2. **Use the empty bottom 25% of the fold for proof.** At 1440 the area from y≈720–900 is mist (`light-1440-fold.png`). Put a single honest fact strip there on the wash, with no box: "92 kana · 245 kanji (N5–N4) · 25 grammar chapters · Free certificates". Every number already exists in `howItWorks.ts:36-56`. Say it once and remove those numbers from the step bodies, or keep them only there.
3. **Break the monotone middle.** The four `StepRow`s (`HowItWorks.tsx:29-33`) have equal weight, equal panels and equal 96px gaps. Fix:
   - Keep one hero demo (Kana, the first win) at full size.
   - Compress steps 02–04 into a 3-up path rail (DS ConceptSection rail: numbered discs on a hairline, done → now → next), each with a small glyph tile (木/私は/山) and one link.
   - Offer the kanji/grammar/review demos as progressive reveal ("Try the other three"), per DS principle 6.
   This roughly halves page length on mobile (`light-390-full.png` is 4,900px).
4. **Alternate surface tone (§11).** Everything after the hero is `home-canvas`. Put the path/proof band on `surface-sunken` (or `leaf-soft`) so the page has rhythm.
5. **Bring the fox in, once.** The brand character appears only as the 32px nav logo. One authentic touch is enough: the fox mark beside the closing CTA, or the fox in the certificate preview. Not a mascot carousel.
6. **Show the product.** Add one real artefact as proof: the kana certificate, or a ContinueCard/dashboard tile rendered with sample (not fake-stat) data. `DashboardExample.tsx` exists but is orphaned and uses old tokens. Rebuild it on DS tokens, or use a static, honest screenshot.
7. **Demo panel heights.** The grammar and review panels have large empty bottoms (`light-1440-full.png` step 03), caused by `Feedback min-h-12` plus `disabled:invisible` buttons that still take space (`howItWorksDemos.tsx:12,163,223`). If the rail in point 3 is adopted this goes away. Otherwise align the panels with `md:items-stretch` and centre the content.
8. **Gap between hero and first section.** The `100svh` hero, the wash fade and `lg:py-28` leave ~250px of blank canvas before "How FoxSensei works" (`light-1440-full.png`). Reduce `HowItWorks.tsx:20` top padding to `pt-12 lg:pt-16`, or overlap the proof strip into the fade.
9. **Hero eyebrow pill.** `ConceptHome.tsx:26` uses `backdrop-blur-sm` + border + tint, all three stacked (§0 rule 3; DS: "no frosted glass"), and wraps to two lines at 390 (`light-390-fold.png`). Make it a plain DS `eyebrow` with no pill.
10. **Accent used decoratively.** The romaji "a" is `text-home-accent-hover` (`howItWorksDemos.tsx:45`) and the H1 "new world." is accent (`ConceptHome.tsx:30`). Together with two CTAs that makes four orange items above the first scroll. Keep orange for the CTA only. Use `ink` for the H1 emphasis (or `leaf` if a second hue is needed) and `ink-muted` for romaji.
11. **Footer credits line.** The nine "AivisSpeech:…" credits read as noise at the end of a premium page (`light-1440-full.png`). Move them to `/about` (credits) with a "Voice credits" link.

## D. Could

- `See how it works ↓` (`ConceptHome.tsx:45-48`) could become "Try a kana first ↓" so the secondary action promises the interactive win.
- Kana demo: add audio (the app ships AivisSpeech voices). "Tap a sound" currently plays no sound, which is the most authentic win available.
- Theme-aware petals: in Yoru, fewer, slower petals and a faint lantern glow read calmer.
- Zen Maru Gothic is already used for demo glyphs (`tailwind.config.ts:117` `font-jp`). Use it, per DS `kana-display`, for one large decorative あ beside the H1 on desktop, instead of the accent-coloured words.

## Typography, tokens and shape: drift from the DS (all must move)

| Today | File:line | DS target |
|---|---|---|
| `DM Serif Display` for H1 and section titles | `index.css:468-471, 517-531` | `display` (Plus Jakarta Sans 700, 48 → 36 on phone), `h1` 40 → 30, `h2` 26. The DS lists DM Serif as "not carried over". |
| `.concept-home { font-family: DM Sans }` | `index.css:464-466` | Matches DS `sans`. Move it to the global body and delete the Inter-on-other-pages split. |
| H1 `text-[clamp(2.75rem,5vw,5rem)] tracking-[-.03em] leading-[1.06]` | `ConceptHome.tsx:27` | `.display` token with a fluid clamp defined once in Tailwind (`text-display`). |
| Eyebrow recipes: `.concept-eyebrow` 0.16em/700, `.concept-label` 0.12em/600, `ui/SectionHeader` `Eyebrow` 0.18em | `index.css:473-482, 534-540`; `SectionHeader.tsx:16,28` | One recipe: DS `eyebrow` 12px/700/0.12em. Fix `Eyebrow` and delete both concept classes. |
| Buttons hand-rolled `rounded-full` pills, twice | `ConceptHome.tsx:40`, `HowItWorks.tsx:45` | `ui/Button` with DS `primary`/`lg` (52px, `radius-md` 8). Golden rule 1: never fork the primitive. |
| Links hand-rolled `.concept-text-link` / `.concept-step-link` | `index.css:494-512, 543-563`; `HowItWorks.tsx:91-98` | `ui/TextLink`. |
| Demo panel `radius 1rem`, kana tile `0.875rem`, demo button `0.75rem` | `index.css:568, 609, 585` | Card `radius-lg` 12, tile `radius-md` 8, button `radius-md` 8. |
| `--home-*` palette (17 tokens) | `index.css:61-78, 136-153`; `tailwind.config.ts:10-27` | `surface` (= home canvas), `surface-raised` (= home tile), `surface-sunken`, `ink`/`ink-muted`/`ink-subtle`, `line`/`line-strong`, `primary`/`on-primary`, `leaf`. Note: DS Yoru `surface` is `#0f1528` (today's `home-hero`), not `#0B1020`. |
| `shadow-elevation-2` on CTA plus `hover:-translate-y-0.5` | `ConceptHome.tsx:40`, `HowItWorks.tsx:45` | DS buttons are flat; motion `duration-fast` 120ms. Elevation is for cards and menus only. |
| Section rhythm `py-20 lg:py-28`, `mt-14/16/20/24` | `HowItWorks.tsx:20,29,35,40` | DS space scale: sections `space-16` (64) mobile / 96–112 desktop, defined once. |

Dead code: `HomeHero`, `LevelPicker`, `LearningPath`, `PathBoard`, `PathTrack`, `DashboardExample`, `WhyItWorks`, `ResourcesSection`, `FounderSection`, `FaqSection`, `FinalCta`, `TryLessonCard` (~1,500 lines, exported from `HomePage/index.ts:1-9` and mounted nowhere) plus their `src/lib/content/home/*` copy. They use a fourth style (`font-headline font-extrabold tracking-[-0.035em]`, `bg-primary/5`). Delete them, or salvage only `FaqSection` (native `<details>`, accessible) and the `TryLessonCard` す/し state machine idea, rebuilt on DS tokens.

---

## E. Proposed structures

### GUEST home (top → bottom). One next step: "Start with hiragana"

1. **TopNav (64px):** fox + FoxSensei · Kana · Kanji · Grammar · Practice · Classes · theme · ghost "Sign in" · primary "Start here". On `/`, the nav primary is hidden until the hero CTA scrolls out of view, so there is only ever one orange.
2. **Hero (`100svh`, max 900px, photo kept):** left column on the wash.
   - DS `eyebrow`: "Free · Kana → Kanji → Grammar"
   - `display` H1 in `ink`: "Learn to read Japanese." / "One small step at a time."
   - `body-lg` one line: "Start with あ today. No account needed."
   - Primary `Button lg` "Start with hiragana →" (`/kana/hiragana`) + `TextLink` "Try a kana first ↓"
   - At the hero foot, on the wash, no box: the fact strip "92 kana · 245 kanji · 25 grammar chapters · free certificates".
3. **First win: the Kana demo, alone (`surface`):** `h2` "Your first five sounds." The existing KanaDemo enlarged (`kana-display` 64px, with audio), with the tiles as a `radius-md` row. Below it, one sentence + `TextLink` "Learn all 46 hiragana →". This is the emotional hook: the visitor reads あい in 10 seconds.
4. **The path (`surface-sunken` band):** `h2` "From kana to reading sentences." A horizontal 4-stop rail (DS ConceptSection markers on a hairline; vertical on phone): 01 Kana (あ) · 02 Kanji N5–N4 (木) · 03 N5 grammar (私は) · 04 Review (山). Each stop has a glyph tile, an `h3`, one line and one `TextLink`. "Coming soon: N3–N1" sits as a muted caption. A "Try kanji, grammar and review" disclosure reveals the other three demos inline.
5. **Proof (`surface`):** two columns. The real certificate preview with the fox mark (fox appears once), next to a sample ContinueCard / review-forecast tile showing what an account gives you: "Progress saved · Reviews scheduled · Certificates". No fake learner counts or testimonials until real ones exist (DS: name unbuilt things honestly).
6. **Close (`surface-inverse` band, dark in both themes):** `h2` "Start reading Japanese today." The same primary "Start with hiragana", plus a secondary "Create a free account" (opens sign-up; DS: offered at the end, never in the middle). Below, a quiet line: "Prefer video lessons? Browse courses by JLPT level →".
7. **Footer (`surface-sunken`, `line` top):** links only, with voice credits moved to About.

Removed vs today: hero tagline line, the 4 equal step rows (→ 1 demo + rail), the "Prefer video lessons?" divider block (folded into the close), the different closing CTA target, and the nav orange on `/`.

### SIGNED-IN home (top → bottom). One next step: "Continue · <course> <position>"

Same route `/`, branching in `HomePage.tsx` on `useAuth().user`. Do not hard-redirect to `/dashboard`: a short "Today" view is the home, and the dashboard stays the deep view.
1. **TopNav:** primary "Continue · Hiragana unit 4" (DS), due-review Badge on Practice, profile.
2. **Compact hero (~40vh, same photo/night scene, cropped as a banner, no petals or a 5s burst):** `eyebrow` "Day 12 streak" (StreakFire small, static under reduced motion). `h1` "おかえり, Aiko." with `body` "Welcome back. You're 3 units from the hiragana test." The Japanese greeting is the authentic touch. Real name from the profile; never hardcoded.
3. **Up next card (DS `fx-upnext`, `primary-soft`):** the generalised `kanaCourse/ContinueCard` (ContinueBar README says to generalise it, not fork it). Title "Next: Hiragana unit 4 · か row", meta "8 kana · about 4 min", single primary "Continue". This is the only orange on the page.
4. **Today row (3 quiet tiles on `surface-raised`, `elevation-1` or border, not both):** Reviews due (count + secondary "Review 12 cards"), Studied today (minutes), Weak spots (top 3 glyphs → link). Data comes from the existing `useReviewForecast`, `useProgress` and dashboard `OverviewPage` StatTile; extract `StatTile` from `DashboardBits.tsx` into `ui/`.
5. **Your path (`surface-sunken`):** the same 4-stop rail as the guest page, now with state: done ticks (`success`), current (`primary` disc), locked-but-reachable (DS: "guided, never locked"). Each stop has a % ProgressBar.
6. **Discover (optional, at most 3 items):** "New: N4 kanji unit 9" / a hand-picked class. Three cards + "Browse all →" (§11).
7. **Footer.**
States: skeleton matching rows 3–5 (shimmer), ErrorState with retry for the Today row, and an EmptyState for a brand-new account ("Start with hiragana" as the next step, so the page still has a primary).

### Components and tokens needed

Tokens (adopt DS `tokens.css` into `index.css` + `tailwind.config.ts`, then delete `--home-*`):
- `surface`, `surface-raised`, `surface-sunken`, `surface-hover`, `surface-inverse`/`on-surface-inverse`
- `ink`, `ink-muted`, `ink-subtle`, `line`, `line-strong`
- `primary`/`primary-hover`/`on-primary`/`primary-soft`/`primary-ink`, `leaf`/`leaf-soft`/`leaf-ink`
- `success`/`-soft`/`-ink` (rail ticks)
- `elevation-1..3` (dark-aware values), `radius-sm/md/lg/xl/full`, `duration-fast/base/slow`
- type tokens `display`, `h1`, `h2`, `h3`, `body-lg`, `body`, `label`, `caption`, `eyebrow`, `kana-display`, `ja-md`
- `nav-height` 64, `touch-target` 44
- New: a `--hero-wash` gradient token pair (Washi / Yoru) with a portrait variant.

Components:
- `ui/Button`: DS variants `primary | secondary | ghost`, sizes `sm | md | lg`; remove `hover:scale` and `rounded-xl` defaults.
- `ui/Eyebrow` (one recipe), `ui/TextLink` (exists; adopt it).
- `home/HomeHero` (variant `guest | member`): photo `<picture>`, wash, petals with burst + IntersectionObserver pause, CTA slot.
- `home/FactStrip`: inline facts, numbers sourced from course data.
- `home/KanaDemo`: lift the existing one and add audio.
- `ui/PathRail`: shared with DS ConceptSection/StepTabs markers, with states `done | now | todo` and an optional progress value.
- `ui/UpNextCard`: generalised from `kanaCourse/ContinueCard`.
- `ui/StatTile`: extracted from dashboard.
- `home/CertificatePreview`.
- `home/CloseBand`: on `surface-inverse`.
- `ui/EmptyState` / `ErrorState` / skeleton for the member view.
- Navbar: guest = ghost "Sign in" + primary "Start here"; member = primary "Continue · <pos>"; on `/` the primary is suppressed while the hero CTA is visible.
