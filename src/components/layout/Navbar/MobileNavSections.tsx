import { useId, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { NavItem } from '@/types'
import { Icon } from '@/components/ui/Icon'

interface MobileNavSectionsProps {
  items: NavItem[]
  /** Called after a link is chosen (closes the drawer). */
  onNavigate: () => void
}

const LINK_CLASS =
  'flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface'

/**
 * The phone menu's links. A plain item is a link; an item with a dropdown
 * (Grammar, Kanas) is a section that expands on tap to show its links, like
 * an accordion: opening one closes the other. The section holding the current
 * page starts open.
 */
export function MobileNavSections({ items, onNavigate }: MobileNavSectionsProps) {
  const { pathname } = useLocation()
  const [openLabel, setOpenLabel] = useState<string | null>(
    () => items.find((item) => item.dropdown?.some((link) => pathname.startsWith(link.href)))?.label ?? null,
  )

  return (
    <>
      {items.map((item) =>
        item.dropdown ? (
          <MobileNavSection
            key={item.label}
            item={item}
            open={openLabel === item.label}
            onToggle={() => setOpenLabel((current) => (current === item.label ? null : item.label))}
            onNavigate={onNavigate}
          />
        ) : (
          <Link key={item.label} to={item.href ?? '/'} onClick={onNavigate} className={LINK_CLASS}>
            {item.label}
          </Link>
        ),
      )}
    </>
  )
}

interface MobileNavSectionProps {
  item: NavItem
  open: boolean
  onToggle: () => void
  onNavigate: () => void
}

function MobileNavSection({ item, open, onToggle, onNavigate }: MobileNavSectionProps) {
  const panelId = useId()
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className={`${LINK_CLASS} w-full justify-between ${open ? 'text-on-surface' : ''}`}
      >
        {item.label}
        <Icon
          name="expand_more"
          className={`text-xl transition-transform duration-200 motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div id={panelId} hidden={!open} className="mb-1 ml-3 border-l border-outline-variant/50 pl-2">
        {item.dropdown?.map((link) => (
          <Link key={link.href} to={link.href} onClick={onNavigate} className={LINK_CLASS}>
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
