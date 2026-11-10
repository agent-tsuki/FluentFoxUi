import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusMessage } from '@/components/ui/StatusMessage'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { FormField, TextInput } from '@/components/ui/FormField'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminForbidden } from '@/components/admin/AdminForbidden'
import { VoiceRow } from '@/components/admin/audio/VoiceRow'
import { JobList } from '@/components/admin/audio/JobList'
import { useAudioEngine, useAudioJobs, useAudioVoices } from '@/hooks/admin/useAudioAdmin'
import { useAdminAction } from '@/hooks/admin/useAdminAction'
import { usePermissions } from '@/hooks/admin/usePermissions'
import { audioAdminService } from '@/api/services/audioAdminService'
import { resolveErrorMessage } from '@/api/errors'
import { findStyle, isActiveJob, voiceKeyLabel } from '@/lib/admin/audio'

/** How often the job list refreshes while a job is queued or running. */
const JOB_POLL_MS = 3000
const DEFAULT_SAMPLE = 'はじめまして。よろしく おねがいします。'
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * /admin/audio (super-admins only): the voice behind each key, how much of
 * its audio exists, and the audio worker's jobs. Choosing another style makes
 * that key's clips afresh: until they exist, learners see "not ready yet".
 */
export function AudioPage() {
  const { permissions } = usePermissions()
  const voices = useAudioVoices()
  const engine = useAudioEngine()
  const jobs = useAudioJobs()
  const action = useAdminAction()
  const { run } = action
  const [sample, setSample] = useState(DEFAULT_SAMPLE)
  const [model, setModel] = useState('')
  const sampleId = useId()
  const modelId = useId()
  const player = useRef<HTMLAudioElement | null>(null)

  const anyActive = (jobs.data ?? []).some(isActiveJob)
  const { refetch: refetchJobs } = jobs
  const { refetch: refetchVoices } = voices

  // Follow running jobs; refresh the coverage once they finish.
  const wasActive = useRef(false)
  useEffect(() => {
    if (wasActive.current && !anyActive) refetchVoices()
    wasActive.current = anyActive
    if (!anyActive) return
    const timer = window.setInterval(refetchJobs, JOB_POLL_MS)
    return () => window.clearInterval(timer)
  }, [anyActive, refetchJobs, refetchVoices])

  useEffect(() => () => player.current?.pause(), [])

  const speakers = engine.data?.speakers ?? []

  const onPreview = useCallback(
    async (styleId: number) => {
      const text = sample.trim() || DEFAULT_SAMPLE
      const result = await run(`preview:${styleId}`, () => audioAdminService.preview(styleId, text))
      if (!result.ok) return
      player.current?.pause()
      player.current = new Audio(result.value)
      void player.current.play().catch(() => undefined)
    },
    [run, sample],
  )

  const onSave = useCallback(
    async (key: string, styleId: number) => {
      const found = findStyle(speakers, styleId)
      const name = found ? `${found.speaker.name} · ${found.style}` : `style ${styleId}`
      if (!window.confirm(`Use ${name} for ${voiceKeyLabel(key)} (${key})? Its clips are made afresh; until they are, learners see "not ready yet" for its lines.`)) return
      const result = await run(`save:${key}`, () => audioAdminService.setVoice(key, styleId), `${key} now speaks with ${name}. Generate its clips next.`)
      if (result.ok) refetchVoices()
    },
    [run, speakers, refetchVoices],
  )

  const queue = useCallback(
    async (busyKey: string, job: Parameters<typeof audioAdminService.createJob>[0], notice: string) => {
      const result = await run(busyKey, () => audioAdminService.createJob(job), notice)
      if (result.ok) refetchJobs()
    },
    [run, refetchJobs],
  )

  const onGenerate = useCallback((key: string) => queue(`generate:${key}`, { kind: 'generate', voiceKey: key }, `Queued: generate ${key}'s missing clips.`), [queue])

  const onCancel = useCallback(
    async (job: { id: string }) => {
      const result = await run(`cancel:${job.id}`, () => audioAdminService.cancelJob(job.id), 'Job cancelled.')
      if (result.ok) refetchJobs()
    },
    [run, refetchJobs],
  )

  const installModel = (e: FormEvent) => {
    e.preventDefault()
    const id = model.trim()
    if (!UUID.test(id)) return
    void queue('install', { kind: 'install_model', modelUuid: id }, 'Queued: the worker will install the model (a few minutes). Its voices then appear in the lists.')
    setModel('')
  }

  if (!permissions?.isSuperAdmin) return <AdminForbidden message="Only super-admins can manage the voices." />

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Audio"
        description="Choose the voice for each key, hear a voice before choosing it, and have the audio worker make the clips."
        actions={
          <Button
            className="flex min-h-11 items-center gap-2 !px-4 !py-2 text-sm"
            disabled={action.busy === 'generate:all'}
            onClick={() => void queue('generate:all', { kind: 'generate' }, "Queued: generate every voice's missing clips.")}
          >
            <Icon name="volume_up" className="text-lg" />
            Generate all missing
          </Button>
        }
      />
      <div aria-live="polite">
        <StatusMessage tone="error" message={action.error} />
        <StatusMessage tone="success" message={action.notice} />
      </div>

      <AdminPanel title="Voice engine">
        {engine.isLoading ? (
          <LoadingState label="Checking the engine…" />
        ) : engine.error ? (
          <ErrorState message={resolveErrorMessage(engine.error)} onRetry={engine.refetch} className="py-8" />
        ) : !engine.data?.configured ? (
          <StatusMessage tone="error" message="No voice engine is set up (VOICEVOX_URL is empty), so no new clips can be made." />
        ) : !engine.data.reachable ? (
          <StatusMessage tone="error" message="The voice engine is not answering. Voices can't be previewed or changed until it is back." />
        ) : (
          <p className="text-sm text-ink-muted">
            <span className="font-semibold text-ink">{engine.data.engine}</span> {engine.data.version} · {speakers.length} voices installed
          </p>
        )}
        <FormField label="Sample text for previews" htmlFor={sampleId} hint="Previews are spoken on the spot and not saved. The engine takes a few seconds per sentence, so keep it short.">
          <TextInput id={sampleId} lang="ja" maxLength={120} value={sample} onChange={(e) => setSample(e.target.value)} />
        </FormField>
      </AdminPanel>

      <AdminPanel title="Voices">
        {voices.isLoading ? (
          <LoadingState label="Loading voices…" />
        ) : voices.error ? (
          <ErrorState message={resolveErrorMessage(voices.error)} onRetry={refetchVoices} className="py-8" />
        ) : !voices.data?.length ? (
          <EmptyState icon="headphones" title="No voices yet" description="Voices appear once the course has spoken content." className="py-8" />
        ) : (
          <ul className="divide-y divide-line">
            {voices.data.map((v) => (
              <VoiceRow key={`${v.key}:${v.styleId ?? ''}`} voice={v} speakers={speakers} busy={action.busy} onPreview={onPreview} onSave={onSave} onGenerate={onGenerate} />
            ))}
          </ul>
        )}
      </AdminPanel>

      <AdminPanel title="Worker jobs">
        {jobs.isLoading ? (
          <LoadingState label="Loading jobs…" />
        ) : jobs.error ? (
          <ErrorState message={resolveErrorMessage(jobs.error)} onRetry={refetchJobs} className="py-8" />
        ) : !jobs.data?.length ? (
          <EmptyState icon="schedule" title="No jobs yet" description="Generate or install jobs appear here with their progress." className="py-8" />
        ) : (
          <JobList jobs={jobs.data} busy={action.busy} onCancel={onCancel} />
        )}
        <form onSubmit={installModel} className="flex flex-wrap items-end gap-2 border-t border-line pt-4">
          <FormField label="Install an AivisHub model" htmlFor={modelId} hint="The model's UUID from hub.aivis-project.com. Check its licence allows commercial use." className="min-w-0 flex-1 basis-72">
            <TextInput id={modelId} value={model} placeholder="e.g. a59cb814-0083-4369-8542-f51a29e72af7" onChange={(e) => setModel(e.target.value)} />
          </FormField>
          <Button type="submit" variant="outline" className="min-h-11 !px-4 !py-2 text-sm" disabled={!UUID.test(model.trim()) || action.busy === 'install'}>
            Install
          </Button>
        </form>
      </AdminPanel>
    </div>
  )
}
