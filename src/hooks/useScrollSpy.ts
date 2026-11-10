import { useEffect, useState } from 'react'

/**
 * The id of the section currently in view. A section becomes current once its
 * top passes the band just under the sticky bars (`topOffset` px from the top).
 * Pass a stable array of ids (memoize it).
 */
export function useScrollSpy(ids: readonly string[], topOffset = 140): string | undefined {
  const [active, setActive] = useState<string | undefined>(ids[0])

  useEffect(() => {
    const sections = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null)
    if (sections.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: `-${topOffset}px 0px -55% 0px` },
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [ids, topOffset])

  return active
}
