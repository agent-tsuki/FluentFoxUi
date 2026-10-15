import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Fox brand palette
        'fox-dark': '#D86B35',
        fox: '#EA6B44',
        'fox-light': '#FF9F5C',

        // Primary — fox orange (container/fixed roles stay theme-invariant by design)
        'primary-container': '#D86B35',
        'primary-fixed': '#FFE8C9',
        'primary-fixed-dim': '#FF9F5C',
        'on-primary': '#ffffff',
        'on-primary-fixed': '#3D1A05',
        'on-primary-fixed-variant': '#B84A1E',
        'on-primary-container': '#FFF0E6',
        'inverse-primary': '#FF9F5C',
        'surface-tint': '#EA6B44',

        // Secondary — warm terracotta
        secondary: '#C45A2A',
        'secondary-container': '#F0845A',
        'secondary-fixed': '#FFE8C9',
        'secondary-fixed-dim': '#EBBD91',
        'on-secondary': '#ffffff',
        'on-secondary-fixed': '#3D1A05',
        'on-secondary-fixed-variant': '#7A3010',
        'on-secondary-container': '#3D1A05',

        tertiary: '#005a7d',
        'surface-variant': '#e1e3e4',
        'surface-container': '#edeeef',
        'on-error-container': '#93000a',
        /* ── CSS-variable-backed tokens (light/dark auto-switch) ── */
        surface:                   'rgb(var(--surface) / <alpha-value>)',
        background:                'rgb(var(--background) / <alpha-value>)',
        'surface-dim':             'rgb(var(--surface-dim) / <alpha-value>)',
        'surface-bright':          'rgb(var(--surface-bright) / <alpha-value>)',
        'surface-container-lowest':'rgb(var(--surface-container-lowest) / <alpha-value>)',
        'surface-container-low':   'rgb(var(--surface-container-low) / <alpha-value>)',
        'surface-container':       'rgb(var(--surface-container) / <alpha-value>)',
        'surface-container-high':  'rgb(var(--surface-container-high) / <alpha-value>)',
        'surface-container-highest':'rgb(var(--surface-container-highest) / <alpha-value>)',
        'on-surface':              'rgb(var(--on-surface) / <alpha-value>)',
        'on-surface-variant':      'rgb(var(--on-surface-variant) / <alpha-value>)',
        outline:                   'rgb(var(--outline) / <alpha-value>)',
        'outline-variant':         'rgb(var(--outline-variant) / <alpha-value>)',

        /* ── Primary — fox orange (dimmed in dark mode; see src/index.css) ── */
        primary: 'rgb(var(--primary) / <alpha-value>)',

        /* ── Semantic status (CSS-variable-backed; brighter in dark for contrast) ── */
        success: 'rgb(var(--success) / <alpha-value>)',
        warning: 'rgb(var(--warning) / <alpha-value>)',
        info:    'rgb(var(--info) / <alpha-value>)',

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
        headline: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Inter', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '0.875rem' }], // 11px
        'display-lg': ['clamp(2.5rem, 5vw, 3.75rem)', { lineHeight: '1.1' }],
        'display-md': ['clamp(2rem, 4vw, 3rem)', { lineHeight: '1.2' }],
        'display-sm': ['clamp(1.75rem, 3vw, 2.25rem)', { lineHeight: '1.25' }],
      },
      spacing: {
        // Fixed navbar height — single source of truth (logo 50px + comfortable padding).
        // Consumed as `h-nav` (nav itself) and `mt-nav`/`pt-nav`/`scroll-mt-nav` (offsets for content below it).
        nav: '80px',
      },
      borderRadius: {
        // `full` MUST stay 9999px so avatars, pills, and spinners render truly round.
        // Scale is monotonic: DEFAULT 2 < lg 4 < xl 8 < (2xl 16 < 3xl 24 from Tailwind) < full.
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '9999px',
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
