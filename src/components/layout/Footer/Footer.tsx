import { useEffect, useState } from 'react'
import type { FooterLink } from '@/types'
import { navigationService } from '@/api/services/navigationService'

export function Footer() {
  const [links, setLinks] = useState<FooterLink[]>([])

  useEffect(() => {
    navigationService.getFooterLinks().then(setLinks)
  }, [])

  return (
    <footer className="bg-slate-50 dark:bg-slate-950 w-full py-12 px-8 border-t border-surface-container-high/30">
      <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto gap-8">
        <div className="text-lg font-bold text-slate-900 font-headline tracking-tighter">
          FluentFox
        </div>

        <div className="flex gap-10 text-xs tracking-tight text-slate-500">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-slate-400 hover:text-slate-900 underline decoration-red-500/30 underline-offset-4 transition-colors duration-300"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="text-xs tracking-tight text-slate-500">
          © {new Date().getFullYear()} FluentFox. Learn Japanese Naturally.
        </div>
      </div>
    </footer>
  )
}
