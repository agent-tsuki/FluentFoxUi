import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { TextButton } from '@/components/ui/TextLink'
import { TestsSection } from '@/components/kanaCourse/TestsSection'
import { getAudioInfo } from '@/lib/audio/audioInfo'
import { downloadPack, packStatus, removePack, type PackProgress } from '@/lib/audio/audioPack'
import { clipStorageSupported } from '@/lib/audio/clipCache'

interface AudioPackCardProps {
  /** Everything the course speaks (see kanaPackTexts). */
  texts: readonly string[]
  /** e.g. "Hiragana" */
  courseLabel: string
  /** The titled page section around the card; rendered only when audio is available. */
  section: { id: string; title: string; description: string }
}

type State =
  | { kind: 'loading' }
  | { kind: 'off' }
  | { kind: 'ready'; progress: PackProgress }
  | { kind: 'downloading'; progress: PackProgress }
  | { kind: 'error'; progress: PackProgress }

/** Rough size of one clip, for the "about 2 MB" hint. */
const CLIP_KB = { '.mp3': 6, '.wav': 60 } as Record<string, number>

function sizeLabel(clips: number, ext: string | undefined): string {
  const kb = clips * (CLIP_KB[ext ?? ''] ?? 6)
  return kb < 1000 ? `about ${Math.max(1, Math.round(kb / 100) * 100)} KB` : `about ${(kb / 1000).toFixed(1)} MB`
}

/**
 * AudioPackCard — "Download audio" for a course: saves every recorded clip in
 * the browser so the course's sounds play instantly and offline. Clips that do
 * not exist yet are generated for signed-in learners; guests get what exists.
 * Hidden when recorded audio or browser storage is not available.
 */
export function AudioPackCard({ texts, courseLabel, section }: AudioPackCardProps) {
  const { user } = useAuth()
  const canGenerate = Boolean(user?.emailVerified)
  const [state, setState] = useState<State>({ kind: 'loading' })
  const [ext, setExt] = useState<string>()
  const [credit, setCredit] = useState<string>()
  const abort = useRef<AbortController | null>(null)

  const refresh = useCallback(async () => {
    const info = await getAudioInfo()
    if (!info.enabled || !clipStorageSupported()) return setState({ kind: 'off' })
    setExt(info.ext)
    setCredit(info.credit)
    const progress = await packStatus(texts)
    setState(progress ? { kind: 'ready', progress } : { kind: 'off' })
  }, [texts])

  useEffect(() => {
    void refresh()
    return () => abort.current?.abort()
  }, [refresh])

  const download = async () => {
    const controller = new AbortController()
    abort.current = controller
    const start = state.kind === 'loading' || state.kind === 'off' ? { saved: 0, total: 0 } : state.progress
    setState({ kind: 'downloading', progress: start })
    try {
      const result = await downloadPack(texts, {
        canGenerate,
        signal: controller.signal,
        onProgress: (progress) => setState({ kind: 'downloading', progress }),
      })
      setState({ kind: 'ready', progress: result })
    } catch {
      if (controller.signal.aborted) void refresh()
      else setState({ kind: 'error', progress: start })
    }
  }

  const remove = async () => {
    await removePack(texts)
    void refresh()
  }

  if (state.kind === 'loading' || state.kind === 'off') return null
  const { saved, total } = state.progress
  const complete = total > 0 && saved >= total
  const partial = saved > 0 && !complete

  return (
    <TestsSection id={section.id} title={section.title} description={section.description}>
      <div className="flex flex-col gap-4 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-5 dark:border-outline/60 dark:bg-surface-container-low sm:flex-row sm:items-center sm:p-6">
        <span aria-hidden className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon name={complete ? 'check_circle' : 'headphones'} className="text-2xl" filled={complete} />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <h3 id="audio-pack-title" className="font-headline text-lg font-bold text-on-surface">
            {courseLabel} audio
          </h3>
          {state.kind === 'downloading' ? (
            <>
              <p className="text-sm tabular-nums text-on-surface-variant" aria-live="polite">
                Saving {state.progress.saved} of {state.progress.total || '…'} sounds…
              </p>
              <ProgressBar
                value={state.progress.saved}
                max={state.progress.total}
                label={`${courseLabel} audio download`}
                size="md"
                className="mt-2"
              />
            </>
          ) : complete ? (
            <p className="text-sm text-on-surface-variant">
              Saved on this device: all {total} sounds play instantly, even offline.
            </p>
          ) : (
            <p className="text-sm text-on-surface-variant">
              {partial
                ? `${saved} of ${total} sounds saved. `
                : `Every sound and example word in the course (${total} sounds, ${sizeLabel(total, ext)}), saved for instant, offline playback. `}
              {partial &&
                (canGenerate
                  ? 'The rest are still being prepared; try again in a few minutes.'
                  : 'Sign in to have the rest prepared.')}
              {state.kind === 'error' && (
                <span className="text-error"> The download stopped; check your connection and try again.</span>
              )}
            </p>
          )}
          {credit && <p className="pt-1 text-xs text-on-surface-variant">Voice: {credit}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
          {state.kind === 'downloading' ? (
            <TextButton tone="neutral" leadingIcon="close" onClick={() => abort.current?.abort()}>
              Cancel
            </TextButton>
          ) : complete ? (
            <TextButton tone="neutral" leadingIcon="delete_forever" onClick={() => void remove()}>
              Remove
            </TextButton>
          ) : (
            <Button onClick={() => void download()} className="inline-flex items-center gap-2 text-sm">
              <Icon name="download" className="text-lg" />
              {partial || state.kind === 'error' ? 'Download the rest' : 'Download audio'}
            </Button>
          )}
        </div>
      </div>
    </TestsSection>
  )
}
