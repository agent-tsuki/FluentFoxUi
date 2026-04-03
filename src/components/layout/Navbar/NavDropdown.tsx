import { Link } from 'react-router-dom'
import type { DropdownItem } from '@/types'
import { Icon } from '@/components/ui/Icon'

interface NavDropdownProps {
  label: string
  items: DropdownItem[]
}

export function NavDropdown({ label, items }: NavDropdownProps) {
  return (
    <div className="relative group cursor-pointer">
      <div className="flex items-center gap-1 text-on-surface-variant group-hover:text-on-surface group-hover:scale-105 transition-all duration-200">
        {label}
        <Icon name="keyboard_arrow_down" className="text-xs" />
      </div>
      {/* Invisible bridge to prevent hover gap */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 w-full h-2" />
      <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-150 absolute top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 min-w-[10rem] bg-surface-container-lowest shadow-xl rounded-xl p-2 border border-outline-variant/30">
        {items.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className="block px-4 py-2 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface text-sm whitespace-nowrap transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
