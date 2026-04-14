import { Link } from 'react-router-dom'
import { mockFooterLinks } from '@/api/mock/navigation'

// Internal routes that should use <Link> for SPA navigation
const INTERNAL_PREFIXES = ['/about', '/privacy', '/terms', '/support', '/']

function isInternal(href: string) {
  return INTERNAL_PREFIXES.some((prefix) => href.startsWith(prefix))
}

export function Footer() {
  return (
    <footer className="bg-surface-container-low w-full py-12 px-8 border-t border-outline-variant/20">
      <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto gap-8">
        <div className="text-lg font-bold text-on-surface font-headline tracking-tighter">
          FoxSensei
        </div>

        <div className="flex gap-8 flex-wrap justify-center text-xs tracking-tight text-on-surface-variant">
          {mockFooterLinks.map((link) =>
            isInternal(link.href) ? (
              <Link
                key={link.href}
                to={link.href}
                className="hover:text-on-surface underline decoration-primary/30 underline-offset-4 transition-colors duration-200"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-on-surface underline decoration-primary/30 underline-offset-4 transition-colors duration-200"
              >
                {link.label}
              </a>
            )
          )}
        </div>

        <div className="text-xs tracking-tight text-on-surface-variant">
          © {new Date().getFullYear()} FoxSensei. Learn Japanese Naturally.
        </div>
      </div>
    </footer>
  )
}
