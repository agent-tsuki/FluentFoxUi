import { useId, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { NavItem } from '@/types'
import { Icon } from '@/components/ui/Icon'
import { JLPT_LEVELS, CHAPTER_TABS, isLevelAvailable,  chapterPath, jlptLevelOf, type JlptLevelId } from '@/lib/content/jlpt/levels'

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
    () =>
      items.find((item) => (item.mega === 'jlpt' ? jlptLevelOf(pathname) !== null : item.dropdown?.some((link) => pathname.startsWith(link.href))))
        ?.label ?? null,
  )

  return (
    <>
      {items.map((item) =>
        item.mega === 'jlpt' ? (
          <MobileJlptSection
            key={item.label}
            label={item.label}
            open={openLabel === item.label}
            onToggle={() => setOpenLabel((current) => (current === item.label ? null : item.label))}
            onNavigate={onNavigate}
          />
        ) : item.dropdown ? (
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

interface MobileJlptSectionProps {
  label: string
  open: boolean
  onToggle: () => void
  onNavigate: () => void
}

/** JLPT in the phone menu: levels that expand in place to Grammar, Vocabulary and Exercise; levels not ready show a lock. */
function MobileJlptSection({ label, open, onToggle, onNavigate }: MobileJlptSectionProps) {
  const panelId = useId()
  const { pathname } = useLocation()
  const [level, setLevel] = useState<JlptLevelId | null>(() => jlptLevelOf(pathname) ?? 'n5')
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className={`${LINK_CLASS} w-full justify-between ${open ? 'text-on-surface' : ''}`}
      >
        {label}
        <Icon name="expand_more" className={`text-xl transition-transform duration-200 motion-reduce:transition-none ${open ? 'rotate-180' : ''}`} />
      </button>
      <div id={panelId} hidden={!open} className="mb-1 ml-3 border-l border-outline-variant/50 pl-2">
        {JLPT_LEVELS.map((l) => {
          if (!isLevelAvailable(l.id)) {
            return (
              <p key={l.id} className={`${LINK_CLASS} justify-between text-on-surface-variant/60 hover:bg-transparent hover:text-on-surface-variant/60`}>
                <span>
                  {l.label} · {l.name}
                </span>
                <LockedMark />
              </p>
            )
          }
          const expanded = level === l.id
          const levelPanel = `${panelId}-${l.id}`
          return (
            <div key={l.id}>
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={levelPanel}
                onClick={() => setLevel(expanded ? null : l.id)}
                className={`${LINK_CLASS} w-full justify-between ${expanded ? 'text-on-surface' : ''}`}
              >
                <span>
                  {l.label} · <span className="font-medium">{l.name}</span>
                </span>
                <Icon name="expand_more" className={`text-xl transition-transform duration-200 motion-reduce:transition-none ${expanded ? 'rotate-180' : ''}`} />
              </button>
              <div id={levelPanel} hidden={!expanded} className="mb-1 ml-3 border-l border-outline-variant/50 pl-2">
                {CHAPTER_TABS.map((section) =>
                  isLevelAvailable(l.id) ? (
                    <Link key={section.id} to={chapterPath(l.id, 1, section.id)} onClick={onNavigate} className={LINK_CLASS}>
                      {section.title}
                    </Link>
                  ) : (
                    <p key={section.id} className={`${LINK_CLASS} justify-between text-on-surface-variant/60 hover:bg-transparent hover:text-on-surface-variant/60`}>
                      {section.title}
                      <LockedMark />
                    </p>
                  ),
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** Marks a level or part that is not ready yet. */
function LockedMark() {
  return (
    <span className="inline-flex shrink-0 items-center text-on-surface-variant/60" title="Coming soon">
      <Icon name="lock" className="text-base" />
      <span className="sr-only">, coming soon</span>
    </span>
  )
}
