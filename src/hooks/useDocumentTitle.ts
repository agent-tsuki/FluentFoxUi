import { useEffect } from 'react'

/** Sets `document.title` while the page is shown (titles live in src/lib/seo/titles). */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title
  }, [title])
}
