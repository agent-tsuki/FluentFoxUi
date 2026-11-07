import { useEffect } from 'react'

/** Sets the tab title for a dashboard section. */
export function useDashboardTitle(section: string) {
  useEffect(() => {
    document.title = `${section} · Dashboard · FoxSensei`
  }, [section])
}
