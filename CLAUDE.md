# CLAUDE.md — FluentFoxUi (FoxSensei)

A Japanese-learning web app. React 18 + TypeScript (strict) + Vite 5 + Tailwind 3 +
React Router 6 + Zustand + framer-motion.

## Commands
- `npm run dev` — start Vite dev server
- `npm run build` — `tsc && vite build`
- `npm run preview` — preview the production build
- (to add) `npm run lint`, `npm run format` — see PLAN.md

## The standards live in docs/
- **`docs/FRONTEND_STANDARDS.md`** — how we write frontend here (code, architecture, perf). ← authoritative
- **`docs/UIUX_STANDARDS.md`** — how the UI/UX must look & feel (color/theming, dark mode, elevation, type, motion, states, responsiveness, premium/minimal principles). ← authoritative for design
- **`docs/PLAN.md`** — the prioritized, file-by-file engineering optimization/refactor plan.
- **`docs/UIUX_PLAN.md`** — the UI/UX fix plan (must-fix vs can-improve + the Home-page tightening).

## Golden rules (summary — full version in FRONTEND_STANDARDS.md)
1. **Reuse first.** Never re-implement what's in `src/components/ui/`. Use or extend the primitive; never fork it inline with raw Tailwind.
2. **Tokens only.** No hardcoded hex/px colors, radii, or fonts. Style through the Tailwind design tokens (`bg-surface`, `text-on-surface`, `text-primary`, `border-outline-variant`, …).
3. **Every async view handles loading + error + empty** via the shared state components. Never `service.getX().then(setState)` with no `.catch`.
4. **Lazy-load heavy code** (routes, globe, lottie, confetti, MDX). Keep the initial bundle small.
5. **Memoize** context values (`useMemo`) and callbacks (`useCallback`); `React.memo` pure list items.
6. **Strict TS.** No `any`, no `@ts-ignore`. Domain types live in `src/types`.
7. **Data flow is layered:** component → hook (`src/hooks`) → service (`src/api/services`) → `apiClient` | mock. UI never imports `src/api/mock/*`.
8. **A11y baseline:** clickable = real `<button>`/`<Link>`; icon buttons have `aria-label`; images have `alt` + `loading="lazy"` + dimensions.

## Architecture notes
- The API layer (`src/api/client.ts`, `errors.ts`, `tokenManager.ts`) is solid — do not bypass it.
- Read `import.meta.env` only in `src/lib/config.ts` (to be created). Env vars must be `VITE_`-prefixed.
- Import alias: `@/` → `src/`. Never use `../../` relative imports.

## Specialized agents (`.claude/agents/`)
Use these for frontend work; they follow docs/FRONTEND_STANDARDS.md and docs/UIUX_STANDARDS.md:
- **frontend-architect** — structure, state, data-fetching, and folder decisions (planning).
- **component-builder** — build new reusable, accessible, documented UI primitives/components.
- **refactor-consolidator** — collapse duplicated markup/logic into shared primitives; migrate call sites.
- **perf-optimizer** — bundle size, code-splitting, memoization, lazy-loading, image optimization.
- **frontend-reviewer** — review changes against the engineering standards before merge.
- **ui-ux-reviewer** — review visual design & UX (color/contrast, dark-mode parity, elevation, type, motion, states, premium/minimal feel).
- **responsive-auditor** — review responsiveness & interaction across breakpoints (touch targets, fluid type, overflow, reduced-motion).
