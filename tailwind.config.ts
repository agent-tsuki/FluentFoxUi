import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* ── FoxSensei design system ── */
        'surface-raised':  'rgb(var(--surface-raised) / <alpha-value>)',
        'surface-sunken':  'rgb(var(--surface-sunken) / <alpha-value>)',
        'surface-hover':   'rgb(var(--surface-hover) / <alpha-value>)',
        ink:               'rgb(var(--ink) / <alpha-value>)',
        'ink-muted':       'rgb(var(--ink-muted) / <alpha-value>)',
        'ink-subtle':      'rgb(var(--ink-subtle) / <alpha-value>)',
        line:              'rgb(var(--line) / <alpha-value>)',
        'line-strong':     'rgb(var(--line-strong) / <alpha-value>)',
        'primary-hover':   'rgb(var(--primary-hover) / <alpha-value>)',
        'on-primary':      'rgb(var(--on-primary) / <alpha-value>)',
        'primary-soft':    'rgb(var(--primary-soft) / <alpha-value>)',
        'primary-ink':     'rgb(var(--primary-ink) / <alpha-value>)',
        leaf:              'rgb(var(--leaf) / <alpha-value>)',
        'leaf-soft':       'rgb(var(--leaf-soft) / <alpha-value>)',
        'leaf-ink':        'rgb(var(--leaf-ink) / <alpha-value>)',
        'success-soft':    'rgb(var(--success-soft) / <alpha-value>)',
        'success-ink':     'rgb(var(--success-ink) / <alpha-value>)',
        'warning-soft':    'rgb(var(--warning-soft) / <alpha-value>)',
        'warning-ink':     'rgb(var(--warning-ink) / <alpha-value>)',
        'info-soft':       'rgb(var(--info-soft) / <alpha-value>)',
        'info-ink':        'rgb(var(--info-ink) / <alpha-value>)',
        danger:            'rgb(var(--danger) / <alpha-value>)',
        'danger-soft':     'rgb(var(--danger-soft) / <alpha-value>)',
        'danger-ink':      'rgb(var(--danger-ink) / <alpha-value>)',
        focus:             'rgb(var(--focus) / <alpha-value>)',

        // Grammar diagram tones (scoped by a .diagram-tone-* class; see src/index.css)
        tone: 'rgb(var(--tone) / <alpha-value>)',
        'tone-soft': 'rgb(var(--tone-soft) / <alpha-value>)',
        'tone-ink': 'rgb(var(--tone-ink) / <alpha-value>)',
        // Fox brand palette
        'fox-dark': '#D86B35',
        fox: '#EA6B44',
        'fox-light': '#FF9F5C',

        // Primary — fox orange (container/fixed roles stay theme-invariant by design)
        // primary-container deepened from #D86B35 so on-primary-container text passes AA (4.55:1).
        'primary-container': '#B35223',
        'primary-fixed': '#FFE8C9',
        'primary-fixed-dim': '#FF9F5C',
        'on-primary-fixed': '#3D1A05',
        'on-primary-fixed-variant': '#B84A1E',
        'on-primary-container': '#FFF0E6',
        'inverse-primary': '#FF9F5C',
        'surface-tint': '#BB4D2C',

        // Secondary — warm terracotta (CSS-variable-backed: deepened in light, lifted in dark for AA)
        secondary: 'rgb(var(--secondary) / <alpha-value>)',
        'secondary-container': '#F0845A',
        'secondary-fixed': '#FFE8C9',
        'secondary-fixed-dim': '#EBBD91',
        'on-secondary': '#ffffff',
        'on-secondary-fixed': '#3D1A05',
        'on-secondary-fixed-variant': '#7A3010',
        'on-secondary-container': '#3D1A05',

        tertiary: '#005a7d',
        'surface-variant': '#e1e3e4',
        'on-error-container': '#93000a',
        /* ── CSS-variable-backed tokens (light/dark auto-switch) ── */
        surface:                   'rgb(var(--surface) / <alpha-value>)',

        /* ── Primary — fox orange (dimmed in dark mode; see src/index.css) ── */
        primary: 'rgb(var(--primary) / <alpha-value>)',

        /* ── Semantic status (CSS-variable-backed; brighter in dark for contrast) ── */
        success: 'rgb(var(--success) / <alpha-value>)',
        warning: 'rgb(var(--warning) / <alpha-value>)',
        info:    'rgb(var(--info) / <alpha-value>)',
        /* ── Chart series (one per learning track) ── */
        'chart-1': 'rgb(var(--chart-1) / <alpha-value>)',
        'chart-2': 'rgb(var(--chart-2) / <alpha-value>)',
        'chart-3': 'rgb(var(--chart-3) / <alpha-value>)',
        'chart-4': 'rgb(var(--chart-4) / <alpha-value>)',
        'chart-5': 'rgb(var(--chart-5) / <alpha-value>)',

        /* ── Static tokens (same in light and dark) ── */
        'on-tertiary-fixed': '#001e2d',
        'tertiary-fixed': '#c5e7ff',
        'on-error': '#ffffff',
        'inverse-surface': '#2e3132',
        // Brand-dark panel — intentionally dark in BOTH themes (hero/dashboard/marketing bands).
        'surface-inverse': '#2f2521',
        'on-surface-inverse': '#f4ece7',
        'on-surface-inverse-variant': '#c9b3a6',
        error: '#ba1a1a',
        'on-tertiary-fixed-variant': '#004c6b',
        'on-tertiary-container': '#e0f1ff',
        'on-background': '#191c1d',
        'on-tertiary': '#ffffff',
        'tertiary-fixed-dim': '#80cfff',
        'on-surface-static': '#191c1d',
        'error-container': '#ffdad6',
        'inverse-on-surface': '#f0f1f2',
      },
      fontFamily: {
        sans: ['DM Sans', 'Noto Sans JP', 'Hiragino Sans', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Noto Sans JP', 'Hiragino Sans', 'system-ui', 'sans-serif'],
        // Full-coverage Japanese: sentences, vocabulary and kanji study.
        ja: ['Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', 'sans-serif'],
        // Rounded display kana only. It is a glyph subset, so never use it for running text or kanji study.
        'ja-display': ['Zen Maru Gothic', 'Hiragino Maru Gothic ProN', 'Noto Sans JP', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '0.875rem' }], // 11px
        // Design-system type scale. display, h1 and ja-lg step down below 1024px (see :root in index.css).
        display: ['var(--text-display)', { lineHeight: 'var(--leading-display)', letterSpacing: '-0.02em', fontWeight: '700' }],
        h1: ['var(--text-h1)', { lineHeight: 'var(--leading-h1)', letterSpacing: '-0.015em', fontWeight: '700' }],
        h2: ['1.625rem', { lineHeight: '2.125rem', letterSpacing: '-0.01em', fontWeight: '700' }],
        h3: ['1.1875rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.875rem' }],
        body: ['1rem', { lineHeight: '1.625rem' }],
        label: ['0.875rem', { lineHeight: '1.25rem', fontWeight: '600' }],
        caption: ['0.8125rem', { lineHeight: '1.125rem', fontWeight: '500' }],
        eyebrow: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.12em', fontWeight: '700' }],
        'kana-display': ['4rem', { lineHeight: '4.5rem', fontWeight: '700' }],
        'ja-lg': ['var(--text-ja-lg)', { lineHeight: 'var(--leading-ja-lg)', fontWeight: '500' }],
        'ja-md': ['1.375rem', { lineHeight: '2.5rem', fontWeight: '500' }],
        'ja-sm': ['1.0625rem', { lineHeight: '1.875rem', fontWeight: '500' }],
        furigana: ['0.6875rem', { lineHeight: '0.875rem', fontWeight: '500' }],
        'display-lg': ['clamp(2.5rem, 5vw, 3.75rem)', { lineHeight: '1.1' }],
        'display-md': ['clamp(2rem, 4vw, 3rem)', { lineHeight: '1.2' }],
        'display-sm': ['clamp(1.75rem, 3vw, 2.25rem)', { lineHeight: '1.25' }],
      },
      spacing: {
        // Fixed navbar height: single source of truth (`h-nav`, `pt-nav`, `scroll-mt-nav`).
        nav: '64px',
        'chapter-bar': '56px',
        'touch-target': '44px',
        reading: '680px',
        sidebar: '288px',
      },
      borderRadius: {
        // sm badges < md controls < lg cards and wells < xl sheets and sidebars < full.
        DEFAULT: '0.25rem',
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        full: '9999px',
      },
      transitionDuration: {
        fast: '120ms',
        base: '200ms',
        slow: '320ms',
      },
      boxShadow: {
        'elevation-1': 'var(--shadow-elevation-1)',
        'elevation-2': 'var(--shadow-elevation-2)',
        'elevation-3': 'var(--shadow-elevation-3)',
      },
      keyframes: {
        // A surface rising into place (mobile auth panel). Pairs with springs.sheet in src/lib/motion.ts.
        'sheet-rise': {
          from: { transform: 'translateY(3rem)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
      },
      animation: {
        'sheet-rise': 'sheet-rise 0.45s cubic-bezier(0.22, 1, 0.36, 1) 0.05s both',
      },
    },
  },
  plugins: [],
}

export default config
