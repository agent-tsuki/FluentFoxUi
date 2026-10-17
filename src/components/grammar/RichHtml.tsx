import { createElement, memo, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { InteractiveWord } from '@/components/ui/InteractiveWord'
import { IW_FALLBACK_ATTR, IW_PLACEHOLDER_ATTR } from '@/utils/richHtmlAttrs'

/**
 * RichHtml — renders parser-generated grammar HTML and hydrates the interactive-word
 * placeholders inside it (`<span data-iw data-kanji … >`) with real `<InteractiveWord />`
 * components via portals, so words keep their tap/hover reveal and follow `showAll`.
 *
 * The HTML must come from `@/utils/mdxParser` (first-party MDX; placeholder attributes
 * are escaped there). Each placeholder carries a plain-text fallback that is hidden
 * once the component mounts — before paint, so there is no flash or duplicate text.
 */
interface RichHtmlProps {
  html: string
  showAll?: boolean
  as?: 'div' | 'p' | 'span'
  className?: string
}

interface WordMount {
  el: HTMLElement
  kanji: string
  reading: string
  meaning: string
}

export const RichHtml = memo(function RichHtml({ html, showAll = false, as = 'div', className }: RichHtmlProps) {
  const ref = useRef<HTMLElement>(null)
  const [mounts, setMounts] = useState<WordMount[]>([])

  // Re-scan whenever the HTML string changes (React only rewrites innerHTML then).
  useLayoutEffect(() => {
    const root = ref.current
    if (!root) return
    const found: WordMount[] = []
    root.querySelectorAll<HTMLElement>(`[${IW_PLACEHOLDER_ATTR}]`).forEach((el) => {
      const { kanji = '', reading = '', meaning = '' } = el.dataset
      if (!kanji) return
      // Hide (don't remove) the fallback: removing nodes could clobber portal content.
      el.querySelector(`:scope > [${IW_FALLBACK_ATTR}]`)?.setAttribute('hidden', '')
      found.push({ el, kanji, reading, meaning })
    })
    setMounts(found)
  }, [html])

  return (
    <>
      {createElement(as, { ref, className, dangerouslySetInnerHTML: { __html: html } })}
      {mounts.map((m, i) =>
        createPortal(
          <InteractiveWord kanji={m.kanji} reading={m.reading} meaning={m.meaning} showAll={showAll} />,
          m.el,
          `iw-${i}`,
        ),
      )}
    </>
  )
})
