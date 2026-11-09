/** Data hooks for the super-admin Audio page (loading + error + refetch, as every admin screen). */
import { useRef } from 'react'
import { audioAdminService } from '@/api/services/audioAdminService'
import { useAsync, type AsyncState } from '@/hooks/useAsync'

/**
 * useAsync that keeps showing the last result while it reloads, so the page
 * can poll (the job list every few seconds) without flashing a loading state
 * or briefly reading "no data" between polls.
 */
function useKeptAsync<T>(key: string, load: () => Promise<T>): AsyncState<T> {
  const state = useAsync(key, load)
  const last = useRef<T | undefined>(undefined)
  if (state.data !== undefined) last.current = state.data
  if (state.error) last.current = undefined
  const data = state.data ?? last.current
  return { ...state, data, isLoading: state.isLoading && data === undefined }
}

export const useAudioVoices = () => useKeptAsync('admin-audio-voices', () => audioAdminService.listVoices())

export const useAudioEngine = () => useAsync('admin-audio-engine', () => audioAdminService.getEngine())

export const useAudioJobs = () => useKeptAsync('admin-audio-jobs', () => audioAdminService.listJobs())
