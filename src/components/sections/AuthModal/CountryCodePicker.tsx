import { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'

export interface Country {
  name: string
  code: string  // ISO alpha-2
  dial: string  // e.g. "+91"
}

/** Compute flag emoji from ISO alpha-2 code (works in all modern browsers). */
export function flagEmoji(code: string): string {
  return code.toUpperCase().split('').map(c =>
    String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)
  ).join('')
}

/** Top 30 countries shown by default (ordered by relevance / population). */
export const TOP_30: Country[] = [
  { name: 'India',           code: 'IN', dial: '+91'  },
  { name: 'United States',   code: 'US', dial: '+1'   },
  { name: 'China',           code: 'CN', dial: '+86'  },
  { name: 'Japan',           code: 'JP', dial: '+81'  },
  { name: 'Brazil',          code: 'BR', dial: '+55'  },
  { name: 'United Kingdom',  code: 'GB', dial: '+44'  },
  { name: 'Germany',         code: 'DE', dial: '+49'  },
  { name: 'France',          code: 'FR', dial: '+33'  },
  { name: 'Russia',          code: 'RU', dial: '+7'   },
  { name: 'South Korea',     code: 'KR', dial: '+82'  },
  { name: 'Mexico',          code: 'MX', dial: '+52'  },
  { name: 'Indonesia',       code: 'ID', dial: '+62'  },
  { name: 'Pakistan',        code: 'PK', dial: '+92'  },
  { name: 'Nigeria',         code: 'NG', dial: '+234' },
  { name: 'Bangladesh',      code: 'BD', dial: '+880' },
  { name: 'Philippines',     code: 'PH', dial: '+63'  },
  { name: 'Vietnam',         code: 'VN', dial: '+84'  },
  { name: 'Turkey',          code: 'TR', dial: '+90'  },
  { name: 'Thailand',        code: 'TH', dial: '+66'  },
  { name: 'Egypt',           code: 'EG', dial: '+20'  },
  { name: 'Spain',           code: 'ES', dial: '+34'  },
  { name: 'Italy',           code: 'IT', dial: '+39'  },
  { name: 'Canada',          code: 'CA', dial: '+1'   },
  { name: 'Australia',       code: 'AU', dial: '+61'  },
  { name: 'Argentina',       code: 'AR', dial: '+54'  },
  { name: 'Colombia',        code: 'CO', dial: '+57'  },
  { name: 'South Africa',    code: 'ZA', dial: '+27'  },
  { name: 'Saudi Arabia',    code: 'SA', dial: '+966' },
  { name: 'UAE',             code: 'AE', dial: '+971' },
  { name: 'Singapore',       code: 'SG', dial: '+65'  },
]

/** Extended list shown when searching. */
const EXTRA_COUNTRIES: Country[] = [
  { name: 'Afghanistan',        code: 'AF', dial: '+93'  },
  { name: 'Algeria',            code: 'DZ', dial: '+213' },
  { name: 'Austria',            code: 'AT', dial: '+43'  },
  { name: 'Belgium',            code: 'BE', dial: '+32'  },
  { name: 'Bolivia',            code: 'BO', dial: '+591' },
  { name: 'Cambodia',           code: 'KH', dial: '+855' },
  { name: 'Chile',              code: 'CL', dial: '+56'  },
  { name: 'Czech Republic',     code: 'CZ', dial: '+420' },
  { name: 'Denmark',            code: 'DK', dial: '+45'  },
  { name: 'Dominican Republic', code: 'DO', dial: '+1'   },
  { name: 'Ecuador',            code: 'EC', dial: '+593' },
  { name: 'Ethiopia',           code: 'ET', dial: '+251' },
  { name: 'Finland',            code: 'FI', dial: '+358' },
  { name: 'Ghana',              code: 'GH', dial: '+233' },
  { name: 'Greece',             code: 'GR', dial: '+30'  },
  { name: 'Guatemala',          code: 'GT', dial: '+502' },
  { name: 'Hong Kong',          code: 'HK', dial: '+852' },
  { name: 'Hungary',            code: 'HU', dial: '+36'  },
  { name: 'Iran',               code: 'IR', dial: '+98'  },
  { name: 'Iraq',               code: 'IQ', dial: '+964' },
  { name: 'Israel',             code: 'IL', dial: '+972' },
  { name: 'Jordan',             code: 'JO', dial: '+962' },
  { name: 'Kazakhstan',         code: 'KZ', dial: '+7'   },
  { name: 'Kenya',              code: 'KE', dial: '+254' },
  { name: 'Kuwait',             code: 'KW', dial: '+965' },
  { name: 'Lebanon',            code: 'LB', dial: '+961' },
  { name: 'Malaysia',           code: 'MY', dial: '+60'  },
  { name: 'Morocco',            code: 'MA', dial: '+212' },
  { name: 'Myanmar',            code: 'MM', dial: '+95'  },
  { name: 'Nepal',              code: 'NP', dial: '+977' },
  { name: 'Netherlands',        code: 'NL', dial: '+31'  },
  { name: 'New Zealand',        code: 'NZ', dial: '+64'  },
  { name: 'Norway',             code: 'NO', dial: '+47'  },
  { name: 'Oman',               code: 'OM', dial: '+968' },
  { name: 'Peru',               code: 'PE', dial: '+51'  },
  { name: 'Poland',             code: 'PL', dial: '+48'  },
  { name: 'Portugal',           code: 'PT', dial: '+351' },
  { name: 'Qatar',              code: 'QA', dial: '+974' },
  { name: 'Romania',            code: 'RO', dial: '+40'  },
  { name: 'Sri Lanka',          code: 'LK', dial: '+94'  },
  { name: 'Sweden',             code: 'SE', dial: '+46'  },
  { name: 'Switzerland',        code: 'CH', dial: '+41'  },
  { name: 'Taiwan',             code: 'TW', dial: '+886' },
  { name: 'Tanzania',           code: 'TZ', dial: '+255' },
  { name: 'Tunisia',            code: 'TN', dial: '+216' },
  { name: 'Ukraine',            code: 'UA', dial: '+380' },
  { name: 'Venezuela',          code: 'VE', dial: '+58'  },
]

export const ALL_COUNTRIES: Country[] = [...TOP_30, ...EXTRA_COUNTRIES]

// ── Component ─────────────────────────────────────────────────────────────────

interface CountryCodePickerProps {
  value:    Country
  onChange: (country: Country) => void
}

export function CountryCodePicker({ value, onChange }: CountryCodePickerProps) {
  const [open, setOpen]                       = useState(false)
  const [search, setSearch]                   = useState('')
  const [dropdownPos, setDropdownPos]         = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const triggerRef                            = useRef<HTMLButtonElement>(null)
  const dropdownRef                           = useRef<HTMLDivElement>(null)
  const searchRef                             = useRef<HTMLInputElement>(null)

  // Close on click outside (both trigger and portal dropdown)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        triggerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close on scroll so the fixed dropdown doesn't drift
  useEffect(() => {
    if (!open) return
    const handler = () => setOpen(false)
    window.addEventListener('scroll', handler, true)
    return () => window.removeEventListener('scroll', handler, true)
  }, [open])

  // Auto-focus search when opened; clear search when closed
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 40)
    } else {
      setSearch('')
    }
  }, [open])

  const filtered = useMemo(() => {
    if (!search.trim()) return TOP_30
    const q = search.toLowerCase()
    return ALL_COUNTRIES.filter(c =>
      c.name.toLowerCase().includes(q) || c.dial.includes(q)
    )
  }, [search])

  const handleOpen = () => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setDropdownPos({ top: rect.bottom + 6, left: rect.left })
    setOpen(v => !v)
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="relative flex-shrink-0">
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className="flex items-center gap-1.5 h-full bg-surface-container-low rounded-l-lg px-3 py-3 text-on-surface hover:bg-surface-container transition-colors border-r border-surface-container-highest"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="text-base leading-none">{flagEmoji(value.code)}</span>
        <span className="text-sm font-semibold tabular-nums">{value.dial}</span>
        <svg
          className={`w-3 h-3 text-outline transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 12 12" fill="none"
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Dropdown rendered at document.body to escape overflow clipping */}
      {open && createPortal(
        <div
          ref={dropdownRef}
          style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, zIndex: 9999 }}
          className="w-72 bg-surface-container-lowest rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-outline-variant/20 overflow-hidden"
        >
          {/* Search input */}
          <div className="p-2 border-b border-surface-container-high">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search country or dial code…"
              className="w-full bg-surface-container-low rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-outline/50 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Country list */}
          <div className="max-h-52 overflow-y-auto">
            {!search.trim() && (
              <p className="px-4 pt-2 pb-1 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/60">
                Common Countries
              </p>
            )}
            {filtered.length === 0 ? (
              <p className="text-center text-xs text-on-surface-variant py-5">No results found</p>
            ) : (
              filtered.map(c => (
                <button
                  key={`${c.code}-${c.dial}`}
                  type="button"
                  role="option"
                  aria-selected={value.code === c.code}
                  onClick={() => { onChange(c); setOpen(false) }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left ${
                    value.code === c.code
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <span className="text-base leading-none">{flagEmoji(c.code)}</span>
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="text-on-surface-variant text-xs font-mono">{c.dial}</span>
                  {value.code === c.code && (
                    <svg className="w-3.5 h-3.5 text-primary flex-shrink-0" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7l3.5 3.5L12 3.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}
