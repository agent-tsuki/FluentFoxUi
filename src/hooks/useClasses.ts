import { useRef } from 'react'
import { classesQuery, classesService, peekClasses } from '@/api/services/classesService'
import { useAsync, type AsyncState } from '@/hooks/useAsync'
import type { ClassesFilters, ClassesList, ClassesMeta } from '@/types/classes'

export interface ClassesState extends AsyncState<ClassesList> {
  /**
   * Level availability + stats from the latest successful response. Kept while
   * a new filter loads, so the level tabs and hero stats never blink.
   */
  meta: ClassesMeta | undefined
}

/** The public course list for the given filters (`GET /classes`). */
export function useClasses(filters: ClassesFilters): ClassesState {
  const state = useAsync(
    `classes${classesQuery(filters)}`,
    () => classesService.listClasses(filters),
    () => peekClasses(filters),
  )
  const lastMeta = useRef<ClassesMeta | undefined>(undefined)
  // Assigning during render is safe here: it only ever caches the value being rendered.
  if (state.data) lastMeta.current = state.data.meta
  return { ...state, meta: state.data?.meta ?? lastMeta.current }
}
