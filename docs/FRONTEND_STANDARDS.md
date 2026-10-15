# FluentFoxUi — Frontend Engineering Standards

> The single source of truth for **how we write frontend code** in this repo.
> Optimized for **readability, reuse, modularity, and speed**. Every PR and every
> agent must follow this. When in doubt, match the patterns already used in
> `src/api/client.ts`, `src/components/ui/Button.tsx`, and `src/components/auth/RequireAuth.tsx`
> — they represent the quality bar.

---

## 1. Stack & non-negotiables

| Concern        | Choice                                  |
| -------------- | --------------------------------------- |
| Framework      | React 18 (function components + hooks)  |
| Language       | TypeScript 5.6, `strict: true`          |
| Build          | Vite 5                                  |
| Routing        | React Router 6 (`createBrowserRouter`)  |
| Styling        | Tailwind 3 + CSS-variable design tokens |
| Global state   | Zustand (stores) + React Context (ephemeral, tree-scoped) |
| Animation      | framer-motion (shared variants only)    |
| Import alias   | `@/` → `src/` (never use `../../`)       |

**Never break these:**
1. Keep `tsconfig` strict. No new `any`, no `@ts-ignore`, no non-null `!` without a guard above it.
2. Never hardcode a hex color, font, or radius in a component — use design tokens (§4).
3. Never re-implement something that exists in `src/components/ui/`. Reuse or extend the primitive (§3).
4. Every async/data view handles **loading, error, and empty** states (§6).
5. Heavy/rarely-used code is **lazy-loaded**, not in the initial bundle (§7).

---

## 2. Folder structure & where things go

```
src/
  api/
    client.ts          # fetch wrapper, auth refresh — DO NOT bypass
    errors.ts          # ApiError + resolveErrorMessage
    tokenManager.ts    # refresh-token storage
    services/          # one file per domain; the ONLY place UI-bound data comes from
    mock/              # mock data — imported ONLY by services, NEVER by components/pages
  components/
    ui/                # design-system primitives (Button, Card, Modal, …) — reusable, dumb, documented
    layout/            # Navbar, Footer (app chrome)
    sections/          # feature sections composed FROM ui/ primitives
    <feature>/         # feature-scoped components (auth, grammar, quiz, profile)
  context/             # ephemeral, tree-scoped state (e.g. ModalContext)
  store/               # Zustand stores (auth, ui) — app-wide persistent state
  hooks/               # shared cross-feature hooks (useAsync, useDashboard, …)
  lib/                 # config (single point for import.meta.env), constants, cn()
  pages/               # route entry points — compose sections, own data fetching via hooks
  types/               # ALL domain types (AuthUser, KanaChar, ClassTeacher, …)
  utils/               # pure helpers (mdxParser, animatedFavicon)
  assets/              # animations, mdx, lottie
```

**Placement rules**
- A component used by **2+ features** → `components/ui/` (if generic) or `hooks/`/`lib/` (if logic).
- A type used **anywhere outside one file** → `src/types/`. Types must never live in a `mock/` or `context/` file.
- Reading `import.meta.env` happens **only** in `src/lib/config.ts`. Nowhere else.
- Data for the UI comes from a **service** (`api/services/*`), consumed through a **hook** (`hooks/*`). Pages/components never import `api/mock/*` directly.

---

## 3. Components: the reuse rules

### 3.1 The primitive-first rule
Before writing markup, check `src/components/ui/`. If a card, modal, button, input, badge,
section header, or stat tile is needed, **use the primitive**. If it almost fits, **extend the
primitive with a prop** — do not fork it inline with raw Tailwind.

**Primitives (target catalog).** Existing today: `Button`, `CloseButton`, `Icon`, `FadeIn`,
`ErrorBoundary`. To be built (see PLAN.md): `Card`, `Modal`, `SectionHeader`/`Eyebrow`,
`TextField`/`PasswordField`/`SelectField`/`FormLabel`, `Badge`/`Chip`, `JlptBadge`, `StatCard`,
`StatusMessage`/`IconRing`, `LoadingState`/`ErrorState`/`EmptyState`.

### 3.2 Anatomy of a component file
```tsx
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Card — surface panel used across dashboard, profile, and marketing sections.
 * Prefer this over hand-typing `bg-surface-container-low rounded-2xl p-6 border`.
 */
interface CardProps {
  variant?: 'low' | 'lowest' | 'dark'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
  className?: string
  children: ReactNode
}

const VARIANTS: Record<NonNullable<CardProps['variant']>, string> = {
  low:    'bg-surface-container-low border border-outline-variant/40',
  lowest: 'bg-surface-container-lowest border border-outline-variant/30',
  dark:   'bg-on-surface text-inverse-on-surface',
}

export function Card({ variant = 'low', padding = 'md', hoverable, className, children }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl transition-shadow',
        VARIANTS[variant],
        padding !== 'none' && { sm: 'p-4', md: 'p-6', lg: 'p-8' }[padding],
        hoverable && 'hover:shadow-lg hover:-translate-y-0.5',
        className,
      )}
    >
      {children}
    </div>
  )
}
```

**Rules this demonstrates**
- **Named export**, `export function ComponentName` (no default exports, no `React.FC`).
- Props interface named `ComponentNameProps`, always `interface` (not `type`).
- **Variant maps** (`Record<Variant, string>`) instead of ternary soup in JSX. Mirrors `Button.tsx`.
- Always accept `className` and merge it **last** via `cn()` so callers can tweak without forking.
- A one-line JSDoc saying **what it is and when to use it**.

### 3.3 The `cn()` helper
Use `cn(...)` (clsx + tailwind-merge) to compose classes. Never build class strings with
template literals and manual spaces. Add it once at `src/lib/cn.ts`.

### 3.4 Size & composition
- Keep components **< ~150 lines**. If a file defines multiple sub-components (e.g. `StarRating`,
  `ReviewCard` inside a page), extract them into their own files.
- One component = one responsibility. A "page" composes sections; a "section" composes primitives.

### 3.5 Naming
- Files & components: `PascalCase.tsx`. Hooks: `useCamelCase.ts`. Utils: `camelCase.ts`.
- No two components share a name (rename the two `CharCard`s → `CharOfTheDayCard`, `KanaCard`).
- Every `sections/*` and multi-file feature folder exports through an `index.ts` **barrel**.

---

## 4. Design tokens & styling

The palette, fonts, and radii live in `tailwind.config.ts`; light/dark values are CSS variables
in `src/index.css`. **Always** style through tokens so dark mode and theming keep working.

| Use…                          | Not…                          |
| ----------------------------- | ----------------------------- |
| `bg-surface`, `text-on-surface` | `bg-white`, `text-[#191c1d]` |
| `text-primary`, `bg-primary`  | `text-[#EA6B44]`              |
| `border-outline-variant`      | `border-gray-200`            |
| `rounded-2xl` (token scale)   | `rounded-[14px]`             |

- Recurring multi-class patterns (card shell, gradient button, glass panel, pill) become a
  **primitive** or a **variant map** — never a copy-pasted string.
- Repeated framer-motion configs live in `src/lib/motion.ts` (`springs`, `fadeInUp`, …). Do not
  redeclare `{ type: 'spring', stiffness: 300, ... }` inline in five files.

---

## 5. State management — pick the right tool

| State kind                                   | Tool                          |
| -------------------------------------------- | ----------------------------- |
| App-wide, persistent (auth user/token, dark mode) | **Zustand store** (`src/store/`) |
| Ephemeral, tree-scoped UI (which modal is open)   | **React Context** (`src/context/`) |
| Server data (dashboard, kanji, profile…)     | **Data hook** over a service (§6) |
| Local, one-component                         | `useState` / `useReducer`     |

**Rules**
- One store per concern; **one source of truth**. Auth (`user` + `accessToken` + `status`) lives in
  **one** Zustand slice — not split across a context, a store, and localStorage by hand.
- Zustand `persist` middleware for persistence — never hand-rolled `useEffect` + `localStorage`.
- **Every** Context provider `value` is wrapped in `useMemo`, and every callback in `useCallback`.
  An un-memoized provider value re-renders every consumer on every parent render.

---

## 6. Data fetching — one pattern, always

Never write `service.getX().then(setState)` in a `useEffect` again. Use the shared hook, which
guarantees loading/error handling and cancels on unmount:

```tsx
// hooks/useDashboard.ts
export const useDashboard = () => useAsync(() => dashboardService.getDashboardData(), [])

// page
const { data, loading, error } = useDashboard()
if (loading) return <LoadingState />
if (error)   return <ErrorState error={error} onRetry={refetch} />
if (!data?.length) return <EmptyState />
return <DashboardHero data={data} />
```

- Layering is strict: **component → hook → service → `apiClient` | mock**. No skipping layers.
- Loading/error/empty use the **shared** `LoadingState`/`ErrorState`/`EmptyState` components —
  not four different ad-hoc spinners.
- Prefer **TanStack Query** for real server data (caching, dedupe, retry) once APIs are live;
  `useAsync` is the minimal interim. Either way the call site looks the same.
- A mock↔real switch is **one env flag** (`VITE_USE_MOCK` in `lib/config.ts`), never 11 file edits.

---

## 7. Performance rules

1. **Route-level code splitting.** Every route element is `React.lazy` + `<Suspense>`. Nothing
   heavy (globe, lottie, confetti, MDX parser) is in the initial chunk.
2. **Vendor chunking.** `vite.config.ts` `manualChunks` splits `framer-motion`, `cobe`, lottie so
   they cache independently and don't bloat first paint.
3. **Lazy heavy assets.** Import large Lottie/JSON with `?url` and fetch on demand; never
   `eager: true` glob over all content (the 25 MDX chapters must load per-chapter).
4. **Memoize.** Context values (`useMemo`), callbacks (`useCallback`), and pure list-item cards
   (`React.memo`). Never pass a fresh inline object/array as a prop to a memoized child.
5. **No per-frame `setState`.** Animation loops (rAF) drive DOM via refs/transforms, not React state.
6. **Images.** Every `<img>` gets `loading="lazy"` + explicit `width`/`height`. Ship WebP/AVIF at
   display size; no 1 MB PNGs.
7. **Stable keys.** Use stable ids as `key`, not array index, for any list that can reorder/filter.

---

## 8. TypeScript rules

- No `any`. Use `unknown` + narrowing for caught errors (`catch (err: unknown)`), as `VerifyEmailPage.tsx` does.
- Props: `interface ComponentNameProps`. Discriminated unions for variant-dependent props.
- Domain types in `src/types`, imported by everyone; never re-declared per file.
- Type `import.meta.env` in `vite-env.d.ts` via an `ImportMetaEnv` interface.

---

## 9. Accessibility (baseline, non-optional)

- Anything clickable is a `<button>`/`<a>`/`<Link>`. If a `<div>` must be interactive, it needs
  `role`, `tabIndex`, `aria-label`, and `onKeyDown` (Enter/Space) — mirror `HiraganaChart/CharCard.tsx`.
- Every icon-only button routes through `CloseButton` or carries an `aria-label`.
- Every `<img>` has a meaningful `alt` (not `"Avatar"`).
- Modals: focus trap, `Escape` to close, backdrop click, body-scroll-lock — all provided by the
  shared `<Modal>` primitive so behavior is consistent.

---

## 10. Documentation

- Every `ui/` primitive and every shared hook has a JSDoc `/** */`: what it is + when to use it.
- Non-obvious logic (regex parsers, animation math) gets an inline comment explaining the *why*.
- Public/props types are self-documenting via good names; comment only what names can't convey.

---

## 11. Tooling & workflow

- `npm run dev | build | preview`. Add and keep green: `npm run lint` (ESLint flat config with
  `typescript-eslint`, `react-hooks`, `jsx-a11y`) and `npm run format` (Prettier).
- A `no-restricted-imports` lint rule forbids importing `@/api/mock/*` outside `src/api/`.
- Prettier owns formatting (semicolons, quotes) — don't hand-argue style in review.

---

## 12. PR / self-review checklist

- [ ] Reused an existing primitive (or extended one) instead of new inline markup?
- [ ] Only design tokens — no raw hex/px colors, radii, fonts?
- [ ] Loading + error + empty states handled via shared components?
- [ ] Heavy code lazy-loaded; no new weight in the initial bundle?
- [ ] Context values/callbacks memoized; list items `memo`'d where pure?
- [ ] Types in `src/types`; no `any`/`@ts-ignore`; strict passes?
- [ ] Clickable = real button/link; images have alt + lazy + dimensions?
- [ ] Component < ~150 lines, single responsibility, JSDoc on primitives/hooks?
- [ ] `npm run build`, `lint`, and `format:check` all pass?
