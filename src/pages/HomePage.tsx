import { ConceptHome } from '@/components/sections/HomePage/ConceptHome'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { HOME_TITLE } from '@/lib/seo/titles'

export function HomePage() {
  useDocumentTitle(HOME_TITLE)
  return <ConceptHome />
}
