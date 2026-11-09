# 01 — Current Design System: Inventory + Critique (FoxSensei)

Agent 1, "Current Design Reviewer". Repo `/home/user/FluentFoxUi`, read-only. Standards that apply: `CLAUDE.md`, `docs/UIUX_STANDARDS.md`, `docs/FRONTEND_STANDARDS.md`.

**Screenshots** of the live site, https://www.foxsensei.com/grammar/n5/2, taken with Playwright 1.63 (chromium, deviceScaleFactor 1). Directory: `(session screenshots, not committed) shots/`
- Full page: `grammar-{desktop|mobile}-{light|dark}.png` (desktop 1440x5402, mobile 390x8813)
- Above the fold: `grammar-*-fold.png`
- Sections of the full page: `crop-grammar-*-N.png`
- Dark mode was forced by adding `class="dark"` to `<html>` and setting `colorScheme`. The light/dark toggle uses localStorage `themeChoice`, and the site honours the forced class.

**Blocker (sandbox only):** the chapter "board" image never loaded. `cdn.foxsensei.com` returned `net::ERR_TUNNEL_CONNECTION_FAILED` because the agent proxy does not allow that host. In the shots the board shows as broken-image alt text. This comes from my environment and is not a bug on the site. Everything else loaded.

**Fonts that loaded on the live page:** Inter 400/500/600, Plus Jakarta Sans 700/800, Material Symbols Outlined. On this page `<body>` computes to the Tailwind system stack, and Inter comes from `.app-shell font-body` (`src/App.tsx:181`). No Japanese webfont loads for lesson content, so Japanese falls back to the OS CJK font.

---

## 1. Token inventory

### 1.1 Tailwind static colors (`tailwind.config.ts`, same in both themes)

| Token | Value | Line | Usages (utility grep) |
|---|---|---|---|
| fox-dark | #D86B35 | 34 | 0 (a comment in PetalBackground; hex in confetti) |
| fox | #EA6B44 | 35 | 0 |
| fox-light | #FF9F5C | 36 | 4 (all in GrammarContent.tsx:31) |
| primary-container | #B35223 | 40 | 4 |
| primary-fixed | #FFE8C9 | 41 | 1 (+ `selection:bg-primary-fixed` in App.tsx) |
| primary-fixed-dim | #FF9F5C (same as fox-light and inverse-primary) | 42 | 13 |
| on-primary | #ffffff | 43 | 46 |
| on-primary-fixed | #3D1A05 | 44 | 1 |
| on-primary-fixed-variant | #B84A1E | 45 | 0 |
| on-primary-container | #FFF0E6 | 46 | 2 |
| inverse-primary | #FF9F5C | 47 | **0** |
| surface-tint | #BB4D2C | 48 | **0** |
| secondary-container | #F0845A | 52 | 2 |
| secondary-fixed | #FFE8C9 | 53 | **0** |
| secondary-fixed-dim | #EBBD91 | 54 | **0** |
| on-secondary | #ffffff | 55 | 2 |
| on-secondary-fixed | #3D1A05 | 56 | 0 |
| on-secondary-fixed-variant | #7A3010 | 57 | 0 |
| on-secondary-container | #3D1A05 | 58 | 0 |
| tertiary | #005a7d | 60 | 21 (grammar concept accent) |
| surface-variant | #e1e3e4 | 61 | **0** |
| surface-container | #edeeef | 62 | **dead: the duplicate key on line 71 overrides it** |
| on-error-container | #93000a | 63 | few |
| on-tertiary-fixed / tertiary-fixed / on-tertiary-fixed-variant / on-tertiary-container / on-tertiary / tertiary-fixed-dim | #001e2d / #c5e7ff / #004c6b / #e0f1ff / #ffffff / #80cfff | 94–107 | **0** for all |
| on-error | #ffffff | 96 | 9 |
| inverse-surface | #2e3132 | 97 | **0** |
| surface-inverse | #2f2521 | 99 | 13 |
| on-surface-inverse | #f4ece7 | 100 | ~29 incl. variant |
| on-surface-inverse-variant | #c9b3a6 | 101 | (in the above) |
| error | #ba1a1a (**no dark value**) | 102 | 110 |
| on-background | #191c1d | 105 | **0** |
| on-surface-static | #191c1d | 108 | **0** |
| error-container | #ffdad6 | 109 | 8 |
| inverse-on-surface | #f0f1f2 | 110 | **0** (standards docs still reference it) |

Tailwind keys backed by CSS variables: surface, background, surface-dim, surface-bright, surface-container-*, on-surface, on-surface-variant, outline, outline-variant, primary, secondary, success, warning, info, chart-1..5, tone / tone-soft / tone-ink, and home-* (17 keys). Their values are in 1.2.

### 1.2 CSS custom properties (`src/index.css`): `:root` (light, lines 10–92) vs `html.dark` (lines 94–167)

**Core theme**

| Variable | Light | Dark ("Yoru" night indigo) | Usages of the utility |
|---|---|---|---|
| --surface | 248 249 250 #F8F9FA | 15 21 40 #0F1528 | 39 |
| --background | 248 249 250 | 11 16 32 #0B1020 | **0** |
| --surface-dim | 217 218 219 | 8 12 24 #080C18 | **0** |
| --surface-bright | 248 249 250 | 46 57 88 #2E3958 | **0** |
| --surface-container-lowest | 255 255 255 | 11 16 32 #0B1020 (**darker than surface**) | 141 |
| --surface-container-low | 243 244 245 | 19 26 48 #131A30 | 157 |
| --surface-container | 237 238 239 | 24 32 56 #182038 | 73 |
| --surface-container-high | 231 232 233 | 30 39 66 #1E2742 | 65 |
| --surface-container-highest | 225 227 228 | 38 48 78 #26304E | 13 |
| --on-surface | 25 28 29 #191C1D | 236 234 242 #ECEAF2 | 529 |
| --on-surface-variant | 93 63 61 #5D3F3D (reddish brown) | 169 176 199 #A9B0C7 (cool lavender) | 676 |
| --outline | 146 110 108 #926E6C | 74 85 120 #4A5578 | 71 |
| --outline-variant | 231 188 186 #E7BCBA (pink) | 37 46 74 #252E4A | 273 |
| --primary | 187 77 44 #BB4D2C | 240 138 93 #F08A5D | ~681 |
| --secondary | 177 81 38 #B15126 (terracotta, nearly the same as primary) | 233 166 198 #E9A6C6 (sakura pink: a different hue) | 10 |
| --success | 21 128 61 | 95 211 160 #5FD3A0 | 127 |
| --warning | 180 83 9 | 242 196 109 #F2C46D | 30 |
| --info | 3 105 161 | 124 196 240 #7CC4F0 | 20 |
| --chart-1..5 | #2a78d6 #eb6834 #1baf7a #eda100 #e87ba4 | #3987e5 #d95926 #199e70 #c98500 #d55181 | 28 |
| --shadow-elevation-1 | 0 4px 20px rgba(25,28,29,.04), 0 2px 8px rgba(25,28,29,.02) | 0 4px 20px rgba(3,6,16,.35), 0 2px 8px rgba(3,6,16,.25) | e1+e2+e3 = 64 |
| --shadow-elevation-2 | 0 12px 32px rgba(25,28,29,.06), 0 4px 12px …(.03) | 0 12px 32px rgba(3,6,16,.45), 0 4px 12px …(.3) | |
| --shadow-elevation-3 | 0 24px 48px rgba(25,28,29,.1), 0 8px 24px …(.05) | 0 24px 48px rgba(3,6,16,.55), 0 8px 24px …(.45) | |
| --fire-core/body/glow/shadow/heart | #D43300 #EF5A00 #FF7800 #D43322 #FFC43D | (same) | StreakFire only |

**Home palette, "concept home"** (`--home-*`, lines 60–78 / 135–153). This is a second full theme.

| Variable | Light | Dark | Tailwind usages |
|---|---|---|---|
| --home-canvas | #f7f6f0 | #0B1020 | 3 |
| --home-hero | #cbdcc9 | #0F1528 | 1 |
| --home-wash | 248 247 237 | #080C18 | CSS only (no Tailwind key) |
| --home-ink | #253e35 (green-black) | #ECEAF2 | 17 |
| --home-muted | #53665a | #A9B0C7 | 14 |
| --home-subtle | #747c72 | #828BA6 | 1 |
| --home-line | #dfe3d8 | #252E4A | 5 |
| --home-line-strong | #d7d8ca | #343F60 | 8 |
| --home-accent | #BB4D2C (= primary) | #F08A5D (= primary) | 14 |
| --home-accent-hover | #9F4126 | #F6A07A | 3 |
| --home-on-accent | #ffffff | #1A0F0A (**correct dark ink, unlike on-primary**) | 2 |
| --home-tile | #fffdf7 | #131A30 | 7 |
| --home-sage | #edeedf | #16203A | 1 |
| --home-mint | #e6efec | #132433 | **0** |
| --home-peach | #f0e7df | #2A1E2A | **0** |
| --home-sand | #eee8dc | #1F2236 | 0 (CSS `.concept-demo-btn-on` only) |
| --home-panel | #e8eddf | #151D33 | **0** |
| --home-leaf | #48705a | #86C8AA | 3 |

Four files use home-* utilities: `ConceptHome.tsx`, `HowItWorks.tsx`, `howItWorksDemos.tsx` and **`grammar/ChapterVisual.tsx`**. The grammar page therefore mixes two palettes.

**Scene palette** (`--scene-*`, lines 81–91 / 156–166) is used by one illustration (the practice-test header). Light: sky #fce8de→#eee9f7, sun #ffceb0, far #d6cfe8, mountain #9288b8, snow #fff, hill #b0c0b6, water #dee2f2, blossom #f7c0d0 / #e892ae, wood #bb4d2c. Dark: #0d1226→#26224a, moon #f2e8d6, #2c3058, #3e3e6e, #ced2ec, #1b243c, #181e3c, #e9a6c6 / #c470a0, #f08a5d.

**Grammar diagram tones** (lines 674–684), given as `--tone / --tone-soft / --tone-ink`:

| Tone | Light | Dark |
|---|---|---|
| amber | 227 165 76 / 255 247 223 / 118 81 22 | 227 165 76 / 52 41 24 / 242 205 140 |
| blue | 108 163 200 / 238 247 252 / 36 94 130 | 120 176 212 / 25 40 52 / 167 207 233 |
| coral | 198 91 57 / 255 240 235 / 154 63 37 | 226 124 90 / 54 32 26 / 242 168 142 |
| moss | 110 156 112 / 239 247 238 / 54 95 59 | 128 176 130 / 30 44 32 / 170 212 171 |
| plum | 155 106 158 / 250 240 250 / 112 65 111 | 184 136 187 / 46 32 47 / 222 182 224 |

**Dark "glass" override** (lines 744–791). In dark mode every `.bg-surface-container-{lowest,low,}` becomes 55–62% alpha with `backdrop-filter: blur(16px) saturate(150%)`. `-high` and `-highest` get 60–65% alpha. `.app-shell` gets three radial glows built from primary (14%), info (12%) and secondary (10%). There are fallbacks for no-`@supports` and for `prefers-reduced-transparency`. Effect: light mode is flat and grey, while dark mode is translucent and glowing. The two themes have **different material models**.

### 1.3 Fonts

| Family | Tailwind key | Weights loaded (self-hosted woff2, `src/styles/fonts.css`, generated) | Used for |
|---|---|---|---|
| Plus Jakarta Sans | `font-headline` (203 uses) | 400, 500, 600, 700, 800, 800-italic | headings |
| Inter | `font-body` (69) **and** `font-label` (50), the same stack under two names | 300, 400, 500, 600 (**no 700**, yet `font-bold` appears everywhere → synthesised bold) | everything else |
| DM Sans | none (CSS `.concept-home`) | 400–700 | home page only |
| DM Serif Display | none (CSS `.concept-display`, `.concept-section-title`) | 400 normal + italic | home page only |
| Zen Maru Gothic | `font-jp` (117) | 500, 700, **glyph subset** (~90 code points) | home kana/kanji. Any glyph outside the subset falls back. |
| Material Symbols Outlined | `.material-symbols-outlined` | 400, subset, `font-display: block` | icons |
| `.japanese-text` (Hiragino/Yu Gothic/Meiryo) | CSS class, index.css:204 | system fonts | **0 uses (dead)** |

How fonts load: `index.html:59–61` has **no `<link>` or preload**. All faces are `@font-face` in `src/styles/fonts.css` with `font-display: swap`. index.css:198 still has the stale comment "Google Fonts are loaded via index.html". Four text families plus one JP subset plus icons ship in total. **There is no Japanese text face for learning content**, which is the most important text in the product.

### 1.4 Type scale

Tailwind defaults plus these additions (`tailwind.config.ts:119–124`):

| Token | Size | Line height |
|---|---|---|
| text-2xs | 0.6875rem (11px) | 0.875rem | 32 uses |
| text-display-lg | clamp(2.5rem, 5vw, 3.75rem) | 1.1 |
| text-display-md | clamp(2rem, 4vw, 3rem) | 1.2 |
| text-display-sm | clamp(1.75rem, 3vw, 2.25rem) | 1.25 | display-* total 14 uses |

Home-only CSS scale: `.concept-section-title` clamp(2.25rem, 4vw, 3.25rem) / 1.05 / -0.03em; `.concept-step-title` clamp(1.75rem, 2.6vw, 2.25rem).

Arbitrary sizes still in code: 35 `text-[…]`. Examples: `text-[0.65rem]` and `text-[0.66rem]` (≈10.5px, ChapterVisual.tsx:428, 456, 584, 598); `text-[10px]` ×4 (StreakCalendar); `text-[0.9375rem]` ×7; `text-[1.0625rem]`; `text-[8.25rem]`.

**Eyebrow / caps-label tracking variants in use:** 0.04, 0.06, 0.1, 0.12, 0.14, 0.16, 0.18 (21 uses), 0.2, 0.3, 0.35em, plus `tracking-widest` (0.1em, 39) and `tracking-wider` (8). That is **12 different trackings** for one element type, mixed with font-bold, font-semibold and font-black. `Eyebrow` in SectionHeader.tsx exists, but grammar does not use it.

### 1.5 Spacing, radius, shadow, motion

- **Spacing:** Tailwind default plus `nav: 80px` (`tailwind.config.ts:128`; standards §4 ask for 64px). Content padding on grammar is `px-6 xl:px-10 py-10`. The sidebar is `w-72` (288px) fixed at `left-4`, and content is offset `lg:ml-80`.
- **Radius** (`tailwind.config.ts:133–136` merged with Tailwind defaults):

  | Key | Value | Source |
  |---|---|---|
  | rounded-sm | 2px | TW default |
  | rounded (DEFAULT) | **2px** | override |
  | rounded-md | **6px** | TW default |
  | rounded-lg | **4px** | override |
  | rounded-xl | **8px** | override |
  | rounded-2xl | 16px | TW default |
  | rounded-3xl | 24px | TW default |
  | rounded-full | 9999px | override |

  Result: **md (6) > lg (4)**, which is non-monotonic, although the comment says it is monotonic. The docs (UIUX_STANDARDS §5) specify `md/lg 10–12 · xl 16 · 2xl 20`, so code and docs disagree. Usage counts: rounded-full 216, rounded-xl 185, rounded-2xl 139, rounded-lg 77, rounded-3xl 12, rounded 7, rounded-md 5, rounded-sm 9. Buttons and inputs (`rounded-xl`) are therefore only **8px**, while cards are 16px and some panels 24px.
- **Shadows:** `shadow-elevation-1/2/3` (64 uses) are the system. Legacy uses remain: `shadow-lg` ×6 (Button primary and white), `shadow-md` ×2, `shadow-sm` ×3 (LevelSwitcher, DiagramItem), `shadow-inner` ×1 (GrammarPage:35), and 2 arbitrary `shadow-[…]` (Button inverse). Light elevation-1 is at 4%/2% alpha, which is practically invisible on #F8F9FA.
- **Motion:** one Tailwind keyframe (`sheet-rise`, 0.45s cubic-bezier(0.22,1,0.36,1)). index.css has about 12 more keyframes (quiz-*, skeleton-shimmer 1.8s infinite, logo-shimmer, streak-fire ×4 infinite, card flip 0.55s). There is a global reduced-motion rule (index.css:223). FadeIn uses 0.7s ease, translateY 28px. Button uses `hover:scale-[1.02] active:scale-[0.98]`, 200ms.

---

## 2. Components: `src/components/ui/` primitives

| Primitive | Props / variants | Look |
|---|---|---|
| **Button** | `variant: primary \| outline \| ghost \| white \| inverse` plus native attrs | `px-6 py-2.5 rounded-xl(8px) font-bold`, hover scale 1.02. primary = bg-primary + `shadow-lg shadow-primary/20`. outline = `border-2 border-outline-variant/40`. white = `bg-white text-primary` (violates the tokens rule). inverse = coral pill in light, moonlight `bg-on-surface text-surface` in dark, with a glow shadow. **No size prop and no icon slot. Class names are joined with template strings, not `cn()`**, so callers cannot override (grammar CTAs re-implement it). |
| **Chip** | `tone: neutral\|primary\|success\|warning\|error\|info`, `icon?` | `rounded-full px-2.5 py-0.5 text-xs font-semibold`, tone/10 background. Grammar does not use it. |
| **CloseButton** | `variant: plain\|floating\|inverse\|danger`, `size: md\|sm` | 44px target, inline-SVG X, framer spring: circle grows and X turns 90°. Well built. |
| **Icon** | `name, className, filled` | Material Symbols span, aria-hidden. Sets `fontVariationSettings` inline. |
| **ProgressBar** | `value,max,label,valueText,size sm\|md,tone primary\|success` | `h-1.5/h-2 rounded-full bg-outline-variant/40`. **Grammar does not use it: ChapterProgress and the vocab mini-bar re-implement it.** |
| **SectionHeader / Eyebrow** | Eyebrow `variant: pill\|plain`. SectionHeader: eyebrow, title, description, align, … | Eyebrow plain = `text-xs font-bold tracking-[0.18em] uppercase text-primary`. Pill = `text-2xs font-semibold … rounded-full border-primary/20`. **The two variants use different size and weight.** Title = font-headline extrabold display-sm/md. |
| **TextLink / ExternalTextLink / TextButton** | size xs–lg, tone primary\|neutral, underline hover\|always, leading/trailing icon | 44px min height; the underline covers the words only. |
| **Switch** | checked, onChange, label, hideLabel, disabled, busy | h-6 w-11 track, primary when on. |
| **StatusMessage** | `tone: error\|success\|info`, message | `rounded-xl px-4 py-3 text-sm`, tone/10 background, icon. |
| **FormField + TextInput/TextArea/SelectInput** | label, hint | Label = `font-label text-xs font-bold uppercase tracking-widest` (yet another eyebrow recipe). Control = `rounded-xl border-outline-variant bg-surface-container-lowest px-4 py-2.5`. |
| **LoadingState / SkeletonBlock** | label, children | Shimmer (`animate-shimmer`). The skeleton has no default radius. |
| **ErrorState / EmptyState** | title, message, onRetry / icon, actionLabel | Centred 64px icon disc, font-headline lg title, Button outline. |
| **FadeIn** | delay | IO-based fade-up of 28px over 0.7s. Shows the final state immediately under reduced motion. |
| **InteractiveWord** | kanji, reading, meaning, showAll | **The core learning interaction.** Dotted `border-b-2 border-primary` under bold text. The portal tooltip is `bg-surface-container-highest/95 rounded-xl shadow-elevation-2`, with reading in `text-2xs tracking-[0.2em] font-black` and meaning in `font-bold text-base`. The "anata trap" special case uses `bg-error text-white`. It is a `span role=button`, not a real button. It sits in `ui/` but is grammar-specific. |
| **Toaster** | store-driven | Stacked toasts, 7s timeout. |
| **StreakFire** | lit | Pure-CSS flame that loops forever. |
| **PetalBackground / KoiBackground / MouseFollower** | none | Ambient decoration: canvas petals, Lottie koi (fixed `w-[1200px]`, inline opacity), cursor trail with blend mode. |
| **ErrorBoundary** | none | none |

Primitives still missing compared with the standards catalogue: **Card, Modal, Badge/JlptBadge, StatCard, IconRing, Tabs, SegmentedControl**. Grammar hand-rolls each of these.

### Grammar components (`src/components/grammar/`)

| Component | Role | Notes |
|---|---|---|
| GrammarSidebar (60 lines) | Desktop lg+ course nav inside `layout/FixedSidebar` (`fixed left-4 w-72 rounded-2xl border-outline-variant/40 bg-surface-container-lowest shadow-elevation-1`) | Header uses yet another eyebrow (`tracking-widest`). For non-N5 levels it shows an "Unlock Pro Deck" Button. |
| LevelSwitcher | Segmented N5…N1 control, `bg-surface-container-high rounded-xl p-1`. Active = `bg-primary text-on-primary shadow-sm`. Locked = `/40` opacity + lock icon. | 4 of 5 segments are permanently locked, which is visual noise. |
| ChapterProgress | "Your Progress 0 / 25" plus a hand-made bar | Duplicates ProgressBar. |
| ChapterList / ChapterItem (memo) | `<ol>` of chapter links. 28px number disc. Active = `bg-primary/10` + primary bold + "Currently studying" in `text-primary/60`. Done = filled primary disc with a check. | |
| MobileGrammarNav | Below lg: fixed bar under the navbar with LevelSwitcher (md) + prev/next 44px icon buttons + "Chapter 2 of 25 ▾" pill that opens ChapterSheet | `bg-surface-container-lowest/95 backdrop-blur-xl`. Mirrors chevron_right because chevron_left is missing from the icon subset. |
| ChapterSheet | Bottom sheet with ChapterProgress + ChapterList, `bg-black/50` backdrop | |
| ChapterTabs | Kicker "N5 · CHAPTER 2 · title" + underline tabs (Grammar / Vocabulary / Exercise / Listening). Active = `border-b-2 border-primary text-primary`. | Good, 44px targets. |
| GrammarContent (476 lines, far over the 150-line rule) | Breadcrumb + reveal toggle, hero, ChapterVisual, 9/3 grid of concept cards + vocab aside, completion CTA, prev/next | Contains `getConceptStyle` (colour chosen from **title keywords**), hand-rolled cards, badges, progress bar, buttons and confetti hex. |
| ChapterVisual (606 lines) | Illustrated "board" figure, or a coded diagram (sequence/range/comparison/exchange/direction/space) built from tone chips | Styled entirely in the **home-* palette** and arbitrary `text-[0.65rem]`. |
| RichHtml | Renders parser HTML and portals InteractiveWords into placeholders | |
| ChapterVocabulary / ChapterExercise / ChapterQuiz / ChapterListening / PracticeIntro | Other tabs | PracticeIntro uses `rounded-3xl` + `dark:` overrides, a fourth card recipe. |

---

## 3. Grammar page anatomy (`/grammar/n5/2`, top to bottom)

Desktop is 1440 wide (see `crop-grammar-desktop-light-0..2.png`). Mobile is 390 wide.

1. **Navbar.** A floating glass pill (rounded, about 1280 wide, 56px tall) inside the 80px `nav` band. It holds the logo (gradient "FoxSensei" wordmark), centre links Kana▾ JLPT▾ Quiz Classes, a theme toggle, and the "Sign in / up" coral pill. In dark mode that pill becomes white-on-navy (`Button inverse`). On mobile it shows logo + theme + hamburger.
2. **Course sidebar** (lg+, fixed card at the left, 288px). "GRAMMAR COURSE" eyebrow, then the N5…N1 segmented control (N5 solid coral), then "Your Progress 0/25" with a bar, then a scrollable list of 25 chapters with number discs. The active chapter has a peach `primary/10` fill and the coral "Currently studying" sub-label. *Job:* course navigation and progress. On mobile it is replaced by a **fixed sub-bar** with the level segments and a "‹ Chapter 2 of 25 ▾ ›" pill.
3. **Chapter kicker + tabs.** "N5 · CHAPTER 2 · Demonstratives & Possession" (caps 0.18em), then underline tabs with icons. *Job:* switch between the chapter's four modes.
4. **Breadcrumb row** (desktop only): "N5 COURSE › CHAPTER 2 › GRAMMAR NOTES" (caps 0.2em, last item coral), with the **"Show All Hints"** outlined coral pill on the right. *Job:* global reveal of every InteractiveWord tooltip. This is the second "where am I" line directly under the kicker in item 3, so it is redundant.
5. **Hero.** A grey "CHAPTER 2" pill (third repetition of the chapter number), a 48px Plus Jakarta 800 title, an 18px muted brown intro paragraph, and a wrap of 6 grey concept pills ("1. Demonstrative Nouns (これ・それ・あれ)" …). The pills are `<span>`, not anchors: **they look clickable but do nothing**.
6. **ChapterVisual figure.** A warm-paper card (`home-tile/60`, `home-line` border, so a different palette). The board illustration is on the left. On the right: a "DISTANCE MAP" coral eyebrow, a green-black "Choose by distance" heading (`home-ink` #253e35), a coloured これ / それ / あれ line using tone-ink, romaji, an italic gloss, and a caption. *Job:* visual primer.
7. **Main grid, 9/3 columns.**
   - **Concept cards ×6** (`bg-surface-container-lowest rounded-2xl border-outline-variant/20 shadow-elevation-1`, hover lifts to e2). Each has a 6px **left stripe whose colour is guessed from title keywords**: teal `tertiary` for demonstrative/possession/confirming, `fox-light` for alternative, `primary` as default. A small numbered badge, an 18px title, and a "1 / 6" counter. Body: description (RichHtml, muted brown), a **Key Rule** box (`border-l-4` tinted, italic), a **Note** box (grey, info icon), then an "EXAMPLE SENTENCES" eyebrow with a lightbulb, then example cards (`surface-container-low/50`, 24px Japanese with dotted-underlined InteractiveWords, an italic translation with a left hairline, and a tiny "HIDE" toggle).
   - **Aside.** The "CHAPTER VOCABULARY" card (`surface-container-low`) has a 0/8 counter, a mastery bar, and rows of word + coral kana reading + English meaning; tapping a row marks it mastered (40% opacity), with the footnote "Tap a word to mark it as mastered". Below it, the "CULTURAL INSIGHT" card (`primary/5` peach with a `primary/20` border) holds long prose with coral sub-headings. On mobile this card moves inline after the concepts.
8. **Completion block.** A grey panel with a faint check icon, "Done with this chapter?", and a coral "✓ Mark Chapter 2 as Complete" **rounded-full** pill with an e2 shadow. Clicking fires two hex-coloured confetti bursts.
9. **Prev / Next.** 48px grey circles with arrows plus "PREVIOUS / Chapter 1" and "NEXT / Chapter 3". They name the number only, not the title.
10. **Footer.** Wordmark, About · Privacy · Terms · Contact, ©.

The rendered desktop page is 5,402px tall and mobile is 8,813px. One chapter's notes are a very long single scroll with no in-page TOC: the concept pills look like one but are not links.

---

## 4. Problems (ranked)

### P0: correctness and accessibility failures

1. **`on-primary` is #fff in both themes, but dark primary is light coral #F08A5D, giving 2.47:1 (AA fail).** This affects every solid primary control in dark mode: the N5 segment (`LevelSwitcher.tsx:67`), "Mark Chapter … Complete" (`GrammarContent.tsx:419`), Button primary (`Button.tsx:12`), done-chapter discs (`ChapterList.tsx:47`), and the active reveal toggle (`GrammarContent.tsx:124`). `--home-on-accent` already solves this with #1A0F0A (`index.css:146`), so one palette is fixed and the other is not.
2. **`error` (#ba1a1a) has no dark value:** 2.81:1 on the dark surface and 2.71:1 inside `error/10` chips. See `tailwind.config.ts:102`, ErrorState, StatusMessage, Chip, InteractiveWord anata-trap, and 110 call sites.
3. **`tertiary` (#005a7d) is static.** Dark-mode concept badges ("01", "02", "03") and their accent stripes measure 2.4–2.5:1 and are nearly invisible in the dark screenshots. See `GrammarContent.tsx:29`, `tailwind.config.ts:60`.
4. **Faded muted text below AA.** `text-on-surface-variant/30…/70` is used 41 times. `/50` measures 2.54:1 (light) and 2.98:1 (dark), `/40` measures 2.03:1, `/60` measures 3.08:1. Grammar examples: the "1 / 6" counter (`GrammarContent.tsx:196`), the HIDE button (`:264`), the vocab count (`:314`), "Tap a word…" (`:378`), the empty-vocab message (`:334`), the progress hint (`ChapterProgress.tsx:42`), and the locked-level screen (`GrammarPage.tsx:54, 62`).
5. **"Currently studying" in `text-primary/60` on `primary/10` measures 2.33:1** (`ChapterList.tsx:71`).
6. **Borders are invisible.** Light `outline-variant` (#E7BCBA, pink) on white is 1.71:1 at full strength, and `/15` or `/20` is used 23 times (about 1.1:1). Every grammar card border uses `/15–/20` (`GrammarContent.tsx:181, 184, 227, 250, 303, 305`), which breaks UIUX §2 ("/20 is too faint"). Dark `outline-variant` against surface is 1.35:1.
7. **Small, unlabeled and undersized controls.** The example "HIDE" toggle is `text-xs`, has no `type`, no `aria-pressed`, about a 20px hit area, and `/50` colour (`GrammarContent.tsx:262–268`). The InteractiveWord trigger is a `span role=button` (`InteractiveWord.tsx:105`), against CLAUDE.md rule 8.
8. **Content and render bugs visible on the live page** (not design tokens, but they hurt the premium feel):
   - Raw markdown leaks into the translations: "This is a book \*\*on/about\*\* computers.", "This is \*\*my\*\* book."
   - One example has an empty translation that still shows a HIDE toggle ("…サントスさんの[かばん]です。").
   - Literal "[かばん]" brackets appear.
   - The Cultural Insight card contains an author-to-designer note: "Make sure your design clearly separates these conceptual cards".
   - All of this comes through the MDX → `utils/mdxParser.ts` pipeline (see `crop-grammar-desktop-light-1/2.png`).
9. **Dead class:** `fade-in` on `<main>` (`GrammarPage.tsx:227`) is not defined in any CSS file.

### P1: system inconsistencies (the reason to rebuild)

10. **Two parallel palettes.** The `home-*` palette (17 Tailwind keys + 18 vars, sage/paper/green-ink, `tailwind.config.ts:10–28`, `index.css:60–78`) duplicates surface/on-surface/outline/primary with different hues: home-ink #253e35 green-black vs on-surface #191C1D, home-line #dfe3d8 vs outline-variant pink #E7BCBA. **The grammar page's ChapterVisual uses home-\*** (`ChapterVisual.tsx:541–566`), so its heading is green-black next to neutral-black headings, and the card is warm paper next to cool-grey cards. Four home-* keys are unused (mint, peach, panel; sand is CSS only).
11. **Three overlapping orange systems.** `fox`/`fox-dark`/`fox-light` (#EA6B44/#D86B35/#FF9F5C, `tailwind.config.ts:34–36`) sit alongside `primary` (var) and the static Material roles (primary-container #B35223, primary-fixed-dim = inverse-primary = fox-light = #FF9F5C, surface-tint #BB4D2C). `fox` and `fox-dark` have 0 utility uses. `fox-light` is used only in `GrammarContent.tsx:31`, where it produces the light-orange "04" stripe. The confetti hex (`GrammarContent.tsx:414`) and PetalBackground rgba hard-code the legacy fox colours.
12. **Half-adopted Material 3 role set.** About 22 static M3 roles are **never used**: inverse-primary, surface-tint, secondary-fixed(-dim), on-secondary-fixed(-variant), on-secondary-container, all six tertiary-* roles, surface-variant, inverse-surface, on-background, on-surface-static, inverse-on-surface, plus vars background, surface-dim, surface-bright. **`surface-container` is declared twice** (`tailwind.config.ts:62` and `:71`); the static one is silently overridden.
13. **Colour temperature clash.** Light mode pairs cool neutral surfaces (#F8F9FA / #F3F4F5) with **warm reddish-brown** muted text (#5D3F3D) and **pink** outlines (#E7BCBA, #926E6C). Dark mode pairs indigo surfaces with **cool lavender** muted text (#A9B0C7). So the "same" token has different hue families per theme, and `secondary` changes from terracotta (light) to sakura pink (dark): a different meaning per theme.
14. **Dark mode uses a different material model.** It is frosted glass, blurred, with radial glows (`index.css:744–791`), while light mode is flat. It is implemented by overriding utility classes globally, which causes a stacked-blur cost and makes "elevation" mean alpha in one theme and shadow in the other. `surface-container-lowest` is *darker* than `surface` in dark mode (#0B1020 < #0F1528), which inverts the elevation order: lowest cards look recessed. That is visible on the concept cards in the dark shots.
15. **The radius scale is broken and disagrees with the docs.** md = 6 > lg = 4, and DEFAULT = sm = 2 (`tailwind.config.ts:133–136`). The docs say xl = 16, the code says 8. Buttons and inputs end up 8px while chips/pills are full and cards are 16. On one grammar screen I count **rounded-xl (8), rounded-2xl (16), rounded-full pills, rounded-3xl (PracticeIntro, 24) and rounded-lg (4)**.
16. **Type: Inter is overused, and there is no Japanese face.** Inter carries everything except headings: labels, eyebrows, body, Japanese fallback, and two aliases (`font-body`, `font-label`). It is loaded without weight 700, yet `font-bold`/`font-black` appear everywhere, so the browser synthesises bold. Japanese learning content (24px example sentences, vocab, tooltips) renders in whatever CJK system font the OS has (Hiragino, Yu Gothic, Noto), so it is inconsistent across devices, and the JP face (Zen Maru) is subset to about 90 glyphs for the home page only. `.japanese-text` is dead. Four Latin families ship in total (DM Sans and DM Serif are home-only), which makes three different "voices" between home and app.
17. **About 12 eyebrow recipes on one page.** Grammar alone uses `tracking-[0.18em] bold` (ChapterTabs:21), `tracking-[0.2em]` (breadcrumb :105), `tracking-widest bold` (:136, :213, :239, :286, :309, sidebar :28), `tracking-wider` (:264), and `text-[0.65rem] tracking-[0.16em]` (ChapterVisual:584). The `Eyebrow` primitive exists but is unused here.
18. **Primitives are bypassed.**
    - Hand-rolled progress bars instead of ProgressBar: `ChapterProgress.tsx:28–40`, `GrammarContent.tsx:322–327`.
    - Hand-rolled buttons instead of Button: reveal toggle `:118`, mark-complete `:412` (rounded-full vs Button's rounded-xl), prev/next `:436`.
    - Hand-rolled pills instead of Chip: chapter pill `:136`, completed pill `:140`, concept pills `:156`.
    - At least 4 different card recipes: concept card, vocab card, insight card, figure, PracticeIntro.
    - Button itself uses template strings, not `cn()` (`Button.tsx:30`), so it cannot be extended safely, and it has no size or icon API.
19. **Semantics by string matching.** Concept accent colour depends on title keywords (`GrammarContent.tsx:22–33`): "possession" → teal, "alternative" → fox-light, otherwise primary. The six concepts on this page therefore get teal ×3, orange-light, orange ×2 with no meaning, and "Affirmative Confirmation" headings use primary as if they were links.
20. **Redundant wayfinding.** The chapter identity is stated **four times** above the fold: the kicker "N5 · CHAPTER 2 · title", the breadcrumb "N5 COURSE › CHAPTER 2 › GRAMMAR NOTES", the "CHAPTER 2" pill, and the H1. On mobile, add "Chapter 2 of 25" for a fifth. This contradicts UIUX §0.1 and §10 ("Say each thing once").
21. **Elevation plus border stacked** on the same element (concept card: border /20 + shadow-elevation-1, hover e2, `GrammarContent.tsx:181`), against UIUX §2 ("one way"). Legacy `shadow-lg/md/sm/inner` remain (12 uses).

### P2: polish

22. Arbitrary text sizes: 35 `text-[…]`, including ≈10.5px labels in ChapterVisual (`:428, 456, 584, 598`) and `text-[10px]` in StreakCalendar. These are below the 12px floor in §3.
23. The nav height token is 80px, but the docs say 64. The anchor offset maths in `GrammarPage.tsx:27–28` hard-codes `+8rem / +4.5rem / +1rem` guesses.
24. The hex/rgba remaining in components is mostly legitimate (brand logos, PDF, admin colour picker). The real violations are the confetti colours (`GrammarContent.tsx:414`), PetalBackground rgba (`:80–81`), quiz pulse rgba (`index.css:253–261`), `bg-orange-500/20` (`NotFoundPage.tsx:10`), `bg-red-500/20` (`ServerErrorPage.tsx:10`), `bg-white` (`Button.tsx:16`, `SettingToggle.tsx:37`), and `text-white` on `bg-error` (`InteractiveWord.tsx:88`).
25. Perpetual motion: StreakFire and the skeleton shimmer loop forever, and KoiBackground uses a fixed `w-[1200px]` with inline opacity. These are gated by reduced motion, but they are against the "nothing loops forever" rule.
26. `selection:bg-primary-fixed selection:text-primary` (`App.tsx:181`). In dark mode, #F08A5D on #FFE8C9 is low contrast (about 2:1).
27. Mobile: the concept header crams badge + two-line title + "1 / 6" counter into one row, so Japanese in titles breaks mid-word (`(こ / れ・それ・あれ)`). Example sentences break particles across lines because they are 24px inside triple-nested padding (card px-7 → example px-5). The page is 8.8k px tall.
28. Locked N4–N1 segments occupy 80% of the level switcher on every screen, but only N5 exists.

### What is solid and worth keeping

- RGB-channel CSS vars that allow `/alpha`.
- The semantic `success/warning/info` and `chart-*` light/dark pairs.
- The diagram `tone` system with per-theme ink, which is well designed.
- `shadow-elevation-*` tokens.
- Fluid `display-*`.
- The CloseButton, TextLink, Switch and ProgressBar primitives.
- 44px targets in ChapterTabs and MobileGrammarNav.
- The reduced-motion and reduced-transparency fallbacks.
- Self-hosted subset fonts.
