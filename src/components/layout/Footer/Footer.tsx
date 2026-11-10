import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { mockFooterLinks } from '@/api/mock/navigation'
import { whenPageSettles } from '@/lib/afterPageSettles'
import { getAudioInfo, voiceCredits } from '@/lib/audio/audioInfo'

// Internal routes that should use <Link> for SPA navigation
const INTERNAL_PREFIXES = ['/about', '/privacy', '/terms', '/']

function isInternal(href: string) {
  return INTERNAL_PREFIXES.some((prefix) => href.startsWith(prefix))
}

/**
 * The voices' credit lines (e.g. "VOICEVOX:冥鳴ひまり"), which their licence asks
 * to show wherever the audio is used. Looked up once the page has settled, so
 * the footer adds nothing to the first load.
 */
function useVoiceCredit(): string | undefined {
  const [credit, setCredit] = useState<string>()
  useEffect(() => {
    let cancelled = false
    const stop = whenPageSettles(() => {
      void getAudioInfo().then(
        (info) => !cancelled && setCredit(info.enabled ? voiceCredits(info).join(' · ') || undefined : undefined),
      )
    })
    return () => {
      cancelled = true
      stop()
    }
  }, [])
  return credit
}

export function Footer() {
  const voiceCredit = useVoiceCredit()
  return (
    <footer className="relative z-20 bg-surface-sunken w-full py-12 px-8 border-t border-line">
      <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto gap-8">
        <div className="text-lg font-bold text-ink font-display tracking-tighter">
          FoxSensei
        </div>

        <div className="flex gap-8 flex-wrap justify-center text-xs tracking-tight text-ink-muted">
          {mockFooterLinks.map((link) =>
            isInternal(link.href) ? (
              <Link
                key={link.href}
                to={link.href}
                className="hover:text-ink underline decoration-primary/30 underline-offset-4 transition-colors duration-200"
              >
                {link.label}
              </Link>
            ) : (
              // mailto: (Contact) opens the mail client in place; only web links open a new tab.
              <a
                key={link.href}
                href={link.href}
                {...(!link.href.startsWith('mailto:') && { target: '_blank', rel: 'noopener noreferrer' })}
                className="hover:text-ink underline decoration-primary/30 underline-offset-4 transition-colors duration-200"
              >
                {link.label}
              </a>
            )
          )}
        </div>

        <div className="text-center text-xs tracking-tight text-ink-muted md:text-right">
          <p>© {new Date().getFullYear()} FoxSensei. Learn Japanese Naturally.</p>
          {voiceCredit && <p className="mt-1">Japanese voice: {voiceCredit}</p>}
        </div>
      </div>
    </footer>
  )
}
