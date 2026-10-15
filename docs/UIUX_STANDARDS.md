# FluentFoxUi — UI/UX Standards ("how the UI/UX must be")

> The reference for **visual design and user experience** in this app. Pairs with
> `docs/FRONTEND_STANDARDS.md` (how to write the code) — this doc is about how it must **look and
> feel**: premium, minimal, authentic, responsive, accessible. The UI/UX agents
> (`ui-ux-reviewer`, `responsive-auditor`) enforce this.

---

## 0. Design principles (the north star)

FoxSensei should feel like a **calm, premium, authentically Japanese** learning product — not a
busy template. Five rules override everything below:

1. **Restraint over decoration.** Remove before you add. If a section doesn't earn its scroll, cut it.
2. **One confident accent.** Fox orange (`primary`) is the single accent — used sparingly for the
   one thing that matters per screen. Everything else is surface + text tokens.
3. **Hierarchy through type & space, not boxes.** Strong headline scale + generous whitespace do the
   work; avoid stacking borders, shadows, and background tints on the same element.
4. **Motion is purposeful and quiet.** Entrances and feedback, never spectacle. Nothing loops forever.
5. **Authentic, not clip-art.** Brand visuals (fox, kana, koi, `がんばれ`) over generic stock/templated
   widgets. No external stock faces, no emoji standing in for the icon system.

**Everything is styled through design tokens** (`tailwind.config.ts` + CSS vars in `src/index.css`).
No raw hex/`rgb()`/px colors in components. Dark mode is a first-class theme, not an afterthought —
**every** screen must be verified in both themes.

---

## 1. Color & theming

- **Tokens only.** Use `surface`, `surface-container-*`, `on-surface`, `on-surface-variant`,
  `primary`, `outline`, `outline-variant`. Never inline hex (the Hero trust avatars, StatsBar,
  HowItWorks, Courses currently violate this).
- **Dark-mode parity rules:**
  - Never `bg-white`/`text-black`/`bg-black` in components — use surface/on-surface tokens.
  - Never build a "dark panel" with `bg-on-surface` + `text-inverse-on-surface` (those flip in dark
    mode → light-on-light). Add a dedicated **`surface-inverse`**/brand-dark token that is dark in
    *both* themes, and tokenize the hardcoded `#2f2521` brown panel used in 4 places.
  - White-opacity utilities (`text-white/60`, `bg-white/10`, `border-white/5`) are only valid on a
    surface that is dark in both themes. Otherwise use `on-surface`/`outline` with opacity.
- **Semantic status tokens.** Add `success` / `warning` / `info` tokens (light + dark values) and
  use them for streaks, password strength, verify states. Never raw `bg-green-100`/`bg-amber-400` —
  those stay light in dark mode.
- **Contrast:** body text ≥ **4.5:1**, large text/UI ≥ **3:1** (WCAG AA), in both themes. Muted
  text (`on-surface-variant`) and placeholders must pass on their actual background.
- **Theme reactivity:** components that branch on theme must react to changes (MutationObserver or a
  `useTheme()` hook / the UI store) — not read `documentElement.classList` once at render.

## 2. Elevation & shading

- Define **one elevation system**: 3 named, dark-aware levels (e.g. `elevation-1/2/3`) as tokens,
  replacing the ~20 ad-hoc `shadow-md/lg/xl/2xl` + bespoke `shadow-[rgba(...)]` usages.
- Shadows must be **visible in dark mode** — use a token that switches (subtle light-tinted or
  stronger black in dark) rather than a fixed `rgba(25,28,29,…)` that vanishes on charcoal.
- Separate surfaces **one way**: prefer a subtle border **or** an elevation step, not both stacked.
  Borders must be visible — `outline-variant/20` is too faint; use `/40`–`/60`.

## 3. Typography

- **Families:** `font-headline` (Plus Jakarta Sans) for display/headings, `font-body` (Inter) for
  everything else. `.japanese-text` stack for Japanese.
- **Type scale — use the named steps, not arbitrary values.** Replace the 80+ `text-[9px]/[10px]/
  [11px]` usages with `text-xs` (12px) or one defined `text-2xs` (≈11px) for genuine chrome only.
  Minimum on-screen text is **12px** (labels) / **16px** (body). Legal/footnote ≥ 12px.
- **Display headings:** 2–3 defined display sizes instead of `text-[3.3rem]/[2.8rem]/[2.4rem]`.
  Section-level and hero headings are **fluid**: `clamp(min, vw, max)` so 640–767px scales smoothly.
- **Eyebrow (caps label) — ONE recipe.** Pick a single tracking + weight (e.g.
  `text-xs font-semibold uppercase tracking-[0.18em] text-primary`) and use it everywhere. Today
  five different tracking values and mixed weights are used for the same element — consolidate into a
  `<SectionHeader>`/`<Eyebrow>` primitive.
- **Prose line length** ≤ ~70ch; body `leading-relaxed`.

## 4. Spacing & layout rhythm

- Use the Tailwind spacing scale; avoid arbitrary paddings.
- **Consistent section rhythm:** one vertical spacing for major sections (e.g. `py-20 md:py-28`),
  applied uniformly (today `py-16/20/24` are mixed).
- **One nav-height token.** The fixed navbar height is currently guessed as `68px`/`73px`/`pt-24/28/32`
  in different files. Pin a single value (e.g. `h-16` = 64px) and consume it via `pt-16` /
  `scroll-mt-16` everywhere. Add `viewport-fit=cover` + `env(safe-area-inset-top)` on the fixed nav.
- Content max width: `max-w-7xl mx-auto` with responsive gutters (`px-6 md:px-10`).

## 5. Shape & radius

- **Fix the radius scale** (currently `rounded-full` = 12px, which squares off every circle/pill and
  even the loading spinners). Make it **monotonic** and set `full` back to `9999px`:
  `sm` 6 · `md`/`lg` 10–12 · `xl` 16 · `2xl` 20 · `full` 9999.
- **Shape intent:** circles (avatars, icon badges, spinners) = `rounded-full`; pills/chips =
  `rounded-full`; cards/panels = `rounded-2xl`; inputs/buttons = `rounded-xl`. Consistent everywhere.

## 6. Iconography

- Use the shared **`<Icon>`** component (Material Symbols) — never raw `material-symbols-outlined`
  spans, and **never emoji** as UI icons (Features/DashboardPreview currently use 📖🃏✏️).
- Size icons **one way** (Tailwind `text-*` size classes), not a mix of `text-*` and inline
  `style={{ fontSize }}`.

## 7. Motion & animation

- **Purposeful & quiet:** entrances (fade/rise), state feedback (correct/wrong), hover/press. Subtle
  durations (150–500ms) and consistent easing tokens. No perpetual/looping celebration animations.
- **`prefers-reduced-motion` is mandatory.** Ship a global reduce rule that neutralizes
  animations/transitions; entrance/reveal components render their final state immediately; pause
  canvas backgrounds (petals/koi), globe rotation, streak flame, and shimmer under reduced motion.
- **Celebrations are capped:** a single 2–3s burst, gated on reduced-motion. (QuizResults currently
  runs 9+ concurrent Lotties + a forever `setInterval` confetti — that reads cheap, not premium.)
- Define shared motion tokens (`springs`, `fadeInUp`, durations, easings) in `src/lib/motion.ts`;
  don't redeclare spring configs inline.

## 8. Loading, skeleton, empty & error states

- **Every async view** shows one of four *designed* states, via shared components
  (`LoadingState`/`ErrorState`/`EmptyState`) — never a bare spinner, `null`, or nothing.
- **Skeletons match the real layout** (mirror the good `DashboardSkeleton`), with a subtle **shimmer**
  — not gray blobs, and not visually identical to the empty state.
- **Empty states are designed:** icon + one line + a next action (e.g. filtered course/kanji lists).
- **Error states** are friendly, on-brand, and offer retry. Never leave a page stuck on a skeleton
  because a fetch had no `.catch` (see `docs/PLAN.md` Phase 3.1).

## 9. Responsiveness & interaction

- **Mobile-first.** Base styles target mobile; `md:`/`lg:` scale up. Ban fixed `w-[Npx]` on layout
  elements (use `w-full max-w-[N]`). `overflow-x-hidden` is a backstop, not a fix.
- **Breakpoints:** Tailwind defaults (`sm` 640 / `md` 768 / `lg` 1024 / `xl` 1280). Treat **`md` as a
  touch-capable width** — never gate a tap-required interaction behind `hover` at `md`. Wrap hover-only
  enhancements in `@media (hover:hover) and (pointer:fine)` and always provide tap/focus equivalents.
- **Touch targets ≥ 44×44px** for every interactive element (icon buttons `min-w-11 min-h-11`; small
  links/pills get `py-2 -my-2` hit padding).
- **Fluid type** for headings (`clamp`); body ≥ 16px; smallest label ≥ 11–12px.
- **Full-height regions** use `dvh`, not `vh` (avoids the iOS URL-bar jump).
- **Overlays** (modals, mobile drawer) all: lock body scroll, close on `Esc` + backdrop, set
  `role="dialog" aria-modal`, and trap focus. (The mobile drawer currently locks nothing.)
- **Images:** `<img>` gets `width`/`height` (no layout shift) + `loading="lazy"`; ship sized
  WebP/AVIF; don't fetch visuals that are hidden on the current breakpoint (the globe's 13 remote
  avatars still download on mobile where the globe is `hidden`).

## 10. Content & UX correctness

- **Learning content is selectable & copyable.** Scope `user-select:none` to chrome/decoration only;
  set `user-select:text` on all content (Japanese words, readings, examples, kana/kanji).
- **No placeholder/dev content in shipped copy** (a hardcoded dev name "Shivam" is currently in the
  DashboardPreview marketing block). Use realistic sample or real data.
- **No dead controls.** Every button does something or isn't shown (social-auth buttons currently
  `onClick={() => null}`).
- **Say each thing once.** Don't repeat the same claim/stat across sections (the "50,000+ learners"
  and "Free Courses" messages each appear 3× on the home page).

## 11. Premium home-page composition

A landing page earns trust by being tight and specific. Rules:
- **One hero message, one primary CTA**, a brand-authentic visual (use the on-brand character card,
  not a templated globe), and a single trust strip (fold the redundant stats in — don't repeat them).
- **Front-load the unique value.** Show the product (the progress Dashboard) early — it's the
  differentiator.
- **Alternate surface tone** between sections for rhythm; don't stack near-identical stat blocks.
- **Trim & link out.** Show 3 representative items with a "Browse all →" instead of duplicating a
  whole inner page (Courses).
- **Consistent section headers** (one `<SectionHeader>` recipe) and consistent vertical rhythm.
- Recommended order: **Hero → Features → DashboardPreview → HowItWorks → Courses (3 + link) →
  Testimonials → CTA.**

---

## 12. UI/UX review checklist

- [ ] Verified in **both light and dark** themes — no light-on-light, no invisible shadows, no `bg-white`?
- [ ] Only tokens — no inline hex/`rgb`; status colors are semantic tokens?
- [ ] Radius correct (circles/pills actually round); one elevation language?
- [ ] Type from the scale (no `text-[9px]`); one eyebrow recipe; headings fluid?
- [ ] `<Icon>` (no emoji/raw spans); consistent icon sizing?
- [ ] Motion purposeful; `prefers-reduced-motion` honored; nothing loops forever?
- [ ] Loading/empty/error all designed via shared components; skeletons match layout?
- [ ] Mobile-first; no horizontal overflow at 320px; touch targets ≥ 44px; hover has a tap/focus fallback?
- [ ] Learning content selectable; no dead buttons; no placeholder/dev copy; no duplicated claims?
